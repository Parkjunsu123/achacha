import messaging from '@react-native-firebase/messaging';
import NavigationService from '../navigation/NavigationService';
import { Platform } from 'react-native';
// Toast 메시지 서비스 추가
import toastService from './toastService';
// 새로 만든 NotificationHandler 임포트
import { handleNotificationPress } from './NotificationHandler';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 참조 타입 상수
const REFERENCE_TYPES = {
  GIFTICON: 'gifticon',
  SHAREBOX: 'sharebox',
};

// 알림 타입에 따른 처리 방식 정의
const NOTIFICATION_HANDLERS = {
  // 기프티콘 관련 알림 처리 함수
  handleGifticonNotification: async (referenceEntityId, notificationType) => {
    try {
      // 새로 구현한 handleNotificationPress 함수 사용
      await handleNotificationPress({
        referenceEntityType: 'gifticon',
        referenceEntityId,
        notificationType,
      });
    } catch (error) {
      console.error('기프티콘 알림 처리 중 오류:', error);
      // 오류 발생 시 기본 화면으로 이동
      NavigationService.navigate('Main', { screen: 'TabGifticonManage' });
      throw error; // 상위 호출자에게 오류 전파
    }
  },

  // 쉐어박스 관련 알림 처리 함수
  handleShareboxNotification: async (referenceEntityId, notificationType) => {
    try {
      console.log('쉐어박스 처리 시작:', referenceEntityId, notificationType);

      // 쉐어박스 삭제인 경우 홈 화면으로 이동
      if (notificationType === 'SHAREBOX_DELETED') {
        NavigationService.navigate('BoxMainScreen');
        return;
      }

      // 새로 구현한 handleNotificationPress 함수 사용
      await handleNotificationPress({
        referenceEntityType: 'sharebox',
        referenceEntityId,
        notificationType,
      });
    } catch (error) {
      console.error('쉐어박스 알림 처리 중 오류:', error);
      // 오류 발생 시 쉐어박스 탭으로 이동
      NavigationService.navigate('Main', { screen: 'TabSharebox' });
      throw error; // 상위 호출자에게 오류 전파
    }
  },
};

/**
 * FCM 알림 데이터로부터 화면 이동에 필요한 정보 추출
 */
export const extractNavigationInfo = message => {
  // 메시지 형식에 따라 데이터 추출 방식 달라짐
  const data = message.data || {};
  const notification = message.notification || {};

  // FCM 페이로드에서 필요한 데이터 추출
  const notificationType = data.notificationType || data.type;

  // referenceEntityType과 referenceEntityId를 직접 FCM 데이터에서 추출
  // 서로 다른 필드 이름으로 전송될 수 있는 경우를 모두 처리
  const referenceEntityType = data.referenceEntityType || data.type;

  // referenceEntityId, gifticonId, shareboxId 등 다양한 필드명 처리
  // ID가 숫자 타입으로 온 경우 문자열로 변환
  const entityId = data.referenceEntityId || data.id || data.gifticonId || data.shareboxId;
  const referenceEntityId = entityId ? String(entityId) : null;

  return {
    notificationType,
    referenceEntityType,
    referenceEntityId,
    title: notification.title || data.title,
    body: notification.body || data.body,
  };
};

/**
 * 추출한 정보를 바탕으로 적절한 화면으로 이동
 */
export const handleNotificationNavigation = async navigationInfo => {
  try {
    const { notificationType, referenceEntityType, referenceEntityId } = navigationInfo;

    // 강제 지연 추가 (네비게이션 안정화)
    await new Promise(resolve => setTimeout(resolve, 500));

    if (!referenceEntityId) {
      // 기본 화면으로 이동
      NavigationService.navigate('Main');
      return;
    }

    // 쉐어박스 삭제 알림은 홈 화면으로 이동
    if (notificationType === 'SHAREBOX_DELETED') {
      NavigationService.navigate('BoxMainScreen');
      return;
    }

    // 알림 타입에 따른 처리
    if (
      ['EXPIRY_DATE', 'LOCATION_BASED', 'USAGE_COMPLETE', 'RECEIVE_GIFTICON'].includes(
        notificationType
      )
    ) {
      // 기프티콘 관련 알림
      await NOTIFICATION_HANDLERS.handleGifticonNotification(referenceEntityId, notificationType);
      return;
    } else if (
      ['SHAREBOX_GIFTICON', 'SHAREBOX_USAGE_COMPLETE', 'SHAREBOX_MEMBER_JOIN'].includes(
        notificationType
      )
    ) {
      // 쉐어박스 관련 알림
      await NOTIFICATION_HANDLERS.handleShareboxNotification(referenceEntityId, notificationType);
      return;
    } else if (referenceEntityType === REFERENCE_TYPES.GIFTICON) {
      // referenceEntityType이 gifticon인 경우
      await NOTIFICATION_HANDLERS.handleGifticonNotification(referenceEntityId, notificationType);
      return;
    } else if (referenceEntityType === REFERENCE_TYPES.SHAREBOX) {
      // referenceEntityType이 sharebox인 경우
      await NOTIFICATION_HANDLERS.handleShareboxNotification(referenceEntityId, notificationType);
      return;
    } else {
      // 타입이 명확하지 않을 경우 새로운 통합 처리 함수 사용
      await handleNotificationPress({
        referenceEntityType: 'gifticon', // 기본값으로 gifticon 설정
        referenceEntityId,
        notificationType,
      });
    }
  } catch (error) {
    console.error('알림 이동 처리 중 오류:', error);
    // 오류 발생 시 기본 화면으로 이동
    NavigationService.navigate('Main');
  }
};

