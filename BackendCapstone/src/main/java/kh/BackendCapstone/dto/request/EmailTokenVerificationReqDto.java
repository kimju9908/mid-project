package kh.BackendCapstone.dto.request;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class EmailTokenVerificationReqDto {
    private String email;
    private String inputToken;
}
