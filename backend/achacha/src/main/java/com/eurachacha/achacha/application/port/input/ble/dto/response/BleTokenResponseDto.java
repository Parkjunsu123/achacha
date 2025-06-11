package com.eurachacha.achacha.application.port.input.ble.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class BleTokenResponseDto {
	private String bleToken;
}
