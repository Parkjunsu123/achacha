import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/apiClient';

/**
 * BLE 토큰 생성을 위한 API 호출 함수
 * @param {string|null} bleTokenValue - 기존 BLE 토큰 값 (선택적)
 * @returns {Promise<Object>} 생성된 BLE 토큰 정보
 */
const generateBleToken = async (bleTokenValue = null) => {
  const response = await apiClient.post('/api/ble', {
    bleTokenValue,
  });
  return response.data;
};

/**
 * BLE 토큰 관리를 위한 React Query 훅
 */
export const useBleToken = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: generateBleToken,
    onSuccess: data => {
      // 토큰 생성 성공 시 필요한 처리
      console.log('BLE 토큰 생성 성공:', data);
    },
    onError: error => {
      // 토큰 생성 실패 시 에러 처리
      console.error('BLE 토큰 생성 실패:', error);
    },
  });

  return {
    generateToken: mutation.mutate, // 토큰 생성 함수
    isLoading: mutation.isPending, // 로딩 상태
    isError: mutation.isError, // 에러 상태
    error: mutation.error, // 에러 객체
    data: mutation.data, // 생성된 토큰 데이터
  };
};
