package com.eurachacha.achacha.application.port.input.gifticon.dto.request;

import java.time.LocalDate;

import com.eurachacha.achacha.domain.model.gifticon.enums.GifticonType;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@AllArgsConstructor
@NoArgsConstructor
public class GifticonSaveRequestDto {
	@NotBlank(message = "바코드 번호는 필수입니다")
	@Size(max = 32, message = "바코드 번호는 최대 32자까지 입력 가능합니다")
	private String gifticonBarcodeNumber;

	@NotNull(message = "브랜드 ID는 필수입니다")
	private Integer brandId;

	@NotBlank(message = "상품명은 필수입니다")
	@Size(max = 64, message = "상품명은 최대 64자까지 입력 가능합니다")
	private String gifticonName;

	@NotNull(message = "유효기간은 필수입니다")
	private LocalDate gifticonExpiryDate;

	@NotNull(message = "기프티콘 타입은 필수입니다")
	private GifticonType gifticonType;

	private Integer gifticonAmount;

	private Integer shareBoxId;

	@NotBlank(message = "OCR 학습 데이터 ID는 필수입니다")
	private String ocrTrainingDataId;
}
