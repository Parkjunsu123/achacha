package com.eurachacha.achacha.application.port.output.notification;

import java.util.List;

import com.eurachacha.achacha.domain.model.notification.NotificationType;
import com.eurachacha.achacha.domain.model.notification.enums.NotificationTypeCode;

public interface NotificationTypeRepository {

	NotificationType findByCode(NotificationTypeCode code);

	List<NotificationType> findAll();
}
