import * as TaskManager from 'expo-task-manager';
import AsyncStorage from '@react-native-async-storage/async-storage';
import GeofencingService from './GeofencingService';

const LOCATION_TRACKING = 'background-location-tracking';

TaskManager.defineTask(LOCATION_TRACKING, async ({ data, error }) => {
  if (error) {
    console.error('[BackgroundLocationTask] 오류:', error);
    return;
  }
  if (data) {
    const { locations } = data;
    const location = locations[0];
    if (location) {
      console.log('[BackgroundLocationTask] 위치 업데이트:', location);

      try {
        // AsyncStorage에서 기프티콘 불러오기
        const gifticonsStr = await AsyncStorage.getItem('USER_GIFTICONS');
        if (!gifticonsStr) {
          console.log('[AsyncStorage] 백그라운드에서 읽은 기프티콘: null');
          return;
        }

        // 기프티콘 파싱
        let gifticons;
        try {
          gifticons = JSON.parse(gifticonsStr);
        } catch (parseError) {
          console.error('[AsyncStorage] JSON 파싱 오류:', parseError);
          return;
        }

        if (!Array.isArray(gifticons)) {
          console.error('[AsyncStorage] 기프티콘 데이터가 배열이 아님');
          return;
        }

        // 매장 데이터 로드
        const storeDataStr = await AsyncStorage.getItem('GEOFENCE_STORE_DATA');
        if (!storeDataStr) {
          console.log('[BackgroundLocationTask] 저장된 매장 데이터 없음');
          return;
        }

        // 매장 데이터 파싱
        let storeData;
        try {
          storeData = JSON.parse(storeDataStr);
          console.log('[BackgroundLocationTask] 매장 데이터 로드:', storeData.length, '개 브랜드');
        } catch (error) {
          console.error('[BackgroundLocationTask] 매장 데이터 파싱 오류:', error);
          return;
        }

        // GeofencingService 인스턴스 생성 및 데이터 주입
        const geofencingService = new GeofencingService();
        geofencingService.userGifticons = gifticons;
        geofencingService.brandStores = storeData;

        // 지오펜싱 초기화
        await geofencingService.initGeofencing();

        // 지오펜스 설정 및 체크
        await geofencingService.setupGeofences(storeData);
        await geofencingService.checkGeofences(location);
      } catch (error) {
        console.error('[BackgroundLocationTask] 처리 중 오류:', error);
      }
    }
  }
});
