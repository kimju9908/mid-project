package kh.BackendCapstone.controller;

import kh.BackendCapstone.dto.request.RedactionApplyReqDto;
import kh.BackendCapstone.dto.response.RedactionApplyResDto;
import kh.BackendCapstone.dto.response.RedactionJobResDto;
import kh.BackendCapstone.service.PdfRedactionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequiredArgsConstructor
@RequestMapping("/flask/redaction")
@CrossOrigin(origins = "http://localhost:3000")
@Slf4j
public class PdfRedactionController {
    private final PdfRedactionService pdfRedactionService;

    @PostMapping("/jobs")
    public ResponseEntity<RedactionJobResDto> createJob(@RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(pdfRedactionService.createJob(file));
    }

    @GetMapping("/jobs/{jobId}")
    public ResponseEntity<RedactionJobResDto> getJob(@PathVariable String jobId) {
        return ResponseEntity.ok(pdfRedactionService.getJob(jobId));
    }

    @PostMapping("/jobs/{jobId}/apply")
    public ResponseEntity<RedactionApplyResDto> apply(@PathVariable String jobId, @RequestBody RedactionApplyReqDto reqDto) {
        return ResponseEntity.ok(pdfRedactionService.applyRedaction(jobId, reqDto));
    }
}
