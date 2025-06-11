package com.eurachacha.achacha.domain.service.user;

import com.eurachacha.achacha.domain.model.user.User;

public interface UserDomainService {
	void validateUserAccess(User currentUser, Integer requestedUserId);
}
