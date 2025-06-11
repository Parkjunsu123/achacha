package com.eurachacha.achacha.application.service.gifticon;

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
import com.eurachacha.achacha.domain.model.brand.Brand;
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

@ExtendWith(MockitoExtension.class)
public class GifticonGiveAppServiceImplTest {

	@Mock
	private GifticonRepository gifticonRepository;

	@Mock
	private GifticonDomainService gifticonDomainService;

	@Mock
	private GifticonGiveDomainService gifticonGiveDomainService;

	@Mock
	private SecurityServicePort securityServicePort;

	@Mock
	private PresentTemplateRepository presentTemplateRepository;

	@Mock
	private ColorPaletteRepository colorPaletteRepository;

	@Mock
	private PresentCardRepository presentCardRepository;

	@Mock
	private GifticonOwnerHistoryRepository gifticonOwnerHistoryRepository;

	@Mock
	private BleTokenRepository bleTokenRepository;

	@Mock
	private NotificationTypeRepository notificationTypeRepository;

	@Mock
	private NotificationRepository notificationRepository;

	@Mock
	private NotificationSettingRepository notificationSettingRepository;

	@Mock
	private NotificationSettingDomainService notificationSettingDomainService;

	// NotificationEventPort 대신 ApplicationEventPublisher 사용
	@Mock
	private ApplicationEventPublisher applicationEventPublisher;

	@Mock
	private FcmTokenRepository fcmTokenRepository;

	@InjectMocks
	private GifticonGiveAppServiceImpl gifticonGiveAppService;

	@Test
	@DisplayName("기프티콘 선물하기 - 일반 템플릿(GENERAL)으로 성공적으로 선물하면 올바른 응답을 반환해야 한다")
	void presentGifticon_WithGeneralTemplate_ThenReturnCorrectResponse() {
		// given
		Integer gifticonId = 1;
		User user = createUser(1);
		String presentCardCode = "uniquePresentCardCode";
		GifticonPresentRequestDto requestDto = createGeneralTemplatePresentRequestDto(1, 1, "선물 메시지입니다.");
		Brand brand = createBrand(1, "스타벅스");
		PresentTemplate template = createPresentTemplate(1, TemplateCategory.GENERAL);
		ColorPalette colorPalette = createColorPalette(1);
		Gifticon gifticon = createGifticon(gifticonId, "아메리카노", brand, user);

		// Mock 설정
		given(securityServicePort.getLoggedInUser()).willReturn(user);
		given(gifticonRepository.getGifticonDetail(gifticonId)).willReturn(gifticon);
		given(presentTemplateRepository.findById(requestDto.getPresentTemplateId())).willReturn(template);
		given(colorPaletteRepository.findByColorPaletteId(requestDto.getColorPaletteId())).willReturn(colorPalette);
		given(presentCardRepository.existsByPresentCardCode(anyString())).willReturn(false);
		given(gifticonGiveDomainService.getAllowedCharacters()).willReturn("ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789");
		given(gifticonGiveDomainService.getRecommendedPresentCardCodeLength()).willReturn(36);

		// presentCardRepository.save() 호출 시 고정된 코드 반환하도록 설정
		given(presentCardRepository.save(any(PresentCard.class))).willAnswer(invocation -> {
			PresentCard savedCard = invocation.getArgument(0);
			return PresentCard.builder()
				.id(1)
				.code(presentCardCode)
				.message(savedCard.getMessage())
				.user(savedCard.getUser())
				.gifticon(savedCard.getGifticon())
				.presentTemplate(savedCard.getPresentTemplate())
				.colorPalette(savedCard.getColorPalette())
				.build();
		});

		// when
		GifticonPresentResponseDto response = gifticonGiveAppService.presentGifticon(gifticonId, requestDto);

		// then
		// 1. 응답 검증
		assertThat(response).isNotNull();
		assertThat(response.getPresentCardCode()).isNotNull();
		assertThat(response.getGifticonName()).isEqualTo(gifticon.getName());
		assertThat(response.getBrandName()).isEqualTo(brand.getName());

		// 2. 기프티콘 검증 메서드 호출 확인
		verify(gifticonDomainService).validateGifticonForPresent(user.getId(), gifticon);

		// 3. 기프티콘 사용 처리 확인
		verify(gifticonRepository).getGifticonDetail(gifticonId);

		// 4. 소유권 변경 내역 저장 확인
		ArgumentCaptor<GifticonOwnerHistory> historyCaptor = ArgumentCaptor.forClass(GifticonOwnerHistory.class);
		verify(gifticonOwnerHistoryRepository).save(historyCaptor.capture());
		GifticonOwnerHistory capturedHistory = historyCaptor.getValue();

		assertThat(capturedHistory.getFromUser()).isEqualTo(user);
		assertThat(capturedHistory.getToUser()).isNull(); // 선물의 경우 받는 사람은 null
		assertThat(capturedHistory.getTransferType()).isEqualTo(TransferType.PRESENT);

		// 5. 선물 카드 저장 확인
		ArgumentCaptor<PresentCard> cardCaptor = ArgumentCaptor.forClass(PresentCard.class);
		verify(presentCardRepository).save(cardCaptor.capture());
		PresentCard capturedCard = cardCaptor.getValue();

		assertThat(capturedCard.getMessage()).isEqualTo(requestDto.getMessage());
		assertThat(capturedCard.getUser()).isEqualTo(user);
		assertThat(capturedCard.getGifticon()).isEqualTo(gifticon);
		assertThat(capturedCard.getPresentTemplate()).isEqualTo(template);
		assertThat(capturedCard.getColorPalette()).isEqualTo(colorPalette);
	}

