import { useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';
import { login as kakaoLogin } from '@react-native-seoul/kakao-login';
import { Alert } from 'react-native';
import { useMutation, useQuery } from '@tanstack/react-query';
import { ERROR_MESSAGES } from '../constants/errorMessages';
import { handleError, handleAuthError } from '../utils/errorHandler';
import useAuthStore from '../store/authStore';
import {
  loginWithKakao,
  refreshTokens,
  getUserProfile,
  logout as logoutService,
} from '../services/authService';

// ================ React Query Hooks ================
// - React Query와 Zustand를 통합한 인증 관련 커스텀 훅
// - 컴포넌트에서 인증 관련 상태와 기능을 쉽게 사용할 수 있는 인터페이스 제공

/**
 * 카카오 로그인을 처리하는 React Query mutation 훅
 */
const useKakaoLoginMutation = () => {
  const setAuth = useAuthStore(state => state.setAuth);

  return useMutation({
    mutationFn: loginWithKakao,
    onSuccess: data => {
      const { user, accessToken, refreshToken, bleToken } = data;
      setAuth(user, { accessToken, refreshToken, bleToken }, 'kakao');
    },
    onError: error => {
      handleError(error);
      console.error('Kakao Login API Error:', error);
    },
  });
};

/**
 * 토큰 갱신을 처리하는 React Query mutation 훅
 */
export const useRefreshTokens = () => {
  const updateTokens = useAuthStore(state => state.updateTokens);

  return useMutation({
    mutationFn: refreshTokens,
    onSuccess: data => {
      const { accessToken, refreshToken } = data;
      updateTokens(accessToken, refreshToken);
    },
    onError: error => {
      // 공통 에러 핸들러 사용 (인증 에러 처리 포함)
      handleError(error, { onAuthError: handleAuthError });
      console.error('Token Refresh API Error:', error);
    },
  });
};

/**
 * 사용자 프로필을 조회하는 React Query 훅
 */
export const useUserProfile = (options = {}) => {
  const isLoggedIn = useAuthStore(state => state.isLoggedIn);
  const enabled = options.enabled !== undefined ? options.enabled : true;

  return useQuery({
    queryKey: ['userProfile'],
    queryFn: getUserProfile,
    enabled: isLoggedIn && enabled,
    staleTime: options.staleTime || 5 * 60 * 1000, // 기본값 5분
    retry: options.retry || 1, // 기본값 1회 재시도
    onError: error => {
      // 공통 에러 핸들러 사용 (인증 에러 처리 포함)
      handleError(error, { onAuthError: handleAuthError });
      console.error('Get User Profile API Error:', error);
    },
  });
};

/**
 * 로그아웃을 처리하는 React Query mutation 훅
 */
const useLogoutMutation = () => {
  const logout = useAuthStore(state => state.logout);

  return useMutation({
    mutationFn: logoutService,
    onSuccess: () => {
      // 로컬 상태 초기화
      logout();
    },
    onError: error => {
      // 공통 에러 핸들러 사용
      handleError(error);
      console.error('Logout API Error:', error);
      // API 오류 발생 시에도 로컬 상태는 클리어
      logout();
    },
  });
};

// ================ 메인 인증 Hook ================

/**
 * 인증 관련 로직을 관리하는 통합 커스텀 훅.
 * React Query와 Zustand를 활용
 */
export const useAuth = () => {
  const navigation = useNavigation();

  // Zustand 스토어에서 상태 가져오기
  const { user, isLoggedIn, loginType } = useAuthStore();

  // React Query 훅 사용
  const {
    mutateAsync: kakaoLoginMutate,
    isPending: isKakaoLoginPending,
    isError: isKakaoLoginError,
    isSuccess: isKakaoLoginSuccess,
    error: kakaoLoginError,
  } = useKakaoLoginMutation();

  const { mutateAsync: logoutMutate, isPending: isLoggingOut } = useLogoutMutation();

  const {
    data: userProfile,
    isLoading: isUserProfileLoading,
    refetch: refetchUserProfile,
  } = useUserProfile();

  // 로그인 상태 (React Query의 mutation 상태 활용)
  const authState = isKakaoLoginPending
    ? 'loading'
    : isKakaoLoginError
      ? 'error'
      : isKakaoLoginSuccess
        ? 'success'
        : 'idle';

  // 카카오 로그인 처리 함수
  const signInWithKakao = useCallback(async () => {
    console.log('[ACHACHA_DEBUG] Attempting Kakao Login via @react-native-seoul/kakao-login...');

    try {
      // 카카오 SDK 로그인 시도 - 이 부분은 React Query 밖에서 처리해야 함
      console.log('[ACHACHA_DEBUG] Calling kakaoLogin() from @react-native-seoul/kakao-login');
      const kakaoResult = await kakaoLogin();

      // 실제 토큰 문자열만 추출 (accessToken, token, 또는 문자열)
      const kakaoAccessToken =
        kakaoResult?.accessToken ||
        kakaoResult?.token ||
        (typeof kakaoResult === 'string' ? kakaoResult : '');

      console.log('[ACHACHA_DEBUG] kakaoAccessToken:', kakaoAccessToken);

      // React Query mutation으로 로그인 처리
      await kakaoLoginMutate(kakaoAccessToken);

      // 로그인 성공 시 화면 이동
      navigation.replace('Main');
    } catch (error) {
      // 카카오 SDK 에러만 여기서 처리 (백엔드 API 에러는 React Query에서 처리)
      console.error('[ACHACHA_DEBUG] Kakao SDK login error:', error);
      Alert.alert('카카오 로그인 실패', '카카오 로그인 연동 중 오류가 발생했습니다.');
    }
  }, [navigation, kakaoLoginMutate]);

  // 로그인 에러 핸들러
  const handleLoginError = useCallback(() => {
    if (!kakaoLoginError) return;
    let errorMessage = '로그인 중 알 수 없는 오류가 발생했습니다.';
    let errorCode = '';
    if (kakaoLoginError.response?.data?.errorCode) {
      errorCode = kakaoLoginError.response.data.errorCode;
      errorMessage = ERROR_MESSAGES[errorCode] || kakaoLoginError.response.data.message || errorMessage;
    } else if (kakaoLoginError.response?.data?.message) {
      errorMessage = kakaoLoginError.response.data.message;
    }
    Alert.alert(
      '로그인 실패',
      errorCode ? `[${errorCode}]\n${errorMessage}` : errorMessage
    );
  }, [kakaoLoginError]);

  // 카카오 로그인 에러 발생 시 자동으로 에러 처리
  if (isKakaoLoginError && kakaoLoginError) {
    handleLoginError();
  }

  // 구글 로그인 처리 함수 (예시 코드로 유지)
  const signInWithGoogle = useCallback(async () => {
    // 구현할 경우, 카카오 로그인과 같은 패턴으로 SDK 호출 후 mutation 실행
  }, [navigation]);

  // 로그아웃 함수
  const logout = useCallback(async () => {
    try {
      await logoutMutate();
      navigation.replace('Login');
    } catch (error) {
      // API 에러는 이미 React Query에서 관리되므로 여기서는 처리하지 않음
      // 추가 UI 상호작용만 처리
    }
  }, [logoutMutate, navigation]);

  // 훅 사용 컴포넌트에 필요한 상태와 함수 반환
  return {
    authState,
    user: user || userProfile,
    isLoggedIn,
    loginType,
    isKakaoLoginPending,
    isLoggingOut,
    isUserProfileLoading,
    error: kakaoLoginError,
    signInWithKakao,
    signInWithGoogle,
    logout,
    refetchUserProfile,
  };
};
