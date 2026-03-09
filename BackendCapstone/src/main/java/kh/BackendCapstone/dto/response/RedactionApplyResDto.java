package kh.BackendCapstone.dto.response;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class RedactionApplyResDto {
    private String jobId;
    private String status;
    private String maskedPdfUrl;
    private String message;
}
