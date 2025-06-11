package com.eurachacha.achacha.application.port.output.gifticon;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;

import com.eurachacha.achacha.domain.model.gifticon.Gifticon;
import com.eurachacha.achacha.domain.model.gifticon.enums.GifticonScopeType;
import com.eurachacha.achacha.domain.model.gifticon.enums.GifticonType;

public interface GifticonRepository {
	Gifticon save(Gifticon gifticon);

	Slice<Gifticon> findAvailableGifticons(Integer userId, GifticonScopeType scope,
		GifticonType type, Pageable pageable);

	Gifticon getGifticonDetail(Integer gifticonId);

	boolean existsByBarcode(String barcode);

	Slice<Gifticon> getUsedGifticons(Integer userId, GifticonType type, Pageable pageable);

	Gifticon findById(Integer gifticonId);

	// ShareBox의 기프티콘 갯수 조회
	Map<Integer, Long> countGifticonsByShareBoxIds(List<Integer> shareBoxIds);

	void unshareAllGifticonsByShareBoxId(Integer shareBoxId);

	void unshareAllAvailableGifticonsByUserIdAndShareBoxId(Integer userId, Integer shareBoxId);

	Slice<Gifticon> findGifticonsByShareBoxId(Integer shareBoxId, GifticonType type, Pageable pageable);

	Slice<Gifticon> findUsedGifticonsByShareBoxId(Integer shareBoxId, GifticonType type, Pageable pageable);

	// 만료 기간별 기프티콘 목록 조회
	List<Gifticon> findGifticonsWithExpiryDates(List<LocalDate> expiryDates);

	List<Gifticon> findAllRelevantGifticonsWithExpiryDates(List<LocalDate> expiryDates, Integer userId);
}
