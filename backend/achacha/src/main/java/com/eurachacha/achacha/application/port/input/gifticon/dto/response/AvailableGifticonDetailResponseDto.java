package com.eurachacha.achacha.application.port.input.gifticon.dto.response;

import java.time.LocalDate;
import java.time.LocalDateTime;

import com.eurachacha.achacha.domain.model.gifticon.enums.GifticonType;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AvailableGifticonDetailResponseDto {
	private Integer gifticonId;
	private String gifticonName;
	private GifticonType gifticonType;
	private LocalDate gifticonExpiryDate;
	private Integer brandId;
	private String brandName;
	private String scope; // MY_BOX or SHARE_BOX
	private Integer userId;
	private String userName;
	private Integer shareBoxId;
	private String shareBoxName;
	private String thumbnailPath;
	private String originalImagePath;
	private LocalDateTime gifticonCreatedAt;
	private Integer gifticonOriginalAmount;
	private Integer gifticonRemainingAmount;
}
