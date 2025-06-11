// src/store/gifticonStore.js
import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { mapGifticonService } from '../services/mapGifticonService';

const useGifticonListStore = create((set, get) => ({
  gifticons: [],
  isLoading: false,
  error: null,
  justRemovedGifticonId: null, // 방금 삭제된 기프티콘 ID를 추적하기 위한 플래그

  // 액션
  fetchGifticons: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await mapGifticonService.getMapGifticons();
      const gifticonsArray = response.gifticons || [];

      // 상태 업데이트
      set({ gifticons: gifticonsArray, isLoading: false });

      // AsyncStorage에도 저장 (백그라운드용)
      await AsyncStorage.setItem('USER_GIFTICONS', JSON.stringify(gifticonsArray));

      return response;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      return null;
    }
  },

  // 기프티콘 제거 (뿌리기 후)
  removeGifticon: async gifticonId => {
    // 현재 목록에서 해당 기프티콘 제거
    const updatedGifticons = get().gifticons.filter(gifticon => gifticon.gifticonId !== gifticonId);

    // 상태 업데이트 및 플래그 설정
    set({ gifticons: updatedGifticons, justRemovedGifticonId: gifticonId });

    // AsyncStorage 업데이트
    await AsyncStorage.setItem('USER_GIFTICONS', JSON.stringify(updatedGifticons));
  },

  // justRemovedGifticonId 플래그를 초기화하는 액션
  clearJustRemovedFlag: () => {
    set({ justRemovedGifticonId: null });
  },

  // AsyncStorage에서 기존 데이터 복원
  restoreGifticons: async () => {
    try {
      const storedData = await AsyncStorage.getItem('USER_GIFTICONS');
      if (storedData) {
        const gifticons = JSON.parse(storedData);
        set({ gifticons });
      }
    } catch (error) {
      console.error('기프티콘 복원 실패:', error);
    }
  },

  // 브랜드 정보 추출 유틸리티
  getUniqueBrands: () => {
    const { gifticons } = get();
    const uniqueBrands = gifticons.reduce((acc, gifticon) => {
      if (!acc[gifticon.brandId]) {
        acc[gifticon.brandId] = {
          brandId: gifticon.brandId,
          brandName: gifticon.brandName,
        };
      }
      return acc;
    }, {});

    return Object.values(uniqueBrands);
  },
}));

export default useGifticonListStore;
