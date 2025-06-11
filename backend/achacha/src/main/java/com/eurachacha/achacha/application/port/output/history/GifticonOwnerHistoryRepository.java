package com.eurachacha.achacha.application.port.output.history;

import java.util.List;

import com.eurachacha.achacha.domain.model.history.GifticonOwnerHistory;
import com.eurachacha.achacha.domain.model.history.enums.TransferType;

public interface GifticonOwnerHistoryRepository {
	GifticonOwnerHistory getGifticonOwnerHistoryDetail(Integer userId, Integer gifticonId);

	GifticonOwnerHistory save(GifticonOwnerHistory gifticonOwnerHistory);

	List<GifticonOwnerHistory> findLatestForEachGifticonByIdsAndFromUserId(List<Integer> ids,
		Integer fromUserId);

	void deleteByGifticonIdAndTransferType(Integer gifticonId, TransferType transferType);
}
