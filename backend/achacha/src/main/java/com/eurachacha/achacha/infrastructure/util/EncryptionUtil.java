package com.eurachacha.achacha.infrastructure.util;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Arrays;
import java.util.Base64;

import javax.crypto.Cipher;
import javax.crypto.spec.SecretKeySpec;

import org.springframework.stereotype.Component;

import com.eurachacha.achacha.infrastructure.config.EncryptionProperties;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class EncryptionUtil {
	private final EncryptionProperties encryptionProperties;

	private SecretKeySpec secretKey;

	@PostConstruct
	public void init() {
		try {
			byte[] key = encryptionProperties.getKey().getBytes(StandardCharsets.UTF_8);
			MessageDigest sha = MessageDigest.getInstance("SHA-256");
			key = sha.digest(key);
			key = Arrays.copyOf(key, 32); // AES-256 사용
			secretKey = new SecretKeySpec(key, "AES");
		} catch (Exception e) {
			throw new RuntimeException("비밀키 초기화 실패", e);
		}
	}

	public String encrypt(String data) {
		try {
			Cipher cipher = Cipher.getInstance("AES/ECB/PKCS5Padding");
			cipher.init(Cipher.ENCRYPT_MODE, secretKey);
			byte[] encryptedBytes = cipher.doFinal(data.getBytes(StandardCharsets.UTF_8));
			return Base64.getEncoder().encodeToString(encryptedBytes);
		} catch (Exception e) {
			throw new RuntimeException("암호화 실패", e);
		}
	}

	public String decrypt(String encryptedData) {
		try {
			Cipher cipher = Cipher.getInstance("AES/ECB/PKCS5Padding");
			cipher.init(Cipher.DECRYPT_MODE, secretKey);
			byte[] decodedBytes = Base64.getDecoder().decode(encryptedData);
			byte[] decryptedBytes = cipher.doFinal(decodedBytes);
			return new String(decryptedBytes, StandardCharsets.UTF_8);
		} catch (Exception e) {
			throw new RuntimeException("복호화 실패", e);
		}
	}
}
