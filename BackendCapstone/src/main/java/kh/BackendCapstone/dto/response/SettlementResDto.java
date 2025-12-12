package kh.BackendCapstone.dto.response;

import lombok.*;

@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
public class SettlementResDto {
    private Long userBankId;
    private Long memberId;
    private String memberName;
    private String bankName;
    private String bankAccount;
    private Long withdrawal;
}

