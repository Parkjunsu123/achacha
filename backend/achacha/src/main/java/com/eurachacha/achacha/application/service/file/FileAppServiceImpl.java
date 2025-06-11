// package com.eurachacha.achacha.application.service.file;
//
// import java.util.List;
//
// import org.springframework.stereotype.Service;
// import org.springframework.transaction.annotation.Transactional;
// import org.springframework.web.multipart.MultipartFile;
//
// import com.eurachacha.achacha.application.port.input.file.FileAppService;
// import com.eurachacha.achacha.application.port.input.file.dto.response.FileResponseDto;
// import com.eurachacha.achacha.application.port.output.file.FileRepository;
// import com.eurachacha.achacha.application.port.output.file.FileStoragePort;
// import com.eurachacha.achacha.domain.model.file.File;
// import com.eurachacha.achacha.domain.model.file.enums.FileType;
// import com.eurachacha.achacha.domain.service.file.FileDomainService;
//
// import jakarta.persistence.EntityNotFoundException;
// import lombok.RequiredArgsConstructor;
//
// @Service
// @RequiredArgsConstructor
// public class FileAppServiceImpl implements FileAppService {
//
// 	private static final long DEFAULT_URL_EXPIRATION = 3600000L; // 1시간
// 	private static final String GIFTICON_ENTITY_TYPE = "GIFTICON";
//
// 	private final FileRepository fileRepository;
// 	private final FileStoragePort fileStoragePort;
// 	private final FileDomainService fileDomainService;
//
// 	@Override
// 	@Transactional
// 	public void saveGifticonFiles(Integer gifticonId,
// 		MultipartFile originalImage,
// 		MultipartFile thumbnailImage,
// 		MultipartFile barcodeImage) {
//
// 		if (originalImage != null && !originalImage.isEmpty()) {
// 			String path = fileStoragePort.uploadFile(
// 				originalImage, FileType.ORIGINAL, gifticonId);
// 			File file = fileDomainService.createFile(
// 				path, FileType.ORIGINAL, GIFTICON_ENTITY_TYPE, gifticonId);
// 			fileRepository.save(file);
// 		}
//
// 		if (thumbnailImage != null && !thumbnailImage.isEmpty()) {
// 			String path = fileStoragePort.uploadFile(
// 				thumbnailImage, FileType.THUMBNAIL, gifticonId);
// 			File file = fileDomainService.createFile(
// 				path, FileType.THUMBNAIL, GIFTICON_ENTITY_TYPE, gifticonId);
// 			fileRepository.save(file);
// 		}
//
// 		if (barcodeImage != null && !barcodeImage.isEmpty()) {
// 			String path = fileStoragePort.uploadFile(
// 				barcodeImage, FileType.BARCODE, gifticonId);
// 			File file = fileDomainService.createFile(
// 				path, FileType.BARCODE, GIFTICON_ENTITY_TYPE, gifticonId);
// 			fileRepository.save(file);
// 		}
// 	}
//
// 	@Override
// 	@Transactional(readOnly = true)
// 	public FileResponseDto getGifticonFileUrl(Integer gifticonId, FileType fileType) {
// 		File file = fileRepository.findByReferenceEntityTypeAndReferenceEntityIdAndType(
// 				GIFTICON_ENTITY_TYPE, gifticonId, fileType)
// 			.orElseThrow(() -> new EntityNotFoundException("파일을 찾을 수 없습니다"));
//
// 		String url = fileStoragePort.generateFileUrl(file.getPath(), fileType, DEFAULT_URL_EXPIRATION);
//
// 		return FileResponseDto.builder()
// 			.url(url)
// 			.build();
// 	}
//
// 	@Override
// 	@Transactional
// 	public void deleteGifticonFiles(Integer gifticonId) {
// 		List<File> files = fileRepository.findAllByReferenceEntityTypeAndReferenceEntityId(
// 			GIFTICON_ENTITY_TYPE, gifticonId);
//
// 		for (File file : files) {
// 			fileStoragePort.deleteFile(file.getPath(), file.getType());
// 			fileRepository.delete(file);
// 		}
// 	}
// }
