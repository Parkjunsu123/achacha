package com.eurachacha.achacha.application.service.notification.event;

import com.eurachacha.achacha.domain.model.notification.enums.NotificationTypeCode;

import lombok.Getter;

@Getter
public class NotificationSettingUpdatedEvent {
	private final Integer userId;
	private final NotificationTypeCode typeCode;
	private final Boolean isEnabled;

	public NotificationSettingUpdatedEvent(Integer userId, NotificationTypeCode typeCode, Boolean isEnabled) {
		this.userId = userId;
		this.typeCode = typeCode;
		this.isEnabled = isEnabled;
	}
}
