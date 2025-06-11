// - Axios 인스턴스를 기반으로 구현
// - 요청 인터셉터: 모든 요청에 토큰 자동 첨부
// - 응답 인터셉터: 토큰 만료 시 자동 갱신 처리

import axios from 'axios';
import { API_CONFIG } from './config'; // 설정 파일 import 경로 변경
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ERROR_CODES } from '../constants/errorCodes';
import NetInfo from '@react-native-community/netinfo';

// 네트워크 연결 체크 함수
const checkNetworkConnection = async () => {
  const netInfo = await NetInfo.fetch();
  return netInfo.isConnected && netInfo.isInternetReachable;
};

// Axios 인스턴스 생성
const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL, // 설정 파일에서 Base URL 가져오기
  timeout: API_CONFIG.TIMEOUT, // 설정 파일에서 Timeout 가져오기
  headers: {
    'Content-Type': 'application/json',
    // 필요에 따라 다른 기본 헤더를 여기에 추가할 수 있습니다.
    // 예: 'X-Custom-Header': 'someValue'
  },
});

// 토큰 갱신 중인지 여부를 추적하는 변수
let isRefreshing = false;
// 토큰 갱신 대기 중인 요청들의 배열
let refreshSubscribers = [];

// 토큰 갱신 후 실행할 콜백 함수 등록
const subscribeTokenRefresh = callback => {
  refreshSubscribers.push(callback);
};

// 등록된 모든 콜백 함수 실행 (토큰 갱신 완료 시)
const onRefreshed = newToken => {
  refreshSubscribers.forEach(callback => callback(newToken));
  refreshSubscribers = [];
};

// 요청 인터셉터: 모든 요청에 인증 토큰을 자동으로 추가
apiClient.interceptors.request.use(
  async config => {
    try {
      // 네트워크 연결 체크
      const isConnected = await checkNetworkConnection();
      if (!isConnected) {
        console.error('네트워크 연결이 없습니다. 요청을 중단합니다.');
        return Promise.reject(new Error('네트워크 연결이 없습니다.'));
      }

      // 토큰 설정
      const accessToken = await AsyncStorage.getItem('accessToken');
      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }

      // FormData 요청인 경우 로그 간소화
      if (config.data instanceof FormData) {
      } else if (config.data) {
        // 요청 데이터가 너무 큰 경우 로그 길이 제한
        const dataStr = JSON.stringify(config.data);
      }
    } catch (e) {}
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터: 토큰 만료 시 자동 갱신 처리
apiClient.interceptors.response.use(
  response => {
    return response;
  },
  async error => {
    const originalRequest = error.config;

    // 401 에러이고, 토큰 만료 에러이며, 아직 재시도하지 않았을 경우
    if (
      error.response &&
      error.response.status === 401 &&
      error.response.data &&
      error.response.data.errorCode === ERROR_CODES.AUTH_02 &&
      !originalRequest._retry
    ) {
      // 토큰 갱신 중이 아니라면 갱신 시작
      if (!isRefreshing) {
        isRefreshing = true;
        originalRequest._retry = true;

        try {
          // 리프레시 토큰으로 새 액세스 토큰 요청
          const refreshToken = await AsyncStorage.getItem('refreshToken');
          const response = await axios.post(
            `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.REFRESH_TOKEN}`,
            { refreshToken }
          );

          const { accessToken, newRefreshToken } = response.data;

          // 새 토큰 저장
          await AsyncStorage.setItem('accessToken', accessToken);
          if (newRefreshToken) {
            await AsyncStorage.setItem('refreshToken', newRefreshToken);
          }

          // 헤더 업데이트
          apiClient.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;

          // 대기 중인 요청들 처리
          onRefreshed(accessToken);
          isRefreshing = false;

          // 원래 요청 재시도
          return apiClient(originalRequest);
        } catch (refreshError) {
          // 리프레시 토큰도 만료된 경우 로그아웃 처리
          isRefreshing = false;

          // AsyncStorage에서 모든 인증 관련 데이터 제거
          await AsyncStorage.removeItem('accessToken');
          await AsyncStorage.removeItem('refreshToken');

          // 로그인 화면으로 이동 로직 (필요 시 네비게이션 혹은 이벤트 발생)
          // RN 환경에서는 이벤트 발생 방식이 조금 다름
          // 전역 이벤트 발행 (EventEmitter 사용시)
          // global.eventEmitter.emit('logout');

          return Promise.reject(refreshError);
        }
      } else {
        // 이미 토큰 갱신 중이라면 갱신된 토큰으로 요청 재시도를 예약
        return new Promise(resolve => {
          subscribeTokenRefresh(newToken => {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            resolve(apiClient(originalRequest));
          });
        });
      }
    }

    // 다른 종류의 에러는 그대로 반환
    return Promise.reject(error);
  }
);

export default apiClient;
