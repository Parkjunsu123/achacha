package com.eurachacha.achacha.infrastructure.adapter.output.persistence.fcm;

import java.util.List;

import org.springframework.stereotype.Component;

import com.eurachacha.achacha.application.port.output.user.FcmTokenRepository;
import com.eurachacha.achacha.domain.model.fcm.FcmToken;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class FcmTokenPersistenceAdapter implements FcmTokenRepository {

	private final FcmTokenJpaRepository fcmTokenJpaRepository;

	@Override
	public List<FcmToken> findAllByUserId(Integer userId) {

		return fcmTokenJpaRepository.findAllByUser_Id(userId);
	}

	@Override
	public FcmToken save(FcmToken fcmToken) {
		return fcmTokenJpaRepository.save(fcmToken);
	}

	@Override
	public void deleteByUserIdAndValue(Integer userId, String value) {
		fcmTokenJpaRepository.deleteByUserIdAndValue(userId, value);
	}
}
