package com.eurachacha.achacha.application.service.gifticon;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Random;
import java.util.stream.Collectors;

import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.eurachacha.achacha.application.port.input.gifticon.GifticonGiveAppService;
import com.eurachacha.achacha.application.port.input.gifticon.dto.request.GifticonPresentRequestDto;
import com.eurachacha.achacha.application.port.input.gifticon.dto.response.GifticonPresentResponseDto;
import com.eurachacha.achacha.application.port.output.auth.SecurityServicePort;
import com.eurachacha.achacha.application.port.output.ble.BleTokenRepository;
import com.eurachacha.achacha.application.port.output.gifticon.GifticonRepository;
import com.eurachacha.achacha.application.port.output.history.GifticonOwnerHistoryRepository;
import com.eurachacha.achacha.application.port.output.notification.NotificationRepository;
import com.eurachacha.achacha.application.port.output.notification.NotificationSettingRepository;
import com.eurachacha.achacha.application.port.output.notification.NotificationTypeRepository;
import com.eurachacha.achacha.application.port.output.notification.dto.request.NotificationEventDto;
import com.eurachacha.achacha.application.port.output.present.ColorPaletteRepository;
import com.eurachacha.achacha.application.port.output.present.PresentCardRepository;
import com.eurachacha.achacha.application.port.output.present.PresentTemplateRepository;
import com.eurachacha.achacha.application.port.output.user.FcmTokenRepository;
import com.eurachacha.achacha.application.service.notification.event.NotificationEventMessage;
import com.eurachacha.achacha.domain.model.ble.BleToken;
import com.eurachacha.achacha.domain.model.fcm.FcmToken;
import com.eurachacha.achacha.domain.model.gifticon.Gifticon;
import com.eurachacha.achacha.domain.model.gifticon.enums.GifticonType;
import com.eurachacha.achacha.domain.model.history.GifticonOwnerHistory;
import com.eurachacha.achacha.domain.model.history.enums.TransferType;
import com.eurachacha.achacha.domain.model.notification.Notification;
import com.eurachacha.achacha.domain.model.notification.NotificationSetting;
import com.eurachacha.achacha.domain.model.notification.NotificationType;
import com.eurachacha.achacha.domain.model.notification.enums.NotificationTypeCode;
import com.eurachacha.achacha.domain.model.present.ColorPalette;
import com.eurachacha.achacha.domain.model.present.PresentCard;
import com.eurachacha.achacha.domain.model.present.PresentTemplate;
import com.eurachacha.achacha.domain.model.present.enums.TemplateCategory;
import com.eurachacha.achacha.domain.model.user.User;
import com.eurachacha.achacha.domain.service.gifticon.GifticonDomainService;
import com.eurachacha.achacha.domain.service.gifticon.GifticonGiveDomainService;
import com.eurachacha.achacha.domain.service.notification.NotificationSettingDomainService;
import com.eurachacha.achacha.web.common.exception.CustomException;
import com.eurachacha.achacha.web.common.exception.ErrorCode;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class GifticonGiveAppServiceImpl implements GifticonGiveAppService {
	private static final int MAX_ATTEMPTS = 3;

	private final GifticonRepository gifticonRepository;
	private final GifticonDomainService gifticonDomainService;
	private final BleTokenRepository bleTokenRepository;
	private final GifticonOwnerHistoryRepository gifticonOwnerHistoryRepository;
	private final SecurityServicePort securityServicePort;
	private final GifticonGiveDomainService gifticonGiveDomainService;
	private final PresentTemplateRepository presentTemplateRepository;
	private final ColorPaletteRepository colorPaletteRepository;
	private final PresentCardRepository presentCardRepository;
	private final NotificationTypeRepository notificationTypeRepository;
	private final NotificationRepository notificationRepository;
	private final FcmTokenRepository fcmTokenRepository;
	private final NotificationSettingRepository notificationSettingRepository;
	private final NotificationSettingDomainService notificationSettingDomainService;
	private final ApplicationEventPublisher applicationEventPublisher;

	@Override
	@Transactional
	public void giveAwayGifticon(Integer gifticonId, List<String> uuids) {
		log.info("기프티콘 뿌리기 시작 - gifticonId: {}, uuids 개수: {}", gifticonId, uuids.size());

		// 들어온 UUID 목록 로그로 남기기
		log.info("수신된 UUID 목록: {}", uuids);
		
		// 로그인 된 유저
		User loggedInUser = securityServicePort.getLoggedInUser();
		Integer userId = loggedInUser.getId();
		log.info("뿌리기 요청 유저 ID: {}", userId);

		Gifticon findGifticon = gifticonRepository.getGifticonDetail(gifticonId);
		log.info("뿌릴 기프티콘 정보 - name: {}, type: {}", findGifticon.getName(), findGifticon.getType());

		// 삭제, 사용, 공유 여부, 타입 검증
		gifticonDomainService.validateGifticonForGiveAway(userId, findGifticon);
		log.info("기프티콘 유효성 검증 완료");

		// 유효한 uuid만 필터링
		List<String> validUuids = bleTokenRepository.findValuesByValueIn(uuids);
		log.info("유효한 UUID 개수: {}/{}", validUuids.size(), uuids.size());

		// 유효한 UUID가 있는지 확인
		if (validUuids.isEmpty()) {
			log.info("주변에 유효한 사용자가 없음 - gifticonId: {}", gifticonId);
			throw new CustomException(ErrorCode.NO_NEARBY_PEOPLES);
		}

		String selectedUuid = getRandomUuid(validUuids);
		log.info("무작위 선택된 UUID: {}", selectedUuid);

		// 받는 사람 ble 토큰 객체
		BleToken findToken = bleTokenRepository.findByValue(selectedUuid);

		// 받는 사람 객체
		User receiverUser = findToken.getUser();
		log.info("선택된 수신자 ID: {}", receiverUser.getId());

		// 기프티콘 소유권 업데이트
		findGifticon.updateUser(receiverUser);
		log.info("기프티콘 소유권 업데이트 완료");

		// 기프티콘 생성 시간 업데이트 (수신자 입장으로는 받은 시간이 생성시간이기 때문)
		findGifticon.updateCreatedAt(LocalDateTime.now());
		log.info("기프티콘 생성 시간 업데이트 완료");

		GifticonOwnerHistory newGifticonOwnerHistory = GifticonOwnerHistory.builder()
			.gifticon(findGifticon)
			.fromUser(loggedInUser) // 유저 로직 추가 시 변경 필요
			.toUser(receiverUser)
			.transferType(TransferType.GIVE_AWAY)
			.build();

		// 전송 내역 저장
		gifticonOwnerHistoryRepository.save(newGifticonOwnerHistory);
		log.info("기프티콘 소유권 이전 내역 저장 완료");

		// 알림 타입 조회
		NotificationType notificationType = notificationTypeRepository.findByCode(
			NotificationTypeCode.RECEIVE_GIFTICON);

		String title = notificationType.getCode().getDisplayName();
		String content = "뿌리기 선물! " + findGifticon.getName() + "이(가) 도착했어요.";

		sendNotificationToUser(receiverUser.getId(), notificationType, title, content, "gifticon", gifticonId);
		log.info("기프티콘 뿌리기 완료 - 발신자: {}, 수신자: {}, 기프티콘: {}", userId, receiverUser.getId(), findGifticon.getName());
	}

	@Override
	@Transactional
	public GifticonPresentResponseDto presentGifticon(Integer gifticonId,
		GifticonPresentRequestDto gifticonPresentRequestDto) {
		User user = securityServicePort.getLoggedInUser();

		Gifticon gifticon = gifticonRepository.getGifticonDetail(gifticonId);

		// 기프티콘 검증
		gifticonDomainService.validateGifticonForPresent(user.getId(), gifticon);

		// 선물카드 템플릿 검증
		PresentTemplate presentTemplate = presentTemplateRepository.findById(
			gifticonPresentRequestDto.getPresentTemplateId());

		// GENERAL 타입인 경우 색상 정보 검증
		ColorPalette colorPalette = null;
		if (presentTemplate.getCategory().equals(TemplateCategory.GENERAL)) {
			colorPalette = colorPaletteRepository.findByColorPaletteId(gifticonPresentRequestDto.getColorPaletteId());
		}

		// 기프티콘 사용 완료 처리
		if (gifticon.getType() == GifticonType.AMOUNT) {
			gifticon.use(gifticon.getOriginalAmount()); // 금액형
		} else {
			gifticon.use(); // 상품형
		}

		// 기프티콘 소유자 변경 내역 저장
		GifticonOwnerHistory newGifticonOwnerHistory = GifticonOwnerHistory.builder()
			.gifticon(gifticon)
			.fromUser(user)
			.toUser(null) // 선물의 경우 받는 사람은 null 처리
			.transferType(TransferType.PRESENT)
			.build();
		gifticonOwnerHistoryRepository.save(newGifticonOwnerHistory);

		// 고유한 선물카드 코드 생성
		String presentCardCode = generateUniquePresentCardCode();

		// 선물 카드 저장
		PresentCard presentCard = PresentCard.builder()
			.code(presentCardCode)
			.message(gifticonPresentRequestDto.getMessage())
			.user(user)
			.gifticon(gifticon)
			.presentTemplate(presentTemplate)
			.colorPalette(colorPalette)
			.build();
		presentCardRepository.save(presentCard);

		return GifticonPresentResponseDto.builder()
			.presentCardCode(presentCardCode)
			.gifticonName(gifticon.getName())
			.brandName(gifticon.getBrand().getName())
			.build();
	}

	@Override
	@Transactional
	public void cancelPresentGifticon(Integer gifticonId) {
		User user = securityServicePort.getLoggedInUser();
		Gifticon gifticon = gifticonRepository.findById(gifticonId);

		// 본인 소유인지 확인
		gifticonDomainService.validateGifticonForPresentCancel(user.getId(), gifticon);

		// 기프티콘 사용 완료 취소
		gifticon.cancelUse();

		// 금액형 잔액 되돌리기
		if (gifticon.getType() == GifticonType.AMOUNT) {
			gifticon.updateRemainingAmount(gifticon.getOriginalAmount());
		}

		// 기프티콘 소유자 변경 내역 삭제
		gifticonOwnerHistoryRepository.deleteByGifticonIdAndTransferType(gifticonId, TransferType.PRESENT);

		// 선물 카드 삭제
		presentCardRepository.deleteByGifticonId(gifticonId);
	}

	private String getRandomUuid(List<String> validUuids) {
		Random random = new Random();
		return validUuids.get(random.nextInt(validUuids.size()));
	}

	// 고유한 선물카드 코드 생성 메서드
	private String generateUniquePresentCardCode() {

		SecureRandom random = new SecureRandom();
		String presentCardCode;
		int attempts = 0;

		// 도메인 서비스에서 정의한 규칙 활용
		String allowedCharacters = gifticonGiveDomainService.getAllowedCharacters();
		int codeLength = gifticonGiveDomainService.getRecommendedPresentCardCodeLength();

		do {
			if (attempts >= MAX_ATTEMPTS) {
				throw new CustomException(ErrorCode.PRESENT_CODE_GENERATION_FAILED);
			}

			presentCardCode = random.ints(codeLength, 0, allowedCharacters.length())
				.mapToObj(i -> String.valueOf(allowedCharacters.charAt(i)))
				.collect(Collectors.joining());

			attempts++;
		} while (presentCardRepository.existsByPresentCardCode(presentCardCode));

		return presentCardCode;
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
