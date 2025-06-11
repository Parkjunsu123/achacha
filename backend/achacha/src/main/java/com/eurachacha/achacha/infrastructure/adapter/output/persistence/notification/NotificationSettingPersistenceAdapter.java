package com.eurachacha.achacha.infrastructure.adapter.output.persistence.notification;

import java.util.List;

import org.springframework.stereotype.Component;

import com.eurachacha.achacha.application.port.output.notification.NotificationSettingRepository;
import com.eurachacha.achacha.domain.model.notification.NotificationSetting;
import com.eurachacha.achacha.web.common.exception.CustomException;
import com.eurachacha.achacha.web.common.exception.ErrorCode;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class NotificationSettingPersistenceAdapter implements NotificationSettingRepository {

	private final NotificationSettingJpaRepository notificationSettingJpaRepository;

	@Override
	public List<NotificationSetting> findAllByUserId(Integer userId) {
		return notificationSettingJpaRepository.findAllByUserIdWithType(userId);
	}

	@Override
	public NotificationSetting findByUserIdAndNotificationTypeId(Integer userId, Integer typeId) {
		return notificationSettingJpaRepository.findByUserIdAndNotificationTypeId(userId, typeId)
			.orElseThrow(() -> new CustomException(ErrorCode.NOTIFICATION_SETTING_NOT_FOUND));
	}

	@Override
	public NotificationSetting save(NotificationSetting notificationSetting) {
		return notificationSettingJpaRepository.save(notificationSetting);
	}

	@Override
	public List<NotificationSetting> saveAll(List<NotificationSetting> notificationSettings) {
		return notificationSettingJpaRepository.saveAll(notificationSettings);
	}

	@Override
	public List<NotificationSetting> findByUserIdInAndNotificationTypeId(List<Integer> userIds,
		Integer notificationTypeId) {
		return notificationSettingJpaRepository.findAllUserIdInAndNotificationTypeId(userIds, notificationTypeId);
	}
}
