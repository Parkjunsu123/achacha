package com.eurachacha.achacha.infrastructure.util;

import java.security.KeyFactory;
import java.security.PrivateKey;
import java.security.spec.PKCS8EncodedKeySpec;
import java.util.Date;

import com.amazonaws.services.cloudfront.CloudFrontUrlSigner;
import com.eurachacha.achacha.web.common.exception.CustomException;
import com.eurachacha.achacha.web.common.exception.ErrorCode;

public class CloudFrontSigner {
	private final String keyPairId;
	private final byte[] privateKeyBytes;

	public CloudFrontSigner(String keyPairId, byte[] privateKeyBytes) {
		this.keyPairId = keyPairId;
		this.privateKeyBytes = privateKeyBytes;
	}

	public String generateSignedUrl(String resourcePath, Date expirationDate) {
		try {
			PKCS8EncodedKeySpec keySpec = new PKCS8EncodedKeySpec(privateKeyBytes);
			KeyFactory keyFactory = KeyFactory.getInstance("RSA");
			PrivateKey privateKey = keyFactory.generatePrivate(keySpec);

			return CloudFrontUrlSigner.getSignedURLWithCannedPolicy(
				resourcePath, keyPairId, privateKey, expirationDate);
		} catch (Exception e) {
			throw new CustomException(ErrorCode.CLOUDFRONT_URL_GENERATION_ERROR);
		}
	}
}