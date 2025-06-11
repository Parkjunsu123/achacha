package com.eurachacha.achacha.application.service.notification;

import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

import com.eurachacha.achacha.application.port.input.notification.GifticonExpiryNotificationAppService;
import com.eurachacha.achacha.application.port.input.notification.NotificationSettingEventListener;
import com.eurachacha.achacha.application.service.notification.event.NotificationSettingUpdatedEvent;
import com.eurachacha.achacha.domain.model.notification.enums.NotificationTypeCode;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@RequiredArgsConstructor
@Slf4j
public class NotificationSettingEventListenerImpl implements NotificationSettingEventListener {

	private final GifticonExpiryNotificationAppService gifticonExpiryNotificationAppService;

	@Override
	@TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
	public void handleNotificationSettingUpdated(NotificationSettingUpdatedEvent event) {
		log.info("알림 설정 이벤트 수신: 사용자ID={}, 알림타입={}, 활성화={}",
			event.getUserId(), event.getTypeCode(), event.getIsEnabled());
		// EXPIRY_DATE 타입의 알림이 활성화될 때만 처리
		if (event.getTypeCode() == NotificationTypeCode.EXPIRY_DATE && event.getIsEnabled()) {
			log.info("유효기간 알림 서비스 호출 시작: 사용자ID={}", event.getUserId());
			// 해당 사용자의 유효기간 알림 서비스 호출
			gifticonExpiryNotificationAppService.sendExpiryDateNotificationForUser(event.getUserId());
		}
	}
}
