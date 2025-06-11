package com.eurachacha.achacha.application.port.input.present;

import java.util.List;

import com.eurachacha.achacha.application.port.input.present.dto.response.ColorInfoResponseDto;
import com.eurachacha.achacha.application.port.input.present.dto.response.PresentCardResponseDto;
import com.eurachacha.achacha.application.port.input.present.dto.response.PresentTemplateDetailResponseDto;
import com.eurachacha.achacha.application.port.input.present.dto.response.TemplatesResponseDto;

public interface PresentAppService {

	List<TemplatesResponseDto> getTemplates();

	List<ColorInfoResponseDto> getColors(Integer templateId);

	PresentTemplateDetailResponseDto getTemplateDetail(Integer templateId);

	PresentCardResponseDto getPresentCard(String presentCardCode);
}
