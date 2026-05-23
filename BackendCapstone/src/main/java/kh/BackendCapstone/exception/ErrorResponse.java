package kh.BackendCapstone.exception;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class ErrorResponse {

    private final int status;          // HTTP 상태코드 (ex. 404)
    private final String code;         // 에러 코드  (ex. POST_NOT_FOUND)
    private final String message;      // 에러 메시지 (ex. "게시글이 존재하지 않습니다.")

    @JsonInclude(JsonInclude.Include.NON_NULL) // null이면 JSON에 포함 안 함
    private final List<FieldError> errors;    // @Valid 유효성 검사 실패 시 필드별 에러 목록

    // @Valid 유효성 검사 실패 시 필드 정보
    @Getter
    @Builder
    public static class FieldError {
        private final String field;    // 어떤 필드 (ex. "email")
        private final String value;    // 입력된 값  (ex. "abc")
        private final String reason;   // 실패 이유  (ex. "이메일 형식이 아닙니다")
    }

    // CustomException → ErrorResponse 변환
    public static ErrorResponse of(ErrorCode errorCode) {
        return ErrorResponse.builder()
                .status(errorCode.getStatus().value())
                .code(errorCode.getCode())
                .message(errorCode.getMessage())
                .build();
    }

    // @Valid 유효성 검사 실패 → ErrorResponse 변환
    public static ErrorResponse of(ErrorCode errorCode, List<FieldError> errors) {
        return ErrorResponse.builder()
                .status(errorCode.getStatus().value())
                .code(errorCode.getCode())
                .message(errorCode.getMessage())
                .errors(errors)
                .build();
    }

    /*
     * 프론트에서 받는 JSON 응답 예시
     *
     * [1] 일반 에러 (POST_NOT_FOUND)
     * {
     *   "status": 404,
     *   "code": "POST_NOT_FOUND",
     *   "message": "게시글이 존재하지 않습니다."
     * }
     *
     * [2] @Valid 유효성 검사 실패
     * {
     *   "status": 400,
     *   "code": "INVALID_INPUT",
     *   "message": "잘못된 입력입니다.",
     *   "errors": [
     *     { "field": "email",    "value": "abc",  "reason": "이메일 형식이 아닙니다." },
     *     { "field": "password", "value": "1234", "reason": "비밀번호는 8자 이상이어야 합니다." }
     *   ]
     * }
     *
     * [3] 서버 에러 (500)
     * {
     *   "status": 500,
     *   "code": "INTERNAL_SERVER_ERROR",
     *   "message": "서버 내부 오류가 발생했습니다."
     * }
     */
}
