package com.eurachacha.achacha.application.service.notification;

import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

import com.eurachacha.achacha.application.port.input.notification.AsyncNotificationEventListener;
import com.eurachacha.achacha.application.port.output.notification.NotificationEventPort;
import com.eurachacha.achacha.application.service.notification.event.NotificationEventMessage;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class AsyncNotificationEventListenerImpl implements AsyncNotificationEventListener {
	private final NotificationEventPort notificationEventPort;

	@Async("notificationTaskExecutor")
	@TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
	@Override
	public void handleNotificationEvent(NotificationEventMessage event) {
		try {
			log.info("비동기 알림 이벤트 처리 시작: {}", event.getEventDto());
			notificationEventPort.sendNotificationEvent(event.getEventDto());
			log.info("비동기 알림 이벤트 처리 완료");
		} catch (Exception e) {
			log.error("비동기 알림 전송 실패: {}", e.getMessage(), e);
		}
	}
}
