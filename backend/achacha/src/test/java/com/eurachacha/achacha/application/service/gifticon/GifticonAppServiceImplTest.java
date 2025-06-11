package com.eurachacha.achacha.application.service.gifticon;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.BDDMockito.*;

import java.time.LocalDate;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.multipart.MultipartFile;

import com.eurachacha.achacha.application.port.input.gifticon.dto.request.GifticonSaveRequestDto;
import com.eurachacha.achacha.application.port.input.gifticon.dto.response.GifticonBarcodeResponseDto;
import com.eurachacha.achacha.application.port.output.ai.OcrTrainingDataRepository;
import com.eurachacha.achacha.application.port.output.auth.SecurityServicePort;
import com.eurachacha.achacha.application.port.output.brand.BrandRepository;
import com.eurachacha.achacha.application.port.output.file.FileRepository;
import com.eurachacha.achacha.application.port.output.file.FileStoragePort;
import com.eurachacha.achacha.application.port.output.gifticon.GifticonRepository;
import com.eurachacha.achacha.application.port.output.notification.NotificationRepository;
import com.eurachacha.achacha.application.port.output.notification.NotificationSettingRepository;
import com.eurachacha.achacha.application.port.output.notification.NotificationTypeRepository;
import com.eurachacha.achacha.application.port.output.sharebox.ParticipationRepository;
import com.eurachacha.achacha.application.port.output.sharebox.ShareBoxRepository;
import com.eurachacha.achacha.domain.model.brand.Brand;
import com.eurachacha.achacha.domain.model.file.File;
import com.eurachacha.achacha.domain.model.file.enums.FileType;
import com.eurachacha.achacha.domain.model.gifticon.Gifticon;
import com.eurachacha.achacha.domain.model.gifticon.enums.GifticonType;
import com.eurachacha.achacha.domain.model.notification.Notification;
import com.eurachacha.achacha.domain.model.notification.NotificationType;
import com.eurachacha.achacha.domain.model.notification.enums.NotificationTypeCode;
import com.eurachacha.achacha.domain.model.sharebox.ShareBox;
import com.eurachacha.achacha.domain.model.user.User;
import com.eurachacha.achacha.domain.service.file.FileDomainService;
import com.eurachacha.achacha.domain.service.gifticon.GifticonDomainService;
import com.eurachacha.achacha.domain.service.notification.NotificationSettingDomainService;
import com.eurachacha.achacha.web.common.exception.CustomException;
import com.eurachacha.achacha.web.common.exception.ErrorCode;

@ExtendWith(MockitoExtension.class)
class GifticonAppServiceImplTest {

	@Mock
	private GifticonDomainService gifticonDomainService;

	@Mock
	private GifticonRepository gifticonRepository;

	@Mock
	private ParticipationRepository participationRepository;

	@Mock
	private BrandRepository brandRepository;

	@Mock
	private ShareBoxRepository shareBoxRepository;

	@Mock
	private OcrTrainingDataRepository ocrTrainingDataRepository;

	@Mock
	private FileStoragePort fileStoragePort;

	@Mock
	private FileRepository fileRepository;

	@Mock
	private FileDomainService fileDomainService;

	@Mock
	private SecurityServicePort securityServicePort;

	@Mock
	private NotificationTypeRepository notificationTypeRepository;

	@Mock
	private NotificationRepository notificationRepository;

	@Mock
	private NotificationSettingRepository notificationSettingRepository;

	@Mock
	private NotificationSettingDomainService notificationSettingDomainService;

	@InjectMocks
	private GifticonAppServiceImpl gifticonAppService;

