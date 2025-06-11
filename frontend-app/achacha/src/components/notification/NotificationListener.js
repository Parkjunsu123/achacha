import React, { useEffect } from 'react';
import { NativeEventEmitter, NativeModules, Platform } from 'react-native';
import toastService from '../../utils/toastService';

/**
 * 네이티브 모듈에서 FCM 메시지 이벤트를 수신하여 토스트 메시지로 표시하는 컴포넌트
 * App.js에 포함하여 사용
 */
const NotificationListener = () => {
  useEffect(() => {
    // 컴포넌트 마운트 시 로그
    console.log('[알림 리스너] 초기화 중...');

    // Android 플랫폼에서만 처리
    if (Platform.OS === 'android') {
      // NativeModules에서 NotificationModule 확인
      const { NotificationModule } = NativeModules;

      if (NotificationModule) {
        console.log('[알림 리스너] NotificationModule이 등록되어 있습니다.');

        // 이벤트 이미터 생성
        const notificationEmitter = new NativeEventEmitter(NotificationModule);

        // FCM 메시지 수신 이벤트 리스너 등록
        const subscription = notificationEmitter.addListener(
          'fcmMessageReceived',
          remoteMessage => {
            console.log('[알림 리스너] FCM 메시지 수신:', remoteMessage);

            try {
              // 커스텀 토스트 메시지로 알림 표시
              if (remoteMessage) {
                toastService.showNotificationToast(remoteMessage);
                console.log('[알림 리스너] 포그라운드 알림 토스트 메시지로 표시됨');
              }
            } catch (error) {
              console.error('[알림 리스너] 토스트 표시 중 오류:', error);
            }
          }
        );

        // 컴포넌트 언마운트 시 리스너 제거
        return () => {
          subscription.remove();
          console.log('[알림 리스너] FCM 메시지 수신 리스너가 제거되었습니다.');

          // 네이티브 모듈에도 알림
          if (NotificationModule && NotificationModule.removeListeners) {
            NotificationModule.removeListeners(1);
          }
        };
      } else {
        console.warn('[알림 리스너] NotificationModule을 찾을 수 없습니다.');
      }
    } else {
      // iOS에서는 다른 처리 방식 사용
      console.log('[알림 리스너] iOS 플랫폼에서는 다른 알림 처리 방식을 사용합니다.');
    }

    // 컴포넌트 언마운트 시
    return () => {
      console.log('[알림 리스너] 컴포넌트가 언마운트되었습니다.');
    };
  }, []);

  // 이 컴포넌트는 UI를 렌더링하지 않음
  return null;
};

export default NotificationListener;
