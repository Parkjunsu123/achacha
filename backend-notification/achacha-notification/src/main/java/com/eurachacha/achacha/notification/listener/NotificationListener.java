package com.eurachacha.achacha.notification.listener;

import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

import com.eurachacha.achacha.notification.dto.NotificationEventDto;
import com.eurachacha.achacha.notification.service.FcmService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@RequiredArgsConstructor
@Slf4j
public class NotificationListener {

	private final FcmService fcmService;

	@RabbitListener(queues = "achacha.notification.queue")
	public void handleNotificationEvent(NotificationEventDto eventDto) {
		log.info("Received notification event: {}", eventDto);

		try {
			// FCM 토큰, 제목, 내용이 모두 존재하는 경우에만 알림 전송
			if (eventDto.getFcmToken() != null && eventDto.getTitle() != null && eventDto.getBody() != null) {
				fcmService.sendNotification(eventDto);
				
				log.info("Notification processed for user: {}, type: {}",
					eventDto.getUserId(), eventDto.getNotificationTypeCode());
				return;
			}
			log.warn("Invalid notification event data: {}", eventDto);
		} catch (Exception e) {
			log.error("Error processing notification event: {}", e.getMessage(), e);
		}
	}
}
