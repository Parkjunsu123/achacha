package com.eurachacha.achacha.notification.config;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.DirectExchange;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.QueueBuilder;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;

/**
 * RabbitMQ 설정 클래스
 * - 알림 서비스에서 사용하는 메시지 큐 관련 설정
 * - 기본 큐와 Dead Letter Queue 설정을 포함
 */
@Configuration
public class RabbitMQConfig {

	// 핵심 상수 정의
	public static final String NOTIFICATION_EXCHANGE = "achacha.notification.exchange";
	public static final String NOTIFICATION_QUEUE = "achacha.notification.queue";
	public static final String NOTIFICATION_ROUTING_KEY = "achacha.notification";

	// Dead Letter Queue 관련 상수 (선택 사항)
	public static final String DLX_EXCHANGE = "achacha.notification.dlx";
	public static final String DLQ_QUEUE = "achacha.notification.dlq";
	public static final String DLQ_ROUTING_KEY = "achacha.notification.deadletter";

	/**
	 * 알림 메시지를 위한 Topic Exchange 정의
	 * - 메인 서버에서 발행한 메시지가 이 Exchange로 전달됨
	 */
	@Bean
	public TopicExchange notificationExchange() {
		return new TopicExchange(NOTIFICATION_EXCHANGE);
	}

	/**
	 * 알림 메시지를 저장할 Queue 정의
	 * - 메시지가 저장되고 알림 서버가 메시지를 소비하는 주 큐
	 * - 처리 실패 시 DLQ로 메시지 이동 (DLQ 사용 시)
	 */
	@Bean
	public Queue notificationQueue() {
		// 기본 설정: 서버 재시작 후에도 큐가 유지되는 durable 큐
		return QueueBuilder.durable(NOTIFICATION_QUEUE)
			// DLQ 사용 설정
			.withArgument("x-dead-letter-exchange", DLX_EXCHANGE)  // 처리 실패 시 사용할 exchange
			.withArgument("x-dead-letter-routing-key", DLQ_ROUTING_KEY)  // DLQ로 보낼 때 사용할 routing key
			.build();
	}

	/**
	 * Exchange와 Queue를 연결하는 Binding 정의
	 * - 이 바인딩을 통해 메시지가 Exchange에서 Queue로 라우팅됨
	 */
	@Bean
	public Binding notificationBinding() {
		return BindingBuilder.bind(notificationQueue())
			.to(notificationExchange())
			.with(NOTIFICATION_ROUTING_KEY);
	}

	/**
	 * Dead Letter Exchange 정의
	 * - 메시지 처리 실패 시 메시지를 DLQ로 라우팅할 Exchange
	 */
	@Bean
	public DirectExchange deadLetterExchange() {
		return new DirectExchange(DLX_EXCHANGE);
	}

	/**
	 * Dead Letter Queue 정의
	 * - 처리 실패한 메시지를 저장하는 큐
	 */
	@Bean
	public Queue deadLetterQueue() {
		return QueueBuilder.durable(DLQ_QUEUE)
			.build();
	}

	/**
	 * DLX와 DLQ를 연결하는 Binding 정의
	 */
	@Bean
	public Binding deadLetterBinding() {
		return BindingBuilder.bind(deadLetterQueue())
			.to(deadLetterExchange())
			.with(DLQ_ROUTING_KEY);
	}

	/**
	 * 메시지 변환기 설정
	 * - Java 객체 <-> JSON 변환을 처리
	 * - NotificationEventDto와 같은 객체를 JSON으로 직렬화/역직렬화
	 */
	@Bean
	public Jackson2JsonMessageConverter jsonMessageConverter() {
		ObjectMapper objectMapper = new ObjectMapper();
		// Enum 타입을 문자열로 직렬화하기 위한 설정
		objectMapper.configure(SerializationFeature.WRITE_ENUMS_USING_TO_STRING, false);
		return new Jackson2JsonMessageConverter(objectMapper);
	}

	/**
	 * RabbitTemplate 설정
	 * - 메시지 발행 및 수신에 사용되는 핵심 컴포넌트
	 * - 메시지 변환기를 설정하여 객체<->JSON 변환 처리
	 */
	@Bean
	public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory) {
		RabbitTemplate rabbitTemplate = new RabbitTemplate(connectionFactory);
		rabbitTemplate.setMessageConverter(jsonMessageConverter());
		return rabbitTemplate;
	}
}