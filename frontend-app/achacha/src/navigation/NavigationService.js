import { createRef } from 'react';
import { CommonActions, StackActions } from '@react-navigation/native';
import { InteractionManager } from 'react-native';
import useAuthStore from '../store/authStore';

/**
 * 네비게이션 Ref (네비게이터에 연결할 ref)
 */
export const navigationRef = createRef();

/**
 * 스크린으로 이동하는 함수
 * @param {string} routeName - 라우트 이름
 * @param {Object} params - 파라미터 객체
 * @param {boolean} waitForInteraction - 인터랙션 완료 후 이동 여부
 */
export function navigate(routeName, params = {}, waitForInteraction = true) {
  if (waitForInteraction) {
    // 인터랙션 완료 후 화면 전환 (부드러운 애니메이션을 위해)
    InteractionManager.runAfterInteractions(() => {
      navigationRef.current?.navigate(routeName, params);
    });
  } else {
    // 즉시 화면 전환 (즉각적인 반응이 필요한 경우)
    navigationRef.current?.navigate(routeName, params);
  }
}

/**
 * 중첩된 스크린으로 이동하는 함수
 * @param {string} parentRouteName - 부모 라우트 이름
 * @param {string} childRouteName - 자식 라우트 이름
 * @param {Object} params - 파라미터 객체
 * @param {boolean} waitForInteraction - 인터랙션 완료 후 이동 여부
 */
export function navigateNested(
  parentRouteName,
  childRouteName,
  params = {},
  waitForInteraction = true
) {
  const navigateAction = () => {
    navigationRef.current?.navigate(parentRouteName, {
      screen: childRouteName,
      params,
      initial: false,
    });
  };

  if (waitForInteraction) {
    InteractionManager.runAfterInteractions(navigateAction);
  } else {
    navigateAction();
  }
}

/**
 * 현재 화면을 교체하는 함수 (히스토리 남기지 않음)
 * @param {string} routeName - 라우트 이름
 * @param {Object} params - 파라미터 객체
 */
export function replace(routeName, params = {}) {
  navigationRef.current?.dispatch(StackActions.replace(routeName, params));
}

/**
 * 뒤로 가는 함수
 */
export function goBack() {
  navigationRef.current?.goBack();
}

/**
 * 특정 화면으로 바로 이동하는 함수 (모든 중간 스택을 지우고)
 * @param {string} routeName - 라우트 이름
 * @param {Object} params - 파라미터 객체
 */
export function resetTo(routeName, params = {}) {
  navigationRef.current?.dispatch(
    CommonActions.reset({
      index: 0,
      routes: [{ name: routeName, params }],
    })
  );
}

/**
 * 현재 라우트 정보 가져오기
 * @returns {Object} 현재 라우트 정보
 */
export function getCurrentRoute() {
  return navigationRef.current?.getCurrentRoute();
}

/**
 * 딥링크 URL을 파싱하는 함수
 * @param {string} url - 딥링크 URL
 * @returns {Object} 파싱된 정보 { screen, code, params }
 */
function parseUrl(url) {
  // 예: achacha://sharebox?code=123456
  try {
    const urlObj = new URL(url);
    if (urlObj.protocol === 'achacha:' && urlObj.hostname === 'sharebox') {
      const code = urlObj.searchParams.get('code');
      return { screen: 'sharebox', code, params: {} };
    }
  } catch (e) {
    // fallback for react-native URL parsing
    const match = url.match(/achacha:\/\/sharebox\?code=([A-Za-z0-9]+)/);
    if (match) {
      return { screen: 'sharebox', code: match[1], params: {} };
    }
  }
  return {};
}

/**
 * 딥링크 핸들러 - 항상 바텀탭이 보이게 Main → TabSharebox 순서로 이동
 * 로그인 안 되어 있으면 Login으로 보내고, 로그인 성공 시 목적지로 이동
 */
export function handleDeepLink(url) {
  const parsed = parseUrl(url);
  if (parsed.screen === 'sharebox' && parsed.code) {
    const isLoggedIn = useAuthStore.getState().isLoggedIn;
    if (!isLoggedIn) {
      // 로그인 안 되어 있으면 Login으로 이동, 목적지 정보도 같이 전달
      navigationRef.current?.navigate('Login', {
        redirectTo: { screen: 'TabSharebox', params: { code: parsed.code } },
      });
      return;
    }
    // 로그인 되어 있으면 Main → TabSharebox 순서로 이동
    navigationRef.current?.navigate('Main');
    setTimeout(() => {
      navigationRef.current?.navigate('TabSharebox', { code: parsed.code, _ts: Date.now() });
    }, 0);
    return;
  }
  // ...다른 딥링크 처리
}

// 항상 바텀탭/헤더가 보이게 네비게이션
function navigateWithBottomTab(screen, params) {
  navigationRef.current?.navigate('Main'); // Main(바텀탭) 먼저
  setTimeout(() => {
    navigationRef.current?.navigate(screen, params); // 그 위에 원하는 화면
  }, 0);
}

// 네비게이션 서비스 객체
const NavigationService = {
  navigate,
  navigateNested,
  replace,
  goBack,
  resetTo,
  getCurrentRoute,
  navigationRef,
  handleDeepLink,
  navigateWithBottomTab,
};

export default NavigationService;
