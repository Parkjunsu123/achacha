package com.eurachacha.achacha.application.port.input.ble;

import com.eurachacha.achacha.application.port.input.ble.dto.response.BleTokenResponseDto;

public interface BleAppService {
	BleTokenResponseDto generateBleToken(String value);
}
