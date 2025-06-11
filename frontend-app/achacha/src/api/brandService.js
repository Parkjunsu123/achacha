import axios from 'axios';
import { BASE_URL, API_CONFIG, handleApiError, endpointUrl } from './config';
import authService from './authService';

const brandService = {
  // 브랜드 검색 API
  searchBrands: async keyword => {
    try {
      const token = await authService.getAccessToken();

      // 개발 환경에서 토큰이 없을 경우 임시 토큰 생성
      const authToken = token || authService.generateDevToken();

      // API URL 생성
      const apiUrl = endpointUrl(BASE_URL, API_CONFIG.ENDPOINTS.SEARCH_BRANDS);

      // 디버깅 로그 추가
      console.log('브랜드 검색 요청 URL:', apiUrl);
      console.log('브랜드 검색 키워드:', keyword);

      // API 호출
      const response = await axios.get(apiUrl, {
        headers: {
          ...API_CONFIG.headers,
          Authorization: `Bearer ${authToken}`,
        },
        params: {
          keyword,
        },
        timeout: API_CONFIG.TIMEOUT,
      });

      console.log('브랜드 검색 응답:', response.data);
      return response.data;
    } catch (error) {
      console.error('브랜드 검색 API 오류:', error);
      const errorInfo = handleApiError(error);

      // 에러 로깅 및 처리
      console.error(`브랜드 검색 실패: ${errorInfo.message}`);
      console.error('에러 상세 정보:', {
        url: endpointUrl(BASE_URL, API_CONFIG.ENDPOINTS.SEARCH_BRANDS),
        keyword,
        error: error.response ? error.response.data : error.message,
      });

      // 에러가 발생했을 때 빈 배열을 반환하여 앱이 크래시되지 않도록 합니다.
      return [];
    }
  },
};

export default brandService;
