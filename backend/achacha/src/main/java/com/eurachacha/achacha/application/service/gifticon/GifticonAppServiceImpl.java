package com.eurachacha.achacha.application.service.gifticon;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.eurachacha.achacha.application.port.input.gifticon.GifticonAppService;
import com.eurachacha.achacha.application.port.input.gifticon.dto.request.GifticonSaveRequestDto;
import com.eurachacha.achacha.application.port.input.gifticon.dto.response.AvailableGifticonDetailResponseDto;
import com.eurachacha.achacha.application.port.input.gifticon.dto.response.AvailableGifticonResponseDto;
import com.eurachacha.achacha.application.port.input.gifticon.dto.response.AvailableGifticonsResponseDto;
import com.eurachacha.achacha.application.port.input.gifticon.dto.response.GifticonBarcodeResponseDto;
import com.eurachacha.achacha.application.port.input.gifticon.dto.response.GifticonMetadataResponseDto;
import com.eurachacha.achacha.application.port.input.gifticon.dto.response.UsedGifticonDetailResponseDto;
import com.eurachacha.achacha.application.port.input.gifticon.dto.response.UsedGifticonResponseDto;
import com.eurachacha.achacha.application.port.input.gifticon.dto.response.UsedGifticonsResponseDto;
import com.eurachacha.achacha.application.port.output.ai.AIServicePort;
import com.eurachacha.achacha.application.port.output.ai.OcrTrainingDataRepository;
import com.eurachacha.achacha.application.port.output.ai.dto.response.GifticonMetadataDto;
import com.eurachacha.achacha.application.port.output.auth.SecurityServicePort;
import com.eurachacha.achacha.application.port.output.brand.BrandRepository;
import com.eurachacha.achacha.application.port.output.file.FileRepository;
import com.eurachacha.achacha.application.port.output.file.FileStoragePort;
import com.eurachacha.achacha.application.port.output.gifticon.GifticonRepository;
import com.eurachacha.achacha.application.port.output.history.GifticonOwnerHistoryRepository;
import com.eurachacha.achacha.application.port.output.history.UsageHistoryRepository;
import com.eurachacha.achacha.application.port.output.notification.NotificationRepository;
import com.eurachacha.achacha.application.port.output.notification.NotificationSettingRepository;
import com.eurachacha.achacha.application.port.output.notification.NotificationTypeRepository;
import com.eurachacha.achacha.application.port.output.notification.dto.request.NotificationEventDto;
import com.eurachacha.achacha.application.port.output.ocr.OcrPort;
import com.eurachacha.achacha.application.port.output.sharebox.ParticipationRepository;
import com.eurachacha.achacha.application.port.output.sharebox.ShareBoxRepository;
import com.eurachacha.achacha.application.port.output.user.FcmTokenRepository;
import com.eurachacha.achacha.application.service.notification.event.NotificationEventMessage;
import com.eurachacha.achacha.domain.model.ai.OcrTrainingData;
import com.eurachacha.achacha.domain.model.brand.Brand;
import com.eurachacha.achacha.domain.model.fcm.FcmToken;
import com.eurachacha.achacha.domain.model.file.File;
import com.eurachacha.achacha.domain.model.file.enums.FileType;
import com.eurachacha.achacha.domain.model.gifticon.Gifticon;
import com.eurachacha.achacha.domain.model.gifticon.enums.GifticonScopeType;
import com.eurachacha.achacha.domain.model.gifticon.enums.GifticonSortType;
import com.eurachacha.achacha.domain.model.gifticon.enums.GifticonType;
import com.eurachacha.achacha.domain.model.gifticon.enums.GifticonUsedSortType;
import com.eurachacha.achacha.domain.model.history.GifticonOwnerHistory;
import com.eurachacha.achacha.domain.model.history.UsageHistory;
import com.eurachacha.achacha.domain.model.history.enums.TransferType;
import com.eurachacha.achacha.domain.model.history.enums.UsageType;
import com.eurachacha.achacha.domain.model.notification.Notification;
import com.eurachacha.achacha.domain.model.notification.NotificationSetting;
import com.eurachacha.achacha.domain.model.notification.NotificationType;
import com.eurachacha.achacha.domain.model.notification.enums.NotificationTypeCode;
import com.eurachacha.achacha.domain.model.sharebox.Participation;
import com.eurachacha.achacha.domain.model.sharebox.ShareBox;
import com.eurachacha.achacha.domain.model.user.User;
import com.eurachacha.achacha.domain.service.file.FileDomainService;
import com.eurachacha.achacha.domain.service.gifticon.GifticonDomainService;
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
public class GifticonAppServiceImpl implements GifticonAppService {

