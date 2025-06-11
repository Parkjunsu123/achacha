package com.eurachacha.achacha.infrastructure.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.authentication.logout.LogoutFilter;

import com.eurachacha.achacha.infrastructure.security.CustomLogoutFilter;
import com.eurachacha.achacha.infrastructure.security.JwtAuthenticationFilter;
import com.eurachacha.achacha.web.common.exception.FilterExceptionHandler;

import lombok.RequiredArgsConstructor;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

	private final JwtAuthenticationFilter jwtAuthenticationFilter;
	private final CustomLogoutFilter customLogoutFilter;

	@Bean
	public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
		http
			.csrf(AbstractHttpConfigurer::disable)
			.sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
			.authorizeHttpRequests(auth -> auth
				//.requestMatchers("/api/auth/**").permitAll()
				//.anyRequest().authenticated()
				.anyRequest().permitAll()
			)
			// 필터 예외 처리기 등록 (인증 필터보다 먼저 등록해야 함)
			.addFilterBefore(new FilterExceptionHandler(), LogoutFilter.class)
			// 로그아웃 필터 등록
			.addFilterAfter(customLogoutFilter, LogoutFilter.class)
			// JWT 인증 필터 등록
			.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

		return http.build();
	}
}