package kh.BackendCapstone.dto.response;

import kh.BackendCapstone.constant.Authority;
import kh.BackendCapstone.entity.Bank;
import kh.BackendCapstone.entity.UserBank;
import lombok.*;

import java.time.LocalDateTime;

@Getter @Setter @ToString
@NoArgsConstructor @AllArgsConstructor
public class AdminMemberResDto {
	private Long id;
	private String name;
	private String email;
	private String phone;
	private Authority authority;
	private String univName;
	private String univDept;
	private LocalDateTime regDate;
	private String bankName;
	private String bankAccount;
	private Long withdrawal;
	private int revenue;
}
