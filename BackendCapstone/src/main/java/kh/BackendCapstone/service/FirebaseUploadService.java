package kh.BackendCapstone.service;

import com.google.cloud.storage.BlobId;
import com.google.cloud.storage.BlobInfo;
import com.google.cloud.storage.Storage;
import com.google.cloud.storage.StorageOptions;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import kh.BackendCapstone.entity.Member;
import kh.BackendCapstone.repository.PermissionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import javax.transaction.Transactional;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.UUID;

@Service
@Slf4j
@RequiredArgsConstructor
public class FirebaseUploadService {

	private final RestTemplate restTemplate;
	private final MemberService memberService;
	private final PermissionRepository permissionRepository;
	private final ObjectMapper objectMapper;
	
	/*
    fileUpload 사용 방법 : Flask 부분을 다운받고 구글 드라이브의 firebase 파일 안에  ipsi-firebase-adminsdk.json을 app.py가 있는 디렉토리에 놓는다.
    FirebaseUploadService 에서 handleFileUpload를 사용할 컨트롤러에서 부른다.
    file은 프론트에서 파일을 받아와서 넣어주면 되고(리엑트에서 example/FileUploaderExample 부분을 보면 됩니다.), folderPath는 파이어 베이스 안에 저장될 경로 기본적으로 firebase/ 폴더안에서 시작
    spring 과 flask를 킨다.
    실행한다.
    */
	public String handleFileUpload(MultipartFile file, String folderPath) {
		// Flask API로 요청 보내기
		String flaskUrl = "http://localhost:5000/spring/upload/firebase";

		// 파일을 포함한 멀티파트 데이터 전송을 위한 HttpHeaders 설정
		HttpHeaders headers = new HttpHeaders();

		// Multipart 파일과 폴더 경로를 전송하는 방식으로 변경
		MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
		body.add("file", file.getResource());
		body.add("folderPath", "firebase/" + folderPath);
		body.add("fileName", "");

		// HttpEntity로 요청 본문 만들기
		HttpEntity<MultiValueMap<String, Object>> entity = new HttpEntity<>(body, headers);

		try {
			// Flask API로 POST 요청 보내기
			ResponseEntity<String> response = restTemplate.exchange(flaskUrl, HttpMethod.POST, entity, String.class);
			log.warn("플라스크 통신으로 인한 결과 : {}",response);
			// Flask 서버의 응답 처리
			return response.getBody();
		} catch (Exception e) {
			log.error("Flask 서버와의 통신 중 오류 발생: ", e);
			return "파일 업로드 중 오류가 발생했습니다.";
		}
	}


@Transactional
public String uploadPermissionFile(MultipartFile file, String folderPath) {
	try {
		// 1) 토큰으로 멤버 조회
		Member member = memberService.convertTokenToEntity();
		// 2) 동적 폴더 경로 생성
		String finalFolderPath = "firebase/" + folderPath + "/" + member.getMemberId();
		// 3) 파일명 생성
		int permissionSize = permissionRepository.countAllByMember(member);
		String fileName = member.getMemberId() + "_" + permissionSize;
		// 4) Flask API URL
		String flaskUrl = "http://localhost:5000/spring/upload/firebase";
		// 5) 멀티파트 데이터 생성
		HttpHeaders headers = new HttpHeaders();
		headers.setContentType(MediaType.MULTIPART_FORM_DATA);

		MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();

		// 핵심 수정: InputStreamResource -> ByteArrayResource
		byte[] bytes = file.getBytes();
		ByteArrayResource fileResource = new ByteArrayResource(bytes) {
			@Override
			public String getFilename() {
				return fileName; // Flask에서 사용할 파일명
			}
		};
		body.add("file", fileResource);
		body.add("folderPath", finalFolderPath);
		body.add("fileName", fileName);

		HttpEntity<MultiValueMap<String, Object>> entity = new HttpEntity<>(body, headers);
		// 6) Flask로 전송
		ResponseEntity<String> response = restTemplate.exchange(
				flaskUrl,
				HttpMethod.POST,
				entity,
				String.class
		);
		log.warn("Flask 응답 결과 : {}", response);

		return response.getBody();

	} catch (Exception e) {
		log.error("파일 업로드 중 오류 발생: ", e);
		return "파일 업로드 중 오류가 발생했습니다.";
	}
}

