package com.eurachacha.achacha.infrastructure.adapter.output.persistence.present;

import org.springframework.stereotype.Component;

import com.eurachacha.achacha.application.port.output.present.PresentCardRepository;
import com.eurachacha.achacha.domain.model.present.PresentCard;
import com.eurachacha.achacha.web.common.exception.CustomException;
import com.eurachacha.achacha.web.common.exception.ErrorCode;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class PresentCardPersistenceAdapter implements PresentCardRepository {
	private final PresentCardJpaRepository presentCardJpaRepository;

	@Override
	public PresentCard save(PresentCard presentCard) {
		return presentCardJpaRepository.save(presentCard);
	}

	@Override
	public boolean existsByPresentCardCode(String presentCardCode) {
		return presentCardJpaRepository.existsByCode(presentCardCode);
	}

	@Override
	public PresentCard findByPresentCardCode(String presentCardCode) {
		return presentCardJpaRepository.findByCodeWithDetails(presentCardCode)
			.orElseThrow(() -> new CustomException(ErrorCode.PRESENT_CARD_NOT_FOUND));
	}

	@Override
	public void deleteByGifticonId(Integer gifticonId) {
		presentCardJpaRepository.deleteByGifticonId(gifticonId);
	}
}
