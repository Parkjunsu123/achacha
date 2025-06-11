// locationAlarmService.js
import { NativeModules, Platform } from 'react-native';
import * as TaskManager from 'expo-task-manager';
import * as Location from 'expo-location';

const { LocationAlarmModule } = NativeModules;

const LOCATION_TRACKING = 'background-location-tracking';

export default {
  /**
   * 위치 권한 요청
   * @returns {Promise<boolean>} 권한 부여 여부
   */
  requestLocationPermissions: async () => {
    try {
      // 포그라운드 위치 권한 요청
      const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();

      if (foregroundStatus !== 'granted') {
        console.log('[LocationAlarmService] 포그라운드 위치 권한이 거부됨');
        return false;
      }

      // 백그라운드 위치 권한 요청 (Android만)
      if (Platform.OS === 'android') {
        const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();

        if (backgroundStatus !== 'granted') {
          console.log('[LocationAlarmService] 백그라운드 위치 권한이 거부됨');
          return false;
        }
      }

      console.log('[LocationAlarmService] 위치 권한 획득 성공');
      return true;
    } catch (error) {
      console.error('[LocationAlarmService] 위치 권한 요청 오류:', error);
      return false;
    }
  },

  /**
   * 위치 추적 태스크 시작
   * @returns {Promise<boolean>} 성공 여부
   */
  startLocationTracking: async () => {
    try {
      // 이미 실행 중인지 확인
      const hasTracking = await Location.hasStartedLocationUpdatesAsync(LOCATION_TRACKING).catch(
        () => false
      );
      if (hasTracking) {
        console.log('[LocationAlarmService] 이미 위치 추적 실행 중');
        return true;
      }

      // 권한 확인
      const hasPermission = await Location.getForegroundPermissionsAsync();
      if (!hasPermission.granted) {
        console.log('[LocationAlarmService] 위치 권한 없음');
        return false;
      }

      // 위치 추적 시작
      await Location.startLocationUpdatesAsync(LOCATION_TRACKING, {
        accuracy: Location.Accuracy.Balanced,
        timeInterval: 300000, // 5분
        distanceInterval: 100, // 100m마다
        foregroundService: {
          notificationTitle: '위치 추적 중',
          notificationBody: '주변 매장 알림 서비스가 실행 중입니다',
        },
        pausesUpdatesAutomatically: false,
      });

      console.log('[LocationAlarmService] 위치 추적 시작됨');
      return true;
    } catch (error) {
      console.error('[LocationAlarmService] 위치 추적 시작 오류:', error);
      return false;
    }
  },

  /**
   * 백그라운드 위치 알람 시작
   * @returns {Promise<boolean>} 성공 여부
   */
  startLocationAlarm: async () => {
    if (Platform.OS === 'android' && LocationAlarmModule) {
      try {
        return await LocationAlarmModule.startLocationAlarm();
      } catch (error) {
        console.error('[LocationAlarmService] 위치 알람 시작 실패:', error);
        return false;
      }
    }
    return false;
  },

  /**
   * 백그라운드 위치 알람 중지
   * @returns {Promise<boolean>} 성공 여부
   */
  stopLocationAlarm: async () => {
    if (Platform.OS === 'android' && LocationAlarmModule) {
      try {
        return await LocationAlarmModule.stopLocationAlarm();
      } catch (error) {
        console.error('[LocationAlarmService] 위치 알람 중지 실패:', error);
        return false;
      }
    }
    return false;
  },

  /**
   * 백그라운드 위치 알람 실행 중인지 확인
   * @returns {Promise<boolean>} 실행 중 여부
   */
  isLocationAlarmRunning: async () => {
    if (Platform.OS === 'android' && LocationAlarmModule) {
      try {
        return await LocationAlarmModule.isLocationAlarmRunning();
      } catch (error) {
        console.error('[LocationAlarmService] 알람 상태 확인 실패:', error);
        return false;
      }
    }
    return false;
  },

  /**
   * 위치 추적 및 알람 모두 시작
   * @returns {Promise<boolean>} 성공 여부
   */
  startAllLocationServices: async () => {
    try {
      // 위치 권한 확인
      const hasPermission = await exports.default.requestLocationPermissions();
      if (!hasPermission) {
        return false;
      }

      // Expo 위치 추적 시작
      await exports.default.startLocationTracking();

      // 네이티브 알람 시작 (Not Running 상태에서도 동작)
      if (Platform.OS === 'android') {
        await exports.default.startLocationAlarm();
      }

      return true;
    } catch (error) {
      console.error('[LocationAlarmService] 위치 서비스 시작 실패:', error);
      return false;
    }
  },

  /**
   * 위치 추적 및 알람 모두 중지
   * @returns {Promise<boolean>} 성공 여부
   */
  stopAllLocationServices: async () => {
    try {
      // Expo 위치 추적 중지
      if (await Location.hasStartedLocationUpdatesAsync(LOCATION_TRACKING).catch(() => false)) {
        await Location.stopLocationUpdatesAsync(LOCATION_TRACKING);
      }

      // 네이티브 알람 중지
      if (Platform.OS === 'android') {
        await exports.default.stopLocationAlarm();
      }

      return true;
    } catch (error) {
      console.error('[LocationAlarmService] 위치 서비스 중지 실패:', error);
      return false;
    }
  },
};
