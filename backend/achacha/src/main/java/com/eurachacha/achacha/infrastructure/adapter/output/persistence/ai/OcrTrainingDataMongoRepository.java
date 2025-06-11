package com.eurachacha.achacha.infrastructure.adapter.output.persistence.ai;

import java.time.LocalDateTime;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.data.mongodb.repository.Update;
import org.springframework.stereotype.Repository;

import com.eurachacha.achacha.domain.model.ai.OcrTrainingData;

@Repository
public interface OcrTrainingDataMongoRepository extends MongoRepository<OcrTrainingData, String> {

	// AMOUNT 타입용 업데이트 메서드 (금액 포함)
	@Query("{ '_id' : ?0 }")
	@Update("{ '$set' : { 'userCorrected' : { 'barcodeNumber' : ?1, 'brandName' : ?2, 'gifticonName' : ?3, 'gifticonExpiryDate' : ?4, 'gifticonOriginalAmount' : ?5 }, 'updatedAt' : ?6 } }")
	void updateUserCorrectedForAmount(String id, String barcodeNumber, String brandName, String gifticonName,
		String expiryDate, Integer originalAmount, LocalDateTime updatedAt);

	// PRODUCT 타입용 업데이트 메서드 (금액 필드 자체를 제외)
	@Query("{ '_id' : ?0 }")
	@Update("{ '$set' : { 'userCorrected' : { 'barcodeNumber' : ?1, 'brandName' : ?2, 'gifticonName' : ?3, 'gifticonExpiryDate' : ?4 }, 'updatedAt' : ?5 } }")
	void updateUserCorrectedForProduct(String id, String barcodeNumber, String brandName, String gifticonName,
		String expiryDate, LocalDateTime updatedAt);

}
