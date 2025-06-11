package com.eurachacha.achacha.infrastructure.adapter.output.persistence.notification;

import java.util.List;

import org.springframework.stereotype.Component;

import com.eurachacha.achacha.application.port.output.notification.NotificationTypeRepository;
import com.eurachacha.achacha.domain.model.notification.NotificationType;
import com.eurachacha.achacha.domain.model.notification.enums.NotificationTypeCode;
import com.eurachacha.achacha.web.common.exception.CustomException;
import com.eurachacha.achacha.web.common.exception.ErrorCode;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class NotificationTypePersistenceAdapter implements NotificationTypeRepository {

	private final NotificationTypeJpaRepository notificationTypeJpaRepository;

	@Override
	public NotificationType findByCode(NotificationTypeCode code) {
		return notificationTypeJpaRepository.findByCode(code)
			.orElseThrow(() -> new CustomException(ErrorCode.NOTIFICATION_TYPE_NOT_FOUND));
	}

	@Override
	public List<NotificationType> findAll() {
		return notificationTypeJpaRepository.findAll();
	}
}