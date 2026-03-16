import io
import json
import os
import re
import uuid
from dataclasses import dataclass
from typing import List, Tuple, Dict, Any

import fitz  # PyMuPDF
from flask import request, jsonify, send_file

from route.firebase import get_storage_bucket

try:
    from google.cloud import vision
    VISION_AVAILABLE = True
except Exception:
    VISION_AVAILABLE = False

JOB_BASE_DIR = os.path.join("/tmp", "uniguide-redaction-jobs")
os.makedirs(JOB_BASE_DIR, exist_ok=True)

LABELS = ["주소", "학번","계좌번호", "생년월일", "연락처", "이메일", "주민번호"]
DELIMITERS = {"|", ",", ";"}

REGEX_PATTERNS = {
    "PHONE": re.compile(r"\b01[0-9][-\s]?[0-9]{3,4}[-\s]?[0-9]{4}\b"),
    "EMAIL": re.compile(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}"),
    "RRN": re.compile(r"\b\d{6}-?\d{7}\b"),
    "BIRTH_DATE": re.compile(r"\b(?:19|20)\d{2}[./-](?:0?[1-9]|1[0-2])[./-](?:0?[1-9]|[12]\d|3[01])\b"),
}

LABEL_VALUE_REGEX = {
    "생년월일": re.compile(r"\b(?:19|20)\d{2}[./-](?:0?[1-9]|1[0-2])[./-](?:0?[1-9]|[12]\d|3[01])\b"),
    "주민번호": re.compile(r"\b\d{6}-?\d{7}\b"),
    "연락처": re.compile(r"\b01[0-9][-\s]?[0-9]{3,4}[-\s]?[0-9]{4}\b"),
    "이메일": re.compile(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}"),
}

@dataclass
class TokenBox:
    page_index: int
    text: str
    bbox: Tuple[float, float, float, float]


def save_original(job_id: str, file_bytes: bytes) -> str:
    job_dir = os.path.join(JOB_BASE_DIR, job_id)
    os.makedirs(job_dir, exist_ok=True)
    original_path = os.path.join(job_dir, "original.pdf")
    with open(original_path, "wb") as f:
        f.write(file_bytes)
    return original_path
def extract_tokens_text(doc: fitz.Document) -> List[TokenBox]:
    tokens: List[TokenBox] = []
    for page_idx in range(len(doc)):
        page = doc[page_idx]
        words = page.get_text("words")
        for w in words:
            x0, y0, x1, y1, text = w[:5]
            clean = (text or "").strip()
            if clean:
                tokens.append(TokenBox(page_index=page_idx, text=clean, bbox=(x0, y0, x1, y1)))
    return tokens
def extract_tokens_vision(doc: fitz.Document) -> List[TokenBox]:
    if not VISION_AVAILABLE:
        return []
    try:
        client = vision.ImageAnnotatorClient()
        tokens: List[TokenBox] = []
        for page_idx in range(len(doc)):
            page = doc[page_idx]
            mat = fitz.Matrix(200 / 72, 200 / 72)
            pix = page.get_pixmap(matrix=mat, alpha=False)
            image = vision.Image(content=pix.tobytes("png"))
            response = client.document_text_detection(image=image)
            if response.error.message:
                continue
            ann = response.full_text_annotation
            if not ann.pages:
                continue
            pdf_w = page.rect.width
            pdf_h = page.rect.height
            img_w = float(pix.width)
            img_h = float(pix.height)
            for vpage in ann.pages:
                for block in vpage.blocks:
                    for para in block.paragraphs:
                        for word in para.words:
                            text = "".join([s.text for s in word.symbols]).strip()
                            if not text:
                                continue
                            vertices = word.bounding_box.vertices
                            xs = [float(v.x) * pdf_w / img_w for v in vertices]
                            ys = [float(v.y) * pdf_h / img_h for v in vertices]
                            x0, y0, x1, y1 = min(xs), min(ys), max(xs), max(ys)
                            tokens.append(TokenBox(page_index=page_idx, text=text, bbox=(x0, y0, x1, y1)))
        return tokens
    except Exception:
        return []
