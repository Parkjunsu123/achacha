package com.eurachacha.achacha.infrastructure.adapter.output.persistence.notification;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.eurachacha.achacha.domain.model.notification.Notification;

@Repository
public interface NotificationJpaRepository extends JpaRepository<Notification, Integer>, NotificationRepositoryCustom {

	int countByUserIdAndIsRead(Integer userId, boolean read);

	@Modifying
	@Query("UPDATE Notification n SET n.isRead = true WHERE n.user.id = :userId AND n.isRead = false")
	void updateAllNotificationsToRead(@Param("userId") Integer userId);
}
