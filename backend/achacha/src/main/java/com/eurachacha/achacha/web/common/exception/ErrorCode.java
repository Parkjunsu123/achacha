package com.eurachacha.achacha.web.common.exception;

import org.springframework.http.HttpStatus;

import lombok.Getter;

@Getter
public enum ErrorCode {
	EXAMPLE_NOT_FOUND(HttpStatus.NOT_FOUND, "X001", "예제 에러 코드입니다"),
	INVALID_PARAMETER(HttpStatus.BAD_REQUEST, "X002", "잘못된 파라미터가 전달되었습니다."),
	INTERNAL_SERVER_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "X003", "서버 에러가 발생했습니다."),
	CONSTANT_CLASS_INSTANTIATION(HttpStatus.INTERNAL_SERVER_ERROR, "X004", "상수 클래스는 인스턴스화할 수 없습니다."),
	UNSUPPORTED_MEDIA_TYPE(HttpStatus.UNSUPPORTED_MEDIA_TYPE, "X005", "지원하지 않는 미디어 타입입니다."),

	// Auth 관련 에러
	INVALID_ACCESS_TOKEN(HttpStatus.UNAUTHORIZED, "AUTH_001", "유효하지 않은 엑세스 토큰입니다."),
	EXPIRED_ACCESS_TOKEN(HttpStatus.UNAUTHORIZED, "AUTH_002", "만료된 엑세스 토큰입니다."),
	USER_NOT_FOUND(HttpStatus.NOT_FOUND, "AUTH_003", "사용자를 찾을 수 없습니다."),
	KAKAO_API_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "AUTH_004", "카카오 API 호출 중 오류가 발생했습니다."),
	AUTH_TOKEN_MISMATCH(HttpStatus.UNAUTHORIZED, "AUTH_005", "토큰 정보가 일치하지 않습니다."),
	INVALID_REFRESH_TOKEN(HttpStatus.UNAUTHORIZED, "AUTH_006", "유효하지 않은 리프레시 토큰입니다."),
	NOT_AUTHENTICATED_USER(HttpStatus.UNAUTHORIZED, "AUTH_007", "인증 되지 않은 사용자입니다."),
	UNAUTHORIZED_USER_ACCESS(HttpStatus.FORBIDDEN, "AUTH_008", "해당 사용자 정보에 접근할 권한이 없습니다."),
	EXPIRED_REFRESH_TOKEN(HttpStatus.UNAUTHORIZED, "AUTH_009", "만료된 리프레시 토큰입니다."),

	// FCM 토큰 관련 에러 코드
	FCM_TOKEN_NOT_FOUND(HttpStatus.NOT_FOUND, "FCM_001", "FCM 토큰을 찾을 수 없습니다."),

	// BLE 토큰 관련 에러 코드
	BLE_TOKEN_NOT_FOUND(HttpStatus.NOT_FOUND, "BLE_001", "BLE 토큰을 찾을 수 없습니다."),

	// 알림 관련 에러 코드
	NOTIFICATION_TYPE_NOT_FOUND(HttpStatus.NOT_FOUND, "NOTIFICATION_001", "알림 타입을 찾을 수 없습니다."),
	NOTIFICATION_SETTING_NOT_FOUND(HttpStatus.NOT_FOUND, "NOTIFICATION_002", "알림 설정을 찾을 수 없습니다."),
	NOTIFICATION_SETTING_DISABLED(HttpStatus.BAD_REQUEST, "NOTIFICATION_003", "비활성화된 알림입니다."),

	// 기프티콘 관련 에러 코드
	GIFTICON_NOT_FOUND(HttpStatus.NOT_FOUND, "GIFTICON_001", "기프티콘 정보를 찾을 수 없습니다."),
	UNAUTHORIZED_GIFTICON_ACCESS(HttpStatus.FORBIDDEN, "GIFTICON_002", "해당 기프티콘에 접근 권한이 없습니다."),
	GIFTICON_ALREADY_USED(HttpStatus.NOT_FOUND, "GIFTICON_004", "이미 사용된 기프티콘입니다."),
	GIFTICON_DELETED(HttpStatus.NOT_FOUND, "GIFTICON_005", "삭제된 기프티콘입니다."),
	INVALID_AMOUNT_GIFTICON_VALUE(HttpStatus.BAD_REQUEST, "GIFTICON_006", "금액형 기프티콘은 금액을 입력해야 합니다."),
	GIFTICON_BARCODE_DUPLICATE(HttpStatus.CONFLICT, "GIFTICON_007", "이미 등록된 바코드 번호입니다."),
	GIFTICON_AVAILABLE(HttpStatus.BAD_REQUEST, "GIFTICON_008", "기프티콘이 사용되지 않은 상태입니다."),
	GIFTICON_NO_USAGE_HISTORY(HttpStatus.NOT_FOUND, "GIFTICON_009", "해당 기프티콘에 대한 사용내역이 없습니다."),
	GIFTICON_INSUFFICIENT_BALANCE(HttpStatus.BAD_REQUEST, "GIFTICON_010", "기프티콘 잔액이 부족합니다."),
	INVALID_GIFTICON_TYPE(HttpStatus.BAD_REQUEST, "GIFTICON_011", "기프티콘 타입이 올바르지 않습니다."),
	INVALID_AMOUNT_VALUE(HttpStatus.BAD_REQUEST, "GIFTICON_012", "금액이 유효하지 않습니다."),
	GIFTICON_EXPIRED_DATE(HttpStatus.BAD_REQUEST, "GIFTICON_013", "유효기간이 지난 기프티콘입니다."),

	// 브랜드 관련 에러 코드
	BRAND_NOT_FOUND(HttpStatus.NOT_FOUND, "BRAND_001", "브랜드 정보를 찾을 수 없습니다,"),

	// AI 서비스 관련 에러 코드
	AI_SERVICE_CONNECTION_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "AI_001", "AI 서비스 연결 중 오류가 발생했습니다."),
	AI_SERVICE_RESPONSE_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "AI_002", "AI 서비스 응답 처리 중 오류가 발생했습니다."),
	AI_SERVICE_EMPTY_RESPONSE(HttpStatus.BAD_GATEWAY, "AI_003", "AI 서비스 응답이 비어있습니다."),
	AI_SERVICE_PARSE_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "AI_004", "AI 서비스 응답 파싱 중 오류가 발생했습니다."),

	// OCR 서비스 관련 에러 코드
	OCR_SERVICE_CONNECTION_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "OCR_001", "OCR 서비스 연결 중 오류가 발생했습니다."),
	OCR_SERVICE_RESPONSE_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "OCR_002", "OCR 서비스 응답 처리 중 오류가 발생했습니다."),
	OCR_FILE_PROCESSING_ERROR(HttpStatus.BAD_REQUEST, "OCR_003", "이미지 파일 처리 중 오류가 발생했습니다."),
	OCR_JSON_PROCESSING_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "OCR_004", "OCR 요청 JSON 생성 중 오류가 발생했습니다."),

	// S3 스토리지 관련 에러 코드
	S3_UPLOAD_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "S3_001", "파일 업로드 중 오류가 발생했습니다."),
	S3_DELETE_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "S3_002", "파일 삭제 중 오류가 발생했습니다."),

	// 파일 검증 관련 에러 코드
	FILE_EMPTY(HttpStatus.BAD_REQUEST, "FILE_001", "파일이 비어있습니다."),
	FILE_TOO_LARGE(HttpStatus.BAD_REQUEST, "FILE_002", "파일 크기가 제한을 초과했습니다."),
	FILE_INVALID_NAME(HttpStatus.BAD_REQUEST, "FILE_003", "유효하지 않은 파일명입니다."),
	FILE_INVALID_EXTENSION(HttpStatus.BAD_REQUEST, "FILE_004", "지원하지 않는 파일 형식입니다."),
	FILE_INVALID_MIME_TYPE(HttpStatus.BAD_REQUEST, "FILE_005", "유효하지 않은 파일 MIME 타입입니다."),
	FILE_INVALID_CONTENT(HttpStatus.BAD_REQUEST, "FILE_006", "파일 내용이 손상되었거나 유효하지 않습니다."),
	FILE_PROCESSING_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "FILE_007", "파일 처리 중 오류가 발생했습니다."),
	FILE_NOT_FOUND(HttpStatus.NOT_FOUND, "FILE_008", "파일을 찾을 수 없습니다."),
	ORIGINAL_IMAGE_REQUIRED(HttpStatus.BAD_REQUEST, "FILE_009", "기프티콘 원본 이미지가 필요합니다."),
	THUMBNAIL_IMAGE_REQUIRED(HttpStatus.BAD_REQUEST, "FILE_010", "기프티콘 썸네일 이미지가 필요합니다."),
	BARCODE_IMAGE_REQUIRED(HttpStatus.BAD_REQUEST, "FILE_011", "기프티콘 바코드 이미지가 필요합니다."),

	// CloudFront 관련 에러 코드
	CLOUDFRONT_URL_GENERATION_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "CF_001", "URL 생성 중 오류가 발생했습니다."),
	CLOUDFRONT_PRIVATE_KEY_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "CF_002", "CloudFront 인증 키 처리 중 오류가 발생했습니다."),
	CLOUDFRONT_SIGNED_URL_EXPIRED(HttpStatus.FORBIDDEN, "CF_003", "URL이 만료되었습니다."),

	// ShareBox 관련 에러 코드
	SHAREBOX_NOT_FOUND(HttpStatus.NOT_FOUND, "SHAREBOX_001", "쉐어박스를 찾을 수 없습니다."),
	INVITE_CODE_GENERATION_FAILED(HttpStatus.INTERNAL_SERVER_ERROR, "SHAREBOX_002", "쉐어박스 코드 생성에 실패했습니다."),
	SHAREBOX_PARTICIPATION_DISABLED(HttpStatus.FORBIDDEN, "SHAREBOX_004", "참여가 비활성화된 쉐어박스입니다."),
	ALREADY_PARTICIPATING_SHAREBOX(HttpStatus.CONFLICT, "SHAREBOX_005", "이미 참여 중인 쉐어박스입니다."),
	SHAREBOX_MAX_PARTICIPANTS_REACHED(HttpStatus.FORBIDDEN, "SHAREBOX_006", "최대 참여자 수(10명)에 도달했습니다."),
	INVALID_SHAREBOX_NAME(HttpStatus.BAD_REQUEST, "SHAREBOX_007", "유효하지 않은 쉐어박스 이름입니다."),
	UNAUTHORIZED_SHAREBOX_ACCESS(HttpStatus.FORBIDDEN, "SHAREBOX_008", "해당 쉐어박스에 접근 권한이 없습니다."),
	CANNOT_SHARE_USED_AMOUNT_GIFTICON(HttpStatus.BAD_REQUEST, "SHAREBOX_009", "일부 사용된 금액형 기프티콘은 공유할 수 없습니다."),
	GIFTICON_ALREADY_SHARED(HttpStatus.BAD_REQUEST, "SHAREBOX_010", "이미 공유된 기프티콘입니다."),
	GIFTICON_NOT_SHARED_IN_THIS_SHAREBOX(HttpStatus.BAD_REQUEST, "SHAREBOX_011", "이 쉐어박스에 공유되지 않은 기프티콘입니다."),
	UNAUTHORIZED_SHAREBOX_OWNER_ACCESS(HttpStatus.FORBIDDEN, "SHAREBOX_012", "해당 쉐어박스 방장만 접근 가능합니다."),

	// Present 관련 에러 코드
	PRESENT_TEMPLATE_NOT_FOUND(HttpStatus.NOT_FOUND, "PRESENT_001", "선물 카드 템플릿 디자인을 찾을 수 없습니다."),
	COLOR_PALETTE_NOT_FOUND(HttpStatus.NOT_FOUND, "PRESENT_002", "선물 카드 색상 디자인을 찾을 수 없습니다."),
	PRESENT_CODE_GENERATION_FAILED(HttpStatus.INTERNAL_SERVER_ERROR, "PRESENT_003", "선물 카드 코드 생성에 실패했습니다."),
	PRESENT_CARD_NOT_FOUND(HttpStatus.NOT_FOUND, "PRESENT_004", "선물 카드를 찾을 수 없습니다."),
	PRESENT_CARD_EXPIRED(HttpStatus.GONE, "PRESENT_005", "선물 카드가 만료되었습니다."),

	// GIVEAWAY 관련 에러코드
	NO_NEARBY_PEOPLES(HttpStatus.NOT_FOUND, "GIVEAWAY_001", "주변에 감지된 사용자가 없습니다.");

	// http 상태 코드
	private final HttpStatus status;
	// 커스텀 에러 코드
	private final String code;
	// 기본 에러 메시지
	private final String defaultMessage;

	ErrorCode(HttpStatus status, String code, String defaultMessage) {
		this.status = status;
		this.code = code;
		this.defaultMessage = defaultMessage;
	}
}
