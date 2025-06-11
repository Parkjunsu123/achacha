package com.eurachacha.achacha.application.port.input.auth;

import com.eurachacha.achacha.application.port.input.auth.dto.request.KakaoLoginRequestDto;
import com.eurachacha.achacha.application.port.input.auth.dto.request.RefreshTokenRequestDto;
import com.eurachacha.achacha.application.port.input.auth.dto.response.TokenResponseDto;

public interface AuthAppService {
	TokenResponseDto loginWithKakao(KakaoLoginRequestDto requestDto);

	TokenResponseDto refreshToken(RefreshTokenRequestDto requestDto);

}
