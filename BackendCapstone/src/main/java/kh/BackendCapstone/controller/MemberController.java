package kh.BackendCapstone.controller;

import kh.BackendCapstone.dto.request.MemberReqDto;
import kh.BackendCapstone.dto.response.MemberPermissionResDto;
import kh.BackendCapstone.dto.response.MemberResDto;
import kh.BackendCapstone.entity.Member;
import kh.BackendCapstone.service.AuthService;
import kh.BackendCapstone.service.MemberService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/member")
@CrossOrigin(origins = "http://localhost:3000")
@RequiredArgsConstructor
public class MemberController {

	private final MemberService memberService;
	private final AuthService authService;
	private final PasswordEncoder passwordEncoder;


	// 전체 회원 조회
	@GetMapping("/list")
	public ResponseEntity<List<MemberResDto>> allMember() {
		List<MemberResDto> rsp = memberService.allMember();
		log.info("rsp : {}", rsp);
		return ResponseEntity.ok(rsp);
	}

	// 회원 이메일 조회
	@GetMapping("/{email}")
	public ResponseEntity<MemberResDto> findMember(@PathVariable String email) {
		MemberResDto memberResDto = memberService.findMemberByEmail(email);
		log.info("memberResDto : {}", memberResDto);
		return ResponseEntity.ok(memberResDto);
	}
	@GetMapping("/nickName")
	public ResponseEntity<String> getEmailFromToken(@RequestHeader("Authorization") String token) {
		try {
			String nickName = memberService.convertTokenToEntity(token).getNickName();
			return ResponseEntity.ok(nickName);
		} catch (Exception e) {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid token");
		}
	}


	@PostMapping("/updateUser")
	public ResponseEntity<Boolean> updateMember(@RequestBody MemberReqDto memberReqDto) {
		boolean isSuccess = memberService.updateMember(memberReqDto);
		log.info("수정 성공 여부 : {}", isSuccess);
		return ResponseEntity.ok(isSuccess);
	}

	@GetMapping("/memberId")
	public ResponseEntity<Long> getMemberIdFromToken(@RequestHeader("Authorization") String token) {
		try {
			Long memberId = memberService.convertTokenToEntity(token).getMemberId();
			return ResponseEntity.ok(memberId);
		} catch (Exception e) {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Long.valueOf("Invalid token"));
		}
	}

	@GetMapping("/deleteUser")
	public ResponseEntity<Boolean> deleteMember(@RequestHeader("Authorization") String token ) {
		Long memberId = memberService.getMemberId(token);
		boolean isSuccess = memberService.deleteMember(memberId);
		log.info("삭제 성공 여부 : {}", isSuccess);
		return ResponseEntity.ok(isSuccess);
	}
	// 받는거
	@GetMapping("/role")
	public ResponseEntity<String> isRole(@RequestHeader("Authorization") String token) {
		String role = memberService.getRole(token);
		return ResponseEntity.ok(role);
	}

	@GetMapping("/revenue")
	public ResponseEntity<Integer> getRevenue(@RequestHeader("Authorization") String token) {
		try {
			int revenue = memberService.getRevenue(token);
			return ResponseEntity.ok(revenue);
		} catch (Exception e) {
			// 예외 로깅
			e.printStackTrace();
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
		}
	}
	@GetMapping("/saveRevenue")
	public ResponseEntity<String> saveRevenue(@RequestParam Long profit,
											  @RequestHeader("Authorization") String token) {
		try {
			// 서비스 계층의 saveRevenue 호출
			memberService.saveRevenue(profit, token);

			return ResponseEntity.ok("수익금이 정상적으로 처리되었습니다.");
		} catch (Exception e) {
			e.printStackTrace();
			return ResponseEntity.status(500).body("수익금 처리 실패: " + e.getMessage());
		}
	}

	@GetMapping("/details")
	public ResponseEntity<Member> getMemberDetails(@RequestHeader("Authorization") String token) {
		try {
			String actualToken = token.startsWith("Bearer ") ? token.substring(7) : token;
			Member member = memberService.convertTokenToEntity(actualToken);
			return ResponseEntity.ok(member);
		} catch (Exception e) {
			return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
		}
	}

	@PostMapping("/check-password")
	public ResponseEntity<Boolean> checkPassword(
			@RequestHeader("Authorization")String token,
			@RequestBody MemberReqDto memberReqDto) {
		boolean isValid = memberService.checkPassword(token, memberReqDto.getPwd());
		return ResponseEntity.ok(isValid);  // 로그인 성공 시 true, 실패 시 false 반환
	}


	@PostMapping("/updatePassword")
	public ResponseEntity<Boolean> changePassword(@RequestBody MemberReqDto memberReqDto) {
		try {
			memberService.updatePassword(memberReqDto.getPwd(), passwordEncoder); // 비밀번호 변경 로직 호출
			return ResponseEntity.ok(true); // 성공적으로 변경되었음을 true로 반환
		} catch (RuntimeException e) {
			return ResponseEntity.ok(false); // 실패했음을 false로 반환
		}
	}


	@PostMapping("/changeNickName")
	public ResponseEntity<Boolean> changeNickName(
			@RequestHeader("Authorization") String token, // 헤더에서 토큰 받기
			@RequestBody MemberReqDto memberReqDto) {

		boolean isValid = memberService.changeNickName(token, memberReqDto.getNickname());
		return ResponseEntity.ok(isValid);
	}

	@GetMapping("/permission")
	public ResponseEntity<List<MemberPermissionResDto>> convertTokenToPermission(@RequestHeader("Authorization") String token) {
		try {
			String actualToken = token.startsWith("Bearer ") ? token.substring(7) : token;
			List<MemberPermissionResDto> memberPermissionResDtos = memberService.convertTokenToPermission(actualToken);
			System.out.println("memberPermissionResDtos : " + memberPermissionResDtos);
			return ResponseEntity.ok(memberPermissionResDtos);
		} catch (Exception e) {
			e.printStackTrace();
			return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
		}
	}
}

