package kh.BackendCapstone.repository;

import kh.BackendCapstone.entity.UserBank;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserBankRepository extends JpaRepository<UserBank, Long> {
    // Member와의 관계가 단방향이므로 이 메서드는 제거
    // 대신 Member에서 UserBank를 직접 조회하거나 다른 방식 사용
}
