import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG } from './config';

/**
 * 인증 관련 기능을 제공하는 서비스
 */
const authService = {
  /**
   * AsyncStorage에서 액세스 토큰을 가져옵니다.
   * @returns {Promise<string|null>} 액세스 토큰
   */
  getAccessToken: async () => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      return token;
    } catch (error) {
      console.error('토큰 가져오기 실패:', error);
      return null;
    }
  },

  /**
   * 개발 환경에서 사용할 임시 토큰을 생성합니다.
   * @returns {string} 임시 토큰
   */
  generateDevToken: () => {
    console.warn('개발용 임시 토큰 사용 중 - 실제 환경에서는 사용하지 마세요');
    return 'dev-temp-token-' + Math.random().toString(36).substring(2, 15);
  },

  /**
   * 사용자가 로그인되어 있는지 확인합니다.
   * @returns {Promise<boolean>} 로그인 상태
   */
  isAuthenticated: async () => {
    const token = await authService.getAccessToken();
    return !!token;
  },
};

export default authService;
