package com.eurachacha.achacha.application.port.output.ble;

import java.util.List;

import com.eurachacha.achacha.domain.model.ble.BleToken;

public interface BleTokenRepository {
	void deleteByUserIdAndValue(Integer userId, String value);

	BleToken save(BleToken bleToken);

	boolean existsByValue(String value);

	BleToken findByValue(String value);

	List<String> findValuesByValueIn(List<String> values);
}
