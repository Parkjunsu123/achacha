package com.eurachacha.achacha.application.service.gifticon;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.eurachacha.achacha.infrastructure.adapter.output.persistence.gifticon.GifticonJpaRepository;
import com.eurachacha.achacha.infrastructure.util.EncryptionUtil;

import jakarta.persistence.EntityManager;
import jakarta.persistence.Query;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class GifticonMigrationService {

	private final GifticonJpaRepository gifticonRepository;
	private final EncryptionUtil encryptionUtil;
	private final EntityManager entityManager;

	@Transactional
	public void migrateExistingBarcodes() {
		try {
			log.info("바코드 암호화 마이그레이션 시작");

			// 실제 테이블 이름 확인
			List<Object[]> results = entityManager
				.createNativeQuery(
					"SELECT id, barcode FROM gifticon WHERE barcode IS NOT NULL")
				.getResultList();

			log.info("암호화 대상 바코드 수: {}", results.size());

			int successCount = 0;
			for (Object[] result : results) {
				try {
					Integer id = ((Number)result[0]).intValue();
					String plainBarcode = (String)result[1];

					if (plainBarcode != null && !plainBarcode.isEmpty()) {
						Query query = entityManager.createNativeQuery(
							"UPDATE gifticon SET barcode = ?1 WHERE id = ?2");

						query.setParameter(1, encryptionUtil.encrypt(plainBarcode));
						query.setParameter(2, id);

						int updated = query.executeUpdate();

						if (updated > 0) {
							successCount++;
						}
					}
				} catch (Exception e) {
					log.error("ID {} 바코드 암호화 실패: {}", result[0], e.getMessage(), e);
				}
			}

			log.info("바코드 암호화 완료. 성공: {}/{}", successCount, results.size());

			entityManager.flush();
			entityManager.clear();
		} catch (Exception e) {
			log.error("바코드 마이그레이션 과정 중 오류 발생", e);
			throw new RuntimeException("바코드 암호화 마이그레이션 실패", e);
		}
	}

	// /**
	//  * 테스트 기프티콘 저장 - JPA 저장 (자동 암호화)
	//  */
	// @Transactional
	// public Gifticon saveGifticon(String name, String barcode) {
	// 	try {
	// 		// 기프티콘 생성
	// 		Gifticon gifticon = Gifticon.builder()
	// 			.name(name)
	// 			.barcode(barcode)  // 자동으로 암호화됨
	// 			.type(GifticonType.PRODUCT)
	// 			.expiryDate(LocalDate.now().plusMonths(3))
	// 			.isUsed(false)
	// 			.isDeleted(false)
	// 			.build();
	//
	// 		// 저장
	// 		Gifticon savedGifticon = gifticonRepository.save(gifticon);
	//
	// 		// 저장된 엔티티의 ID와 암호화된 바코드 값 로깅
	// 		log.info("기프티콘 저장 성공: ID={}, 이름={}, 원본바코드={}",
	// 			savedGifticon.getId(), name, barcode);
	//
	// 		return savedGifticon;
	//
	// 	} catch (Exception e) {
	// 		log.error("기프티콘 저장 실패: {}", e.getMessage(), e);
	// 		throw new RuntimeException("기프티콘 저장 실패", e);
	// 	}
	// }
	//
	// /**
	//  * 저장된 기프티콘 조회 - JPA 조회 (자동 복호화)
	//  */
	// @Transactional(readOnly = true)
	// public Map<String, Object> getGifticon(Integer id) {
	// 	Map<String, Object> result = new HashMap<>();
	//
	// 	try {
	// 		// JPA로 기프티콘 조회 (자동 복호화)
	// 		Gifticon gifticon = gifticonRepository.findById(id)
	// 			.orElseThrow(() -> new RuntimeException("기프티콘을 찾을 수 없습니다: " + id));
	//
	// 		result.put("id", gifticon.getId());
	// 		result.put("name", gifticon.getName());
	// 		result.put("decryptedBarcode", gifticon.getBarcode());  // 자동 복호화된 바코드
	//
	// 		// 네이티브 쿼리로 실제 DB 값 조회 (암호화된 상태)
	//
	// 		log.info("기프티콘 조회 성공: ID={}, 이름={}, 복호화바코드={}",
	// 			gifticon.getId(), gifticon.getName(), gifticon.getBarcode());
	//
	// 	} catch (Exception e) {
	// 		log.error("기프티콘 조회 실패: {}", e.getMessage(), e);
	// 		result.put("error", e.getMessage());
	// 	}
	//
	// 	return result;
	// }
}