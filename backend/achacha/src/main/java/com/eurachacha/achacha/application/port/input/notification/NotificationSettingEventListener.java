package com.eurachacha.achacha.application.port.input.notification;

import com.eurachacha.achacha.application.service.notification.event.NotificationSettingUpdatedEvent;

public interface NotificationSettingEventListener {
	void handleNotificationSettingUpdated(NotificationSettingUpdatedEvent event);
}
