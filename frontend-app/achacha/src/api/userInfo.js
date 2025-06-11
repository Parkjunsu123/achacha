import apiClient from './apiClient';
import { API_CONFIG } from './config';

// userId로 사용자 정보 조회
export const fetchUserById = async (userId) => {
  const response = await apiClient.get(API_CONFIG.ENDPOINTS.USER_INFO(userId));
  return response.data;
};

// 로그아웃 API
export const logout = async (refreshToken, fcmToken, bleToken) => {
  const response = await apiClient.post(API_CONFIG.ENDPOINTS.LOGOUT, {
    refreshToken,
    fcmToken,
    bleToken,
  });
  return response.data;
}; 