package com.eurachacha.achacha.infrastructure.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.amazonaws.auth.AWSCredentials;
import com.amazonaws.auth.AWSStaticCredentialsProvider;
import com.amazonaws.auth.BasicAWSCredentials;
import com.amazonaws.services.cloudfront.AmazonCloudFront;
import com.amazonaws.services.cloudfront.AmazonCloudFrontClientBuilder;
import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.AmazonS3ClientBuilder;

import lombok.RequiredArgsConstructor;

@Configuration
@RequiredArgsConstructor
public class AwsConfig {

	private final AwsProperties awsProperties;

	@Bean
	public AmazonS3 amazonS3() {
		AWSCredentials credentials = new BasicAWSCredentials(
			awsProperties.getCredentials().getAccessKey(),
			awsProperties.getCredentials().getSecretKey()
		);
		return AmazonS3ClientBuilder
			.standard()
			.withCredentials(new AWSStaticCredentialsProvider(credentials))
			.withRegion(awsProperties.getRegion())
			.build();
	}

	@Bean
	public AmazonCloudFront amazonCloudFront() {
		AWSCredentials credentials = new BasicAWSCredentials(
			awsProperties.getCredentials().getAccessKey(),
			awsProperties.getCredentials().getSecretKey()
		);
		return AmazonCloudFrontClientBuilder
			.standard()
			.withCredentials(new AWSStaticCredentialsProvider(credentials))
			.withRegion(awsProperties.getRegion())
			.build();
	}
}