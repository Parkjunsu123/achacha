package com.eurachacha.achacha.infrastructure.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@ConfigurationProperties(prefix = "clova.ocr")
@RequiredArgsConstructor
@Getter
public class ClovaOcrProperties {
	private final String apiUrl;
	private final String secretKey;
}