	@Test
	@DisplayName("금액형 기프티콘 저장 - 성공적으로 저장되면 예외가 발생하지 않아야 한다")
	void saveGifticon_WhenAmountTypeGifticon_ThenSuccessfullySave() {
		// given
		GifticonSaveRequestDto requestDto = createAmountTypeGifticonRequestDto();
		MultipartFile originalImage = mock(MultipartFile.class);
		MultipartFile thumbnailImage = mock(MultipartFile.class);
		MultipartFile barcodeImage = mock(MultipartFile.class);

		User user = User.builder().id(1).name("테스트 사용자").build();
		Brand brand = Brand.builder().id(1).name("테스트 브랜드").build();
		Gifticon savedGifticon = Gifticon.builder().id(1).build();

		// BDDMockito를 사용한 mock 설정
		willDoNothing().given(fileDomainService).validateImageFile(any(MultipartFile.class));
		willDoNothing().given(gifticonDomainService).validateGifticonAmount(any(), anyInt());
		given(securityServicePort.getLoggedInUser()).willReturn(user);
		given(gifticonRepository.existsByBarcode(anyString())).willReturn(false);
		given(brandRepository.findById(anyInt())).willReturn(brand);
		given(gifticonRepository.save(any(Gifticon.class))).willReturn(savedGifticon);
		given(fileStoragePort.uploadFile(any(), any(), anyInt())).willReturn("test/path");

		// when
		gifticonAppService.saveGifticon(requestDto, originalImage, thumbnailImage, barcodeImage);

		// then
		verify(fileDomainService, times(3)).validateImageFile(any(MultipartFile.class));
		verify(gifticonDomainService).validateGifticonAmount(eq(GifticonType.AMOUNT), eq(10000));
		verify(gifticonRepository).existsByBarcode(eq("1234567890"));
		verify(brandRepository).findById(eq(1));

		// Gifticon 저장 검증
		ArgumentCaptor<Gifticon> gifticonCaptor = ArgumentCaptor.forClass(Gifticon.class);
		verify(gifticonRepository).save(gifticonCaptor.capture());
		Gifticon capturedGifticon = gifticonCaptor.getValue();

		assertThat(capturedGifticon.getName()).isEqualTo("테스트 기프티콘");
		assertThat(capturedGifticon.getBarcode()).isEqualTo("1234567890");
		assertThat(capturedGifticon.getType()).isEqualTo(GifticonType.AMOUNT);
		assertThat(capturedGifticon.getOriginalAmount()).isEqualTo(10000);
		assertThat(capturedGifticon.getRemainingAmount()).isEqualTo(10000);

		// 파일 업로드 검증
		verify(fileStoragePort, times(3)).uploadFile(any(), any(), eq(1));
		verify(fileRepository, times(3)).save(any(File.class));

		// 메타데이터 업데이트 검증
		verify(ocrTrainingDataRepository).updateUserCorrectedForAmount(
			eq(requestDto.getOcrTrainingDataId()),
			eq(requestDto.getGifticonBarcodeNumber()),
			eq(brand.getName()),
			eq(requestDto.getGifticonName()),
			eq(requestDto.getGifticonExpiryDate().toString()),
			eq(requestDto.getGifticonAmount())
		);
	}

	@Test
	@DisplayName("상품형 기프티콘 저장 - 성공적으로 저장되면 예외가 발생하지 않아야 한다")
	void saveGifticon_WhenProductTypeGifticon_ThenSuccessfullySave() {
		// given
		GifticonSaveRequestDto requestDto = createProductTypeGifticonRequestDto();
		MultipartFile originalImage = mock(MultipartFile.class);
		MultipartFile thumbnailImage = mock(MultipartFile.class);
		MultipartFile barcodeImage = mock(MultipartFile.class);

		User user = User.builder().id(1).name("테스트 사용자").build();
		Brand brand = Brand.builder().id(1).name("테스트 브랜드").build();
		Gifticon savedGifticon = Gifticon.builder().id(1).build();

		// BDDMockito를 사용한 mock 설정
		willDoNothing().given(fileDomainService).validateImageFile(any(MultipartFile.class));
		willDoNothing().given(gifticonDomainService).validateGifticonAmount(any(), any());
		given(securityServicePort.getLoggedInUser()).willReturn(user);
		given(gifticonRepository.existsByBarcode(anyString())).willReturn(false);
		given(brandRepository.findById(anyInt())).willReturn(brand);
		given(gifticonRepository.save(any(Gifticon.class))).willReturn(savedGifticon);
		given(fileStoragePort.uploadFile(any(), any(), anyInt())).willReturn("test/path");

		// when
		gifticonAppService.saveGifticon(requestDto, originalImage, thumbnailImage, barcodeImage);

		// then
		verify(fileDomainService, times(3)).validateImageFile(any(MultipartFile.class));
		verify(gifticonDomainService).validateGifticonAmount(eq(GifticonType.PRODUCT), eq(null));

		// 메타데이터 업데이트 검증 - 상품형은 다른 메서드 호출
		verify(ocrTrainingDataRepository).updateUserCorrectedForProduct(
			eq(requestDto.getOcrTrainingDataId()),
			eq(requestDto.getGifticonBarcodeNumber()),
			eq(brand.getName()),
			eq(requestDto.getGifticonName()),
			eq(requestDto.getGifticonExpiryDate().toString())
		);
	}

