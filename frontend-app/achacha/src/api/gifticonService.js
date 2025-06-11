import apiClient from './apiClient';
import { API_CONFIG } from './config';
import { Platform } from 'react-native';
import RNFS from 'react-native-fs';
import axios from 'axios';
import { API_BASE_URL } from './config';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * 기프티콘 API 서비스
 */
const gifticonService = {
  /**
   * 기프티콘 이미지 메타데이터 조회
   * @param {File} image - 기프티콘 이미지 파일
   * @param {string} gifticonType - 기프티콘 타입 (AMOUNT, PRODUCT)
   * @returns {Promise<Object>} - 메타데이터 조회 결과
   */
  async getGifticonImageMetadata(image, gifticonType) {
    const formData = new FormData();

    // 이미지 타입 및 파일명 디버그 로그
    console.log('[API] 이미지 타입:', image.type || 'image/jpeg');
    console.log('[API] 파일명:', image.fileName || 'image.jpg');

    // 이미지 파일 추가
    formData.append('image', {
      uri: Platform.OS === 'android' ? image.uri : image.uri.replace('file://', ''),
      type: image.type || 'image/jpeg',
      name: image.fileName || 'image.jpg',
    });

    // 기프티콘 타입 추가 (URL 파라미터 대신 Form 데이터에 추가)
    formData.append('gifticonType', gifticonType);

    try {
      console.log(
        '[API] 기프티콘 메타데이터 요청 시작:',
        `${API_CONFIG.ENDPOINTS.GIFTICON_IMAGE_METADATA}`
      );

      // 타임아웃 설정 증가 및 요청 설정 개선
      const response = await apiClient.post(
        API_CONFIG.ENDPOINTS.GIFTICON_IMAGE_METADATA,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Accept: 'application/json',
          },
          timeout: 60000, // 이미지 처리를 위해 타임아웃 1분으로 설정
        }
      );

      console.log('[API] 기프티콘 메타데이터 응답 성공');
      return response.data;
    } catch (error) {
      console.error('기프티콘 이미지 메타데이터 조회 실패:', error);

      // 오류 상세 정보 로그
      if (error.response) {
        // 서버에서 응답이 왔지만 상태 코드가 2xx 범위를 벗어난 경우
        console.error('서버 응답 오류:', error.response.status, error.response.data);
      } else if (error.request) {
        // 요청은 전송되었지만 응답이 수신되지 않은 경우
        console.error('서버 응답 없음 (요청 정보):', error.request);
      } else {
        // 요청 설정 중 오류가 발생한 경우
        console.error('요청 설정 오류:', error.message);
      }

      // 임시 대응: 서버 응답이 없을 경우 임시 데이터 반환 (개발용)
      if (__DEV__ && !error.response) {
        console.warn('[API] 개발 모드에서 임시 메타데이터 반환');
        return {
          brandName: '테스트 브랜드',
          gifticonName: '테스트 상품',
          gifticonExpiryDate: new Date().toISOString().split('T')[0],
          gifticonBarcodeNumber: '1234567890',
          gifticonOriginalAmount: gifticonType === 'AMOUNT' ? 10000 : null,
          ocrTrainingDataId: 'test-ocr-id-12345',
        };
      }

      throw error;
    }
  },

  /**
   * 기프티콘 등록
   * @param {Object} gifticonData - 기프티콘 정보
   * @param {File} originalImage - 원본 이미지 파일
   * @param {File} thumbnailImage - 썸네일 이미지 파일
   * @param {File} barcodeImage - 바코드 이미지 파일
   * @returns {Promise<string>} - 등록 결과 메시지
   */
  async registerGifticon(gifticonData, originalImage, thumbnailImage, barcodeImage) {
    try {
      // JSON 문자열로 변환
      const jsonString = JSON.stringify(gifticonData);
      console.log('[API] 기프티콘 등록 데이터:', jsonString);

      // 임시 파일 경로 생성
      const fileName = 'gifticon.json';
      const filePath = `${RNFS.TemporaryDirectoryPath}/${fileName}`;
      console.log('[API] JSON 임시 파일 경로:', filePath);

      // JSON 문자열을 파일로 저장
      await RNFS.writeFile(filePath, jsonString, 'utf8');
      console.log('[API] JSON 파일 저장 완료');

      // FormData 생성
      const formData = new FormData();

      // JSON 파일을 FormData에 추가 (중요: 파일 형식으로 추가하면서 Content-Type 명시)
      // 1. 'gifticon' 필드로 추가 (API 명세에 기본)
      formData.append('gifticon', {
        uri: Platform.OS === 'android' ? `file://${filePath}` : filePath,
        type: 'application/json',
        name: fileName,
      });

      // 2. 대체 방법: 'body' 필드로도 추가 (백엔드 개발자가 이 필드명을 사용할 수 있음)
      // 둘 중 하나가 작동하길 바라며 두 방식 모두 시도
      const jsonFile = {
        uri: Platform.OS === 'android' ? `file://${filePath}` : filePath,
        type: 'application/json',
        name: fileName,
      };
      formData.append('body', jsonFile);

      // 이미지 파일 추가
      if (originalImage && originalImage.uri) {
        formData.append('originalImage', {
          uri:
            Platform.OS === 'android'
              ? originalImage.uri
              : originalImage.uri.replace('file://', ''),
          type: originalImage.type || 'image/jpeg',
          name: originalImage.fileName || 'original.jpg',
        });
        console.log('[API] 원본 이미지 추가됨:', originalImage.uri);
      }

      if (thumbnailImage && thumbnailImage.uri) {
        formData.append('thumbnailImage', {
          uri:
            Platform.OS === 'android'
              ? thumbnailImage.uri
              : thumbnailImage.uri.replace('file://', ''),
          type: thumbnailImage.type || 'image/jpeg',
          name: thumbnailImage.fileName || 'thumbnail.jpg',
        });
        console.log('[API] 썸네일 이미지 추가됨:', thumbnailImage.uri);
      }

      if (barcodeImage && barcodeImage.uri) {
        formData.append('barcodeImage', {
          uri:
            Platform.OS === 'android' ? barcodeImage.uri : barcodeImage.uri.replace('file://', ''),
          type: barcodeImage.type || 'image/jpeg',
          name: barcodeImage.fileName || 'barcode.jpg',
        });
        console.log('[API] 바코드 이미지 추가됨:', barcodeImage.uri);
      }

      // FormData 내용 확인 (디버깅용)
      console.log('[API] FormData 내용:');
      if (formData._parts) {
        formData._parts.forEach((part, index) => {
          console.log(
            `[${index}] ${part[0]}: ${typeof part[1] === 'object' ? JSON.stringify(part[1]) : part[1]}`
          );
        });
      }

      // 다른 옵션: 직접 URLSearchParams 구성 시도
      const params = new URLSearchParams();
      params.append('jsonData', jsonString);

      // API 요청 전송 (Content-Type 명시)
      console.log('[API] 기프티콘 등록 요청 시작');

      // 요청 헤더 설정
      const headers = {
        'Content-Type': 'multipart/form-data',
        Accept: 'application/json',
      };

      // 요청 보내기
      console.log('[API] 요청 헤더:', headers);
      const response = await apiClient.post(API_CONFIG.ENDPOINTS.REGISTER_GIFTICON, formData, {
        headers,
        timeout: 60000, // 이미지 처리를 위해 타임아웃 증가
        transformRequest: data => {
          // 기존 transformRequest 유지 (axios가 자동으로 boundary를 설정하게 함)
          return data;
        },
      });

      console.log('[API] 기프티콘 등록 응답 성공:', response.data);

      // 임시 파일 삭제
      try {
        await RNFS.unlink(filePath);
        console.log('[API] 임시 JSON 파일 삭제 완료');
      } catch (cleanupError) {
        console.warn('[API] 임시 파일 삭제 중 오류:', cleanupError);
      }

      return response.data;
    } catch (error) {
      console.error('기프티콘 등록 실패:', error);

      // 오류 상세 정보 로깅
      if (error.response) {
        // 서버에서 응답이 왔지만 상태 코드가 2xx 범위를 벗어난 경우
        console.error('서버 응답 오류:', error.response.status, error.response.data);
        console.error('응답 헤더:', error.response.headers);
      } else if (error.request) {
        // 요청은 전송되었지만 응답이 수신되지 않은 경우
        console.error('서버 응답 없음 (요청 정보):', error.request);
      } else {
        // 요청 설정 중 오류가 발생한 경우
        console.error('요청 설정 오류:', error.message);
      }

      throw error;
    }
  },

  /**
   * 사용 가능한 기프티콘 목록 조회
   * @param {Object} params - 조회 파라미터
   * @param {string} params.scope - 조회 범위 ('MY_BOX'/'SHARE_BOX'/'ALL')
   * @param {string} params.type - 기프티콘 타입 필터 ('PRODUCT'/'AMOUNT')
   * @param {string} params.sort - 정렬 방식 ('CREATED_DESC': 등록순, 'EXPIRY_ASC': 임박순)
   * @param {number} params.page - 페이지 번호
   * @param {number} params.size - 페이지당 항목 수
   * @returns {Promise<Object>} - 기프티콘 목록 조회 결과
   */
  async getAvailableGifticons(params = {}) {
    const response = await apiClient.get(API_CONFIG.ENDPOINTS.GET_GIFTICONS, { params });
    return response.data;
  },

  /**
   * 사용 완료된 기프티콘 목록 조회
   * @param {Object} params - 조회 파라미터
   * @param {string} params.type - 기프티콘 타입 필터 ('PRODUCT'/'AMOUNT')
   * @param {string} params.sort - 정렬 방식 ('USED_DESC': 사용일 최신순)
   * @param {number} params.page - 페이지 번호
   * @param {number} params.size - 페이지당 항목 수
   * @returns {Promise<Object>} - 사용 완료 기프티콘 목록 조회 결과
   */
  async getUsedGifticons(params = {}) {
    try {
      console.log('[API] 사용 완료 기프티콘 목록 조회 요청 파라미터:', params);
      const response = await apiClient.get(API_CONFIG.ENDPOINTS.GET_USED_GIFTICONS, { params });
      console.log('[API] 사용 완료 기프티콘 목록 조회 성공:', response.data);
      return response.data;
    } catch (error) {
      console.error('[API] 사용 완료 기프티콘 목록 조회 실패:', error);
      throw error;
    }
  },

  /**
   * 기프티콘 상세 정보 조회
   * @param {number} gifticonId - 기프티콘 ID
   * @param {string} scope - 조회 범위 ('MY_BOX', 'SHARE_BOX', 'USED')
   * @returns {Promise<Object>} - 기프티콘 상세 정보
   */
  async getGifticonDetail(gifticonId, scope = '') {
    try {
      // 사용 가능/사용 완료 여부에 따라 다른 엔드포인트 사용
      const isUsed = scope === 'USED';
      const endpoint = isUsed
        ? `/api/used-gifticons/${gifticonId}`
        : `/api/available-gifticons/${gifticonId}`;
      const response = await apiClient.get(endpoint);
      return response.data;
    } catch (error) {
      // 에러 처리 로직 (오류 유형에 따른 처리)
      if (error.response) {
        const status = error.response.status;
        const data = error.response.data;
        if (status === 403) {
          console.error('기프티콘 접근 권한 없음:', data);
        } else if (status === 404) {
          console.error('기프티콘을 찾을 수 없음:', data);
        }
      }
      throw error;
    }
  },

  /**
   * 사용 가능 기프티콘 바코드 조회
   * @param {number} gifticonId - 기프티콘 ID
   * @returns {Promise<Object>} - 바코드 정보
   */
  async getAvailableGifticonBarcode(gifticonId) {
    try {
      const response = await apiClient.get(`/api/available-gifticons/${gifticonId}/barcode`);
      return response.data;
    } catch (error) {
      console.error('[API] 사용 가능 기프티콘 바코드 조회 실패:', error);
      // 에러 처리 로직
      if (error.response) {
        const status = error.response.status;
        const data = error.response.data;
        if (status === 403) {
          console.error('기프티콘 접근 권한 없음:', data);
        } else if (status === 404) {
          console.error('기프티콘을 찾을 수 없음:', data);
        }
      }
      throw error;
    }
  },

  /**
   * 사용 완료 기프티콘 바코드 조회
   * @param {number} gifticonId - 기프티콘 ID
   * @returns {Promise<Object>} - 바코드 정보
   */
  async getUsedGifticonBarcode(gifticonId) {
    try {
      console.log('[API] 사용 완료 기프티콘 바코드 조회 요청:', gifticonId);
      const endpoint = `/api/used-gifticons/${gifticonId}/barcode`;
      console.log('[API] 사용 완료 기프티콘 바코드 조회 요청 URL:', endpoint);
      const response = await apiClient.get(endpoint);
      console.log('[API] 사용 완료 기프티콘 바코드 조회 성공:', response.data);
      // 응답 데이터 확인
      if (!response.data.gifticonBarcodeNumber || !response.data.barcodePath) {
        console.warn('[API] 바코드 정보가 누락된 응답:', response.data);
      }
      return {
        gifticonBarcodeNumber: response.data.gifticonBarcodeNumber || '',
        barcodePath: response.data.barcodePath || '',
      };
    } catch (error) {
      console.error('[API] 사용 완료 기프티콘 바코드 조회 실패:', error);
      // 에러 처리 로직
      if (error.response) {
        const status = error.response.status;
        const data = error.response.data;
        if (status === 403) {
          console.error('기프티콘 접근 권한 없음:', data);
          throw new Error('해당 기프티콘에 접근 권한이 없습니다.');
        } else if (status === 404) {
          console.error('기프티콘을 찾을 수 없음:', data);
          if (data.errorCode === 'GIFTICON_004') {
            throw new Error('이미 사용된 기프티콘입니다.');
          } else if (data.errorCode === 'GIFTICON_005') {
            throw new Error('삭제된 기프티콘입니다.');
          } else if (data.errorCode === 'GIFTICON_009') {
            throw new Error('해당 기프티콘에 대한 사용내역이 없습니다.');
          } else if (data.errorCode === 'FILE_008') {
            throw new Error('파일을 찾을 수 없습니다.');
          } else {
            throw new Error('기프티콘을 찾을 수 없습니다.');
          }
        }
      }
      // 네트워크 에러 등 기타 에러
      throw new Error('바코드 정보를 조회하는 중 오류가 발생했습니다.');
    }
  },

  /**
   * 기프티콘 사용 완료 처리
   * @param {number} gifticonId - 기프티콘 ID
   * @param {string} usageType - 사용 유형 ('SELF_USE', 'PRESENT', 'GIVE_AWAY')
   * @returns {Promise<Object>} - 사용 완료 처리 결과
   */
  async markGifticonAsUsed(gifticonId, usageType = 'SELF_USE') {
    try {
      const response = await apiClient.post(`/api/available-gifticons/${gifticonId}/use`, {
        usageType,
      });
      return response.data;
    } catch (error) {
      console.error('[API] 기프티콘 사용 완료 처리 실패:', error);
      throw error;
    }
  },

  /**
   * 기프티콘 삭제
   * @param {string} gifticonId - 기프티콘 ID
   * @returns {Promise<Object>} - 삭제 결과
   */
  async deleteGifticon(gifticonId) {
    const response = await apiClient.delete(
      `${API_CONFIG.ENDPOINTS.REGISTER_GIFTICON}/${gifticonId}`
    );
    return response.data;
  },

  /**
   * 기프티콘 공유하기
   * @param {string} gifticonId - 기프티콘 ID
   * @param {number} shareBoxId - 쉐어박스 ID
   * @returns {Promise<Object>} - 공유 결과
   */
  async shareGifticon(gifticonId, shareBoxId) {
    const response = await apiClient.post(
      `${API_CONFIG.ENDPOINTS.REGISTER_GIFTICON}/${gifticonId}/share`,
      {
        shareBoxId,
      }
    );
    return response.data;
  },

  /**
   * 기프티콘 공유 취소
   * @param {string} gifticonId - 기프티콘 ID
   * @returns {Promise<Object>} - 공유 취소 결과
   */
  async cancelShareGifticon(gifticonId) {
    const response = await apiClient.delete(
      `${API_CONFIG.ENDPOINTS.REGISTER_GIFTICON}/${gifticonId}/share`
    );
    return response.data;
  },

  // 기프티콘 바코드 조회 API 함수 추가
  // 주어진 gifticonId에 대한 바코드 정보를 가져옵니다.
  async getGifticonBarcode(gifticonId, scope = '') {
    try {
      // 사용 완료 기프티콘인 경우 별도 함수 호출
      if (scope === 'USED') {
        return this.getUsedGifticonBarcode(gifticonId);
      }

      // 사용 가능 기프티콘 바코드 조회
      return this.getAvailableGifticonBarcode(gifticonId);
    } catch (error) {
      console.error('[GifticonService] 기프티콘 바코드 조회 실패:', error);
      throw error;
    }
  },

  /**
   * 금액형 기프티콘 사용
   * @param {number} gifticonId - 기프티콘 ID
   * @param {number} usageAmount - 사용 금액
   * @returns {Promise<string>} - 응답 메시지
   */
  async useAmountGifticon(gifticonId, usageAmount) {
    try {
      // 입력값 타입 검증
      const gId = parseInt(gifticonId, 10);
      const amount = parseInt(usageAmount, 10);

      if (isNaN(gId) || isNaN(amount) || amount <= 0) {
        throw new Error('유효한 ID와 금액이 필요합니다.');
      }

      // API 요청 - 요청 형식 맞추기
      const url = `${API_CONFIG.ENDPOINTS.AMOUNT_GIFTICONS}/${gId}/use`;
      const body = { usageAmount: amount };

      console.log('[API] 금액형 기프티콘 사용 요청:', { url, body });

      const response = await apiClient.post(url, body);
      return response.data;
    } catch (error) {
      console.error('[API] 금액형 기프티콘 사용 오류:', error);
      throw error;
    }
  },

  /**
   * 금액형 기프티콘 사용내역 조회
   * @param {number} gifticonId - 기프티콘 ID
   * @returns {Promise<Object>} - 사용내역 정보
   */
  async getAmountGifticonUsageHistory(gifticonId) {
    const response = await apiClient.get(
      `${API_CONFIG.ENDPOINTS.AMOUNT_GIFTICONS}/${gifticonId}/usage-history`
    );
    return response.data;
  },

  /**
   * 금액형 기프티콘 사용내역 수정
   * @param {number} gifticonId - 기프티콘 ID
   * @param {number} usageHistoryId - 사용내역 ID
   * @param {number} usageAmount - 수정할 사용 금액
   * @returns {Promise<string>} - 응답 메시지
   */
  async updateAmountGifticonUsageHistory(gifticonId, usageHistoryId, usageAmount) {
    try {
      // 입력값을 명시적으로 숫자 타입으로 변환
      const gId = parseInt(gifticonId, 10);
      const hId = parseInt(usageHistoryId, 10);
      const amount = parseInt(usageAmount, 10);

      // 숫자 타입 검증
      if (isNaN(gId) || isNaN(hId) || isNaN(amount)) {
        throw new Error('인자 값이 유효한 숫자가 아닙니다.');
      }

      // API 요청 URL
      const url = `${API_BASE_URL}${API_CONFIG.ENDPOINTS.AMOUNT_GIFTICONS}/${gId}/usage-history/${hId}`;

      // 요청 데이터 생성 - 숫자형으로 전송
      const requestData = { usageAmount: amount };

      // 인증 토큰 가져오기
      const accessToken = await AsyncStorage.getItem('accessToken');

      // 헤더 설정
      const headers = {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      };

      // 인증 토큰이 있으면 헤더에 추가
      if (accessToken) {
        headers.Authorization = `Bearer ${accessToken}`;
      }

      // 직접 axios 호출로 요청 수행
      const response = await axios.patch(url, requestData, { headers });

      return response.data;
    } catch (error) {
      // 에러 상세 정보 기록
      if (error.response) {
        const status = error.response.status;
        // 서버 오류 메시지 확인
        if (status === 500) {
          console.error('서버 내부 오류 발생:', error.response.data);
        }
      } else if (error.request) {
        console.error('응답을 받지 못했습니다:', error.request);
      } else {
        console.error('요청 설정 중 오류 발생:', error.message);
      }

      throw error;
    }
  },

  /**
   * 금액형 기프티콘 사용내역 삭제
   * @param {number} gifticonId - 기프티콘 ID
   * @param {number} usageHistoryId - 삭제할 사용내역 ID
   * @returns {Promise<string>} - 응답 메시지
   */
  async deleteAmountGifticonUsageHistory(gifticonId, usageHistoryId) {
    const response = await apiClient.delete(
      `${API_CONFIG.ENDPOINTS.AMOUNT_GIFTICONS}/${gifticonId}/usage-history/${usageHistoryId}`
    );
    return response.data;
  },

  // 상품형 기프티콘 사용완료 처리
  async markProductGifticonAsUsed(gifticonId) {
    try {
      // 입력값 타입 검증
      const gId = parseInt(gifticonId, 10);

      if (isNaN(gId)) {
        throw new Error('유효한 기프티콘 ID가 필요합니다.');
      }

      const url = API_CONFIG.ENDPOINTS.PRODUCT_GIFTICON_USE(gId);
      console.log('[API] 상품형 기프티콘 사용완료 요청:', url);

      // 요청 형식에 맞게 빈 바디 전송 (API 문서 요구사항)
      const response = await apiClient.post(`${API_BASE_URL}${url}`);
      return response.data;
    } catch (error) {
      console.error('[API] 상품형 기프티콘 사용완료 처리 오류:', error);
      throw error;
    }
  },

  /**
   * 상품형 기프티콘 사용 API (사용자 요청에 맞게 구현)
   * @param {number} gifticonId - 기프티콘 ID
   * @returns {Promise<Object>} - 응답 결과
   */
  async useProductGifticon(gifticonId) {
    try {
      // 입력값 타입 검증
      const gId = parseInt(gifticonId, 10);

      if (isNaN(gId)) {
        throw new Error('유효한 기프티콘 ID가 필요합니다.');
      }

      // 사용자 요청에 맞게 URL 형식 설정
      const url = `/api/product-gifticons/${gId}/use`;
      console.log('[API] 상품형 기프티콘 사용 요청:', url);

      // 요청 형식에 맞게 빈 바디 전송 (API 문서 요구사항)
      const response = await apiClient.post(url);
      return response.data;
    } catch (error) {
      console.error('[API] 상품형 기프티콘 사용 처리 오류:', error);
      throw error;
    }
  },

  // 사용완료 기프티콘 상세 조회
  async getUsedGifticonDetail(gifticonId) {
    const response = await apiClient.get(`/api/used-gifticons/${gifticonId}`);
    return response.data;
  },

  // 공유 취소 기능 (shareBoxId 파라미터를 사용하는 새로운 버전)
  async cancelShareGifticonFromBox(shareBoxId, gifticonId) {
    const response = await apiClient.delete(
      `/api/share-boxes/${shareBoxId}/gifticons/${gifticonId}`
    );
    return response.data;
  },
};

export default gifticonService;
