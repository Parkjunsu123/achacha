package com.eurachacha.achacha.application.port.output.user;

import java.util.Optional;

import com.eurachacha.achacha.domain.model.user.User;

public interface UserRepository {
	Optional<User> findByProviderAndProviderUserId(String provider, String providerUserId);

	User findById(Integer id);

	User save(User user);

}