	private final GifticonDomainService gifticonDomainService;
	private final GifticonRepository gifticonRepository;
	private final ParticipationRepository participationRepository;
	private final PageableFactory pageableFactory;
	private final OcrPort ocrPort;
	private final AIServicePort aiServicePort;
	private final BrandRepository brandRepository;
	private final GifticonOwnerHistoryRepository gifticonOwnerHistoryRepository;
	private final UsageHistoryRepository usageHistoryRepository;
	private final OcrTrainingDataRepository ocrTrainingDataRepository;
	private final FileStoragePort fileStoragePort;
	private final FileRepository fileRepository;
	private final FileDomainService fileDomainService;
	private final ShareBoxRepository shareBoxRepository;
	private final SecurityServicePort securityServicePort;
	private final NotificationRepository notificationRepository;
	private final FcmTokenRepository fcmTokenRepository;
	private final NotificationTypeRepository notificationTypeRepository;
	private final NotificationSettingRepository notificationSettingRepository;
	private final NotificationSettingDomainService notificationSettingDomainService;
	private final ApplicationEventPublisher applicationEventPublisher;

	@Override
	public GifticonMetadataResponseDto extractGifticonMetadata(MultipartFile image, GifticonType gifticonType) {
		log.info("기프티콘 이미지 OCR 처리 시작 - 타입: {}", gifticonType.name());

		// 이미지 파일 검증
		fileDomainService.validateImageFile(image);

		// 1. OCR 서비스를 통해 텍스트 추출
		String ocrResult = ocrPort.extractRawOcrResult(image);
		log.debug("OCR 결과 추출 완료");

		// 2. AI 서비스를 통해 OCR 결과에서 필요한 정보 추출
		GifticonMetadataDto metadata = aiServicePort.extractGifticonInfo(
			ocrResult, gifticonType.name());
		log.info("기프티콘 메타데이터 추출 완료: {}", metadata);

		// OCR 결과와 AI 추출 메타데이터를 한 번에 저장
		OcrTrainingData savedTrainingData = ocrTrainingDataRepository.saveOcrResultWithMetadata(
			ocrResult,
			gifticonType.name(),
			metadata.getGifticonBarcodeNumber(),
			metadata.getBrandName(),
			metadata.getGifticonName(),
			metadata.getGifticonExpiryDate(),
			metadata.getGifticonOriginalAmount()
		);

		// 브랜드 ID 조회
		Integer brandId = findBrandId(metadata.getBrandName());

		// 브랜드명 설정
		String brandName = brandId != null ? metadata.getBrandName() : null;

		log.info("OCR 및 AI 추출 메타데이터 저장 완료 (ID: {})", savedTrainingData.getId());

		// 최종 응답용 DTO에 OCR 학습 데이터 ID 추가하여 반환
		return GifticonMetadataResponseDto.builder()
			.gifticonName(metadata.getGifticonName())
			.brandName(brandName)
			.brandId(brandId)
			.gifticonBarcodeNumber(metadata.getGifticonBarcodeNumber())
			.gifticonExpiryDate(metadata.getGifticonExpiryDate())
			.gifticonOriginalAmount(metadata.getGifticonOriginalAmount())
			.ocrTrainingDataId(savedTrainingData.getId())
			.build();
	}

