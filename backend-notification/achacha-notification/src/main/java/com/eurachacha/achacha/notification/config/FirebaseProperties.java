package com.eurachacha.achacha.notification.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@ConfigurationProperties(prefix = "firebase")
@RequiredArgsConstructor
@Getter
public class FirebaseProperties {
	private final String path;
}
