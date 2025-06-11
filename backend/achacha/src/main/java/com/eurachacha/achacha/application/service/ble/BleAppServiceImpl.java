package com.eurachacha.achacha.application.service.ble;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.eurachacha.achacha.application.port.input.ble.BleAppService;
import com.eurachacha.achacha.application.port.input.ble.dto.response.BleTokenResponseDto;
import com.eurachacha.achacha.application.port.output.auth.SecurityServicePort;
import com.eurachacha.achacha.application.port.output.ble.BleTokenRepository;
import com.eurachacha.achacha.domain.model.ble.BleToken;
import com.eurachacha.achacha.domain.model.user.User;
import com.eurachacha.achacha.domain.service.ble.BleTokenDomainService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class BleAppServiceImpl implements BleAppService {

	private final BleTokenRepository bleTokenRepository;
	private final BleTokenDomainService bleTokenDomainService;
	private final SecurityServicePort securityServicePort;

	@Override
	@Transactional
	public BleTokenResponseDto generateBleToken(String value) {
		log.info("BLE 토큰 생성 요청 시작 - 이전 토큰 값: {}", value);

		// 로그인 된 유저
		User loggedInUser = securityServicePort.getLoggedInUser();
		Integer userId = loggedInUser.getId();
		log.info("BLE 토큰 요청 유저 ID: {}", userId);

		// 이전 토큰이 있다면 삭제
		if (value != null && !value.isEmpty()) {
			log.info("이전 BLE 토큰 삭제 시도 - 유저 ID: {}, 토큰 값: {}", userId, value);
			bleTokenRepository.deleteByUserIdAndValue(userId, value);
			log.info("이전 BLE 토큰 삭제 완료");
		} else {
			log.info("이전 BLE 토큰 없음 - 새 토큰만 생성");
		}

		// 토큰 생성
		String newTokenValue = generateToken();
		log.info("새 BLE 토큰 생성 완료: {}", newTokenValue);

		// 새 토큰 저장
		BleToken bleToken = BleToken.builder()
			.user(loggedInUser)
			.value(newTokenValue)
			.build();

		BleToken savedToken = bleTokenRepository.save(bleToken);
		log.info("BLE 토큰 저장 완료 - ID: {}, 값: {}", savedToken.getId(), savedToken.getValue());

		return BleTokenResponseDto.builder()
			.bleToken(newTokenValue)
			.build();
	}

	private String generateToken() {
		// 중복되지 않는 새 토큰 생성
		String newTokenValue;
		boolean isDuplicate;
		int attempts = 0;

		log.info("BLE 토큰 생성 시작");
		do {
			// 최대 시도 횟수 초과 시 로그 기록
			if (attempts > 0) {
				log.warn("{}번 째 BLE 토큰 생성 시도 - 이전 시도 중복 발생", attempts + 1);
			}

			// 새 토큰 생성
			newTokenValue = bleTokenDomainService.generateToken();
			log.debug("생성된 토큰 후보: {}", newTokenValue);

			// 중복 검사
			isDuplicate = bleTokenRepository.existsByValue(newTokenValue);
			if (isDuplicate) {
				log.warn("생성된 BLE 토큰 중복 발견: {}", newTokenValue);
			}

			attempts++;
		} while (isDuplicate);

		log.info("최종 BLE 토큰 생성 완료 - 시도 횟수: {}", attempts);
		return newTokenValue;
	}
}