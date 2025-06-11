// 공통 설정 값만 해당 파일에 추가해서 사용

const PRODUCTION_BASE_URL = 'https://k12d205.p.ssafy.io'; // 슬래시 제거
// const DEV_BASE_URL = 'http://10.0.2.2:8090'; // Android 에뮬레이터 localhost 연결용

// API 기본 설정
export const BASE_URL = PRODUCTION_BASE_URL; // 항상 프로덕션 서버 사용
export const API_BASE_URL = BASE_URL; // axios 직접 호출용 변수도 추가

// 엔드포인트 URL을 안전하게 생성하는 유틸리티 함수
export const endpointUrl = (baseUrl, endpoint) => {
  // baseUrl 끝에 슬래시가 있다면 제거
  const base = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  // endpoint 시작에 슬래시가 없다면 추가
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

  return `${base}${path}`;
};

// 개발 환경과 프로덕션 환경 분리
export const API_CONFIG = {
  BASE_URL: BASE_URL,
  ENDPOINTS: {
    // 인증 관련 엔드포인트
    KAKAO_LOGIN: '/api/auth/kakao', // 카카오 로그인
    LOGOUT: '/api/auth/logout', // 로그아웃
    REFRESH_TOKEN: '/api/auth/refresh', // 토큰 갱신
    USER_INFO: userId => `/api/users/${userId}`,
    FCM_TOKEN_UPDATE: '/api/users/fcm-token', // FCM 토큰 갱신 API 추가

    // 쉐어박스 관련
    SHARE_BOXES: '/api/share-boxes', // 목록 조회(GET), 생성(POST) 모두 사용
    CREATE_SHARE_BOX: '/api/share-boxes', // (생성용 별칭, 실제 경로는 동일)
    JOIN_SHARE_BOX: '/api/share-boxes/join',
    LEAVE_SHARE_BOX: shareBoxId => `/api/share-boxes/${shareBoxId}/leave`,
    SHARE_BOX_SETTINGS: shareBoxId => `/api/share-boxes/${shareBoxId}/settings`,
    SHARE_BOX_USERS: shareBoxId => `/api/share-boxes/${shareBoxId}/users`,
    AVAILABLE_GIFTICONS: shareBoxId => `/api/share-boxes/${shareBoxId}/available-gifticons`,
    USED_GIFTICONS: shareBoxId => `/api/share-boxes/${shareBoxId}/used-gifticons`,
    SHARE_BOX_NAME: shareBoxId => `/api/share-boxes/${shareBoxId}/name`,
    PARTICIPATION_SETTING: shareBoxId => `/api/share-boxes/${shareBoxId}/participation-setting`,
    SHARE_BOX_GIFTICON: (shareBoxId, gifticonId) =>
      `/api/share-boxes/${shareBoxId}/gifticons/${gifticonId}`,
    // 기프티콘 관련 엔드포인트
    GIFTICON_IMAGE_METADATA: '/api/gifticons/image-metadata', // 기프티콘 이미지 메타데이터 조회
    REGISTER_GIFTICON: '/api/gifticons', // 기프티콘 등록
    GET_GIFTICONS: '/api/available-gifticons', //사용 가능 기프티콘 목록 조회
    GET_USED_GIFTICONS: '/api/used-gifticons', // 사용 완료 기프티콘 목록 조회
    GET_GIFTICON_DETAIL: '/api/gifticons/', // 기프티콘 상세 조회 (뒤에 ID 붙여서 사용)

    // 뿌리기 관련 엔드포인트
    GIVE_AWAY_GIFTICON: gifticonId => `/api/gifticons/${gifticonId}/give-away`, // 기프티콘 뿌리기

    // 금액형 기프티콘 관련 엔드포인트
    AMOUNT_GIFTICONS: '/api/amount-gifticons', // 금액형 기프티콘 API 기본 경로

    // 상품형 기프티콘 관련 엔드포인트
    PRODUCT_GIFTICONS: '/api/product-gifticons', // 상품형 기프티콘 API 기본 경로
    PRODUCT_GIFTICON_USE: gifticonId => `/api/product-gifticons/${gifticonId}/use`,

    // 브랜드 관련 엔드포인트
    SEARCH_BRANDS: '/api/brands', // 브랜드 검색 API

    // 선물 엔드포인트
    PRESENT_TEMPLATES: '/api/presents/templates',
    PRESENT_TEMPLATE_COLORS: templateId => `/api/presents/templates/${templateId}/colors`,
    PRESENT_TEMPLATE_DETAIL: templateId => `/api/presents/templates/${templateId}`,
    PRESENT_GIFTICON: gifticonId => `/api/gifticons/${gifticonId}/present`,
    PRESENT_CANCEL: gifticonId => `/api/gifticons/${gifticonId}/present`,

    // 알림 설정 관련 엔드포인트
    NOTIFICATION_SETTINGS: '/api/notification-settings', // 알림 설정 조회
    NOTIFICATION_SETTINGS_TYPE: type => `/api/notification-settings/types/${type}`, // 알림 타입별 on/off 설정
    NOTIFICATION_SETTINGS_EXPIRATION_CYCLE: '/api/notification-settings/expiration-cycle', // 알림 주기 설정

    // 알림 내역 관련 엔드포인트
    NOTIFICATIONS: '/api/notifications', // 알림 내역 목록 조회
    NOTIFICATIONS_COUNT: '/api/notifications/count', // 미확인 알림 개수 조회
    NOTIFICATIONS_READ: '/api/notifications/read', // 알림 읽음 일괄 처리

    // 지오펜싱 인근 매장 알림 관련 엔드포인트
    GEO_NOTIFICATIONS: '/api/notifications/request',

    // 기타 엔드포인트들을 여기에 추가합니다.
    // 예: GET_USERS: '/api/users',
    //     CREATE_USER: '/api/users',
  },
  TIMEOUT: 60000, // API 요청 타임아웃 시간을 60초로 늘림
  timeout: 60000, // 기본 타임아웃 60초로 늘림
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
};

// API 에러 코드
export const API_ERRORS = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT: 'TIMEOUT',
  SERVER_ERROR: 'SERVER_ERROR',
  UNKNOWN: 'UNKNOWN',
};

// API 상태 코드 처리
export const handleApiError = error => {
  if (error.response) {
    // 서버에서 응답이 왔지만 상태 코드가 2xx 범위를 벗어난 경우
    const { status, data } = error.response;
    console.error(`API 오류 (${status}):`, data);

    return {
      status,
      errorCode: data.errorCode || API_ERRORS.SERVER_ERROR,
      message: data.message || '서버 오류가 발생했습니다.',
    };
  } else if (error.request) {
    // 요청은 전송되었지만 응답이 수신되지 않은 경우
    console.error('API 요청 오류:', error.request);

    return {
      status: 0,
      errorCode: API_ERRORS.NETWORK_ERROR,
      message: '네트워크 연결을 확인해주세요.',
    };
  } else {
    // 요청 설정 중 오류가 발생한 경우
    console.error('API 설정 오류:', error.message);

    return {
      status: 0,
      errorCode: API_ERRORS.UNKNOWN,
      message: '알 수 없는 오류가 발생했습니다.',
    };
  }
};