	@Transactional
	@Override
	public void saveGifticon(GifticonSaveRequestDto requestDto, MultipartFile originalImage,
		MultipartFile thumbnailImage, MultipartFile barcodeImage) {
		log.info("기프티콘 저장 시작 - 이름: {}, 타입: {}", requestDto.getGifticonName(), requestDto.getGifticonType());

		// 이미지 파일 검증
		fileDomainService.validateImageFile(originalImage);
		fileDomainService.validateImageFile(thumbnailImage);
		fileDomainService.validateImageFile(barcodeImage);
		gifticonDomainService.validateGifticonAmount(requestDto.getGifticonType(), requestDto.getGifticonAmount());

		// 기프티콘 유효기간 검증
		gifticonDomainService.validateGifticonExpiryDate(requestDto.getGifticonExpiryDate(), LocalDate.now());
		// 바코드 중복 검사
		if (gifticonRepository.existsByBarcode(requestDto.getGifticonBarcodeNumber())) {
			throw new CustomException(ErrorCode.GIFTICON_BARCODE_DUPLICATE);
		}

		// 타입에 따른 금액 처리
		Integer amount = null;
		if (requestDto.getGifticonType() == GifticonType.AMOUNT) {
			amount = requestDto.getGifticonAmount();
		}

		// Brand 객체 조회
		Brand brand = brandRepository.findById(requestDto.getBrandId());

		// ShareBox 객체 조회, Participants 조회로 참여하고 있는 기프티콘 박스인지 체크해야 함.
		ShareBox shareBox = null;

		// 로그인 된 유저
		User loggedInUser = securityServicePort.getLoggedInUser();

		if (requestDto.getShareBoxId() != null) {
			shareBox = shareBoxRepository.findById(requestDto.getShareBoxId());

			// 현재 사용자가 해당 공유 박스에 참여 중인지 확인
			boolean hasParticipation = participationRepository.checkParticipation(loggedInUser.getId(),
				shareBox.getId());

			if (!hasParticipation) {
				throw new CustomException(ErrorCode.UNAUTHORIZED_GIFTICON_ACCESS);
			}
		}

		// 도메인 객체 생성
		Gifticon newGifticon = Gifticon.builder()
			.name(requestDto.getGifticonName())
			.barcode(requestDto.getGifticonBarcodeNumber())
			.type(requestDto.getGifticonType())
			.expiryDate(requestDto.getGifticonExpiryDate())
			.originalAmount(requestDto.getGifticonAmount())
			.remainingAmount(requestDto.getGifticonAmount())
			.sharebox(shareBox)
			.brand(brand)
			.user(loggedInUser)
			.build();

		// 저장소를 통한 영속화
		Gifticon savedGifticon = gifticonRepository.save(newGifticon);

		// 파일 업로드
		String originalImagePath = fileStoragePort.uploadFile(originalImage, FileType.ORIGINAL, savedGifticon.getId());
		String thumbnailImagePath = fileStoragePort.uploadFile(thumbnailImage, FileType.THUMBNAIL,
			savedGifticon.getId());
		String barcodeImagePath = fileStoragePort.uploadFile(barcodeImage, FileType.BARCODE, savedGifticon.getId());

		// 파일 엔티티 생성 및 저장
		saveGifticonFiles(savedGifticon.getId(), originalImagePath, thumbnailImagePath, barcodeImagePath);

		// 사용자 수정 메타데이터 저장 - 타입에 따라 다른 메서드 호출
		if (requestDto.getGifticonType() == GifticonType.AMOUNT) {
			// 금액형 기프티콘인 경우
			ocrTrainingDataRepository.updateUserCorrectedForAmount(
				requestDto.getOcrTrainingDataId(),
				requestDto.getGifticonBarcodeNumber(),
				brand.getName(),
				requestDto.getGifticonName(),
				requestDto.getGifticonExpiryDate().toString(),
				amount
			);
		} else {
			// 상품형 기프티콘인 경우
			ocrTrainingDataRepository.updateUserCorrectedForProduct(
				requestDto.getOcrTrainingDataId(),
				requestDto.getGifticonBarcodeNumber(),
				brand.getName(),
				requestDto.getGifticonName(),
				requestDto.getGifticonExpiryDate().toString()
			);
		}

		log.info("사용자 수정 메타데이터 저장 완료 (ID: {})", requestDto.getOcrTrainingDataId());

		// 쉐어박스에 기프티콘이 등록된 경우 알림 전송
		if (shareBox != null) {
			sendGifticonRegisteredToShareBoxNotification(shareBox, savedGifticon);
		}
	}

	@Override
	public AvailableGifticonsResponseDto getAvailableGifticons(GifticonScopeType scope, GifticonType type,
		GifticonSortType sort, Integer page, Integer size) {

		log.info("사용가능 기프티콘 조회 시작");

		// 로그인 된 유저
		User loggedInUser = securityServicePort.getLoggedInUser();
		Integer userId = loggedInUser.getId();

		// 페이징 처리
		Pageable pageable = pageableFactory.createPageable(page, size, sort);

		// 기프티콘 조회 쿼리 실행
		Slice<Gifticon> gifticonSlice = gifticonRepository.findAvailableGifticons(userId, scope, type, pageable);

		// entity -> dto 변환
		List<AvailableGifticonResponseDto> availableGifticonResponseDtos = getAvailableGifticonResponseDto(
			gifticonSlice);

		log.info("사용가능 기프티콘 조회 완료");

		return AvailableGifticonsResponseDto.builder()
			.gifticons(availableGifticonResponseDtos)
			.hasNextPage(gifticonSlice.hasNext())
			.nextPage(gifticonSlice.hasNext() ? page + 1 : null)
			.build();
	}

