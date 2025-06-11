package com.eurachacha.achacha.domain.model.ai;

import java.time.LocalDateTime;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Document(collection = "ocr_training_data")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class OcrTrainingData {

	@Id
	private String id;

	// OCR 원본 결과
	private String ocrRawResult;

	// 기프티콘 타입
	private String gifticonType;

	// AI 추출 메타데이터
	private MetadataInfo aiExtracted;

	// 사용자 수정 메타데이터
	private MetadataInfo userCorrected;

	// 메타데이터
	private LocalDateTime createdAt;
	private LocalDateTime updatedAt;

	@Getter
	@NoArgsConstructor(access = AccessLevel.PROTECTED)
	@AllArgsConstructor
	@Builder
	public static class MetadataInfo {
		private String barcodeNumber;
		private String brandName;
		private String gifticonName;
		private String gifticonExpiryDate;
		private Integer gifticonOriginalAmount;  // AMOUNT 타입일 때만 값이 있음
	}
}
