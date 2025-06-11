import axios from 'axios';

// 프록시 설정으로 인해 상대 경로 사용 (vite.config.js에서 프록시 설정됨)
const API_URL = '/api/presents/cards'; 

export const getPresentCardByCode = async (presentCardCode) => {
  try {
    console.log(`API 호출 시작: ${API_URL}/${presentCardCode}`);
    
    // 명시적인 Content-Type 헤더 추가
    const response = await axios.get(`${API_URL}/${presentCardCode}`, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    
    // API 응답 검증
    console.log('API 호출 응답 타입:', typeof response.data);
    
    // HTML 응답 감지
    if (typeof response.data === 'string' && response.data.includes('<!doctype html>')) {
      console.error('API가 HTML을 반환했습니다. API 서버 설정을 확인하세요.');
      throw new Error('API가 HTML을 반환했습니다. 서버 설정을 확인하세요.');
    }
    
    console.log('API 호출 성공! 받은 원본 데이터:', response.data);
    
    // 응답 데이터의 구조 검증
    if (response.data) {
      const requiredFields = ['presentCardCode', 'presentCardMessage', 'gifticonOriginalPath', 'templateCardPath'];
      const missingFields = requiredFields.filter(field => !response.data[field]);
      
      if (missingFields.length > 0) {
        console.warn('API 응답에 필요한 필드가 없습니다:', missingFields);
      }
    }
    
    return response.data;
  } catch (error) {
    if (error.response) {
      // 서버에서 응답이 왔지만 에러인 경우
      console.error('API Error Status:', error.response.status);
      console.error('API Error Headers:', error.response.headers);
      console.error('API Error Data:', error.response.data);
      
      // HTML 응답 감지
      if (typeof error.response.data === 'string' && error.response.data.includes('<!doctype html>')) {
        console.error('API가 HTML 에러 페이지를 반환했습니다. 백엔드 로그를 확인하세요.');
        throw new Error('API가 HTML을 반환했습니다. 서버 설정을 확인하세요.');
      }
      
      // 선물 카드 만료 에러 (PRESENT_005) 감지 및 처리
      if (error.response.data && error.response.data.errorCode === 'PRESENT_005') {
        console.log('선물 카드가 만료되었습니다 (PRESENT_005)');
        // 에러 객체에 response 데이터를 그대로 포함시켜 상위 컴포넌트에서 처리할 수 있도록 함
        throw error;
      }
      
      // 선물 카드를 찾을 수 없음 에러 (PRESENT_CARD_NOT_FOUND) 감지 및 처리
      if (error.response.data && error.response.data.errorCode === 'PRESENT_CARD_NOT_FOUND') {
        console.log('선물 카드를 찾을 수 없습니다 (PRESENT_CARD_NOT_FOUND)');
        // 에러 객체에 response 데이터를 그대로 포함시켜 상위 컴포넌트에서 처리할 수 있도록 함
        throw error;
      }
      
      throw new Error(error.response.data.message || '선물카드를 불러오는데 실패했습니다.');
    } else if (error.request) {
      // 요청은 보냈지만 응답이 없는 경우
      console.error('Network Error:', error.request);
      throw new Error('서버와 통신할 수 없습니다. 네트워크 연결 또는 CORS 설정을 확인해주세요.');
    } else {
      // 요청 설정 중 에러가 발생한 경우
      console.error('Error:', error.message);
      throw new Error('요청을 처리하는 중 오류가 발생했습니다.');
    }
  }
};