	@Override
	public AvailableGifticonDetailResponseDto getAvailableGifticonDetail(Integer gifticonId) {

		log.info("사용가능 기프티콘 상세 조회 시작");

		// 로그인 된 유저
		User loggedInUser = securityServicePort.getLoggedInUser();
		Integer userId = loggedInUser.getId();

		Gifticon findGifticon = gifticonRepository.getGifticonDetail(gifticonId);

		/*
		 * 사용가능 기프티콘 검증 로직
		 *  1. 삭제 여부 판단
		 *  2. 사용 여부 판단
		 */
		gifticonDomainService.validateGifticonIsAvailable(findGifticon);

		// 사용 권한 검증
		validateGifticonAccess(findGifticon, userId);

		// 기프티콘 스코프 결정에 따른 값
		String scope = findGifticon.getSharebox() == null ? "MY_BOX" : "SHARE_BOX";
		Integer shareBoxId = findGifticon.getSharebox() == null ? null : findGifticon.getSharebox().getId();
		String shareBoxName = findGifticon.getSharebox() == null ? null : findGifticon.getSharebox().getName();

		log.info("사용가능 기프티콘 상세 조회 완료");

		return AvailableGifticonDetailResponseDto.builder()
			.gifticonId(findGifticon.getId())
			.gifticonName(findGifticon.getName())
			.gifticonType(findGifticon.getType())
			.gifticonExpiryDate(findGifticon.getExpiryDate())
			.brandId(findGifticon.getBrand().getId())
			.brandName(findGifticon.getBrand().getName())
			.scope(scope)
			.userId(findGifticon.getUser().getId())
			.userName(findGifticon.getUser().getName())
			.shareBoxId(shareBoxId)
			.shareBoxName(shareBoxName)
			.thumbnailPath(getGifticonImageUrl(gifticonId, FileType.THUMBNAIL)) // 파일로직 구현 후 수정
			.originalImagePath(getGifticonImageUrl(gifticonId, FileType.ORIGINAL)) // 파일로직 구현 후 수정
			.gifticonCreatedAt(findGifticon.getCreatedAt())
			.gifticonOriginalAmount(findGifticon.getOriginalAmount())
			.gifticonRemainingAmount(findGifticon.getRemainingAmount())
			.build();
	}

	@Override
	public UsedGifticonsResponseDto getUsedGifticons(GifticonType type, GifticonUsedSortType sort, Integer page,
		Integer size) {

		log.info("사용완료 기프티콘 조회 시작");

		// 로그인 된 유저
		User loggedInUser = securityServicePort.getLoggedInUser();
		Integer userId = loggedInUser.getId();

		// 페이징 처리
		Pageable pageable = pageableFactory.createPageable(page, size, sort);

		// 쿼리 실행
		Slice<Gifticon> gifticonSlice = gifticonRepository.getUsedGifticons(userId, type, pageable);

		List<UsedGifticonResponseDto> usedGifticonResponseDtos = getUsedGifticonResponseDtos(userId, gifticonSlice);

		log.info("사용완료 기프티콘 조회 완료");

		return UsedGifticonsResponseDto.builder()
			.gifticons(usedGifticonResponseDtos)
			.hasNextPage(gifticonSlice.hasNext())
			.nextPage(gifticonSlice.hasNext() ? page + 1 : null)
			.build();
	}

