import apiClient from './apiClient';
import { API_CONFIG } from './config';
import { GIFTICON_ERRORS } from '../constants/errorCodes';
import { GIFTICON_ERROR_MESSAGES } from '../constants/errorMessages';

// 선물 템플릿 목록 조회 API
export const getPresentTemplates = async () => {
  const res = await apiClient.get(API_CONFIG.ENDPOINTS.PRESENT_TEMPLATES);
  return res.data;
};

// 템플릿 색상 팔레트 조회 API
export const getPresentTemplateColors = async (templateId) => {
  const res = await apiClient.get(API_CONFIG.ENDPOINTS.PRESENT_TEMPLATE_COLORS(templateId));
  return res.data;
};

// 템플릿 상세 정보 조회 API
export const getPresentTemplateDetail = async (templateId) => {
  const res = await apiClient.get(API_CONFIG.ENDPOINTS.PRESENT_TEMPLATE_DETAIL(templateId));
  return res.data;
};

// 기프티콘 선물하기 API
export const presentGifticon = async (gifticonId, presentTemplateId, colorPaletteId, message) => {
  const body = {
    presentTemplateId,
    colorPaletteId: colorPaletteId ?? null,
    message,
  };
  const res = await apiClient.post(API_CONFIG.ENDPOINTS.PRESENT_GIFTICON(gifticonId), body);
  return res.data;
};

export const presentCancelGifticon = async (gifticonId) => {
  try {
    const res = await apiClient.delete(API_CONFIG.ENDPOINTS.PRESENT_CANCEL(gifticonId));
    console.log(res.data); // response body 콘솔 출력
    return res.data;
  } catch (error) {
    if (error.response && error.response.data && error.response.data.errorCode === GIFTICON_ERRORS.GIFTICON_002) {
      console.log(GIFTICON_ERROR_MESSAGES.GIFTICON_002); // 에러 메시지 콘솔 출력
    } else {
      console.log(error);
    }
    throw error;
  }
};
// 향후 추가될 엔드포인트 예시
// export const createPresent = async (params) => { ... };
// export const getPresentDetail = async (presentId) => { ... }; 