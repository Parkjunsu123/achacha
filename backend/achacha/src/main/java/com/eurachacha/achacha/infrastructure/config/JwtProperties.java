package com.eurachacha.achacha.infrastructure.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@ConfigurationProperties(prefix = "jwt")
@RequiredArgsConstructor
@Getter
public class JwtProperties {
	private final String secret;
	private final long accessTokenExpirySeconds;
	private final long refreshTokenExpirySeconds;
}