	@Override
	public UsedGifticonDetailResponseDto getUsedGifticonDetail(Integer gifticonId) {

		log.info("사용완료 기프티콘 상세 조회 시작");

		// 로그인 된 유저
		User loggedInUser = securityServicePort.getLoggedInUser();
		Integer userId = loggedInUser.getId();

		// 해당 기프티콘 조회
		Gifticon findGifticon = gifticonRepository.getGifticonDetail(gifticonId);

		// 삭제 여부 검토
		boolean deleted = gifticonDomainService.isDeleted(findGifticon);
		if (deleted) {
			throw new CustomException(ErrorCode.GIFTICON_DELETED);
		}

		GifticonOwnerHistory findOwnerHistory = gifticonOwnerHistoryRepository.getGifticonOwnerHistoryDetail(
			userId, findGifticon.getId());
		UsageHistory findUsageHistory = usageHistoryRepository.findLatestByUserIdAndGifticonId(userId,
			findGifticon.getId());

		// 기프티콘이 공유 중인지 확인
		boolean isShared = gifticonDomainService.isAlreadyShared(findGifticon);
		// 기본적으로 참여하지 않은 것으로 설정
		boolean isParticipating = false;

		// 기프티콘이 공유 중이라면, 사용자의 참여 여부 확인
		if (isShared) {
			// 기프티콘이 속한 쉐어박스 ID 가져오기
			Integer shareBoxId = findGifticon.getSharebox().getId();
			isParticipating = participationRepository.checkParticipation(userId, shareBoxId);
		}

		// 해당 사용자가 기프티콘 선물 및 뿌리기를 한 적이 없었고, 사용자가 기프티콘을 사용한 적이 없었고, 쉐어박스에 올라온 기프티콘도 아닌 경우 에러 발생
		if (findOwnerHistory == null && findUsageHistory == null && !isParticipating) {
			throw new CustomException(ErrorCode.GIFTICON_AVAILABLE);
		}

		UsageType usageType = UsageType.SELF_USE; // 사용 타입
		LocalDateTime usedAt = null; // 사용 시간
		String thumbnailPath = getGifticonImageUrl(findGifticon.getId(), FileType.THUMBNAIL);
		String originalImagePath = null; // 원본 이미지 파일 경로

		// 본인이 사용한 기록이 있는 경우
		if (findUsageHistory != null) {

			// 사용을 전부했는지 확인
			boolean used = gifticonDomainService.isUsed(findGifticon);

			// 사용을 덜 했다면 에러 발생
			if (!used) {
				throw new CustomException(ErrorCode.GIFTICON_AVAILABLE);
			}

			usedAt = findUsageHistory.getCreatedAt();
			originalImagePath = getGifticonImageUrl(findGifticon.getId(), FileType.ORIGINAL);
		}
		// 타인에게 넘겨준 경우
		else if (findOwnerHistory != null) {

			usageType =
				findOwnerHistory.getTransferType() == TransferType.GIVE_AWAY ? UsageType.GIVE_AWAY : UsageType.PRESENT;
			usedAt = findOwnerHistory.getCreatedAt();
		}
		// 쉐어박스 참여만 한 경우
		else if (isParticipating) {
			// usedAt = findUsageHistory.getCreatedAt();
			// 사용을 전부했는지 확인
			boolean used = gifticonDomainService.isUsed(findGifticon);

			// 사용을 덜 했다면 에러 발생
			if (!used) {
				throw new CustomException(ErrorCode.GIFTICON_AVAILABLE);
			}
			usedAt = usageHistoryRepository.findAllByGifticonIdOrderByCreatedAtDesc(findGifticon.getId())
				.get(0)
				.getCreatedAt();
			originalImagePath = getGifticonImageUrl(findGifticon.getId(), FileType.ORIGINAL);
		}

		Integer amount = findGifticon.getType() == GifticonType.AMOUNT ? findGifticon.getOriginalAmount() : null;

		log.info("사용완료 기프티콘 상세 조회 완료");

		return UsedGifticonDetailResponseDto.builder()
			.gifticonId(findGifticon.getId())
			.gifticonName(findGifticon.getName())
			.gifticonType(findGifticon.getType())
			.gifticonExpiryDate(findGifticon.getExpiryDate())
			.brandId(findGifticon.getBrand().getId())
			.brandName(findGifticon.getBrand().getName())
			.usageType(usageType)
			.usageHistoryCreatedAt(usedAt)
			.thumbnailPath(thumbnailPath)
			.originalImagePath(originalImagePath)
			.gifticonOriginalAmount(amount)
			.gifticonCreatedAt(findGifticon.getCreatedAt())
			.build();
	}

	@Override
	@Transactional
	public GifticonBarcodeResponseDto getAvailableGifticonBarcode(Integer gifticonId) {

		log.info("사용가능 기프티콘 바코드 조회 시작");

		// 로그인 된 유저
		User loggedInUser = securityServicePort.getLoggedInUser();
		Integer userId = loggedInUser.getId();

		Gifticon findGifticon = gifticonRepository.findById(gifticonId);

		/*
		 * 사용가능 기프티콘 검증 로직
		 *  1. 삭제 여부 판단
		 *  2. 사용 여부 판단
		 */
		gifticonDomainService.validateGifticonIsAvailable(findGifticon);

		// 사용 권한 검증
		validateGifticonAccess(findGifticon, userId);

		// 바코드 조회 후 5분 뒤 알림 스케줄링
		useCompleteGifticonNotificationSchedule(findGifticon, userId);

		log.info("사용가능 기프티콘 바코드 조회 종료");

		return GifticonBarcodeResponseDto.builder()
			.gifticonBarcodeNumber(findGifticon.getBarcode())
			.barcodePath(getGifticonImageUrl(findGifticon.getId(), FileType.BARCODE))
			.build();
	}