def preview_redaction():
    try:
        if "file" not in request.files:
            return jsonify({"error": "file is required"}), 400
        file = request.files["file"]
        job_id = request.form.get("jobId") or str(uuid.uuid4())
        file_bytes = file.read()
        save_original(job_id, file_bytes)
        doc = fitz.open(stream=file_bytes, filetype="pdf")
        pipeline_type, tokens = choose_pipeline(doc)
        detected_boxes = detect_boxes(tokens)
        doc_for_preview = fitz.open(stream=file_bytes, filetype="pdf")
        preview_images = render_preview_images(doc_for_preview, job_id, detected_boxes)
        return jsonify({
            "jobId": job_id,
            "status": "REVIEW_REQUIRED",
            "pipelineType": pipeline_type,
            "detectedBoxes": detected_boxes,
            "previewImages": preview_images,
        }), 200
    except Exception as e:
        return jsonify({"error": str(e), "status": "FAILED"}), 500
def choose_pipeline(doc: fitz.Document) -> Tuple[str, List[TokenBox]]:
    text_tokens = extract_tokens_text(doc)
    if len(text_tokens) >= 20:
        return "TEXT", text_tokens
    vision_tokens = extract_tokens_vision(doc)
    if vision_tokens:
        return "VISION", vision_tokens
    return "TEXT", text_tokens
def group_lines(tokens: List[TokenBox]) -> Dict[int, List[List[TokenBox]]]:
    pages: Dict[int, List[TokenBox]] = {}
    for t in tokens:
        pages.setdefault(t.page_index, []).append(t)
    grouped: Dict[int, List[List[TokenBox]]] = {}
    for page_idx, page_tokens in pages.items():
        page_tokens.sort(key=lambda t: ((t.bbox[1] + t.bbox[3]) / 2.0, t.bbox[0]))
        lines: List[List[TokenBox]] = []
        for tok in page_tokens:
            cy = (tok.bbox[1] + tok.bbox[3]) / 2.0
            placed = False
            for line in lines:
                lcy = sum((t.bbox[1] + t.bbox[3]) / 2.0 for t in line) / len(line)
                if abs(cy - lcy) <= 8:
                    line.append(tok)
                    placed = True
                    break
            if not placed:
                lines.append([tok])
        for line in lines:
            line.sort(key=lambda t: t.bbox[0])
        grouped[page_idx] = lines
    return grouped


def line_text_with_spans(line: List[TokenBox]) -> Tuple[str, List[Tuple[int, int, int]]]:
    text_parts: List[str] = []
    spans: List[Tuple[int, int, int]] = []  # (token_index, start, end)
    cursor = 0
    for idx, tok in enumerate(line):
        if idx > 0:
            text_parts.append(" ")
            cursor += 1
        start = cursor
        text_parts.append(tok.text)
        cursor += len(tok.text)
        end = cursor
        spans.append((idx, start, end))
    return "".join(text_parts), spans


def merge_bbox(tokens: List[TokenBox]) -> List[float]:
    x0 = min(t.bbox[0] for t in tokens)
    y0 = min(t.bbox[1] for t in tokens)
    x1 = max(t.bbox[2] for t in tokens)
    y1 = max(t.bbox[3] for t in tokens)
    return [x0, y0, x1, y1]


def match_tokens_by_range(line: List[TokenBox], spans: List[Tuple[int, int, int]], m_start: int, m_end: int) -> List[TokenBox]:
    matched = []
    for token_idx, start, end in spans:
        if end <= m_start or start >= m_end:
            continue
        matched.append(line[token_idx])
    return matched


def find_value_end(line: List[TokenBox], spans: List[Tuple[int, int, int]], value_start: int) -> int:
    value_end = spans[-1][2] if spans else value_start
    for token_idx, start, end in spans:
        if end <= value_start:
            continue
        tok = line[token_idx]
        txt = tok.text.strip()
        norm = txt.rstrip(":：")
        if txt in DELIMITERS:
            return start
        if norm in LABELS:
            return start
    return value_end


