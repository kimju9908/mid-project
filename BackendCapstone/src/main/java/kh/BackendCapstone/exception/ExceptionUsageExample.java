package kh.BackendCapstone.exception;

/**
 * =====================================================================
 *  전역 예외처리 사용 예시
 * =====================================================================
 *
 * [1] Service에서 예외 던지는 방법]
 *
 *  // 기존 코드 (수동 처리)
 *  TextBoard textBoard = textBoardRepository.findByTextId(id)
 *      .orElseThrow(() -> new RuntimeException("해당 게시글이 존재하지 않습니다."));
 *
 *  // 변경 후 (CustomException 사용)
 *  TextBoard textBoard = textBoardRepository.findByTextId(id)
 *      .orElseThrow(() -> new CustomException(ErrorCode.POST_NOT_FOUND));
 *
 * ─────────────────────────────────────────────────────────────────────
 *
 * [2] 조건에 따라 예외 던지기
 *
 *  if (!comment.getMember().equals(member)) {
 *      throw new CustomException(ErrorCode.COMMENT_AUTHOR_MISMATCH);
 *  }
 *
 *  if (!passwordEncoder.matches(currentPassword, member.getPwd())) {
 *      throw new CustomException(ErrorCode.PASSWORD_MISMATCH);
 *  }
 *
 * ─────────────────────────────────────────────────────────────────────
 *
 * [3] @Valid 사용 예시 (DTO에 검증 어노테이션 추가)
 *
 *  public class MemberReqDto {
 *      @NotBlank(message = "이메일을 입력해주세요.")
 *      @Email(message = "이메일 형식이 아닙니다.")
 *      private String email;
 *
 *      @NotBlank(message = "비밀번호를 입력해주세요.")
 *      @Size(min = 8, message = "비밀번호는 8자 이상이어야 합니다.")
 *      private String password;
 *  }
 *
 *  // Controller에서 @Valid 선언
 *  @PostMapping("/join")
 *  public ResponseEntity<?> join(@Valid @RequestBody MemberReqDto dto) { ... }
 *
 * ─────────────────────────────────────────────────────────────────────
 *
 * [4] 프론트에서 받는 JSON 응답 예시
 *
 *  // POST_NOT_FOUND (404)
 *  {
 *    "status": 404,
 *    "code": "POST_NOT_FOUND",
 *    "message": "게시글이 존재하지 않습니다."
 *  }
 *
 *  // COMMENT_AUTHOR_MISMATCH (403)
 *  {
 *    "status": 403,
 *    "code": "COMMENT_AUTHOR_MISMATCH",
 *    "message": "댓글 작성자가 아닙니다."
 *  }
 *
 *  // @Valid 실패 (400)
 *  {
 *    "status": 400,
 *    "code": "INVALID_INPUT",
 *    "message": "잘못된 입력입니다.",
 *    "errors": [
 *      { "field": "email",    "value": "abc",  "reason": "이메일 형식이 아닙니다." },
 *      { "field": "password", "value": "1234", "reason": "비밀번호는 8자 이상이어야 합니다." }
 *    ]
 *  }
 *
 *  // 서버 에러 (500)
 *  {
 *    "status": 500,
 *    "code": "INTERNAL_SERVER_ERROR",
 *    "message": "서버 내부 오류가 발생했습니다."
 *  }
 *
 * ─────────────────────────────────────────────────────────────────────
 *
 * [5] 프론트(React) axios 처리 예시
 *
 *  try {
 *    const res = await axios.get(`/post/${id}`);
 *  } catch (err) {
 *    const { status, code, message } = err.response.data;
 *    if (code === 'POST_NOT_FOUND') {
 *      alert('게시글이 삭제되었습니다.');
 *    } else if (code === 'UNAUTHORIZED') {
 *      navigate('/login');
 *    }
 *  }
 *
 * =====================================================================
 */
public class ExceptionUsageExample {
    // 이 파일은 예시 설명용입니다. 실제 코드가 아닙니다.
}
