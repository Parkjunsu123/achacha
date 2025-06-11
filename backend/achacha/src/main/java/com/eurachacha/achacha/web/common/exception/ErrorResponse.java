package com.eurachacha.achacha.web.common.exception;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ErrorResponse {
	private String errorCode;

	private String message;

	public static ErrorResponse of(ErrorCode errorCode, String message) {
		return ErrorResponse.builder()
			.errorCode(errorCode.getCode())
			.message(message)
			.build();
	}

	public static ErrorResponse of(ErrorCode errorCode) {
		return ErrorResponse.builder()
			.errorCode(errorCode.getCode())
			.message(errorCode.getDefaultMessage())
			.build();
	}
}

