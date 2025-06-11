package com.eurachacha.achacha.application.port.input.gifticon.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@AllArgsConstructor
@NoArgsConstructor
public class AmountGifticonUseRequestDto {
	@NotNull(message = "사용금액은 필수입니다")
	@Positive(message = "사용금액은 1 이상이어야 합니다")
	private Integer usageAmount;
}
