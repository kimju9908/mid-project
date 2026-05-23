/**
 * 백엔드 에러 응답 처리 유틸
 *
 * 백엔드 에러 응답 형태:
 * {
 *   "status": 404,
 *   "code": "POST_NOT_FOUND",
 *   "message": "게시글이 존재하지 않습니다.",
 *   "errors": [...] // @Valid 실패 시만 존재
 * }
 */

// ===================== 에러 코드 상수 =====================
export const ERROR_CODE = {
  // 공통
  INVALID_INPUT: "INVALID_INPUT",
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  INTERNAL_SERVER_ERROR: "INTERNAL_SERVER_ERROR",
  // 회원
  MEMBER_NOT_FOUND: "MEMBER_NOT_FOUND",
  DUPLICATE_EMAIL: "DUPLICATE_EMAIL",
  DUPLICATE_NICKNAME: "DUPLICATE_NICKNAME",
  INVALID_PASSWORD: "INVALID_PASSWORD",
  PASSWORD_MISMATCH: "PASSWORD_MISMATCH",
  // 인증
  INVALID_TOKEN: "INVALID_TOKEN",
  EXPIRED_TOKEN: "EXPIRED_TOKEN",
  INVALID_RESET_TOKEN: "INVALID_RESET_TOKEN",
  // 이메일/SMS
  INVALID_EMAIL_TOKEN: "INVALID_EMAIL_TOKEN",
  EXPIRED_EMAIL_TOKEN: "EXPIRED_EMAIL_TOKEN",
  INVALID_SMS_CODE: "INVALID_SMS_CODE",
  EXPIRED_SMS_CODE: "EXPIRED_SMS_CODE",
  // 게시글
  POST_NOT_FOUND: "POST_NOT_FOUND",
  POST_AUTHOR_MISMATCH: "POST_AUTHOR_MISMATCH",
  // 댓글
  COMMENT_NOT_FOUND: "COMMENT_NOT_FOUND",
  COMMENT_AUTHOR_MISMATCH: "COMMENT_AUTHOR_MISMATCH",
};

/**
 * axios catch 블록에서 백엔드 에러 데이터 추출
 * @param {Error} error - axios catch의 error 객체
 * @returns {{ status, code, message, errors } | null}
 */
export const getApiError = (error) => {
  return error?.response?.data ?? null;
};

/**
 * 에러 코드에 따라 메시지 반환 (백엔드 메시지 우선, 없으면 기본 메시지)
 * @param {Error} error - axios catch의 error 객체
 * @param {string} fallback - 에러 응답이 없을 때 기본 메시지
 * @returns {string}
 */
export const getErrorMessage = (error, fallback = "오류가 발생했습니다.") => {
  const apiError = getApiError(error);
  return apiError?.message ?? fallback;
};

/**
 * @Valid 실패 시 필드별 에러 메시지 추출
 * @param {Error} error
 * @returns {Object} - { fieldName: "에러메시지" }
 * ex) { email: "이메일 형식이 아닙니다.", password: "8자 이상이어야 합니다." }
 */
export const getFieldErrors = (error) => {
  const apiError = getApiError(error);
  if (!apiError?.errors) return {};
  return apiError.errors.reduce((acc, { field, reason }) => {
    acc[field] = reason;
    return acc;
  }, {});
};

/**
 * 특정 에러 코드인지 확인
 * @param {Error} error
 * @param {string} code - ERROR_CODE 상수
 * @returns {boolean}
 */
export const isErrorCode = (error, code) => {
  return getApiError(error)?.code === code;
};

/*
 * ===================== 사용 예시 =====================
 *
 * [1] 기본 메시지 표시
 *
 * import { getErrorMessage } from "../util/ApiError";
 *
 * try {
 *   await axiosInstance.get(`/post/${id}`);
 * } catch (error) {
 *   alert(getErrorMessage(error));
 *   // → "게시글이 존재하지 않습니다." (백엔드 메시지 그대로)
 * }
 *
 * ─────────────────────────────────────────────────────
 *
 * [2] 에러 코드별 분기 처리
 *
 * import { getApiError, ERROR_CODE } from "../util/ApiError";
 *
 * try {
 *   await axiosInstance.post("/auth/login", dto);
 * } catch (error) {
 *   const { code } = getApiError(error) || {};
 *   if (code === ERROR_CODE.MEMBER_NOT_FOUND) {
 *     setError("존재하지 않는 계정입니다.");
 *   } else if (code === ERROR_CODE.INVALID_PASSWORD) {
 *     setError("비밀번호를 확인해주세요.");
 *   } else {
 *     setError("로그인 중 오류가 발생했습니다.");
 *   }
 * }
 *
 * ─────────────────────────────────────────────────────
 *
 * [3] @Valid 필드 에러 처리
 *
 * import { getFieldErrors } from "../util/ApiError";
 *
 * try {
 *   await axiosInstance.post("/members/join", dto);
 * } catch (error) {
 *   const fieldErrors = getFieldErrors(error);
 *   // fieldErrors = { email: "이메일 형식이 아닙니다.", password: "8자 이상" }
 *   setEmailError(fieldErrors.email || "");
 *   setPasswordError(fieldErrors.password || "");
 * }
 *
 * =====================================================
 */
