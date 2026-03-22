package kh.BackendCapstone.controller;

import kh.BackendCapstone.dto.AccessTokenDto;
import kh.BackendCapstone.dto.TokenDto;
import kh.BackendCapstone.dto.request.EmailRequestDto;
import kh.BackendCapstone.dto.request.EmailTokenVerificationReqDto;
import kh.BackendCapstone.dto.request.LoginReqDto;
import kh.BackendCapstone.dto.request.MemberReqDto;
import kh.BackendCapstone.dto.request.PasswordReqDto;
import kh.BackendCapstone.dto.request.PhoneTokenVerificationReqDto;
import kh.BackendCapstone.dto.request.RefreshTokenReqDto;
import kh.BackendCapstone.dto.request.SmsSendRequestDto;
import kh.BackendCapstone.dto.response.AvailabilityResDto;
import kh.BackendCapstone.dto.response.EmailLookupResDto;
import kh.BackendCapstone.dto.response.MemberResDto;
import kh.BackendCapstone.dto.response.OperationResDto;
import kh.BackendCapstone.dto.response.VerificationSendResDto;
import kh.BackendCapstone.entity.Bank;
import kh.BackendCapstone.service.AuthService;
import kh.BackendCapstone.service.EmailService;
import kh.BackendCapstone.service.MemberService;
import kh.BackendCapstone.service.SmsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Slf4j
@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;
    private final SmsService smsService;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;
    private final MemberService memberService;

    @GetMapping("/availability")
    public ResponseEntity<AvailabilityResDto> existMember(
            @RequestParam(required = false) String email,
            @RequestParam(required = false) String nickname,
            @RequestParam(required = false) String phone
    ) {
        if (email == null && nickname == null && phone == null) {
            return ResponseEntity.badRequest().build();
        }

        AvailabilityResDto response = AvailabilityResDto.builder()
                .emailAvailable(email == null ? null : !authService.existEmail(email))
                .nicknameAvailable(nickname == null ? null : !authService.existNickName(nickname))
                .phoneAvailable(phone == null ? null : !authService.existPhone(phone))
                .build();
        return ResponseEntity.ok(response);
    }


    @PostMapping("/signup")
    public ResponseEntity<MemberResDto> signup(@RequestBody MemberReqDto memberReqDto) {
        MemberResDto memberResDto = authService.signup(memberReqDto);
        log.info("signup : {}", memberResDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(memberResDto);
    }

    @PostMapping("/password-reset-requests")
    public ResponseEntity<OperationResDto> sendPw(@RequestBody EmailRequestDto requestDto) {
        boolean result = emailService.sendPasswordResetToken(requestDto.getEmail());
        HttpStatus status = result ? HttpStatus.ACCEPTED : HttpStatus.BAD_REQUEST;
        return ResponseEntity.status(status).body(OperationResDto.builder()
                .success(result)
                .message(result ? "비밀번호 재설정 메일을 전송했습니다." : "비밀번호 재설정 메일 전송에 실패했습니다.")
                .build());
    }

    @PostMapping("/email-verifications")
    public ResponseEntity<Boolean> verifyEmailToken(@RequestBody EmailTokenVerificationReqDto requestDto) {
        boolean isValid = emailService.verifyEmailToken(requestDto.getEmail(), requestDto.getInputToken());
        return ResponseEntity.ok(isValid);
    }

    @PostMapping("/phone-verification-requests")
    public ResponseEntity<VerificationSendResDto> sendSms(@RequestBody SmsSendRequestDto requestDto) {
        String result = smsService.sendVerificationCode(requestDto.getPhone());
        return ResponseEntity.ok(VerificationSendResDto.builder().status(result).build());
    }

    @PostMapping("/phone-verifications")
    public ResponseEntity<Boolean> verifySmsCode(@RequestBody PhoneTokenVerificationReqDto requestDto) {
        boolean isValid = smsService.verifySmsCode(requestDto.getPhone(), requestDto.getInputToken());
        return ResponseEntity.ok(isValid);
    }

    @GetMapping("/email")
    public ResponseEntity<?> findEmailByPhone(@RequestParam String phone) {
        try {
            MemberResDto memberResDto = memberService.findEmailByPhone(phone);
            return ResponseEntity.ok(EmailLookupResDto.builder().email(memberResDto.getEmail()).build());
        } catch (RuntimeException e) {
            log.warn("회원 정보를 찾을 수 없습니다. phone: {}", phone, e);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(OperationResDto.builder()
                    .success(false)
                    .message("해당 회원이 존재하지 않습니다.")
                    .build());
        }
    }


    @PostMapping("/refresh")
    public ResponseEntity<AccessTokenDto> refreshAccessToken(@RequestBody RefreshTokenReqDto requestDto) {
        return ResponseEntity.ok(authService.refreshAccessToken(requestDto.getRefreshToken()));
    }

    @PostMapping("/login")
    public ResponseEntity<TokenDto> login(@RequestBody LoginReqDto loginReqDto) {
        MemberReqDto memberReqDto = MemberReqDto.builder()
                .email(loginReqDto.getEmail())
                .pwd(loginReqDto.getPwd())
                .build();
        return ResponseEntity.ok(authService.login(memberReqDto));
    }

    @PatchMapping("/password")
    public ResponseEntity<OperationResDto> changePassword(@RequestBody PasswordReqDto requestDto) {
        try {
            emailService.changePassword(requestDto.getPwd(), passwordEncoder);
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

    @GetMapping("/banks")
    public ResponseEntity<List<Bank>> getAllBanks() {
        return ResponseEntity.ok(authService.getAllBanks());
    }
}