def detect_boxes(tokens: List[TokenBox]) -> List[Dict[str, Any]]:
    detected: List[Dict[str, Any]] = []
    grouped = group_lines(tokens)

    for page_idx, lines in grouped.items():
        for line in lines:
            line_text, spans = line_text_with_spans(line)
            # Label-based detection only: redact values after explicit labels
            for label in LABELS:
                label_pattern = re.compile(rf"{re.escape(label)}\s*[:：]?")
                for m in label_pattern.finditer(line_text):
                    value_start = m.end()
                    value_end = find_value_end(line, spans, value_start)
                    if value_end <= value_start:
                        continue

                    value_tokens = match_tokens_by_range(line, spans, value_start, value_end)
                    if not value_tokens:
                        continue

                    # Regex constraints for specific labels
                    if label in LABEL_VALUE_REGEX:
                        value_text = line_text[value_start:value_end]
                        for matched in LABEL_VALUE_REGEX[label].finditer(value_text):
                            abs_start = value_start + matched.start()
                            abs_end = value_start + matched.end()
                            matched_tokens = match_tokens_by_range(line, spans, abs_start, abs_end)
                            if matched_tokens:
                                detected.append({
                                    "pageIndex": page_idx,
                                    "bbox": merge_bbox(matched_tokens),
                                    "reason": f"LABEL_{label}",
                                    "selected": True,
                                })
                    else:
                        detected.append({
                            "pageIndex": page_idx,
                            "bbox": merge_bbox(value_tokens),
                            "reason": f"LABEL_{label}",
                            "selected": True,
                        })

    # de-duplicate
    unique = {}
    for box in detected:
        key = (
            box["pageIndex"],
            round(box["bbox"][0], 1),
            round(box["bbox"][1], 1),
            round(box["bbox"][2], 1),
            round(box["bbox"][3], 1),
            box["reason"],
        )
        unique[key] = box

    return list(unique.values())


def upload_preview_image(job_id: str, page_index: int, image_bytes: bytes) -> str:
    bucket, bucket_name, error = get_storage_bucket()
    if error:
        raise RuntimeError(error)

    firebase_file_path = f"firebase/redaction-preview/{job_id}/page_{page_index + 1}.png"
    blob = bucket.blob(firebase_file_path)
    blob.upload_from_file(io.BytesIO(image_bytes), content_type="image/png")
    blob.make_public()
    return f"https://firebasestorage.googleapis.com/v0/b/{bucket_name}/o/{firebase_file_path.replace('/', '%2F')}?alt=media"


def render_preview_images(doc: fitz.Document, job_id: str, detected_boxes: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    previews = []
    boxes_by_page: Dict[int, List[List[float]]] = {}
    for box in detected_boxes:
        if not box.get("selected",True):
            continue
        boxes_by_page.setdefault(int(box.get("pageIndex", 0)), []).append(box.get("bbox", []))

    for page_idx in range(len(doc)):
        page = doc[page_idx]
        for bbox in boxes_by_page.get(page_idx, []):
            if isinstance(bbox, list) and len(bbox) == 4:
                rect = fitz.Rect(float(bbox[0]), float(bbox[1]), float(bbox[2]), float(bbox[3]))
                page.draw_rect(rect, color=(1, 0, 0), width=1.2)

        pix = page.get_pixmap(matrix=fitz.Matrix(1.5, 1.5), alpha=False)
        image_bytes = pix.tobytes("png")
        image_url = upload_preview_image(job_id, page_idx, image_bytes)
        previews.append({
            "pageIndex": page_idx,
            "imageUrl": image_url,
        })
    return previews





def apply_redaction():
    try:
        job_id = request.form.get("jobId", "").strip()
        boxes_raw = request.form.get("boxes", "[]")
        try:
            boxes = json.loads(boxes_raw)
        except json.JSONDecodeError:
            return jsonify({"error": "invalid boxes json"}), 400

        file_bytes = None
        if job_id:
            original_path = os.path.join(JOB_BASE_DIR, job_id, "original.pdf")
            if os.path.exists(original_path):
                with open(original_path, "rb") as f:
                    file_bytes = f.read()

        # backward compatibility: allow direct file upload if jobId/original file is missing
        if file_bytes is None:
            if "file" not in request.files:
                return jsonify({"error": "file is required when jobId original is missing"}), 400
            file = request.files["file"]
            file_bytes = file.read()

        doc = fitz.open(stream=file_bytes, filetype="pdf")

        for box in boxes:
            if box.get("selected") is False:
                continue
            page_index = int(box.get("pageIndex", 0))
            bbox = box.get("bbox")
            if not isinstance(bbox, list) or len(bbox) != 4:
                continue
            if page_index < 0 or page_index >= len(doc):
                continue

            page = doc[page_index]
            rect = fitz.Rect(float(bbox[0]), float(bbox[1]), float(bbox[2]), float(bbox[3]))
            page.add_redact_annot(rect, fill=(0, 0, 0))

        for page in doc:
            page.apply_redactions()

        out = doc.tobytes(garbage=4, deflate=True)
        return send_file(
            io.BytesIO(out),
            mimetype="application/pdf",
            as_attachment=False,
            download_name="masked.pdf",
        )
    except Exception as e:
        return jsonify({"error": str(e), "status": "FAILED"}), 500
