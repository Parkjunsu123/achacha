package com.eurachacha.achacha.infrastructure.adapter.output.persistence.gifticon;

import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.Map;

import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.stereotype.Component;

import com.eurachacha.achacha.application.port.output.gifticon.GifticonRepository;
import com.eurachacha.achacha.domain.model.gifticon.Gifticon;
import com.eurachacha.achacha.domain.model.gifticon.enums.GifticonScopeType;
import com.eurachacha.achacha.domain.model.gifticon.enums.GifticonType;
import com.eurachacha.achacha.web.common.exception.CustomException;
import com.eurachacha.achacha.web.common.exception.ErrorCode;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class GifticonPersistenceAdapter implements GifticonRepository {

	private final GifticonJpaRepository gifticonJpaRepository;

	@Override
	public Gifticon save(Gifticon gifticon) {
		return gifticonJpaRepository.save(gifticon);
	}

	@Override
	public Slice<Gifticon> findAvailableGifticons(Integer userId, GifticonScopeType scope, GifticonType type,
		Pageable pageable) {
		return gifticonJpaRepository.findAvailableGifticons(userId, scope, type, pageable);
	}

	@Override
	public Gifticon getGifticonDetail(Integer gifticonId) {
		return gifticonJpaRepository.findGifticonDetailById(gifticonId)
			.orElseThrow(() -> new CustomException(ErrorCode.GIFTICON_NOT_FOUND));
	}

	@Override
	public boolean existsByBarcode(String barcode) {
		return gifticonJpaRepository.existsByBarcode(barcode);
	}

	@Override
	public Slice<Gifticon> getUsedGifticons(Integer userId, GifticonType type, Pageable pageable) {
		return gifticonJpaRepository.findUsedGifticons(userId, type, pageable);
	}

	@Override
	public Gifticon findById(Integer gifticonId) {
		return gifticonJpaRepository.findById(gifticonId)
			.orElseThrow(() -> new CustomException(ErrorCode.GIFTICON_NOT_FOUND));
	}

	@Override
	public Map<Integer, Long> countGifticonsByShareBoxIds(List<Integer> shareBoxIds) {
		if (shareBoxIds.isEmpty()) {
			return Collections.emptyMap();
		}

		return gifticonJpaRepository.countGifticonsByShareBoxIds(shareBoxIds);
	}

	@Override
	public void unshareAllGifticonsByShareBoxId(Integer shareBoxId) {
		gifticonJpaRepository.unshareAllGifticonsByShareBoxId(shareBoxId);
	}

	@Override
	public void unshareAllAvailableGifticonsByUserIdAndShareBoxId(Integer userId, Integer shareBoxId) {
		gifticonJpaRepository.unshareAllAvailableGifticonsByUserIdAndShareBoxId(userId, shareBoxId);
	}

	@Override
	public Slice<Gifticon> findGifticonsByShareBoxId(Integer shareBoxId, GifticonType type, Pageable pageable) {
		return gifticonJpaRepository.findGifticonsByShareBoxId(shareBoxId, type, pageable);
	}

	@Override
	public Slice<Gifticon> findUsedGifticonsByShareBoxId(Integer shareBoxId, GifticonType type, Pageable pageable) {
		return gifticonJpaRepository.findUsedGifticonsByShareBoxId(shareBoxId, type, pageable);
	}

	@Override
	public List<Gifticon> findGifticonsWithExpiryDates(List<LocalDate> expiryDates) {
		return gifticonJpaRepository.findGifticonsWithExpiryDates(expiryDates);
	}

	@Override
	public List<Gifticon> findAllRelevantGifticonsWithExpiryDates(List<LocalDate> expiryDates, Integer userId) {
		return gifticonJpaRepository.findAllRelevantGifticonsWithExpiryDates(expiryDates, userId);
	}
}
