package com.eurachacha.achacha.application.service.notification;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.BDDMockito.*;

import java.util.Arrays;
import java.util.List;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;

import com.eurachacha.achacha.application.port.input.notification.dto.request.LocationBasedNotificationRequestDto;
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
import com.eurachacha.achacha.domain.model.notification.enums.NotificationTypeCode;
import com.eurachacha.achacha.domain.model.user.User;
import com.eurachacha.achacha.domain.service.notification.NotificationSettingDomainService;
import com.eurachacha.achacha.web.common.exception.CustomException;
import com.eurachacha.achacha.web.common.exception.ErrorCode;

@ExtendWith(MockitoExtension.class)
public class NotificationAppServiceImplTest {

	@Mock
	private NotificationRepository notificationRepository;

	@Mock
	private SecurityServicePort securityServicePort;

	@Mock
	private NotificationTypeRepository notificationTypeRepository;

	@Mock
	private NotificationSettingRepository notificationSettingRepository;

	@Mock
	private FcmTokenRepository fcmTokenRepository;

	// NotificationEventPort 대신 ApplicationEventPublisher 사용
	@Mock
	private ApplicationEventPublisher applicationEventPublisher;

	@Mock
	private NotificationSettingDomainService notificationSettingDomainService;

	@Mock
	private GifticonRepository gifticonRepository;

	@InjectMocks
	private NotificationAppServiceImpl notificationAppService;

	@Test
	@DisplayName("주변 매장 알림 요청 - 조회한 기프티콘이 없으면 예외가 발생해야 한다")
	void requestNotification_GifticonNotFound_ThrowsException() {
		// given
		Integer gifticonId = 1;
		User loggedInUser = createUser(1);
		LocationBasedNotificationRequestDto requestDto = new LocationBasedNotificationRequestDto(gifticonId);

		// Mock 설정
		given(securityServicePort.getLoggedInUser()).willReturn(loggedInUser);

		// 기프티콘을 찾을 수 없는 경우
		given(gifticonRepository.findById(gifticonId))
			.willThrow(new CustomException(ErrorCode.GIFTICON_NOT_FOUND));

		// when & then
		assertThatThrownBy(() -> notificationAppService.requestNotification(requestDto))
			.isInstanceOf(CustomException.class)
			.hasFieldOrPropertyWithValue("errorCode", ErrorCode.GIFTICON_NOT_FOUND);

		// 기프티콘 조회만 이루어지고 이후 알림 관련 메서드는 호출되지 않아야 함
		verify(notificationTypeRepository, never()).findByCode(any(NotificationTypeCode.class));
		verify(notificationRepository, never()).save(any(Notification.class));
	}

