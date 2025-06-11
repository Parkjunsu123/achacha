package com.eurachacha.achacha.web.common.exception;

import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.HttpMediaTypeNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import jakarta.servlet.http.HttpServletRequest;

@RestControllerAdvice
public class GlobalExceptionHandler {

	private static final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);

	/**
	 * 커스텀 예외 처리
	 */
	@ExceptionHandler(CustomException.class)
	public ResponseEntity<ErrorResponse> handleCustomException(CustomException ex, HttpServletRequest request) {
		ErrorCode errorCode = ex.getErrorCode();

		return ResponseEntity.status(errorCode.getStatus())
			.body(ErrorResponse.of(errorCode));
	}

	/**
	 * 유효성 검증 실패 예외 (MethodArgumentNotValidException 등), Request 시 인자 검증
	 * */
	@ExceptionHandler(MethodArgumentNotValidException.class)
	public ResponseEntity<ErrorResponse> handleMethodArgumentNotValidException(
		MethodArgumentNotValidException ex
	) {
		// FieldError를 전부 모아서, 각각 "필드명: 에러메시지" 형태로 변환한 뒤
		// 쉼표(혹은 세미콜론 등)로 구분하여 하나의 문자열로 합칩니다.
		String errorMessage = ex.getBindingResult().getFieldErrors().stream()
			.map(fieldError -> String.format("[%s] %s",
				fieldError.getField(),
				fieldError.getDefaultMessage()))
			.collect(Collectors.joining("; "));

		logger.error("유효성 검증 실패: {}", errorMessage, ex);

		// ErrorCode를 고정으로 사용
		return ResponseEntity.status(HttpStatus.BAD_REQUEST)
			.body(ErrorResponse.of(ErrorCode.INVALID_PARAMETER, errorMessage));
	}

	/**
	 * 유효성 검증 실패 예외 (MethodArgumentNotValidException 등), Request 시 인자 검증
	 * */
	@ExceptionHandler(HttpMediaTypeNotSupportedException.class)
	public ResponseEntity<ErrorResponse> handleHttpMediaTypeNotSupportedException(
		HttpMediaTypeNotSupportedException ex
	) {
		String errorMessage = String.format("지원하지 않는 미디어 타입입니다: %s", ex.getContentType());

		logger.error("미디어 타입 오류: {}", errorMessage, ex);

		return ResponseEntity.status(HttpStatus.UNSUPPORTED_MEDIA_TYPE)
			.body(ErrorResponse.of(ErrorCode.UNSUPPORTED_MEDIA_TYPE, errorMessage));
	}

	@ExceptionHandler(Exception.class)
	public ResponseEntity<ErrorResponse> handleException(Exception ex, HttpServletRequest request) {
		logger.error("서버 내부 오류 발생: URI={}, 오류={}", request.getRequestURI(), ex.getMessage(), ex);

		return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
			.body(ErrorResponse.of(ErrorCode.INTERNAL_SERVER_ERROR));
	}
}

