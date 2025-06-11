package com.eurachacha.achacha.application.port.output.ocr;

import org.springframework.web.multipart.MultipartFile;

public interface OcrPort {
	String extractRawOcrResult(MultipartFile image);
}
