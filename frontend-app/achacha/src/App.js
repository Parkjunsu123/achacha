import { QueryClient, QueryClientProvider } from 'react-query';
import { handleError, handleAuthError } from './utils/errorHandler';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './navigation/AppNavigator';
import { navigationRef } from './navigation/NavigationService';
import { useEffect } from 'react';
import notificationHelper from './utils/notificationHelper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { TabBarProvider } from './context/TabBarContext';
import { HeaderBarProvider } from './context/HeaderBarContext';
import Toast from 'react-native-toast-message';
import { toastConfig } from './utils/toastService';
import NotificationListener from './components/notification/NotificationListener';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import toastService from './utils/toastService';

// React Query 클라이언트 생성 및 기본 옵션 설정
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1, // 실패 시 1번만 재시도
      refetchOnWindowFocus: false, // 창 포커스 시 자동 리페치 비활성화
      onError: error => {
        // 인증 에러 처리를 포함한 공통 에러 처리
        handleError(error, { onAuthError: handleAuthError });
      },
    },
    mutations: {
      onError: error => {
        // 인증 에러 처리를 포함한 공통 에러 처리
        handleError(error, { onAuthError: handleAuthError });
      },
    },
  },
});

// 테스트 토스트 버튼 컴포넌트 (개발 모드에서만 표시)
const TestToastButton = () => {
  // 개발 모드가 아니면 렌더링하지 않음
  if (!__DEV__) return null;

  // 테스트 알림 표시 함수
  const showTestNotification = () => {
    // 임의의 알림 타입 선택
    const types = [
      'EXPIRY_DATE',
      'LOCATION_BASED',
      'USAGE_COMPLETE',
      'RECEIVE_GIFTICON',
      'SHAREBOX_GIFTICON',
    ];
    const randomType = types[Math.floor(Math.random() * types.length)];

    // 임의의 엔티티 타입 선택
    const entityType = Math.random() > 0.5 ? 'gifticon' : 'sharebox';

    // 테스트 알림 데이터 생성
    const mockMessage = {
      notification: {
        title: '테스트 알림',
        body: `${randomType} 타입의 알림 테스트입니다.`,
      },
      data: {
        notificationType: randomType,
        referenceEntityType: entityType,
        referenceEntityId: '123456',
      },
    };

    // 알림 표시
    toastService.showNotificationToast(mockMessage);
  };

  // 일반 토스트 표시 함수
  const showGeneralToast = () => {
    const types = ['success', 'error', 'info'];
    const randomType = types[Math.floor(Math.random() * types.length)];

    toastService.showToast(
      randomType,
      `${randomType.toUpperCase()} 테스트`,
      '이것은 토스트 테스트 메시지입니다.'
    );
  };

  return (
    <View style={styles.testButtonContainer}>
      <TouchableOpacity style={styles.testButton} onPress={showTestNotification}>
        <Text style={styles.testButtonText}>알림 테스트</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.testButton, { marginTop: 8 }]} onPress={showGeneralToast}>
        <Text style={styles.testButtonText}>일반 토스트</Text>
      </TouchableOpacity>
    </View>
  );
};

// 앱 컴포넌트
export default function App() {
  // FCM 알림 초기화
  useEffect(() => {
    // FCM 및 로컬 푸시 알림 초기화
    let unsubscribeForeground;
    const setupNotifications = async () => {
      // FCM 초기화 및 이벤트 리스너 설정 (원격 알림 처리)
      unsubscribeForeground = await notificationHelper.initializeNotifications();
    };

    setupNotifications();

    // 클린업 함수
    return () => {
      if (unsubscribeForeground) {
        unsubscribeForeground();
      }
    };
  }, []);

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <TabBarProvider>
          <HeaderBarProvider>
            <NavigationContainer ref={navigationRef}>
              <AppNavigator />
            </NavigationContainer>
          </HeaderBarProvider>
        </TabBarProvider>
        <Toast config={toastConfig} />
        <NotificationListener />
        <TestToastButton />
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}

// 스타일
const styles = StyleSheet.create({
  testButtonContainer: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    zIndex: 9999,
  },
  testButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  testButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
