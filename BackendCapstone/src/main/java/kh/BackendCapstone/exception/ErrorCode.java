package kh.BackendCapstone.exception;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@RequiredArgsConstructor
public enum ErrorCode {

    // ===================== 공통 =====================
    INVALID_INPUT(HttpStatus.BAD_REQUEST, "INVALID_INPUT", "잘못된 입력입니다."),
    UNAUTHORIZED(HttpStatus.UNAUTHORIZED, "UNAUTHORIZED", "권한이 없습니다."),
    FORBIDDEN(HttpStatus.FORBIDDEN, "FORBIDDEN", "접근이 거부되었습니다."),
    INTERNAL_SERVER_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "INTERNAL_SERVER_ERROR", "서버 내부 오류가 발생했습니다."),

    // ===================== 회원 =====================
    MEMBER_NOT_FOUND(HttpStatus.NOT_FOUND, "MEMBER_NOT_FOUND", "회원이 존재하지 않습니다."),
    DUPLICATE_EMAIL(HttpStatus.CONFLICT, "DUPLICATE_EMAIL", "이미 사용 중인 이메일입니다."),
    DUPLICATE_NICKNAME(HttpStatus.CONFLICT, "DUPLICATE_NICKNAME", "이미 사용 중인 닉네임입니다."),
    INVALID_PASSWORD(HttpStatus.BAD_REQUEST, "INVALID_PASSWORD", "비밀번호가 올바르지 않습니다."),
    PASSWORD_MISMATCH(HttpStatus.BAD_REQUEST, "PASSWORD_MISMATCH", "현재 비밀번호가 일치하지 않습니다."),

    // ===================== 인증 / JWT =====================
    INVALID_TOKEN(HttpStatus.UNAUTHORIZED, "INVALID_TOKEN", "유효하지 않은 토큰입니다."),
    EXPIRED_TOKEN(HttpStatus.UNAUTHORIZED, "EXPIRED_TOKEN", "만료된 토큰입니다."),
    INVALID_RESET_TOKEN(HttpStatus.BAD_REQUEST, "INVALID_RESET_TOKEN", "유효하지 않거나 만료된 비밀번호 재설정 토큰입니다."),

    // ===================== 이메일 / SMS 인증 =====================
    INVALID_EMAIL_TOKEN(HttpStatus.BAD_REQUEST, "INVALID_EMAIL_TOKEN", "이메일 인증번호가 올바르지 않습니다."),
    EXPIRED_EMAIL_TOKEN(HttpStatus.BAD_REQUEST, "EXPIRED_EMAIL_TOKEN", "이메일 인증번호가 만료되었습니다."),
    INVALID_SMS_CODE(HttpStatus.BAD_REQUEST, "INVALID_SMS_CODE", "SMS 인증번호가 올바르지 않습니다."),
    EXPIRED_SMS_CODE(HttpStatus.BAD_REQUEST, "EXPIRED_SMS_CODE", "SMS 인증번호가 만료되었습니다."),
    SMS_SEND_FAILED(HttpStatus.INTERNAL_SERVER_ERROR, "SMS_SEND_FAILED", "SMS 발송에 실패했습니다."),

    // ===================== 게시글 =====================
    POST_NOT_FOUND(HttpStatus.NOT_FOUND, "POST_NOT_FOUND", "게시글이 존재하지 않습니다."),
    POST_AUTHOR_MISMATCH(HttpStatus.FORBIDDEN, "POST_AUTHOR_MISMATCH", "게시글 작성자가 아닙니다."),

    // ===================== 댓글 =====================
    COMMENT_NOT_FOUND(HttpStatus.NOT_FOUND, "COMMENT_NOT_FOUND", "댓글이 존재하지 않습니다."),
    COMMENT_AUTHOR_MISMATCH(HttpStatus.FORBIDDEN, "COMMENT_AUTHOR_MISMATCH", "댓글 작성자가 아닙니다."),
    COMMENT_BOARD_MISMATCH(HttpStatus.BAD_REQUEST, "COMMENT_BOARD_MISMATCH", "해당 게시글의 댓글이 아닙니다."),

    // ===================== 파일 =====================
    FILE_NOT_FOUND(HttpStatus.NOT_FOUND, "FILE_NOT_FOUND", "파일이 존재하지 않습니다."),
    FILE_UPLOAD_FAILED(HttpStatus.INTERNAL_SERVER_ERROR, "FILE_UPLOAD_FAILED", "파일 업로드에 실패했습니다."),

    // ===================== 채팅 =====================
    CHAT_ROOM_NOT_FOUND(HttpStatus.NOT_FOUND, "CHAT_ROOM_NOT_FOUND", "채팅방이 존재하지 않습니다."),
    CHAT_NOT_AUTHORIZED(HttpStatus.FORBIDDEN, "CHAT_NOT_AUTHORIZED", "채팅방 접근 권한이 없습니다.");

    private final HttpStatus status;
    private final String code;
    private final String message;
}
