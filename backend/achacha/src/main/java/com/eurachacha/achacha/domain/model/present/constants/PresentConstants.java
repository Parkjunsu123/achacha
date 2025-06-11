package com.eurachacha.achacha.domain.model.present.constants;

import com.eurachacha.achacha.web.common.exception.CustomException;
import com.eurachacha.achacha.web.common.exception.ErrorCode;

/**
 * 선물 관련 상수 정의
 */
public class PresentConstants {

	// 선물 공유 URL 만료 시간 (24시간)
	public static final long SHARE_URL_EXPIRATION = 86400000L;

	// 인스턴스화 방지
	private PresentConstants() {
		throw new CustomException(ErrorCode.CONSTANT_CLASS_INSTANTIATION);
	}
}
