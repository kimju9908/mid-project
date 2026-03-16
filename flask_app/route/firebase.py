import json
import mimetypes
import os
import uuid

from flask import jsonify, request
from google.cloud import storage
from werkzeug.utils import secure_filename

# 로컬에서 Firebase로 파일을 업로드할 폴더 지정 (legacy migration default prefix)
firebase_folder = "firebase"


def resolve_project_id(credentials_path: str, client_project: str) -> str:
    if os.getenv("FIREBASE_PROJECT_ID"):
        return os.getenv("FIREBASE_PROJECT_ID")
    if os.getenv("GOOGLE_CLOUD_PROJECT"):
        return os.getenv("GOOGLE_CLOUD_PROJECT")
    if client_project:
        return client_project

    if credentials_path and os.path.exists(credentials_path):
        try:
            with open(credentials_path, "r", encoding="utf-8") as f:
                data = json.load(f)
            return data.get("project_id", "")
        except Exception:
            return ""
    return ""


def resolve_bucket_name(project_id: str) -> str:
    if os.getenv("FIREBASE_STORAGE_BUCKET"):
        return os.getenv("FIREBASE_STORAGE_BUCKET")
    if project_id:
        return f"{project_id}.appspot.com"
    return ""


def get_storage_resources():
    # GOOGLE_APPLICATION_CREDENTIALS는 있으면 사용, 없어도 ADC 시도
    credentials_path = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
    if credentials_path and not os.path.exists(credentials_path):
        return None, "", "GOOGLE_APPLICATION_CREDENTIALS points to a non-existent file."

    try:
        client = storage.Client()
    except Exception as e:
        return None, "", f"Failed to create Google Storage client: {e}"

    project_id = resolve_project_id(credentials_path, client.project)
    bucket_name = resolve_bucket_name(project_id)
    if not bucket_name:
        return None, "", "Bucket name is missing. Set FIREBASE_STORAGE_BUCKET or project id environment variable."

    try:
        bucket = client.bucket(bucket_name)
    except Exception as e:
        return None, bucket_name, f"Failed to access bucket '{bucket_name}': {e}"

    return bucket, bucket_name, ""


def sanitize_folder_path(raw_folder_path: str):
    if raw_folder_path is None:
        return None, "folderPath is required"

    normalized = raw_folder_path.strip().replace("\\", "/").strip("/")
    if not normalized:
        return None, "folderPath is empty"

    safe_parts = []
    for part in normalized.split("/"):
        if part in ("", ".", ".."):
            return None, "folderPath contains invalid path segments"
        safe = secure_filename(part)
        if not safe:
            return None, "folderPath contains invalid characters"
        safe_parts.append(safe)

    return "/".join(safe_parts), ""


def safe_file_name(uploaded_name: str, preferred_name: str):
    candidate = preferred_name.strip() if preferred_name else uploaded_name
    safe = secure_filename(candidate or "")
    if not safe:
        ext = ""
        if uploaded_name and "." in uploaded_name:
            ext = "." + uploaded_name.rsplit(".", 1)[-1]
        safe = f"upload_{uuid.uuid4().hex}{ext}"
    return safe


def get_storage_bucket():
    return get_storage_resources()


def upload_firebase():

    try:
        if os.getenv("ENABLE_BULK_FIREBASE_UPLOAD", "false").lower() != "true":
            return jsonify({"error": "Bulk upload endpoint is disabled."}), 403

        local_folder = os.getenv("FIREBASE_LOCAL_UPLOAD_DIR")
        if not local_folder:
            return jsonify({"error": "FIREBASE_LOCAL_UPLOAD_DIR is required."}), 400

        abs_local_folder = os.path.abspath(local_folder)
        if not os.path.isdir(abs_local_folder):
            return jsonify({"error": "FIREBASE_LOCAL_UPLOAD_DIR does not exist or is not a directory."}), 400

        bucket, bucket_name_unused, error = get_storage_resources()
        if error:
            return jsonify({"error": error}), 500

        uploaded_files = []

        # 로컬 폴더 내의 파일들을 순회
        for root, dirs, files in os.walk(abs_local_folder):
            for file_name in files:
                # 로컬 파일 경로
                local_file_path = os.path.join(root, file_name)

                # Firebase에 업로드할 파일 경로 (디렉토리 경로 포함)
                relative_path = os.path.relpath(local_file_path, abs_local_folder)

                # Firebase에서 사용할 경로 구분자로 백슬래시를 슬래시로 변경
                firebase_file_path = os.path.join(firebase_folder, relative_path).replace("\\", "/")

                # 업로드할 파일 Blob 생성
                blob = bucket.blob(firebase_file_path)

                # 파일을 Firebase Storage에 업로드
                blob.upload_from_filename(local_file_path)
                uploaded_files.append(blob.public_url)

        if uploaded_files:
            return jsonify({"message": "Files uploaded successfully", "urls": uploaded_files}), 200
        return jsonify({"message": "No files to upload"}), 400

    except Exception as e:
        return jsonify({"error": str(e)}), 500


def upload_file():
    try:
        bucket, bucket_name, error = get_storage_resources()
        if error:
            return jsonify({"error": error}), 500

        if "file" not in request.files:
            return jsonify({"error": "file is required"}), 400

        file = request.files["file"]
        folder_path_raw = request.form.get("folderPath", "")
        file_name_raw = request.form.get("fileName", "")

        safe_folder_path, folder_error = sanitize_folder_path(folder_path_raw)
        if folder_error:
            return jsonify({"error": folder_error}), 400

        safe_name = safe_file_name(file.filename, file_name_raw)
        file.filename = safe_name

        # Firebase Storage 경로 설정
        firebase_file_path = f"{safe_folder_path}/{safe_name}".replace("\\", "/")

        # Firebase Storage에 업로드할 Blob 생성
        blob = bucket.blob(firebase_file_path)

        # MIME 타입 자동 감지 후 설정
        content_type = mimetypes.guess_type(safe_name)[0] or "application/octet-stream"
        blob.upload_from_file(file, content_type=content_type)

        # Content-Disposition 설정
        blob.content_disposition = "attachment"
        blob.patch()
        blob.make_public()

        # 웹에서 바로 보이는 URL
        display_url = (
            f"https://firebasestorage.googleapis.com/v0/b/{bucket_name}/o/"
            f"{firebase_file_path.replace('/', '%2F')}?alt=media"
        )
        return jsonify({
            "message": "File uploaded successfully",
            "url": display_url,
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