	@Override
	public GifticonBarcodeResponseDto getUsedGifticonBarcode(Integer gifticonId) {

		log.info("사용완료 기프티콘 바코드 조회 시작");

		// 로그인 된 유저
		User loggedInUser = securityServicePort.getLoggedInUser();
		Integer userId = loggedInUser.getId();

		// 해당 기프티콘 조회
		Gifticon findGifticon = gifticonRepository.findById(gifticonId);

		// 삭제, 사용되었는지 검증
		gifticonDomainService.validateGifticonIsUsed(findGifticon);

		// 사용 권한 검증
		validateGifticonAccess(findGifticon, userId);

		// 해당 기프티콘에 대한 사용 내역 조회
		UsageHistory findUsageHistory = usageHistoryRepository.findLatestByUserIdAndGifticonId(userId,
			findGifticon.getId());

		// 쉐어박스 기프티콘이 아니고, 본인 사용 내역도 없는 경우에만 예외 발생
		if (findUsageHistory == null && findGifticon.getSharebox() == null) {
			throw new CustomException(ErrorCode.GIFTICON_NO_USAGE_HISTORY);
		}

		log.info("사용완료 기프티콘 바코드 조회 종료");

		return GifticonBarcodeResponseDto.builder()
			.gifticonBarcodeNumber(findGifticon.getBarcode())
			.barcodePath(getGifticonImageUrl(findGifticon.getId(), FileType.BARCODE))
			.build();
	}

	@Override
	@Transactional
	public void deleteGifticon(Integer gifticonId) {

		// 로그인 된 유저
		User loggedInUser = securityServicePort.getLoggedInUser();
		Integer userId = loggedInUser.getId();

		// 해당 기프티콘 조회
		Gifticon findGifticon = gifticonRepository.findById(gifticonId);

		// 소유자, 기프티콘 공유, 삭제여부 검증
		gifticonDomainService.validateGifticonForDelete(userId, findGifticon);

		// 바코드 정보 삭제
		findGifticon.deleteBarcode();

		// 논리 삭제
		findGifticon.delete();
	}

	private Integer findBrandId(String brandName) {
		if (brandName == null || brandName.trim().isEmpty()) {
			return null;
		}

		return brandRepository.findByNameEquals(brandName)
			.map(Brand::getId)
			.orElse(null);
	}

	private void saveGifticonFiles(Integer gifticonId, String originalImagePath,
		String thumbnailImagePath, String barcodeImagePath) {
		// File 엔티티 생성
		File originalImageFile = File.builder()
			.path(originalImagePath)
			.referenceEntityId(gifticonId)
			.referenceEntityType("gifticon")
			.type(FileType.ORIGINAL)
			.build();

		File thumbnailImageFile = File.builder()
			.path(thumbnailImagePath)
			.referenceEntityId(gifticonId)
			.referenceEntityType("gifticon")
			.type(FileType.THUMBNAIL)
			.build();

		File barcodeImageFile = File.builder()
			.path(barcodeImagePath)
			.referenceEntityId(gifticonId)
			.referenceEntityType("gifticon")
			.type(FileType.BARCODE)
			.build();

		// 파일 저장
		fileRepository.save(originalImageFile);
		fileRepository.save(thumbnailImageFile);
		fileRepository.save(barcodeImageFile);

		log.info("기프티콘 이미지 파일 저장 완료 (기프티콘 ID: {})", gifticonId);
	}

	private String getGifticonImageUrl(Integer gifticonId, FileType fileType) {
		File file = fileRepository.findByReferenceEntityTypeAndReferenceEntityIdAndType("gifticon", gifticonId,
				fileType)
			.orElseThrow(() -> new CustomException(ErrorCode.FILE_NOT_FOUND));

		return fileStoragePort.generateFileUrl(file.getPath(), fileType);
	}

