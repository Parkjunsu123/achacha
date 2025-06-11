/* eslint-disable react-native/no-inline-styles */
// 상세 스크린 - 금액형

import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Modal,
  TextInput,
  FlatList,
} from 'react-native';
import { Icon } from 'react-native-elements';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '../../../components/ui';
import AlertDialog from '../../../components/ui/AlertDialog';
import { useTheme } from '../../../hooks/useTheme';
import { useTabBar } from '../../../context/TabBarContext';
import gifticonService from '../../../api/gifticonService';
import { BASE_URL } from '../../../api/config';
import { fetchShareBoxes, shareGifticonToShareBox } from '../../../api/shareBoxService';
import useAuthStore from '../../../store/authStore';

// 이미지 소스를 안전하게 가져오는 헬퍼 함수 (DetailProductScreen과 동일)
const getImageSource = path => {
  if (!path) {
    return require('../../../assets/images/adaptive_icon.png');
  }
  if (path.startsWith('http')) {
    return { uri: path };
  }
  // BASE_URL이 유효한지 확인하고 결합
  if (BASE_URL && typeof BASE_URL === 'string' && BASE_URL.length > 0) {
    // BASE_URL 끝에 슬래시가 없고, path 시작에 슬래시가 없으면 추가
    const separator = !BASE_URL.endsWith('/') && !path.startsWith('/') ? '/' : '';
    // BASE_URL 끝에 슬래시가 있고, path 시작에 슬래시가 있으면 중복 제거
    if (BASE_URL.endsWith('/') && path.startsWith('/')) {
      path = path.substring(1);
    }
    return { uri: `${BASE_URL}${separator}${path}` };
  }
  // BASE_URL이 유효하지 않으면 기본 이미지 반환
  return require('../../../assets/images/adaptive_icon.png');
};

