package com.eurachacha.achacha.application.port.input.notification;

import java.util.List;

import com.eurachacha.achacha.application.port.input.notification.dto.response.NotificationSettingDto;
import com.eurachacha.achacha.domain.model.notification.enums.ExpirationCycle;
import com.eurachacha.achacha.domain.model.notification.enums.NotificationTypeCode;

public interface NotificationSettingAppService {
	List<NotificationSettingDto> getUserNotificationSettings();

	void updateNotificationSetting(NotificationTypeCode typeCode, Boolean isEnabled);

	void updateExpirationCycle(ExpirationCycle expirationCycle);
}
