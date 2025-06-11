package com.eurachacha.achacha.application.service.fcm;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.BDDMockito.*;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;

import com.eurachacha.achacha.application.port.output.gifticon.GifticonRepository;
import com.eurachacha.achacha.application.port.output.notification.NotificationRepository;
import com.eurachacha.achacha.application.port.output.notification.NotificationSettingRepository;
import com.eurachacha.achacha.application.port.output.notification.NotificationTypeRepository;
import com.eurachacha.achacha.application.port.output.sharebox.ParticipationRepository;
import com.eurachacha.achacha.application.port.output.user.FcmTokenRepository;
import com.eurachacha.achacha.application.service.notification.GifticonExpiryNotificationAppServiceImpl;
import com.eurachacha.achacha.application.service.notification.event.NotificationEventMessage;
import com.eurachacha.achacha.domain.model.brand.Brand;
import com.eurachacha.achacha.domain.model.fcm.FcmToken;
import com.eurachacha.achacha.domain.model.gifticon.Gifticon;
import com.eurachacha.achacha.domain.model.notification.Notification;
import com.eurachacha.achacha.domain.model.notification.NotificationSetting;
import com.eurachacha.achacha.domain.model.notification.NotificationType;
import com.eurachacha.achacha.domain.model.notification.enums.ExpirationCycle;
import com.eurachacha.achacha.domain.model.notification.enums.NotificationTypeCode;
import com.eurachacha.achacha.domain.model.sharebox.Participation;
import com.eurachacha.achacha.domain.model.sharebox.ShareBox;
import com.eurachacha.achacha.domain.model.user.User;
import com.eurachacha.achacha.domain.service.gifticon.GifticonDomainService;
import com.eurachacha.achacha.domain.service.notification.NotificationSettingDomainService;

@ExtendWith(MockitoExtension.class)
class GifticonExpiryNotificationAppServiceImplTest {

	@Mock
	private GifticonRepository gifticonRepository;

	@Mock
	private GifticonDomainService gifticonDomainService;

	@Mock
	private ParticipationRepository participationRepository;

	@Mock
	private NotificationTypeRepository notificationTypeRepository;

	@Mock
	private NotificationSettingRepository notificationSettingRepository;

	@Mock
	private FcmTokenRepository fcmTokenRepository;

	// NotificationEventPort 대신 ApplicationEventPublisher을 모킹합니다.
	@Mock
	private ApplicationEventPublisher applicationEventPublisher;

	@Mock
	private NotificationRepository notificationRepository;

	@Mock
	private NotificationSettingDomainService notificationSettingDomainService;

	@InjectMocks
	private GifticonExpiryNotificationAppServiceImpl fcmAppService;

	@Test
	@DisplayName("유효기간 만료 예정 알림 전송 - 본인이 소유한 기프티콘에 대한 알림은 성공적으로 전송되어야 한다.")
	void sendExpiryDateNotification_WhenUnsharedGifticon_ThenSuccessfullySendNotification() {
		// given
		LocalDate today = LocalDate.now();

		// 테스트용 사용자, 브랜드, 기프티콘 생성
		User user = User.builder().id(1).name("테스트 사용자").build();
		Brand brand = Brand.builder().id(1).name("테스트 브랜드").build();

		// 30일 후 만료 예정인 기프티콘 (비공유)
		Gifticon gifticon = Gifticon.builder()
			.id(1)
			.name("테스트 기프티콘")
			.user(user)
			.brand(brand)
			.expiryDate(today.plusDays(30)) // 30일 후 만료
			.sharebox(null) // 공유되지 않은 기프티콘
			.build();

		NotificationType notificationType = NotificationType.builder()
			.id(1)
			.code(NotificationTypeCode.EXPIRY_DATE)
			.build();

		NotificationSetting notificationSetting = NotificationSetting.builder()
			.id(1)
			.user(user)
			.notificationType(notificationType)
			.expirationCycle(ExpirationCycle.ONE_MONTH) // 30일 전 알림 설정
			.isEnabled(true)
			.build();

		FcmToken fcmToken = FcmToken.builder()
			.id(1)
			.user(user)
			.value("test_fcm_token")
			.build();

		// mock 설정
		given(gifticonRepository.findGifticonsWithExpiryDates(anyList())).willReturn(List.of(gifticon));
		given(notificationTypeRepository.findByCode(NotificationTypeCode.EXPIRY_DATE)).willReturn(notificationType);
		given(gifticonDomainService.isAlreadyShared(gifticon)).willReturn(false); // 공유되지 않은 기프티콘
		given(notificationSettingRepository.findByUserIdAndNotificationTypeId(user.getId(), notificationType.getId()))
			.willReturn(notificationSetting);
		given(fcmTokenRepository.findAllByUserId(user.getId())).willReturn(List.of(fcmToken));
		given(notificationSettingDomainService.isEnabled(notificationSetting)).willReturn(true);

		// when
		fcmAppService.sendExpiryDateNotification();

		// then
		// 알림 저장 검증
		ArgumentCaptor<Notification> notificationCaptor = ArgumentCaptor.forClass(Notification.class);
		verify(notificationRepository).save(notificationCaptor.capture());
		Notification capturedNotification = notificationCaptor.getValue();

		verify(notificationRepository, times(1)).save(any(Notification.class));

		// ApplicationEventPublisher로 이벤트 발행 검증
		ArgumentCaptor<NotificationEventMessage> eventMessageCaptor = ArgumentCaptor.forClass(
			NotificationEventMessage.class);
		verify(applicationEventPublisher).publishEvent(eventMessageCaptor.capture());
		NotificationEventMessage capturedEventMessage = eventMessageCaptor.getValue();

		verify(applicationEventPublisher, times(1)).publishEvent(any(NotificationEventMessage.class));

		// 이벤트 메시지의 EventDto 검증
		assertThat(capturedEventMessage.getEventDto().getFcmToken()).isEqualTo("test_fcm_token");
		assertThat(capturedEventMessage.getEventDto().getUserId()).isEqualTo(user.getId());
		assertThat(capturedEventMessage.getEventDto().getReferenceEntityId()).isEqualTo(gifticon.getId());
	}