	@Test
	@DisplayName("기프티콘 저장 - 중복된 바코드 번호가 있으면 예외가 발생해야 한다")
	void saveGifticon_WhenBarcodeAlreadyExists_ThenThrowException() {
		// given
		GifticonSaveRequestDto requestDto = createAmountTypeGifticonRequestDto();
		MultipartFile originalImage = mock(MultipartFile.class);
		MultipartFile thumbnailImage = mock(MultipartFile.class);
		MultipartFile barcodeImage = mock(MultipartFile.class);

		// BDDMockito를 사용한 mock 설정
		willDoNothing().given(fileDomainService).validateImageFile(any(MultipartFile.class));
		willDoNothing().given(gifticonDomainService).validateGifticonAmount(any(), anyInt());
		given(gifticonRepository.existsByBarcode(anyString())).willReturn(true);

		// when & then
		assertThatThrownBy(() ->
			gifticonAppService.saveGifticon(requestDto, originalImage, thumbnailImage, barcodeImage))
			.isInstanceOf(CustomException.class)
			.hasFieldOrPropertyWithValue("errorCode", ErrorCode.GIFTICON_BARCODE_DUPLICATE);

		// 저장 메서드가 호출되지 않았는지 검증
		verify(gifticonRepository, never()).save(any(Gifticon.class));
	}

	@Test
	@DisplayName("기프티콘 저장 - 공유 박스에 대한 접근 권한이 없으면 예외가 발생해야 한다")
	void saveGifticon_WhenUnauthorizedShareBoxAccess_ThenThrowException() {
		// given
		GifticonSaveRequestDto requestDto = createAmountTypeGifticonRequestDtoWithShareBox();
		MultipartFile originalImage = mock(MultipartFile.class);
		MultipartFile thumbnailImage = mock(MultipartFile.class);
		MultipartFile barcodeImage = mock(MultipartFile.class);
		User user = mock(User.class);

		ShareBox shareBox = ShareBox.builder().id(1).name("테스트 공유박스").build();

		when(securityServicePort.getLoggedInUser()).thenReturn(user);

		// BDDMockito를 사용한 mock 설정
		willDoNothing().given(fileDomainService).validateImageFile(any(MultipartFile.class));
		willDoNothing().given(gifticonDomainService).validateGifticonAmount(any(), anyInt());
		given(gifticonRepository.existsByBarcode(anyString())).willReturn(false);
		given(shareBoxRepository.findById(anyInt())).willReturn(shareBox);
		given(participationRepository.checkParticipation(anyInt(), anyInt())).willReturn(false);

		// when & then
		assertThatThrownBy(() ->
			gifticonAppService.saveGifticon(requestDto, originalImage, thumbnailImage, barcodeImage))
			.isInstanceOf(CustomException.class)
			.hasFieldOrPropertyWithValue("errorCode", ErrorCode.UNAUTHORIZED_GIFTICON_ACCESS);

		// 저장 메서드가 호출되지 않았는지 검증
		verify(gifticonRepository, never()).save(any(Gifticon.class));
	}

	// 테스트 헬퍼 메서드
	private GifticonSaveRequestDto createAmountTypeGifticonRequestDto() {
		return new GifticonSaveRequestDto(
			"1234567890",      // 바코드
			1,                  // 브랜드 ID
			"테스트 기프티콘",      // 상품명
			LocalDate.now().plusMonths(3), // 유효기간
			GifticonType.AMOUNT, // 타입
			10000,              // 금액
			null,               // 공유박스 ID (없음)
			"1"                 // OCR 학습 데이터 ID
		);
	}

	private GifticonSaveRequestDto createProductTypeGifticonRequestDto() {
		return new GifticonSaveRequestDto(
			"1234567890",      // 바코드
			1,                  // 브랜드 ID
			"테스트 기프티콘",      // 상품명
			LocalDate.now().plusMonths(3), // 유효기간
			GifticonType.PRODUCT, // 타입
			null,               // 금액 (상품형은 null)
			null,               // 공유박스 ID (없음)
			"1"                 // OCR 학습 데이터 ID
		);
	}

