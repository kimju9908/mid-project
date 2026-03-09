package kh.BackendCapstone.dto.redaction;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class PreviewImageDto {
    private Integer pageIndex;
    private String imageUrl;
}
