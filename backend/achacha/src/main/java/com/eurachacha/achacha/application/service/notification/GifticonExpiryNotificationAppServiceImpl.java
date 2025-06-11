package com.eurachacha.achacha.application.service.notification;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;

import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.eurachacha.achacha.application.port.input.notification.GifticonExpiryNotificationAppService;
import com.eurachacha.achacha.application.port.output.gifticon.GifticonRepository;
import com.eurachacha.achacha.application.port.output.notification.NotificationRepository;
import com.eurachacha.achacha.application.port.output.notification.NotificationSettingRepository;
import com.eurachacha.achacha.application.port.output.notification.NotificationTypeRepository;
import com.eurachacha.achacha.application.port.output.notification.dto.request.NotificationEventDto;
import com.eurachacha.achacha.application.port.output.sharebox.ParticipationRepository;
import com.eurachacha.achacha.application.port.output.user.FcmTokenRepository;
import com.eurachacha.achacha.application.service.notification.event.NotificationEventMessage;
import com.eurachacha.achacha.domain.model.fcm.FcmToken;
import com.eurachacha.achacha.domain.model.gifticon.Gifticon;
import com.eurachacha.achacha.domain.model.notification.Notification;
import com.eurachacha.achacha.domain.model.notification.NotificationSetting;
import com.eurachacha.achacha.domain.model.notification.NotificationType;
import com.eurachacha.achacha.domain.model.notification.enums.ExpirationCycle;
import com.eurachacha.achacha.domain.model.notification.enums.NotificationTypeCode;
import com.eurachacha.achacha.domain.model.sharebox.Participation;
import com.eurachacha.achacha.domain.service.gifticon.GifticonDomainService;
import com.eurachacha.achacha.domain.service.notification.NotificationSettingDomainService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class GifticonExpiryNotificationAppServiceImpl implements GifticonExpiryNotificationAppService {

	private final GifticonRepository gifticonRepository;
	private final GifticonDomainService gifticonDomainService;
	private final ParticipationRepository participationRepository;
	private final NotificationTypeRepository notificationTypeRepository;
	private final NotificationSettingRepository notificationSettingRepository;
	private final FcmTokenRepository fcmTokenRepository;
	private final ApplicationEventPublisher applicationEventPublisher;
	private final NotificationRepository notificationRepository;
	private final NotificationSettingDomainService notificationSettingDomainService;

	@Override
	@Transactional
	public void sendExpiryDateNotification() {

		LocalDate today = LocalDate.now();

		// 1, 2, 3, 7, 30, 60, 90일 남은 기프티콘 조회
		List<Gifticon> findGifticons = gifticonRepository.findGifticonsWithExpiryDates(getExpiryDates(today));

		if (findGifticons.isEmpty()) {
			return; // 해당하는 기프티콘이 없을 경우 종료
		}

		// 알림 타입 찾기
		NotificationType findCode = notificationTypeRepository.findByCode(NotificationTypeCode.EXPIRY_DATE);

		for (Gifticon findGifticon : findGifticons) {

			// 이미 공유된 기프티콘일 경우
			if (gifticonDomainService.isAlreadyShared(findGifticon)) {
				sharedGifticons(findGifticon, findCode, today);
				continue;
			}

			// 공유되지 않은 기프티콘일 경우
			unsharedGifticons(findGifticon, findCode, today);
		}
	}

	@Override
	@Transactional(propagation = Propagation.REQUIRES_NEW)
	public void sendExpiryDateNotificationForUser(Integer userId) {
		LocalDate today = LocalDate.now();
		log.info("사용자 유효기간 알림 처리 시작: 사용자ID={}, 오늘날짜={}", userId, today);

		// 알림 타입 찾기
		NotificationType findCode = notificationTypeRepository.findByCode(NotificationTypeCode.EXPIRY_DATE);
		log.info("알림 타입 조회 완료: 타입ID={}", findCode.getId());

		// 사용자 알림 설정 조회
		NotificationSetting findSetting = notificationSettingRepository
			.findByUserIdAndNotificationTypeId(userId, findCode.getId());

		log.info("사용자 알림 설정 조회: 설정ID={}, 활성화상태={}, 알림주기={}일",
			findSetting.getId(), findSetting.getIsEnabled(), findSetting.getExpirationCycle().getDays());

		// 알림 설정이 활성화되어 있지 않으면 종료
		if (!notificationSettingDomainService.isEnabled(findSetting)) {
			return;
		}

		// 알림 발송 대상 날짜 계산
		List<LocalDate> expiryDates = getExpiryDates(today);
		log.info("알림 대상 날짜 계산 완료: {}", expiryDates);

		// 단일 쿼리로 해당 사용자의 모든 관련 기프티콘 조회 (소유 + 공유받은)
		List<Gifticon> allRelevantGifticons = gifticonRepository.findAllRelevantGifticonsWithExpiryDates(
			getExpiryDates(today), userId);
		log.info("알림 대상 기프티콘 조회 완료: 사용자ID={}, 대상 기프티콘 수={}", userId, allRelevantGifticons.size());

		// 모든 관련 기프티콘에 대해 알림 처리
		for (Gifticon gifticon : allRelevantGifticons) {
			log.info("기프티콘 처리: ID={}, 이름={}, 만료일={}",
				gifticon.getId(), gifticon.getName(), gifticon.getExpiryDate());
			saveAndSendNotification(gifticon, findCode, today, findSetting);
		}
	}

	private void sharedGifticons(Gifticon findGifticon, NotificationType findCode, LocalDate today) {

		// 참여자 ID 목록 추출
		List<Integer> userIds = getUserIds(findGifticon);

		// 참여자 만료 알림 조회
		List<NotificationSetting> findSettings = notificationSettingRepository
			.findByUserIdInAndNotificationTypeId(userIds, findCode.getId());

		for (NotificationSetting findSetting : findSettings) {

			// 알림 전송
			saveAndSendNotification(findGifticon, findCode, today, findSetting);
		}
	}

	private void unsharedGifticons(Gifticon findGifticon, NotificationType findCode, LocalDate today) {

		// 사용자 알림 설정 조회
		NotificationSetting findSetting = notificationSettingRepository
			.findByUserIdAndNotificationTypeId(findGifticon.getUser().getId(), findCode.getId());

		// 알림 저장 및 전송
		saveAndSendNotification(findGifticon, findCode, today, findSetting);
	}

	private void saveAndSendNotification(Gifticon findGifticon, NotificationType findCode, LocalDate today,
		NotificationSetting findSetting) {
		// 알림 주기
		int day = findSetting.getExpirationCycle().getDays();
		log.info("알림 발송 검사 시작: 기프티콘={}, 만료일={}, 알림주기={}일",
			findGifticon.getId(), findGifticon.getExpiryDate(), day);

		List<LocalDate> expiryDates = getExpiryDates(today);

		boolean isExpiryMatch = expiryDates.stream()
			.anyMatch(expiryDate -> checkExpiryDate(findGifticon, today, expiryDate, day));

		// 만료일 확인 결과
		log.info("만료일 확인 결과: 기프티콘={}, 알림발송여부={}", findGifticon.getId(), isExpiryMatch);

		// 만료일 확인: 기프티콘의 만료일이 조회된 만료일 목록(1,2,3,7,30,60,90일 후)에 포함되고,
		// 알림 주기 확인: 만료일이 사용자의 알림 설정 주기보다 이른 경우에만 알림 발송
		if (isExpiryMatch) {
			String title = findCode.getCode().getDisplayName();
			String content = getContent(findGifticon);
			log.info("알림 생성: 제목={}, 내용={}", title, content);

			// 알림 저장
			saveNotification(findGifticon, findCode, findSetting, title, content);

			// 알림 설정 활성화 시 FCM 알림 전송
			if (notificationSettingDomainService.isEnabled(findSetting)) {
				// fcm token 조회
				List<FcmToken> findFcmTokens = fcmTokenRepository.findAllByUserId(findSetting.getUser().getId());
				log.info("FCM 토큰 조회 완료: 사용자={}, 토큰수={}", findSetting.getUser().getId(), findFcmTokens.size());

				findFcmTokens.forEach(fcmToken -> {
					log.info("FCM 알림 발송: 토큰={}", fcmToken.getValue());
					NotificationEventDto dto = NotificationEventDto.builder()
						.fcmToken(fcmToken.getValue())
						.title(title)
						.body(content)
						.userId(findSetting.getUser().getId())
						.notificationTypeCode(findCode.getCode().name())
						.referenceEntityId(findGifticon.getId())
						.referenceEntityType("gifticon")
						.build();

					applicationEventPublisher.publishEvent(new NotificationEventMessage(dto));
				});
			}
		}
	}

	private static boolean checkExpiryDate(Gifticon findGifticon, LocalDate today, LocalDate expiryDate, int day) {
		return findGifticon.getExpiryDate().equals(expiryDate) && (
			findGifticon.getExpiryDate().isBefore(today.plusDays(day)) || findGifticon.getExpiryDate()
				.isEqual(today.plusDays(day)));
	}

	private static String getContent(Gifticon findGifticon) {
		long calDays = findGifticon.getExpiryDate().toEpochDay() - LocalDate.now().toEpochDay();
		int day = (int)calDays;
		return findGifticon.getName() + "의 유효기간이 " + day + "일 남았습니다.";
	}

	private void saveNotification(Gifticon findGifticon, NotificationType findCode, NotificationSetting findSetting,
		String title, String content) {
		Notification notification = Notification.builder()
			.title(title)
			.content(content)
			.referenceEntityType("gifticon")
			.referenceEntityId(findGifticon.getId())
			.notificationType(findCode)
			.user(findSetting.getUser())
			.isRead(false)
			.build();

		// 알림 저장
		notificationRepository.save(notification);
	}

	private List<Integer> getUserIds(Gifticon findGifticon) {
		// 참여된 유저 리스트
		List<Participation> findParticipations = participationRepository
			.findByShareBoxId(findGifticon.getSharebox().getId());

		// 참여자 ID 목록 추출
		return findParticipations.stream()
			.map(p -> p.getUser().getId())
			.toList();
	}

	private List<LocalDate> getExpiryDates(LocalDate today) {
		return Arrays.stream(ExpirationCycle.values())
			.map(cycle -> today.plusDays(cycle.getDays()))
			.toList();
	}
}
