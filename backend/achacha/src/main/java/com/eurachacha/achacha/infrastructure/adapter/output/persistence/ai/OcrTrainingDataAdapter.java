package com.eurachacha.achacha.infrastructure.adapter.output.persistence.ai;

import java.time.LocalDateTime;
import java.util.Optional;

import org.springframework.stereotype.Component;

import com.eurachacha.achacha.application.port.output.ai.OcrTrainingDataRepository;
import com.eurachacha.achacha.domain.model.ai.OcrTrainingData;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class OcrTrainingDataAdapter implements OcrTrainingDataRepository {

	private final OcrTrainingDataMongoRepository mongoRepository;

	@Override
	public OcrTrainingData saveOcrResultWithMetadata(
		String ocrRawResult,
		String gifticonType,
		String barcodeNumber,
		String brandName,
		String gifticonName,
		String gifticonExpiryDate,
		Integer gifticonOriginalAmount) {

		OcrTrainingData.MetadataInfo aiExtracted = OcrTrainingData.MetadataInfo.builder()
			.barcodeNumber(barcodeNumber)
			.brandName(brandName)
			.gifticonName(gifticonName)
			.gifticonExpiryDate(gifticonExpiryDate)
			.gifticonOriginalAmount(gifticonOriginalAmount)
			.build();

		OcrTrainingData ocrTrainingData = OcrTrainingData.builder()
			.ocrRawResult(ocrRawResult)
			.gifticonType(gifticonType)
			.aiExtracted(aiExtracted)
			.createdAt(LocalDateTime.now())
			.updatedAt(LocalDateTime.now())
			.build();

		return mongoRepository.save(ocrTrainingData);
	}

	@Override
	public OcrTrainingData updateUserCorrectedForAmount(String id, String barcodeNumber, String brandName,
		String gifticonName, String gifticonExpiryDate, Integer gifticonOriginalAmount) {
		// 금액형 기프티콘용 업데이트 메서드
		mongoRepository.updateUserCorrectedForAmount(
			id, barcodeNumber, brandName, gifticonName, gifticonExpiryDate, gifticonOriginalAmount,
			LocalDateTime.now());

		// 업데이트된 문서 반환
		return mongoRepository.findById(id).orElse(null);
	}

	@Override
	public OcrTrainingData updateUserCorrectedForProduct(String id, String barcodeNumber, String brandName,
		String gifticonName, String gifticonExpiryDate) {
		// 상품형 기프티콘용 업데이트 메서드
		mongoRepository.updateUserCorrectedForProduct(
			id, barcodeNumber, brandName, gifticonName, gifticonExpiryDate,
			LocalDateTime.now());

		// 업데이트된 문서 반환
		return mongoRepository.findById(id).orElse(null);
	}

	@Override
	public Optional<OcrTrainingData> findById(String id) {
		return mongoRepository.findById(id);
	}
}