	private GifticonSaveRequestDto createAmountTypeGifticonRequestDtoWithShareBox() {
		return new GifticonSaveRequestDto(
			"1234567890",      // 바코드
			1,                  // 브랜드 ID
			"테스트 기프티콘",      // 상품명
			LocalDate.now().plusMonths(3), // 유효기간
			GifticonType.AMOUNT, // 타입
			10000,              // 금액
			1,                  // 공유박스 ID
			"1"                 // OCR 학습 데이터 ID
		);
	}

	@Test
	@DisplayName("사용가능 바코드 조회 - 바코드 조회 후 사용한 경우 알림이 발생하지 않아야 한다")
	void getAvailableGifticonBarcode_WhenGifticonUsedAfterBarcodeFetch_ThenNoNotification() throws Exception {
		// given
		Integer gifticonId = 1;
		Integer userId = 1;
		User user = User.builder().id(userId).name("테스트 사용자").build();

		Gifticon gifticon = Gifticon.builder()
			.id(gifticonId)
			.name("테스트 기프티콘")
			.barcode("1234567890")
			.user(user)  // 테스트 사용자가 소유자
			.build();

		File barcodeFile = File.builder()
			.id(1)
			.path("path/to/barcode.jpg")
			.referenceEntityId(gifticonId)
			.referenceEntityType("gifticon")
			.build();

		// Mock 설정
		given(securityServicePort.getLoggedInUser()).willReturn(user);
		given(gifticonRepository.findById(gifticonId)).willReturn(gifticon);
		willDoNothing().given(gifticonDomainService).validateGifticonIsAvailable(gifticon);

		// 중요: hasAccess 메서드를 올바르게 모킹
		// userId와 gifticon.getUser().getId()가 동일하므로 true 반환해야 함
		given(gifticonDomainService.hasAccess(eq(userId), eq(userId))).willReturn(true);

		given(fileRepository.findByReferenceEntityTypeAndReferenceEntityIdAndType(eq("gifticon"), eq(gifticonId),
			eq(FileType.BARCODE)))
			.willReturn(java.util.Optional.of(barcodeFile));
		given(fileStoragePort.generateFileUrl(anyString(), eq(FileType.BARCODE))).willReturn(
			"https://example.com/barcode.jpg");

		// 스케줄러 작업이 수행될 때는 기프티콘이 사용됨 상태로 변경
		given(gifticonDomainService.isUsed(any(Gifticon.class))).willReturn(true);

		// when
		GifticonBarcodeResponseDto result = gifticonAppService.getAvailableGifticonBarcode(gifticonId);

		// then
		assertThat(result).isNotNull();
		assertThat(result.getGifticonBarcodeNumber()).isEqualTo("1234567890");
		assertThat(result.getBarcodePath()).isEqualTo("https://example.com/barcode.jpg");

		// 5분 후 로직을 시뮬레이션하기 위해 직접 호출
		// 이미 사용됨으로 알림이 발생하지 않아야 함
		gifticonAppService.checkUsedAndSaveAndSendNotification(userId, gifticonId);
		verify(notificationTypeRepository, never()).findByCode(any());
	}

