package com.eurachacha.achacha.application.port.input.present.dto.response;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonInclude;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class PresentTemplateDetailResponseDto {
	private Integer presentTemplateId;
	private String presentTemplateCategory;

	// 일반 템플릿용 필드 - GENERAL이 아닌 경우에만 값이 채워짐
	@JsonInclude(JsonInclude.Include.NON_NULL)
	private String cardImagePath;

	// GENERAL 템플릿용 필드 - GENERAL인 경우에만 값이 채워짐
	@JsonInclude(JsonInclude.Include.NON_NULL)
	private List<ColorCardInfoDto> colorCards;
}
