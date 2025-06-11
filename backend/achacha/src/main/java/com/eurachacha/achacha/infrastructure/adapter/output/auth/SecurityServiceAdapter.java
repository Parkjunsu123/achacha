package com.eurachacha.achacha.infrastructure.adapter.output.auth;

import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import com.eurachacha.achacha.application.port.output.auth.SecurityServicePort;
import com.eurachacha.achacha.application.port.output.user.UserRepository;
import com.eurachacha.achacha.domain.model.user.User;
import com.eurachacha.achacha.web.common.exception.CustomException;
import com.eurachacha.achacha.web.common.exception.ErrorCode;

import lombok.RequiredArgsConstructor;

/**
 * 현재 인증된 사용자의 정보를 제공하는 서비스
 */
@Component
@RequiredArgsConstructor
public class SecurityServiceAdapter implements SecurityServicePort {
	private final UserRepository userRepository;

	/**
	 * 현재 사용자가 로그인되어 있는지 확인
	 * @return 로그인 여부
	 */
	@Override
	public boolean isLoggedIn() {
		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
		return authentication != null && authentication.isAuthenticated()
			&& !(authentication instanceof AnonymousAuthenticationToken);
	}

	/**
	 * 현재 로그인한 사용자 정보 반환
	 * @return 인증된 사용자
	 * @throws CustomException 인증되지 않은 사용자 접근 시
	 */
	@Override
	public User getLoggedInUser() {
		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

		if (authentication == null || !authentication.isAuthenticated()
			|| authentication instanceof AnonymousAuthenticationToken) {
			throw new CustomException(ErrorCode.NOT_AUTHENTICATED_USER);
		}

		UserDetails userDetails = (UserDetails)authentication.getPrincipal();
		Integer userId = Integer.valueOf(userDetails.getUsername());

		return userRepository.findById(userId);
	}
}