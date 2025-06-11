package com.eurachacha.achacha.application.port.input.gifticon.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GifticonBarcodeResponseDto {
	private String gifticonBarcodeNumber;
	private String barcodePath;
}
