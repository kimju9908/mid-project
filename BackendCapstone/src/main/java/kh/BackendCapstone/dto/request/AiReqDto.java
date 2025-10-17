package kh.BackendCapstone.dto.request;

import lombok.*;

@Getter @Setter @ToString
@NoArgsConstructor @AllArgsConstructor
public class AiReqDto {
	private Long psContentsId;
	private Long payId;
	private String prompt;
}
