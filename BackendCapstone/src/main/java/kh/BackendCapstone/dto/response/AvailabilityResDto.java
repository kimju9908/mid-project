package kh.BackendCapstone.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AvailabilityResDto {
    private Boolean emailAvailable;
    private Boolean nicknameAvailable;
    private Boolean phoneAvailable;
}
