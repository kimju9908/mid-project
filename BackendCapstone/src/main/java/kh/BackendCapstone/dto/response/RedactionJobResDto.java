package kh.BackendCapstone.dto.response;

import kh.BackendCapstone.dto.redaction.PreviewImageDto;
import kh.BackendCapstone.dto.redaction.RedactionBoxDto;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@Builder
public class RedactionJobResDto {
    private String jobId;
    private String status;
    private String message;
    private String pipelineType;
    private List<PreviewImageDto> previewImages;
    private List<RedactionBoxDto> detectedBoxes;
    private String maskedPdfUrl;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