	public String uploadBytesToFirebase(byte[] fileBytes, String fileName, String folderPath) {
		try {
			String flaskUrl = "http://localhost:5000/spring/upload/firebase";
			String finalFolderPath = "firebase/" + folderPath;

			HttpHeaders headers = new HttpHeaders();
			headers.setContentType(MediaType.MULTIPART_FORM_DATA);

			ByteArrayResource fileResource = new ByteArrayResource(fileBytes) {
				@Override
				public String getFilename() {
					return fileName;
				}
			};

			MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
			body.add("file", fileResource);
			body.add("folderPath", finalFolderPath);
			body.add("fileName", fileName);

			HttpEntity<MultiValueMap<String, Object>> entity = new HttpEntity<>(body, headers);
			ResponseEntity<String> response = restTemplate.exchange(flaskUrl, HttpMethod.POST, entity, String.class);
			log.warn("바이트 파일 업로드 결과 : {}", response);
			return extractUrlFromUploadResponse(response.getBody());
		} catch (Exception e) {
			log.error("바이트 파일 업로드 중 오류 발생: ", e);
			throw new RuntimeException("Firebase 업로드 중 오류가 발생했습니다.", e);
		}
	}
	public String uploadPermissionMaskedPdf(byte[] fileBytes, String fileName) {
		Member member = memberService.convertTokenToEntity();
		if (member == null || member.getMemberId() == null) {
			throw new RuntimeException("회원 정보를 확인할 수 없습니다.");
		}
		String permissionFolderPath = "permission/" + member.getMemberId();
		return uploadBytesToFirebase(fileBytes, fileName, permissionFolderPath);
	}

	private String extractUrlFromUploadResponse(String responseBody) {
		if (responseBody == null || responseBody.isBlank()) {
			throw new RuntimeException("Firebase 업로드 응답이 비어 있습니다.");
		}
		try {
			JsonNode root = objectMapper.readTree(responseBody);
			String url = root.path("url").asText("");
			if (url.isBlank()) {
				throw new RuntimeException("Firebase 업로드 응답에 url 필드가 없습니다.");
			}
			return url;
		} catch (Exception e) {
			log.error("Firebase 업로드 응답 파싱 실패 : {}", responseBody, e);
			throw new RuntimeException("Firebase 업로드 응답 파싱 실패", e);
		}
	}

	private String sanitizeFolderPath(String folderPath) {
		if (!StringUtils.hasText(folderPath)) {
			return "benchmark/default";
		}
		String sanitized = folderPath.replace("\\", "/").trim();
		sanitized = sanitized.replaceAll("\\.\\.", "");
		sanitized = sanitized.replaceAll("^/+", "");
		sanitized = sanitized.replaceAll("/+$", "");
		return sanitized.isBlank() ? "benchmark/default" : sanitized;
	}

	private String resolveFileName(MultipartFile file, String fileName) {
		String candidate = StringUtils.hasText(fileName) ? fileName : file.getOriginalFilename();
		if (!StringUtils.hasText(candidate)) {
			return UUID.randomUUID() + ".bin";
		}

		String cleaned = StringUtils.getFilename(candidate);
		if (!StringUtils.hasText(cleaned)) {
			return UUID.randomUUID() + ".bin";
		}
		return cleaned.replaceAll("\\s+", "_");
	}

	private String resolveBucketName() {
		String bucketName = System.getenv("FIREBASE_STORAGE_BUCKET");
		if (StringUtils.hasText(bucketName)) {
			return bucketName;
		}

		String projectId = System.getenv("GOOGLE_CLOUD_PROJECT");
		if (!StringUtils.hasText(projectId)) {
			projectId = StorageOptions.getDefaultInstance().getProjectId();
		}
		if (!StringUtils.hasText(projectId)) {
			throw new RuntimeException("FIREBASE_STORAGE_BUCKET 또는 GOOGLE_CLOUD_PROJECT 환경변수가 필요합니다.");
		}
		return projectId + ".appspot.com";
	}

	private String buildPublicUrl(String bucketName, String objectPath) {
		String encodedPath = URLEncoder.encode(objectPath, StandardCharsets.UTF_8)
				.replace("+", "%20");
		return String.format(
				"https://firebasestorage.googleapis.com/v0/b/%s/o/%s?alt=media",
				bucketName,
				encodedPath
		);
	}



}
