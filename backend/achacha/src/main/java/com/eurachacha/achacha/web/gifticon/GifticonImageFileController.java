// package com.eurachacha.achacha.web.gifticon;
//
// import org.springframework.http.ResponseEntity;
// import org.springframework.web.bind.annotation.DeleteMapping;
// import org.springframework.web.bind.annotation.GetMapping;
// import org.springframework.web.bind.annotation.PathVariable;
// import org.springframework.web.bind.annotation.PostMapping;
// import org.springframework.web.bind.annotation.RequestMapping;
// import org.springframework.web.bind.annotation.RequestParam;
// import org.springframework.web.bind.annotation.RestController;
// import org.springframework.web.multipart.MultipartFile;
//
// import com.eurachacha.achacha.application.port.input.file.FileAppService;
// import com.eurachacha.achacha.application.port.input.file.dto.response.FileResponseDto;
// import com.eurachacha.achacha.domain.model.file.enums.FileType;
//
// import lombok.RequiredArgsConstructor;
//
// @RestController
// @RequiredArgsConstructor
// @RequestMapping("/api/gifticons")
// public class GifticonImageFileController {
//
// 	private final FileAppService fileAppService;
//
// 	@PostMapping("/{gifticonId}/images")
// 	public ResponseEntity<Void> uploadGifticonImages(
// 		@PathVariable Integer gifticonId,
// 		@RequestParam(required = false) MultipartFile originalImage,
// 		@RequestParam(required = false) MultipartFile thumbnailImage,
// 		@RequestParam(required = false) MultipartFile barcodeImage) {
//
// 		fileAppService.saveGifticonFiles(gifticonId, originalImage, thumbnailImage, barcodeImage);
// 		return ResponseEntity.ok().build();
// 	}
//
// 	@GetMapping("/{gifticonId}/images/{imageType}")
// 	public ResponseEntity<FileResponseDto> getGifticonImageUrl(
// 		@PathVariable Integer gifticonId,
// 		@PathVariable String imageType) {
//
// 		FileType fileType;
// 		switch (imageType.toUpperCase()) {
// 			case "ORIGINAL":
// 				fileType = FileType.ORIGINAL;
// 				break;
// 			case "THUMBNAIL":
// 				fileType = FileType.THUMBNAIL;
// 				break;
// 			case "BARCODE":
// 				fileType = FileType.BARCODE;
// 				break;
// 			default:
// 				return ResponseEntity.badRequest().build();
// 		}
//
// 		FileResponseDto response = fileAppService.getGifticonFileUrl(gifticonId, fileType);
// 		return ResponseEntity.ok(response);
// 	}
//
// 	@DeleteMapping("/{gifticonId}/images")
// 	public ResponseEntity<Void> deleteGifticonImages(@PathVariable Integer gifticonId) {
// 		fileAppService.deleteGifticonFiles(gifticonId);
// 		return ResponseEntity.noContent().build();
// 	}
// }