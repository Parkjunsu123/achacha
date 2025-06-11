// 인증 관련 에러 코드
export const AUTH_ERRORS = {
  AUTH_01: 'AUTH_01', // 유효하지 않은 토큰
  AUTH_02: 'AUTH_02', // 만료된 토큰
  AUTH_03: 'AUTH_03', // 사용자를 찾을 수 없음
  AUTH_04: 'AUTH_04', // 카카오 API 호출 중 오류
  AUTH_05: 'AUTH_05', // 토큰 정보 불일치
  AUTH_06: 'AUTH_06', // 유효하지 않은 리프레시 토큰
  AUTH_08: 'AUTH_08', // 해당 사용자 정보에 접근할 권한이 없음
  AUTH_007: 'AUTH_007', // 인증되지 않은 사용자
  AUTH_09: 'AUTH_09', // 만료된 리프레시 토큰
};

// 파일 관련 에러 코드
export const FILE_ERRORS = {
  FILE_001: 'FILE_001', // 파일이 비어있음
  FILE_002: 'FILE_002', // 파일 크기 제한 초과
  FILE_003: 'FILE_003', // 유효하지 않은 파일명
  FILE_004: 'FILE_004', // 지원하지 않는 파일 형식
  FILE_005: 'FILE_005', // 유효하지 않은 파일 MIME 타입
  FILE_006: 'FILE_006', // 파일 내용 손상 또는 유효하지 않음
  FILE_007: 'FILE_007', // 파일 처리 중 오류
  FILE_008: 'FILE_008', // 파일을 찾을 수 없음
  FILE_009: 'FILE_009', // 기프티콘 원본 이미지가 필요
  FILE_010: 'FILE_010', // 기프티콘 썸네일 이미지가 필요
  FILE_011: 'FILE_011', // 기프티콘 바코드 이미지가 필요
};

// OCR 관련 에러 코드
export const OCR_ERRORS = {
  OCR_001: 'OCR_001', // OCR 서비스 연결 중 오류
  OCR_002: 'OCR_002', // OCR 서비스 응답 처리 중 오류
  OCR_003: 'OCR_003', // 이미지 파일 처리 중 오류
  OCR_004: 'OCR_004', // OCR 요청 JSON 생성 중 오류
};

// AI 관련 에러 코드
export const AI_ERRORS = {
  AI_001: 'AI_001', // AI 서비스 연결 중 오류
  AI_002: 'AI_002', // AI 서비스 응답 처리 중 오류
  AI_003: 'AI_003', // AI 서비스 응답이 비어있음
  AI_004: 'AI_004', // AI 서비스 응답 파싱 중 오류
};

// 기프티콘 관련 에러 코드
export const GIFTICON_ERRORS = {
  GIFTICON_001: 'GIFTICON_001', // 기프티콘 정보를 찾을 수 없음
  GIFTICON_002: 'GIFTICON_002', // 해당 기프티콘에 접근 권한이 없음
  GIFTICON_003: 'GIFTICON_003', // 유효기간이 지난 기프티콘
  GIFTICON_004: 'GIFTICON_004', // 이미 사용된 기프티콘
  GIFTICON_005: 'GIFTICON_005', // 삭제된 기프티콘
  GIFTICON_006: 'GIFTICON_006', // 금액형 기프티콘은 금액을 입력해야 함
  GIFTICON_007: 'GIFTICON_007', // 이미 등록된 바코드 번호
  GIFTICON_008: 'GIFTICON_008', // 기프티콘이 사용되지 않은 상태
  GIFTICON_009: 'GIFTICON_009', // 해당 기프티콘에 대한 사용내역이 없음
  GIFTICON_010: 'GIFTICON_010', // 기프티콘 잔액이 부족
  GIFTICON_011: 'GIFTICON_011', // 기프티콘 타입이 올바르지 않음
  GIFTICON_012: 'GIFTICON_012', // 금액이 유효하지 않음
  GIFTICON_013: 'GIFTICON_013', // 유효기간이 지난 기프티콘
};

// 브랜드 관련 에러 코드
export const BRAND_ERRORS = {
  BRAND_001: 'BRAND_001', // 브랜드 정보를 찾을 수 없음
};

