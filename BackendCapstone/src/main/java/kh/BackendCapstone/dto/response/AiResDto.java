package kh.BackendCapstone.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;
import org.checkerframework.checker.units.qual.N;

import java.time.LocalDateTime;

@Getter @Setter @ToString
@NoArgsConstructor
@AllArgsConstructor
public class AiResDto {
	private String message;
	private boolean user;
	private LocalDateTime regDate;
}
