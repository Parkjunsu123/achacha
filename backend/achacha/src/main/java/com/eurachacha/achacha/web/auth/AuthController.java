package com.eurachacha.achacha.web.auth;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.eurachacha.achacha.application.port.input.auth.AuthAppService;
import com.eurachacha.achacha.application.port.input.auth.dto.request.KakaoLoginRequestDto;
import com.eurachacha.achacha.application.port.input.auth.dto.request.LogoutRequestDto;
import com.eurachacha.achacha.application.port.input.auth.dto.request.RefreshTokenRequestDto;
import com.eurachacha.achacha.application.port.input.auth.dto.response.TokenResponseDto;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
	private final AuthAppService authAppService;

	@PostMapping("/kakao")
	public ResponseEntity<TokenResponseDto> kakaoLogin(@RequestBody KakaoLoginRequestDto requestDto) {
		TokenResponseDto tokenResponseDto = authAppService.loginWithKakao(requestDto);
		return ResponseEntity.ok(tokenResponseDto);
	}

	@PostMapping("/refresh")
	public ResponseEntity<TokenResponseDto> refreshToken(@RequestBody RefreshTokenRequestDto requestDto) {
		TokenResponseDto tokenResponseDto = authAppService.refreshToken(requestDto);
		return ResponseEntity.ok(tokenResponseDto);
	}

	// Swagger-ui 문서용 메서드, 동작하지 않음
	@PostMapping("/logout")
	public ResponseEntity<String> logout(@RequestBody LogoutRequestDto logoutRequestDto) {

		return ResponseEntity.ok("로그아웃 성공");
	}

}