	private String getSignedUrl(String filePath, FileType fileType) {
		return fileStoragePort.generateFileUrl(filePath, fileType);
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

	private List<AvailableGifticonResponseDto> getAvailableGifticonResponseDto(
		Slice<Gifticon> gifticons) {

		// 기프티콘 id 추출
		List<Integer> ids = gifticons.getContent().stream()
			.map(Gifticon::getId)
			.toList();

		// 파일을 한번에 조회
		Map<Integer, String> pathMap = getFilePathMap(ids);

		return gifticons.getContent().stream()
			.map(dto -> AvailableGifticonResponseDto.builder()
				.gifticonId(dto.getId())
				.gifticonName(dto.getName())
				.gifticonType(dto.getType())
				.gifticonExpiryDate(dto.getExpiryDate())
				.brandId(dto.getBrand().getId())
				.brandName(dto.getBrand().getName())
				.scope(dto.getSharebox() == null ? GifticonScopeType.MY_BOX.name() : GifticonScopeType.SHARE_BOX.name())
				.userId(dto.getUser().getId())
				.userName(dto.getUser().getName())
				.shareboxId(dto.getSharebox() == null ? null : dto.getSharebox().getId())
				.shareboxName(dto.getSharebox() == null ? null : dto.getSharebox().getName())
				.thumbnailPath(
					pathMap.get(dto.getId()) != null ? getSignedUrl(pathMap.get(dto.getId()), FileType.THUMBNAIL) :
						null)
				.build())
			.toList();
	}

	private List<UsedGifticonResponseDto> getUsedGifticonResponseDtos(Integer userId,
		Slice<Gifticon> gifticons) {

		// 기프티콘 id 추출
		List<Integer> ids = gifticons.getContent().stream()
			.map(Gifticon::getId)
			.toList();

		Map<Integer, String> pathMap = getFilePathMap(ids);

		Map<Integer, GifticonOwnerHistory> ownerHistoryMap = getOwnerHistoryMap(userId, ids);

		Map<Integer, UsageHistory> usageHistoryMap = getUsageHistoryMap(userId, ids);

		List<UsedGifticonResponseDto> responseDtos = new ArrayList<>();

		for (Gifticon gifticon : gifticons) {

			Integer gifticonId = gifticon.getId();
			UsageHistory usageHistory = usageHistoryMap.get(gifticonId);
			GifticonOwnerHistory ownerHistory = ownerHistoryMap.get(gifticonId);

			// 사용시간, 타입 처리
			UsageInfo usageInfo = getUsageInfo(usageHistory, ownerHistory);

			// 썸네일 경로 처리
			String thumbnailPath = getThumbnailPath(pathMap, gifticonId);

			UsedGifticonResponseDto newDto = UsedGifticonResponseDto.builder()
				.gifticonId(gifticon.getId())
				.gifticonName(gifticon.getName())
				.gifticonType(gifticon.getType())
				.gifticonExpiryDate(gifticon.getExpiryDate())
				.brandId(gifticon.getBrand().getId())
				.brandName(gifticon.getBrand().getName())
				.usageType(usageInfo.usageType())
				.usedAt(usageInfo.usedAt())
				.thumbnailPath(thumbnailPath)
				.build();

			responseDtos.add(newDto);
		}

		return responseDtos;
	}

	private UsageInfo getUsageInfo(UsageHistory usageHistory, GifticonOwnerHistory ownerHistory) {
		UsageType usageType;
		LocalDateTime usedAt;

		if (usageHistory != null) {
			// 사용 이력이 있으면 SELF_USE로 처리
			usageType = UsageType.SELF_USE;
			usedAt = usageHistory.getCreatedAt();

			return new UsageInfo(usageType, usedAt);
		}

		// 소유권 이력이 있으면 해당 전송 타입으로 처리
		usageType = convertTransferTypeToUsageType(ownerHistory.getTransferType());
		usedAt = ownerHistory.getCreatedAt();

		return new UsageInfo(usageType, usedAt);

	}

	private record UsageInfo(UsageType usageType, LocalDateTime usedAt) {
	}

	private String getThumbnailPath(Map<Integer, String> pathMap, Integer gifticonId) {
		String thumbnailPath = null;
		if (pathMap.containsKey(gifticonId)) {
			thumbnailPath = getSignedUrl(pathMap.get(gifticonId), FileType.THUMBNAIL);
		}
		return thumbnailPath;
	}

	private Map<Integer, UsageHistory> getUsageHistoryMap(Integer userId, List<Integer> ids) {
		// 사용 내역을 한번에 조회
		List<UsageHistory> usageHistories = usageHistoryRepository.findLatestForEachGifticonByIdsAndUserId(ids, userId);

		// 사용 내역 맵 생성 (gifticonId -> 사용 내역)
		// 만약 중복된 키가 있을 경우, 가장 최근 기록을 유지
		return usageHistories.stream()
			.collect(Collectors.toMap(
				history -> history.getGifticon().getId(),
				history -> history,
				// 만약 중복된 키가 있을 경우, 가장 최근 기록을 유지
				(existing, replacement) -> existing.getCreatedAt().isAfter(replacement.getCreatedAt())
					? existing : replacement
			));
	}

	private Map<Integer, GifticonOwnerHistory> getOwnerHistoryMap(Integer userId, List<Integer> ids) {
		// 소유자 변경 내역을 한번에 조회
		List<GifticonOwnerHistory> ownerHistories = gifticonOwnerHistoryRepository.findLatestForEachGifticonByIdsAndFromUserId(
			ids, userId);

		// 소유권 이력 맵 생성 (gifticonId -> 소유권 이력)
		// 만약 중복된 키가 있을 경우, 가장 최근 기록을 유지
		return ownerHistories.stream()
			.collect(Collectors.toMap(
				history -> history.getGifticon().getId(),
				history -> history,
				// 만약 중복된 키가 있을 경우, 가장 최근 기록을 유지
				(existing, replacement) -> existing.getCreatedAt().isAfter(replacement.getCreatedAt())
					? existing : replacement
			));
	}

	private Map<Integer, String> getFilePathMap(List<Integer> ids) {
		// 파일을 한번에 조회
		List<File> thumbs = fileRepository.findAllByReferenceEntityTypeAndReferenceEntityIdInAndType(
			"gifticon", ids, FileType.THUMBNAIL);

		// 경로 맵 생성 (gifticonId -> 썸네일 경로)
		return thumbs.stream()
			.collect(Collectors.toMap(File::getReferenceEntityId, File::getPath));
	}

	private UsageType convertTransferTypeToUsageType(TransferType transferType) {
		return switch (transferType) {
			case GIVE_AWAY -> UsageType.GIVE_AWAY;
			case PRESENT -> UsageType.PRESENT;
		};
	}

	/**
	 * 기프티콘 쉐어박스 등록 알림을 전송합니다.
	 */
	private void sendGifticonRegisteredToShareBoxNotification(ShareBox shareBox, Gifticon gifticon) {
		try {
			log.info("기프티콘 쉐어박스 등록 알림 전송 시작 - 쉐어박스 ID: {}, 기프티콘 ID: {}",
				shareBox.getId(), gifticon.getId());

			// 알림 타입 조회
			NotificationType notificationType = notificationTypeRepository.findByCode(
				NotificationTypeCode.SHAREBOX_GIFTICON);
			String title = notificationType.getCode().getDisplayName();

			// 알림 내용 설정
			String content = String.format("%s 쉐어박스에 %s이(가) 등록되었어요.",
				shareBox.getName(), gifticon.getName());

			// 해당 쉐어박스의 모든 참여자 조회
			List<Participation> participations = participationRepository.findByShareBoxId(shareBox.getId());

			for (Participation participation : participations) {
				User participant = participation.getUser();
				Integer participantId = participant.getId();

				// 모든 참여자에게 알림 전송 (등록한 사용자 포함)
				sendNotificationToUser(participantId, notificationType, title, content,
					"sharebox", shareBox.getId());
			}

			log.info("기프티콘 쉐어박스 등록 알림 전송 완료 - 쉐어박스 ID: {}, 기프티콘 ID: {}",
				shareBox.getId(), gifticon.getId());
		} catch (Exception e) {
			// 알림 전송 실패시 로그만 남기고 계속 진행
			log.error("기프티콘 쉐어박스 등록 알림 전송 실패 - 쉐어박스 ID: {}, 기프티콘 ID: {}, 오류: {}",
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

	// 5분 뒤 알림을 보내는 메서드
	private void useCompleteGifticonNotificationSchedule(Gifticon gifticon, Integer userId) {
		final Integer gifticonId = gifticon.getId();

		ScheduledExecutorService scheduler = Executors.newSingleThreadScheduledExecutor();

		scheduler.schedule(() -> {
			try {

				// 사용여부 체크 후 저장, 전송
				checkUsedAndSaveAndSendNotification(userId, gifticonId);

			} catch (Exception e) {
				log.error("기프티콘 바코드 조회 후 알림 전송 실패: {}", e.getMessage(), e);
			} finally {
				scheduler.shutdown();
			}
		}, 5, TimeUnit.MINUTES);

		log.info("기프티콘 ID: {} 바코드 조회 후 5분 뒤 알림 예약됨", gifticonId);
	}

	@Transactional
	public void checkUsedAndSaveAndSendNotification(Integer userId, Integer gifticonId) {
		Gifticon findGifticon = gifticonRepository.findById(gifticonId);

		boolean isUsed = gifticonDomainService.isUsed(findGifticon);

		if (!isUsed) {

			// 알림 타입 조회
			NotificationType notificationType = notificationTypeRepository.findByCode(
				NotificationTypeCode.USAGE_COMPLETE);
			String title = notificationType.getCode().getDisplayName();

			// 알림 내용 설정
			String content = "방금 " + findGifticon.getName() + "을(를) 사용하셨나요? 완료 처리가 되지 않은 것 같아요. 확인해볼까요?";

			sendNotificationToUser(userId, notificationType, title, content, "gifticon",
				gifticonId);
		}
	}
}
