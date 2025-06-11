package com.eurachacha.achacha.domain.service.sharebox;

import com.eurachacha.achacha.domain.model.sharebox.ShareBox;

public interface ShareBoxDomainService {
	// 쉐어박스가 참여를 허용하는지 검증합니다.
	void validateParticipationAllowed(ShareBox shareBox);

	// 쉐어박스의 참여자 수가 최대 허용 인원을 초과하는지 검증합니다.
	void validateParticipantCount(int currentParticipants);

	// 쉐어박스의 이름이 유효한지 검증합니다.
	void validateShareBoxName(String name);

	// 초대 코드 생성에 사용되는 허용 문자 집합을 반환합니다.
	String getAllowedCharacters();

	// 초대 코드의 길이를 반환합니다.
	int getRecommendedInviteCodeLength();

	// 쉐어박스 Owner 여부 확인
	boolean isShareBoxOwner(ShareBox shareBox, Integer userId);

	// 쉐어박스 Owner 검증
	void validateShareBoxOwner(ShareBox shareBox, Integer userId);
}
