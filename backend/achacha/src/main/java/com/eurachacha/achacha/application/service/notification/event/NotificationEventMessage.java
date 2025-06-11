package com.eurachacha.achacha.application.service.notification.event;

import com.eurachacha.achacha.application.port.output.notification.dto.request.NotificationEventDto;

import lombok.Getter;

@Getter
public class NotificationEventMessage {
	private final NotificationEventDto eventDto;

	public NotificationEventMessage(NotificationEventDto eventDto) {
		this.eventDto = eventDto;
	}
}
