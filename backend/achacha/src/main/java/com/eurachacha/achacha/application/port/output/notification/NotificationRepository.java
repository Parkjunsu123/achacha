package com.eurachacha.achacha.application.port.output.notification;

import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;

import com.eurachacha.achacha.domain.model.notification.Notification;

public interface NotificationRepository {
	Notification save(Notification notification);

	Slice<Notification> findNotifications(Integer userId, Pageable pageable);

	int countByUserIdAndRead(Integer userId, boolean read);

	void updateAllNotificationsToRead(Integer userId);
}
