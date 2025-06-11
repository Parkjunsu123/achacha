package com.eurachacha.achacha.infrastructure.adapter.output.amqp;

import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;

import com.eurachacha.achacha.application.port.output.notification.NotificationEventPort;
import com.eurachacha.achacha.application.port.output.notification.dto.request.NotificationEventDto;
import com.eurachacha.achacha.infrastructure.config.RabbitMQConfig;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@RequiredArgsConstructor
@Slf4j
public class RabbitMQNotificationAdapter implements NotificationEventPort {

	private final RabbitTemplate rabbitTemplate;

	@Override
	public void sendNotificationEvent(NotificationEventDto eventDto) {
		try {
			rabbitTemplate.convertAndSend(
				RabbitMQConfig.NOTIFICATION_EXCHANGE,
				RabbitMQConfig.NOTIFICATION_ROUTING_KEY,
				eventDto
			);

			log.info("Sent notification event to queue: {}", eventDto);
		} catch (Exception e) {
			log.error("Failed to send notification event: {}", e.getMessage());
		}
	}
}
