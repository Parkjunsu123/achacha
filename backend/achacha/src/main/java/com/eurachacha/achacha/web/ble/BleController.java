package com.eurachacha.achacha.web.ble;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.eurachacha.achacha.application.port.input.ble.BleAppService;
import com.eurachacha.achacha.application.port.input.ble.dto.request.BleTokenRequestDto;
import com.eurachacha.achacha.application.port.input.ble.dto.response.BleTokenResponseDto;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/ble")
@RequiredArgsConstructor
public class BleController {

	private final BleAppService bleAppService;

	@PostMapping
	public ResponseEntity<BleTokenResponseDto> generateBleToken(@RequestBody BleTokenRequestDto request) {
		return ResponseEntity.ok(bleAppService.generateBleToken(request.getBleTokenValue()));
	}
}
