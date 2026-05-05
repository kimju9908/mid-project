package kh.BackendCapstone.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UploadBenchmarkResDto {
    private String requestId;
    private String mode;
    private String fileName;
    private String folderPath;
    private long fileSizeBytes;
    private long durationMs;
    private boolean success;
    private String url;
    private String errorMessage;
    private long timestamp;
}
