package com.eurachacha.achacha.application.port.output.notification;

import com.eurachacha.achacha.application.port.output.notification.dto.request.NotificationEventDto;

public interface NotificationEventPort {
	void sendNotificationEvent(NotificationEventDto eventDto);
}
