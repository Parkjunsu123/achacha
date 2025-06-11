package com.eurachacha.achacha.application.port.output.notification.dto.request;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Getter
@Builder
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@ToString
public class NotificationEventDto {
	private String fcmToken;
	private String title;
	private String body;
	private Integer userId;
	private String notificationTypeCode;
	private Integer referenceEntityId;
	private String referenceEntityType;
}
