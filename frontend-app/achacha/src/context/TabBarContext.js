import React, { createContext, useState, useContext } from 'react';

// 탭바 표시 상태를 관리하는 컨텍스트 생성
const TabBarContext = createContext();

export const TabBarProvider = ({ children }) => {
  const [isTabBarVisible, setIsTabBarVisible] = useState(true);

  // 탭바 표시/숨김 함수
  const showTabBar = () => setIsTabBarVisible(true);
  const hideTabBar = () => setIsTabBarVisible(false);

  // 특정 라우트에서 탭바 표시 여부 결정 함수
  const getTabBarVisibility = route => {
    // 탭바를 숨길 화면 목록 (DetailProductScreen과 DetailAmountScreen은 제외)
    const hiddenInRoutes = [
      'Login',
      'GuideFirst',
      'Permission',
      'Splash',
      // 'DetailProduct', // 제거: 항상 표시되도록
      // 'DetailAmount', // 제거: 항상 표시되도록
      // 추가 화면들...
    ];

    // 현재 라우트가 숨김 목록에 있으면 false, 아니면 true 반환
    if (hiddenInRoutes.includes(route)) {
      return false;
    }

    // 전역 탭바 상태 반환
    return isTabBarVisible;
  };

  return (
    <TabBarContext.Provider
      value={{
        isTabBarVisible,
        showTabBar,
        hideTabBar,
        getTabBarVisibility,
      }}
    >
      {children}
    </TabBarContext.Provider>
  );
};

// 커스텀 훅을 통해 컨텍스트 사용 간소화
export const useTabBar = () => {
  const context = useContext(TabBarContext);
  if (context === undefined) {
    throw new Error('useTabBar must be used within a TabBarProvider');
  }
  return context;
};
