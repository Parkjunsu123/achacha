import { registerRootComponent } from 'expo';
import App from './App';
import { AppRegistry } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import GeofencingService from './src/services/GeofencingService';
import Geofencing from '@rn-bridge/react-native-geofencing';

// 백그라운드 위치 업데이트 헤드리스 작업 등록
AppRegistry.registerHeadlessTask('BACKGROUND_LOCATION_UPDATE', async taskData => {
  console.log('[HeadlessJS] 백그라운드 위치 업데이트 시작', taskData);

  try {
    // 현재 위치 가져오기
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    // 마지막 체크 위치와 비교
    let lastCheckedLocation = null;
    let shouldCheck = true;

    try {
      const lastCheckedStr = await AsyncStorage.getItem('LAST_GEOFENCE_CHECK_LOCATION');
      if (lastCheckedStr) {
        lastCheckedLocation = JSON.parse(lastCheckedStr);

        // 거리 계산 함수
        const calculateDistance = (lat1, lon1, lat2, lon2) => {
          const R = 6371e3; // 지구 반지름 (미터)
          const φ1 = (lat1 * Math.PI) / 180;
          const φ2 = (lat2 * Math.PI) / 180;
          const Δφ = ((lat2 - lat1) * Math.PI) / 180;
          const Δλ = ((lon2 - lon1) * Math.PI) / 180;

          const a =
            Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
          return R * c;
        };

        const distance = calculateDistance(
          lastCheckedLocation.latitude,
          lastCheckedLocation.longitude,
          location.coords.latitude,
          location.coords.longitude
        );

        console.log(`[HeadlessJS] 마지막 체크 이후 이동 거리: ${distance.toFixed(1)}m`);

        if (distance < 50) {
          console.log('[HeadlessJS] 이동 거리가 50m 미만으로 체크 생략');
          shouldCheck = false;
        }
      }
    } catch (error) {
      console.error('[HeadlessJS] 마지막 위치 확인 오류:', error);
    }

    if (shouldCheck) {
      // 현재 위치 저장
      await AsyncStorage.setItem(
        'LAST_GEOFENCE_CHECK_LOCATION',
        JSON.stringify({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          timestamp: new Date().toISOString(),
        })
      );

      // 데이터 로드 및 처리
      const gifticonsStr = await AsyncStorage.getItem('USER_GIFTICONS');
      const storeDataStr = await AsyncStorage.getItem('GEOFENCE_STORE_DATA');

      if (!gifticonsStr || !storeDataStr) {
        console.log('[HeadlessJS] 필요한 데이터 없음');
        return;
      }

      const gifticons = JSON.parse(gifticonsStr);
      const storeData = JSON.parse(storeDataStr);

      // 지오펜싱 서비스 초기화 및 체크
      const geofencingService = new GeofencingService();
      geofencingService.userGifticons = gifticons;
      geofencingService.brandStores = storeData;

      await geofencingService.initGeofencing();
      await geofencingService.setupGeofences(storeData);
      await geofencingService.checkGeofences(location);

      console.log('[HeadlessJS] 지오펜스 체크 완료');
    }
  } catch (error) {
    console.error('[HeadlessJS] 백그라운드 처리 오류:', error);
  }

  return Promise.resolve();
});

// 기존 루트 컴포넌트 등록 코드 유지
registerRootComponent(App);
