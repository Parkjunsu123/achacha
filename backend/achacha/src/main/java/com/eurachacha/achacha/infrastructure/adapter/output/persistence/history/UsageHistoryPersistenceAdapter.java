package com.eurachacha.achacha.infrastructure.adapter.output.persistence.history;

import java.util.List;

import org.springframework.stereotype.Component;

import com.eurachacha.achacha.application.port.output.history.UsageHistoryRepository;
import com.eurachacha.achacha.domain.model.history.UsageHistory;
import com.eurachacha.achacha.web.common.exception.CustomException;
import com.eurachacha.achacha.web.common.exception.ErrorCode;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class UsageHistoryPersistenceAdapter implements UsageHistoryRepository {

	private final UsageHistoryJpaRepository usageHistoryJpaRepository;

	@Override
	public UsageHistory saveUsageHistory(UsageHistory usageHistory) {
		return usageHistoryJpaRepository.save(usageHistory);
	}

	@Override
	public UsageHistory findLatestByUserIdAndGifticonId(Integer userId, Integer gifticonId) {
		return usageHistoryJpaRepository.findLatestByUserIdAndGifticonId(userId, gifticonId);
	}

	@Override
	public List<UsageHistory> findAllByGifticonIdOrderByCreatedAtDesc(Integer gifticonId) {
		return usageHistoryJpaRepository.findAllByGifticonIdOrderByCreatedAtDesc(gifticonId);
	}

	@Override
	public UsageHistory findByIdAndGifticonIdAndUserId(Integer usageHistoryId, Integer gifticonId, Integer userId) {
		return usageHistoryJpaRepository.findByIdAndGifticonIdAndUserId(usageHistoryId, gifticonId, userId)
			.orElseThrow(() -> new CustomException(ErrorCode.GIFTICON_NO_USAGE_HISTORY));
	}

	@Override
	public void delete(UsageHistory usageHistory) {
		usageHistoryJpaRepository.delete(usageHistory);
	}

	@Override
	public List<UsageHistory> findLatestForEachGifticonByIdsAndUserId(List<Integer> ids, Integer userId) {
		return usageHistoryJpaRepository.findLatestForEachGifticonByIdsAndUserId(ids, userId);
	}
}
