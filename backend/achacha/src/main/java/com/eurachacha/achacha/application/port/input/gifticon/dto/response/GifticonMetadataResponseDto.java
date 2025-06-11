package com.eurachacha.achacha.application.port.input.gifticon.dto.response;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
@ToString
public class GifticonMetadataResponseDto {
	private String gifticonBarcodeNumber; // 바코드 번호 (공백과 구분자 없이)
	private Integer brandId; // 브랜드 id
	private String brandName; // 브랜드 이름
	private String gifticonName; // 상품명
	private String gifticonExpiryDate; // 유효기간(YYYY-MM-DD 형식)
	private Integer gifticonOriginalAmount; // 기프티콘 금액 (금액형인 경우)
	private String ocrTrainingDataId; // OCR 학습 데이터 ID
}
