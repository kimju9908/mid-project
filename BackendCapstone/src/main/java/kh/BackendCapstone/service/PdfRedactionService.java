package kh.BackendCapstone.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import kh.BackendCapstone.constant.RedactionJobStatus;
import kh.BackendCapstone.dto.redaction.PreviewImageDto;
import kh.BackendCapstone.dto.redaction.RedactionBoxDto;
import kh.BackendCapstone.dto.request.RedactionApplyReqDto;
import kh.BackendCapstone.dto.response.RedactionApplyResDto;
import kh.BackendCapstone.dto.response.RedactionJobResDto;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
@Slf4j
public class PdfRedactionService {
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    private final FirebaseUploadService firebaseUploadService;

    @Value("${app.flask.base-url:http://localhost:5000}")
    private String flaskBaseUrl;

    private final Map<String, RedactionJob> jobs = new ConcurrentHashMap<>();
    private final Path jobBaseDir = Path.of(System.getProperty("java.io.tmpdir"), "uniguide-redaction-jobs");

    public RedactionJobResDto createJob(MultipartFile file) {
        validatePdf(file);
        String jobId = UUID.randomUUID().toString();
        Path jobDir = jobBaseDir.resolve(jobId);
        Path originalPath = jobDir.resolve("original.pdf");

        try {
            Files.createDirectories(jobDir);
            Files.write(originalPath, file.getBytes());
        } catch (IOException e) {
            throw new RuntimeException("원본 파일 저장 중 오류가 발생했습니다.", e);
        }

        RedactionJob job = new RedactionJob(jobId, originalPath);
        jobs.put(jobId, job);
        job.setStatus(RedactionJobStatus.PENDING);
        job.setMessage("업로드 완료. 탐지를 시작합니다.");
        job.touch();

        requestPreviewFromFlask(job, file);
        return toResponse(job);
    }

    public RedactionJobResDto getJob(String jobId) {
        RedactionJob job = getRequiredJob(jobId);
        return toResponse(job);
    }

    public RedactionApplyResDto applyRedaction(String jobId, RedactionApplyReqDto reqDto) {
        RedactionJob job = getRequiredJob(jobId);
        job.setStatus(RedactionJobStatus.PROCESSING);
        job.setMessage("최종 레닥션을 적용하는 중입니다.");
        job.touch();

        try {
            byte[] originalBytes = Files.readAllBytes(job.getOriginalPdfPath());
            String boxesJson = objectMapper.writeValueAsString(reqDto.getBoxes());
            byte[] maskedPdf = requestApplyFromFlask(jobId, originalBytes, boxesJson);

            String fileName = reqDto.getFileName();
            if (fileName == null || fileName.isBlank()) {
                fileName = jobId + "_masked.pdf";
            }
            String uploadedUrl = firebaseUploadService.uploadPermissionMaskedPdf(maskedPdf, fileName);
            job.setMaskedPdfUrl(uploadedUrl);
            job.setStatus(RedactionJobStatus.DONE);
            job.setMessage("레닥션 완료 및 Firebase 업로드 완료");
            job.touch();

            return RedactionApplyResDto.builder()
                    .jobId(jobId)
                    .status(job.getStatus().name())
                    .maskedPdfUrl(uploadedUrl)
                    .message(job.getMessage())
                    .build();
        } catch (Exception e) {
            job.setStatus(RedactionJobStatus.FAILED);
            job.setMessage("레닥션 처리 실패: " + e.getMessage());
            job.touch();
            throw new RuntimeException("최종 레닥션 처리 중 오류가 발생했습니다.", e);
        }
    }

    private void requestPreviewFromFlask(RedactionJob job, MultipartFile file) {
        try {
            byte[] bytes = file.getBytes();
            ByteArrayResource fileResource = new ByteArrayResource(bytes) {
                @Override
                public String getFilename() {
                    return file.getOriginalFilename() == null ? "original.pdf" : file.getOriginalFilename();
                }
            };

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);

            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            body.add("file", fileResource);
            body.add("jobId", job.getJobId());

            HttpEntity<MultiValueMap<String, Object>> entity = new HttpEntity<>(body, headers);
            ResponseEntity<String> response = restTemplate.exchange(
                    flaskBaseUrl + "/spring/redaction/preview",
                    HttpMethod.POST,
                    entity,
                    String.class
            );

            if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
                throw new RuntimeException("Flask preview 응답이 비어있습니다.");
            }

            JsonNode root = objectMapper.readTree(response.getBody());
            List<RedactionBoxDto> boxes = parseBoxes(root.path("detectedBoxes"));
            List<PreviewImageDto> previews = parsePreviews(root.path("previewImages"));

            String pipeline = root.path("pipelineType").asText("");
            if (pipeline.isBlank()) {
                pipeline = "AUTO";
            }

