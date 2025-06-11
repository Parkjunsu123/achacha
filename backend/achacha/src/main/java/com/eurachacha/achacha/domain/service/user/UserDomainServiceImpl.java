package com.eurachacha.achacha.domain.service.user;

import org.springframework.stereotype.Service;

import com.eurachacha.achacha.domain.model.user.User;
import com.eurachacha.achacha.web.common.exception.CustomException;
import com.eurachacha.achacha.web.common.exception.ErrorCode;

@Service
public class UserDomainServiceImpl implements UserDomainService {
	@Override
	public void validateUserAccess(User currentUser, Integer requestedUserId) {
		if (!currentUser.getId().equals(requestedUserId)) {
			throw new CustomException(ErrorCode.UNAUTHORIZED_USER_ACCESS);
		}
	}
}
