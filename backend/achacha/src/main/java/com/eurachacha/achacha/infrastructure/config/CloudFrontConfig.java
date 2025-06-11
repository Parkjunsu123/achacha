package com.eurachacha.achacha.infrastructure.config;

import java.util.Base64;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.eurachacha.achacha.infrastructure.util.CloudFrontSigner;
import com.eurachacha.achacha.web.common.exception.CustomException;
import com.eurachacha.achacha.web.common.exception.ErrorCode;

import lombok.RequiredArgsConstructor;

@Configuration
@RequiredArgsConstructor
public class CloudFrontConfig {

	private final AwsCloudFrontProperties cloudFrontProperties;

	@Bean
	public CloudFrontSigner cloudFrontSigner() {
		if (cloudFrontProperties.getPrivateKey() == null || cloudFrontProperties.getPrivateKey().isEmpty()) {
			throw new CustomException(ErrorCode.CLOUDFRONT_PRIVATE_KEY_ERROR);
		}

		try {
			// Base64 디코딩 후, DER 형식으로 SignedURL 생성
			byte[] privateKeyBytes = Base64.getDecoder().decode(cloudFrontProperties.getPrivateKey());
			return new CloudFrontSigner(
				cloudFrontProperties.getKeypairId(),
				privateKeyBytes
			);
		} catch (Exception e) {
			throw new CustomException(ErrorCode.CLOUDFRONT_PRIVATE_KEY_ERROR);
		}
	}
}