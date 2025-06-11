package com.eurachacha.achacha.web.notification;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.eurachacha.achacha.application.port.input.notification.NotificationAppService;
import com.eurachacha.achacha.application.port.input.notification.dto.request.LocationBasedNotificationRequestDto;
import com.eurachacha.achacha.application.port.input.notification.dto.response.NotificationCountResponseDto;
import com.eurachacha.achacha.application.port.input.notification.dto.response.NotificationsResponseDto;
import com.eurachacha.achacha.domain.model.notification.enums.NotificationSortType;

import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;

@RequestMapping("/api/notifications")
@RestController
@RequiredArgsConstructor
public class NotificationController {

	private final NotificationAppService notificationAppService;

	@GetMapping
	public ResponseEntity<NotificationsResponseDto> getNotifications(
		@RequestParam(required = false, defaultValue = "CREATED_DESC") NotificationSortType sort,
		@RequestParam(required = false, defaultValue = "0") @Min(0) Integer page,
		@RequestParam(required = false, defaultValue = "6") @Min(1) Integer size) {
		return ResponseEntity.ok(notificationAppService.getNotifications(sort, page, size));
	}

	@GetMapping("/count")
	public ResponseEntity<NotificationCountResponseDto> getUnreadNotificationCount(
		@RequestParam(required = false, defaultValue = "false") boolean read) {
		return ResponseEntity.ok(notificationAppService.countUnreadNotifications(read));
	}

	@PatchMapping("/read")
	public ResponseEntity<String> markAllNotificationsAsRead() {
		notificationAppService.markAllNotificationsAsRead();
		return ResponseEntity.ok("모든 알림 읽음 처리 성공");
	}

	@PostMapping("/request")
	public ResponseEntity<String> requestNotification(@RequestBody LocationBasedNotificationRequestDto requestDto) {
		notificationAppService.requestNotification(requestDto);
		return ResponseEntity.ok("알림 요청 성공");
	}
}
