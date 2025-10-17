package kh.BackendCapstone.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.nimbusds.jose.shaded.json.JSONObject;
import kh.BackendCapstone.constant.Active;
import kh.BackendCapstone.constant.Authority;
import kh.BackendCapstone.constant.TextCategory;
import kh.BackendCapstone.dto.ApiResponse;
import kh.BackendCapstone.dto.request.AiReqDto;
import kh.BackendCapstone.dto.request.TextBoardReqDto;
import kh.BackendCapstone.dto.request.UnivReqDto;
import kh.BackendCapstone.dto.response.AiResDto;
import kh.BackendCapstone.entity.*;
import kh.BackendCapstone.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.*;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import javax.transaction.Transactional;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;

@RequiredArgsConstructor @Service @Slf4j
public class FlaskService {
	private final UnivRepository univRepository;
	private final UnivService univService;
	private final MemberService memberService;
	private final RestTemplate restTemplate;
	private final TextBoardRepository textBoardRepository;
	private final PsWriteRepository psWriteRepository;
	private final PayRepository payRepository;
	private final PsContentsRepository psContentsRepository;
	private final BankRepository bankRepository;
	
	@Transactional
	public ResponseEntity<List<Boolean>> convertCsvToUniv(MultipartFile file) {
		List<Boolean> resultList = new ArrayList<>();
		
		try (BufferedReader reader = new BufferedReader(new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8))) {
			List<Univ> univList = new ArrayList<>();
			String line;
			boolean isFirstLine = true;
			
			while ((line = reader.readLine()) != null) {
				if (isFirstLine) { // 첫 번째 줄은 헤더이므로 스킵
					isFirstLine = false;
					continue;
				}
				
				String[] data = line.split(",");
				if (data.length < 3) {
					log.error("잘못된 CSV 형식: {}", line);
					resultList.add(false);
					continue;
				}
				
				Univ univ = new Univ();
				univ.setUnivName(data[0].trim());
				univ.setUnivDept(data[1].trim());
				univ.setUnivImg(data[2].trim());
				
				univList.add(univ);
			}
			
			// 저장 처리
			for (Univ univ : univList) {
				try {
					univRepository.save(univ);
					resultList.add(true);
				} catch (Exception e) {
					log.error("대학 정보 저장 실패: {}", univ, e);
					resultList.add(false);
				}
			}
			
			return ResponseEntity.ok(resultList);
			
		} catch (Exception e) {
			log.error("CSV 파일 처리 중 오류 발생: {}", e.getMessage(), e);
			return ResponseEntity.status(500).body(null);
		}
	}
	
	
	@Transactional
	public ResponseEntity<List<Boolean>> convertCsvToTextBoard(MultipartFile file) {
		List<Boolean> resultList = new ArrayList<>();
		
		try (BufferedReader reader = new BufferedReader(new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8))) {
			List<TextBoard> textBoardList = new ArrayList<>();
			String line;
			boolean isFirstLine = true;
			
			while ((line = reader.readLine()) != null) {
				if (isFirstLine) { // 첫 번째 줄은 헤더이므로 스킵
					isFirstLine = false;
					continue;
				}
				
				String[] data = line.split(",");
				if (data.length < 2) {
					log.error("잘못된 CSV 형식: {}", line);
					resultList.add(false);
					continue;
				}
				
				TextBoard textBoard = new TextBoard();
				textBoard.setActive(Active.ACTIVE);
				textBoard.setTitle(data[0].trim());
				textBoard.setContent(data[1].trim());
				textBoard.setTextCategory(TextCategory.FAQ);
				log.warn("해당 textBoard: {}", textBoard);
				textBoardList.add(textBoard);
			}
			
			// 저장 처리
			for (TextBoard textBoard : textBoardList) {
				try {
					textBoardRepository.save(textBoard);
					resultList.add(true);
				} catch (Exception e) {
					log.error("게시글 저장 실패: {}", textBoard, e);
					resultList.add(false);
				}
			}
			
			return ResponseEntity.ok(resultList);
			
		} catch (Exception e) {
			log.error("CSV 파일 처리 중 오류 발생: {}", e.getMessage(), e);
			return ResponseEntity.status(500).body(null);
		}
	}
	
	@Transactional
	public ResponseEntity<List<Boolean>> convertCsvToBank(MultipartFile file) {
		List<Boolean> resultList = new ArrayList<>();
		
		try (BufferedReader reader = new BufferedReader(new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8))) {
			List<Bank> bankList = new ArrayList<>();
			String line;
			boolean isFirstLine = true;
			
			while ((line = reader.readLine()) != null) {
				if (isFirstLine) { // 첫 번째 줄은 헤더이므로 스킵
					isFirstLine = false;
					continue;
				}
				
				String[] data = line.split(",");
				if (data.length < 1) {
					log.error("잘못된 CSV 형식: {}", line);
					resultList.add(false);
					continue;
				}
				
				Bank bank = new Bank();
				bank.setBankName(data[0].trim());
				
				bankList.add(bank);
			}
			
			// 저장 처리
			for (Bank bank : bankList) {
				try {
					bankRepository.save(bank);
					resultList.add(true);
				} catch (Exception e) {
					log.error("은행 정보 저장 실패: {}", bank, e);
					resultList.add(false);
				}
			}
			
			return ResponseEntity.ok(resultList);
			
		} catch (Exception e) {
			log.error("CSV 파일 처리 중 오류 발생: {}", e.getMessage(), e);
			return ResponseEntity.status(500).body(null);
		}
	}
	
	@Transactional
	public boolean postAi(AiReqDto aiReqDto, String token) {
		try {
			// 1. 회원 정보 가져오기
			Member member = memberService.convertTokenToEntity(token);
			
			// 2. 자소서 정보 가져오기
			PsContents psContents = psContentsRepository.findByPsContentsId(aiReqDto.getPsContentsId())
				.orElseThrow(() -> new RuntimeException("해당 항목이 없습니다."));
			
			// 3. 결제 정보 가져오기
			Pay pay = payRepository.findById(aiReqDto.getPayId())
				.orElseThrow(() -> new RuntimeException("해당 결제 내역이 존재하지 않습니다."));
			
			// 4. 결제자와 작성자가 동일한지 확인
			if (!(member.equals(psContents.getPsWrite().getMember()) && member.equals(pay.getMember()))) {
				return false;
			}
			
			// 5. Flask API URL 설정
			String flaskUrl = "https://0711-39-117-57-245.ngrok-free.app/spring/ai/ps";
			
			// 6. HTTP 헤더 및 바디 설정
			HttpHeaders headers = new HttpHeaders();
			headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);  // Content-Type 설정 (필요한 경우)
			
			MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
			body.add("file_url", pay.getFileBoard().getMainFile()); // 전달할 데이터 추가
			body.add("request", aiReqDto.getPrompt());
			HttpEntity<MultiValueMap<String, Object>> entity = new HttpEntity<>(body, headers);
			
			// 7. Flask API로 POST 요청 보내기
			ResponseEntity<String> responseEntity = restTemplate.exchange(
				flaskUrl,
				HttpMethod.POST,
				entity,
				String.class
			);
			
			// 8. Flask에서 반환된 응답 받기
			String response = responseEntity.getBody();
			log.warn("플라스크 통신으로 인한 결과 : {}", response);
			
			psContents.setPsContent(response);
			psContentsRepository.save(psContents);
			
			return true;
			
		} catch (Exception e) {
			log.error("ai 사용중 오류 발생: {}", e.getMessage());
			return false;
		}
	}
	
	
	
	@Transactional
	public AiResDto getMessage(String message) {
		String URL = "https://0711-39-117-57-245.ngrok-free.app/generate";
		
		List<TextBoard> textBoardList = textBoardRepository.findByTextCategory(TextCategory.FAQ);
		
		HttpHeaders headers = new HttpHeaders();
		headers.setContentType(MediaType.APPLICATION_JSON);
		headers.add("Content-Type", "application/json; charset=UTF-8");
		
		// JSON 변환
		Map<String, Object> body = new HashMap<>();
		body.put("prompt", message + "를 만족시키는 정보를 여기에서 찾아줘" + textBoardList);
		body.put("stream", false);
		body.put("model", "Llama3.2-Korean:latest");
		
		HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);
		
		ResponseEntity<String> responseEntity = restTemplate.exchange(
			URL,
			HttpMethod.POST,
			entity,
			String.class
		);
		
		String responseBody = responseEntity.getBody();
		
		try {
			// JSON 문자열을 ApiResponse 객체로 변환
			ObjectMapper objectMapper = new ObjectMapper();
			ApiResponse apiResponse = objectMapper.readValue(responseBody, ApiResponse.class);
			
			// "response" 필드를 리턴
			
			return new AiResDto(apiResponse.getResponse(), false, LocalDateTime.now());
		} catch (Exception e) {
			log.error("Error parsing response body", e);
			return new AiResDto("사용중 에러가 생겼습니다.", false, LocalDateTime.now());
		}
	
	}
	
	
	
	
	
	
	
}






