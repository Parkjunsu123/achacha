package com.eurachacha.achacha.infrastructure.adapter.output.persistence.notification;

import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;

import com.eurachacha.achacha.domain.model.notification.Notification;

public interface NotificationRepositoryCustom {
	Slice<Notification> findNotifications(Integer userId, Pageable pageable);
}
