package kh.BackendCapstone.service;

import kh.BackendCapstone.entity.Member;
import kh.BackendCapstone.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collections;

@Slf4j
@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {
	private final MemberRepository memberRepository;
	
	@Override
	public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
		return memberRepository.findByEmail(username)
			.map(this::createUserDetails)
			.orElseThrow(() -> new UsernameNotFoundException(username + " 을 DB에서 찾을 수 없습니다."));
	}
	private UserDetails createUserDetails(Member member) {
		log.warn("로그인 중에 멤버 객체를 잘 받아오는지 확인 : {}", member);
		GrantedAuthority grantedAuthority = new SimpleGrantedAuthority(member.getAuthority().toString());
		
		return new User(
			String.valueOf(member.getMemberId()),
			member.getPwd(),
			Collections.singleton(grantedAuthority)
		);
	}
}