            job.setDetectedBoxes(boxes);
            job.setPreviewImages(previews);
            job.setPipelineType(pipeline);
            job.setStatus(RedactionJobStatus.REVIEW_REQUIRED);
            job.setMessage("자동 탐지 완료. 사용자 검수가 필요합니다.");
            job.touch();
        } catch (Exception e) {
            job.setStatus(RedactionJobStatus.FAILED);
            job.setMessage("미리보기 생성 실패: " + e.getMessage());
            job.touch();
            throw new RuntimeException("Flask 미리보기 파이프라인 호출에 실패했습니다.", e);
        }
    }

    private byte[] requestApplyFromFlask(String jobId, byte[] originalBytes, String boxesJson) {
        ByteArrayResource fileResource = new ByteArrayResource(originalBytes) {
            @Override
            public String getFilename() {
                return "original.pdf";
            }
        };

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);

        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        body.add("file", fileResource);
        body.add("jobId", jobId);
        body.add("boxes", boxesJson);

        HttpEntity<MultiValueMap<String, Object>> entity = new HttpEntity<>(body, headers);
        ResponseEntity<byte[]> response = restTemplate.exchange(
                flaskBaseUrl + "/spring/redaction/apply",
                HttpMethod.POST,
                entity,
                byte[].class
        );

        if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
            throw new RuntimeException("Flask apply 응답이 비어있습니다.");
        }
        return response.getBody();
    }

    private List<RedactionBoxDto> parseBoxes(JsonNode node) {
        List<RedactionBoxDto> boxes = new ArrayList<>();
        if (!node.isArray()) {
            return boxes;
        }
        for (JsonNode item : node) {
            RedactionBoxDto dto = new RedactionBoxDto();
            dto.setPageIndex(item.path("pageIndex").asInt(0));
            dto.setReason(item.path("reason").asText("AUTO_DETECTED"));
            dto.setSelected(item.path("selected").asBoolean(true));

            List<Double> bbox = new ArrayList<>();
            JsonNode bboxNode = item.path("bbox");
            if (bboxNode.isArray()) {
                bboxNode.forEach(v -> bbox.add(v.asDouble()));
            }
            dto.setBbox(bbox);
            boxes.add(dto);
        }
        return boxes;
    }

    private List<PreviewImageDto> parsePreviews(JsonNode node) {
        List<PreviewImageDto> previews = new ArrayList<>();
        if (!node.isArray()) {
            return previews;
        }
        for (JsonNode item : node) {
            PreviewImageDto dto = new PreviewImageDto();
            dto.setPageIndex(item.path("pageIndex").asInt(0));
            dto.setImageUrl(item.path("imageUrl").asText(""));
            previews.add(dto);
        }
        return previews;
    }

    private RedactionJob getRequiredJob(String jobId) {
        RedactionJob job = jobs.get(jobId);
        if (job == null) {
            throw new RuntimeException("존재하지 않는 레닥션 작업입니다: " + jobId);
        }
        return job;
    }

    private void validatePdf(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new RuntimeException("PDF 파일이 비어 있습니다.");
        }
        String fileName = file.getOriginalFilename();
        if (fileName == null || !fileName.toLowerCase().endsWith(".pdf")) {
            throw new RuntimeException("PDF 파일만 업로드할 수 있습니다.");
        }
    }

    private RedactionJobResDto toResponse(RedactionJob job) {
        return RedactionJobResDto.builder()
                .jobId(job.getJobId())
                .status(job.getStatus().name())
                .message(job.getMessage())
                .pipelineType(job.getPipelineType())
                .previewImages(job.getPreviewImages())
                .detectedBoxes(job.getDetectedBoxes())
                .maskedPdfUrl(job.getMaskedPdfUrl())
                .createdAt(job.getCreatedAt())
                .updatedAt(job.getUpdatedAt())
                .build();
    }

    @Getter
    private static class RedactionJob {
        private final String jobId;
        private final Path originalPdfPath;
        private final LocalDateTime createdAt;
        private LocalDateTime updatedAt;
        private RedactionJobStatus status;
        private String message;
        private String pipelineType;
        private List<PreviewImageDto> previewImages = new ArrayList<>();
        private List<RedactionBoxDto> detectedBoxes = new ArrayList<>();
        private String maskedPdfUrl;

        private RedactionJob(String jobId, Path originalPdfPath) {
            this.jobId = jobId;
            this.originalPdfPath = originalPdfPath;
            this.createdAt = LocalDateTime.now();
            this.updatedAt = LocalDateTime.now();
            this.status = RedactionJobStatus.PENDING;
            this.message = "";
            this.pipelineType = "AUTO";
        }

        private void touch() {
            this.updatedAt = LocalDateTime.now();
        }

        private void setStatus(RedactionJobStatus status) {
            this.status = status;
        }

        private void setMessage(String message) {
            this.message = message;
        }

        private void setPipelineType(String pipelineType) {
            this.pipelineType = pipelineType;
        }

        private void setPreviewImages(List<PreviewImageDto> previewImages) {
            this.previewImages = previewImages;
        }

        private void setDetectedBoxes(List<RedactionBoxDto> detectedBoxes) {
            this.detectedBoxes = detectedBoxes;
        }

        private void setMaskedPdfUrl(String maskedPdfUrl) {
            this.maskedPdfUrl = maskedPdfUrl;
        }
    }
}
