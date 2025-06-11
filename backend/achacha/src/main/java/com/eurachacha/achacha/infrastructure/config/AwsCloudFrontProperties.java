package com.eurachacha.achacha.infrastructure.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@ConfigurationProperties(prefix = "aws.cloudfront")
@RequiredArgsConstructor
@Getter
public class AwsCloudFrontProperties {
	private final String domain;
	private final String keypairId;
	private final String privateKey;
}
