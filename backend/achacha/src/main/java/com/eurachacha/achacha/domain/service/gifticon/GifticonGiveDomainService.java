package com.eurachacha.achacha.domain.service.gifticon;

public interface GifticonGiveDomainService {
	// 선물카드 코드 생성에 사용되는 허용 문자 집합을 반환합니다.
	String getAllowedCharacters();

	// 선물카드 코드의 길이를 반환합니다.
	int getRecommendedPresentCardCodeLength();
}
