package kh.BackendCapstone.dto.redaction;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
public class RedactionBoxDto {
    private Integer pageIndex;
    private List<Double> bbox; // [x0, y0, x1, y1]
    private String reason;
    private Boolean selected = true;
}
