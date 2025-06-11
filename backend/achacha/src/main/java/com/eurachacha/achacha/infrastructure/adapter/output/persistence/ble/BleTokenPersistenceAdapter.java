package com.eurachacha.achacha.infrastructure.adapter.output.persistence.ble;

import java.util.List;

import org.springframework.stereotype.Component;

import com.eurachacha.achacha.application.port.output.ble.BleTokenRepository;
import com.eurachacha.achacha.domain.model.ble.BleToken;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class BleTokenPersistenceAdapter implements BleTokenRepository {

	private final BleTokenJpaRepository bleTokenJpaRepository;

	@Override
	public void deleteByUserIdAndValue(Integer userId, String value) {
		bleTokenJpaRepository.deleteByUserIdAndValue(userId, value);
	}

	@Override
	public BleToken save(BleToken bleToken) {
		return bleTokenJpaRepository.save(bleToken);
	}

	@Override
	public boolean existsByValue(String value) {
		return bleTokenJpaRepository.existsByValue(value);
	}

	@Override
	public BleToken findByValue(String value) {
		return bleTokenJpaRepository.findByValue(value);
	}

	@Override
	public List<String> findValuesByValueIn(List<String> values) {
		return bleTokenJpaRepository.findValuesByValueIn(values);
	}
}
