package com.eurachacha.achacha.web.gifticon;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.eurachacha.achacha.application.port.input.gifticon.GifticonAppService;
import com.eurachacha.achacha.application.port.input.gifticon.dto.response.GifticonBarcodeResponseDto;
import com.eurachacha.achacha.application.port.input.gifticon.dto.response.UsedGifticonDetailResponseDto;
import com.eurachacha.achacha.application.port.input.gifticon.dto.response.UsedGifticonsResponseDto;
import com.eurachacha.achacha.domain.model.gifticon.enums.GifticonType;
import com.eurachacha.achacha.domain.model.gifticon.enums.GifticonUsedSortType;

import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;

@RequestMapping("/api/used-gifticons")
@RestController
@RequiredArgsConstructor
public class UsedGifticonController {

	private final GifticonAppService gifticonAppService;

	@GetMapping
	public ResponseEntity<UsedGifticonsResponseDto> getUsedGifticons(
		@RequestParam(required = false) GifticonType type,
		@RequestParam(required = false, defaultValue = "USED_DESC") GifticonUsedSortType sort,
		@RequestParam(required = false, defaultValue = "0") @Min(0) Integer page,
		@RequestParam(required = false, defaultValue = "10") @Min(1) Integer size) {
		return ResponseEntity.ok(gifticonAppService.getUsedGifticons(type, sort, page, size));
	}

	@GetMapping("/{gifticonId}")
	public ResponseEntity<UsedGifticonDetailResponseDto> getUsedGifticon(@PathVariable Integer gifticonId) {
		return ResponseEntity.ok(gifticonAppService.getUsedGifticonDetail(gifticonId));
	}

	@GetMapping("/{gifticonId}/barcode")
	public ResponseEntity<GifticonBarcodeResponseDto> getUsedGifticonBarcode(@PathVariable Integer gifticonId) {
		return ResponseEntity.ok(gifticonAppService.getUsedGifticonBarcode(gifticonId));
	}
}
