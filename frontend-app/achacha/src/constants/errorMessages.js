// 인증 관련 에러 메시지
export const AUTH_ERROR_MESSAGES = {
  AUTH_01: '유효하지 않은 엑세스 토큰입니다.',
  AUTH_02: '만료된 엑세스 토큰입니다.',
  AUTH_03: '사용자를 찾을 수 없습니다.',
  AUTH_04: '카카오 API 호출 중 오류가 발생했습니다.',
  AUTH_05: '토큰 정보가 일치하지 않습니다.',
  AUTH_06: '유효하지 않은 리프레시 토큰입니다.',
  AUTH_08: '해당 사용자 정보에 접근할 권한이 없습니다.',
  AUTH_007: '인증 되지 않은 사용자입니다.',
  AUTH_09: '만료된 리프레시 토큰입니다.',
};

// 파일 관련 에러 메시지
export const FILE_ERROR_MESSAGES = {
  FILE_001: '파일이 비어있습니다.',
  FILE_002: '파일 크기가 제한을 초과했습니다.',
  FILE_003: '유효하지 않은 파일명입니다.',
  FILE_004: '지원하지 않는 파일 형식입니다.',
  FILE_005: '유효하지 않은 파일 MIME 타입입니다.',
  FILE_006: '파일 내용이 손상되었거나 유효하지 않습니다.',
  FILE_007: '파일 처리 중 오류가 발생했습니다.',
  FILE_008: '파일을 찾을 수 없습니다.',
  FILE_009: '기프티콘 원본 이미지가 필요합니다.',
  FILE_010: '기프티콘 썸네일 이미지가 필요합니다.',
  FILE_011: '기프티콘 바코드 이미지가 필요합니다.',
};

// OCR 관련 에러 메시지
export const OCR_ERROR_MESSAGES = {
  OCR_001: 'OCR 서비스 연결 중 오류가 발생했습니다.',
  OCR_002: 'OCR 서비스 응답 처리 중 오류가 발생했습니다.',
  OCR_003: '이미지 파일 처리 중 오류가 발생했습니다.',
  OCR_004: 'OCR 요청 JSON 생성 중 오류가 발생했습니다.',
};

// AI 관련 에러 메시지
export const AI_ERROR_MESSAGES = {
  AI_001: 'AI 서비스 연결 중 오류가 발생했습니다.',
  AI_002: 'AI 서비스 응답 처리 중 오류가 발생했습니다.',
  AI_003: 'AI 서비스 응답이 비어있습니다.',
  AI_004: 'AI 서비스 응답 파싱 중 오류가 발생했습니다.',
};

// 기프티콘 관련 에러 메시지
export const GIFTICON_ERROR_MESSAGES = {
  GIFTICON_001: '기프티콘 정보를 찾을 수 없습니다.',
  GIFTICON_002: '해당 기프티콘에 접근 권한이 없습니다.',
  GIFTICON_003: '유효기간이 지난 기프티콘입니다.',
  GIFTICON_004: '이미 사용된 기프티콘입니다.',
  GIFTICON_005: '삭제된 기프티콘입니다.',
  GIFTICON_006: '금액형 기프티콘은 금액을 입력해야 합니다.',
  GIFTICON_007: '이미 등록된 바코드 번호입니다.',
  GIFTICON_008: '기프티콘이 사용되지 않은 상태입니다.',
  GIFTICON_009: '해당 기프티콘에 대한 사용내역이 없습니다.',
  GIFTICON_010: '기프티콘 잔액이 부족합니다.',
  GIFTICON_011: '기프티콘 타입이 올바르지 않습니다.',
  GIFTICON_012: '금액이 유효하지 않습니다.',
  GIFTICON_013: '유효기간이 지난 기프티콘입니다.',
};

// 브랜드 관련 에러 메시지
export const BRAND_ERROR_MESSAGES = {
  BRAND_001: '브랜드 정보를 찾을 수 없습니다.',
};

// 쉐어박스 관련 에러 메시지
export const SHAREBOX_ERROR_MESSAGES = {
  SHAREBOX_001: '쉐어박스를 찾을 수 없습니다.',
  SHAREBOX_002: '쉐어박스 코드 생성에 실패했습니다.',
  SHAREBOX_003: '유효하지 않은 초대 코드입니다.',
  SHAREBOX_004: '참여가 비활성화된 쉐어박스입니다.',
  SHAREBOX_005: '이미 참여 중인 쉐어박스입니다.',
  SHAREBOX_006: '최대 참여자 수(10명)에 도달했습니다.',
  SHAREBOX_007: '유효하지 않은 쉐어박스 이름입니다.',
  SHAREBOX_008: '해당 쉐어박스에 접근 권한이 없습니다.',
  SHAREBOX_009: '일부 사용된 금액형 기프티콘은 공유할 수 없습니다.',
  SHAREBOX_010: '이미 공유된 기프티콘입니다.',
  SHAREBOX_011: '이 쉐어박스에 공유되지 않은 기프티콘입니다.',
  SHAREBOX_012: '해당 쉐어박스 방장만 접근 가능합니다.',
};