// 쉐어박스 관련 에러 코드
export const SHAREBOX_ERRORS = {
  SHAREBOX_001: 'SHAREBOX_001', // 쉐어박스를 찾을 수 없음
  SHAREBOX_002: 'SHAREBOX_002', // 쉐어박스 코드 생성에 실패
  SHAREBOX_003: 'SHAREBOX_003', // 유효하지 않은 초대 코드
  SHAREBOX_004: 'SHAREBOX_004', // 참여가 비활성화된 쉐어박스
  SHAREBOX_005: 'SHAREBOX_005', // 이미 참여 중인 쉐어박스
  SHAREBOX_006: 'SHAREBOX_006', // 최대 참여자 수(10명)에 도달
  SHAREBOX_007: 'SHAREBOX_007', // 유효하지 않은 쉐어박스 이름
  SHAREBOX_008: 'SHAREBOX_008', // 해당 쉐어박스에 접근 권한이 없음
  SHAREBOX_009: 'SHAREBOX_009', // 일부 사용된 금액형 기프티콘은 공유할 수 없음
  SHAREBOX_010: 'SHAREBOX_010', // 이미 공유된 기프티콘
  SHAREBOX_011: 'SHAREBOX_011', // 이 쉐어박스에 공유되지 않은 기프티콘
  SHAREBOX_012: 'SHAREBOX_012', // 해당 쉐어박스 방장만 접근 가능
};

// 알림 관련 에러 코드
export const NOTIFICATION_ERRORS = {
  NOTIFICATION_001: 'NOTIFICATION_001', // 알림 타입을 찾을 수 없음
  NOTIFICATION_002: 'NOTIFICATION_002', // 알림 설정을 찾을 수 없음
  NOTIFICATION_003: 'NOTIFICATION_003', // 비활성화된 알림
};

// S3 및 서버 관련 에러 코드
export const SERVER_ERRORS = {
  S3_001: 'S3_001', // 파일 업로드 중 오류
  S3_002: 'S3_002', // 파일 삭제 중 오류
  X002: 'X002', // 잘못된 파라미터가 전달됨
  X003: 'X003', // 서버 에러가 발생함
  X004: 'X004', // 상수 클래스는 인스턴스화할 수 없음
  X005: 'X005', // 지원하지 않는 미디어 타입
};

// 선물(카드) 관련 에러 코드
export const PRESENT_ERRORS = {
  PRESENT_001: 'PRESENT_001', // 선물 카드 템플릿 디자인을 찾을 수 없음
  PRESENT_002: 'PRESENT_002', // 선물 카드 색상 디자인을 찾을 수 없음
  PRESENT_003: 'PRESENT_003', // 선물 카드 코드 생성에 실패
  PRESENT_004: 'PRESENT_004', // 선물 카드를 찾을 수 없음
  PRESENT_005: 'PRESENT_005', // 선물 카드가 만료됨
};

// FCM 토큰 관련 에러 코드
export const FCM_ERRORS = {
  FCM_001: 'FCM_001', // FCM 토큰을 찾을 수 없음
};

// BLE 토큰 관련 에러 코드
export const BLE_ERRORS = {
  BLE_001: 'BLE_001', // BLE 토큰을 찾을 수 없음
};

// CloudFront 관련 에러 코드
export const CLOUDFRONT_ERRORS = {
  CF_001: 'CF_001', // URL 생성 중 오류
  CF_002: 'CF_002', // CloudFront 인증 키 처리 중 오류
  CF_003: 'CF_003', // URL이 만료됨
};

// Giveaway 관련 에러 코드
export const GIVEAWAY_ERRORS = {
  GIVEAWAY_001: 'GIVEAWAY_001', // 주변에 감지된 사용자가 없음
};

// 모든 에러 코드를 하나의 객체로 합침
export const ERROR_CODES = {
  ...AUTH_ERRORS,
  ...FILE_ERRORS,
  ...OCR_ERRORS,
  ...AI_ERRORS,
  ...GIFTICON_ERRORS,
  ...BRAND_ERRORS,
  ...SHAREBOX_ERRORS,
  ...SERVER_ERRORS,
  ...PRESENT_ERRORS,
  ...NOTIFICATION_ERRORS,
  ...FCM_ERRORS,
  ...BLE_ERRORS,
  ...CLOUDFRONT_ERRORS,
  ...GIVEAWAY_ERRORS,
};

