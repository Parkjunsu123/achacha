package com.eurachacha.achacha.web.notification;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.eurachacha.achacha.application.port.input.notification.NotificationSettingAppService;
import com.eurachacha.achacha.application.port.input.notification.dto.request.ExpirationCycleUpdateRequestDto;
import com.eurachacha.achacha.application.port.input.notification.dto.request.NotificationSettingUpdateRequestDto;
import com.eurachacha.achacha.application.port.input.notification.dto.response.NotificationSettingDto;
import com.eurachacha.achacha.domain.model.notification.enums.NotificationTypeCode;

import lombok.RequiredArgsConstructor;

@RequestMapping("/api/notification-settings")
@RestController
@RequiredArgsConstructor
public class NotificationSettingController {

	private final NotificationSettingAppService notificationSettingAppService;

	@GetMapping
	public ResponseEntity<List<NotificationSettingDto>> getUserNotificationSettings() {
		List<NotificationSettingDto> settings = notificationSettingAppService.getUserNotificationSettings();
		return ResponseEntity.ok(settings);
	}

	@PatchMapping("/types/{type}")
	public ResponseEntity<?> updateNotificationSetting(
		@PathVariable("type") NotificationTypeCode notificationTypeCode,
		@RequestBody NotificationSettingUpdateRequestDto request) {

		notificationSettingAppService.updateNotificationSetting(notificationTypeCode, request.getIsEnabled());

		return ResponseEntity.ok("알림 허용 설정 변경 성공");
	}

	@PatchMapping("/expiration-cycle")
	public ResponseEntity<?> updateExpirationCycle(
		@RequestBody ExpirationCycleUpdateRequestDto expirationCycleUpdateDto) {
		notificationSettingAppService.updateExpirationCycle(expirationCycleUpdateDto.getExpirationCycle());

		return ResponseEntity.ok("알림 주기 변경 성공");
	}
}