	@Test
	@DisplayName("주변 매장 알림 요청 - 조회한 기프티콘이 있으면 성공적으로 알림이 전송되어야 한다")
	void requestNotification_GifticonFound_SendsNotification() {
		// given
		Integer gifticonId = 1;
		User loggedInUser = createUser(1);
		Brand brand = createBrand(1, "스타벅스");
		Gifticon gifticon = createGifticon(gifticonId, "아메리카노", brand, loggedInUser);

		LocationBasedNotificationRequestDto requestDto = new LocationBasedNotificationRequestDto(gifticonId);

		NotificationType notificationType = NotificationType.builder()
			.id(1)
			.code(NotificationTypeCode.LOCATION_BASED)
			.build();

		NotificationSetting notificationSetting = NotificationSetting.builder()
			.id(1)
			.user(loggedInUser)
			.notificationType(notificationType)
			.isEnabled(true)
			.build();

		List<FcmToken> fcmTokens = Arrays.asList(
			FcmToken.builder()
				.id(1)
				.user(loggedInUser)
				.value("fcm-token-123")
				.build()
		);

		// Mock 설정
		given(securityServicePort.getLoggedInUser()).willReturn(loggedInUser);
		given(gifticonRepository.findById(gifticonId)).willReturn(gifticon);
		given(notificationTypeRepository.findByCode(NotificationTypeCode.LOCATION_BASED)).willReturn(notificationType);

		given(notificationSettingRepository.findByUserIdAndNotificationTypeId(
			loggedInUser.getId(), notificationType.getId()))
			.willReturn(notificationSetting);

		given(notificationSettingDomainService.isEnabled(notificationSetting)).willReturn(true);
		given(fcmTokenRepository.findAllByUserId(loggedInUser.getId())).willReturn(fcmTokens);

		// when
		notificationAppService.requestNotification(requestDto);

		// then
		// 알림 저장이 호출되었는지 확인
		ArgumentCaptor<Notification> notificationCaptor = ArgumentCaptor.forClass(Notification.class);
		verify(notificationRepository).save(notificationCaptor.capture());

		Notification capturedNotification = notificationCaptor.getValue();
		assertThat(capturedNotification.getUser().getId()).isEqualTo(loggedInUser.getId());
		assertThat(capturedNotification.getNotificationType()).isEqualTo(notificationType);
		assertThat(capturedNotification.getTitle()).isEqualTo(NotificationTypeCode.LOCATION_BASED.getDisplayName());

		// 알림 내용에 기프티콘 이름과 브랜드 이름이 포함되어 있는지 확인
		String expectedContent = "반경 50m 내에 " + gifticon.getName() + "을(를) 사용할 수 있는 " + brand.getName() + "매장이 있어요!";
		assertThat(capturedNotification.getContent()).isEqualTo(expectedContent);

		assertThat(capturedNotification.getReferenceEntityType()).isEqualTo("gifticon");
		assertThat(capturedNotification.getReferenceEntityId()).isEqualTo(gifticonId);
		assertThat(capturedNotification.getIsRead()).isFalse();

		// 알림 설정 확인이 호출되었는지 검증
		verify(notificationSettingDomainService).isEnabled(notificationSetting);

		// FCM 토큰 조회가 호출되었는지 검증
		verify(fcmTokenRepository).findAllByUserId(loggedInUser.getId());

		// 이벤트 발행이 호출되었는지 검증 (NotificationEventPort 대신 ApplicationEventPublisher 사용)
		ArgumentCaptor<NotificationEventMessage> eventMessageCaptor = ArgumentCaptor.forClass(
			NotificationEventMessage.class);
		verify(applicationEventPublisher).publishEvent(eventMessageCaptor.capture());

		NotificationEventMessage capturedEventMessage = eventMessageCaptor.getValue();
		NotificationEventDto capturedEventDto = capturedEventMessage.getEventDto();

		assertThat(capturedEventDto.getFcmToken()).isEqualTo("fcm-token-123");
		assertThat(capturedEventDto.getUserId()).isEqualTo(loggedInUser.getId());
		assertThat(capturedEventDto.getNotificationTypeCode()).isEqualTo(NotificationTypeCode.LOCATION_BASED.name());
		assertThat(capturedEventDto.getTitle()).isEqualTo(NotificationTypeCode.LOCATION_BASED.getDisplayName());
		assertThat(capturedEventDto.getBody()).isEqualTo(expectedContent);
		assertThat(capturedEventDto.getReferenceEntityType()).isEqualTo("gifticon");
		assertThat(capturedEventDto.getReferenceEntityId()).isEqualTo(gifticonId);
	}

	// 테스트 헬퍼 메서드
	private User createUser(Integer id) {
		return User.builder()
			.id(id)
			.build();
	}

	private Brand createBrand(Integer id, String name) {
		return Brand.builder()
			.id(id)
			.name(name)
			.build();
	}

	private Gifticon createGifticon(Integer id, String name, Brand brand, User user) {
		return Gifticon.builder()
			.id(id)
			.name(name)
			.brand(brand)
			.user(user)
			.build();
	}
}
