package com.eurachacha.achacha.web.gifticon;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.eurachacha.achacha.application.port.input.gifticon.GifticonAppService;
import com.eurachacha.achacha.application.port.input.gifticon.dto.response.AvailableGifticonsResponseDto;
import com.eurachacha.achacha.application.port.input.gifticon.dto.response.GifticonBarcodeResponseDto;
import com.eurachacha.achacha.domain.model.gifticon.enums.GifticonScopeType;
import com.eurachacha.achacha.domain.model.gifticon.enums.GifticonSortType;
import com.eurachacha.achacha.domain.model.gifticon.enums.GifticonType;

import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;

@RequestMapping("/api/available-gifticons")
@RestController
@RequiredArgsConstructor
public class AvailableGifticonController {

	private final GifticonAppService gifticonAppService;

	@GetMapping
	public ResponseEntity<AvailableGifticonsResponseDto> getAvailableGifticons(
		@RequestParam(required = false, defaultValue = "ALL") GifticonScopeType scope,
		@RequestParam(required = false) GifticonType type,
		@RequestParam(required = false, defaultValue = "CREATED_DESC") GifticonSortType sort,
		@RequestParam(required = false, defaultValue = "0") @Min(0) Integer page,
		@RequestParam(required = false, defaultValue = "10") @Min(1) Integer size) {
		return ResponseEntity.ok(gifticonAppService.getAvailableGifticons(scope, type, sort, page, size));
	}

	@GetMapping("/{gifticonId}")
	public ResponseEntity<?> getAvailableGifticon(
		@PathVariable Integer gifticonId
	) {
		return ResponseEntity.ok(gifticonAppService.getAvailableGifticonDetail(gifticonId));
	}

	@GetMapping("/{gifticonId}/barcode")
	public ResponseEntity<GifticonBarcodeResponseDto> getAvailableGifticonBarcode(
		@PathVariable Integer gifticonId
	) {
		return ResponseEntity.ok(gifticonAppService.getAvailableGifticonBarcode(gifticonId));
	}
}
