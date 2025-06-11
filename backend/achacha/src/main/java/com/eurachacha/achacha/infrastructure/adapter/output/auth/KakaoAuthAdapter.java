package com.eurachacha.achacha.infrastructure.adapter.output.auth;

import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import com.eurachacha.achacha.application.port.output.auth.AuthServicePort;
import com.eurachacha.achacha.application.port.output.auth.dto.response.KakaoApiResponse;
import com.eurachacha.achacha.application.port.output.auth.dto.response.KakaoUserInfoDto;
import com.eurachacha.achacha.web.common.exception.CustomException;
import com.eurachacha.achacha.web.common.exception.ErrorCode;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class KakaoAuthAdapter implements AuthServicePort {

	private final RestTemplate restTemplate;
	private static final String KAKAO_API_URL = "https://kapi.kakao.com";

	@Override
	public KakaoUserInfoDto validateKakaoToken(String kakaoAccessToken) {
		HttpHeaders headers = new HttpHeaders();
		headers.set("Authorization", "Bearer " + kakaoAccessToken);

		HttpEntity<String> entity = new HttpEntity<>(headers);

		try {
			ResponseEntity<KakaoApiResponse> response = restTemplate.exchange(
				KAKAO_API_URL + "/v2/user/me",
				HttpMethod.GET,
				entity,
				KakaoApiResponse.class
			);

			if (response.getBody() == null) {
				throw new CustomException(ErrorCode.KAKAO_API_ERROR);
			}

			KakaoApiResponse userResponse = response.getBody();

			// null 체크 추가
			if (userResponse.getKakao_account() == null ||
				userResponse.getKakao_account().getProfile() == null ||
				userResponse.getKakao_account().getProfile().getNickname() == null) {
				throw new CustomException(ErrorCode.KAKAO_API_ERROR);
			}

			return new KakaoUserInfoDto(
				String.valueOf(userResponse.getId()),
				userResponse.getKakao_account().getProfile().getNickname()
			);

		} catch (HttpClientErrorException e) {
			if (e.getStatusCode().is4xxClientError()) {
				throw new CustomException(ErrorCode.INVALID_ACCESS_TOKEN);
			}
			throw new CustomException(ErrorCode.KAKAO_API_ERROR);
		} catch (RestClientException e) {
			throw new CustomException(ErrorCode.KAKAO_API_ERROR);
		}
	}

}