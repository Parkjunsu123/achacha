package com.eurachacha.achacha.application.port.input.notification.dto.response;

import java.util.List;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class NotificationsResponseDto {
	private List<NotificationResponseDto> notifications;
	private boolean hasNextPage;
	private Integer nextPage;
}