	@Test
	@DisplayName("기프티콘 선물하기 - 기타 템플릿(ACHACHA)으로 성공적으로 선물하면 올바른 응답을 반환해야 한다")
	void presentGifticon_WithThemeTemplate_ThenReturnCorrectResponse() {
		// given
		Integer gifticonId = 1;
		User user = createUser(1);
		String presentCardCode = "uniquePresentCardCode";
		GifticonPresentRequestDto requestDto = createThemeTemplatePresentRequestDto(2, "선물 메시지입니다.");
		Brand brand = createBrand(1, "스타벅스");
		PresentTemplate template = createPresentTemplate(2, TemplateCategory.ACHACHA);
		Gifticon gifticon = createGifticon(gifticonId, "아메리카노", brand, user);

		// Mock 설정
		given(securityServicePort.getLoggedInUser()).willReturn(user);
		given(gifticonRepository.getGifticonDetail(gifticonId)).willReturn(gifticon);
		given(presentTemplateRepository.findById(requestDto.getPresentTemplateId())).willReturn(template);
		given(presentCardRepository.existsByPresentCardCode(anyString())).willReturn(false);
		given(gifticonGiveDomainService.getAllowedCharacters()).willReturn("ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789");
		given(gifticonGiveDomainService.getRecommendedPresentCardCodeLength()).willReturn(36);

		// presentCardRepository.save() 호출 시 고정된 코드 반환하도록 설정
		given(presentCardRepository.save(any(PresentCard.class))).willAnswer(invocation -> {
			PresentCard savedCard = invocation.getArgument(0);
			return PresentCard.builder()
				.id(1)
				.code(presentCardCode)
				.message(savedCard.getMessage())
				.user(savedCard.getUser())
				.gifticon(savedCard.getGifticon())
				.presentTemplate(savedCard.getPresentTemplate())
				.colorPalette(null) // 테마 템플릿은 컬러팔레트가 null
				.build();
		});

		// when
		GifticonPresentResponseDto response = gifticonGiveAppService.presentGifticon(gifticonId, requestDto);

		// then
		// 1. 응답 검증
		assertThat(response).isNotNull();
		assertThat(response.getPresentCardCode()).isNotNull();
		assertThat(response.getGifticonName()).isEqualTo(gifticon.getName());
		assertThat(response.getBrandName()).isEqualTo(brand.getName());

		// 2. 기프티콘 검증 메서드 호출 확인
		verify(gifticonDomainService).validateGifticonForPresent(user.getId(), gifticon);

		// 3. 기프티콘 사용 처리 확인
		verify(gifticonRepository).getGifticonDetail(gifticonId);

		// 4. 소유권 변경 내역 저장 확인
		verify(gifticonOwnerHistoryRepository).save(any(GifticonOwnerHistory.class));

		// 5. 선물 카드 저장 확인 - 테마 템플릿은 컬러팔레트가 null
		ArgumentCaptor<PresentCard> cardCaptor = ArgumentCaptor.forClass(PresentCard.class);
		verify(presentCardRepository).save(cardCaptor.capture());
		PresentCard capturedCard = cardCaptor.getValue();

		assertThat(capturedCard.getColorPalette()).isNull(); // 테마 템플릿은 컬러팔레트가 null

		// 6. colorPaletteRepository는 호출되지 않아야 함
		verify(colorPaletteRepository, never()).findByColorPaletteId(anyInt());
	}

