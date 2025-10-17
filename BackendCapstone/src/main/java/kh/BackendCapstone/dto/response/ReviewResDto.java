package kh.BackendCapstone.dto.response;


import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor

public class ReviewResDto {

    private Long reviewId;
    private String reviewContent;
    private LocalDateTime reviewRegDate;
    private String memberName;
    private Long memberId;
    private Long fileId;

    public ReviewResDto(Long reviewId, String reviewContent, LocalDateTime reviewRegDate, String memberName, Long memberId) {
        this.reviewId = reviewId;
        this.reviewContent = reviewContent;
        this.reviewRegDate = reviewRegDate;
        this.memberName = memberName;
        this.memberId = memberId;
    }
}
