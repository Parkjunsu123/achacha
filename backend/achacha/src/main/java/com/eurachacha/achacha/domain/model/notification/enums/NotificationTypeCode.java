package com.eurachacha.achacha.domain.model.notification.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * 알림 타입 코드를 정의하는 열거형 클래스
 */
@Getter
@AllArgsConstructor
public enum NotificationTypeCode {
	LOCATION_BASED("주변 매장 알림"),
	EXPIRY_DATE("유효기간 만료 알림"),
	RECEIVE_GIFTICON("기프티콘 뿌리기 수신"),
	USAGE_COMPLETE("사용완료 여부 알림"),
	SHAREBOX_GIFTICON("쉐어박스 기프티콘 등록"),
	SHAREBOX_USAGE_COMPLETE("쉐어박스 기프티콘 사용"),
	SHAREBOX_MEMBER_JOIN("쉐어박스 멤버 참여"),
	SHAREBOX_DELETED("쉐어박스 그룹 삭제");

	private final String displayName;

}
