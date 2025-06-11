import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import notificationService from '../api/notificationService';

// 알림 타입 enum (API와 일치)
const NOTIFICATION_TYPES = {
  LOCATION_BASED: 'LOCATION_BASED', // 근접 매장 알림
  EXPIRY_DATE: 'EXPIRY_DATE', // 유효기간 만료 알림
  RECEIVE_GIFTICON: 'RECEIVE_GIFTICON', // 선물 뿌리기 알림
  USAGE_COMPLETE: 'USAGE_COMPLETE', // 사용완료 여부 알림
  SHAREBOX_GIFTICON: 'SHAREBOX_GIFTICON', // 쉐어박스 기프티콘 등록 알림
  SHAREBOX_USAGE_COMPLETE: 'SHAREBOX_USAGE_COMPLETE', // 쉐어박스 기프티콘 사용 알림
  SHAREBOX_MEMBER_JOIN: 'SHAREBOX_MEMBER_JOIN', // 쉐어박스 멤버 참여 알림
  SHAREBOX_DELETED: 'SHAREBOX_DELETED', // 쉐어박스 그룹 삭제 알림
};

// 알림 주기 enum (API와 일치)
const EXPIRATION_CYCLES = {
  ONE_DAY: 'ONE_DAY', // 1일
  TWO_DAYS: 'TWO_DAYS', // 2일
  THREE_DAYS: 'THREE_DAYS', // 3일
  ONE_WEEK: 'ONE_WEEK', // 7일
  ONE_MONTH: 'ONE_MONTH', // 30일
  TWO_MONTHS: 'TWO_MONTHS', // 60일
  THREE_MONTHS: 'THREE_MONTHS', // 90일
};

// 마커 값에 따른 알림 주기 매핑
const MARKER_TO_CYCLE = {
  0: EXPIRATION_CYCLES.ONE_DAY, // 당일 또는 1일
  1: EXPIRATION_CYCLES.ONE_DAY, // 1일
  2: EXPIRATION_CYCLES.TWO_DAYS, // 2일
  3: EXPIRATION_CYCLES.THREE_DAYS, // 3일
  7: EXPIRATION_CYCLES.ONE_WEEK, // 7일
  30: EXPIRATION_CYCLES.ONE_MONTH, // 30일
  60: EXPIRATION_CYCLES.TWO_MONTHS, // 60일
  90: EXPIRATION_CYCLES.THREE_MONTHS, // 90일
};

// 알림 주기에 따른 마커 값 매핑
const CYCLE_TO_MARKER = {
  [EXPIRATION_CYCLES.ONE_DAY]: 1,
  [EXPIRATION_CYCLES.TWO_DAYS]: 2,
  [EXPIRATION_CYCLES.THREE_DAYS]: 3,
  [EXPIRATION_CYCLES.ONE_WEEK]: 7,
  [EXPIRATION_CYCLES.ONE_MONTH]: 30,
  [EXPIRATION_CYCLES.TWO_MONTHS]: 60,
  [EXPIRATION_CYCLES.THREE_MONTHS]: 90,
};

/**
 * 알림 설정 관련 상태를 관리하는 Zustand 스토어
 */
