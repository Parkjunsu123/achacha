package com.eurachacha.achacha.domain.model.notification.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * 알림 설정의 만료 주기를 정의하는 열거형 클래스
 */
@Getter
@AllArgsConstructor
public enum ExpirationCycle {
	ONE_DAY(1),
	TWO_DAYS(2),
	THREE_DAYS(3),
	ONE_WEEK(7),
	ONE_MONTH(30),
	TWO_MONTHS(60),
	THREE_MONTHS(90);

	private final int days;
}