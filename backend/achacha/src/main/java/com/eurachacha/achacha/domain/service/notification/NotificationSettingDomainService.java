package com.eurachacha.achacha.domain.service.notification;

import com.eurachacha.achacha.domain.model.notification.NotificationSetting;

public interface NotificationSettingDomainService {

	boolean isEnabled(NotificationSetting notificationSetting);
}
