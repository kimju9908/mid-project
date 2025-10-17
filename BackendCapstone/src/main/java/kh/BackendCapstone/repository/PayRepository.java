package kh.BackendCapstone.repository;

import kh.BackendCapstone.constant.FileCategory;
import kh.BackendCapstone.entity.FileBoard;
import kh.BackendCapstone.entity.Member;
import kh.BackendCapstone.entity.Pay;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PayRepository extends JpaRepository<Pay, Long> {
    // memberId와 fileCategory(를) 조건으로 데이터를 조회하는 메서드 추가
    List<Pay> findByMember_MemberIdAndFileBoard_FileCategoryAndStatus(Long memberId, FileCategory fileCategory, String status, Sort sort);
    List<Pay> findByMember_MemberId(Long memberId);
    boolean existsByMemberAndFileBoard (Member member, FileBoard fileBoard);

}