// HTTP 상태 코드에 따른 에러 코드 매핑
export const HTTP_STATUS_ERROR_MAP = {
  400: [
    ...Object.values(FILE_ERRORS).filter(code =>
      [
        FILE_ERRORS.FILE_001,
        FILE_ERRORS.FILE_002,
        FILE_ERRORS.FILE_003,
        FILE_ERRORS.FILE_004,
        FILE_ERRORS.FILE_005,
        FILE_ERRORS.FILE_006,
        FILE_ERRORS.FILE_009,
        FILE_ERRORS.FILE_010,
        FILE_ERRORS.FILE_011,
      ].includes(code)
    ),
    GIFTICON_ERRORS.GIFTICON_006,
    GIFTICON_ERRORS.GIFTICON_008,
    GIFTICON_ERRORS.GIFTICON_010,
    GIFTICON_ERRORS.GIFTICON_011,
    GIFTICON_ERRORS.GIFTICON_012,
    GIFTICON_ERRORS.GIFTICON_013,
    SERVER_ERRORS.X002,
    NOTIFICATION_ERRORS.NOTIFICATION_003,
    SHAREBOX_ERRORS.SHAREBOX_007,
    SHAREBOX_ERRORS.SHAREBOX_009,
    SHAREBOX_ERRORS.SHAREBOX_010,
    SHAREBOX_ERRORS.SHAREBOX_011,
    GIVEAWAY_ERRORS.GIVEAWAY_001,
  ],
  401: [
    AUTH_ERRORS.AUTH_01,
    AUTH_ERRORS.AUTH_02,
    AUTH_ERRORS.AUTH_05,
    AUTH_ERRORS.AUTH_06,
    AUTH_ERRORS.AUTH_007,
    AUTH_ERRORS.AUTH_09,
  ],
  403: [
    AUTH_ERRORS.AUTH_08,
    SHAREBOX_ERRORS.SHAREBOX_004,
    SHAREBOX_ERRORS.SHAREBOX_006,
    SHAREBOX_ERRORS.SHAREBOX_008,
    SHAREBOX_ERRORS.SHAREBOX_012,
    CLOUDFRONT_ERRORS.CF_003,
  ],
  404: [
    AUTH_ERRORS.AUTH_03,
    BRAND_ERRORS.BRAND_001,
    SHAREBOX_ERRORS.SHAREBOX_001,
    NOTIFICATION_ERRORS.NOTIFICATION_001,
    NOTIFICATION_ERRORS.NOTIFICATION_002,
    GIFTICON_ERRORS.GIFTICON_001,
    GIFTICON_ERRORS.GIFTICON_004,
    GIFTICON_ERRORS.GIFTICON_005,
    GIFTICON_ERRORS.GIFTICON_009,
    FILE_ERRORS.FILE_008,
    FCM_ERRORS.FCM_001,
    BLE_ERRORS.BLE_001,
    PRESENT_ERRORS.PRESENT_001,
    PRESENT_ERRORS.PRESENT_002,
    PRESENT_ERRORS.PRESENT_004,
  ],
  409: [GIFTICON_ERRORS.GIFTICON_007, SHAREBOX_ERRORS.SHAREBOX_005],
  410: [PRESENT_ERRORS.PRESENT_005],
  415: [SERVER_ERRORS.X005],
  500: [
    OCR_ERRORS.OCR_001,
    OCR_ERRORS.OCR_002,
    OCR_ERRORS.OCR_004,
    AI_ERRORS.AI_001,
    AI_ERRORS.AI_002,
    AI_ERRORS.AI_004,
    FILE_ERRORS.FILE_007,
    SERVER_ERRORS.S3_001,
    SERVER_ERRORS.S3_002,
    SERVER_ERRORS.X003,
    SERVER_ERRORS.X004,
    AUTH_ERRORS.AUTH_04,
    SHAREBOX_ERRORS.SHAREBOX_002,
    CLOUDFRONT_ERRORS.CF_001,
    CLOUDFRONT_ERRORS.CF_002,
    PRESENT_ERRORS.PRESENT_003,
  ],
  502: [AI_ERRORS.AI_003],
};
