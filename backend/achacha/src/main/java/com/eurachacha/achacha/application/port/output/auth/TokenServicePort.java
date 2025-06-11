package com.eurachacha.achacha.application.port.output.auth;

public interface TokenServicePort {
	String createAccessToken(Integer userId);

	String createRefreshToken(Integer userId);

	Integer validateRefreshTokenAndGetUserId(String refreshToken);

	Integer validateAccessTokenAndGetUserId(String accessToken);

	long getAccessTokenExpirySeconds();
}