const DetailAmountScreen = () => {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const { showTabBar } = useTabBar();
  const myUserId = useAuthStore(state => state.userId);

  // scope 상태 관리
  const [scope, setScope] = useState('MY_BOX'); // 'MY_BOX', 'SHARE_BOX' 또는 'USED'
  // 기프티콘 ID 관리
  const [gifticonId, setGifticonId] = useState(null);
  // 사용 상태 관리
  const [isUsing, setIsUsing] = useState(false);
  // 로딩 상태
  const [isLoading, setIsLoading] = useState(true);
  // 기프티콘 데이터 상태
  const [gifticonData, setGifticonData] = useState(null);
  // 바코드 정보 상태 추가
  const [barcodeInfo, setBarcodeInfo] = useState(null);
  const [barcodeLoading, setBarcodeLoading] = useState(false);
  // 금액 입력 모달 표시 상태
  const [modalVisible, setModalVisible] = useState(false);
  // 입력된 금액 상태
  const [amount, setAmount] = useState('');
  // AlertDialog 상태
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertType, setAlertType] = useState('delete'); // 'delete' 또는 'cancelShare'
  // 공유자인지 확인 (공유박스에서 내가 공유한 것인지)
  const [isSharer, setIsSharer] = useState(false);
  // 공유 모달 상태 관리
  const [isShareModalVisible, setShareModalVisible] = useState(false);
  // 공유 위치 선택 상태
  const [shareBoxType, setShareBoxType] = useState('SHARE_BOX');
  const [selectedShareBoxId, setSelectedShareBoxId] = useState(null);
  // 이미지 확대 보기 상태
  const [isImageViewVisible, setImageViewVisible] = useState(false);
  // 쉐어박스 목록 상태
  const [shareBoxes, setShareBoxes] = useState([]);

  // AlertDialog 상태 변수들
  const [customAlertVisible, setCustomAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [alertConfirmCallback, setAlertConfirmCallback] = useState(() => {});

  // 바텀탭 표시 - 화면이 포커스될 때마다 표시 보장
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      showTabBar();

      // 화면에 포커스가 있을 때마다 데이터 새로고침
      if (gifticonId) {
        console.log('[DetailAmountScreen] 화면 포커스 - 데이터 새로고침:', gifticonId);
        loadGifticonData(gifticonId);
        // 사용하기 모드 종료
        setIsUsing(false);
      }
    });

    // 초기 로드 시에도 바텀탭 표시
    showTabBar();

    return unsubscribe;
  }, [navigation, showTabBar, gifticonId]);

  // route.params에서 scope, gifticonId를 가져오는 부분
  useEffect(() => {
    if (route.params) {
      const {
        scope: newScope,
        gifticonId: newGifticonId,
        isSharer: newIsSharer,
        refresh,
      } = route.params;

      console.log(
        '[DetailAmountScreen] 라우트 파라미터 확인:',
        JSON.stringify(route.params, null, 2)
      );

      if (newScope) {
        setScope(newScope);
      }
      if (newGifticonId) {
        setGifticonId(newGifticonId);
      }
      if (newIsSharer !== undefined) {
        setIsSharer(newIsSharer);
      }

      // refresh 플래그가 true이거나 새 gifticonId가 있을 경우 데이터 다시 로드
      if ((refresh || newGifticonId !== gifticonId) && (newGifticonId || gifticonId)) {
        console.log(
          '[DetailAmountScreen] 데이터 새로고침 요청 - 기프티콘 ID:',
          newGifticonId || gifticonId,
          '리프레시:',
          refresh
        );
        loadGifticonData(newGifticonId || gifticonId);
        // 사용하기 모드 종료
        setIsUsing(false);
      }
    }
  }, [route.params, gifticonId]);

  // 기프티콘 ID가 변경되거나, scope가 변경될 때 데이터 로드
  // (refresh 파라미터 없이도 기본적인 데이터 로딩은 수행)
  useEffect(() => {
    if (gifticonId) {
      loadGifticonData(gifticonId);
    }
  }, [gifticonId, scope]); // scope 변경 시에도 데이터 리로드

  // 뒤로가기 처리 함수
  const handleGoBack = () => {
    navigation.goBack();
  };

  // 기프티콘 데이터 로드 함수
  const loadGifticonData = async id => {
    setIsLoading(true);
    try {
      // API 호출로 기프티콘 상세 정보 가져오기
      let responseData;

      console.log(
        `[DetailAmountScreen] 기프티콘 로딩 시작 - ID: ${id}, 현재 scope: ${scope}, usageType: ${route.params?.usageType}`
      );

      // usageType이 있거나 scope가 USED인 경우 무조건 사용완료 API 호출
      if (route.params?.usageType || scope === 'USED') {
        // 사용완료 API 호출 - 로그 명확하게 표시
        const reason = route.params?.usageType
          ? `usageType: ${route.params.usageType}`
          : `scope: ${scope}`;
        console.log(
          `[DetailAmountScreen] 사용완료 기프티콘 API 호출(${reason}) - /api/used-gifticons/${id}`
        );
        responseData = await gifticonService.getUsedGifticonDetail(id);
        console.log(
          '[DetailAmountScreen] 사용완료 기프티콘 응답 받음:',
          responseData ? 'Success' : 'No Data'
        );
      } else {
        // 사용가능 기프티콘(MY_BOX, SHARE_BOX)은 available API 호출
        console.log(
          `[DetailAmountScreen] 사용가능 기프티콘 API 호출 - /api/available-gifticons/${id} (scope: ${scope})`
        );
        responseData = await gifticonService.getGifticonDetail(id, scope);
        console.log(
          '[DetailAmountScreen] 사용가능 기프티콘 응답 받음:',
          responseData ? 'Success' : 'No Data'
        );
      }

      console.log('[DetailAmountScreen] 기프티콘 데이터 세팅:', {
        id: responseData?.gifticonId,
        type: responseData?.gifticonType,
        scope: scope,
        usageType: responseData?.usageType,
      });

      setGifticonData(responseData);
      setIsSharer(responseData.isSharer);

      // 사용완료 기프티콘인 경우 바코드 정보도 함께 로드
      if ((scope === 'USED' || route.params?.usageType) && responseData.usageType === 'SELF_USE') {
        try {
          console.log(`[DetailAmountScreen] 사용완료 바코드 정보 로드 시작 - ID: ${id}`);
          const barcodeResponse = await gifticonService.getUsedGifticonBarcode(id);
          if (barcodeResponse) {
            console.log('[DetailAmountScreen] 바코드 정보 로드 성공');
            setBarcodeInfo({
              barcodeNumber: barcodeResponse.gifticonBarcodeNumber,
              barcodePath: barcodeResponse.barcodePath,
            });
          }
        } catch (barcodeError) {
          console.error('[DetailAmountScreen] 바코드 정보 로드 실패:', barcodeError);
        }
      }

      setIsLoading(false);
    } catch (error) {
      console.error('[DetailAmountScreen] 기프티콘 데이터 로드 실패:', error);
      console.error('[DetailAmountScreen] 에러 응답:', error.response?.data);
      console.error('[DetailAmountScreen] 에러 상태 코드:', error.response?.status);
      setIsLoading(false);

      // 에러 처리
      if (error.response) {
        const status = error.response.status;
        const errorData = error.response.data;

        if (status === 403) {
          setAlertTitle('접근 권한 없음');
          setAlertMessage('해당 기프티콘에 접근할 수 없습니다.');
          setAlertConfirmCallback(() => () => {
            navigation.goBack();
          });
          setCustomAlertVisible(true);
        } else if (status === 404) {
          setAlertTitle('기프티콘 없음');
          setAlertMessage('기프티콘을 찾을 수 없습니다.');
          setAlertConfirmCallback(() => () => {
            navigation.goBack();
          });
          setCustomAlertVisible(true);
        } else {
          setAlertTitle('오류');
          setAlertMessage(
            `기프티콘을 불러오는 중 오류가 발생했습니다. ${errorData?.message || ''}`
          );
          setAlertConfirmCallback(() => () => {
            navigation.goBack();
          });
          setCustomAlertVisible(true);
        }
      }
    }
  };

  // 바코드 정보 로드 함수 추가
  const loadBarcodeInfo = async () => {
    if (!gifticonId) return;

    setBarcodeLoading(true);
    try {
      // API 호출로 바코드 정보 가져오기
      console.log(
        '[DetailAmountScreen] 바코드 정보 요청:',
        gifticonId,
        '사용완료 여부:',
        isUsed,
        'scope:',
        scope
      );
      const response = await gifticonService.getGifticonBarcode(gifticonId, scope);
      console.log('[DetailAmountScreen] 바코드 정보 응답:', response);

      if (response) {
        setBarcodeInfo({
          barcodeNumber: response.gifticonBarcodeNumber,
          barcodePath: response.barcodePath,
        });
      }
    } catch (error) {
      console.error('[DetailAmountScreen] 바코드 정보 로드 실패:', error);

      // 오류 메시지 처리
      let errorMessage = '바코드 정보를 불러오는데 실패했습니다.';

      // 선물/뿌리기 완료된 기프티콘인 경우 바코드 정보가 없음을 알림
      if (
        isUsed &&
        (gifticonData.usageType === 'PRESENT' || gifticonData.usageType === 'GIVE_AWAY')
      ) {
        errorMessage = '선물/뿌리기로 사용된 기프티콘은 바코드 정보를 확인할 수 없습니다.';
      } else if (error.message) {
        errorMessage = error.message;
      }

      setAlertTitle('알림');
      setAlertMessage(errorMessage);
      setAlertConfirmCallback(() => () => {});
      setCustomAlertVisible(true);
    } finally {
      setBarcodeLoading(false);
    }
  };

  // 날짜 포맷 함수 (YYYY.MM.DD)
  const formatDate = dateString => {
    const date = new Date(dateString);
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}.${mm}.${dd}`;
  };

  // 날짜 포맷 함수 (YYYY.MM.DD HH:MM)
  const formatDateTime = dateString => {
    const date = new Date(dateString);
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const hh = String(date.getHours()).padStart(2, '0');
    const min = String(date.getMinutes()).padStart(2, '0');
    return `${yyyy}.${mm}.${dd} ${hh}:${min}`;
  };

  // D-day 계산 함수
  const calculateDaysLeft = expiryDate => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // 현재 날짜의 시간을 00:00:00으로 설정
    const expiry = new Date(expiryDate);
    expiry.setHours(0, 0, 0, 0); // 만료 날짜의 시간을 00:00:00으로 설정

    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return '만료됨';
    } else if (diffDays === 0) {
      return 'D-day';
    }
    return diffDays;
  };

  // 금액 포맷 함수
  const formatAmount = amount => {
    return amount.toLocaleString() + '원';
  };

  // 숫자에 천단위 콤마 추가
  const formatNumber = number => {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  // 입력된 텍스트에서 콤마를 제거하고 숫자만 추출하는 함수
  const extractNumber = text => {
    return text.replace(/,/g, '');
  };

  // 쉐어박스 목록 불러오기
  const loadShareBoxes = async () => {
    try {
      const res = await fetchShareBoxes({ size: 20 });
      setShareBoxes(res.shareBoxes || []);
    } catch (e) {
      setAlertTitle('에러');
      setAlertMessage('쉐어박스 목록을 불러오지 못했습니다.');
      setAlertConfirmCallback(() => () => {});
      setCustomAlertVisible(true);
    }
  };

  // 공유 모달 열릴 때마다 쉐어박스 목록 불러오기
  useEffect(() => {
    if (isShareModalVisible) {
      loadShareBoxes();
    }
  }, [isShareModalVisible]);

  // 공유하기 기능 - 모달 표시로 변경
  const handleShare = () => {
    setShareBoxType('SHARE_BOX');
    if (shareBoxes.length > 0) {
      setSelectedShareBoxId(shareBoxes[0].shareBoxId);
    }
    setShareModalVisible(true);
  };

  // 공유 완료 처리
  const handleShareConfirm = async () => {
    // 공유 위치 선택 확인
    if (shareBoxType === 'SHARE_BOX' && !selectedShareBoxId) {
      setAlertTitle('알림');
      setAlertMessage('공유할 쉐어박스를 선택해주세요.');
      setAlertConfirmCallback(() => () => {});
      setCustomAlertVisible(true);
      return;
    }

    try {
      await shareGifticonToShareBox(selectedShareBoxId, gifticonId);

      setAlertTitle('성공');
      setAlertMessage('기프티콘이 성공적으로 공유되었습니다.');
      setAlertConfirmCallback(() => () => {
        setShareModalVisible(false);
      });
      setCustomAlertVisible(true);
    } catch (e) {
      setAlertTitle('에러');
      setAlertMessage('기프티콘 공유에 실패했습니다.');
      setAlertConfirmCallback(() => () => {});
      setCustomAlertVisible(true);
    }
  };

  // 공유 모달 닫기
  const handleCloseShareModal = () => {
    setShareModalVisible(false);
  };

  // 사용하기 버튼 클릭
  const handleUse = async () => {
    // 만료된 경우 바로 사용완료 처리
    const isExpired = calculateDaysLeft(gifticonData.gifticonExpiryDate) === '만료됨';

    if (isExpired) {
      // 만료된 경우 바로 사용완료 처리 (모달 표시 후 이동)
      setAlertTitle('사용 완료');
      setAlertMessage('만료된 기프티콘은 자동으로 사용완료 처리됩니다.');
      setAlertConfirmCallback(() => () => {
        // ManageListScreen으로 이동하면서 네비게이션 스택 초기화
        // 사용완료 탭으로 바로 이동하기 위한 파라미터 전달
        navigation.reset({
          index: 0,
          routes: [
            {
              name: 'Main',
              params: { screen: 'TabGifticonManage', initialTab: 'used' },
            },
          ],
        });
      });
      setCustomAlertVisible(true);
    } else {
      // 만료되지 않은 경우 사용 모드로 전환
      setIsUsing(true);
      // 바코드 정보 불러오기
      await loadBarcodeInfo();
    }
  };

  // 금액 입력 모달 표시
  const handleAmountInput = () => {
    setModalVisible(true);
  };

  // 사용내역 기능
  const handleHistory = () => {
    // 사용내역 조회 로직
    navigation.navigate('DetailAmountHistoryScreen', {
      id: gifticonData.gifticonId,
      gifticonId: gifticonData.gifticonId,
      brandName: gifticonData.brandName,
      gifticonName: gifticonData.gifticonName,
      scope: scope,
    });
  };

  // 사용내역 로드 함수 (사용완료된 경우 자동 로드)
  const loadTransactionHistory = async () => {
    if (isUsed && gifticonData && !gifticonData.transactions) {
      try {
        // 사용내역 API 호출
        console.log('[DetailAmountScreen] 사용내역 로드 시작 - ID:', gifticonData.gifticonId);
        const response = await gifticonService.getAmountGifticonUsageHistory(
          gifticonData.gifticonId
        );

        console.log('[DetailAmountScreen] 사용내역 응답:', response);

        if (response && response.usageHistories) {
          // 날짜 기준 내림차순 정렬
          const sortedHistories = [...response.usageHistories].sort((a, b) => {
            return new Date(b.usageHistoryCreatedAt) - new Date(a.usageHistoryCreatedAt);
          });

          console.log('[DetailAmountScreen] 사용내역 데이터:', sortedHistories);

          // 트랜잭션 데이터 구성
          const formattedTransactions = sortedHistories.map(history => {
            return {
              id: history.usageHistoryId.toString(),
              userName: history.userName || '사용자',
              // 날짜 및 시간을 직접 포맷팅
              date: formatDateTime(history.usageHistoryCreatedAt),
              amount: history.usageAmount,
              type: 'payment',
              rawDate: history.usageHistoryCreatedAt, // 원본 날짜 데이터도 저장
            };
          });

          console.log('[DetailAmountScreen] 변환된 트랜잭션:', formattedTransactions);

          // 기존 기프티콘 데이터에 트랜잭션 정보 업데이트
          setGifticonData(prev => ({
            ...prev,
            transactions: formattedTransactions,
          }));
        } else {
          // 사용내역 없음 상태 처리
          console.log('[DetailAmountScreen] 사용내역이 없음');
          setGifticonData(prev => ({
            ...prev,
            transactions: [],
          }));
        }
      } catch (error) {
        console.error('[DetailAmountScreen] 사용내역 로드 실패:', error);
        console.error('[DetailAmountScreen] 에러 응답:', error.response?.data);
        // 오류 발생 시 빈 배열 설정
        setGifticonData(prev => ({
          ...prev,
          transactions: [],
        }));
      }
    }
  };

  // 화면 포커스 시 사용내역 로드
  useEffect(() => {
    if (isUsed) {
      loadTransactionHistory();
    }
  }, [isUsed, gifticonData?.gifticonId]);

  // 금액 입력 완료 처리
  const handleConfirmAmount = async () => {
    // 콤마 제거 후 숫자로 변환
    const numericAmount = amount ? parseInt(extractNumber(amount), 10) : 0;

    // 금액 입력 값 검증
    if (!amount || isNaN(numericAmount) || numericAmount <= 0) {
      setAlertTitle('알림');
      setAlertMessage('유효한 금액을 입력해주세요.');
      setAlertConfirmCallback(() => () => {});
      setCustomAlertVisible(true);
      return;
    }

    // 입력한 금액이 잔액보다 크면 오류 (이미 입력 시 제한되지만 추가 검증)
    if (numericAmount > gifticonData.gifticonRemainingAmount) {
      setAlertTitle('알림');
      setAlertMessage('잔액보다 큰 금액을 사용할 수 없습니다.');
      setAlertConfirmCallback(() => () => {});
      setCustomAlertVisible(true);
      return;
    }

    try {
      // 모달 닫기
      setModalVisible(false);
      // 로딩 표시
      setIsLoading(true);

      // API 호출로 기프티콘 사용 처리
      const response = await gifticonService.useAmountGifticon(gifticonId, numericAmount);

      // 사용 모드 종료
      setIsUsing(false);
      setIsLoading(false);
      setAmount('');

      // API 응답에서 남은 잔액 확인
      const remainingAmount =
        response.gifticonRemainingAmount !== undefined
          ? response.gifticonRemainingAmount
          : gifticonData.gifticonRemainingAmount - numericAmount;

      console.log('[DetailAmountScreen] 사용 후 남은 잔액:', remainingAmount);

      // 잔액이 0원이면 사용완료 처리
      if (remainingAmount === 0) {
        // 사용 완료 모달 표시
        setAlertTitle('사용 완료');
        setAlertMessage('잔액이 모두 소진되어 사용완료 처리되었습니다.');
        setAlertConfirmCallback(() => () => {
          // ManageListScreen으로 이동하면서 사용완료 탭으로 설정
          navigation.reset({
            index: 0,
            routes: [
              {
                name: 'Main',
                params: { screen: 'TabGifticonManage', initialTab: 'used' },
              },
            ],
          });
        });
        setCustomAlertVisible(true);
      } else {
        // 일반 사용인 경우 - 사용내역 화면으로 이동
        navigation.navigate('DetailAmountHistoryScreen', {
          id: gifticonId,
          gifticonId: gifticonId,
          usedAmount: numericAmount, // 콤마가 제거된 숫자값 전달
          brandName: gifticonData.brandName,
          gifticonName: gifticonData.gifticonName,
          scope: scope,
        });
      }
    } catch (error) {
      setIsLoading(false);
      setAmount('');
      setModalVisible(false);

      console.error('기프티콘 사용 오류:', error);

      // 에러 메시지에서 "잔액 부족" 또는 관련 문구 확인
      const errorData = error.response?.data;
      const errorMessage = errorData?.message || '';
      const errorCode = errorData?.errorCode || errorData?.code || '';

      console.log('[DetailAmountScreen] 에러 데이터:', {
        message: errorMessage,
        code: errorCode,
        amount: numericAmount,
        remainingAmount: gifticonData.gifticonRemainingAmount,
      });

      // 에러 메시지나 코드에 잔액 관련 문구가 있거나, 사용 금액이 잔액과 동일한 경우
      if (
        errorMessage.includes('잔액') ||
        errorMessage.includes('금액') ||
        errorCode.includes('AMOUNT') ||
        numericAmount >= gifticonData.gifticonRemainingAmount // >= 로 변경하여 완화된 조건 적용
      ) {
        // 잔액 부족 에러인 경우 사용완료 처리
        setAlertTitle('사용 완료');
        setAlertMessage('잔액이 모두 소진되어 사용완료 처리되었습니다.');
        setAlertConfirmCallback(() => () => {
          // ManageListScreen으로 이동하면서 사용완료 탭으로 설정
          navigation.reset({
            index: 0,
            routes: [
              {
                name: 'Main',
                params: { screen: 'TabGifticonManage', initialTab: 'used' },
              },
            ],
          });
        });
        setCustomAlertVisible(true);
      } else {
        // 일반 에러 메시지 처리
        setAlertTitle('오류');
        setAlertMessage(errorMessage || '기프티콘 사용 중 오류가 발생했습니다.');
        setAlertConfirmCallback(() => () => {});
        setCustomAlertVisible(true);
      }
    }
  };

  // 모달 취소
  const handleCloseModal = () => {
    setModalVisible(false);
    setAmount('');
  };

  // 금액 칩 선택 처리
  const handleChipSelect = value => {
    if (value === 'all') {
      // '전액' 선택 시 남은 잔액 전체 설정 (콤마 포함)
      setAmount(gifticonData.gifticonRemainingAmount.toLocaleString());
    } else {
      // 기존 금액에 선택한 금액 추가 (콤마 제거 후 계산)
      const currentAmount = amount ? parseInt(extractNumber(amount), 10) : 0;
      const newAmount = currentAmount + value;

      // 잔액보다 크면 잔액으로 제한
      if (newAmount > gifticonData.gifticonRemainingAmount) {
        setAmount(gifticonData.gifticonRemainingAmount.toLocaleString());
      } else {
        setAmount(newAmount.toLocaleString());
      }
    }
  };

  // 사용 취소 기능
  const handleCancel = () => {
    setIsUsing(false);
  };

  // 돋보기 기능 - 확대 화면으로 이동
  const handleMagnify = async () => {
    // 바코드 정보가 없으면 먼저 로드
    if (!barcodeInfo) {
      await loadBarcodeInfo();
      // 로드 실패 시 리턴
      if (!barcodeInfo) return;
    }

    // 사용 완료 상태인 경우 (SELF_USE 유형만 바코드 있음)
    if (isUsed && gifticonData.usageType === 'SELF_USE') {
      navigation.navigate('UseAmountScreen', {
        id: gifticonData.gifticonId,
        gifticonId: gifticonData.gifticonId,
        isUsed: true,
        barcodeNumber: barcodeInfo?.barcodeNumber,
        barcodePath: barcodeInfo?.barcodePath,
        brandName: gifticonData.brandName,
        gifticonName: gifticonData.gifticonName,
        remainingAmount: gifticonData.gifticonOriginalAmount || 0,
      });
    } else if (!isUsed) {
      // 일반 사용 모드
      navigation.navigate('UseAmountScreen', {
        id: gifticonData.gifticonId,
        gifticonId: gifticonData.gifticonId,
        barcodeNumber: barcodeInfo?.barcodeNumber,
        barcodePath: barcodeInfo?.barcodePath,
        brandName: gifticonData.brandName,
        gifticonName: gifticonData.gifticonName,
        remainingAmount: gifticonData.gifticonRemainingAmount,
      });
    } else {
      // 선물/뿌리기로 사용완료된 경우 알림
      setAlertTitle('알림');
      setAlertMessage('선물/뿌리기로 사용된 기프티콘은 바코드를 확인할 수 없습니다.');
      setAlertConfirmCallback(() => () => {});
      setCustomAlertVisible(true);
    }
  };

  // 선물하기 기능
  const handleGift = () => {
    // 선물하기 화면으로 이동
    navigation.navigate('PresentScreen', {
      gifticonId: gifticonData.gifticonId,
      thumbnailPath: gifticonData.thumbnailPath,
    });
  };

  // 기프티콘 삭제 다이얼로그 표시
  const handleDelete = () => {
    setAlertType('delete');
    setAlertVisible(true);
  };

  // 공유 취소 다이얼로그 표시
  const handleCancelShare = () => {
    setAlertType('cancelShare');
    setAlertVisible(true);
  };

  // 다이얼로그 확인 버튼 처리
  const handleConfirm = async () => {
    setAlertVisible(false);

    try {
      if (alertType === 'delete') {
        // 자신 소유의 기프티콘만 삭제 가능 (쉐어박스에 공유되지 않은 것만)
        if (scope !== 'MY_BOX') {
          setAlertTitle('알림');
          setAlertMessage('마이박스의 기프티콘만 삭제할 수 있습니다.');
          setAlertConfirmCallback(() => () => {});
          setCustomAlertVisible(true);
          return;
        }

        // 삭제 처리 API 호출
        await gifticonService.deleteGifticon(gifticonId);
        console.log('[DetailAmountScreen] 기프티콘 삭제 성공:', gifticonId);

        // 성공 메시지
        setAlertTitle('성공');
        setAlertMessage('기프티콘이 성공적으로 삭제되었습니다.');
        setAlertConfirmCallback(() => () => {
          // 리스트 화면으로 이동
          navigation.goBack();
        });
        setCustomAlertVisible(true);
      } else if (alertType === 'cancelShare') {
        // 공유 취소 처리 API 호출
        if (!gifticonData.shareBoxId) {
          setAlertTitle('오류');
          setAlertMessage('쉐어박스 정보를 찾을 수 없습니다. 데이터 동기화 후 다시 시도해주세요.');
          setAlertConfirmCallback(() => () => {});
          setCustomAlertVisible(true);
          return;
        }

        await gifticonService.cancelShareGifticonFromBox(gifticonData.shareBoxId, gifticonId);
        console.log('[DetailAmountScreen] 기프티콘 공유 취소 성공:', gifticonId);

        // 성공 메시지
        setAlertTitle('성공');
        setAlertMessage('기프티콘 공유가 취소되었습니다.');
        setAlertConfirmCallback(() => () => {
          // 리스트 화면으로 이동
          navigation.goBack();
        });
        setCustomAlertVisible(true);
      }
    } catch (error) {
      console.error(
        `[DetailAmountScreen] ${alertType === 'delete' ? '삭제' : '공유 취소'} 실패:`,
        error
      );

      // 에러 메시지 처리
      let errorMessage = `기프티콘 ${alertType === 'delete' ? '삭제' : '공유 취소'} 중 오류가 발생했습니다.`;

      if (error.response) {
        const { status, data } = error.response;

        if (status === 400 && data.errorCode === 'SHAREBOX_010') {
          errorMessage = '이미 공유된 기프티콘은 삭제할 수 없습니다.';
        } else if (status === 400 && data.errorCode === 'SHAREBOX_011') {
          errorMessage = '이 쉐어박스에 공유되지 않은 기프티콘입니다.';
        } else if (status === 403 && data.errorCode === 'SHAREBOX_008') {
          errorMessage = '해당 쉐어박스에 접근 권한이 없습니다.';
        } else if (status === 403 && data.errorCode === 'GIFTICON_002') {
          errorMessage = '해당 기프티콘에 접근 권한이 없습니다.';
        } else if (status === 404) {
          if (data.errorCode === 'SHAREBOX_001') {
            errorMessage = '쉐어박스를 찾을 수 없습니다.';
          } else if (data.errorCode === 'GIFTICON_001') {
            errorMessage = '기프티콘 정보를 찾을 수 없습니다.';
          } else if (data.errorCode === 'GIFTICON_005') {
            errorMessage = '이미 삭제된 기프티콘입니다.';
          }
        } else if (data.message) {
          errorMessage = data.message;
        }
      }

      setAlertTitle('오류');
      setAlertMessage(errorMessage);
      setAlertConfirmCallback(() => () => {});
      setCustomAlertVisible(true);
    }
  };

  // 다이얼로그 취소 버튼 처리
  const handleCancelDialog = () => {
    setAlertVisible(false);
  };

  // 사용완료된 상품일 경우 다른 UI 표시
  const isUsed = scope === 'USED';

  // 사용 방식에 따른 텍스트 결정
  const getUsageTypeText = () => {
    switch (gifticonData.usageType) {
      case 'SELF_USE':
        return '사용완료';
      case 'PRESENT':
        return '선물완료';
      case 'GIVE_AWAY':
        return '뿌리기 완료';
      default:
        return '사용완료';
    }
  };

  // 이미지 확대 보기 토글
  const toggleImageView = () => {
    setImageViewVisible(!isImageViewVisible);
  };

  // 로딩 중이거나 데이터가 없는 경우 로딩 화면 표시
  if (isLoading || !gifticonData) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
        <View style={{ height: insets.top, backgroundColor: theme.colors.background }} />
        <View style={styles.header}>
          <TouchableOpacity onPress={handleGoBack} style={styles.backButtonContainer}>
            <Icon name="arrow-back-ios" type="material" size={22} color={theme.colors.black} />
          </TouchableOpacity>
          <Text variant="h3" weight="bold" style={styles.headerTitle}>
            기프티콘 상세
          </Text>
          <View style={styles.rightPlaceholder} />
        </View>
        <View style={styles.loadingContent}>
          <Text style={styles.loadingText}>로딩 중...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />

      {/* 안전 영역 상단 여백 */}
      <View style={{ height: insets.top, backgroundColor: theme.colors.background }} />

      {/* 커스텀 헤더 */}
      <View style={[styles.header, { backgroundColor: theme.colors.background }]}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButtonContainer}>
          <Icon name="arrow-back-ios" type="material" size={22} color={theme.colors.black} />
        </TouchableOpacity>
        <Text variant="h3" weight="bold" style={styles.headerTitle}>
          기프티콘 상세
        </Text>
        <View style={styles.rightPlaceholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollViewContentContainer}
      >
        <View style={styles.contentContainer}>
          {/* 카드 영역 */}
          <View style={styles.cardContainer}>
            {/* 기프티콘 이미지 및 정보 카드 */}
            <View style={styles.gifticonCard}>
              {isUsing ? (
                // 사용 모드일 때 바코드 표시
                <View style={styles.barcodeContainer}>
                  {barcodeLoading ? (
                    <View style={styles.barcodeLoadingContainer}>
                      <Text style={styles.barcodeLoadingText}>바코드 불러오는 중...</Text>
                    </View>
                  ) : (
                    <>
                      <Image
                        source={
                          barcodeInfo && barcodeInfo.barcodePath
                            ? getImageSource(barcodeInfo.barcodePath)
                            : gifticonData.barcodeImageUrl
                              ? { uri: gifticonData.barcodeImageUrl }
                              : require('../../../assets/images/barcode.png')
                        }
                        style={styles.barcodeImage}
                        resizeMode="contain"
                      />
                      <View style={styles.barcodeNumberContainer}>
                        <Text style={styles.barcodeNumberText}>
                          {barcodeInfo
                            ? barcodeInfo.barcodeNumber
                            : gifticonData.barcodeNumber || ''}
                        </Text>
                        <TouchableOpacity style={styles.magnifyButton} onPress={handleMagnify}>
                          <Icon name="search" type="material" size={24} color="#4A90E2" />
                        </TouchableOpacity>
                      </View>
                    </>
                  )}
                </View>
              ) : (
                // 기프티콘 이미지 표시 (사용완료면 흑백 처리)
                <View style={styles.imageContainer}>
                  <TouchableOpacity onPress={toggleImageView} activeOpacity={0.9}>
                    <Image
                      source={getImageSource(gifticonData.thumbnailPath)}
                      style={[
                        styles.gifticonImage,
                        isUsed && styles.grayScaleImage,
                        isUsed &&
                          gifticonData.usageType === 'SELF_USE' &&
                          styles.smallerGifticonImage,
                      ]}
                      resizeMode="cover"
                    />
                  </TouchableOpacity>

                  {/* 상단 액션 아이콘 */}
                  {!isUsed && (
                    <View style={styles.actionIconsContainer}>
                      {/* 마이박스일 경우 삭제 아이콘만 표시 */}
                      {scope === 'MY_BOX' && (
                        <TouchableOpacity style={styles.actionIconButton} onPress={handleDelete}>
                          <Icon name="delete" type="material" size={24} color="#718096" />
                        </TouchableOpacity>
                      )}

                      {/* 쉐어박스이고 내가 공유한 경우에만 공유 취소 아이콘 표시 */}
                      {scope === 'SHARE_BOX' &&
                        (isSharer || gifticonData.userId === Number(myUserId)) && (
                          <TouchableOpacity
                            style={styles.actionIconButton}
                            onPress={handleCancelShare}
                          >
                            <Icon name="person-remove" type="material" size={24} color="#718096" />
                          </TouchableOpacity>
                        )}
                    </View>
                  )}

                  {/* SELF_USE 유형의 사용완료 기프티콘인 경우만 바코드 표시 */}
                  {isUsed && gifticonData.usageType === 'SELF_USE' && (
                    <View style={styles.usedBarcodeContainer}>
                      <Image
                        source={
                          barcodeInfo && barcodeInfo.barcodePath
                            ? getImageSource(barcodeInfo.barcodePath)
                            : gifticonData.barcodeImageUrl
                              ? { uri: gifticonData.barcodeImageUrl }
                              : require('../../../assets/images/barcode.png')
                        }
                        style={styles.usedBarcodeImage}
                        resizeMode="contain"
                      />
                      <Text style={styles.usedBarcodeNumberText}>
                        {barcodeInfo ? barcodeInfo.barcodeNumber : gifticonData.barcodeNumber || ''}
                      </Text>
                    </View>
                  )}

                  {isUsed && (
                    <View style={styles.usedOverlay}>
                      <Text weight="bold" style={styles.usedText}>
                        {getUsageTypeText()}
                      </Text>
                    </View>
                  )}

                  {!isUsed && (
                    <View
                      style={[
                        styles.ddayButtonContainer,
                        typeof calculateDaysLeft(gifticonData.gifticonExpiryDate) === 'string' &&
                        calculateDaysLeft(gifticonData.gifticonExpiryDate) === '만료됨'
                          ? styles.expiredButtonContainer
                          : calculateDaysLeft(gifticonData.gifticonExpiryDate) <= 7 &&
                              calculateDaysLeft(gifticonData.gifticonExpiryDate) !== 'D-day'
                            ? styles.urgentDDayContainer
                            : calculateDaysLeft(gifticonData.gifticonExpiryDate) === 'D-day'
                              ? styles.urgentDDayContainer
                              : styles.normalDDayContainer,
                      ]}
                    >
                      <Text
                        weight="bold"
                        style={[
                          styles.ddayButtonText,
                          typeof calculateDaysLeft(gifticonData.gifticonExpiryDate) === 'string' &&
                          calculateDaysLeft(gifticonData.gifticonExpiryDate) === '만료됨'
                            ? styles.expiredButtonText
                            : calculateDaysLeft(gifticonData.gifticonExpiryDate) <= 7 &&
                                calculateDaysLeft(gifticonData.gifticonExpiryDate) !== 'D-day'
                              ? styles.urgentDDayText
                              : calculateDaysLeft(gifticonData.gifticonExpiryDate) === 'D-day'
                                ? styles.urgentDDayText
                                : styles.normalDDayText,
                        ]}
                      >
                        {typeof calculateDaysLeft(gifticonData.gifticonExpiryDate) === 'string'
                          ? calculateDaysLeft(gifticonData.gifticonExpiryDate)
                          : calculateDaysLeft(gifticonData.gifticonExpiryDate) === 'D-day'
                            ? 'D-day'
                            : `D-${calculateDaysLeft(gifticonData.gifticonExpiryDate)}`}
                      </Text>
                    </View>
                  )}
                </View>
              )}

              <View style={styles.infoContainer}>
                <Text style={styles.brandText}>{gifticonData.brandName}</Text>
                <Text style={styles.nameText} weight="bold">
                  {gifticonData.gifticonName}
                </Text>

                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>유효기간</Text>
                  <Text style={styles.infoValue}>
                    {formatDate(gifticonData.gifticonExpiryDate)}
                  </Text>
                </View>

                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>등록일시</Text>
                  <Text style={styles.infoValue}>
                    {formatDateTime(gifticonData.gifticonCreatedAt)}
                  </Text>
                </View>

                {/* 마이박스가 아닌 경우에만 등록자 정보 표시 */}
                {scope !== 'MY_BOX' && scope !== 'USED' && (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>등록자</Text>
                    <Text style={styles.infoValue}>{gifticonData.userName}</Text>
                  </View>
                )}

                {scope === 'SHARE_BOX' && gifticonData.shareBoxName && (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>쉐어박스</Text>
                    <Text style={styles.infoValue}>{gifticonData.shareBoxName}</Text>
                  </View>
                )}

                {/* 사용완료된 경우 사용일시 표시 및 사용내역 표시 */}
                {isUsed && (
                  <>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>사용일시</Text>
                      <Text style={styles.infoValue}>
                        {formatDateTime(gifticonData.usageHistoryCreatedAt)}
                      </Text>
                    </View>

                    {/* 사용자 정보 표시 추가
                    {gifticonData.usedBy && (
                      <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>사용자</Text>
                        <Text style={styles.infoValue}>{gifticonData.usedBy}</Text>
                      </View>
                    )} */}
                  </>
                )}

                <View style={styles.divider} />

                <View style={styles.amountInfoRow}>
                  <Text style={styles.amountLabel}>총 금액</Text>
                  <View style={styles.amountValueContainer}>
                    <Text weight="bold" style={styles.amountValue}>
                      {formatAmount(gifticonData.gifticonOriginalAmount)}
                    </Text>
                  </View>
                </View>

                <View style={styles.amountInfoRow}>
                  <Text style={styles.amountLabel}>잔액</Text>
                  <View style={styles.amountValueContainer}>
                    <Text
                      weight="bold"
                      style={[styles.amountValue, !isUsed && styles.remainingAmount]}
                    >
                      {formatAmount(isUsed ? 0 : gifticonData.gifticonRemainingAmount)}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* 버튼 영역 - 사용완료가 아닌 경우에만 표시 */}
          {!isUsed && (
            <View style={styles.buttonContainer}>
              {/* 버튼 영역 - 사용 상태에 따라 다른 UI */}
              {isUsing ? (
                // 사용 모드일 때 - 금액입력/취소 버튼을 두 줄로 표시
                <>
                  <TouchableOpacity
                    onPress={handleAmountInput}
                    style={{
                      width: '100%',
                      borderRadius: 8,
                      height: 56,
                      backgroundColor: '#56AEE9',
                      justifyContent: 'center',
                      alignItems: 'center',
                      flexDirection: 'row',
                      marginBottom: 10,
                    }}
                  >
                    <Text
                      style={{
                        color: '#FFFFFF',
                        fontSize: 16,
                        fontWeight: 'semibold',
                      }}
                    >
                      금액입력
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleCancel}
                    style={{
                      width: '100%',
                      borderRadius: 8,
                      height: 56,
                      backgroundColor: '#E5F4FE',
                      justifyContent: 'center',
                      alignItems: 'center',
                      flexDirection: 'row',
                    }}
                  >
                    <Text
                      style={{
                        color: '#278CCC',
                        fontSize: 16,
                        fontWeight: 'semibold',
                      }}
                    >
                      취소
                    </Text>
                  </TouchableOpacity>
                </>
              ) : (
                // 일반 모드일 때 - 상단 버튼 영역 (사용하기/사용내역)
                <>
                  <View style={styles.buttonRow}>
                    {calculateDaysLeft(gifticonData.gifticonExpiryDate) === '만료됨' ? (
                      // 만료된 기프티콘은 사용완료 버튼만 표시
                      <TouchableOpacity
                        onPress={handleUse}
                        style={{
                          width: '100%',
                          borderRadius: 8,
                          height: 56,
                          backgroundColor: '#56AEE9',
                          justifyContent: 'center',
                          alignItems: 'center',
                          flexDirection: 'row',
                        }}
                      >
                        <Text
                          style={{
                            color: '#FFFFFF',
                            fontSize: 16,
                            fontWeight: 'semibold',
                          }}
                        >
                          사용완료
                        </Text>
                      </TouchableOpacity>
                    ) : (
                      // 만료되지 않은 경우 사용하기 + 사용내역 버튼 표시
                      <>
                        <TouchableOpacity
                          onPress={handleUse}
                          style={{
                            flex: 1,
                            marginRight: 4,
                            borderRadius: 8,
                            height: 56,
                            backgroundColor: '#56AEE9',
                            justifyContent: 'center',
                            alignItems: 'center',
                            flexDirection: 'row',
                          }}
                        >
                          <Text
                            style={{
                              color: '#FFFFFF',
                              fontSize: 16,
                              fontWeight: 'semibold',
                            }}
                          >
                            사용하기
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={handleHistory}
                          style={{
                            flex: 1,
                            marginLeft: 4,
                            borderRadius: 8,
                            height: 56,
                            backgroundColor: '#E5F4FE',
                            justifyContent: 'center',
                            alignItems: 'center',
                            flexDirection: 'row',
                          }}
                        >
                          <Text
                            style={{
                              color: '#278CCC',
                              fontSize: 16,
                              fontWeight: 'semibold',
                            }}
                          >
                            사용내역
                          </Text>
                        </TouchableOpacity>
                      </>
                    )}
                  </View>

                  {scope === 'MY_BOX' &&
                    calculateDaysLeft(gifticonData.gifticonExpiryDate) !== '만료됨' && (
                      // 마이박스이고 만료되지 않은 경우에만 공유하기/선물하기 버튼 표시
                      <View style={styles.buttonRow}>
                        <TouchableOpacity
                          onPress={
                            gifticonData.gifticonOriginalAmount ===
                            gifticonData.gifticonRemainingAmount
                              ? handleShare
                              : undefined
                          }
                          disabled={
                            gifticonData.gifticonOriginalAmount !==
                            gifticonData.gifticonRemainingAmount
                          }
                          style={{
                            flex: 1,
                            marginRight: 4,
                            borderRadius: 8,
                            height: 56,
                            backgroundColor:
                              gifticonData.gifticonOriginalAmount ===
                              gifticonData.gifticonRemainingAmount
                                ? '#EEEEEE'
                                : '#F2F2F2',
                            justifyContent: 'center',
                            alignItems: 'center',
                            flexDirection: 'row',
                            opacity:
                              gifticonData.gifticonOriginalAmount ===
                              gifticonData.gifticonRemainingAmount
                                ? 1
                                : 0.5,
                          }}
                        >
                          <Icon name="inventory-2" type="material" size={22} color="#000000" />
                          <Text
                            style={{
                              marginLeft: 8,
                              color: '#000000',
                              fontSize: 16,
                              fontWeight: 'semibold',
                            }}
                          >
                            공유하기
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={
                            gifticonData.gifticonOriginalAmount ===
                            gifticonData.gifticonRemainingAmount
                              ? handleGift
                              : undefined
                          }
                          disabled={
                            gifticonData.gifticonOriginalAmount !==
                            gifticonData.gifticonRemainingAmount
                          }
                          style={{
                            flex: 1,
                            marginLeft: 4,
                            borderRadius: 8,
                            height: 56,
                            backgroundColor:
                              gifticonData.gifticonOriginalAmount ===
                              gifticonData.gifticonRemainingAmount
                                ? '#EEEEEE'
                                : '#F2F2F2',
                            justifyContent: 'center',
                            alignItems: 'center',
                            flexDirection: 'row',
                            opacity:
                              gifticonData.gifticonOriginalAmount ===
                              gifticonData.gifticonRemainingAmount
                                ? 1
                                : 0.5,
                          }}
                        >
                          <Icon name="card-giftcard" type="material" size={22} color="#000000" />
                          <Text
                            style={{
                              marginLeft: 8,
                              color: '#000000',
                              fontSize: 16,
                              fontWeight: 'semibold',
                            }}
                          >
                            선물하기
                          </Text>
                        </TouchableOpacity>
                      </View>
                    )}
                </>
              )}
            </View>
          )}

          {/* 사용내역 섹션 - 사용완료된 경우에만 표시 */}
          {isUsed && (
            <View style={styles.transactionSection}>
              <Text style={styles.transactionTitle} weight="bold">
                사용 내역
              </Text>

              {gifticonData.transactions && gifticonData.transactions.length > 0 ? (
                <View style={styles.transactionsContainer}>
                  {gifticonData.transactions.map(transaction => (
                    <View key={transaction.id} style={styles.transactionItem}>
                      <View style={styles.transactionInfo}>
                        <Text style={styles.transactionUser} weight="bold">
                          {transaction.userName}
                        </Text>
                        <Text style={styles.transactionDate}>{transaction.date}</Text>
                      </View>
                      <View style={styles.transactionAmount}>
                        <Text
                          style={[
                            styles.amountText,
                            { color: transaction.type === 'charge' ? '#1E88E5' : '#56AEE9' },
                          ]}
                          weight="bold"
                        >
                          {transaction.type === 'charge' ? '' : '-'}
                          {formatNumber(transaction.amount)}원
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              ) : (
                <View style={styles.emptyTransactionContainer}>
                  <Text style={styles.emptyTransactionText}>사용내역이 없습니다.</Text>
                </View>
              )}
            </View>
          )}

          {/* 하단 여백 추가 */}
          <View style={styles.bottomPadding} />
        </View>
      </ScrollView>

      {/* 이미지 확대 보기 모달 */}
      <Modal
        visible={isImageViewVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={toggleImageView}
      >
        <View style={styles.imageViewModal}>
          <TouchableOpacity
            style={styles.imageViewCloseButton}
            onPress={toggleImageView}
            activeOpacity={0.7}
          >
            <Icon name="close" type="material" size={28} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.imageViewContainer}
            activeOpacity={1}
            onPress={toggleImageView}
          >
            <Image
              source={
                // 원본 이미지 경로 우선 사용, 없으면 썸네일 경로 사용
                getImageSource(gifticonData?.originalImagePath || gifticonData?.thumbnailPath)
              }
              style={styles.fullImage}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>
      </Modal>

      {/* 금액 입력 모달 */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text weight="bold" style={styles.modalTitle}>
              사용 금액 입력
            </Text>

            <View style={styles.inputContainer}>
              <TextInput
                style={styles.amountInput}
                placeholder="0"
                keyboardType="number-pad"
                value={amount}
                onChangeText={text => {
                  // 콤마가 포함된 형식으로 표시하되, 입력값이 잔액을 초과하지 않도록 체크
                  const numericValue = text.replace(/[^0-9]/g, '');
                  if (numericValue === '') {
                    setAmount('');
                    return;
                  }

                  const numValue = parseInt(numericValue, 10);
                  // 잔액 초과 검사
                  if (numValue > gifticonData.gifticonRemainingAmount) {
                    // 잔액으로 제한
                    setAmount(gifticonData.gifticonRemainingAmount.toLocaleString());
                  } else {
                    setAmount(numValue.toLocaleString());
                  }
                }}
                maxLength={15}
              />
              <Text style={styles.wonText}>원</Text>
            </View>

            <View style={styles.chipsContainer}>
              <TouchableOpacity style={styles.chip} onPress={() => handleChipSelect(500)}>
                <Text style={styles.chipText}>+500</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.chip} onPress={() => handleChipSelect(1000)}>
                <Text style={styles.chipText}>+1,000</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.chip} onPress={() => handleChipSelect(5000)}>
                <Text style={styles.chipText}>+5,000</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.chip} onPress={() => handleChipSelect('all')}>
                <Text style={styles.chipText}>전액</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.remainingAmountText}>
              잔액: {formatAmount(gifticonData?.gifticonRemainingAmount || 0)}
            </Text>

            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleCloseModal}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelButtonText}>취소</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.confirmButton}
                onPress={handleConfirmAmount}
                activeOpacity={0.7}
              >
                <Text style={styles.confirmButtonText}>확인</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 알림 다이얼로그 */}
      <AlertDialog
        isVisible={alertVisible}
        onBackdropPress={handleCancelDialog}
        title={alertType === 'delete' ? '기프티콘 삭제' : '공유 취소'}
        message={
          alertType === 'delete'
            ? '이 기프티콘을 삭제하시겠습니까?'
            : '이 기프티콘의 공유를 취소하시겠습니까?'
        }
        confirmText="확인"
        cancelText="취소"
        onConfirm={handleConfirm}
        onCancel={handleCancelDialog}
        type="warning"
      />

      {/* 커스텀 알림 다이얼로그 */}
      <AlertDialog
        isVisible={customAlertVisible}
        onBackdropPress={() => setCustomAlertVisible(false)}
        title={alertTitle}
        message={alertMessage}
        confirmText="확인"
        onConfirm={() => {
          setCustomAlertVisible(false);
          if (alertConfirmCallback) alertConfirmCallback();
        }}
        hideCancel={true}
        type="info"
      />

      {/* 공유 모달 */}
      <Modal
        visible={isShareModalVisible}
        transparent
        animationType="slide"
        onRequestClose={handleCloseShareModal}
      >
        <View style={styles.shareModalOverlay}>
          <View style={[styles.modalContent, styles.boxModalContent]}>
            <Text variant="h4" weight="bold" style={styles.modalTitle}>
              쉐어박스 선택
            </Text>
            {/* 쉐어박스 선택 - FlatList로 변경 */}
            <FlatList
              data={shareBoxes}
              keyExtractor={item => String(item.shareBoxId)}
              renderItem={({ item: box }) => (
                <View style={styles.boxRow}>
                  <TouchableOpacity
                    style={[
                      styles.checkboxContainer,
                      shareBoxType === 'SHARE_BOX' &&
                        selectedShareBoxId === box.shareBoxId &&
                        styles.checkboxContainerSelected,
                    ]}
                    onPress={() => {
                      setShareBoxType('SHARE_BOX');
                      setSelectedShareBoxId(box.shareBoxId);
                    }}
                  >
                    <View style={styles.checkbox}>
                      {shareBoxType === 'SHARE_BOX' && selectedShareBoxId === box.shareBoxId && (
                        <Icon name="check" type="material" size={16} color={theme.colors.primary} />
                      )}
                    </View>
                    <Text style={styles.checkboxLabel}>{box.shareBoxName}</Text>
                    <View style={styles.ownerContainer}>
                      <Icon
                        name="person"
                        type="material"
                        size={14}
                        color={box.isOwner ? '#4A90E2' : '#999'}
                      />
                      <Text style={[styles.ownerText, box.isOwner && styles.ownerTextHighlight]}>
                        {box.ownerName || box.shareBoxUserName || '나'}
                      </Text>
                    </View>
                  </TouchableOpacity>
                </View>
              )}
              style={styles.boxSection}
              maxHeight={250}
              showsVerticalScrollIndicator={false}
              removeClippedSubviews={false}
              contentContainerStyle={{ paddingBottom: 10 }}
              ListEmptyComponent={
                <Text style={{ textAlign: 'center', color: '#999', marginTop: 20 }}>
                  쉐어박스가 없습니다.
                </Text>
              }
            />
            <View style={styles.boxButtonContainer}>
              <TouchableOpacity style={styles.cancelShareButton} onPress={handleCloseShareModal}>
                <Text variant="body1" weight="semibold" style={styles.cancelShareButtonText}>
                  취소
                </Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmShareButton} onPress={handleShareConfirm}>
                <Text variant="body1" weight="semibold" style={styles.confirmShareButtonText}>
                  공유
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  backButtonContainer: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    textAlign: 'center',
    flex: 1,
  },
  rightPlaceholder: {
    width: 44,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContentContainer: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  contentContainer: {
    padding: 16,
  },
  cardContainer: {
    marginTop: 2,
    marginBottom: 3,
  },
  gifticonCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E6F4FB',
  },
  imageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    paddingTop: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#E6F4FB',
    height: 300,
    backgroundColor: '#EEEEEE',
    position: 'relative',
    paddingBottom: 10,
  },
  gifticonImage: {
    width: 200,
    height: 200,
    aspectRatio: 1,
    borderRadius: 8,
    resizeMode: 'cover',
    marginBottom: 20,
  },
  infoContainer: {
    padding: 16,
  },
  brandText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
    textAlign: 'center',
  },
  nameText: {
    fontSize: 20,
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingHorizontal: 8,
  },
  infoLabel: {
    width: 80,
    fontSize: 16,
    color: '#737373',
    marginRight: 8,
  },
  infoValue: {
    flex: 1,
    fontSize: 16,
    color: '#000',
    textAlign: 'right',
  },

  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 12,
  },
  amountInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    marginBottom: 8,
  },
  amountLabel: {
    width: 80,
    fontSize: 16,
    color: '#737373',
    marginRight: 8,
  },
  amountValueContainer: {
    flex: 1,
  },
  amountValue: {
    fontSize: 16,
    color: '#333',
    textAlign: 'right',
  },
  remainingAmount: {
    color: '#278CCC',
    fontSize: 16,
    textAlign: 'right',
  },
  buttonContainer: {
    marginTop: 10,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  useButton: {
    flex: 1,
    marginRight: 4,
    borderRadius: 8,
    height: 56,
    backgroundColor: '#56AEE9',
  },
  useCompleteButton: {
    borderWidth: 1,
    width: '100%',
    height: 56,
  },
  historyButton: {
    flex: 1,
    marginLeft: 4,
    borderRadius: 8,
    height: 56,
    backgroundColor: '#E5F4FE',
  },
  actionButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
    marginBottom: 12,
  },
  actionButton: {
    flex: 1,
    height: 56,
    backgroundColor: '#A7DAF9',
    borderWidth: 0,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  grayScaleImage: {
    opacity: 0.7,
    // React Native는 기본적으로 grayscale 필터를 지원하지 않기 때문에
    // 투명도를 낮춰 흑백처럼 보이게 합니다.
  },
  smallerGifticonImage: {
    width: 160,
    height: 160,
    aspectRatio: 1,
    marginBottom: 5,
    marginTop: 20,
    resizeMode: 'cover',
    borderRadius: 8,
  },
  usedOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    paddingHorizontal: 20,
  },
  usedText: {
    color: 'white',
    fontSize: 28,
    textAlign: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
    overflow: 'hidden',
  },
  ddayButtonContainer: {
    position: 'absolute',
    bottom: 15,
    alignSelf: 'center',
    backgroundColor: 'rgba(252, 217, 217, 0.8)',
    paddingHorizontal: 20,
    paddingVertical: 5,
    borderRadius: 5,
  },
  ddayButtonText: {
    color: '#D33434',
    fontSize: 18,
  },
  expiredButtonContainer: {
    backgroundColor: 'rgba(153, 153, 153, 0.8)',
  },
  expiredButtonText: {
    color: '#737373',
  },
  urgentDDayContainer: {
    backgroundColor: 'rgba(234, 84, 85, 0.2)',
  },
  normalDDayContainer: {
    backgroundColor: 'rgba(114, 191, 255, 0.2)',
  },
  urgentDDayText: {
    color: '#EA5455',
  },
  normalDDayText: {
    color: '#72BFFF',
  },
  loadingContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  transactionTitle: {
    fontSize: 18,

    marginTop: 10,
    marginBottom: 12,
  },
  transactionsContainer: {
    marginTop: 5,
  },
  transactionItem: {
    backgroundColor: '#F9F9F9',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  transactionInfo: {
    flex: 1,
  },
  transactionUser: {
    fontSize: 16,
    color: '#333',
  },
  transactionDate: {
    fontSize: 14,
    color: '#737373',
    marginTop: 4,
  },
  transactionAmount: {
    alignItems: 'flex-end',
  },
  amountText: {
    fontSize: 18,
  },
  transactionSection: {
    marginTop: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  // 사용완료된 기프티콘 바코드 스타일
  usedBarcodeContainer: {
    alignItems: 'center',
    width: '100%',
    marginBottom: 0,
    padding: 20,
    borderRadius: 8,
  },
  usedBarcodeImage: {
    width: '100%',
    height: 60,
  },
  usedBarcodeNumberText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
    marginTop: 5,
  },
  // 사용 모드 바코드 스타일
  barcodeContainer: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E6F4FB',
    height: 220,
  },
  barcodeImage: {
    width: '90%',
    height: 150,
  },
  barcodeNumberContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  barcodeNumberText: {
    fontSize: 18,
    color: '#333',
    fontWeight: '500',
    marginRight: 2,
  },
  barcodeLoadingContainer: {
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
  },
  barcodeLoadingText: {
    fontSize: 16,
    color: '#666',
  },
  magnifyButton: {
    padding: 5,
  },
  shareButton: {
    flex: 1,
    marginRight: 4,
    borderRadius: 8,
    height: 56,
    backgroundColor: '#A7DAF9',
  },
  giftButton: {
    flex: 1,
    marginLeft: 4,
    borderRadius: 8,
    height: 56,
    backgroundColor: '#A7DAF9',
  },
  // 모달 관련 스타일
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: 320,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
  },
  modalTitle: {
    textAlign: 'center',
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#DDD',
    paddingBottom: 10,
    marginBottom: 16,
  },
  amountInput: {
    fontSize: 24,
    fontFamily: 'Pretendard-Bold',
    textAlign: 'right',
    width: 200,
    marginRight: 5,
  },
  wonText: {
    fontSize: 20,
    color: '#333',
  },
  chipsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  chip: {
    backgroundColor: '#F2F2F2',
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginHorizontal: 4,
  },
  chipText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  remainingAmountText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    alignSelf: 'flex-end',
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#F2F2F2',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginRight: 8,
  },
  confirmButton: {
    flex: 1,
    backgroundColor: '#56AEE9',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginLeft: 8,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: 'white',
  },
  bottomPadding: {
    height: 60,
  },
  // 액션 아이콘 컨테이너 스타일
  actionIconsContainer: {
    position: 'absolute',
    top: 10,
    right: 10,
    flexDirection: 'row',
    zIndex: 10,
  },
  actionIconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F9F9F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  // 공유 모달 관련 스타일
  shareModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  boxModalContent: {
    maxHeight: '70%',
  },
  modalSubtitle: {
    marginBottom: 12,
  },
  sectionTitle: {
    marginTop: 15,
  },
  boxSection: {
    marginBottom: 20,
  },
  boxRow: {
    marginBottom: 12,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E6E6E6',
  },
  checkboxContainerSelected: {
    borderColor: '#4A90E2',
    backgroundColor: '#F5F9FF',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#CCCCCC',
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  checkboxLabel: {
    flex: 1,
    fontSize: 16,
    color: '#333333',
  },
  ownerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderLeftWidth: 1,
    borderLeftColor: '#E0E0E0',
  },
  ownerText: {
    marginLeft: 4,
    fontSize: 12,
    color: '#999',
  },
  ownerTextHighlight: {
    color: '#4A90E2',
    fontWeight: '500',
  },
  boxButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  cancelShareButton: {
    flex: 1,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F2F2F2',
    borderRadius: 8,
    marginRight: 8,
  },
  confirmShareButton: {
    flex: 1,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#56AEE9',
    borderRadius: 8,
    marginLeft: 8,
  },
  cancelShareButtonText: {
    color: '#333333',
  },
  confirmShareButtonText: {
    color: '#FFFFFF',
  },
  // 이미지 확대 모달 스타일
  imageViewModal: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageViewContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullImage: {
    width: '90%',
    height: '80%',
  },
  imageViewCloseButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyTransactionContainer: {
    padding: 30,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9F9F9',
    borderRadius: 10,
    marginVertical: 10,
  },
  emptyTransactionText: {
    fontSize: 16,
    fontFamily: 'Pretendard-Medium',
    color: '#666',
    marginBottom: 16,
    textAlign: 'center',
  },
  viewHistoryButton: {
    backgroundColor: '#56AEE9',
    borderRadius: 8,
    padding: 10,
    paddingHorizontal: 20,
    marginTop: 4,
  },
  viewHistoryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'Pretendard-Medium',
  },
});

export default DetailAmountScreen;
