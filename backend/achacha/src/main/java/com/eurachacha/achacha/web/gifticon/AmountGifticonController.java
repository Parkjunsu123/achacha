package com.eurachacha.achacha.web.gifticon;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.eurachacha.achacha.application.port.input.gifticon.GifticonUsageAppService;
import com.eurachacha.achacha.application.port.input.gifticon.dto.request.AmountGifticonUseRequestDto;
import com.eurachacha.achacha.application.port.input.gifticon.dto.response.AmountGifticonUsageHistoriesResponseDto;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RequestMapping("/api/amount-gifticons")
@RestController
@RequiredArgsConstructor
public class AmountGifticonController {

	private final GifticonUsageAppService gifticonUsageAppService;

	@PostMapping("/{gifticonId}/use")
	public ResponseEntity<String> useGifticon(
		@PathVariable Integer gifticonId,
		@Valid @RequestBody AmountGifticonUseRequestDto requestDto
	) {
		gifticonUsageAppService.useAmountGifticon(gifticonId, requestDto);
		return ResponseEntity.ok("기프티콘이 사용되었습니다.");
	}

	@GetMapping("/{gifticonId}/usage-history")
	public ResponseEntity<AmountGifticonUsageHistoriesResponseDto> getUsageHistory(
		@PathVariable Integer gifticonId
	) {
		return ResponseEntity.ok(gifticonUsageAppService.getAmountGifticonUsageHistories(gifticonId));
	}

	@PatchMapping("/{gifticonId}/usage-history/{usageHistoryId}")
	public ResponseEntity<String> updateUsageHistory(
		@PathVariable Integer gifticonId,
		@PathVariable Integer usageHistoryId,
		@Valid @RequestBody AmountGifticonUseRequestDto requestDto
	) {
		gifticonUsageAppService.updateAmountGifticonUsageHistory(gifticonId, usageHistoryId, requestDto);
		return ResponseEntity.ok("기프티콘 사용내역이 변경되었습니다.");
	}

	@DeleteMapping("/{gifticonId}/usage-history/{usageHistoryId}")
	public ResponseEntity<String> deleteUsageHistory(
		@PathVariable Integer gifticonId,
		@PathVariable Integer usageHistoryId
	) {
		gifticonUsageAppService.deleteAmountGifticonUsageHistory(gifticonId, usageHistoryId);
		return ResponseEntity.ok("기프티콘 사용내역이 삭제되었습니다.");
	}
}