	@Test
	@DisplayName("기프티콘 선물하기 - 이미 사용된 기프티콘은 선물할 수 없다")
	void presentGifticon_WhenGifticonAlreadyUsed_ThenThrowException() {
		// given
		Integer gifticonId = 1;
		User user = createUser(1);
		GifticonPresentRequestDto requestDto = createGeneralTemplatePresentRequestDto(1, 1, "선물 메시지입니다.");
		Gifticon gifticon = createGifticon(gifticonId, "아메리카노", null, user);

		// Mock 설정
		given(securityServicePort.getLoggedInUser()).willReturn(user);
		given(gifticonRepository.getGifticonDetail(gifticonId)).willReturn(gifticon);

		// 기프티콘 검증 시 예외 발생 - 이미 사용된 기프티콘
		willThrow(new CustomException(ErrorCode.GIFTICON_ALREADY_USED))
			.given(gifticonDomainService).validateGifticonForPresent(user.getId(), gifticon);

		// when & then
		assertThatThrownBy(() -> gifticonGiveAppService.presentGifticon(gifticonId, requestDto))
			.isInstanceOf(CustomException.class)
			.hasFieldOrPropertyWithValue("errorCode", ErrorCode.GIFTICON_ALREADY_USED);

		// 선물 카드 저장이 호출되지 않았는지 검증
		verify(presentCardRepository, never()).save(any(PresentCard.class));
		verify(gifticonOwnerHistoryRepository, never()).save(any(GifticonOwnerHistory.class));
	}

	@Test
	@DisplayName("기프티콘 선물하기 - 권한이 없는 기프티콘은 선물할 수 없다")
	void presentGifticon_WhenUnauthorizedAccess_ThenThrowException() {
		// given
		Integer gifticonId = 1;
		User user = createUser(1);
		User anotherUser = createUser(2);
		GifticonPresentRequestDto requestDto = createGeneralTemplatePresentRequestDto(1, 1, "선물 메시지입니다.");
		Gifticon gifticon = createGifticon(gifticonId, "아메리카노", null, anotherUser);

		// Mock 설정
		given(securityServicePort.getLoggedInUser()).willReturn(user);
		given(gifticonRepository.getGifticonDetail(gifticonId)).willReturn(gifticon);

		// 기프티콘 검증 시 예외 발생 - 권한이 없는 접근
		willThrow(new CustomException(ErrorCode.UNAUTHORIZED_GIFTICON_ACCESS))
			.given(gifticonDomainService).validateGifticonForPresent(user.getId(), gifticon);

		// when & then
		assertThatThrownBy(() -> gifticonGiveAppService.presentGifticon(gifticonId, requestDto))
			.isInstanceOf(CustomException.class)
			.hasFieldOrPropertyWithValue("errorCode", ErrorCode.UNAUTHORIZED_GIFTICON_ACCESS);

		// 선물 카드 저장이 호출되지 않았는지 검증
		verify(presentCardRepository, never()).save(any(PresentCard.class));
	}

