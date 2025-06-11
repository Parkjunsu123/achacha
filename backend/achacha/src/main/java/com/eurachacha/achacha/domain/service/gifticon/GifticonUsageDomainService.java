package com.eurachacha.achacha.domain.service.gifticon;

import com.eurachacha.achacha.domain.model.gifticon.Gifticon;
import com.eurachacha.achacha.domain.model.history.UsageHistory;

public interface GifticonUsageDomainService {

	int calculateGifticonBalance(Integer newAmount, UsageHistory findUsageHistory,
		Gifticon findGifticon);
	
	void validateSufficientBalance(int remainingAmount, int requiredAmount);

}
