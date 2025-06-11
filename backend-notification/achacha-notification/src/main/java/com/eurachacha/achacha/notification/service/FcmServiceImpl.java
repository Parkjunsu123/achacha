package com.eurachacha.achacha.notification.service;

import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import com.eurachacha.achacha.notification.dto.NotificationEventDto;
import com.google.firebase.messaging.FirebaseMessaging;
import com.google.firebase.messaging.FirebaseMessagingException;
import com.google.firebase.messaging.Message;
import com.google.firebase.messaging.Notification;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class FcmServiceImpl implements FcmService {

	private final FirebaseMessaging firebaseMessaging;

	@Async("fcmTaskExecutor")
	@Override
	public void sendNotification(NotificationEventDto eventDto) {
		try {
			// 기본 알림 설정
			Message.Builder messageBuilder = Message.builder()
				.setToken(eventDto.getFcmToken())
				.setNotification(Notification.builder()
					.setTitle(eventDto.getTitle())
					.setBody(eventDto.getBody())
					.build());

			// 추가 데이터 필드 설정
			if (eventDto.getNotificationTypeCode() != null) {
				messageBuilder.putData("notificationTypeCode", eventDto.getNotificationTypeCode());
			}

			if (eventDto.getReferenceEntityType() != null) {
				messageBuilder.putData("referenceEntityType", eventDto.getReferenceEntityType());
			}

			if (eventDto.getReferenceEntityId() != null) {
				messageBuilder.putData("referenceEntityId", eventDto.getReferenceEntityId());
			}

			if (eventDto.getUserId() != null) {
				messageBuilder.putData("userId", eventDto.getUserId().toString());
			}

			Message message = messageBuilder.build();
			String messageId = firebaseMessaging.send(message);
			log.info("Successfully sent FCM notification with additional data: {}", messageId);
		} catch (FirebaseMessagingException e) {
			log.error("Failed to send FCM notification with additional data: {}", e.getMessage());
		}
	}
}
