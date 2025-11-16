package kh.BackendCapstone.repository;


import kh.BackendCapstone.constant.Authority;
import kh.BackendCapstone.entity.Member;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MemberRepository extends JpaRepository<Member, Long> {
	boolean existsByEmail(String email);
	
	boolean existsByPhone(String phone);
	
	Optional<Member> findByEmail(String email);
	
	Optional<Member> findByUserId(String userId);
	
	boolean existsByNickName(String nickName);
	
	
	Optional<Member> findByNickName(String nickName);
	
	Optional<Member> findById(Long id);
	
	Optional<Member> findByAuthority(Authority authority);
	
	Optional<Member> findEmailByPhone(String phone);
	
	Optional<Member> findByMemberId(Long memberId);
	List<Member> findAllByAuthority(Authority authority);
	List<Member> findAllByUniv_UnivNameContaining(String univName);
	
	// UserBank 정보를 조인으로 함께 가져오는 메서드
	@Query("SELECT m FROM Member m LEFT JOIN FETCH m.userBank WHERE m.memberId = :memberId")
	Optional<Member> findByIdWithUserBank(@Param("memberId") Long memberId);
}