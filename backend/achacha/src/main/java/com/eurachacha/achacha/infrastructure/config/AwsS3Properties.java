package com.eurachacha.achacha.infrastructure.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@ConfigurationProperties(prefix = "aws.s3")
@RequiredArgsConstructor
@Getter
public class AwsS3Properties {
	private final String bucket;
}