	@Test
	@DisplayName("유효기간 만료 예정 알림 전송 - 참여한 쉐어박스에 공유된 기프티콘에 대한 알림은 성공적으로 전송되어야 한다.")
	void sendExpiryDateNotification_WhenSharedGifticon_ThenSuccessfullySendNotification() {
		// given
		LocalDate today = LocalDate.now();

		// 테스트용 사용자, 브랜드, 공유박스 생성
		User owner = User.builder().id(1).name("소유자").build();
		User participant = User.builder().id(2).name("참여자").build();
		Brand brand = Brand.builder().id(1).name("테스트 브랜드").build();
		ShareBox shareBox = ShareBox.builder().id(1).name("테스트 공유박스").build();

		// 공유 참여자 생성
		Participation participation1 = Participation.builder()
			.id(1)
			.user(owner)
			.sharebox(shareBox)
			.build();

		Participation participation2 = Participation.builder()
			.id(2)
			.user(participant)
			.sharebox(shareBox)
			.build();

		// 30일 후 만료 예정인 공유 기프티콘
		Gifticon gifticon = Gifticon.builder()
			.id(1)
			.name("테스트 공유 기프티콘")
			.user(owner)
			.brand(brand)
			.expiryDate(today.plusDays(30)) // 30일 후 만료
			.sharebox(shareBox) // 공유 기프티콘
			.build();

		NotificationType notificationType = NotificationType.builder()
			.id(1)
			.code(NotificationTypeCode.EXPIRY_DATE)
			.build();

		// 소유자: 30일 전 알림, 활성화
		NotificationSetting setting1 = NotificationSetting.builder()
			.id(1)
			.user(owner)
			.notificationType(notificationType)
			.expirationCycle(ExpirationCycle.ONE_MONTH) // 30일 전 알림 설정
			.isEnabled(true)
			.build();

		// 참여자: 30일 전 알림, 활성화
		NotificationSetting setting2 = NotificationSetting.builder()
			.id(2)
			.user(participant)
			.notificationType(notificationType)
			.expirationCycle(ExpirationCycle.ONE_MONTH) // 30일 전 알림 설정
			.isEnabled(true)
			.build();

		FcmToken fcmToken1 = FcmToken.builder()
			.id(1)
			.user(owner)
			.value("test_fcm_token_1")
			.build();

		FcmToken fcmToken2 = FcmToken.builder()
			.id(2)
			.user(participant)
			.value("test_fcm_token_2")
			.build();

		// mock 설정
		given(gifticonRepository.findGifticonsWithExpiryDates(anyList())).willReturn(List.of(gifticon));
		given(notificationTypeRepository.findByCode(NotificationTypeCode.EXPIRY_DATE)).willReturn(notificationType);
		given(gifticonDomainService.isAlreadyShared(gifticon)).willReturn(true); // 공유 기프티콘

		given(participationRepository.findByShareBoxId(shareBox.getId())).willReturn(
			List.of(participation1, participation2));
		given(notificationSettingRepository.findByUserIdInAndNotificationTypeId(
			List.of(owner.getId(), participant.getId()), notificationType.getId()))
			.willReturn(List.of(setting1, setting2));

		given(fcmTokenRepository.findAllByUserId(owner.getId())).willReturn(List.of(fcmToken1));
		given(fcmTokenRepository.findAllByUserId(participant.getId())).willReturn(List.of(fcmToken2));
		given(notificationSettingDomainService.isEnabled(setting1)).willReturn(true);
		given(notificationSettingDomainService.isEnabled(setting2)).willReturn(true);

		// when
		fcmAppService.sendExpiryDateNotification();

		// then
		// 두 참여자 모두에게 알림 저장 및 전송
		verify(notificationRepository, times(2)).save(any(Notification.class));
		verify(applicationEventPublisher, times(2)).publishEvent(any(NotificationEventMessage.class));

		// 알림 저장 검증
		ArgumentCaptor<Notification> notificationCaptor = ArgumentCaptor.forClass(Notification.class);
		verify(notificationRepository, times(2)).save(notificationCaptor.capture());
		List<Notification> capturedNotifications = notificationCaptor.getAllValues();

		// 두 알림이 각각 다른 사용자에게 저장되었는지 확인
		assertThat(capturedNotifications).hasSize(2);
		List<Integer> userIds = capturedNotifications.stream()
			.map(n -> n.getUser().getId())
			.toList();
		assertThat(userIds).containsExactlyInAnyOrder(owner.getId(), participant.getId());

		// 알림 이벤트 전송 검증
		ArgumentCaptor<NotificationEventMessage> eventMessageCaptor = ArgumentCaptor.forClass(
			NotificationEventMessage.class);
		verify(applicationEventPublisher, times(2)).publishEvent(eventMessageCaptor.capture());
		List<NotificationEventMessage> capturedEventMessages = eventMessageCaptor.getAllValues();

		// 두 알림 이벤트가 발송되었는지 확인
		assertThat(capturedEventMessages).hasSize(2);
		List<String> fcmTokens = capturedEventMessages.stream()
			.map(message -> message.getEventDto().getFcmToken())
			.toList();
		assertThat(fcmTokens).containsExactlyInAnyOrder("test_fcm_token_1", "test_fcm_token_2");
	}