	@Test
	@DisplayName("사용가능 바코드 조회 - 바코드 조회 후 사용하지 않은 경우 성공적으로 알림이 발생해야 한다")
	void getAvailableGifticonBarcode_WhenGifticonNotUsedAfterBarcodeFetch_ThenNotificationSent() throws Exception {
		// given
		Integer gifticonId = 1;
		Integer userId = 1;
		User user = User.builder().id(userId).name("테스트 사용자").build();

		Gifticon gifticon = Gifticon.builder()
			.id(gifticonId)
			.name("테스트 기프티콘")
			.barcode("1234567890")
			.user(user)  // 테스트 사용자가 소유자
			.build();

		File barcodeFile = File.builder()
			.id(1)
			.path("path/to/barcode.jpg")
			.referenceEntityId(gifticonId)
			.referenceEntityType("gifticon")
			.build();

		NotificationType notificationType = NotificationType.builder()
			.id(1)
			.code(NotificationTypeCode.USAGE_COMPLETE)
			.build();

		// Mock 설정
		given(securityServicePort.getLoggedInUser()).willReturn(user);
		given(gifticonRepository.findById(gifticonId)).willReturn(gifticon);
		willDoNothing().given(gifticonDomainService).validateGifticonIsAvailable(gifticon);

		// 중요: hasAccess 메서드를 올바르게 모킹
		given(gifticonDomainService.hasAccess(eq(userId), eq(userId))).willReturn(true);

		given(fileRepository.findByReferenceEntityTypeAndReferenceEntityIdAndType(eq("gifticon"), eq(gifticonId),
			eq(FileType.BARCODE)))
			.willReturn(java.util.Optional.of(barcodeFile));
		given(fileStoragePort.generateFileUrl(anyString(), eq(FileType.BARCODE))).willReturn(
			"https://example.com/barcode.jpg");

		// 스케줄러 작업이 수행될 때 기프티콘이 미사용 상태
		given(gifticonDomainService.isUsed(any(Gifticon.class))).willReturn(false);
		given(notificationTypeRepository.findByCode(NotificationTypeCode.USAGE_COMPLETE)).willReturn(notificationType);

		// NotificationSetting 모킹 추가
		// 이 부분이 없으면 NotificationSettingRepository를 호출할 때 NullPointerException 발생
		// NOTIFICATION_SETTING_NOT_FOUND 예외를 던지도록 설정
		willThrow(new CustomException(ErrorCode.NOTIFICATION_SETTING_NOT_FOUND))
			.given(notificationSettingRepository).findByUserIdAndNotificationTypeId(anyInt(), anyInt());

		// when
		GifticonBarcodeResponseDto result = gifticonAppService.getAvailableGifticonBarcode(gifticonId);

		// then
		assertThat(result).isNotNull();
		assertThat(result.getGifticonBarcodeNumber()).isEqualTo("1234567890");

		// 5분 후 로직 시뮬레이션 - 알림 발생 확인
		gifticonAppService.checkUsedAndSaveAndSendNotification(userId, gifticonId);
		verify(notificationTypeRepository).findByCode(NotificationTypeCode.USAGE_COMPLETE);
		verify(notificationRepository).save(any(Notification.class));
	}

	@Test
	@DisplayName("사용가능 바코드 조회 - 사용된 기프티콘인 경우에는 예외가 발생해야 한다")
	void getAvailableGifticonBarcode_WhenGifticonAlreadyUsed_ThenThrowException() {
		// given
		Integer gifticonId = 1;
		User user = User.builder().id(1).name("테스트 사용자").build();

		Gifticon gifticon = Gifticon.builder()
			.id(gifticonId)
			.name("테스트 기프티콘")
			.barcode("1234567890")
			.user(user)
			.build();

		// Mock 설정
		given(securityServicePort.getLoggedInUser()).willReturn(user);
		given(gifticonRepository.findById(gifticonId)).willReturn(gifticon);

		// validateGifticonIsAvailable에서 예외 발생하도록 설정
		willThrow(new CustomException(ErrorCode.GIFTICON_ALREADY_USED))
			.given(gifticonDomainService).validateGifticonIsAvailable(gifticon);

		// when & then
		assertThatThrownBy(() -> gifticonAppService.getAvailableGifticonBarcode(gifticonId))
			.isInstanceOf(CustomException.class)
			.hasFieldOrPropertyWithValue("errorCode", ErrorCode.GIFTICON_ALREADY_USED);
	}

	@Test
	@DisplayName("사용가능 바코드 조회 - 삭제된 기프티콘인 경우에는 예외가 발생해야 한다")
	void getAvailableGifticonBarcode_WhenGifticonDeleted_ThenThrowException() {
		// given
		Integer gifticonId = 1;
		User user = User.builder().id(1).name("테스트 사용자").build();

		Gifticon gifticon = Gifticon.builder()
			.id(gifticonId)
			.name("테스트 기프티콘")
			.barcode("1234567890")
			.user(user)
			.build();

		// Mock 설정
		given(securityServicePort.getLoggedInUser()).willReturn(user);
		given(gifticonRepository.findById(gifticonId)).willReturn(gifticon);

		// validateGifticonIsAvailable에서 예외 발생하도록 설정
		willThrow(new CustomException(ErrorCode.GIFTICON_DELETED))
			.given(gifticonDomainService).validateGifticonIsAvailable(gifticon);

		// when & then
		assertThatThrownBy(() -> gifticonAppService.getAvailableGifticonBarcode(gifticonId))
			.isInstanceOf(CustomException.class)
			.hasFieldOrPropertyWithValue("errorCode", ErrorCode.GIFTICON_DELETED);
	}

