package com.eurachacha.achacha.domain.service.notification;

import org.springframework.stereotype.Service;

import com.eurachacha.achacha.domain.model.notification.NotificationSetting;

@Service
public class NotificationSettingDomainServiceImpl implements NotificationSettingDomainService {

	@Override
	public boolean isEnabled(NotificationSetting notificationSetting) {
		return notificationSetting.getIsEnabled();
	}
}
