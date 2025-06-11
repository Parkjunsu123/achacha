package com.eurachacha.achacha.infrastructure.adapter.output.persistence.present;

import java.util.List;

import org.springframework.stereotype.Component;

import com.eurachacha.achacha.application.port.output.present.PresentTemplateRepository;
import com.eurachacha.achacha.domain.model.present.PresentTemplate;
import com.eurachacha.achacha.web.common.exception.CustomException;
import com.eurachacha.achacha.web.common.exception.ErrorCode;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class PresentTemplatePersistenceAdapter implements PresentTemplateRepository {

	private final PresentTemplateJpaRepository presentTemplateJpaRepository;

	@Override
	public PresentTemplate findById(Integer id) {
		return presentTemplateJpaRepository.findById(id)
			.orElseThrow(() -> new CustomException(ErrorCode.PRESENT_TEMPLATE_NOT_FOUND));
	}

	@Override
	public List<PresentTemplate> findAll() {
		return presentTemplateJpaRepository.findAll();
	}
}
