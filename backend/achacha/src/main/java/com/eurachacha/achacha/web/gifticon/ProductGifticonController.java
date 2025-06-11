package com.eurachacha.achacha.web.gifticon;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.eurachacha.achacha.application.port.input.gifticon.GifticonUsageAppService;
import com.eurachacha.achacha.application.port.input.gifticon.dto.response.ProductGifticonUsageHistoryResponseDto;

import lombok.RequiredArgsConstructor;

@RequestMapping("/api/product-gifticons")
@RestController
@RequiredArgsConstructor
public class ProductGifticonController {

	private final GifticonUsageAppService gifticonUsageAppService;

	@PostMapping("/{gifticonId}/use")
	public ResponseEntity<String> useGifticon(@PathVariable Integer gifticonId) {
		gifticonUsageAppService.useProductGifticon(gifticonId);
		return ResponseEntity.ok("기프티콘이 사용되었습니다.");
	}

	@GetMapping("/{gifticonId}/usage-history")
	public ResponseEntity<ProductGifticonUsageHistoryResponseDto> getUsageHistory(@PathVariable Integer gifticonId) {
		return ResponseEntity.ok(gifticonUsageAppService.getProductGifticonUsageHistories(gifticonId));
	}

}