	@Test
	@DisplayName("사용가능 바코드 조회 - 본인이 소유자인 경우 성공적으로 조회가 되어야 하고 알림이 발생해야 한다")
	void getAvailableGifticonBarcode_WhenUserIsOwner_ThenSuccessfullyFetchAndScheduleNotification() {
		// given
		Integer gifticonId = 1;
		Integer userId = 1;
		User user = User.builder().id(userId).name("테스트 사용자").build();

		Gifticon gifticon = Gifticon.builder()
			.id(gifticonId)
			.name("테스트 기프티콘")
			.barcode("1234567890")
			.user(user)
			.build();

		File barcodeFile = File.builder()
			.id(1)
			.path("path/to/barcode.jpg")
			.referenceEntityId(gifticonId)
			.referenceEntityType("gifticon")
			.build();

		NotificationType notificationType = NotificationType.builder()
			.id(1)
			.code(NotificationTypeCode.USAGE_COMPLETE)
			.build();

		// Mock 설정
		given(securityServicePort.getLoggedInUser()).willReturn(user);
		given(gifticonRepository.findById(gifticonId)).willReturn(gifticon);
		willDoNothing().given(gifticonDomainService).validateGifticonIsAvailable(gifticon);
		given(fileRepository.findByReferenceEntityTypeAndReferenceEntityIdAndType(eq("gifticon"), eq(gifticonId),
			eq(FileType.BARCODE)))
			.willReturn(java.util.Optional.of(barcodeFile));
		given(fileStoragePort.generateFileUrl(anyString(), eq(FileType.BARCODE))).willReturn(
			"https://example.com/barcode.jpg");

		given(gifticonDomainService.hasAccess(userId, userId)).willReturn(true);
		given(gifticonDomainService.isUsed(any(Gifticon.class))).willReturn(false);
		given(notificationTypeRepository.findByCode(NotificationTypeCode.USAGE_COMPLETE)).willReturn(notificationType);

		// when
		GifticonBarcodeResponseDto result = gifticonAppService.getAvailableGifticonBarcode(gifticonId);

		// then
		assertThat(result).isNotNull();
		assertThat(result.getGifticonBarcodeNumber()).isEqualTo("1234567890");

		// 소유자 확인 (직접 호출)
		gifticonAppService.checkUsedAndSaveAndSendNotification(userId, gifticonId);
		verify(notificationTypeRepository).findByCode(NotificationTypeCode.USAGE_COMPLETE);
		verify(notificationRepository).save(any(Notification.class));
	}

	@Test
	@DisplayName("사용가능 바코드 조회 - 본인이 참여한 쉐어박스의 기프티콘인 경우 성공적으로 조회가 되어야 하고 알림이 발생해야 한다")
	void getAvailableGifticonBarcode_WhenUserParticipatesInShareBox_ThenSuccessfullyFetchAndScheduleNotification() {
		// given
		Integer gifticonId = 1;
		Integer userId = 1;
		Integer ownerId = 2;
		Integer shareBoxId = 1;

		User user = User.builder().id(userId).name("테스트 사용자").build();
		User owner = User.builder().id(ownerId).name("소유자").build();
		ShareBox shareBox = ShareBox.builder().id(shareBoxId).name("테스트 쉐어박스").build();

		Gifticon gifticon = Gifticon.builder()
			.id(gifticonId)
			.name("테스트 기프티콘")
			.barcode("1234567890")
			.user(owner)
			.sharebox(shareBox)
			.build();

		File barcodeFile = File.builder()
			.id(1)
			.path("path/to/barcode.jpg")
			.referenceEntityId(gifticonId)
			.referenceEntityType("gifticon")
			.build();

		NotificationType notificationType = NotificationType.builder()
			.id(1)
			.code(NotificationTypeCode.USAGE_COMPLETE)
			.build();

		// Mock 설정
		given(securityServicePort.getLoggedInUser()).willReturn(user);
		given(gifticonRepository.findById(gifticonId)).willReturn(gifticon);
		willDoNothing().given(gifticonDomainService).validateGifticonIsAvailable(gifticon);
		given(fileRepository.findByReferenceEntityTypeAndReferenceEntityIdAndType(eq("gifticon"), eq(gifticonId),
			eq(FileType.BARCODE)))
			.willReturn(java.util.Optional.of(barcodeFile));
		given(fileStoragePort.generateFileUrl(anyString(), eq(FileType.BARCODE))).willReturn(
			"https://example.com/barcode.jpg");

		// 쉐어박스 참여 확인
		given(participationRepository.checkParticipation(userId, shareBoxId)).willReturn(true);
		given(gifticonDomainService.isUsed(any(Gifticon.class))).willReturn(false);
		given(notificationTypeRepository.findByCode(NotificationTypeCode.USAGE_COMPLETE)).willReturn(notificationType);

		// when
		GifticonBarcodeResponseDto result = gifticonAppService.getAvailableGifticonBarcode(gifticonId);

		// then
		assertThat(result).isNotNull();
		assertThat(result.getGifticonBarcodeNumber()).isEqualTo("1234567890");

		// 알림 발생 확인
		gifticonAppService.checkUsedAndSaveAndSendNotification(userId, gifticonId);
		verify(notificationTypeRepository).findByCode(NotificationTypeCode.USAGE_COMPLETE);
		verify(notificationRepository).save(any(Notification.class));
	}