// S3 및 서버 관련 에러 메시지
export const SERVER_ERROR_MESSAGES = {
  S3_001: '파일 업로드 중 오류가 발생했습니다.',
  S3_002: '파일 삭제 중 오류가 발생했습니다.',
  X002: '잘못된 파라미터가 전달되었습니다.',
  X003: '서버 에러가 발생했습니다.',
  X004: '상수 클래스는 인스턴스화할 수 없습니다.',
  X005: '지원하지 않는 미디어 타입입니다.',
};

// 선물(카드) 관련 에러 메시지
export const PRESENT_ERROR_MESSAGES = {
  PRESENT_001: '선물 카드 템플릿 디자인을 찾을 수 없습니다.',
  PRESENT_002: '선물 카드 색상 디자인을 찾을 수 없습니다.',
  PRESENT_003: '선물 카드 코드 생성에 실패했습니다.',
  PRESENT_004: '선물 카드를 찾을 수 없습니다.',
  PRESENT_005: '선물 카드가 만료되었습니다.',
};

// 알림 관련 에러 메시지
export const NOTIFICATION_ERROR_MESSAGES = {
  NOTIFICATION_001: '알림 타입을 찾을 수 없습니다.',
  NOTIFICATION_002: '알림 설정을 찾을 수 없습니다.',
  NOTIFICATION_003: '비활성화된 알림입니다.',
};

// FCM 토큰 관련 에러 메시지
export const FCM_ERROR_MESSAGES = {
  FCM_001: 'FCM 토큰을 찾을 수 없습니다.',
};

// BLE 토큰 관련 에러 메시지
export const BLE_ERROR_MESSAGES = {
  BLE_001: 'BLE 토큰을 찾을 수 없습니다.',
};

// CloudFront 관련 에러 메시지
export const CLOUDFRONT_ERROR_MESSAGES = {
  CF_001: 'URL 생성 중 오류가 발생했습니다.',
  CF_002: 'CloudFront 인증 키 처리 중 오류가 발생했습니다.',
  CF_003: 'URL이 만료되었습니다.',
};

// Giveaway 관련 에러 메시지
export const GIVEAWAY_ERROR_MESSAGES = {
  GIVEAWAY_001: '주변에 감지된 사용자가 없습니다.',
};

// 모든 에러 메시지를 하나의 객체로 합침
export const ERROR_MESSAGES = {
  ...AUTH_ERROR_MESSAGES,
  ...FILE_ERROR_MESSAGES,
  ...OCR_ERROR_MESSAGES,
  ...AI_ERROR_MESSAGES,
  ...GIFTICON_ERROR_MESSAGES,
  ...BRAND_ERROR_MESSAGES,
  ...SHAREBOX_ERROR_MESSAGES,
  ...SERVER_ERROR_MESSAGES,
  ...PRESENT_ERROR_MESSAGES,
  ...NOTIFICATION_ERROR_MESSAGES,
  ...FCM_ERROR_MESSAGES,
  ...BLE_ERROR_MESSAGES,
  ...CLOUDFRONT_ERROR_MESSAGES,
  ...GIVEAWAY_ERROR_MESSAGES,
};

// 기본 에러 메시지
export const DEFAULT_ERROR_MESSAGES = {
  400: '요청에 문제가 있습니다. 입력값을 확인해주세요.',
  401: '인증에 실패했습니다. 다시 로그인해주세요.',
  403: '접근 권한이 없습니다.',
  404: '요청한 리소스를 찾을 수 없습니다.',
  409: '요청이 충돌했습니다.',
  410: '요청한 리소스가 더 이상 사용할 수 없습니다.',
  415: '지원하지 않는 미디어 타입입니다.',
  500: '서버 에러가 발생했습니다. 잠시 후 다시 시도해주세요.',
  502: '서버 연결에 문제가 발생했습니다. 잠시 후 다시 시도해주세요.',
  default: '알 수 없는 오류가 발생했습니다.',
};
