package com.eurachacha.achacha.application.port.output.present;

import com.eurachacha.achacha.domain.model.present.PresentCard;

public interface PresentCardRepository {
	PresentCard save(PresentCard presentCard);

	boolean existsByPresentCardCode(String presentCardCode);

	PresentCard findByPresentCardCode(String presentCardCode);

	void deleteByGifticonId(Integer gifticonId);
}
