package com.eurachacha.achacha.application.port.output.auth.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class KakaoApiResponse {
	private Long id;
	private KakaoAccount kakao_account;

	@Getter
	@AllArgsConstructor
	public static class KakaoAccount {
		private Profile profile;
	}

	@Getter
	@AllArgsConstructor
	public static class Profile {
		private String nickname;
	}
}
