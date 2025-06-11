package com.eurachacha.achacha.notification.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Getter
@NoArgsConstructor
@ToString
public class NotificationEventDto {
	private String fcmToken;
	private String title;
	private String body;
	private Integer userId;
	private String notificationTypeCode;
	private String referenceEntityType;
	private String referenceEntityId;
}
