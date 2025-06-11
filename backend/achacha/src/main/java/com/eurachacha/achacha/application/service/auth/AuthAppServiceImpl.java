package com.eurachacha.achacha.application.service.auth;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import com.eurachacha.achacha.application.port.input.auth.AuthAppService;
import com.eurachacha.achacha.application.port.input.auth.AuthenticationUseCase;
import com.eurachacha.achacha.application.port.input.auth.dto.request.KakaoLoginRequestDto;
import com.eurachacha.achacha.application.port.input.auth.dto.request.RefreshTokenRequestDto;
import com.eurachacha.achacha.application.port.input.auth.dto.response.TokenResponseDto;
import com.eurachacha.achacha.application.port.output.auth.AuthServicePort;
import com.eurachacha.achacha.application.port.output.auth.TokenServicePort;
import com.eurachacha.achacha.application.port.output.auth.dto.response.KakaoUserInfoDto;
import com.eurachacha.achacha.application.port.output.ble.BleTokenRepository;
import com.eurachacha.achacha.application.port.output.notification.NotificationSettingRepository;
import com.eurachacha.achacha.application.port.output.notification.NotificationTypeRepository;
import com.eurachacha.achacha.application.port.output.user.FcmTokenRepository;
import com.eurachacha.achacha.application.port.output.user.RefreshTokenRepository;
import com.eurachacha.achacha.application.port.output.user.UserRepository;
import com.eurachacha.achacha.domain.model.fcm.FcmToken;
import com.eurachacha.achacha.domain.model.notification.NotificationSetting;
import com.eurachacha.achacha.domain.model.notification.NotificationType;
import com.eurachacha.achacha.domain.model.notification.enums.ExpirationCycle;
import com.eurachacha.achacha.domain.model.notification.enums.NotificationTypeCode;
import com.eurachacha.achacha.domain.model.user.RefreshToken;
import com.eurachacha.achacha.domain.model.user.User;
import com.eurachacha.achacha.web.common.exception.CustomException;
import com.eurachacha.achacha.web.common.exception.ErrorCode;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AuthAppServiceImpl implements AuthAppService, AuthenticationUseCase {
	private final UserRepository userRepository;
	private final RefreshTokenRepository refreshTokenRepository;
	private final FcmTokenRepository fcmTokenRepository;
	private final BleTokenRepository bleTokenRepository;
	private final NotificationTypeRepository notificationTypeRepository;
	private final NotificationSettingRepository notificationSettingRepository;
	private final AuthServicePort authServicePort;
	private final TokenServicePort tokenServicePort;

	// 카카오 제공자 상수
	private static final String KAKAO_PROVIDER = "KAKAO";

	@Override
	@Transactional
	public TokenResponseDto loginWithKakao(KakaoLoginRequestDto requestDto) {
		// 카카오 액세스 토큰으로 사용자 정보 조회
		KakaoUserInfoDto kakaoUserInfo = authServicePort.validateKakaoToken(requestDto.getKakaoAccessToken());

		if (kakaoUserInfo == null) {
			throw new CustomException(ErrorCode.INVALID_ACCESS_TOKEN);
		}

		log.debug("카카오 사용자 정보 조회 성공: id={}, nickname={}", kakaoUserInfo.getId(), kakaoUserInfo.getNickname());

		// 카카오 ID로 사용자 조회 또는 생성
		User user = userRepository.findByProviderAndProviderUserId(KAKAO_PROVIDER, kakaoUserInfo.getId())
			.orElseGet(() -> {
				log.info("신규 카카오 사용자 생성: id={}", kakaoUserInfo.getId());
				User newUser = createKakaoUser(kakaoUserInfo);
				// 사용자에 대한 알림 설정 초기화 호출
				initializeNotificationSettings(newUser);
				return newUser;
			});

		// 닉네임이 변경되었으면 업데이트
		if (!user.getName().equals(kakaoUserInfo.getNickname())) {
			log.info("사용자 닉네임 업데이트: userId={}, 이전={}, 이후={}",
				user.getId(), user.getName(), kakaoUserInfo.getNickname());
			user.updateName(kakaoUserInfo.getNickname());
		}

		// FCM 토큰 저장
		if (StringUtils.hasText(requestDto.getFcmToken())) {
			log.debug("FCM 토큰 저장: userId={}", user.getId());
			saveFcmToken(user, requestDto.getFcmToken());
		}

		// JWT 토큰 발급
		String accessToken = tokenServicePort.createAccessToken(user.getId());
		String refreshToken = tokenServicePort.createRefreshToken(user.getId());
		log.debug("JWT 토큰 발급 완료: userId={}", user.getId());

		// 리프레시 토큰 저장
		saveRefreshToken(user, refreshToken);

		return new TokenResponseDto(accessToken, refreshToken);
	}

	@Override
	@Transactional
	public TokenResponseDto refreshToken(RefreshTokenRequestDto requestDto) {
		// 리프레시 토큰 검증 및 새 액세스 토큰 발급
		Integer userId = tokenServicePort.validateRefreshTokenAndGetUserId(requestDto.getRefreshToken());

		// 사용자가 존재하는지 확인
		User user = userRepository.findById(userId);

		// 사용자의 리프레시 토큰 조회
		RefreshToken refreshToken = refreshTokenRepository.findByUserIdAndValue(userId, requestDto.getRefreshToken());

		String newAccessToken = tokenServicePort.createAccessToken(userId);

		return new TokenResponseDto(newAccessToken, refreshToken.getValue());
	}

	private User createKakaoUser(KakaoUserInfoDto kakaoUserInfo) {
		User newUser = User.builder()
			.provider(KAKAO_PROVIDER)
			.providerUserId(kakaoUserInfo.getId())
			.name(kakaoUserInfo.getNickname())
			.isDeleted(false)
			.build();

		return userRepository.save(newUser);
	}

	// RefreshToken 저장 메서드
	private void saveRefreshToken(User user, String tokenValue) {
		RefreshToken refreshToken = RefreshToken.builder()
			.user(user)
			.value(tokenValue)
			.build();
		refreshTokenRepository.save(refreshToken);
	}

	// FCM 토큰 저장 메서드
	private void saveFcmToken(User user, String tokenValue) {
		FcmToken fcmToken = FcmToken.builder()
			.user(user)
			.value(tokenValue)
			.build();
		fcmTokenRepository.save(fcmToken);
	}

	/**
	 * 신규 사용자에 대한 알림 설정을 초기화합니다.
	 * 모든 알림 타입에 대해 기본값으로 isEnabled = false로 설정합니다.
	 * EXPIRY_DATE 타입의 경우 expirationCycle을 ONE_WEEK으로 설정합니다.
	 *
	 * @param user 신규 생성된 사용자
	 */
	private void initializeNotificationSettings(User user) {
		log.info("사용자 알림 설정 초기화 시작: userId={}", user.getId());

		// 모든 알림 타입 조회
		List<NotificationType> notificationTypes = notificationTypeRepository.findAll();

		if (notificationTypes.isEmpty()) {
			log.warn("알림 타입이 존재하지 않습니다. 알림 설정을 초기화할 수 없습니다.");
			return;
		}

		// 사용자별 알림 설정 생성
		List<NotificationSetting> settings = createUserNotificationSettings(user, notificationTypes);

		// 알림 설정 저장
		notificationSettingRepository.saveAll(settings);

		log.info("사용자 알림 설정 초기화 완료: userId={}, 생성된 설정 수={}", user.getId(), settings.size());
	}

	/**
	 * 사용자별 알림 설정 목록을 생성합니다.
	 */
	private List<NotificationSetting> createUserNotificationSettings(User user,
		List<NotificationType> notificationTypes) {
		return notificationTypes.stream()
			.map(notificationType -> NotificationSetting.builder()
				.user(user)
				.notificationType(notificationType)
				.isEnabled(true)
				.expirationCycle(determineExpirationCycle(notificationType))
				.build())
			.collect(Collectors.toList());
	}

	/**
	 * 알림 타입에 따른 만료 주기를 결정합니다.
	 * EXPIRY_DATE 타입의 경우 ONE_WEEK으로, 그 외에는 null로 설정합니다.
	 */
	private ExpirationCycle determineExpirationCycle(NotificationType notificationType) {
		return notificationType.getCode() == NotificationTypeCode.EXPIRY_DATE
			? ExpirationCycle.ONE_WEEK
			: null;
	}

	@Override
	public Integer validateAccessToken(String token) {
		return tokenServicePort.validateAccessTokenAndGetUserId(token);
	}

	@Override
	public UserDetails createUserDetails(Integer userId) {
		// Spring Security의 UserDetails 객체 생성
		return new org.springframework.security.core.userdetails.User(
			userId.toString(), "", new ArrayList<>());
	}

	@Override
	@Transactional
	public void logout(Integer userId, String refreshToken, String fcmToken, String bleToken) {
		log.info("사용자 로그아웃 처리 시작: userId={}", userId);
		// refreshToken 처리
		if (StringUtils.hasText(refreshToken) && userId != null) {
			refreshTokenRepository.deleteByUserIdAndValue(userId, refreshToken);
		}

		// fcmToken 처리
		if (StringUtils.hasText(fcmToken) && userId != null) {
			fcmTokenRepository.deleteByUserIdAndValue(userId, fcmToken);
		}

		// bleToken 처리
		if (StringUtils.hasText(bleToken) && userId != null) {
			bleTokenRepository.deleteByUserIdAndValue(userId, bleToken);
		}

		log.info("사용자 로그아웃 처리 완료");
	}
}