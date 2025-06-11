package com.eurachacha.achacha.notification.service;

import com.eurachacha.achacha.notification.dto.NotificationEventDto;

public interface FcmService {
	void sendNotification(NotificationEventDto notificationEventDto);
}
