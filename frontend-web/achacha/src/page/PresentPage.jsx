import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom'; // react-router-dom이 설치되어 있어야 합니다.
import { getPresentCardByCode } from '../api/PresentApi';
import PresentCard from '../components/PresentCard';
import TimeOverCard from '../components/TimeOverCard';
import NotFoundCard from '../components/NotFoundCard';

function PresentPage() {
  const { presentCardCode } = useParams(); // URL에서 presentCardCode 추출
  const [presentCardData, setPresentCardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isExpired, setIsExpired] = useState(false);
  const [isNotFound, setIsNotFound] = useState(false);

  useEffect(() => {
    if (presentCardCode) {
      const fetchPresentCard = async () => {
        try {
          setLoading(true);
          console.log(`PresentPage: presentCardCode=${presentCardCode} 데이터 요청 시작`);
          
          const data = await getPresentCardByCode(presentCardCode);
          
          // HTML 응답 체크
          if (typeof data === 'string' && data.includes('<!doctype html>')) {
            console.error('PresentPage: API가 HTML을 반환했습니다');
            throw new Error('API가 HTML을 반환했습니다. 서버 설정을 확인하세요.');
          }
          
          console.log('PresentPage: API 응답 데이터 수신 완료', data);
          
          // 데이터 검증
          if (!data) {
            throw new Error('API 응답에 데이터가 없습니다.');
          }
          
          // 필수 필드 확인
          const requiredFields = ['presentCardMessage', 'gifticonOriginalPath', 'templateCardPath'];
          const missingFields = requiredFields.filter(field => !data[field]);
          
          if (missingFields.length > 0) {
            console.warn(`PresentPage: API 응답에 필수 필드가 누락되었습니다: ${missingFields.join(', ')}`);
          }
          
          setPresentCardData(data);
          setError(null);
          setIsExpired(false);
          setIsNotFound(false);
        } catch (err) {
          console.error('PresentPage: 선물 카드 데이터 요청 실패:', err);
          
          // 만료된 선물 카드 처리 (PRESENT_005 에러코드)
          if (err.response?.data?.errorCode === 'PRESENT_005') {
            console.log('PresentPage: 선물 카드가 만료되었습니다.');
            setIsExpired(true);
            setIsNotFound(false);
            setError(null);
          } 
          // 찾을 수 없는 선물 카드 처리 (PRESENT_CARD_NOT_FOUND 에러코드)
          else if (err.response?.data?.errorCode === 'PRESENT_CARD_NOT_FOUND') {
            console.log('PresentPage: 선물 카드를 찾을 수 없습니다.');
            setIsNotFound(true);
            setIsExpired(false);
            setError(null);
          } 
          else {
            // 그 외 다른 오류 처리
            let errorMessage = '선물 카드를 불러오는 데 실패했습니다.';
            
            if (err.message.includes('HTML')) {
              errorMessage = 'API 서버 구성 오류: HTML 응답이 반환되었습니다. 관리자에게 문의하세요.';
            } else if (err.message.includes('Network Error')) {
              errorMessage = '네트워크 오류: 서버에 연결할 수 없습니다. 인터넷 연결을 확인하세요.';
            } else if (err.response?.status === 404) {
              errorMessage = '선물 카드를 찾을 수 없습니다. 링크가 만료되었거나 유효하지 않습니다.';
            }
            
            setError(errorMessage);
            setIsExpired(false);
            setIsNotFound(false);
          }
          setPresentCardData(null);
        }
        setLoading(false);
      };

      fetchPresentCard();
    } else {
      console.error('PresentPage: presentCardCode가 없습니다.');
      setError('유효하지 않은 선물 카드 코드입니다.');
      setLoading(false);
    }
  }, [presentCardCode]);

  if (loading) {
    return <div className="flex justify-center items-center h-screen text-xl">로딩 중...</div>;
  }

  // 카드가 만료된 경우 TimeOverCard 컴포넌트를 보여줌
  if (isExpired) {
    return <TimeOverCard />;
  }

  // 카드를 찾을 수 없는 경우 NotFoundCard 컴포넌트를 보여줌
  if (isNotFound) {
    return <NotFoundCard />;
  }

  if (error) {
    return <div className="flex flex-col justify-center items-center h-screen text-red-500 text-center">
      <h2 className="text-2xl font-bold">{error}</h2>
      <h3 className="mt-2 text-sm text-gray-600">선물 링크를 다시 확인해주세요.</h3>
      </div>;
  }

  if (!presentCardData) {
    // 이 경우는 일반적으로 error 상태에서 처리되지만, 만약을 위해 추가
    return <div className="flex justify-center items-center h-screen">선물 카드 정보를 찾을 수 없습니다.</div>;
  }

  // API로부터 받은 데이터 그대로 PresentCard 컴포넌트에 전달
  return <PresentCard presentCard={presentCardData} />;
}

export default PresentPage;
