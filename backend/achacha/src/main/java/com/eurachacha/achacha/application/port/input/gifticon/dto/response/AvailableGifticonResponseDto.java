package com.eurachacha.achacha.application.port.input.gifticon.dto.response;

import java.time.LocalDate;

import com.eurachacha.achacha.domain.model.gifticon.enums.GifticonType;
import com.fasterxml.jackson.annotation.JsonFormat;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AvailableGifticonResponseDto {
	private Integer gifticonId;
	private String gifticonName;
	private GifticonType gifticonType;
	@JsonFormat(pattern = "yyyy-MM-dd")
	private LocalDate gifticonExpiryDate;
	private Integer brandId;
	private String brandName;
	private String scope;
	private Integer userId;
	private String userName;
	private Integer shareboxId;
	private String shareboxName;
	private String thumbnailPath;
}
