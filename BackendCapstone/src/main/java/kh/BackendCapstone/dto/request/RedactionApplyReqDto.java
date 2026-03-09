package kh.BackendCapstone.dto.request;

import kh.BackendCapstone.dto.redaction.RedactionBoxDto;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
public class RedactionApplyReqDto {
    private List<RedactionBoxDto> boxes = new ArrayList<>();
    private String folderPath = "permission";
    private String fileName;
}
