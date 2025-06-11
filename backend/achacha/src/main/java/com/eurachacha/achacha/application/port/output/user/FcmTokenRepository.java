package com.eurachacha.achacha.application.port.output.user;

import java.util.List;

import com.eurachacha.achacha.domain.model.fcm.FcmToken;

public interface FcmTokenRepository {

	List<FcmToken> findAllByUserId(Integer userId);

	FcmToken save(FcmToken fcmToken);

	void deleteByUserIdAndValue(Integer userId, String value);
}
