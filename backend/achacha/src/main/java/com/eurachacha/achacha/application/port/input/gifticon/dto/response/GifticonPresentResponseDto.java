package com.eurachacha.achacha.application.port.input.gifticon.dto.response;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class GifticonPresentResponseDto {

	private String presentCardCode;
	private String gifticonName;
	private String brandName;
}
