package com.eurachacha.achacha.application.port.input.user;

import com.eurachacha.achacha.application.port.input.user.dto.response.UserInfoResponseDto;

public interface UserAppService {
	UserInfoResponseDto getUserInfo(Integer userId);

}
