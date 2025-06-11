package com.eurachacha.achacha.web.user;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.eurachacha.achacha.application.port.input.user.UserAppService;
import com.eurachacha.achacha.application.port.input.user.dto.response.UserInfoResponseDto;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

	private final UserAppService userAppService;

	@GetMapping("/{userId}")
	public ResponseEntity<UserInfoResponseDto> getUserInfo(@PathVariable Integer userId) {
		UserInfoResponseDto userInfo = userAppService.getUserInfo(userId);
		return ResponseEntity.ok(userInfo);
	}
}
