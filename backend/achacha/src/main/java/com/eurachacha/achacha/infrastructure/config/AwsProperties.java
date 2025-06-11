package com.eurachacha.achacha.infrastructure.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@ConfigurationProperties(prefix = "aws")
@RequiredArgsConstructor
@Getter
public class AwsProperties {
	private final Credentials credentials;
	private final String region;

	@Getter
	@RequiredArgsConstructor
	public static class Credentials {
		private final String accessKey;
		private final String secretKey;
	}
}