package com.eurachacha.achacha.infrastructure.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@ConfigurationProperties(prefix = "ai-service")
@RequiredArgsConstructor
@Getter
public class AIServiceProperties {
	private final String apiUrl;
}
