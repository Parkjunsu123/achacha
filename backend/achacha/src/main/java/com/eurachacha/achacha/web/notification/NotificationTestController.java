package com.eurachacha.achacha.web.notification;

import org.springframework.context.ApplicationEventPublisher;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.eurachacha.achacha.application.port.output.notification.dto.request.NotificationEventDto;
import com.eurachacha.achacha.application.service.notification.event.NotificationEventMessage;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/test")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Test", description = "테스트 API")
public class NotificationTestController {

	private final ApplicationEventPublisher applicationEventPublisher;

	@PostMapping("/notification")
	@Operation(summary = "알림 테스트", description = "RabbitMQ를 통한 알림 서비스 테스트")
	@Transactional
	public ResponseEntity<String> testNotification(@RequestBody NotificationEventDto notificationEventDto) {
		log.info("Sending test notification: {}", notificationEventDto);

		applicationEventPublisher.publishEvent(new NotificationEventMessage(notificationEventDto));

		return ResponseEntity.ok("Notification test sent successfully");
	}
}
