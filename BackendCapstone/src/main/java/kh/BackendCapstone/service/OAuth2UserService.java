package kh.BackendCapstone.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import kh.BackendCapstone.entity.CustomOAuth2User;
import kh.BackendCapstone.entity.Member;
import kh.BackendCapstone.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class OAuth2UserService extends DefaultOAuth2UserService {
    private final MemberRepository memberRepository;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest request) throws OAuth2AuthenticationException {
        OAuth2User oAuth2User = super.loadUser(request);
        String oauthClientName = request.getClientRegistration().getClientName();

        try {
            System.out.println(new ObjectMapper().writeValueAsString(oAuth2User.getAttributes()));
        } catch (Exception e) {
            e.printStackTrace();
        }

        Member member = null;
        String userId = null;
        String name = null;
        String phone = null;
        String type = null;
        String nickName = null;
        String email = null;

        if (oauthClientName.equals("kakao")) {
            userId = "kakao_" + oAuth2User.getAttributes().get("id");
            type = "kakao";
            name = (String) oAuth2User.getAttributes().get("nickname");
            nickName = "kakao_" + oAuth2User.getAttributes().get("id");
            email = nickName + "@kakao.com";


        } else if (oauthClientName.equals("naver")) {
            Map<String, String> responseMap = (Map<String, String>) oAuth2User.getAttributes().get("response");
            userId = "naver_" + responseMap.get("id").substring(0, 14);
            name = responseMap.get("nickname");
            phone = responseMap.get("mobile");
            type = "naver";
            nickName = "naver_" + responseMap.get("id").substring(0, 14);
            email = nickName + "@naver.com";

        }
        System.out.println("userId: " + userId);

        // 중복 체크: userId로 이미 존재하는 회원이 있는지 확인
        Optional<Member> existingMemberByUserId = memberRepository.findByUserId(userId);

        if (existingMemberByUserId.isPresent()) {
            // 이미 존재하는 회원이 있으면 저장하지 않음
            System.out.println("회원이 이미 존재합니다. 회원 등록을 건너뜁니다.");
            return new CustomOAuth2User(userId); // 이미 존재하는 사용자 정보 반환
        }

        member = new Member(userId, email, type, phone, name, nickName, LocalDateTime.now());
        memberRepository.save(member); // 회원 정보 저장
        System.out.println("회원 정보 저장 완료: " + member);
        return new CustomOAuth2User(userId); // 저장된 사용자 정보 반환
    }
}