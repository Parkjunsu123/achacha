package com.eurachacha.achacha.application.port.input.gifticon.dto.response;

import java.time.LocalDate;
import java.time.LocalDateTime;

import com.eurachacha.achacha.domain.model.gifticon.enums.GifticonType;
import com.eurachacha.achacha.domain.model.history.enums.UsageType;
import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonInclude;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UsedGifticonResponseDto {
	private Integer gifticonId;
	private String gifticonName;
	private GifticonType gifticonType;
	@JsonFormat(pattern = "yyyy-MM-dd")
	private LocalDate gifticonExpiryDate;
	
	@JsonInclude(JsonInclude.Include.NON_NULL) // null 값은 JSON 직렬화에서 제외
	private Integer userId;
	@JsonInclude(JsonInclude.Include.NON_NULL)
	private String userName;

	private Integer brandId;
	private String brandName;

	private UsageType usageType;
	private LocalDateTime usedAt;
	private String thumbnailPath;
}
