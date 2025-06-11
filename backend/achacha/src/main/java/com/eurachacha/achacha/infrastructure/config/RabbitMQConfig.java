package com.eurachacha.achacha.infrastructure.config;

import org.springframework.amqp.core.TopicExchange;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;

@Configuration
public class RabbitMQConfig {

	// 메시지 전송에 사용할 Exchange와 Routing Key 상수 정의
	public static final String NOTIFICATION_EXCHANGE = "achacha.notification.exchange";
	public static final String NOTIFICATION_ROUTING_KEY = "achacha.notification";

	/**
	 * 알림 메시지를 위한 Topic Exchange 정의
	 * Producer는 Exchange만 알면 메시지를 발행할 수 있음
	 */
	@Bean
	public TopicExchange notificationExchange() {
		return new TopicExchange(NOTIFICATION_EXCHANGE);
	}

	/**
	 * 메시지 변환기 설정
	 * Java 객체 <-> JSON 변환을 처리
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
	 * 메시지 발행에 사용되는 핵심 컴포넌트
	 */
	@Bean
	public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory) {
		RabbitTemplate rabbitTemplate = new RabbitTemplate(connectionFactory);
		rabbitTemplate.setMessageConverter(jsonMessageConverter());
		return rabbitTemplate;
	}
}