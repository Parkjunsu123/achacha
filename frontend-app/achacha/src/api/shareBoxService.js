import apiClient from './apiClient';
import { API_CONFIG } from './config';

// 쉐어박스 목록 조회 API
export const fetchShareBoxes = async ({ sort = 'CREATED_DESC', page, size = 8 } = {}) => {
  const params = { sort, size };
  if (page) params.page = page;
  const response = await apiClient.get(API_CONFIG.ENDPOINTS.SHARE_BOXES, { params });

  // 방장 정보 포함여부 확인 및 데이터 가공
  // response.data.shareBoxes에 isOwner 속성이 없는 경우 추가
  if (response.data && response.data.shareBoxes && response.data.shareBoxes.length > 0) {
    const processedShareBoxes = response.data.shareBoxes.map(box => ({
      ...box,
      // 방장 이름 확인, 이미 있으면 유지, 없으면 기본값 설정
      ownerName: box.shareBoxUserName || '방장',
      // 본인이 방장인지 여부 확인, 이미 있으면 유지, 없으면 기본값 설정
      isOwner: box.isOwner !== undefined ? box.isOwner : false,
    }));
    return { ...response.data, shareBoxes: processedShareBoxes };
  }

  return response.data;
};

// 쉐어박스 생성 API
export const createShareBox = async shareBoxName => {
  const response = await apiClient.post(API_CONFIG.ENDPOINTS.CREATE_SHARE_BOX, {
    shareBoxName,
  });
  return response.data;
};

// 쉐어박스 참여(초대코드 입력) API
export const joinShareBox = async inviteCode => {
  const response = await apiClient.post(API_CONFIG.ENDPOINTS.JOIN_SHARE_BOX, {
    shareBoxInviteCode: inviteCode,
  });
  return response.data;
};

// 쉐어박스 나가기 API
export const leaveShareBox = async shareBoxId => {
  const res = await apiClient.delete(API_CONFIG.ENDPOINTS.LEAVE_SHARE_BOX(shareBoxId));
  return res.data;
};

export const fetchShareBoxSettings = async shareBoxId => {
  const response = await apiClient.get(API_CONFIG.ENDPOINTS.SHARE_BOX_SETTINGS(shareBoxId));
  return response.data;
};

export const fetchShareBoxUsers = async shareBoxId => {
  const response = await apiClient.get(API_CONFIG.ENDPOINTS.SHARE_BOX_USERS(shareBoxId));
  return response.data;
};

export const fetchAvailableGifticons = async ({
  shareBoxId,
  type, // 'PRODUCT' | 'AMOUNT' | undefined
  sort, // 'CREATED_DESC' | 'EXPIRY_ASC' | undefined
  page, // string | undefined
  size, // number | undefined
}) => {
  const params = {};
  if (type) params.type = type;
  if (sort) params.sort = sort;
  if (page) params.page = page;
  if (size) params.size = size;

  const res = await apiClient.get(API_CONFIG.ENDPOINTS.AVAILABLE_GIFTICONS(shareBoxId), { params });
  return res.data;
};

// 사용완료 기프티콘 목록 조회 API
export const fetchUsedGifticons = async ({
  shareBoxId,
  type,
  sort = 'USED_DESC',
  page,
  size,
} = {}) => {
  const params = {};
  if (type) params.type = type;
  if (sort) params.sort = sort;
  if (page) params.page = page;
  if (size) params.size = size;

  const res = await apiClient.get(API_CONFIG.ENDPOINTS.USED_GIFTICONS(shareBoxId), { params });
  return res.data;
};

// 쉐어박스 이름 변경 API
export const changeShareBoxName = async (shareBoxId, shareBoxName) => {
  const response = await apiClient.patch(API_CONFIG.ENDPOINTS.SHARE_BOX_NAME(shareBoxId), {
    shareBoxName,
  });
  return response.data;
};

// 멤버 입장 허용 여부 변경 API
export const changeShareBoxParticipationSetting = async (shareBoxId, allowParticipation) => {
  const response = await apiClient.patch(API_CONFIG.ENDPOINTS.PARTICIPATION_SETTING(shareBoxId), {
    shareBoxAllowParticipation: allowParticipation,
  });
  return response.data;
};

// 쉐어박스에 기프티콘 공유 API
export const shareGifticonToShareBox = async (shareBoxId, gifticonId) => {
  const response = await apiClient.post(
    API_CONFIG.ENDPOINTS.SHARE_BOX_GIFTICON(shareBoxId, gifticonId)
  );
  return response.data;
};

// 쉐어박스에서 기프티콘 공유 취소 API
export const cancelShareGifticon = async (shareBoxId, gifticonId) => {
  const response = await apiClient.delete(
    API_CONFIG.ENDPOINTS.SHARE_BOX_GIFTICON(shareBoxId, gifticonId)
  );
  return response.data;
};

// 쉐어박스 접근 가능 여부 확인 API
export const checkShareBoxAccessibility = async shareBoxId => {
  try {
    // 쉐어박스 설정 조회로 접근 가능 여부 확인
    const response = await apiClient.get(API_CONFIG.ENDPOINTS.SHARE_BOX_SETTINGS(shareBoxId));
    return response.status === 200;
  } catch (error) {
    console.error(`쉐어박스(${shareBoxId}) 접근 가능 여부 확인 실패:`, error);
    // 403 Forbidden, 404 Not Found 등의 오류는 접근 불가능으로 처리
    return false;
  }
};
