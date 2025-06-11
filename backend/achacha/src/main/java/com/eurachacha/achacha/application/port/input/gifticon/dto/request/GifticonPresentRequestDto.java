package com.eurachacha.achacha.application.port.input.gifticon.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@AllArgsConstructor
@NoArgsConstructor
public class GifticonPresentRequestDto {
	@NotNull(message = "선물카드 템플릿 선택은 필수입니다.")
	private Integer presentTemplateId;

	private Integer colorPaletteId;

	@NotNull(message = "메시지 입력은 필수입니다.")
	@Size(max = 100, message = "메시지는 100자 이내로 입력해주세요.")
	private String message;
}