	@Test
	@DisplayName("유효기간 만료 예정 알림 전송 - 알림 설정이 비활성화된 경우 FCM 알림은 전송하지 않고 성공적으로 저장되어야 한다.")
	void sendExpiryDateNotification_WhenNotificationDisabled_ThenOnlySaveNotification() {
		// given
		LocalDate today = LocalDate.now();

		// 테스트용 사용자, 브랜드, 기프티콘 생성
		User user = User.builder().id(1).name("테스트 사용자").build();
		Brand brand = Brand.builder().id(1).name("테스트 브랜드").build();

		// 3일 후 만료 예정인 기프티콘 (비공유)
		Gifticon gifticon = Gifticon.builder()
			.id(1)
			.name("테스트 기프티콘")
			.user(user)
			.brand(brand)
			.expiryDate(today.plusDays(3)) // 3일 후 만료
			.sharebox(null) // 공유되지 않은 기프티콘
			.build();

		NotificationType notificationType = NotificationType.builder()
			.id(1)
			.code(NotificationTypeCode.EXPIRY_DATE)
			.build();

		NotificationSetting notificationSetting = NotificationSetting.builder()
			.id(1)
			.user(user)
			.notificationType(notificationType)
			.expirationCycle(ExpirationCycle.THREE_DAYS) // 3일 전 알림 설정
			.isEnabled(false) // 알림 비활성화
			.build();

		// mock 설정
		given(gifticonRepository.findGifticonsWithExpiryDates(anyList())).willReturn(List.of(gifticon));
		given(notificationTypeRepository.findByCode(NotificationTypeCode.EXPIRY_DATE)).willReturn(notificationType);
		given(gifticonDomainService.isAlreadyShared(gifticon)).willReturn(false); // 공유되지 않은 기프티콘
		given(notificationSettingRepository.findByUserIdAndNotificationTypeId(user.getId(), notificationType.getId()))
			.willReturn(notificationSetting);
		given(notificationSettingDomainService.isEnabled(notificationSetting)).willReturn(false); // 알림 비활성화

		// when
		fcmAppService.sendExpiryDateNotification();

		// then
		// 알림 저장은 수행하지만
		verify(notificationRepository, times(1)).save(any(Notification.class));

		// FCM 토큰 조회 및 알림 전송은 수행하지 않음
		verify(fcmTokenRepository, never()).findAllByUserId(anyInt());
		verify(applicationEventPublisher, never()).publishEvent(any(NotificationEventMessage.class));
	}

