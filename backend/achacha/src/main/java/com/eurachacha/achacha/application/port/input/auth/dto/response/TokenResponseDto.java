package com.eurachacha.achacha.application.port.input.auth.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class TokenResponseDto {
	private String accessToken;
	private String refreshToken;
}
