package com.eurachacha.achacha.application.port.input.notification;

public interface GifticonExpiryNotificationAppService {

	// 모든 사용자에 대한 유효기간 알림 전송 (스케줄러용)
	void sendExpiryDateNotification();

	// 특정 사용자에 대한 유효기간 알림 전송 (알림 설정 변경 이벤트용)
	void sendExpiryDateNotificationForUser(Integer userId);
}
