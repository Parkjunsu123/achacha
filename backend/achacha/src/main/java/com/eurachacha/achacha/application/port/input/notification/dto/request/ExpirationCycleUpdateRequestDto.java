package com.eurachacha.achacha.application.port.input.notification.dto.request;

import com.eurachacha.achacha.domain.model.notification.enums.ExpirationCycle;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@AllArgsConstructor
@NoArgsConstructor
public class ExpirationCycleUpdateRequestDto {

	private ExpirationCycle expirationCycle;
}
