package com.eurachacha.achacha.infrastructure.adapter.output.ocr;

import java.io.IOException;
import java.util.UUID;

import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import com.eurachacha.achacha.application.port.output.ocr.OcrPort;
import com.eurachacha.achacha.infrastructure.config.ClovaOcrProperties;
import com.eurachacha.achacha.web.common.exception.CustomException;
import com.eurachacha.achacha.web.common.exception.ErrorCode;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
@RequiredArgsConstructor
public class ClovaOcrAdapter implements OcrPort {

	private final ClovaOcrProperties properties;
	private final RestTemplate restTemplate;
	private final ObjectMapper objectMapper;

	@Override
	public String extractRawOcrResult(MultipartFile image) {
		try {
			// 1. HTTP 헤더 설정
			HttpHeaders headers = new HttpHeaders();
			headers.setContentType(MediaType.MULTIPART_FORM_DATA);
			headers.set("X-OCR-SECRET", properties.getSecretKey());

			// 2. 요청 메시지 생성 (Jackson 사용)
			String message = createRequestMessage(image.getOriginalFilename());

			// 3. MultipartFile을 MultiValueMap으로 구성
			MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
			body.add("message", message);

			try {
				body.add("file", createFileResource(image));
			} catch (IOException e) {
				log.error("이미지 파일 처리 중 오류 발생", e);
				throw new CustomException(ErrorCode.OCR_FILE_PROCESSING_ERROR);
			}

			// 4. HTTP 요청 객체 생성
			HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);

			// 5. API 호출 및 결과 반환
			ResponseEntity<String> response;
			try {
				response = restTemplate.exchange(
					properties.getApiUrl(),
					HttpMethod.POST,
					requestEntity,
					String.class
				);
			} catch (ResourceAccessException e) {
				log.error("OCR 서비스 연결 실패: {}", e.getMessage());
				throw new CustomException(ErrorCode.OCR_SERVICE_CONNECTION_ERROR);
			} catch (HttpClientErrorException | HttpServerErrorException e) {
				log.error("OCR 서비스 오류 응답: {}, 상태 코드: {}", e.getMessage(), e.getStatusCode());
				throw new CustomException(ErrorCode.OCR_SERVICE_RESPONSE_ERROR);
			}

			// OCR 결과 로깅
			String ocrResult = response.getBody();
			if (ocrResult == null || ocrResult.trim().isEmpty()) {
				log.error("OCR 서비스가 빈 응답을 반환했습니다.");
				throw new CustomException(ErrorCode.OCR_SERVICE_RESPONSE_ERROR);
			}

			// OCR 결과 로깅
			try {
				JsonNode jsonNode = objectMapper.readTree(ocrResult);
				log.info("OCR 결과: {}", objectMapper.writerWithDefaultPrettyPrinter().writeValueAsString(jsonNode));
			} catch (Exception e) {
				log.warn("OCR 결과 출력 실패", e);
				// 출력만을 위한 예외이므로 CustomException 발생시키지 않음
			}

			return ocrResult;
		} catch (CustomException e) {
			// 이미 CustomException으로 래핑된 예외는 그대로 전파
			throw e;
		} catch (Exception e) {
			log.error("OCR 처리 중 예상치 못한 오류 발생", e);
			throw new CustomException(ErrorCode.OCR_SERVICE_RESPONSE_ERROR);
		}
	}

	private String createRequestMessage(String filename) {
		String fileFormat = getFileFormat(filename);
		String requestId = UUID.randomUUID().toString();
		long timestamp = System.currentTimeMillis();

		try {
			// Jackson을 사용하여 JSON 객체 생성
			ObjectNode messageNode = objectMapper.createObjectNode();
			messageNode.put("version", "V2");
			messageNode.put("requestId", requestId);
			messageNode.put("timestamp", timestamp);
			messageNode.put("lang", "ko");

			ArrayNode imagesArray = messageNode.putArray("images");
			ObjectNode imageNode = imagesArray.addObject();
			imageNode.put("format", fileFormat);
			imageNode.put("name", filename);

			messageNode.put("enableTableDetection", false);

			return objectMapper.writeValueAsString(messageNode);
		} catch (JsonProcessingException e) {
			log.error("JSON 변환 실패", e);
			throw new CustomException(ErrorCode.OCR_JSON_PROCESSING_ERROR);
		}
	}

	private String getFileFormat(String filename) {
		int lastDotIndex = filename.lastIndexOf('.');
		if (lastDotIndex > 0) {
			return filename.substring(lastDotIndex + 1).toLowerCase();
		}
		return "jpg";
	}

	private ByteArrayResource createFileResource(final MultipartFile file) throws IOException {
		return new ByteArrayResource(file.getBytes()) {
			@Override
			public String getFilename() {
				return file.getOriginalFilename();
			}
		};
	}
}
