package com.eurachacha.achacha.infrastructure.adapter.output.persistence.history;

import java.util.List;

import org.springframework.stereotype.Component;

import com.eurachacha.achacha.application.port.output.history.GifticonOwnerHistoryRepository;
import com.eurachacha.achacha.domain.model.history.GifticonOwnerHistory;
import com.eurachacha.achacha.domain.model.history.enums.TransferType;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class GifticonOwnerHistoryPersistenceAdapter implements GifticonOwnerHistoryRepository {

	private final GifticonOwnerHistoryJpaRepository gifticonOwnerHistoryJpaRepository;

	@Override
	public GifticonOwnerHistory getGifticonOwnerHistoryDetail(Integer userId, Integer gifticonId) {
		return gifticonOwnerHistoryJpaRepository.findOwnerHistoryDetailByUserIdAndGifticonId(userId, gifticonId);
	}

	@Override
	public GifticonOwnerHistory save(GifticonOwnerHistory gifticonOwnerHistory) {
		return gifticonOwnerHistoryJpaRepository.save(gifticonOwnerHistory);
	}

	@Override
	public List<GifticonOwnerHistory> findLatestForEachGifticonByIdsAndFromUserId(List<Integer> ids,
		Integer fromUserId) {
		return gifticonOwnerHistoryJpaRepository.findLatestForEachGifticonByIdsAndFromUserId(ids,
			fromUserId);
	}

	@Override
	public void deleteByGifticonIdAndTransferType(Integer gifticonId, TransferType transferType) {
		gifticonOwnerHistoryJpaRepository.deleteByGifticonIdAndTransferType(gifticonId, transferType);
	}
}
