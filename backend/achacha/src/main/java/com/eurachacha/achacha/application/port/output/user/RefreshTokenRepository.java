package com.eurachacha.achacha.application.port.output.user;

import com.eurachacha.achacha.domain.model.user.RefreshToken;

public interface RefreshTokenRepository {

	RefreshToken findByUserIdAndValue(Integer userId, String value);

	boolean existsByUserId(Integer userId);

	RefreshToken save(RefreshToken refreshToken);

	void deleteByUserIdAndValue(Integer userId, String value);
}
