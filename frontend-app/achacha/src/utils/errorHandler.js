import { Alert } from 'react-native';
import { ERROR_MESSAGES, DEFAULT_ERROR_MESSAGES } from '../constants/errorMessages';
import { ERROR_CODES } from '../constants/errorCodes';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * API 응답 에러로부터 에러 정보를 추출합니다.
 * @param {Error} error - Axios 에러 객체
 * @returns {Object} - errorCode, message, status를 포함한 객체
 */
export const extractErrorInfo = error => {
  // 기본 에러 정보
  let errorInfo = {
    errorCode: null,
    message: DEFAULT_ERROR_MESSAGES.default,
    status: 500,
  };

  // Axios 에러 응답이 있는 경우
  if (error.response) {
    const { status, data } = error.response;

    // 상태 코드 저장
    errorInfo.status = status;

    // 서버에서 제공한 에러 코드와 메시지가 있는 경우
    if (data && data.errorCode) {
      errorInfo.errorCode = data.errorCode;
      errorInfo.message =
        data.message ||
        ERROR_MESSAGES[data.errorCode] ||
        DEFAULT_ERROR_MESSAGES[status] ||
        DEFAULT_ERROR_MESSAGES.default;
    } else {
      // 에러 코드는 없지만 상태 코드는 있는 경우
      errorInfo.message = DEFAULT_ERROR_MESSAGES[status] || DEFAULT_ERROR_MESSAGES.default;
    }
  } else if (error.request) {
    // 요청은 보냈지만 응답을 받지 못한 경우 (네트워크 문제 등)
    errorInfo.message = '서버에 연결할 수 없습니다. 네트워크 연결을 확인해주세요.';
  }

  return errorInfo;
};

/**
 * 에러를 처리하고 사용자에게 알림을 표시합니다.
 * @param {Error} error - 처리할 에러 객체
 * @param {Object} options - 추가 옵션
 * @param {boolean} options.showAlert - 알림 표시 여부 (기본값: true)
 * @param {boolean} options.logError - 콘솔에 에러 로깅 여부 (기본값: true)
 * @param {Function} options.onAuthError - 인증 에러 발생 시 호출될 콜백 함수
 * @returns {Object} 추출된 에러 정보
 */
export const handleError = (error, options = {}) => {
  const { showAlert = true, logError = true, onAuthError = null } = options;

  // 에러 정보 추출
  const errorInfo = extractErrorInfo(error);

  // 에러 로깅 (개발 환경에서 디버깅용)
  if (logError) {
    console.error('[Error Handler]', errorInfo);
    if (error.stack) {
      console.error('[Error Stack]', error.stack);
    }
  }

  // 인증 관련 에러 처리
  const isAuthError =
    errorInfo.errorCode &&
    (errorInfo.errorCode === ERROR_CODES.AUTH_01 ||
      errorInfo.errorCode === ERROR_CODES.AUTH_02 ||
      errorInfo.errorCode === ERROR_CODES.AUTH_06);

  // 특정 인증 에러가 발생하고 콜백이 제공된 경우 콜백 실행
  if (isAuthError && onAuthError) {
    onAuthError(errorInfo);
  }

  // 알림 표시
  if (showAlert) {
    Alert.alert('오류', errorInfo.message, [{ text: '확인', onPress: () => {} }], {
      cancelable: true,
    });
  }

  return errorInfo;
};

/**
 * 인증 에러 발생 시 로그아웃 처리를 수행합니다.
 * @returns {Promise<void>}
 */
export const handleAuthError = async () => {
  try {
    // AsyncStorage에서 인증 관련 데이터 제거
    await AsyncStorage.removeItem('accessToken');
    await AsyncStorage.removeItem('refreshToken');

    // 로그아웃 이벤트 발생 또는 로그인 화면으로 리다이렉션 로직
    // 필요에 따라 구현 (예: 네비게이션 또는 전역 상태 관리 사용)
    Alert.alert('세션 만료', '로그인이 만료되었습니다. 다시 로그인해주세요.', [
      { text: '확인', onPress: () => {} },
    ]);

    // 이벤트를 발생시키는 방식 (EventEmitter 사용 시)
    // global.eventEmitter.emit('logout');
  } catch (err) {
    console.error('로그아웃 처리 중 오류 발생:', err);
  }
};
