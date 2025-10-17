package kh.BackendCapstone.dto.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserBankReqDto {
    private Long memberId;
    private String bankName;
    private String bankAccount;
}
