package com.eurachacha.achacha.application.port.input.notification.dto.request;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@AllArgsConstructor
@NoArgsConstructor
public class NotificationSettingUpdateRequestDto {
	private Boolean isEnabled;
}
