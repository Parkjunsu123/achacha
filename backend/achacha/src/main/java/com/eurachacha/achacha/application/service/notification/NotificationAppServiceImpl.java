package com.eurachacha.achacha.application.service.notification;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.eurachacha.achacha.application.port.input.notification.NotificationAppService;
import com.eurachacha.achacha.application.port.input.notification.dto.request.LocationBasedNotificationRequestDto;
import com.eurachacha.achacha.application.port.input.notification.dto.response.NotificationCountResponseDto;
import com.eurachacha.achacha.application.port.input.notification.dto.response.NotificationResponseDto;
import com.eurachacha.achacha.application.port.input.notification.dto.response.NotificationsResponseDto;
import com.eurachacha.achacha.application.port.output.auth.SecurityServicePort;
import com.eurachacha.achacha.application.port.output.gifticon.GifticonRepository;
import com.eurachacha.achacha.application.port.output.notification.NotificationRepository;
import com.eurachacha.achacha.application.port.output.notification.NotificationSettingRepository;
import com.eurachacha.achacha.application.port.output.notification.NotificationTypeRepository;
import com.eurachacha.achacha.application.port.output.notification.dto.request.NotificationEventDto;
import com.eurachacha.achacha.application.port.output.user.FcmTokenRepository;
import com.eurachacha.achacha.application.service.notification.event.NotificationEventMessage;
import com.eurachacha.achacha.domain.model.brand.Brand;
import com.eurachacha.achacha.domain.model.fcm.FcmToken;
import com.eurachacha.achacha.domain.model.gifticon.Gifticon;
import com.eurachacha.achacha.domain.model.notification.Notification;
import com.eurachacha.achacha.domain.model.notification.NotificationSetting;
import com.eurachacha.achacha.domain.model.notification.NotificationType;
import com.eurachacha.achacha.domain.model.notification.enums.NotificationSortType;
import com.eurachacha.achacha.domain.model.notification.enums.NotificationTypeCode;
import com.eurachacha.achacha.domain.model.user.User;
import com.eurachacha.achacha.domain.service.notification.NotificationSettingDomainService;
import com.eurachacha.achacha.infrastructure.adapter.output.persistence.common.util.PageableFactory;
import com.eurachacha.achacha.web.common.exception.CustomException;
import com.eurachacha.achacha.web.common.exception.ErrorCode;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class NotificationAppServiceImpl implements NotificationAppService {

	private final NotificationRepository notificationRepository;
	private final PageableFactory pageableFactory;
	private final SecurityServicePort securityServicePort;
	private final NotificationTypeRepository notificationTypeRepository;
	private final NotificationSettingRepository notificationSettingRepository;
	private final FcmTokenRepository fcmTokenRepository;
	private final ApplicationEventPublisher applicationEventPublisher;
	private final NotificationSettingDomainService notificationSettingDomainService;
	private final GifticonRepository gifticonRepository;

	@Override
	public NotificationsResponseDto getNotifications(NotificationSortType sort, Integer page, Integer size) {
		log.info("알림 목록 조회 시작");

		User loggedInUser = securityServicePort.getLoggedInUser();
		Integer userId = loggedInUser.getId();

		// 페이징 처리
		Pageable pageable = pageableFactory.createPageable(page, size, sort);

		// 알림 목록 조회
		Slice<Notification> notificationSlice = notificationRepository.findNotifications(userId, pageable);

		// 알림이 없는 경우 빈 응답 반환
		if (notificationSlice.isEmpty()) {
			return NotificationsResponseDto.builder()
				.notifications(List.of())
				.hasNextPage(false)
				.nextPage(null)
				.build();
		}

		List<NotificationResponseDto> notificationResponseDtos = notificationSlice.getContent().stream()
			.map(notification -> NotificationResponseDto.builder()
				.notificationId(notification.getId())
				.notificationTitle(notification.getTitle())
				.notificationContent(notification.getContent())
				.notificationCreatedAt(notification.getCreatedAt())
				.notificationIsRead(notification.getIsRead())
				.notificationType(notification.getNotificationType().getCode())
				.referenceEntityType(notification.getReferenceEntityType())
				.referenceEntityId(notification.getReferenceEntityId())
				.build())
			.collect(Collectors.toList());

		return NotificationsResponseDto.builder()
			.notifications(notificationResponseDtos)
			.hasNextPage(notificationSlice.hasNext())
			.nextPage(notificationSlice.hasNext() ? page + 1 : null)
			.build();
	}

	@Override
	public NotificationCountResponseDto countUnreadNotifications(boolean read) {
		User user = securityServicePort.getLoggedInUser();
		int count = notificationRepository.countByUserIdAndRead(user.getId(), read);
		return NotificationCountResponseDto.builder()
			.count(count)
			.build();
	}

	@Override
	@Transactional
	public void markAllNotificationsAsRead() {
		User user = securityServicePort.getLoggedInUser();
		notificationRepository.updateAllNotificationsToRead(user.getId());
	}

	@Override
	@Transactional
	public void requestNotification(LocationBasedNotificationRequestDto requestDto) {
		User user = securityServicePort.getLoggedInUser();

		// 요청 기프티콘 조회
		Gifticon findGifticon = gifticonRepository.findById(requestDto.getGifticonId());

		Brand findBrand = findGifticon.getBrand();

		// 알림 타입 조회
		NotificationType notificationType = notificationTypeRepository.findByCode(
			NotificationTypeCode.LOCATION_BASED);

		String title = notificationType.getCode().getDisplayName();
		String content = "반경 50m 내에 " + findGifticon.getName() + "을(를) 사용할 수 있는 " + findBrand.getName() + "매장이 있어요!";

		sendNotificationToUser(user.getId(), notificationType, title, content, "gifticon", requestDto.getGifticonId());

	}

	/**
	 * 지정된 사용자에게 알림을 전송합니다.
	 */
	private void sendNotificationToUser(Integer userId, NotificationType notificationType, String title, String content,
		String referenceEntityType, Integer referenceEntityId) {

		// 항상 알림 정보는 데이터베이스에 저장
		saveNotification(userId, notificationType, title, content, referenceEntityType, referenceEntityId);

		// 사용자의 알림 설정 조회
		try {
			NotificationSetting setting = notificationSettingRepository.findByUserIdAndNotificationTypeId(
				userId, notificationType.getId());

			// 사용자가 해당 알림을 비활성화했으면 FCM 알림만 보내지 않음
			if (!notificationSettingDomainService.isEnabled(setting)) {
				log.info("사용자가 알림을 비활성화하여 FCM 알림은 전송하지 않음 - 알림 타입: {}, 사용자 ID: {}",
					notificationType.getCode(), userId);
				return;
			}
		} catch (CustomException e) {
			// 알림 설정이 없는 경우 기본적으로 FCM 알림을 보내지 않음
			if (e.getErrorCode() == ErrorCode.NOTIFICATION_SETTING_NOT_FOUND) {
				log.info("사용자의 알림 설정을 찾을 수 없어 FCM 알림은 전송하지 않음 - 사용자 ID: {}", userId);
				return;
			}
			throw e;
		}

		// FCM 토큰 조회 및 알림 전송
		sendPushNotification(userId, title, content, notificationType.getCode(), referenceEntityType,
			referenceEntityId);
	}

	/**
	 * 알림 정보를 저장합니다.
	 */
	private void saveNotification(Integer userId, NotificationType notificationType,
		String title, String content,
		String referenceEntityType, Integer referenceEntityId) {
		User user = User.builder().id(userId).build(); // 최소한의 정보만 포함

		Notification notification = Notification.builder()
			.title(title)
			.content(content)
			.referenceEntityType(referenceEntityType)
			.referenceEntityId(referenceEntityId)
			.notificationType(notificationType)
			.user(user)
			.isRead(false)
			.build();

		notificationRepository.save(notification);
		log.debug("알림 정보 저장 완료 - 사용자 ID: {}, 알림 타입: {}", userId, notificationType.getCode());
	}

	/**
	 * FCM을 통해 푸시 알림을 전송합니다.
	 */
	private void sendPushNotification(Integer userId, String title, String content,
		NotificationTypeCode typeCode,
		String referenceEntityType, Integer referenceEntityId) {
		// FCM 토큰 조회
		List<FcmToken> fcmTokens = fcmTokenRepository.findAllByUserId(userId);

		if (fcmTokens.isEmpty()) {
			log.info("사용자의 FCM 토큰이 없음 - 사용자 ID: {}", userId);
			return;
		}

		// 사용자의 모든 기기에 알림 전송
		for (FcmToken fcmToken : fcmTokens) {
			NotificationEventDto eventDto = NotificationEventDto.builder()
				.fcmToken(fcmToken.getValue())
				.title(title)
				.body(content)
				.userId(userId)
				.notificationTypeCode(typeCode.name())
				.referenceEntityId(referenceEntityId)
				.referenceEntityType(referenceEntityType)
				.build();

			applicationEventPublisher.publishEvent(new NotificationEventMessage(eventDto));
		}

		log.debug("푸시 알림 전송 완료 - 사용자 ID: {}", userId);
	}
}
