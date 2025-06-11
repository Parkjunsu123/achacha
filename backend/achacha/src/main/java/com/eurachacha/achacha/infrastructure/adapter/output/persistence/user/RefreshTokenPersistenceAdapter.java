package com.eurachacha.achacha.infrastructure.adapter.output.persistence.user;

import org.springframework.stereotype.Component;

import com.eurachacha.achacha.application.port.output.user.RefreshTokenRepository;
import com.eurachacha.achacha.domain.model.user.RefreshToken;
import com.eurachacha.achacha.web.common.exception.CustomException;
import com.eurachacha.achacha.web.common.exception.ErrorCode;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class RefreshTokenPersistenceAdapter implements RefreshTokenRepository {

	private final RefreshTokenJpaRepository refreshTokenJpaRepository;

	@Override
	public RefreshToken findByUserIdAndValue(Integer userId, String value) {
		return refreshTokenJpaRepository.findByUserIdAndValue(userId, value)
			.orElseThrow(() -> new CustomException(ErrorCode.INVALID_REFRESH_TOKEN));
	}

	@Override
	public boolean existsByUserId(Integer userId) {
		return refreshTokenJpaRepository.existsByUserId(userId);
	}

	@Override
	public RefreshToken save(RefreshToken refreshToken) {
		return refreshTokenJpaRepository.save(refreshToken);
	}

	@Override
	public void deleteByUserIdAndValue(Integer userId, String value) {
		refreshTokenJpaRepository.deleteByUserIdAndValue(userId, value);
	}
}
