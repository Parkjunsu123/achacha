package com.eurachacha.achacha.infrastructure.adapter.output.ai;

import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestTemplate;

import com.eurachacha.achacha.application.port.output.ai.AIServicePort;
import com.eurachacha.achacha.application.port.output.ai.dto.response.GifticonMetadataDto;
import com.eurachacha.achacha.infrastructure.config.AIServiceProperties;
import com.eurachacha.achacha.web.common.exception.CustomException;
import com.eurachacha.achacha.web.common.exception.ErrorCode;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
@RequiredArgsConstructor
public class AIServiceAdapter implements AIServicePort {
	private static final String EXTRACT_GIFTICON_URL_PATH = "/api/extract-gifticon";

	private final AIServiceProperties properties;
	private final RestTemplate restTemplate;
	private final ObjectMapper objectMapper;

	@Override
	public GifticonMetadataDto extractGifticonInfo(String ocrResult, String gifticonType) {
		try {
			log.info("AI 서비스 처리 시작 - 기프티콘 타입: {}", gifticonType);

			// 1. HTTP 헤더 설정
			HttpHeaders headers = new HttpHeaders();
			headers.setContentType(MediaType.APPLICATION_JSON);

			// 2. 요청 본문 구성 (Jackson 사용)
			ObjectNode requestNode = objectMapper.createObjectNode();
			requestNode.put("ocrResult", ocrResult);
			requestNode.put("gifticonType", gifticonType);

			String requestBody = objectMapper.writeValueAsString(requestNode);
			log.debug("AI 서비스 요청 본문: {}", requestBody);

			// 3. HTTP 요청 객체 생성
			HttpEntity<String> requestEntity = new HttpEntity<>(requestBody, headers);

			// 4. AI 서비스 서버 호출
			String url = properties.getApiUrl() + EXTRACT_GIFTICON_URL_PATH;
			ResponseEntity<String> response;

			try {
				response = restTemplate.exchange(
					url,
					HttpMethod.POST,
					requestEntity,
					String.class
				);
			} catch (ResourceAccessException e) {
				log.error("AI 서비스 연결 실패: {}", e.getMessage());
				throw new CustomException(ErrorCode.AI_SERVICE_CONNECTION_ERROR);
			} catch (HttpClientErrorException | HttpServerErrorException e) {
				log.error("AI 서비스 오류 응답: {}, 상태 코드: {}", e.getMessage(), e.getStatusCode());
				throw new CustomException(ErrorCode.AI_SERVICE_RESPONSE_ERROR);
			}

			// 5. 응답 로깅 및 검증
			String responseBody = response.getBody();
			log.info("AI 서비스 응답: {}", responseBody);

			if (responseBody == null || responseBody.trim().isEmpty()) {
				log.error("AI 서비스 응답이 비어있습니다.");
				throw new CustomException(ErrorCode.AI_SERVICE_EMPTY_RESPONSE);
			}

			// 6. 응답 파싱 및 DTO 변환
			return parseResponse(responseBody);

		} catch (CustomException e) {
			// 이미 CustomException으로 래핑된 예외는 그대로 전파
			throw e;
		} catch (Exception e) {
			log.error("AI 서비스 처리 실패", e);
			throw new CustomException(ErrorCode.AI_SERVICE_RESPONSE_ERROR);
		}
	}

	private GifticonMetadataDto parseResponse(String responseBody) {
		try {
			JsonNode rootNode = objectMapper.readTree(responseBody);

			return GifticonMetadataDto.builder()
				.gifticonBarcodeNumber(getNullableTextValue(rootNode, "gifticonBarcodeNumber"))
				.brandName(getNullableTextValue(rootNode, "brandName"))
				.gifticonName(getNullableTextValue(rootNode, "gifticonName"))
				.gifticonExpiryDate(getNullableTextValue(rootNode, "gifticonExpiryDate"))
				.gifticonOriginalAmount(getIntegerValue(rootNode, "gifticonOriginalAmount"))
				.build();
		} catch (Exception e) {
			log.error("AI 서비스 응답 파싱 실패: {}", e.getMessage());
			throw new CustomException(ErrorCode.AI_SERVICE_PARSE_ERROR);
		}
	}

	private String getNullableTextValue(JsonNode node, String fieldName) {
		JsonNode fieldNode = node.get(fieldName);
		return (fieldNode != null && !fieldNode.isNull()) ? fieldNode.asText() : null;
	}

	private Integer getIntegerValue(JsonNode node, String fieldName) {
		JsonNode fieldNode = node.get(fieldName);
		return (fieldNode != null && !fieldNode.isNull()) ? fieldNode.asInt() : null;
	}
}
