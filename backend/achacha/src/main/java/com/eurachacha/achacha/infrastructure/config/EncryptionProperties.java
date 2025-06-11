package com.eurachacha.achacha.infrastructure.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@ConfigurationProperties(prefix = "encryption")
@RequiredArgsConstructor
@Getter
public class EncryptionProperties {
	private final String key;

}