//@Async
//	@Transactional
//	public CompletableFuture<String> csvUploader(String token) {
//		// Member 객체를 가져오고, 권한을 체크
//		Member member = memberService.convertTokenToEntity(token);
//		if (member.getAuthority().equals(Authority.ROLE_ADMIN)) {
//			String flaskUrl = "http://localhost:5000/spring/upload/csv";
//			HttpHeaders headers = new HttpHeaders();
//			headers.setContentType(MediaType.APPLICATION_JSON); // 적절한 Content-Type 설정 (필요시)
//
//			// 본문 없이 POST 요청 보내기
//			HttpEntity<String> entity = new HttpEntity<>(headers);
//
//			// 비동기 방식으로 Flask 서버와의 통신 처리
//			return CompletableFuture.supplyAsync(() -> {
//				try {
//					// Flask API로 POST 요청 보내기 (본문 없이)
//					ResponseEntity<String> response = restTemplate.exchange(flaskUrl, HttpMethod.POST, entity, String.class);
//					log.warn("플라스크 통신으로 인한 결과 : {}", response);
//					// Flask 서버의 응답 처리
//					return response.getBody();
//				} catch (Exception e) {
//					log.error("Flask 서버와의 통신 중 오류 발생: ", e);
//					return "파일 업로드 중 오류가 발생했습니다.";
//				}
//			});
//		} else {
//			// 권한이 없는 경우 적절한 메시지 반환
//			return CompletableFuture.completedFuture("권한이 없습니다.");
//		}
//	}
