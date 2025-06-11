package com.eurachacha.achacha.web.present;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.eurachacha.achacha.application.port.input.present.PresentAppService;
import com.eurachacha.achacha.application.port.input.present.dto.response.ColorInfoResponseDto;
import com.eurachacha.achacha.application.port.input.present.dto.response.PresentCardResponseDto;
import com.eurachacha.achacha.application.port.input.present.dto.response.PresentTemplateDetailResponseDto;
import com.eurachacha.achacha.application.port.input.present.dto.response.TemplatesResponseDto;

import lombok.RequiredArgsConstructor;

@RequestMapping("/api/presents")
@RestController
@RequiredArgsConstructor
public class PresentController {

	private final PresentAppService presentAppService;

	@GetMapping("/templates")
	public ResponseEntity<List<TemplatesResponseDto>> getTemplates() {
		return ResponseEntity.ok(presentAppService.getTemplates());
	}

	@GetMapping("/templates/{templateId}")
	public ResponseEntity<PresentTemplateDetailResponseDto> getTemplateDetail(@PathVariable Integer templateId) {
		return ResponseEntity.ok(presentAppService.getTemplateDetail(templateId));
	}

	@GetMapping("/templates/{templateId}/colors")
	public ResponseEntity<List<ColorInfoResponseDto>> getColors(@PathVariable Integer templateId) {
		return ResponseEntity.ok(presentAppService.getColors(templateId));
	}

	@GetMapping("/cards/{presentCardCode}")
	public ResponseEntity<PresentCardResponseDto> getPresentCard(@PathVariable String presentCardCode) {
		return ResponseEntity.ok(presentAppService.getPresentCard(presentCardCode));
	}

}
