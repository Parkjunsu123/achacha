package com.eurachacha.achacha.infrastructure.adapter.output.persistence.notification;

import java.util.List;

import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.data.domain.SliceImpl;

import com.eurachacha.achacha.domain.model.notification.Notification;
import com.eurachacha.achacha.domain.model.notification.QNotification;
import com.eurachacha.achacha.domain.model.notification.QNotificationType;
import com.eurachacha.achacha.infrastructure.adapter.output.persistence.common.util.QueryUtils;
import com.querydsl.jpa.impl.JPAQueryFactory;

import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public class NotificationRepositoryCustomImpl implements NotificationRepositoryCustom {
	private final JPAQueryFactory jpaQueryFactory;

	@Override
	public Slice<Notification> findNotifications(Integer userId, Pageable pageable) {
		QNotification qNotification = QNotification.notification;
		QNotificationType qNotificationType = QNotificationType.notificationType;
		
		List<Notification> notifications = jpaQueryFactory
			.selectFrom(qNotification)
			.join(qNotification.notificationType, qNotificationType).fetchJoin() // 알림 타입 정보를 한 번에 가져오기 위한 fetch join
			.join(qNotification.user).fetchJoin() // 사용자 정보도 함께 가져오기
			.where(qNotification.user.id.eq(userId))
			.orderBy(QueryUtils.getOrderSpecifier(pageable.getSort(), qNotification))
			.offset(pageable.getOffset())
			.limit(pageable.getPageSize() + 1) // 다음 페이지 존재 여부 확인을 위해 1개 더 가져옴
			.fetch();

		// 다음 페이지 존재 여부 확인
		boolean hasNext = notifications.size() > pageable.getPageSize();
		if (hasNext) {
			notifications = notifications.subList(0, pageable.getPageSize());
		}

		return new SliceImpl<>(notifications, pageable, hasNext);
	}
}