	@Test
	@DisplayName("사용가능 바코드 조회 - 본인이 소유자가 아닌 기프티콘을 조회한 경우 예외가 발생해야 한다")
	void getAvailableGifticonBarcode_WhenUserIsNotOwner_ThenThrowException() {
		// given
		Integer gifticonId = 1;
		Integer userId = 1;
		Integer ownerId = 2;

		User user = User.builder().id(userId).name("테스트 사용자").build();
		User owner = User.builder().id(ownerId).name("소유자").build();

		Gifticon gifticon = Gifticon.builder()
			.id(gifticonId)
			.name("테스트 기프티콘")
			.barcode("1234567890")
			.user(owner)
			.build();

		// Mock 설정
		given(securityServicePort.getLoggedInUser()).willReturn(user);
		given(gifticonRepository.findById(gifticonId)).willReturn(gifticon);
		willDoNothing().given(gifticonDomainService).validateGifticonIsAvailable(gifticon);

		// 소유자 확인 실패
		given(gifticonDomainService.hasAccess(userId, ownerId)).willReturn(false);

		// when & then
		assertThatThrownBy(() -> gifticonAppService.getAvailableGifticonBarcode(gifticonId))
			.isInstanceOf(CustomException.class)
			.hasFieldOrPropertyWithValue("errorCode", ErrorCode.UNAUTHORIZED_GIFTICON_ACCESS);
	}

	@Test
	@DisplayName("사용가능 바코드 조회 - 본인이 참여하지 않은 쉐어박스의 기프티콘을 조회한 경우 예외가 발생해야 한다")
	void getAvailableGifticonBarcode_WhenUserDoesNotParticipateInShareBox_ThenThrowException() {
		// given
		Integer gifticonId = 1;
		Integer userId = 1;
		Integer ownerId = 2;
		Integer shareBoxId = 1;

		User user = User.builder().id(userId).name("테스트 사용자").build();
		User owner = User.builder().id(ownerId).name("소유자").build();
		ShareBox shareBox = ShareBox.builder().id(shareBoxId).name("테스트 쉐어박스").build();

		Gifticon gifticon = Gifticon.builder()
			.id(gifticonId)
			.name("테스트 기프티콘")
			.barcode("1234567890")
			.user(owner)
			.sharebox(shareBox)
			.build();

		// Mock 설정
		given(securityServicePort.getLoggedInUser()).willReturn(user);
		given(gifticonRepository.findById(gifticonId)).willReturn(gifticon);
		willDoNothing().given(gifticonDomainService).validateGifticonIsAvailable(gifticon);

		// 쉐어박스 참여 확인 실패
		given(participationRepository.checkParticipation(userId, shareBoxId)).willReturn(false);

		// when & then
		assertThatThrownBy(() -> gifticonAppService.getAvailableGifticonBarcode(gifticonId))
			.isInstanceOf(CustomException.class)
			.hasFieldOrPropertyWithValue("errorCode", ErrorCode.UNAUTHORIZED_GIFTICON_ACCESS);
	}
}
