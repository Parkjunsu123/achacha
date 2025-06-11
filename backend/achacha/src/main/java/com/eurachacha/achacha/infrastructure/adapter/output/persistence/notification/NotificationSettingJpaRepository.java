package com.eurachacha.achacha.infrastructure.adapter.output.persistence.notification;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.eurachacha.achacha.domain.model.notification.NotificationSetting;

public interface NotificationSettingJpaRepository extends JpaRepository<NotificationSetting, Integer> {
	// 사용자 ID로 모든 알림 설정을 조회
	@Query("SELECT ns FROM NotificationSetting ns JOIN FETCH ns.notificationType WHERE ns.user.id = :userId")
	List<NotificationSetting> findAllByUserIdWithType(Integer userId);

	// 사용자 ID와 알림 타입 ID로 설정 조회
	@Query("SELECT ns FROM NotificationSetting ns WHERE ns.user.id = :userId AND ns.notificationType.id = :typeId")
	Optional<NotificationSetting> findByUserIdAndNotificationTypeId(
		@Param("userId") Integer userId,
		@Param("typeId") Integer typeId);

	@Query("""
		SELECT ns
		FROM NotificationSetting ns
		JOIN FETCH ns.user
		WHERE ns.user.id IN :userIds
		AND ns.notificationType.id = :notificationTypeId
		""")
	List<NotificationSetting> findAllUserIdInAndNotificationTypeId(List<Integer> userIds, Integer notificationTypeId);
}
