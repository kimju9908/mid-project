package kh.BackendCapstone.service;


import kh.BackendCapstone.constant.Active;
import kh.BackendCapstone.constant.Authority;
import kh.BackendCapstone.constant.TextCategory;
import kh.BackendCapstone.dto.request.AdminMemberReqDto;
import kh.BackendCapstone.dto.request.TextBoardReqDto;
import kh.BackendCapstone.dto.request.UnivReqDto;
import kh.BackendCapstone.dto.response.AdminMemberResDto;
import kh.BackendCapstone.dto.response.PermissionResDto;
import kh.BackendCapstone.dto.response.TextBoardListResDto;
import kh.BackendCapstone.entity.*;
import kh.BackendCapstone.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.transaction.Transactional;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminService {
	private final PermissionRepository permissionRepository;
	private final UnivRepository univRepository;
	private final MemberRepository memberRepository;
	private final TextBoardRepository textBoardRepository;
	private final TextBoardService textBoardService;
	private final UserBankRepository userBankRepository;
	private final MemberService memberService;
	private final UnivService univService;
	private final BankRepository bankRepository;
	
	public PermissionResDto getPermission(Long id) {
		try {
			Permission permission = permissionRepository.findByPermissionId(id)
				.orElseThrow(() -> new RuntimeException("해당 권한 설정이 없습니다."));
			log.warn("권한 설정 : {}", permission);
			return convertEntityToDto(permission);
		} catch (Exception e) {
			log.error("권한 불러오는 중 에러 발생 : {}", e.getMessage());
			return null;
		}
	}
	public List<PermissionResDto> getPermissionList(String active) {
		try{
			List<Permission> permissionList = permissionRepository.findAllByActive(Active.fromString(active));
			log.warn("{}개의 상태가 {}인 권한 설정 목록 : {}",permissionList.size(), active, permissionList);
			return convertEntityToDtoList(permissionList);
		} catch (Exception e) {
			log.error("권한 리스트 불러오는 중 에러 발생 : {}", e.getMessage());
			return null;
		}
	}
	@Transactional
	public boolean activatePermission(Long permissionId, Long univId, boolean isUniv) {
		try{
			Permission permission = permissionRepository.findByPermissionId(permissionId)
				.orElseThrow(() -> new RuntimeException("해당 권한 설정이 없습니다."));
			Univ univ = univRepository.findById(univId)
				.orElseThrow(() -> new RuntimeException("해당 대학이 존재하지 않습니다."));
			permission.setActive(Active.ACTIVE);
			permission.setActiveDate(LocalDateTime.now());
			permission.setUniv(univ);
			if (isUniv) {
				Member member = permission.getMember();
				member.setUniv(univ);
				memberRepository.save(member);
			}
			log.warn("권한 설정 변경 : {}", permission);
			return permissionSave(permission);
		} catch (Exception e) {
			log.error("권한 변경중 에러 : {}", e.getMessage());
			return false;
		}
	}
	public boolean permissionSave(Permission permission) {
		try {
			Permission savedPermission = permissionRepository.save(permission);
			// 저장된 Permission이 null이 아니면 성공
			return savedPermission.getPermissionId() != null;
		} catch (Exception e) {
			// 저장 중 예외가 발생하면 false 반환
			log.error("저장중 에러 : {}",e.getMessage());
			return false;
		}
	}
	
	public List<String> getUnivList() {
		try {
			List<String> univList = univRepository.findDistinctColumn();
			log.warn("대학 이름 전체 조회 결과 : {}", univList);
			return univList;
		} catch (Exception e) {
			log.error("전체 대학 조회중 오류 : {}", e.getMessage());
			return null;
		}
	}
	public List<Univ> getDeptList(String univName) {
		try {
			List<Univ> univList = univRepository.findByUnivName(univName);
			log.warn("학과 조회 결과 : {}", univList);
			return univList;
		} catch (Exception e) {
			log.error("학과 조회중 오류 : {}", e.getMessage());
			return null;
		}
	}
	
	public List<Member> getMemberList(String searchOption , String searchValue ) {
		log.warn("검색 : {}-{}", searchOption, searchValue);
		List<Member> memberList = switch (searchOption.toLowerCase()) {
			case "univname" -> memberRepository.findAllByUniv_UnivNameContaining(searchValue);
			case "authority" -> memberRepository.findAllByAuthority(Authority.fromString(searchValue));
			default -> memberRepository.findAll();
		};
		log.warn("회원 정보 전체 검색 {}-{}, 결과 {}개 : {}",searchOption,searchValue,memberList.size(),memberList);
		return memberList;
	}
	public AdminMemberResDto getMemberById(Long id) {
		Member member = memberRepository.findByMemberId(id)
			.orElseThrow(() -> new RuntimeException("해당하는 유저가 존재하지 않습니다."));
		log.warn("id를 통해 검색 : {}", member);
		return convertMemberToDto(member);
	}
	@Transactional
	public boolean editMember(AdminMemberReqDto dto) {
		Member member = memberRepository.findByMemberId(dto.getMemberId())
			.orElseThrow(() -> new RuntimeException("해당 회원이 존재하지 않습니다."));
		if(dto.getUnivId()!=null) {
			member.setUniv(univRepository.findByUnivId(dto.getUnivId())
				.orElseThrow(() -> new RuntimeException("해당 대학이 존재하지 않습니다.")));
		}
		if(dto.getAuthority()!=null) {
			member.setAuthority(Authority.fromString(dto.getAuthority()));
		}
		if(dto.getWithdraw() != 0){
			UserBank userBank = userBankRepository.findByMember_MemberId(member.getMemberId())
				.orElseThrow(() -> new RuntimeException("금융 정보가 없습니다."));
			userBank.setWithdrawal(userBank.getWithdrawal() - dto.getWithdraw());
		}
		log.warn("수정하려는 회원 : {}", member);
		memberRepository.save(member);
		return true;
	}
	
	public List<TextBoardListResDto> getInActiveTextBoardList(String category, int page) {
		PageRequest pageable = PageRequest.of(page, 10);
		List<TextBoard> textBoardList = textBoardRepository.findByActiveAndTextCategory(Active.INACTIVE, TextCategory.fromString(category), pageable).getContent();
		log.warn("비활성 찾기 : {} - {}", textBoardList.size(), textBoardList);
		return textBoardService.boardToBoardListResDto(textBoardList);
	}
	public int getInActiveTextBoardPage(String category) {
		PageRequest pageable = PageRequest.of(0, 10);
		return textBoardRepository.findByActiveAndTextCategory(Active.INACTIVE, TextCategory.fromString(category), pageable).getTotalPages();
	}
	
	@Transactional
	public ResponseEntity<List<Boolean>> convertCsvToUniv(MultipartFile csvFile, String token) {
		List<Boolean> resultList = new ArrayList<>();
		try {
			// 인증된 사용자 확인
			Member member = memberService.convertTokenToEntity(token);
			if (member.getAuthority().equals(Authority.ROLE_ADMIN)) {
				// CSV 파일 파싱 시작
				BufferedReader reader = new BufferedReader(new InputStreamReader(csvFile.getInputStream()));
				String line;
				reader.readLine();
				while ((line = reader.readLine()) != null) {
					String[] values = line.split(","); // CSV 파일에서 쉼표로 구분된 값들
					
					if (values.length >= 3) {
						// CSV 파일에서 받은 값들로 UnivReqDto 객체 생성
						UnivReqDto univReqDto = new UnivReqDto();
						univReqDto.setUnivName(values[0]);
						univReqDto.setUnivDept(values[1]);
						univReqDto.setUnivImg(values[2]);
						
						try {
							Univ univ = new Univ();
							univ.setUnivName(univReqDto.getUnivName());
							univ.setUnivDept(univReqDto.getUnivDept());
							univ.setUnivImg(univReqDto.getUnivImg());
							boolean isSaved = univService.saveUniv(univ);
							resultList.add(isSaved);
							if (!isSaved) {
								log.error("대학 정보 저장 실패: UnivReqDto={} -> Univ={} (이유: 저장 실패)", univReqDto, univ);
							}
						} catch (Exception e) {
							log.error("대학 정보 처리 중 오류 발생: UnivReqDto={} (오류 메시지: {})", univReqDto, e.getMessage(), e);
							resultList.add(false);
						}
					}
				}
				
				long failedCount = resultList.stream().filter(success -> !success).count();
				if (failedCount > 0) {
					log.error("{}개의 대학 정보 저장 실패", failedCount);
				}
				
				return ResponseEntity.ok(resultList);
			} else {
				return ResponseEntity.status(HttpStatus.FORBIDDEN).body(null); // 권한이 없을 때
			}
		} catch (Exception e) {
			log.error("대학 정보 입력 중 전체 오류 발생: {}", e.getMessage(), e);
			return ResponseEntity.status(500).body(null); // 500 Internal Server Error
		}
	}
	
	@Transactional
	public ResponseEntity<List<Boolean>> convertCsvToTextBoard(MultipartFile csvFile, String token) {
		List<Boolean> resultList = new ArrayList<>();
		try {
			Member member = memberService.convertTokenToEntity(token);
			if (!member.getAuthority().equals(Authority.ROLE_ADMIN)) {
				log.error("권한이 없습니다.");
				return ResponseEntity.status(403).body(null); // 403 Forbidden
			}
			
			// CSV 파일이 비었는지 확인
			if (csvFile.isEmpty()) {
				log.error("업로드된 CSV 파일이 없습니다.");
				return ResponseEntity.badRequest().body(null); // 400 Bad Request
			}
			
			// CSV 파싱
			try (BufferedReader reader = new BufferedReader(new InputStreamReader(csvFile.getInputStream()))) {
				String line;
				reader.readLine();
				while ((line = reader.readLine()) != null) {
					// CSV 파일 한 줄씩 파싱 (쉼표 기준으로 split)
					String[] values = line.split(",");
					if (values.length >= 2) {
						try {
							TextBoard textBoard = new TextBoard();
							textBoard.setActive(Active.ACTIVE);
							textBoard.setTitle(values[0].trim());
							textBoard.setContent(values[1].trim());
							textBoard.setTextCategory(TextCategory.FAQ); // textCategory는 CSV 3번째 필드에 해당
							textBoardRepository.save(textBoard);
							resultList.add(true);
						} catch (Exception e) {
							log.error("CSV 파일에서 텍스트 보드 정보 처리 중 오류 발생: {} (오류 메시지: {})", line, e.getMessage(), e);
							resultList.add(false);
						}
					}
				}
				// 일부라도 실패했다면 로그를 남기고, 성공/실패 결과를 반환
				long failedCount = resultList.stream().filter(success -> !success).count();
				if (failedCount > 0) {
					log.error("{}개의 텍스트 보드 정보 저장 실패", failedCount);
				}
				return ResponseEntity.ok(resultList);
			} catch (IOException e) {
				log.error("CSV 파일 읽기 중 오류 발생: {}", e.getMessage(), e);
				return ResponseEntity.status(500).body(null); // 500 Internal Server Error
			}
			
		} catch (Exception e) {
			log.error("전체 오류 발생: {}", e.getMessage(), e);
			return ResponseEntity.status(500).body(null); // 500 Internal Server Error
		}
	}
	
	@Transactional
	public ResponseEntity<List<Boolean>> convertCsvToBank(MultipartFile csvFile, String token) {
		List<Boolean> resultList = new ArrayList<>();
		try {
			Member member = memberService.convertTokenToEntity(token);
			if (!member.getAuthority().equals(Authority.ROLE_ADMIN)) {
				log.error("권한이 없습니다.");
				return ResponseEntity.status(403).body(null); // 403 Forbidden
			}
			
			// CSV 파일이 비었는지 확인
			if (csvFile.isEmpty()) {
				log.error("업로드된 CSV 파일이 없습니다.");
				return ResponseEntity.badRequest().body(null); // 400 Bad Request
			}
			
			// CSV 파싱
			try (BufferedReader reader = new BufferedReader(new InputStreamReader(csvFile.getInputStream()))) {
				String line;
				reader.readLine();
				while ((line = reader.readLine()) != null) {
					// CSV 파일 한 줄씩 파싱 (쉼표 기준으로 split)
					String[] values = line.split(",");
					if (values.length >= 1) {
						try {
							Bank bank = new Bank();
							bank.setBankName(values[0].trim());
							bankRepository.save(bank);
							resultList.add(true);
						} catch (Exception e) {
							log.error("CSV 파일에서 은행 정보 처리 중 오류 발생: {} (오류 메시지: {})", line, e.getMessage(), e);
							resultList.add(false);
						}
					}
				}
				// 일부라도 실패했다면 로그를 남기고, 성공/실패 결과를 반환
				long failedCount = resultList.stream().filter(success -> !success).count();
				if (failedCount > 0) {
					log.error("{}개의 텍스트 보드 정보 저장 실패", failedCount);
				}
				return ResponseEntity.ok(resultList);
			} catch (IOException e) {
				log.error("CSV 파일 읽기 중 오류 발생: {}", e.getMessage(), e);
				return ResponseEntity.status(500).body(null); // 500 Internal Server Error
			}
			
		} catch (Exception e) {
			log.error("전체 오류 발생: {}", e.getMessage(), e);
			return ResponseEntity.status(500).body(null); // 500 Internal Server Error
		}
	}
	
	public PermissionResDto convertEntityToDto(Permission permission) {
		PermissionResDto dto = new PermissionResDto();
		dto.setPermissionId(permission.getPermissionId());
		dto.setUnivName(permission.getUniv().getUnivName());
		dto.setUnivDept(permission.getUniv().getUnivDept());
		dto.setMemberId(permission.getMember().getMemberId());
		dto.setName(permission.getMember().getName());
		dto.setNickname(permission.getMember().getNickName());
		dto.setAuthority(permission.getMember().getAuthority());
		dto.setActive(permission.getActive());
		dto.setPermissionUrl(permission.getPermissionUrl());
		dto.setRegDate(permission.getRegDate());
		dto.setActiveDate(permission.getActiveDate());
		return dto;
	}
	public List<PermissionResDto> convertEntityToDtoList(List<Permission> permissionList) {
		List<PermissionResDto> dtoList = new ArrayList<>();
		for (Permission permission : permissionList) {
			PermissionResDto dto = new PermissionResDto();
			dto.setActive(permission.getActive());
			dto.setUnivName(permission.getUniv().getUnivName());
			dto.setUnivDept(permission.getUniv().getUnivDept());
			dto.setNickname(permission.getMember().getNickName());
			dto.setMemberId(permission.getMember().getMemberId());
			dto.setPermissionId(permission.getPermissionId());
			dto.setAuthority(permission.getMember().getAuthority());
			dto.setRegDate(permission.getRegDate());
			dto.setActiveDate(permission.getActiveDate());
			dtoList.add(dto);
		}
		return dtoList;
	}
	
	private AdminMemberResDto convertMemberToDto(Member member) {
		AdminMemberResDto dto = new AdminMemberResDto();
		dto.setAuthority(member.getAuthority());
		dto.setId(member.getMemberId());
		dto.setName(member.getName());
		dto.setPhone(member.getPhone());
		dto.setEmail(member.getEmail());
		dto.setUnivDept(member.getUniv().getUnivDept());
		dto.setUnivName(member.getUniv().getUnivName());
		dto.setRegDate(member.getRegDate());
		dto.setBankName(member.getUserBank().getBankName());
		dto.setBankAccount(member.getUserBank().getBankAccount());
		dto.setWithdrawal(member.getUserBank().getWithdrawal());
		dto.setRevenue(member.getRevenue());
		return dto;
	}
}
