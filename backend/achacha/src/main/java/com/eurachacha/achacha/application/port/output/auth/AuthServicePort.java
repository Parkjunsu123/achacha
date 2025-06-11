package com.eurachacha.achacha.application.port.output.auth;

import com.eurachacha.achacha.application.port.output.auth.dto.response.KakaoUserInfoDto;

public interface AuthServicePort {
	// 카카오 액세스 토큰 검증 및 사용자 정보 조회
	KakaoUserInfoDto validateKakaoToken(String kakaoAccessToken);
}
