import React, { createContext, useState, useContext } from 'react';

// 헤더바 표시 상태를 관리하는 컨텍스트 생성
const HeaderBarContext = createContext();

export const HeaderBarProvider = ({ children }) => {
  const [isHeaderBarVisible, setIsHeaderBarVisible] = useState(true);
  const [notificationCount, setNotificationCount] = useState(3); // 초기값 3으로 설정 (예시)

  // 헤더바 표시/숨김 함수
  const showHeaderBar = () => setIsHeaderBarVisible(true);
  const hideHeaderBar = () => setIsHeaderBarVisible(false);

  // 알림 카운트 조작 함수
  const updateNotificationCount = count => setNotificationCount(count);
  const increaseNotificationCount = () => setNotificationCount(prev => prev + 1);
  const decreaseNotificationCount = () => setNotificationCount(prev => Math.max(0, prev - 1));
  const clearNotifications = () => setNotificationCount(0);

  // 특정 라우트에서 헤더바 표시 여부 결정 함수
  const getHeaderBarVisibility = route => {
    // 헤더바를 숨길 화면 목록
    const hiddenInRoutes = [
      'Login',
      'GuideFirst',
      'Permission',
      'Splash',
      // 추가 화면들...
    ];

    // 현재 라우트가 숨김 목록에 있으면 false, 아니면 true 반환
    if (hiddenInRoutes.includes(route)) {
      return false;
    }

    // 전역 헤더바 상태 반환
    return isHeaderBarVisible;
  };

  return (
    <HeaderBarContext.Provider
      value={{
        isHeaderBarVisible,
        showHeaderBar,
        hideHeaderBar,
        getHeaderBarVisibility,
        notificationCount,
        updateNotificationCount,
        increaseNotificationCount,
        decreaseNotificationCount,
        clearNotifications,
      }}
    >
      {children}
    </HeaderBarContext.Provider>
  );
};

// 커스텀 훅을 통해 컨텍스트 사용 간소화
export const useHeaderBar = () => {
  const context = useContext(HeaderBarContext);
  if (context === undefined) {
    throw new Error('useHeaderBar must be used within a HeaderBarProvider');
  }
  return context;
};
