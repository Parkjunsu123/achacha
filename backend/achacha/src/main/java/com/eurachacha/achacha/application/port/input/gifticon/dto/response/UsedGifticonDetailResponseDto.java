package com.eurachacha.achacha.application.port.input.gifticon.dto.response;

import java.time.LocalDate;
import java.time.LocalDateTime;

import com.eurachacha.achacha.domain.model.gifticon.enums.GifticonType;
import com.eurachacha.achacha.domain.model.history.enums.UsageType;
import com.fasterxml.jackson.annotation.JsonFormat;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UsedGifticonDetailResponseDto {
	private Integer gifticonId;
	private String gifticonName;
	private GifticonType gifticonType;
	@JsonFormat(pattern = "yyyy-MM-dd")
	private LocalDate gifticonExpiryDate;
	private Integer brandId;
	private String brandName;
	private UsageType usageType;
	private LocalDateTime usageHistoryCreatedAt;
	private String thumbnailPath;
	private String originalImagePath;
	private Integer gifticonOriginalAmount;
	private LocalDateTime gifticonCreatedAt;
}
