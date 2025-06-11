package com.eurachacha.achacha.application.service.gifticon;

import java.util.List;

import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.eurachacha.achacha.application.port.input.gifticon.GifticonUsageAppService;
import com.eurachacha.achacha.application.port.input.gifticon.dto.request.AmountGifticonUseRequestDto;
import com.eurachacha.achacha.application.port.input.gifticon.dto.response.AmountGifticonUsageHistoriesResponseDto;
import com.eurachacha.achacha.application.port.input.gifticon.dto.response.ProductGifticonUsageHistoryResponseDto;
import com.eurachacha.achacha.application.port.output.auth.SecurityServicePort;
import com.eurachacha.achacha.application.port.output.gifticon.GifticonRepository;
import com.eurachacha.achacha.application.port.output.history.UsageHistoryRepository;
import com.eurachacha.achacha.application.port.output.notification.NotificationRepository;
import com.eurachacha.achacha.application.port.output.notification.NotificationSettingRepository;
import com.eurachacha.achacha.application.port.output.notification.NotificationTypeRepository;
import com.eurachacha.achacha.application.port.output.notification.dto.request.NotificationEventDto;
import com.eurachacha.achacha.application.port.output.sharebox.ParticipationRepository;
import com.eurachacha.achacha.application.port.output.user.FcmTokenRepository;
import com.eurachacha.achacha.application.service.notification.event.NotificationEventMessage;
import com.eurachacha.achacha.domain.model.fcm.FcmToken;
import com.eurachacha.achacha.domain.model.gifticon.Gifticon;
import com.eurachacha.achacha.domain.model.history.UsageHistory;
import com.eurachacha.achacha.domain.model.notification.Notification;
import com.eurachacha.achacha.domain.model.notification.NotificationSetting;
import com.eurachacha.achacha.domain.model.notification.NotificationType;
import com.eurachacha.achacha.domain.model.notification.enums.NotificationTypeCode;
import com.eurachacha.achacha.domain.model.sharebox.Participation;
import com.eurachacha.achacha.domain.model.sharebox.ShareBox;
import com.eurachacha.achacha.domain.model.user.User;
import com.eurachacha.achacha.domain.service.gifticon.GifticonDomainService;
import com.eurachacha.achacha.domain.service.gifticon.GifticonUsageDomainService;
import com.eurachacha.achacha.domain.service.notification.NotificationSettingDomainService;
import com.eurachacha.achacha.web.common.exception.CustomException;
import com.eurachacha.achacha.web.common.exception.ErrorCode;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class GifticonUsageAppServiceImpl implements GifticonUsageAppService {

	private final ParticipationRepository participationRepository;
	private final GifticonRepository gifticonRepository;
	private final GifticonDomainService gifticonDomainService;
	private final GifticonUsageDomainService gifticonUsageDomainService;
	private final UsageHistoryRepository usageHistoryRepository;
	private final SecurityServicePort securityServicePort;
	private final NotificationRepository notificationRepository;
	private final FcmTokenRepository fcmTokenRepository;
	private final NotificationTypeRepository notificationTypeRepository;
	private final NotificationSettingRepository notificationSettingRepository;
	private final NotificationSettingDomainService notificationSettingDomainService;
	private final ApplicationEventPublisher applicationEventPublisher;

	@Override
	@Transactional
	public void useAmountGifticon(Integer gifticonId, AmountGifticonUseRequestDto requestDto) {

		// 로그인 된 유저
		User loggedInUser = securityServicePort.getLoggedInUser();
		Integer userId = loggedInUser.getId();

		// 해당 기프티콘 조회
		Gifticon findGifticon = gifticonRepository.findById(gifticonId);

		/*
		 * 사용가능 기프티콘 검증 로직
		 *  1. 삭제 여부 판단
		 *  2. 사용 여부 판단
		 *  3. 타입 판단
		 */
		gifticonDomainService.validateAmountGifticonForCommand(findGifticon);

		// 사용 권한 검증
		validateGifticonAccess(findGifticon, userId);

		// 잔액, 사용금액 검증
		gifticonUsageDomainService.validateSufficientBalance(findGifticon.getRemainingAmount(),
			requestDto.getUsageAmount());

		// 사용 처리
		findGifticon.use(requestDto.getUsageAmount());

		// 사용 기록 생성
		UsageHistory newUsageHistory = UsageHistory.builder()
			.user(loggedInUser) // 유저 로직 추가 시 변경 필요
			.gifticon(findGifticon)
			.usageAmount(requestDto.getUsageAmount())
			.build();

		// 사용 기록 처리
		usageHistoryRepository.saveUsageHistory(newUsageHistory);

		// 완전히 사용되고, 쉐어박스에 있는 기프티콘인 경우 알림 전송
		if (gifticonDomainService.isUsed(findGifticon) && findGifticon.getSharebox() != null) {
			sendShareBoxGifticonUsedNotification(findGifticon.getSharebox(), loggedInUser, findGifticon);
		}
	}

	@Override
	public AmountGifticonUsageHistoriesResponseDto getAmountGifticonUsageHistories(Integer gifticonId) {

		// 로그인 된 유저
		User loggedInUser = securityServicePort.getLoggedInUser();
		Integer userId = loggedInUser.getId();

		Gifticon findGifticon = gifticonRepository.findById(gifticonId);

		// 삭제 여부, 타입 검증
		gifticonDomainService.validateAmountGifticonUsageHistoryForGet(findGifticon);

		// 조회 권한 검증
		validateGifticonAccess(findGifticon, userId);

		// 사용 내역 조회
		List<UsageHistory> findUsageHistories = usageHistoryRepository.findAllByGifticonIdOrderByCreatedAtDesc(
			gifticonId);

		// entity -> dto로 변환
		List<AmountGifticonUsageHistoriesResponseDto.UsageHistoryDto> usageHistoryResponseDtos = findUsageHistories.stream()
			.map(history -> AmountGifticonUsageHistoriesResponseDto.UsageHistoryDto.builder()
				.usageHistoryId(history.getId())
				.usageAmount(history.getUsageAmount())
				.usageHistoryCreatedAt(history.getCreatedAt())
				.userId(history.getUser().getId())
				.userName(history.getUser().getName())
				.build())
			.toList();

		return AmountGifticonUsageHistoriesResponseDto.builder()
			.gifticonId(findGifticon.getId())
			.gifticonName(findGifticon.getName())
			.gifticonOriginalAmount(findGifticon.getOriginalAmount())
			.gifticonRemainingAmount(findGifticon.getRemainingAmount())
			.usageHistories(usageHistoryResponseDtos)
			.build();
	}

	@Override
	@Transactional
	public void updateAmountGifticonUsageHistory(Integer gifticonId, Integer usageHistoryId,
		AmountGifticonUseRequestDto requestDto) {

		// 로그인 된 유저
		User loggedInUser = securityServicePort.getLoggedInUser();
		Integer userId = loggedInUser.getId();

		// 해당 기프티콘 조회
		Gifticon findGifticon = gifticonRepository.findById(gifticonId);

		// 사용 가능한 기프티콘인지 확인
		gifticonDomainService.validateAmountGifticonForCommand(findGifticon);

		// 해당 사용 내역 조회
		UsageHistory findUsageHistory = usageHistoryRepository.findByIdAndGifticonIdAndUserId(usageHistoryId,
			gifticonId, userId);

		int newAmount = requestDto.getUsageAmount();

		// 잔액 및 사용 내역 업데이트
		findGifticon.updateRemainingAmount(
			gifticonUsageDomainService.calculateGifticonBalance(newAmount, findUsageHistory, findGifticon));
		findUsageHistory.updateUsageAmount(newAmount);

		// 완전히 사용되었고, 쉐어박스에 있는 기프티콘인 경우 알림 전송
		if (gifticonDomainService.isUsed(findGifticon) && findGifticon.getSharebox() != null) {
			sendShareBoxGifticonUsedNotification(findGifticon.getSharebox(), loggedInUser, findGifticon);
		}
	}

	@Override
	@Transactional
	public void deleteAmountGifticonUsageHistory(Integer gifticonId, Integer usageHistoryId) {

		// 로그인 된 유저
		User loggedInUser = securityServicePort.getLoggedInUser();
		Integer userId = loggedInUser.getId();

		// 해당 기프티콘 조회
		Gifticon findGifticon = gifticonRepository.findById(gifticonId);

		// 삭제, 사용, 타입 검증
		gifticonDomainService.validateAmountGifticonForCommand(findGifticon);

		// 해당 사용 내역 조회
		UsageHistory findUsageHistory = usageHistoryRepository.findByIdAndGifticonIdAndUserId(usageHistoryId,
			gifticonId, userId);

		// 삭제
		usageHistoryRepository.delete(findUsageHistory);
		// 잔액 복구
		findGifticon.updateRemainingAmount(findGifticon.getRemainingAmount() + findUsageHistory.getUsageAmount());
	}

	@Override
	@Transactional
	public void useProductGifticon(Integer gifticonId) {

		// 로그인 된 유저
		User loggedInUser = securityServicePort.getLoggedInUser();
		Integer userId = loggedInUser.getId();

		// 해당 기프티콘 조회
		Gifticon findGifticon = gifticonRepository.findById(gifticonId);

		/*
		 * 사용가능 기프티콘 검증 로직
		 *  1. 삭제 여부 판단
		 *  2. 사용 여부 판단
		 */
		gifticonDomainService.validateProductGifticonForCommand(findGifticon);

		// 사용 권한 검증
		validateGifticonAccess(findGifticon, userId);

		// 사용 처리
		findGifticon.use();

		// 사용 기록 생성
		UsageHistory newUsageHistory = UsageHistory.builder()
			.user(loggedInUser) // 유저 로직 추가 시 변경 필요
			.gifticon(findGifticon)
			.usageAmount(null)
			.build();

		// 사용 기록 처리
		usageHistoryRepository.saveUsageHistory(newUsageHistory);

		// 쉐어박스에 있는 기프티콘인 경우 알림 전송
		if (findGifticon.getSharebox() != null) {
			sendShareBoxGifticonUsedNotification(findGifticon.getSharebox(), loggedInUser, findGifticon);
		}
	}

	@Override
	public ProductGifticonUsageHistoryResponseDto getProductGifticonUsageHistories(Integer gifticonId) {

		// 로그인 된 유저
		User loggedInUser = securityServicePort.getLoggedInUser();
		Integer userId = loggedInUser.getId();

		Gifticon findGifticon = gifticonRepository.findById(gifticonId);

		// 사용, 삭제 여부 판단
		gifticonDomainService.validateProductGifticonUsageHistoryForGet(findGifticon);

		// 조회 권한 검증
		validateGifticonAccess(findGifticon, userId);

		// 사용 내역 조회
		UsageHistory findUsageHistory = usageHistoryRepository.findLatestByUserIdAndGifticonId(userId, gifticonId);

		// entity -> dto 변환
		ProductGifticonUsageHistoryResponseDto.UsageHistoryDto usageHistoryResponseDto = ProductGifticonUsageHistoryResponseDto.UsageHistoryDto
			.builder()
			.usageHistoryId(findUsageHistory.getId())
			.usageHistoryCreatedAt(findUsageHistory.getCreatedAt())
			.userId(findUsageHistory.getUser().getId())
			.userName(findUsageHistory.getUser().getName())
			.build();

		return ProductGifticonUsageHistoryResponseDto.builder()
			.gifticonId(findGifticon.getId())
			.gifticonName(findGifticon.getName())
			.usageHistory(usageHistoryResponseDto)
			.build();
	}

	private void validateGifticonAccess(Gifticon findGifticon, Integer userId) {
		// 공유되지 않은 기프티콘인 경우 소유자 판단
		if (findGifticon.getSharebox() == null) {
			boolean isOwner = gifticonDomainService.hasAccess(userId, findGifticon.getUser().getId());
			if (!isOwner) {
				throw new CustomException(ErrorCode.UNAUTHORIZED_GIFTICON_ACCESS);
			}
		}

		// 공유된 기프티콘인 경우 참여 여부 판단
		if (findGifticon.getSharebox() != null) {
			boolean hasParticipation = participationRepository.checkParticipation(userId,
				findGifticon.getSharebox().getId());
			if (!hasParticipation) {
				throw new CustomException(ErrorCode.UNAUTHORIZED_GIFTICON_ACCESS);
			}
		}
	}

	/**
	 * 쉐어박스 기프티콘 사용 알림을 전송합니다.
	 */
	private void sendShareBoxGifticonUsedNotification(ShareBox shareBox, User usedBy, Gifticon gifticon) {
		try {
			log.info("쉐어박스 기프티콘 사용 알림 전송 시작 - 쉐어박스 ID: {}, 기프티콘 ID: {}, 사용자 ID: {}",
				shareBox.getId(), gifticon.getId(), usedBy.getId());

			// 알림 타입 조회
			NotificationType notificationType = notificationTypeRepository.findByCode(
				NotificationTypeCode.SHAREBOX_USAGE_COMPLETE);
			String title = notificationType.getCode().getDisplayName();

			// 알림 내용 설정
			String content = String.format("%s 쉐어박스에 %s이(가) 사용되었어요.",
				shareBox.getName(), gifticon.getName());

			// 해당 쉐어박스의 모든 참여자 조회
			List<Participation> participations = participationRepository.findByShareBoxId(shareBox.getId());

			for (Participation participation : participations) {
				User participant = participation.getUser();
				Integer participantId = participant.getId();

				// 모든 참여자에게 알림 전송 (사용한 사용자 포함)
				sendNotificationToUser(participantId, notificationType, title, content,
					"sharebox", shareBox.getId());
			}

			log.info("쉐어박스 기프티콘 사용 알림 전송 완료 - 쉐어박스 ID: {}, 기프티콘 ID: {}",
				shareBox.getId(), gifticon.getId());
		} catch (Exception e) {
			// 알림 전송 실패시 로그만 남기고 계속 진행
			log.error("쉐어박스 기프티콘 사용 알림 전송 실패 - 쉐어박스 ID: {}, 기프티콘 ID: {}, 오류: {}",
				shareBox.getId(), gifticon.getId(), e.getMessage(), e);
		}
	}

	/**
	 * 지정된 사용자에게 알림을 전송합니다.
	 */
	private void sendNotificationToUser(Integer userId, NotificationType notificationType,
		String title, String content,
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