	@Test
	@DisplayName("기프티콘 선물하기 - 공유된 기프티콘은 선물할 수 없다")
	void presentGifticon_WhenGifticonAlreadyShared_ThenThrowException() {
		// given
		Integer gifticonId = 1;
		User user = createUser(1);
		GifticonPresentRequestDto requestDto = createGeneralTemplatePresentRequestDto(1, 1, "선물 메시지입니다.");
		Gifticon gifticon = createGifticon(gifticonId, "아메리카노", null, user);

		// Mock 설정
		given(securityServicePort.getLoggedInUser()).willReturn(user);
		given(gifticonRepository.getGifticonDetail(gifticonId)).willReturn(gifticon);

		// 기프티콘 검증 시 예외 발생 - 이미 공유된 기프티콘
		willThrow(new CustomException(ErrorCode.GIFTICON_ALREADY_SHARED))
			.given(gifticonDomainService).validateGifticonForPresent(user.getId(), gifticon);

		// when & then
		assertThatThrownBy(() -> gifticonGiveAppService.presentGifticon(gifticonId, requestDto))
			.isInstanceOf(CustomException.class)
			.hasFieldOrPropertyWithValue("errorCode", ErrorCode.GIFTICON_ALREADY_SHARED);

		// 선물 카드 저장이 호출되지 않았는지 검증
		verify(presentCardRepository, never()).save(any(PresentCard.class));
	}

	@Test
	@DisplayName("기프티콘 선물하기 - 선물 코드 생성에 실패하면 예외가 발생해야 한다")
	void presentGifticon_WhenPresentCodeGenerationFails_ThenThrowException() {
		// given
		Integer gifticonId = 1;
		User user = createUser(1);
		GifticonPresentRequestDto requestDto = createGeneralTemplatePresentRequestDto(1, 1, "선물 메시지입니다.");
		Brand brand = createBrand(1, "스타벅스");
		PresentTemplate template = createPresentTemplate(1, TemplateCategory.GENERAL);
		ColorPalette colorPalette = createColorPalette(1);
		Gifticon gifticon = createGifticon(gifticonId, "아메리카노", brand, user);

		// Mock 설정
		given(securityServicePort.getLoggedInUser()).willReturn(user);
		given(gifticonRepository.getGifticonDetail(gifticonId)).willReturn(gifticon);
		given(presentTemplateRepository.findById(requestDto.getPresentTemplateId())).willReturn(template);
		given(colorPaletteRepository.findByColorPaletteId(requestDto.getColorPaletteId())).willReturn(colorPalette);
		given(gifticonGiveDomainService.getAllowedCharacters()).willReturn("ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789");
		given(gifticonGiveDomainService.getRecommendedPresentCardCodeLength()).willReturn(36);

		// 선물 코드가 항상 중복되는 것으로 설정
		given(presentCardRepository.existsByPresentCardCode(anyString())).willReturn(true);

		// when & then
		assertThatThrownBy(() -> gifticonGiveAppService.presentGifticon(gifticonId, requestDto))
			.isInstanceOf(CustomException.class)
			.hasFieldOrPropertyWithValue("errorCode", ErrorCode.PRESENT_CODE_GENERATION_FAILED);

		// MAX_ATTEMPTS(3) 번만큼 코드 검증이 일어나야 함
		verify(presentCardRepository, times(3)).existsByPresentCardCode(anyString());

		// 선물 카드 저장이 호출되지 않았는지 검증
		verify(presentCardRepository, never()).save(any(PresentCard.class));
	}

