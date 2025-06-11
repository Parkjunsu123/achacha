package com.eurachacha.achacha.infrastructure.adapter.output.auth;

import java.nio.charset.StandardCharsets;
import java.util.Date;

import javax.crypto.SecretKey;

import org.springframework.stereotype.Component;

import com.eurachacha.achacha.application.port.output.auth.TokenServicePort;
import com.eurachacha.achacha.infrastructure.config.JwtProperties;
import com.eurachacha.achacha.web.common.exception.CustomException;
import com.eurachacha.achacha.web.common.exception.ErrorCode;

import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@RequiredArgsConstructor
@Slf4j
public class JwtTokenServiceAdapter implements TokenServicePort {

	private final JwtProperties jwtProperties;
	private SecretKey key;

	// 초기화 메서드
	private void initializeKey() {
		if (key == null) {
			key = Keys.hmacShaKeyFor(jwtProperties.getSecret().getBytes(StandardCharsets.UTF_8));
		}
	}

	@Override
	public String createAccessToken(Integer userId) {
		initializeKey();
		return createToken(userId, jwtProperties.getAccessTokenExpirySeconds());
	}

	@Override
	public String createRefreshToken(Integer userId) {
		initializeKey();
		return createToken(userId, jwtProperties.getRefreshTokenExpirySeconds());
	}

	private String createToken(Integer userId, long expirySeconds) {
		Date now = new Date();
		Date validity = new Date(now.getTime() + expirySeconds * 1000);

		return Jwts.builder()
			.subject(userId.toString())
			.issuedAt(now)
			.expiration(validity)
			.signWith(key)
			.compact();
	}

	@Override
	public Integer validateRefreshTokenAndGetUserId(String refreshToken) {
		initializeKey();
		try {
			return Integer.parseInt(
				Jwts.parser()
					.verifyWith(key)
					.build()
					.parseSignedClaims(refreshToken)
					.getPayload()
					.getSubject()
			);
		} catch (ExpiredJwtException e) {
			log.error("리프레시 토큰 만료: {}", e.getMessage());
			throw new CustomException(ErrorCode.EXPIRED_REFRESH_TOKEN);
		} catch (Exception e) {
			log.error("유효하지 않은 리프레시 토큰: {}", e.getMessage());
			throw new CustomException(ErrorCode.INVALID_REFRESH_TOKEN);
		}
	}

	@Override
	public Integer validateAccessTokenAndGetUserId(String accessToken) {
		initializeKey();
		try {
			return Integer.parseInt(
				Jwts.parser()
					.verifyWith(key)
					.build()
					.parseSignedClaims(accessToken)
					.getPayload()
					.getSubject()
			);
		} catch (ExpiredJwtException e) {
			log.error("액세스 토큰 만료: {}", e.getMessage());
			throw new CustomException(ErrorCode.EXPIRED_ACCESS_TOKEN);
		} catch (Exception e) {
			log.error("유효하지 않은 액세스 토큰: {}", e.getMessage());
			throw new CustomException(ErrorCode.INVALID_ACCESS_TOKEN);
		}
	}

	@Override
	public long getAccessTokenExpirySeconds() {
		return jwtProperties.getAccessTokenExpirySeconds();
	}
}