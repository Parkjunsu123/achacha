package com.eurachacha.achacha.application.port.input.auth;

import org.springframework.security.core.userdetails.UserDetails;

/**
 * 인증 및 로그아웃 관련 사용 사례를 정의하는 인터페이스
 * 필터와 같은 외부 어댑터에서 애플리케이션 코어로 접근하기 위한 입력 포트
 */
public interface AuthenticationUseCase {

	// 액세스 토큰을 검증하고 사용자 ID를 반환
	Integer validateAccessToken(String token);

	// 사용자 ID를 기반으로 인증에 사용할 UserDetails 객체를 생성
	UserDetails createUserDetails(Integer userId);

	// 사용자의 로그아웃 처리
	void logout(Integer userId, String refreshToken, String fcmToken, String bleToken);
}
