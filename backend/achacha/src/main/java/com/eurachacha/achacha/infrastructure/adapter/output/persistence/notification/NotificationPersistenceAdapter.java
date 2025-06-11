package com.eurachacha.achacha.infrastructure.adapter.output.persistence.notification;

import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.stereotype.Component;

import com.eurachacha.achacha.application.port.output.notification.NotificationRepository;
import com.eurachacha.achacha.domain.model.notification.Notification;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class NotificationPersistenceAdapter implements NotificationRepository {

	private final NotificationJpaRepository notificationJpaRepository;

	@Override
	public Notification save(Notification notification) {
		return notificationJpaRepository.save(notification);
	}

	@Override
	public Slice<Notification> findNotifications(Integer userId, Pageable pageable) {
		return notificationJpaRepository.findNotifications(userId, pageable);
	}

	@Override
	public int countByUserIdAndRead(Integer userId, boolean read) {
		return notificationJpaRepository.countByUserIdAndIsRead(userId, read);
	}

	@Override
	public void updateAllNotificationsToRead(Integer userId) {
		notificationJpaRepository.updateAllNotificationsToRead(userId);
	}
}
