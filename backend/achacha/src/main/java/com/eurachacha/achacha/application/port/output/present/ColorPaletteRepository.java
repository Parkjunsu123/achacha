package com.eurachacha.achacha.application.port.output.present;

import java.util.List;

import com.eurachacha.achacha.domain.model.present.ColorPalette;

public interface ColorPaletteRepository {

	List<ColorPalette> findByPresentTemplateId(Integer templateId);

	ColorPalette findByColorPaletteId(Integer colorPaletteId);
}
