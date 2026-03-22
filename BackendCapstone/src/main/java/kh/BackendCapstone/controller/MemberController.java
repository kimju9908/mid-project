package kh.BackendCapstone.controller;

import kh.BackendCapstone.dto.request.BankAccountUpdateReqDto;
import kh.BackendCapstone.dto.request.MemberReqDto;
import kh.BackendCapstone.dto.request.NicknameReqDto;
import kh.BackendCapstone.dto.request.PasswordReqDto;
import kh.BackendCapstone.dto.request.PermissionReqDto;
import kh.BackendCapstone.dto.request.RevenueReqDto;
import kh.BackendCapstone.dto.response.MemberPermissionResDto;
import kh.BackendCapstone.dto.response.MemberResDto;
import kh.BackendCapstone.dto.response.OperationResDto;
import kh.BackendCapstone.entity.Member;
import kh.BackendCapstone.security.SecurityUtil;
import kh.BackendCapstone.service.AuthService;
import kh.BackendCapstone.service.MemberService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/members")
@CrossOrigin(origins = "http://localhost:3000")
@RequiredArgsConstructor
public class MemberController {

    private final MemberService memberService;
    private final AuthService authService;
    private final PasswordEncoder passwordEncoder;

    @GetMapping
    public ResponseEntity<List<MemberResDto>> allMember() {
        return ResponseEntity.ok(memberService.allMember());
    }


    @GetMapping(params = "email")
    public ResponseEntity<MemberResDto> findMember(@RequestParam String email) {
        return ResponseEntity.ok(memberService.findMemberByEmail(email));
    }

    @GetMapping("/me")
    public ResponseEntity<Member> getMemberDetails() {
        return ResponseEntity.ok(memberService.convertTokenToEntity());
    }

    @GetMapping("/me/nickname")
    public ResponseEntity<String> getNickName() {
        return ResponseEntity.ok(memberService.convertTokenToEntity().getNickName());
    }

    @PatchMapping("/me")
    public ResponseEntity<OperationResDto> updateMember(@RequestBody MemberReqDto memberReqDto) {
        boolean isSuccess = memberService.updateMember(memberReqDto);
        HttpStatus status = isSuccess ? HttpStatus.OK : HttpStatus.BAD_REQUEST;
        return ResponseEntity.status(status).body(OperationResDto.builder()
                .success(isSuccess)
                .message(isSuccess ? "회원 정보가 수정되었습니다." : "회원 정보 수정에 실패했습니다.")
                .build());
    }

    @GetMapping("/me/id")
    public ResponseEntity<Long> getMemberId() {
        return ResponseEntity.ok(memberService.convertTokenToEntity().getMemberId());
    }

    @DeleteMapping("/me")
    public ResponseEntity<Void> deleteMember() {
        Long memberId = SecurityUtil.getCurrentMemberId();
        boolean isSuccess = memberService.deleteMember(memberId);
        return isSuccess ? ResponseEntity.noContent().build() : ResponseEntity.notFound().build();
    }

    @GetMapping("/me/role")
    public ResponseEntity<String> isRole() {
        return ResponseEntity.ok(memberService.getRole());
    }

    @GetMapping("/me/revenue")
    public ResponseEntity<Integer> getRevenue() {
        return ResponseEntity.ok(memberService.getRevenue());
    }


    @PostMapping("/me/revenue")
    public ResponseEntity<OperationResDto> saveRevenue(@RequestBody RevenueReqDto revenueReqDto) {
        memberService.saveRevenue(revenueReqDto.getProfit());
        return ResponseEntity.status(HttpStatus.CREATED).body(OperationResDto.builder()
                .success(true)
                .message("수익금이 정상적으로 처리되었습니다.")
                .build());
    }

    @PostMapping("/me/password/verify")
    public ResponseEntity<Boolean> checkPassword(@RequestBody PasswordReqDto passwordReqDto) {
        return ResponseEntity.ok(memberService.checkPassword(passwordReqDto.getPwd()));
    }

    @PatchMapping("/me/password")
    public ResponseEntity<OperationResDto> changePassword(@RequestBody PasswordReqDto passwordReqDto) {
        try {
            memberService.updatePassword(passwordReqDto.getPwd(), passwordEncoder);
            return ResponseEntity.ok(OperationResDto.builder()
                    .success(true)
                    .message("비밀번호가 성공적으로 변경되었습니다.")
                    .build());
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(OperationResDto.builder()
                    .success(false)
                    .message("비밀번호 변경에 실패했습니다.")
                    .build());
        }
    }

    @PatchMapping("/me/nickname")
    public ResponseEntity<OperationResDto> changeNickName(@RequestBody NicknameReqDto nicknameReqDto) {
        boolean isSuccess = memberService.changeNickName(nicknameReqDto.getNickname());
        HttpStatus status = isSuccess ? HttpStatus.OK : HttpStatus.BAD_REQUEST;
        return ResponseEntity.status(status).body(OperationResDto.builder()
                .success(isSuccess)
                .message(isSuccess ? "닉네임이 변경되었습니다." : "닉네임 변경에 실패했습니다.")
                .build());
    }

    @GetMapping("/me/permissions")
    public ResponseEntity<List<MemberPermissionResDto>> convertTokenToPermission() {
        return ResponseEntity.ok(memberService.convertPermission());
    }

    @PostMapping("/me/permissions")
    public ResponseEntity<OperationResDto> savePermission(@RequestBody PermissionReqDto permissionReqDto) {
        boolean saved = authService.savePermission(permissionReqDto.getPermissionUrl());
        HttpStatus status = saved ? HttpStatus.CREATED : HttpStatus.BAD_REQUEST;
        return ResponseEntity.status(status).body(OperationResDto.builder()
                .success(saved)
                .message(saved ? "증빙 파일이 저장되었습니다." : "증빙 파일 저장에 실패했습니다.")
                .build());
    }

    @PatchMapping("/{memberId}/bank-account")
    public ResponseEntity<OperationResDto> changeBankInfo(
            @PathVariable Long memberId,
            @RequestBody BankAccountUpdateReqDto requestDto
    ) {
        try {
            boolean isUpdated = memberService.updateBankInfo(memberId, requestDto.getBankName(), requestDto.getBankAccount());
            if (!isUpdated) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(OperationResDto.builder()
                        .success(false)
                        .message("사용자를 찾을 수 없습니다.")
                        .build());
            }
            return ResponseEntity.ok(OperationResDto.builder()
                    .success(true)
                    .message("은행 정보가 성공적으로 변경되었습니다.")
                    .build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(OperationResDto.builder()
                    .success(false)
                    .message("서버 오류가 발생했습니다.")
                    .build());
        }
    }
}