	@Test
	@DisplayName("유효기간 만료 예정 알림 전송 - 만료 예정 기프티콘이 없는 경우 알림을 전송하지 않는다.")
	void sendExpiryDateNotification_WhenNoGifticons_ThenDoNothing() {
		// given
		given(gifticonRepository.findGifticonsWithExpiryDates(anyList())).willReturn(Collections.emptyList());

		// when
		fcmAppService.sendExpiryDateNotification();

		// then
		verify(notificationTypeRepository, never()).findByCode(any());
		verify(gifticonDomainService, never()).isAlreadyShared(any());
		verify(notificationSettingRepository, never()).findByUserIdAndNotificationTypeId(anyInt(), anyInt());
		verify(notificationSettingRepository, never()).findByUserIdInAndNotificationTypeId(anyList(), anyInt());
		verify(notificationRepository, never()).save(any());
		verify(applicationEventPublisher, never()).publishEvent(any());
	}

	@Test
	@DisplayName("유효기간 만료 예정 알림 전송 - 알림 주기와 같거나 더 짧은 만료일의 기프티콘에 대해 알림을 전송한다.")
	void sendExpiryDateNotification_WhenExpiryDateSameOrEarlierThanNotificationPeriod_ThenSendNotification() {
		// given
		LocalDate today = LocalDate.now();

		// 테스트용 사용자, 브랜드 생성
		User user = User.builder().id(1).name("테스트 사용자").build();
		Brand brand = Brand.builder().id(1).name("테스트 브랜드").build();

		// 90일 후 만료 기프티콘 (비공유) - 알림 주기와 같은 날짜
		Gifticon gifticon90 = Gifticon.builder()
			.id(1)
			.name("테스트 기프티콘 90일")
			.user(user)
			.brand(brand)
			.expiryDate(today.plusDays(90)) // 90일 후 만료
			.sharebox(null) // 공유되지 않은 기프티콘
			.build();

		// 30일 후 만료 기프티콘 (비공유) - 알림 주기보다 짧은 날짜
		Gifticon gifticon30 = Gifticon.builder()
			.id(2)
			.name("테스트 기프티콘 30일")
			.user(user)
			.brand(brand)
			.expiryDate(today.plusDays(30)) // 30일 후 만료
			.sharebox(null) // 공유되지 않은 기프티콘
			.build();

		NotificationType notificationType = NotificationType.builder()
			.id(1)
			.code(NotificationTypeCode.EXPIRY_DATE)
			.build();

		NotificationSetting notificationSetting = NotificationSetting.builder()
			.id(1)
			.user(user)
			.notificationType(notificationType)
			.expirationCycle(ExpirationCycle.THREE_MONTHS) // 90일 전 알림 설정
			.isEnabled(true)
			.build();

		FcmToken fcmToken = FcmToken.builder()
			.id(1)
			.user(user)
			.value("test_fcm_token")
			.build();

		// mock 설정
		given(gifticonRepository.findGifticonsWithExpiryDates(anyList())).willReturn(List.of(gifticon90, gifticon30));
		given(notificationTypeRepository.findByCode(NotificationTypeCode.EXPIRY_DATE)).willReturn(notificationType);
		given(gifticonDomainService.isAlreadyShared(any(Gifticon.class))).willReturn(false); // 공유되지 않은 기프티콘
		given(notificationSettingRepository.findByUserIdAndNotificationTypeId(user.getId(), notificationType.getId()))
			.willReturn(notificationSetting);
		given(fcmTokenRepository.findAllByUserId(user.getId())).willReturn(List.of(fcmToken));
		given(notificationSettingDomainService.isEnabled(notificationSetting)).willReturn(true);

		// when
		fcmAppService.sendExpiryDateNotification();

		// then
		// 두 기프티콘 모두에 대해 알림 저장 및 전송이 이루어짐 (총 2회)
		verify(notificationRepository, times(2)).save(any(Notification.class));
		verify(fcmTokenRepository, times(2)).findAllByUserId(anyInt());
		verify(applicationEventPublisher, times(2)).publishEvent(any(NotificationEventMessage.class));

		// 알림 내용 검증
		ArgumentCaptor<Notification> notificationCaptor = ArgumentCaptor.forClass(Notification.class);
		verify(notificationRepository, times(2)).save(notificationCaptor.capture());
		List<Notification> capturedNotifications = notificationCaptor.getAllValues();

		// 알림 이벤트 검증
		ArgumentCaptor<NotificationEventMessage> eventMessageCaptor = ArgumentCaptor.forClass(
			NotificationEventMessage.class);
		verify(applicationEventPublisher, times(2)).publishEvent(eventMessageCaptor.capture());
		List<NotificationEventMessage> capturedEventMessages = eventMessageCaptor.getAllValues();

		// 두 알림이 모두 저장되었는지 확인 (ID로 확인 가능)
		assertThat(capturedNotifications).hasSize(2);
		List<Integer> referenceIds = capturedNotifications.stream()
			.map(Notification::getReferenceEntityId)
			.toList();
		assertThat(referenceIds).containsExactlyInAnyOrder(gifticon90.getId(), gifticon30.getId());
	}

