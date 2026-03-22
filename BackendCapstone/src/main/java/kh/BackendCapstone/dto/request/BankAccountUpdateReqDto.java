package kh.BackendCapstone.dto.request;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class BankAccountUpdateReqDto {
    private String bankName;
    private String bankAccount;
}
