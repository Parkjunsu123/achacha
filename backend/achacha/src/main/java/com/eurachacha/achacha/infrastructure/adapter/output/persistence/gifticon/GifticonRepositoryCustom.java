package com.eurachacha.achacha.infrastructure.adapter.output.persistence.gifticon;

import java.util.List;
import java.util.Map;

import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;

import com.eurachacha.achacha.domain.model.gifticon.Gifticon;
import com.eurachacha.achacha.domain.model.gifticon.enums.GifticonScopeType;
import com.eurachacha.achacha.domain.model.gifticon.enums.GifticonType;

public interface GifticonRepositoryCustom {

	Slice<Gifticon> findAvailableGifticons(
		Integer userId,
		GifticonScopeType scope,
		GifticonType type,
		Pageable pageable
	);

	Slice<Gifticon> findUsedGifticons(
		Integer userId,
		GifticonType type,
		Pageable pageable);

	// 쉐어박스 내 사용가능 기프티콘 조회
	Slice<Gifticon> findGifticonsByShareBoxId(
		Integer shareBoxId,
		GifticonType type,
		Pageable pageable);

	// 쉐어박스 내 사용완료 기프티콘 조회
	Slice<Gifticon> findUsedGifticonsByShareBoxId(
		Integer shareBoxId,
		GifticonType type,
		Pageable pageable
	);

	Map<Integer, Long> countGifticonsByShareBoxIds(List<Integer> shareBoxIds);
}