	@Test
	@DisplayName("유효기간 만료 예정 알림 전송 - 표준 알림 주기에 해당하지 않는 만료일의 기프티콘에 대해서는 알림을 전송하지 않는다.")
	void sendExpiryDateNotification_WhenExpiryDateNotInStandardCycles_ThenDoNotSendNotification() {
		// given
		LocalDate today = LocalDate.now();

		// 테스트용 사용자, 브랜드, 기프티콘 생성
		User user = User.builder().id(1).name("테스트 사용자").build();
		Brand brand = Brand.builder().id(1).name("테스트 브랜드").build();

		// 31일 후 만료 예정인 기프티콘 (비공유) - 표준 알림 주기(1,2,3,7,30,60,90)에 해당하지 않는 경우
		Gifticon gifticon31 = Gifticon.builder()
			.id(1)
			.name("테스트 기프티콘 31일")
			.user(user)
			.brand(brand)
			.expiryDate(today.plusDays(31)) // 31일 후 만료 (표준 알림 주기에 없음)
			.sharebox(null) // 공유되지 않은 기프티콘
			.build();

		// 91일 후 만료 예정인 기프티콘 (비공유) - 표준 알림 주기(1,2,3,7,30,60,90)에 해당하지 않는 경우
		Gifticon gifticon91 = Gifticon.builder()
			.id(2)
			.name("테스트 기프티콘 91일")
			.user(user)
			.brand(brand)
			.expiryDate(today.plusDays(91)) // 91일 후 만료 (표준 알림 주기에 없음)
			.sharebox(null) // 공유되지 않은 기프티콘
			.build();

		NotificationType notificationType = NotificationType.builder()
			.id(1)
			.code(NotificationTypeCode.EXPIRY_DATE)
			.build();

		NotificationSetting notificationSetting = NotificationSetting.builder()
			.id(1)
			.user(user)
			.notificationType(notificationType)
			.expirationCycle(ExpirationCycle.THREE_MONTHS) // 90일 전 알림 설정
			.isEnabled(true)
			.build();

		// mock 설정
		given(gifticonRepository.findGifticonsWithExpiryDates(anyList())).willReturn(List.of(gifticon31, gifticon91));
		given(notificationTypeRepository.findByCode(NotificationTypeCode.EXPIRY_DATE)).willReturn(notificationType);
		given(gifticonDomainService.isAlreadyShared(any(Gifticon.class))).willReturn(false); // 공유되지 않은 기프티콘
		given(notificationSettingRepository.findByUserIdAndNotificationTypeId(user.getId(), notificationType.getId()))
			.willReturn(notificationSetting);

		// when
		fcmAppService.sendExpiryDateNotification();

		// then
		// 알림 저장 및 전송이 이루어지지 않음
		verify(notificationRepository, never()).save(any());
		verify(fcmTokenRepository, never()).findAllByUserId(anyInt());
		verify(applicationEventPublisher, never()).publishEvent(any());
	}

	private List<LocalDate> getExpiryDates(LocalDate today) {
		return Arrays.stream(ExpirationCycle.values())
			.map(cycle -> today.plusDays(cycle.getDays()))
			.toList();
	}
}