const useNotificationStore = create((set, get) => ({
  // 알림 설정 상태
  expiryNotification: false, // 유효기간 만료 알림
  giftSharingNotification: false, // 선물 뿌리기 알림
  nearbyStoreNotification: false, // 근접 매장 알림
  expiryNotificationInterval: 7, // 알림 주기 (기본값 7일)
  usageCompletionNotification: false, // 사용완료 여부 알림
  shareboxGiftRegistration: false, // 쉐어박스 기프티콘 등록 알림
  shareboxGiftUsage: false, // 쉐어박스 기프티콘 사용 알림
  shareboxMemberJoin: false, // 쉐어박스 멤버 참여 알림
  shareboxGroupDelete: false, // 쉐어박스 그룹 삭제 알림

  // 로딩 상태
  isLoading: false,
  error: null,

  // 상태 변경 함수들
  setExpiryNotification: enabled => set({ expiryNotification: enabled }),
  setGiftSharingNotification: enabled => set({ giftSharingNotification: enabled }),
  setNearbyStoreNotification: enabled => set({ nearbyStoreNotification: enabled }),
  setExpiryNotificationInterval: interval => set({ expiryNotificationInterval: interval }),
  setUsageCompletionNotification: enabled => set({ usageCompletionNotification: enabled }),
  setShareboxGiftRegistration: enabled => set({ shareboxGiftRegistration: enabled }),
  setShareboxGiftUsage: enabled => set({ shareboxGiftUsage: enabled }),
  setShareboxMemberJoin: enabled => set({ shareboxMemberJoin: enabled }),
  setShareboxGroupDelete: enabled => set({ shareboxGroupDelete: enabled }),

  // 로딩 상태 설정
  setLoading: loading => set({ isLoading: loading, error: loading ? null : get().error }),
  setError: error => set({ error, isLoading: false }),

  // 서버에서 알림 설정 불러오기
  fetchNotificationSettings: async () => {
    set({ isLoading: true, error: null });
    try {
      console.log('[알림설정 스토어] 알림 설정 조회 시작');
      const settings = await notificationService.getNotificationSettings();
      console.log('[알림설정 스토어] 알림 설정 조회 결과:', JSON.stringify(settings, null, 2));

      const newState = {};

      // 각 알림 타입별 설정 값을 상태에 적용
      settings.forEach(setting => {
        switch (setting.notificationType) {
          case NOTIFICATION_TYPES.LOCATION_BASED:
            console.log('[알림설정 스토어] 근접 매장 알림 설정:', setting.isEnabled);
            newState.nearbyStoreNotification = setting.isEnabled;
            break;
          case NOTIFICATION_TYPES.EXPIRY_DATE:
            console.log('[알림설정 스토어] 유효기간 만료 알림 설정:', setting.isEnabled);
            console.log('[알림설정 스토어] 알림 주기:', setting.expirationCycle);
            newState.expiryNotification = setting.isEnabled;
            if (
              setting.isEnabled &&
              setting.expirationCycle &&
              CYCLE_TO_MARKER[setting.expirationCycle]
            ) {
              const markerValue = CYCLE_TO_MARKER[setting.expirationCycle];
              console.log(
                '[알림설정 스토어] 알림 주기 마커값으로 변환:',
                setting.expirationCycle,
                ' -> ',
                markerValue
              );
              newState.expiryNotificationInterval = markerValue;

              // 서버 값을 로컬에도 저장 (동기화)
              try {
                AsyncStorage.setItem('expiryNotificationInterval', String(markerValue));
                console.log('[알림설정 스토어] 서버 설정값 로컬 저장 완료:', markerValue);
              } catch (storageError) {
                console.error('[알림설정 스토어] 로컬 저장 실패:', storageError);
              }
            }
            break;
          case NOTIFICATION_TYPES.RECEIVE_GIFTICON:
            console.log('[알림설정 스토어] 선물 뿌리기 알림 설정:', setting.isEnabled);
            newState.giftSharingNotification = setting.isEnabled;
            break;
          case NOTIFICATION_TYPES.USAGE_COMPLETE:
            console.log('[알림설정 스토어] 사용완료 여부 알림 설정:', setting.isEnabled);
            newState.usageCompletionNotification = setting.isEnabled;
            break;
          case NOTIFICATION_TYPES.SHAREBOX_GIFTICON:
            console.log('[알림설정 스토어] 쉐어박스 기프티콘 등록 알림 설정:', setting.isEnabled);
            newState.shareboxGiftRegistration = setting.isEnabled;
            break;
          case NOTIFICATION_TYPES.SHAREBOX_USAGE_COMPLETE:
            console.log('[알림설정 스토어] 쉐어박스 기프티콘 사용 알림 설정:', setting.isEnabled);
            newState.shareboxGiftUsage = setting.isEnabled;
            break;
          case NOTIFICATION_TYPES.SHAREBOX_MEMBER_JOIN:
            console.log('[알림설정 스토어] 쉐어박스 멤버 참여 알림 설정:', setting.isEnabled);
            newState.shareboxMemberJoin = setting.isEnabled;
            break;
          case NOTIFICATION_TYPES.SHAREBOX_DELETED:
            console.log('[알림설정 스토어] 쉐어박스 그룹 삭제 알림 설정:', setting.isEnabled);
            newState.shareboxGroupDelete = setting.isEnabled;
            break;
          default:
            console.log(`[알림설정 스토어] 알 수 없는 알림 타입: ${setting.notificationType}`);
        }
      });

      // 상태 업데이트
      set({ ...newState, isLoading: false, error: null });
      return true;
    } catch (error) {
      console.error('[알림설정 스토어] 알림 설정 조회 실패:', error);
      set({ isLoading: false, error: error.message || '알림 설정을 불러오는데 실패했습니다.' });
      return false;
    }
  },

  // 알림 타입별 활성화/비활성화 설정
  updateNotificationTypeStatus: async (type, enabled) => {
    set({ isLoading: true, error: null });
    try {
      console.log(`[알림설정 스토어] ${type} 알림 상태 변경 요청:`, enabled);

      const result = await notificationService.updateNotificationTypeStatus(type, enabled);
      console.log(`[알림설정 스토어] ${type} 알림 상태 변경 성공:`, result);

      // 알림 타입에 따라 상태 업데이트
      switch (type) {
        case NOTIFICATION_TYPES.LOCATION_BASED:
          set({ nearbyStoreNotification: enabled });
          break;
        case NOTIFICATION_TYPES.EXPIRY_DATE:
          set({ expiryNotification: enabled });
          break;
        case NOTIFICATION_TYPES.RECEIVE_GIFTICON:
          set({ giftSharingNotification: enabled });
          break;
        case NOTIFICATION_TYPES.USAGE_COMPLETE:
          set({ usageCompletionNotification: enabled });
          break;
        case NOTIFICATION_TYPES.SHAREBOX_GIFTICON:
          set({ shareboxGiftRegistration: enabled });
          break;
        case NOTIFICATION_TYPES.SHAREBOX_USAGE_COMPLETE:
          set({ shareboxGiftUsage: enabled });
          break;
        case NOTIFICATION_TYPES.SHAREBOX_MEMBER_JOIN:
          set({ shareboxMemberJoin: enabled });
          break;
        case NOTIFICATION_TYPES.SHAREBOX_DELETED:
          set({ shareboxGroupDelete: enabled });
          break;
      }

      set({ isLoading: false, error: null });
      return true;
    } catch (error) {
      console.error(`[알림설정 스토어] ${type} 알림 상태 변경 실패:`, error);
      set({
        isLoading: false,
        error: error.message || '알림 설정 변경에 실패했습니다.',
      });
      return false;
    }
  },

  // 유효기간 만료 알림 주기 설정
  updateExpirationCycle: async value => {
    set({ isLoading: true, error: null });
    try {
      const cycleValue = MARKER_TO_CYCLE[value];
      if (!cycleValue) {
        throw new Error('유효하지 않은 알림 주기 값입니다.');
      }

      console.log('[알림설정 스토어] 알림 주기 변경 요청:', value, '(', cycleValue, ')');

      const result = await notificationService.updateExpirationCycle(cycleValue);
      console.log('[알림설정 스토어] 알림 주기 변경 성공:', result);

      // 성공 시 상태 및 로컬 저장소 업데이트
      set({ expiryNotificationInterval: value, isLoading: false, error: null });

      try {
        await AsyncStorage.setItem('expiryNotificationInterval', String(value));
        console.log('[알림설정 스토어] 알림 주기 로컬 저장 완료:', value);
      } catch (storageError) {
        console.error('[알림설정 스토어] 알림 주기 로컬 저장 실패:', storageError);
      }

      return true;
    } catch (error) {
      console.error('[알림설정 스토어] 알림 주기 변경 실패:', error);

      // 오류 응답 상세 정보 출력
      if (error.response) {
        console.error(
          '[알림설정 스토어] 서버 응답:',
          error.response.status,
          JSON.stringify(error.response.data)
        );
      }

      set({
        isLoading: false,
        error: error.message || '알림 주기 설정에 실패했습니다.',
      });
      return false;
    }
  },

  // 앱 시작 시 로컬 저장소에서 알림 주기 로드
  loadLocalExpirationCycle: async () => {
    try {
      console.log('[알림설정 스토어] 로컬 설정 로드 시도');
      const savedInterval = await AsyncStorage.getItem('expiryNotificationInterval');
      console.log('[알림설정 스토어] 로컬에서 알림 주기 불러옴:', savedInterval);

      if (savedInterval) {
        const parsedValue = Number(savedInterval);
        if (!isNaN(parsedValue) && MARKER_TO_CYCLE[parsedValue]) {
          console.log('[알림설정 스토어] 유효한 값, 상태 업데이트:', parsedValue);
          set({ expiryNotificationInterval: parsedValue });
          return parsedValue;
        } else {
          console.error('[알림설정 스토어] 유효하지 않은 값:', savedInterval);
        }
      }
      return get().expiryNotificationInterval;
    } catch (error) {
      console.error('[알림설정 스토어] 로컬 알림 주기 불러오기 실패:', error);
      return get().expiryNotificationInterval;
    }
  },

  // 스토어 getter 함수
  getNotificationTypes: () => NOTIFICATION_TYPES,
  getExpirationCycles: () => EXPIRATION_CYCLES,
  getMarkerToCycle: () => MARKER_TO_CYCLE,
  getCycleToMarker: () => CYCLE_TO_MARKER,
}));

export default useNotificationStore;
