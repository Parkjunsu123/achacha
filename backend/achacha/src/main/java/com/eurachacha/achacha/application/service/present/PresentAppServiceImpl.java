package com.eurachacha.achacha.application.service.present;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.eurachacha.achacha.application.port.input.present.PresentAppService;
import com.eurachacha.achacha.application.port.input.present.dto.response.ColorCardInfoDto;
import com.eurachacha.achacha.application.port.input.present.dto.response.ColorInfoResponseDto;
import com.eurachacha.achacha.application.port.input.present.dto.response.PresentCardResponseDto;
import com.eurachacha.achacha.application.port.input.present.dto.response.PresentTemplateDetailResponseDto;
import com.eurachacha.achacha.application.port.input.present.dto.response.TemplatesResponseDto;
import com.eurachacha.achacha.application.port.output.file.FileRepository;
import com.eurachacha.achacha.application.port.output.file.FileStoragePort;
import com.eurachacha.achacha.application.port.output.present.ColorPaletteRepository;
import com.eurachacha.achacha.application.port.output.present.PresentCardRepository;
import com.eurachacha.achacha.application.port.output.present.PresentTemplateRepository;
import com.eurachacha.achacha.domain.model.file.File;
import com.eurachacha.achacha.domain.model.file.enums.FileType;
import com.eurachacha.achacha.domain.model.gifticon.Gifticon;
import com.eurachacha.achacha.domain.model.present.ColorPalette;
import com.eurachacha.achacha.domain.model.present.PresentCard;
import com.eurachacha.achacha.domain.model.present.PresentTemplate;
import com.eurachacha.achacha.domain.model.present.enums.TemplateCategory;
import com.eurachacha.achacha.domain.service.present.PresentCardDomainService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class PresentAppServiceImpl implements PresentAppService {

	private final PresentCardDomainService presentCardDomainService;
	private final PresentCardRepository presentCardRepository;
	private final PresentTemplateRepository presentTemplateRepository;
	private final ColorPaletteRepository colorPaletteRepository;
	private final FileRepository fileRepository;
	private final FileStoragePort fileStoragePort;

	@Override
	public List<TemplatesResponseDto> getTemplates() {
		// 모든 템플릿 조회
		List<PresentTemplate> templates = presentTemplateRepository.findAll();

		// 템플릿 ID 리스트 추출
		List<Integer> templateIds = templates.stream()
			.map(template -> template.getId().intValue())
			.collect(Collectors.toList());

		// 모든 템플릿의 썸네일 파일을 한 번에 조회
		List<File> thumbnailFiles = fileRepository.findAllByReferenceEntityTypeAndReferenceEntityIdInAndType(
			"present_template",
			templateIds,
			FileType.PRESENT_THUMBNAIL
		);

		// 파일 맵 생성 (템플릿 ID를 키로 사용)
		Map<Integer, File> fileMap = new HashMap<>();
		for (File file : thumbnailFiles) {
			fileMap.put(file.getReferenceEntityId(), file);
		}

		// 템플릿과 파일 정보를 결합하여 응답 DTO 생성
		return templates.stream()
			.map(template -> {
				Integer templateId = template.getId().intValue();

				// 템플릿 ID에 해당하는 파일 찾기
				File thumbnailFile = fileMap.get(templateId);

				// 파일이 있으면 URL 생성
				String thumbnailUrl = thumbnailFile != null ?
					fileStoragePort.generateFileUrl(thumbnailFile.getPath(), FileType.PRESENT_THUMBNAIL) :
					null;

				// TemplatesResponseDto 생성
				return TemplatesResponseDto.builder()
					.presentTemplateId(templateId)
					.presentTemplateCategory(template.getCategory().name())
					.thumbnailPath(thumbnailUrl)
					.build();
			})
			.collect(Collectors.toList());
	}

	@Override
	public PresentTemplateDetailResponseDto getTemplateDetail(Integer templateId) {
		// 1. 템플릿 정보 조회
		PresentTemplate template = presentTemplateRepository.findById(templateId);

		// 2. 템플릿 카테고리와 ID로 기본 DTO 빌더 생성
		PresentTemplateDetailResponseDto.PresentTemplateDetailResponseDtoBuilder builder = PresentTemplateDetailResponseDto.builder()
			.presentTemplateId(templateId)
			.presentTemplateCategory(template.getCategory().name());

		// 3. GENERAL 템플릿인 경우 색상별 카드 이미지 추가 후 반환
		if (template.getCategory() == TemplateCategory.GENERAL) {
			return builder
				.colorCards(getColorPaletteBasedCardImages(templateId))
				.build();
		}

		// 4. 일반 템플릿인 경우 단일 카드 이미지 경로 추가 후 반환
		return builder
			.cardImagePath(getFileUrl("present_template", templateId, FileType.PRESENT_CARD))
			.build();
	}

	@Override
	public PresentCardResponseDto getPresentCard(String presentCardCode) {
		log.info("선물 카드 조회 시작: presentCardCode={}", presentCardCode);

		// 선물 카드 조회
		PresentCard presentCard = presentCardRepository.findByPresentCardCode(presentCardCode);
		log.info("조회된 선물 카드: id={}, code={}", presentCard.getId(), presentCard.getCode());

		// 만료 여부를 먼저 확인하고 만료된 경우 즉시 예외 발생
		presentCardDomainService.validateExpiryDateTime(LocalDateTime.now(), presentCard.getExpiryDateTime());

		Gifticon gifticon = presentCard.getGifticon();
		PresentTemplate presentTemplate = presentCard.getPresentTemplate();
		log.info("기프티콘 ID: {}, 템플릿 ID: {}", gifticon.getId(), presentTemplate.getId());

		// 기프티콘 이미지 URL 생성
		String gifticonOriginalPath = getFileUrl("gifticon", gifticon.getId(), FileType.ORIGINAL);
		String gifticonThumbnailPath = getFileUrl("gifticon", gifticon.getId(), FileType.THUMBNAIL);

		// 템플릿 카드 이미지 URL 생성 (템플릿 카테고리에 따라 다른 방식으로 조회)
		String templateCardPath = getTemplateCardPath(presentCard, presentTemplate);

		return PresentCardResponseDto.builder()
			.presentCardCode(presentCard.getCode())
			.presentCardMessage(presentCard.getMessage())
			.gifticonOriginalPath(gifticonOriginalPath)
			.gifticonThumbnailPath(gifticonThumbnailPath)
			.templateCardPath(templateCardPath)
			.expiryDateTime(presentCard.getExpiryDateTime())
			.build();
	}

	private String getTemplateCardPath(PresentCard presentCard, PresentTemplate presentTemplate) {
		if (presentTemplate.getCategory() == TemplateCategory.GENERAL) {
			// GENERAL 템플릿인 경우 색상 팔레트로 조회
			ColorPalette colorPalette = presentCard.getColorPalette();
			log.info("GENERAL 템플릿 - 색상 팔레트 ID: {}", colorPalette != null ? colorPalette.getId() : "없음");

			if (colorPalette != null) {
				return getFileUrl("color_palette", colorPalette.getId(), FileType.PRESENT_CARD);
			}

			log.warn("색상 팔레트가 없음: presentCardId={}", presentCard.getId());
			return null;
		}

		// 기타 템플릿인 경우 템플릿 ID로 조회
		log.info("일반 템플릿 - 템플릿 ID: {}", presentTemplate.getId());
		return getFileUrl("present_template", presentTemplate.getId(), FileType.PRESENT_CARD);
	}

	/**
	 * 색상 팔레트 기반 카드 이미지 정보를 조회합니다. (GENERAL 템플릿용)
	 *
	 * @param templateId 템플릿 ID
	 * @return 색상별 카드 정보 목록
	 */
	private List<ColorCardInfoDto> getColorPaletteBasedCardImages(Integer templateId) {
		// 1. 해당 템플릿의 모든 색상 팔레트 조회
		List<ColorPalette> colorPalettes = colorPaletteRepository.findByPresentTemplateId(templateId);

		// 2. 모든 색상 팔레트 ID 추출
		List<Integer> colorPaletteIds = colorPalettes.stream()
			.map(colorPalette -> colorPalette.getId().intValue())
			.collect(Collectors.toList());

		// 3. 모든 색상 팔레트에 대한 카드 이미지를 한 번에 조회
		List<File> cardFiles = fileRepository.findAllByReferenceEntityTypeAndReferenceEntityIdInAndType(
			"color_palette",
			colorPaletteIds,
			FileType.PRESENT_CARD
		);

		// 4. 파일 맵 생성 (색상 팔레트 ID를 키로 사용)
		Map<Integer, File> fileMap = cardFiles.stream()
			.collect(Collectors.toMap(
				File::getReferenceEntityId,
				file -> file
			));

		// 5. 각 색상 팔레트별 DTO 생성
		return colorPalettes.stream()
			.map(colorPalette -> {
				Integer colorPaletteId = colorPalette.getId().intValue();
				File cardFile = fileMap.get(colorPaletteId);

				String cardImageUrl = cardFile != null ?
					fileStoragePort.generateFileUrl(cardFile.getPath(), FileType.PRESENT_CARD) :
					null;

				return ColorCardInfoDto.builder()
					.colorPaletteId(colorPaletteId)
					.cardImagePath(cardImageUrl)
					.build();
			})
			.collect(Collectors.toList());
	}

	/**
	 * 파일 URL을 가져오는 통합 헬퍼 메서드
	 *
	 * @param entityType 참조 엔티티 타입
	 * @param entityId 참조 엔티티 ID
	 * @param fileType 파일 타입
	 * @return 파일 URL 또는 파일이 없는 경우 null
	 */
	private String getFileUrl(String entityType, Integer entityId, FileType fileType) {
		return fileRepository.findByReferenceEntityTypeAndReferenceEntityIdAndType(
				entityType, entityId, fileType)
			.map(file -> {
				log.info("파일 조회 성공: id={}, path={}", file.getId(), file.getPath());
				return fileStoragePort.generateFileUrl(file.getPath(), fileType);
			})
			.orElseGet(() -> {
				log.warn("파일을 찾을 수 없음: entityType={}, entityId={}", entityType, entityId);
				return null;
			});
	}

	@Override
	public List<ColorInfoResponseDto> getColors(Integer templateId) {
		List<ColorPalette> colorPalettes = colorPaletteRepository.findByPresentTemplateId(templateId);

		return colorPalettes.stream()
			.map(colorPalette -> ColorInfoResponseDto.builder()
				.colorPaletteId(colorPalette.getId().intValue())
				.colorPaletteCode(colorPalette.getCode())
				.presentTemplateId(templateId)
				.build())
			.collect(Collectors.toList());
	}

}
