package com.eurachacha.achacha.application.port.input.auth.dto.request;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class RefreshTokenRequestDto {
	private String refreshToken;
}
