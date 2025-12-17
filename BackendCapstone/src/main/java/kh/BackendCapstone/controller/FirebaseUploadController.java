package kh.BackendCapstone.controller;

import kh.BackendCapstone.service.FirebaseUploadService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
@RequestMapping("/firebase")
@Slf4j
public class FirebaseUploadController {
	private final FirebaseUploadService firebaseUploadService;

	@PostMapping("/upload")
	public String uploadTest(
			@RequestParam("file") MultipartFile file,
			@RequestParam("folderPath") String folderPath
	) {
		// "Bearer " 제거 후 실제 토큰만 추출


		return firebaseUploadService.uploadPermissionFile(file, folderPath);
	}

}
