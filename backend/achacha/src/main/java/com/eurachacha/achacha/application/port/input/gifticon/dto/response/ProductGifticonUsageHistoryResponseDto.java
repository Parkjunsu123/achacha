package com.eurachacha.achacha.application.port.input.gifticon.dto.response;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductGifticonUsageHistoryResponseDto {
	private Integer gifticonId;
	private String gifticonName;
	private UsageHistoryDto usageHistory;

	@Getter
	@NoArgsConstructor
	@AllArgsConstructor
	@Builder
	public static class UsageHistoryDto {
		private Integer usageHistoryId;
		private LocalDateTime usageHistoryCreatedAt;
		private Integer userId;
		private String userName;
	}
}
