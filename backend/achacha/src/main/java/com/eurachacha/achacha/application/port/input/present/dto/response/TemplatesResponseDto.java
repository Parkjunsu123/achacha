package com.eurachacha.achacha.application.port.input.present.dto.response;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class TemplatesResponseDto {
	private Integer presentTemplateId;
	private String presentTemplateCategory;
	private String thumbnailPath;
}
