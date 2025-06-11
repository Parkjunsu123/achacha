import apiClient from '../api/apiClient';
import { API_CONFIG } from '../api/config';

export const mapGifticonService = {
  // 지도에서 사용 가능한 기프티콘 목록 조회
  getMapGifticons: async (params = {}) => {
    try {
      const response = await apiClient.get(API_CONFIG.ENDPOINTS.GET_GIFTICONS, {
        params: {
          scope: 'ALL',
          sort: 'EXPIRY_ASC',
          size: 100,
          ...params,
        },
      });

      return response.data;
    } catch (error) {
      console.error('[API] 지도용 기프티콘 목록 조회 실패:', error);
      return {
        gifticons: [],
        hasNextPage: false,
        nextPage: null,
      };
    }
  },
  getGiveAwayGifticons: async (params = {}) => {
    try {
      const response = await apiClient.get(API_CONFIG.ENDPOINTS.GET_GIFTICONS, {
        params: {
          scope: 'MY_BOX',
          type: 'PRODUCT',
          sort: 'EXPIRY_ASC',
          size: 100,
          ...params,
        },
      });

      return response.data;
    } catch (error) {
      console.error('[API] 지도용 기프티콘 목록 조회 실패:', error);
      return {
        gifticons: [],
        hasNextPage: false,
        nextPage: null,
      };
    }
  },
};
