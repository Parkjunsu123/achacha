package com.eurachacha.achacha.infrastructure.adapter.output.persistence.user;

import java.util.Optional;

import org.springframework.stereotype.Component;

import com.eurachacha.achacha.application.port.output.user.UserRepository;
import com.eurachacha.achacha.domain.model.user.User;
import com.eurachacha.achacha.web.common.exception.CustomException;
import com.eurachacha.achacha.web.common.exception.ErrorCode;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class UserPersistenceAdapter implements UserRepository {

	private final UserJpaRepository userJpaRepository;

	@Override
	public Optional<User> findByProviderAndProviderUserId(String provider, String providerUserId) {
		return userJpaRepository.findByProviderAndProviderUserId(provider, providerUserId);
	}

	@Override
	public User findById(Integer id) {
		return userJpaRepository.findById(id)
			.orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));
	}

	@Override
	public User save(User user) {
		return userJpaRepository.save(user);
	}
}
