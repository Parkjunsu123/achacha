package com.eurachacha.achacha.application.port.output.ai;

import java.util.Optional;

import com.eurachacha.achacha.domain.model.ai.OcrTrainingData;

public interface OcrTrainingDataRepository {
	// OCR 결과와 AI 추출 메타데이터를 한 번에 저장
	OcrTrainingData saveOcrResultWithMetadata(String ocrRawResult, String gifticonType, String barcodeNumber,
		String brandName, String gifticonName, String gifticonExpiryDate, Integer gifticonOriginalAmount);

	OcrTrainingData updateUserCorrectedForAmount(String id, String barcodeNumber, String brandName,
		String gifticonName, String gifticonExpiryDate, Integer gifticonOriginalAmount);

	OcrTrainingData updateUserCorrectedForProduct(String id, String barcodeNumber, String brandName,
		String gifticonName, String gifticonExpiryDate);

	// ID로 데이터 조회
	Optional<OcrTrainingData> findById(String id);
}
