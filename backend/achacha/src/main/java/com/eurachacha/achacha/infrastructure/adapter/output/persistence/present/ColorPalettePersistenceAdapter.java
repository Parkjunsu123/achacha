package com.eurachacha.achacha.infrastructure.adapter.output.persistence.present;

import java.util.List;

import org.springframework.stereotype.Component;

import com.eurachacha.achacha.application.port.output.present.ColorPaletteRepository;
import com.eurachacha.achacha.domain.model.present.ColorPalette;
import com.eurachacha.achacha.web.common.exception.CustomException;
import com.eurachacha.achacha.web.common.exception.ErrorCode;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class ColorPalettePersistenceAdapter implements ColorPaletteRepository {

	private final ColorPaletteJpaRepository colorPaletteJpaRepository;

	@Override
	public List<ColorPalette> findByPresentTemplateId(Integer templateId) {
		return colorPaletteJpaRepository.findByPresentTemplateId(templateId);
	}

	@Override
	public ColorPalette findByColorPaletteId(Integer colorPaletteId) {
		return colorPaletteJpaRepository.findById(colorPaletteId)
			.orElseThrow(() -> new CustomException(ErrorCode.COLOR_PALETTE_NOT_FOUND));
	}
}
