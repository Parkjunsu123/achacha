package com.eurachacha.achacha.domain.service.ble;

import java.math.BigInteger;
import java.security.SecureRandom;

import org.springframework.stereotype.Service;

@Service
public class BleTokenDomainServiceImpl implements BleTokenDomainService {

	// 토큰 생성에 사용할 문자셋
	private static final String CHARS = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

	// 기본 토큰 크기 - 8바이트(64비트)
	private static final int TOKEN_BYTES = 8;

	// 기본 토큰 길이 - 9자리
	private static final int TOKEN_LENGTH = 7;

	// 랜덤 토큰 생성 및 Base62 인코딩
	@Override
	public String generateToken() {
		byte[] randomBytes = new byte[TOKEN_BYTES];
		new SecureRandom().nextBytes(randomBytes);

		// Base62 인코딩 구현
		BigInteger number = new BigInteger(1, randomBytes);
		StringBuilder sb = new StringBuilder();
		BigInteger base = BigInteger.valueOf(CHARS.length());

		while (number.compareTo(BigInteger.ZERO) > 0) {
			BigInteger[] divmod = number.divideAndRemainder(base);
			number = divmod[0];
			int digit = divmod[1].intValue();
			sb.append(CHARS.charAt(digit));
		}

		StringBuilder result = new StringBuilder(sb.reverse().toString());

		// 길이가 9자리보다 짧은 경우 패딩 추가
		while (result.length() < TOKEN_LENGTH) {
			result.insert(0, CHARS.charAt(0));
		}

		// 길이가 9자리보다 긴 경우 잘라내기
		if (result.length() > TOKEN_LENGTH) {
			result = new StringBuilder(result.substring(0, TOKEN_LENGTH));
		}

		return result.toString();
	}

}
