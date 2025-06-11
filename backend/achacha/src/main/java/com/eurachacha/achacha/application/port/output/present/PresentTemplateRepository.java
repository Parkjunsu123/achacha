package com.eurachacha.achacha.application.port.output.present;

import java.util.List;

import com.eurachacha.achacha.domain.model.present.PresentTemplate;

public interface PresentTemplateRepository {

	PresentTemplate findById(Integer id);

	List<PresentTemplate> findAll();
}
