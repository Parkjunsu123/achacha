package com.eurachacha.achacha.application.port.input.notification.dto.response;

import com.eurachacha.achacha.domain.model.notification.enums.ExpirationCycle;
import com.eurachacha.achacha.domain.model.notification.enums.NotificationTypeCode;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class NotificationSettingDto {
	private Integer notificationSettingId;
	private NotificationTypeCode notificationType;
	private String notificationTypeName;
	private Boolean isEnabled;
	private ExpirationCycle expirationCycle;
}