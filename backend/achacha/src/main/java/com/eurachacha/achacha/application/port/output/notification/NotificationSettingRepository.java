package com.eurachacha.achacha.application.port.output.notification;

import java.util.List;

import com.eurachacha.achacha.domain.model.notification.NotificationSetting;

public interface NotificationSettingRepository {

	List<NotificationSetting> findAllByUserId(Integer userId);

	NotificationSetting findByUserIdAndNotificationTypeId(Integer userId, Integer typeId);

	NotificationSetting save(NotificationSetting notificationSetting);

	List<NotificationSetting> saveAll(List<NotificationSetting> notificationSettings);

	List<NotificationSetting> findByUserIdInAndNotificationTypeId(List<Integer> userIds, Integer notificationTypeId);

}
