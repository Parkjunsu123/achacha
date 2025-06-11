import apiClient from '../api/apiClient';
import { API_CONFIG } from '../api/config';

// 지오펜싱 기반 알림 관련 API 서비스
export const geoNotificationService = {
  // 지오펜싱 알림 요청 API
  requestGeoNotification: async gifticonId => {
    if (!gifticonId) {
      throw new Error('gifticonId가 필요합니다.');
    }
    try {
      const response = await apiClient.post(API_CONFIG.ENDPOINTS.GEO_NOTIFICATIONS, { gifticonId });
      return response.data;
    } catch (error) {
      console.error(
        `[geoNotificationService] requestGeoNotification 에러: gifticonId: ${gifticonId}`,
        error
      );
      throw error;
    }
  },
};

export default geoNotificationService;