/**
 * 앱 상태에 따른 알림 처리
 */
export const handleForegroundNotification = message => {
  // 앱이 포그라운드 상태일 때 알림 처리
  const currentTime = new Date().toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  console.log(`[${currentTime}] 포그라운드 알림 수신:`, {
    title: message.notification?.title,
    body: message.notification?.body,
    data: message.data,
  });

  // 토스트 메시지로 알림 표시
  toastService.showNotificationToast(message);
};

/**
 * FCM 초기화 및 이벤트 리스너 설정
 */
export const initializeNotifications = async () => {
  try {
    // iOS에서는 권한 요청 필요
    if (Platform.OS === 'ios') {
      await messaging().requestPermission();
    }

    // 포그라운드 상태에서 메시지 수신 시 이벤트 리스너
    const unsubscribeForeground = messaging().onMessage(async remoteMessage => {
      const currentTime = new Date().toLocaleString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      });

      console.log(`[${currentTime}] 포그라운드 메시지 수신:`, {
        title: remoteMessage.notification?.title,
        body: remoteMessage.notification?.body,
        data: remoteMessage.data,
      });

      // 토스트 메시지로 알림 표시
      handleForegroundNotification(remoteMessage);
    });

    // 백그라운드에서 알림 클릭 시 이벤트 핸들링
    messaging().onNotificationOpenedApp(async remoteMessage => {
      const currentTime = new Date().toLocaleString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      });

      console.log(`[${currentTime}] 백그라운드에서 알림 클릭:`, {
        title: remoteMessage.notification?.title,
        body: remoteMessage.notification?.body,
        data: remoteMessage.data,
      });

      const navigationInfo = extractNavigationInfo(remoteMessage);
      await handleNotificationNavigation(navigationInfo);
    });

    // 앱이 종료된 상태에서 알림 클릭으로 실행된 경우
    const initialMessage = await messaging().getInitialNotification();
    if (initialMessage) {
      const currentTime = new Date().toLocaleString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      });

      console.log(`[${currentTime}] 종료 상태에서 알림 클릭으로 실행:`, {
        title: initialMessage.notification?.title,
        body: initialMessage.notification?.body,
        data: initialMessage.data,
      });

      // 앱 초기화가 완료된 후에 처리하기 위해 약간의 지연 추가
      setTimeout(async () => {
        const navigationInfo = extractNavigationInfo(initialMessage);
        await handleNotificationNavigation(navigationInfo);
      }, 1000);
    }

    // FCM 토큰 변경 시 처리 (필요한 경우 서버에 토큰 업데이트)
    messaging().onTokenRefresh(token => {
      console.log('FCM 토큰 갱신:', token);
      // 필요한 경우 서버에 새 토큰 등록
      updateFcmToken(token);
    });

    // 초기 토큰 획득 및 저장
    const token = await messaging().getToken();
    console.log('FCM 토큰:', token);
    updateFcmToken(token);

    return unsubscribeForeground;
  } catch (error) {
    console.error('FCM 초기화 실패:', error);
    return null;
  }
};

/**
 * FCM 토큰을 서버에 업데이트하는 함수
 * 로그인 시에만 FCM 토큰이 서버로 전송됨
 */
const updateFcmToken = async token => {
  try {
    // 로그인 시에는 authService.js에서 FCM 토큰을 전송하므로
    // 여기서는 로그만 남기고 별도 API 호출은 하지 않음
    console.log('FCM 토큰 준비됨 (로그인 시 서버에 전송됨):', token);

    // 토큰을 로컬에 저장 (필요시 사용)
    if (AsyncStorage) {
      await AsyncStorage.setItem('fcmToken', token);
    }
  } catch (error) {
    console.error('FCM 토큰 처리 실패:', error);
  }
};

export default {
  initializeNotifications,
  handleNotificationNavigation,
  extractNavigationInfo,
};
