package com.eurachacha.achacha.application.port.output.auth;

import com.eurachacha.achacha.domain.model.user.User;

public interface SecurityServicePort {
	boolean isLoggedIn();

	User getLoggedInUser();
}
