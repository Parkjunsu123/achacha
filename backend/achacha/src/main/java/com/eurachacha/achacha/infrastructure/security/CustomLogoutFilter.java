package com.eurachacha.achacha.infrastructure.security;

import java.io.IOException;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.eurachacha.achacha.application.port.input.auth.AuthenticationUseCase;
import com.fasterxml.jackson.databind.ObjectMapper;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RequiredArgsConstructor
@Component
@Slf4j
public class CustomLogoutFilter extends OncePerRequestFilter {
	private final AuthenticationUseCase authenticationUseCase;
	private final ObjectMapper objectMapper = new ObjectMapper();

	@Override
	protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
		FilterChain filterChain) throws ServletException, IOException {

		// 로그아웃 요청 경로 확인
		if (!isLogoutRequest(request)) {
			filterChain.doFilter(request, response);
			return;
		}

		// 사용자 ID 추출
		Integer userId = extractUserIdFromToken(request);

		// 토큰 정보 추출
		Map<String, String> tokenMap = objectMapper.readValue(request.getInputStream(), Map.class);

		// 로그아웃 처리를 AuthenticationUseCase에 위임
		authenticationUseCase.logout(
			userId,
			tokenMap.get("refreshToken"),
			tokenMap.get("fcmToken"),
			tokenMap.get("bleToken")
		);

		// 성공 응답 반환
		response.setStatus(HttpStatus.OK.value());
		response.setContentType(MediaType.APPLICATION_JSON_VALUE);
		response.setCharacterEncoding("UTF-8");
		response.getWriter().write("\"로그아웃 성공\"");
	}

	private boolean isLogoutRequest(HttpServletRequest request) {
		return "/api/auth/logout".equals(request.getServletPath()) && "POST".equals(request.getMethod());
	}

	private Integer extractUserIdFromToken(HttpServletRequest request) {
		String authorization = request.getHeader("Authorization");
		if (authorization != null && authorization.startsWith("Bearer ")) {
			String accessToken = authorization.substring("Bearer ".length());
			return authenticationUseCase.validateAccessToken(accessToken);
		}
		return null;
	}
}