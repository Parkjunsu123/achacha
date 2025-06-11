// - API 클라이언트를 활용하여 실제 인증 API 호출 함수 구현
// - 로그인, 로그아웃, 토큰 갱신, 사용자 정보 조회 등의 함수 제공

import apiClient from '../api/apiClient';
import { API_CONFIG } from '../api/config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { decode as atob } from 'base-64'; // base-64 패키지 필요
import { getFcmToken } from './NotificationService'; // FCM 토큰 가져오기 import 추가
import { fetchUserById } from '../api/userInfo';

function parseJwt(token) {
  if (!token) return null;
  const base64Url = token.split('.')[1];
  if (!base64Url) return null;
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(
    atob(base64)
      .split('')
      .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
      .join('')
  );
  return JSON.parse(jsonPayload);
}

/**
 * 카카오 로그인 API 호출
 * @param {string} kakaoAccessToken - 카카오에서 받은 액세스 토큰
 * @returns {Promise} 서버 응답 데이터
 */
export const loginWithKakao = async kakaoAccessToken => {
  // FCM 토큰 가져오기
  const fcmToken = await getFcmToken();
  console.log('[KAKAO_LOGIN] FCM 토큰 로그인과 함께 서버로 전송:', fcmToken);

  // 1. 카카오 로그인 (FCM 토큰 포함)
  const response = await apiClient.post(API_CONFIG.ENDPOINTS.KAKAO_LOGIN, {
    kakaoAccessToken,
    fcmToken, // FCM 토큰 추가
  });
  console.log('[KAKAO_LOGIN] 로그인 성공 (FCM 토큰 서버에 저장 완료)');
  const { user, accessToken, refreshToken } = response.data;

  // accessToken, refreshToken을 먼저 저장
  await AsyncStorage.setItem('accessToken', accessToken);
  await AsyncStorage.setItem('refreshToken', refreshToken);

  // ✅ accessToken에서 userId 추출 및 저장
  const payload = parseJwt(accessToken);
  const userId = payload?.sub || payload?.userId || payload?.id;
  if (userId) {
    await AsyncStorage.setItem('userId', String(userId));
  }

  // BLE 토큰 요청 직전 accessToken 로그
  const accessTokenForBle = await AsyncStorage.getItem('accessToken');
  console.log('[BLE 요청 전 accessToken]', accessTokenForBle);

  // 2. BLE 토큰 요청
  const prevBleToken = await AsyncStorage.getItem('bleToken');
  const bleRes = await apiClient.post('/api/ble', {
    bleTokenValue: prevBleToken || undefined,
  });
  console.log('[BLE] /api/ble 응답 bleToken:', bleRes.data.bleToken);
  await AsyncStorage.setItem('bleToken', bleRes.data.bleToken);
  const savedBleToken = await AsyncStorage.getItem('bleToken');
  console.log('[BLE] AsyncStorage 저장된 bleToken:', savedBleToken);
  if (bleRes.data.bleToken !== savedBleToken) {
    console.warn('[BLE] 서버 응답값과 AsyncStorage 값이 다릅니다!', bleRes.data.bleToken, savedBleToken);
  }
  // 3. 통합 반환
  return { user, accessToken, refreshToken, bleToken: bleRes.data.bleToken };
};

/**
 * 토큰 갱신 API 호출
 * @param {string} refreshToken - 리프레시 토큰
 * @returns {Promise} 새로운 액세스 토큰과 리프레시 토큰
 */
export const refreshTokens = async refreshToken => {
  const response = await apiClient.post(API_CONFIG.ENDPOINTS.REFRESH_TOKEN, {
    refreshToken,
  });
  return response.data;
};

/**
 * 사용자 정보 조회 API 호출
 * @returns {Promise} 사용자 정보
 */
export const getUserProfile = async () => {
  const userId = await AsyncStorage.getItem('userId');
  if (!userId) throw new Error('userId가 없습니다.');
  return await fetchUserById(userId);
};

/**
 * 로그아웃 API 호출
 * @returns {Promise} 로그아웃 결과
 */
export const logout = async () => {
  const response = await apiClient.post(API_CONFIG.ENDPOINTS.LOGOUT);
  return response.data;
};