	// ========== 테스트 헬퍼 메서드 ==========

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
			.expiryDate(LocalDate.now().plusMonths(3))
			.build();
	}

	private PresentTemplate createPresentTemplate(Integer id, TemplateCategory category) {
		return PresentTemplate.builder()
			.id(id)
			.category(category)
			.build();
	}

	private ColorPalette createColorPalette(Integer id) {
		return ColorPalette.builder()
			.id(id)
			.build();
	}

	private GifticonPresentRequestDto createGeneralTemplatePresentRequestDto(Integer templateId, Integer colorPaletteId,
		String message) {
		return new GifticonPresentRequestDto(templateId, colorPaletteId, message);
	}

	private GifticonPresentRequestDto createThemeTemplatePresentRequestDto(Integer templateId, String message) {
		return new GifticonPresentRequestDto(templateId, null, message);
	}

	@Test
	@DisplayName("기프티콘 뿌리기 - 삭제된 기프티콘을 뿌리기할 경우 에러가 발생해야 한다")
	void giveAwayGifticon_DeletedGifticon_ThrowsException() {
		// given
		Integer gifticonId = 1;
		User loggedInUser = createUser(1);
		Brand brand = createBrand(1, "스타벅스");
		Gifticon deletedGifticon = Gifticon.builder()
			.id(gifticonId)
			.name("Deleted Gifticon")
			.brand(brand)
			.user(loggedInUser)
			.isDeleted(true)
			.isUsed(false)
			.type(GifticonType.PRODUCT)
			.build();
		List<String> validUuids = Arrays.asList("test-uuid-123");

		// Mock 설정
		given(securityServicePort.getLoggedInUser()).willReturn(loggedInUser);
		given(gifticonRepository.getGifticonDetail(gifticonId)).willReturn(deletedGifticon);

		// validateGifticonForGiveAway 메서드에서 예외를 발생시킴
		doThrow(new CustomException(ErrorCode.GIFTICON_DELETED))
			.when(gifticonDomainService).validateGifticonForGiveAway(loggedInUser.getId(), deletedGifticon);

		// when & then
		assertThatThrownBy(() -> gifticonGiveAppService.giveAwayGifticon(gifticonId, validUuids))
			.isInstanceOf(CustomException.class)
			.hasFieldOrPropertyWithValue("errorCode", ErrorCode.GIFTICON_DELETED);

		verify(gifticonDomainService).validateGifticonForGiveAway(loggedInUser.getId(), deletedGifticon);
		// validUuids까지 검증되지 않았는지 확인
		verify(bleTokenRepository, never()).findValuesByValueIn(any());
	}

	@Test
	@DisplayName("기프티콘 뿌리기 - 사용된 기프티콘을 뿌리기할 경우 에러가 발생해야 한다")
	void giveAwayGifticon_UsedGifticon_ThrowsException() {
		// given
		Integer gifticonId = 1;
		User loggedInUser = createUser(1);
		Brand brand = createBrand(1, "스타벅스");
		Gifticon usedGifticon = Gifticon.builder()
			.id(gifticonId)
			.name("Used Gifticon")
			.brand(brand)
			.user(loggedInUser)
			.isDeleted(false)
			.isUsed(true)
			.type(GifticonType.PRODUCT)
			.build();
		List<String> validUuids = Arrays.asList("test-uuid-123");

		// Mock 설정
		given(securityServicePort.getLoggedInUser()).willReturn(loggedInUser);
		given(gifticonRepository.getGifticonDetail(gifticonId)).willReturn(usedGifticon);

		doThrow(new CustomException(ErrorCode.GIFTICON_ALREADY_USED))
			.when(gifticonDomainService).validateGifticonForGiveAway(loggedInUser.getId(), usedGifticon);

		// when & then
		assertThatThrownBy(() -> gifticonGiveAppService.giveAwayGifticon(gifticonId, validUuids))
			.isInstanceOf(CustomException.class)
			.hasFieldOrPropertyWithValue("errorCode", ErrorCode.GIFTICON_ALREADY_USED);

		verify(gifticonDomainService).validateGifticonForGiveAway(loggedInUser.getId(), usedGifticon);
		verify(bleTokenRepository, never()).findValuesByValueIn(any());
	}

	@Test
	@DisplayName("기프티콘 뿌리기 - 금액권 기프티콘을 뿌리기할 경우 에러가 발생해야 한다")
	void giveAwayGifticon_VoucherGifticon_ThrowsException() {
		// given
		Integer gifticonId = 1;
		User loggedInUser = createUser(1);
		Brand brand = createBrand(1, "스타벅스");
		Gifticon voucher = Gifticon.builder()
			.id(gifticonId)
			.name("Voucher Gifticon")
			.brand(brand)
			.user(loggedInUser)
			.isDeleted(false)
			.isUsed(false)
			.type(GifticonType.AMOUNT)
			.build();
		List<String> validUuids = Arrays.asList("test-uuid-123");

		// Mock 설정
		given(securityServicePort.getLoggedInUser()).willReturn(loggedInUser);
		given(gifticonRepository.getGifticonDetail(gifticonId)).willReturn(voucher);

		doThrow(new CustomException(ErrorCode.INVALID_GIFTICON_TYPE))
			.when(gifticonDomainService).validateGifticonForGiveAway(loggedInUser.getId(), voucher);

		// when & then
		assertThatThrownBy(() -> gifticonGiveAppService.giveAwayGifticon(gifticonId, validUuids))
			.isInstanceOf(CustomException.class)
			.hasFieldOrPropertyWithValue("errorCode", ErrorCode.INVALID_GIFTICON_TYPE);

		verify(gifticonDomainService).validateGifticonForGiveAway(loggedInUser.getId(), voucher);
		verify(bleTokenRepository, never()).findValuesByValueIn(any());
	}

	@Test
	@DisplayName("기프티콘 뿌리기 - 유효한 uuid가 없으면 에러가 발생해야 한다")
	void giveAwayGifticon_NoValidUuids_ThrowsException() {
		// given
		Integer gifticonId = 1;
		User loggedInUser = createUser(1);
		Brand brand = createBrand(1, "스타벅스");
		Gifticon validGifticon = Gifticon.builder()
			.id(gifticonId)
			.name("Valid Gifticon")
			.brand(brand)
			.user(loggedInUser)
			.isDeleted(false)
			.isUsed(false)
			.type(GifticonType.PRODUCT)
			.build();
		List<String> inputUuids = Arrays.asList("test-uuid-123");

		// Mock 설정
		given(securityServicePort.getLoggedInUser()).willReturn(loggedInUser);
		given(gifticonRepository.getGifticonDetail(gifticonId)).willReturn(validGifticon);
		doNothing().when(gifticonDomainService).validateGifticonForGiveAway(loggedInUser.getId(), validGifticon);

		// 빈 UUID 리스트 반환 설정
		given(bleTokenRepository.findValuesByValueIn(inputUuids)).willReturn(Collections.emptyList());

		// when & then
		assertThatThrownBy(() -> gifticonGiveAppService.giveAwayGifticon(gifticonId, inputUuids))
			.isInstanceOf(CustomException.class)
			.hasFieldOrPropertyWithValue("errorCode", ErrorCode.NO_NEARBY_PEOPLES);

		verify(gifticonDomainService).validateGifticonForGiveAway(loggedInUser.getId(), validGifticon);
		verify(bleTokenRepository).findValuesByValueIn(inputUuids);
		// 다음 단계로 진행되지 않았는지 확인
		verify(bleTokenRepository, never()).findByValue(anyString());
	}

	@Test
	@DisplayName("기프티콘 뿌리기 - 삭제되지 않고, 사용되지않고, 상품형인 기프티콘은 뿌리기되어야 한다")
	void giveAwayGifticon_ValidGifticon_Success() {
		// given
		Integer gifticonId = 1;
		User loggedInUser = createUser(1);
		User receiverUser = createUser(2);
		Brand brand = createBrand(1, "스타벅스");
		Gifticon validGifticon = Gifticon.builder()
			.id(gifticonId)
			.name("Valid Gifticon")
			.brand(brand)
			.user(loggedInUser)
			.isDeleted(false)
			.isUsed(false)
			.type(GifticonType.PRODUCT)
			.build();
		List<String> validUuids = Arrays.asList("test-uuid-123");
		BleToken bleToken = BleToken.builder()
			.value("test-uuid-123")
			.user(receiverUser)
			.build();

		NotificationType notificationType = NotificationType.builder()
			.id(1)
			.code(NotificationTypeCode.RECEIVE_GIFTICON)
			.build();

		NotificationSetting notificationSetting = NotificationSetting.builder()
			.id(1)
			.user(receiverUser)
			.notificationType(notificationType)
			.isEnabled(true)
			.build();

		// Mock 설정
		given(securityServicePort.getLoggedInUser()).willReturn(loggedInUser);
		given(gifticonRepository.getGifticonDetail(gifticonId)).willReturn(validGifticon);
		doNothing().when(gifticonDomainService).validateGifticonForGiveAway(loggedInUser.getId(), validGifticon);
		given(bleTokenRepository.findValuesByValueIn(validUuids)).willReturn(validUuids);
		given(bleTokenRepository.findByValue("test-uuid-123")).willReturn(bleToken);

		given(notificationTypeRepository.findByCode(NotificationTypeCode.RECEIVE_GIFTICON))
			.willReturn(notificationType);

		given(notificationSettingRepository.findByUserIdAndNotificationTypeId(
			receiverUser.getId(), notificationType.getId()))
			.willReturn(notificationSetting);

		given(notificationSettingDomainService.isEnabled(notificationSetting)).willReturn(true);

		// when
		gifticonGiveAppService.giveAwayGifticon(gifticonId, validUuids);

		// then
		// 1. 기프티콘 검증이 호출되었는지 확인
		verify(gifticonDomainService).validateGifticonForGiveAway(loggedInUser.getId(), validGifticon);

		// 2. UUID 검증이 호출되었는지 확인
		verify(bleTokenRepository).findValuesByValueIn(validUuids);

		// 3. 선택된 UUID로 BLE 토큰 조회가 호출되었는지 확인
		verify(bleTokenRepository).findByValue(anyString());

		// 4. 소유권 이전 내역이 저장되었는지 확인
		ArgumentCaptor<GifticonOwnerHistory> historyCaptor = ArgumentCaptor.forClass(GifticonOwnerHistory.class);
		verify(gifticonOwnerHistoryRepository).save(historyCaptor.capture());

		GifticonOwnerHistory capturedHistory = historyCaptor.getValue();
		assertThat(capturedHistory.getFromUser()).isEqualTo(loggedInUser);
		assertThat(capturedHistory.getToUser()).isEqualTo(receiverUser);
		assertThat(capturedHistory.getTransferType()).isEqualTo(TransferType.GIVE_AWAY);

		// 5. 기프티콘 소유자가 변경되었는지 확인
		assertThat(validGifticon.getUser()).isEqualTo(receiverUser);
	}

	@Test
	@DisplayName("기프티콘 뿌리기 - 삭제되지 않고, 사용되지않고, 상품형인 기프티콘은 알림이 전송되어야 한다")
	void giveAwayGifticon_ValidGifticon_SendsNotification() {
		// given
		Integer gifticonId = 1;
		User loggedInUser = createUser(1);
		User receiverUser = createUser(2);
		Brand brand = createBrand(1, "스타벅스");
		Gifticon validGifticon = Gifticon.builder()
			.id(gifticonId)
			.name("Valid Gifticon")
			.brand(brand)
			.user(loggedInUser)
			.isDeleted(false)
			.isUsed(false)
			.type(GifticonType.PRODUCT)
			.build();
		List<String> validUuids = Arrays.asList("test-uuid-123");
		BleToken bleToken = BleToken.builder()
			.value("test-uuid-123")
			.user(receiverUser)
			.build();

		NotificationType notificationType = NotificationType.builder()
			.id(1)
			.code(NotificationTypeCode.RECEIVE_GIFTICON)
			.build();

		NotificationSetting notificationSetting = NotificationSetting.builder()
			.id(1)
			.user(receiverUser)
			.notificationType(notificationType)
			.isEnabled(true)
			.build();

		List<FcmToken> fcmTokens = Arrays.asList(
			FcmToken.builder()
				.id(1)
				.user(receiverUser)
				.value("fcm-token-123")
				.build()
		);

		// Mock 설정
		given(securityServicePort.getLoggedInUser()).willReturn(loggedInUser);
		given(gifticonRepository.getGifticonDetail(gifticonId)).willReturn(validGifticon);
		doNothing().when(gifticonDomainService).validateGifticonForGiveAway(loggedInUser.getId(), validGifticon);
		given(bleTokenRepository.findValuesByValueIn(validUuids)).willReturn(validUuids);
		given(bleTokenRepository.findByValue("test-uuid-123")).willReturn(bleToken);

		given(notificationTypeRepository.findByCode(NotificationTypeCode.RECEIVE_GIFTICON))
			.willReturn(notificationType);

		given(notificationSettingRepository.findByUserIdAndNotificationTypeId(
			receiverUser.getId(), notificationType.getId()))
			.willReturn(notificationSetting);

		given(notificationSettingDomainService.isEnabled(notificationSetting)).willReturn(true);

		// FCM 토큰 설정
		given(fcmTokenRepository.findAllByUserId(receiverUser.getId())).willReturn(fcmTokens);

		// when
		gifticonGiveAppService.giveAwayGifticon(gifticonId, validUuids);

		// then
		// 알림 저장이 호출되었는지 확인
		ArgumentCaptor<Notification> notificationCaptor = ArgumentCaptor.forClass(Notification.class);
		verify(notificationRepository).save(notificationCaptor.capture());

		Notification capturedNotification = notificationCaptor.getValue();
		assertThat(capturedNotification.getUser().getId()).isEqualTo(receiverUser.getId());
		assertThat(capturedNotification.getNotificationType()).isEqualTo(notificationType);
		assertThat(capturedNotification.getTitle()).isEqualTo(NotificationTypeCode.RECEIVE_GIFTICON.getDisplayName());
		assertThat(capturedNotification.getContent()).contains(validGifticon.getName());
		assertThat(capturedNotification.getReferenceEntityType()).isEqualTo("gifticon");
		assertThat(capturedNotification.getReferenceEntityId()).isEqualTo(gifticonId);
		assertThat(capturedNotification.getIsRead()).isFalse();

		// 알림 설정 확인이 호출되었는지 검증
		verify(notificationSettingDomainService).isEnabled(notificationSetting);

		// FCM 토큰 조회가 호출되었는지 검증
		verify(fcmTokenRepository).findAllByUserId(receiverUser.getId());

		// 이벤트 발행이 호출되었는지 검증 (NotificationEventPort 대신 ApplicationEventPublisher 사용)
		ArgumentCaptor<NotificationEventMessage> eventMessageCaptor = ArgumentCaptor.forClass(
			NotificationEventMessage.class);
		verify(applicationEventPublisher).publishEvent(eventMessageCaptor.capture());

		NotificationEventMessage capturedEventMessage = eventMessageCaptor.getValue();
		NotificationEventDto capturedEventDto = capturedEventMessage.getEventDto();

		assertThat(capturedEventDto.getFcmToken()).isEqualTo("fcm-token-123");
		assertThat(capturedEventDto.getUserId()).isEqualTo(receiverUser.getId());
		assertThat(capturedEventDto.getNotificationTypeCode()).isEqualTo(NotificationTypeCode.RECEIVE_GIFTICON.name());
	}
}
