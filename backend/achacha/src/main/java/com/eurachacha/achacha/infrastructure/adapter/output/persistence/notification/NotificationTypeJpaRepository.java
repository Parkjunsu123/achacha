package com.eurachacha.achacha.infrastructure.adapter.output.persistence.notification;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.eurachacha.achacha.domain.model.notification.NotificationType;
import com.eurachacha.achacha.domain.model.notification.enums.NotificationTypeCode;

public interface NotificationTypeJpaRepository extends JpaRepository<NotificationType, Integer> {
	Optional<NotificationType> findByCode(NotificationTypeCode code);
}
