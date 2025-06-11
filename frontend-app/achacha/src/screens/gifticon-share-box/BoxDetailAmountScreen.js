/* eslint-disable react-native/no-inline-styles */
// 쉐어박스 상세 금액형 스크린

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { Icon } from 'react-native-elements';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '../../components/ui';
import AlertDialog from '../../components/ui/AlertDialog';
import { useTheme } from '../../hooks/useTheme';
import { useTabBar } from '../../context/TabBarContext';
import NavigationService from '../../navigation/NavigationService';
import { ERROR_MESSAGES } from '../../constants/errorMessages';
import { API_BASE_URL } from '../../api/config';
import gifticonService from '../../api/gifticonService';
import useAuthStore from '../../store/authStore';
import { cancelShareGifticon } from '../../api/shareBoxService';

const BoxDetailAmountScreen = () => {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const { showTabBar } = useTabBar();
  const myUserId = useAuthStore(state => state.userId);

  // 카테고리, 경로, 공유 상태 등 기본 정보 상태 관리
  const [scope, setScope] = useState('SHARE_BOX'); // 'SHARE_BOX' 또는 'USED'
  const [gifticonId, setGifticonId] = useState(null);
  const [usageType, setUsageType] = useState(null);
  // 사용 상태 관리
  const [isUsing, setIsUsing] = useState(false);
  // 로딩 상태
  const [isLoading, setIsLoading] = useState(true);
  // 기프티콘 데이터 상태
  const [gifticonData, setGifticonData] = useState(null);
  // 금액 입력 모달 표시 상태
  const [modalVisible, setModalVisible] = useState(false);
  // 입력된 금액 상태
  const [amount, setAmount] = useState('');
  // AlertDialog 상태
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertType, setAlertType] = useState('delete'); // 'delete' 또는 'cancelShare'
  // 바코드 관리
  const [barcodeImageUrl, setBarcodeImageUrl] = useState(null);
  const [barcodeNumber, setBarcodeNumber] = useState(null);
  const [barcodeLoading, setBarcodeLoading] = useState(false);
  // 이미지 확대 보기 상태 추가
  const [isImageViewVisible, setImageViewVisible] = useState(false);

  const latestRequestId = useRef(0);

  // 바텀탭 표시 - 화면이 포커스될 때마다 표시 보장
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      showTabBar();
    });

    // 초기 로드 시에도 바텀탭 표시
    showTabBar();

    return unsubscribe;
  }, [navigation, showTabBar]);

  // route.params에서 scope, gifticonId, usageType, usedAt을 가져오는 부분
  useEffect(() => {
    if (route.params) {
      if (route.params.scope) {
        setScope(route.params.scope);
      }
      if (route.params.gifticonId) {
        setGifticonId(route.params.gifticonId);
      }
      if (route.params.usageType) {
        setUsageType(route.params.usageType);
      }

      // refresh 플래그가 true이면 데이터 다시 로드
      if (route.params.refresh && gifticonId) {
        loadGifticonData(gifticonId);
      }
    }
  }, [route.params, gifticonId]);

  // 화면이 포커스될 때마다 데이터 새로고침
  useFocusEffect(
    React.useCallback(() => {
      console.log('[BoxDetailAmountScreen] 화면 포커스됨');
      const id = route.params?.gifticonId || route.params?.gifticon?.gifticonId;
      if (id) {
        console.log('[BoxDetailAmountScreen] 데이터 새로고침 시작, gifticonId:', id);
        loadGifticonData(id);
      }
    }, [route.params?.gifticonId, route.params?.gifticon?.gifticonId])
  );

  // 상세 정보 조회 useEffect
  useEffect(() => {
    // 1. route.params.gifticon이 있으면 우선 세팅
    if (route.params?.gifticon) {
      setGifticonData(route.params.gifticon);
      setIsLoading(false);

      // 기프티콘이 사용완료된 경우 scope 값을 'USED'로 변경
      if (
        route.params.gifticon.usageType ||
        route.params.scope === 'USED' ||
        route.params.gifticon.status === 'USED'
      ) {
        setScope('USED');
      }
    }

    // 2. gifticonId가 있으면 추가 API로 최신 정보 조회
    const id = route.params?.gifticonId || route.params?.gifticon?.gifticonId;
    const scopeParam = route.params?.scope || 'SHARE_BOX';
    const usageTypeParam = route.params?.usageType;

    if (id) {
      const requestId = ++latestRequestId.current;
      setIsLoading(true);

      // 사용완료 여부 확인 - scope가 USED이거나 usageType이 있는 경우 사용완료로 간주
      const isUsed =
        scopeParam === 'USED' ||
        usageTypeParam ||
        route.params?.gifticon?.status === 'USED' ||
        route.params?.gifticon?.usageType;

      if (isUsed) {
        // 사용완료 API 호출
        console.log(
          `[BoxDetailAmountScreen] 사용완료 API 호출 - id: ${id}, scope: ${scopeParam}, usageType: ${usageTypeParam}`
        );
        gifticonService
          .getUsedGifticonDetail(id)
          .then(data => {
            if (requestId === latestRequestId.current) {
              setGifticonData(prev => {
                if (!data.usedAt && prev?.usedAt) {
                  return { ...data, usedAt: prev.usedAt };
                }
                return data;
              });
              setScope('USED'); // scope 강제 설정
              if (data.usageType) setUsageType(data.usageType);
            }
          })
          .catch(error => {
            console.error('[BoxDetailAmountScreen] 사용완료 API 오류:', error);
            if (requestId === latestRequestId.current) {
              // 오류 발생 시에도 USED로 설정하고 사용가능 API 재시도 하지 않음
              setGifticonData(null);
            }
          })
          .finally(() => {
            if (requestId === latestRequestId.current) {
              setIsLoading(false);
            }
          });
      } else {
        // 사용가능 API 호출
        console.log(`[BoxDetailAmountScreen] 사용가능 API 호출 - id: ${id}, scope: ${scopeParam}`);
        gifticonService
          .getGifticonDetail(id, scopeParam)
          .then(data => {
            if (requestId === latestRequestId.current) {
              // 사용가능 API 호출 결과로 사용완료 정보가 있으면 scope 업데이트
              if (data.status === 'USED' || data.usageType) {
                setScope('USED');
                if (data.usageType) setUsageType(data.usageType);
              }
              setGifticonData(prev => {
                if (!data.usedAt && prev?.usedAt) {
                  return { ...data, usedAt: prev.usedAt };
                }
                return data;
              });
            }
          })
          .catch(error => {
            console.error('[BoxDetailAmountScreen] 사용가능 API 오류:', error);
            if (requestId === latestRequestId.current) {
              // 에러 코드가 404이고 GIFTICON_004(이미 사용된 기프티콘)인 경우 사용완료 API 재시도
              if (
                error.response?.status === 404 &&
                error.response?.data?.errorCode === 'GIFTICON_004'
              ) {
                console.log('[BoxDetailAmountScreen] 이미 사용된 기프티콘, 사용완료 API로 재시도');
                gifticonService
                  .getUsedGifticonDetail(id)
                  .then(usedData => {
                    if (requestId === latestRequestId.current) {
                      setGifticonData(prev => {
                        if (!usedData.usedAt && prev?.usedAt) {
                          return { ...usedData, usedAt: prev.usedAt };
                        }
                        return usedData;
                      });
                      setScope('USED');
                      if (usedData.usageType) setUsageType(usedData.usageType);
                    }
                  })
                  .catch(usedError => {
                    console.error('[BoxDetailAmountScreen] 사용완료 API 재시도 오류:', usedError);
                    if (requestId === latestRequestId.current) {
                      setGifticonData(null);
                    }
                  })
                  .finally(() => {
                    if (requestId === latestRequestId.current) {
                      setIsLoading(false);
                    }
                  });
              } else {
                setGifticonData(null);
                setIsLoading(false);
              }
            }
          })
          .finally(() => {
            // finally 블록은 재시도 호출이 있는 경우에는 실행하지 않도록 수정
            // error 변수가 없으므로 제거
            if (requestId === latestRequestId.current) {
              setIsLoading(false);
            }
          });
      }
    }
  }, [route.params]);

  useEffect(() => {
    console.log('[DEBUG] gifticonData 변경:', gifticonData);
    if (gifticonData) {
      console.log('[DEBUG] gifticonData.usedAt:', gifticonData.usedAt);
    }
  }, [gifticonData]);

  useEffect(() => {
    console.log('[DEBUG] isLoading 변경:', isLoading);
  }, [isLoading]);

  // 뒤로가기 처리 함수
  const handleGoBack = () => {
    NavigationService.goBack();
  };

  // 기프티콘 데이터 로드 함수
  const loadGifticonData = async id => {
    console.log(
      '[BoxDetailAmountScreen] loadGifticonData 시작, id:',
      id,
      'scope:',
      scope,
      'usageType:',
      route.params?.usageType
    );
    setIsLoading(true);
    try {
      // 현재 state보다 route.params 값을 우선적으로 확인 (최신 정보 반영)
      const currentScope = route.params?.scope || scope;
      const currentUsageType = route.params?.usageType || usageType;

      // 사용완료 판단 조건 개선:
      // 1. usageType이 있거나
      // 2. scope가 USED이거나
      // 3. route.params에서 전달된 gifticon.status가 USED인 경우
      const isUsedGifticon =
        currentUsageType ||
        currentScope === 'USED' ||
        route.params?.gifticon?.status === 'USED' ||
        route.params?.gifticon?.usageType;

      let data;

      if (isUsedGifticon) {
        // 사용완료 API 호출
        const reason = currentUsageType
          ? `usageType: ${currentUsageType}`
          : `scope: ${currentScope}`;
        console.log(
          `[BoxDetailAmountScreen] 사용완료 API 호출(${reason}) - /api/used-gifticons/${id}`
        );
        data = await gifticonService.getUsedGifticonDetail(id);
        // scope 상태 업데이트
        setScope('USED');
      } else {
        // 사용가능 기프티콘 API 호출
        console.log(
          `[BoxDetailAmountScreen] 사용가능 API 호출 - /api/available-gifticons/${id} (scope: ${scope})`
        );
        data = await gifticonService.getGifticonDetail(id, scope);
      }

      console.log('[BoxDetailAmountScreen] API 응답 데이터:', data ? 'Success' : 'No Data', {
        id: data?.gifticonId,
        type: data?.gifticonType,
        scope: scope,
        usageType: data?.usageType,
      });

      setGifticonData(prev => {
        if (!data.usedAt && prev?.usedAt) {
          return { ...data, usedAt: prev.usedAt };
        }
        return data;
      });
      if (data && data.isSharer !== undefined) {
        console.log('[BoxDetailAmountScreen] isSharer 존재:', data.isSharer);
      }

      // 기프티콘이 사용완료 상태라면 바로 사용내역도 로드
      if (isUsedGifticon || data.status === 'USED' || data.usageType) {
        console.log('[BoxDetailAmountScreen] 사용완료 상태 - 사용내역 자동 로드');
        setScope('USED');
        try {
          await loadTransactionHistory(data);
        } catch (historyError) {
          console.error('[BoxDetailAmountScreen] 사용내역 로드 실패:', historyError);
        }
      }
    } catch (error) {
      console.error('[BoxDetailAmountScreen] 데이터 로드 실패:', error);
      console.error('[BoxDetailAmountScreen] 에러 응답:', error.response?.data);
      console.error('[BoxDetailAmountScreen] 에러 상태 코드:', error.response?.status);
      setGifticonData(null);
    } finally {
      setIsLoading(false);
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

  // usedAt 보정 함수
  const getUsedAt = data => data?.usedAt || data?.usageHistoryCreatedAt || '';

  // 날짜 포맷 함수 (YYYY.MM.DD HH:MM)
  const formatDateTime = dateString => {
    console.log('[DEBUG] formatDateTime 호출:', dateString);
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

  // 사용하기 버튼 클릭
  const handleUse = async () => {
    const isExpired = calculateDaysLeft(gifticonData.gifticonExpiryDate) === '만료됨';

    if (isExpired) {
      // 만료된 경우 바로 사용완료 처리
      // API 호출로 기프티콘 상태를 사용완료로 변경 (실제 구현 시 주석 해제)
      // 예: await api.updateGifticonStatus(gifticonId, 'USED');

      // BoxListScreen으로 이동하면서 사용가능 탭으로 설정
      navigation.navigate('BoxList', {
        shareBoxId: gifticonData.shareBoxId,
        shareBoxName: gifticonData.shareBoxName,
        initialTab: 'available', // 사용가능 탭으로 이동
        refresh: true,
      });
    } else {
      // 사용 모드 시작
      try {
        // 로딩 표시 시작
        setIsLoading(true);
        console.log('[BoxDetailAmountScreen] 사용하기 버튼 클릭 - 바코드 로드 시작', {
          gifticonId: gifticonData?.gifticonId,
          type: gifticonData?.gifticonType,
        });

        // 바코드 상태 초기화
        setBarcodeImageUrl(null);
        setBarcodeNumber(null);

        // 바코드 정보 로드 호출
        await loadBarcodeInfo();

        // 바코드 정보 결과 확인
        console.log('[BoxDetailAmountScreen] 바코드 로드 상태:', {
          barcodeImageUrl: barcodeImageUrl ? '있음' : '없음',
          barcodeNumber: barcodeNumber || '없음',
        });

        // 사용 모드 활성화
        setIsUsing(true);
      } catch (error) {
        console.error('[BoxDetailAmountScreen] 바코드 로드 실패:', error);
        Alert.alert('바코드 조회 실패', '바코드 정보를 불러오지 못했습니다. 다시 시도해주세요.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  // 금액 입력 모달 표시
  const handleAmountInput = () => {
    setModalVisible(true);
  };

  // 금액 입력 완료 처리
  const handleConfirmAmount = async () => {
    // 금액 입력 값 검증
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      Alert.alert('오류', '유효한 금액을 입력해주세요.');
      return;
    }

    // 입력한 금액이 잔액보다 크면 오류
    if (Number(amount) > gifticonData.gifticonRemainingAmount) {
      Alert.alert('오류', '잔액보다 큰 금액을 사용할 수 없습니다.');
      return;
    }

    try {
      // 모달 닫기
      setModalVisible(false);
      // 로딩 표시
      setIsLoading(true);

      // API 호출로 기프티콘 사용 처리
      const response = await gifticonService.useAmountGifticon(
        gifticonData.gifticonId,
        Number(amount)
      );

      // 사용 모드 종료
      setIsUsing(false);
      setIsLoading(false);
      setAmount('');

      // API 응답에서 남은 잔액 확인
      const remainingAmount =
        response.gifticonRemainingAmount !== undefined
          ? response.gifticonRemainingAmount
          : gifticonData.gifticonRemainingAmount - Number(amount);

      console.log('[BoxDetailAmountScreen] 사용 처리 완료, 남은 잔액:', remainingAmount);

      // 잔액이 0원이면 사용완료 처리
      if (remainingAmount === 0) {
        // 먼저 사용내역 저장 API 호출
        try {
          console.log('[BoxDetailAmountScreen] 전액 사용 완료 - 사용내역 로드 시작');
          await loadTransactionHistory();
        } catch (historyError) {
          console.error('[BoxDetailAmountScreen] 사용내역 로드 실패:', historyError);
        }

        // 그 후 사용 완료 모달 표시
        Alert.alert('사용 완료', '잔액이 모두 소진되어 사용완료 처리되었습니다.', [
          {
            text: '확인',
            onPress: () => {
              // BoxListScreen으로 이동하면서 사용완료 탭으로 설정
              navigation.navigate('BoxList', {
                shareBoxId: gifticonData.shareBoxId,
                shareBoxName: gifticonData.shareBoxName,
                initialTab: 'used', // 사용완료 탭으로 이동
                refresh: true,
              });
            },
          },
        ]);
      } else {
        // 일반 사용인 경우 - 사용내역 화면으로 이동
        navigation.navigate('BoxDetailAmountHistoryScreen', {
          id: gifticonData.gifticonId,
          scope: scope,
          usedAmount: amount,
          brandName: gifticonData.brandName,
          gifticonName: gifticonData.gifticonName,
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

      console.log('[BoxDetailAmountScreen] 에러 데이터:', {
        message: errorMessage,
        code: errorCode,
        amount: Number(amount),
        remainingAmount: gifticonData.gifticonRemainingAmount,
      });

      // 에러 메시지나 코드에 잔액 관련 문구가 있거나, 사용 금액이 잔액과 동일한 경우
      if (
        errorMessage.includes('잔액') ||
        errorMessage.includes('금액') ||
        errorCode.includes('AMOUNT') ||
        Number(amount) === gifticonData.gifticonRemainingAmount ||
        Number(amount) >= gifticonData.gifticonRemainingAmount
      ) {
        // 먼저 사용내역 저장 API 호출
        try {
          console.log('[BoxDetailAmountScreen] 에러 발생 시에도 사용내역 로드 시도');
          await loadTransactionHistory();
        } catch (historyError) {
          console.error('[BoxDetailAmountScreen] 사용내역 로드 실패:', historyError);
        }

        // 잔액 부족 에러인 경우 사용완료 처리
        Alert.alert('사용 완료', '잔액이 모두 소진되어 사용완료 처리되었습니다.', [
          {
            text: '확인',
            onPress: () => {
              // BoxListScreen으로 이동하면서 사용완료 탭으로 설정
              navigation.navigate('BoxList', {
                shareBoxId: gifticonData.shareBoxId,
                shareBoxName: gifticonData.shareBoxName,
                initialTab: 'used', // 사용완료 탭으로 이동
                refresh: true,
              });
            },
          },
        ]);
      } else {
        // 일반 에러 메시지 처리
        Alert.alert('오류', errorMessage || '기프티콘 사용 중 오류가 발생했습니다.');
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
      // '전액' 선택 시 남은 잔액 전체 설정
      setAmount(gifticonData.gifticonRemainingAmount.toString());
    } else {
      // 기존 금액에 선택한 금액 추가
      const currentAmount = Number(amount) || 0;
      const newAmount = currentAmount + value;

      // 잔액보다 크면 잔액으로 제한
      if (newAmount > gifticonData.gifticonRemainingAmount) {
        setAmount(gifticonData.gifticonRemainingAmount.toString());
      } else {
        setAmount(newAmount.toString());
      }
    }
  };

  // 사용 취소 기능
  const handleCancel = () => {
    setIsUsing(false);
  };

  // 돋보기 기능 - 확대 화면으로 이동
  const handleMagnify = () => {
    if (scope === 'USED' && gifticonData.usageType === 'SELF_USE') {
      // 사용완료된 기프티콘인 경우
      navigation.navigate('UseAmountScreen', {
        id: gifticonData.gifticonId,
        barcodeNumber: gifticonData.barcodeNumber,
        barcodePath: barcodeImageUrl,
        isUsed: true,
      });
    } else {
      // 일반 사용모드인 경우
      navigation.navigate('UseAmountScreen', {
        id: gifticonData.gifticonId,
        barcodeNumber: barcodeNumber,
      });
    }
  };

  // 사용내역 기능
  const handleHistory = () => {
    // 사용내역 조회 로직
    const brandName =
      route.params?.brandName || gifticonData.brandName || gifticonData.brand || '-';
    const gifticonName =
      route.params?.gifticonName || gifticonData.gifticonName || gifticonData.name || '-';

    navigation.navigate('BoxDetailAmountHistoryScreen', {
      id: gifticonData.gifticonId,
      gifticonId: gifticonData.gifticonId,
      scope: scope,
      brandName: brandName,
      gifticonName: gifticonName,
    });
  };

  // 공유 취소 다이얼로그 표시
  const handleCancelShare = () => {
    setAlertType('cancelShare');
    setAlertVisible(true);
  };

  // 다이얼로그 확인 버튼 처리
  const handleConfirm = async () => {
    setAlertVisible(false);

    if (alertType === 'delete') {
      // 삭제 처리 로직
      navigation.goBack();
    } else if (alertType === 'cancelShare') {
      // 공유 취소 처리 로직
      try {
        await cancelShareGifticon(gifticonData.shareBoxId, gifticonData.gifticonId);
        Alert.alert('성공', '기프티콘 공유가 취소되었습니다.', [
          {
            text: '확인',
            onPress: () => navigation.goBack(),
          },
        ]);
      } catch (error) {
        const errorCode = error?.response?.data?.code;
        const errorMessage =
          ERROR_MESSAGES[errorCode] ||
          error?.response?.data?.message ||
          '알 수 없는 오류가 발생했습니다.';
        Alert.alert('공유 취소 실패', errorMessage);
      }
    }
  };

  // 다이얼로그 취소 버튼 처리
  const handleCancelDialog = () => {
    setAlertVisible(false);
  };

  // 사용 유형에 따른 텍스트 설정
  const getUsageTypeText = () => {
    switch (usageType) {
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

  // 공유하기 기능
  const handleShare = async () => {
    try {
      // 선택된 쉐어박스 확인
      if (!gifticonData || !gifticonData.shareBoxId) {
        Alert.alert('오류', '쉐어박스 정보를 찾을 수 없습니다.');
        return;
      }

      // 실제 API 호출
      await gifticonService.shareGifticon(gifticonId, gifticonData.shareBoxId);

      Alert.alert('성공', '기프티콘이 성공적으로 공유되었습니다.');
    } catch (error) {
      const errorCode = error?.response?.data?.code;
      const errorMessage = ERROR_MESSAGES[errorCode] || ERROR_MESSAGES.default;

      Alert.alert('공유 실패', errorMessage);
    }
  };

  // 선물하기 기능
  const handleGift = () => {
    // 선물하기 로직 구현
    // console.log('기프티콘 선물하기');
  };

  const getImageUrl = thumbnailPath => {
    if (!thumbnailPath) return null;
    if (typeof thumbnailPath === 'string') {
      if (thumbnailPath.startsWith('http://') || thumbnailPath.startsWith('https://')) {
        return thumbnailPath;
      }
      return API_BASE_URL + thumbnailPath;
    }
    // require로 불러온 객체(로컬 이미지)일 경우
    return thumbnailPath;
  };

  const imageSource = gifticonData
    ? (() => {
        const img = getImageUrl(
          scope === 'USED' && usageType !== 'SELF_USE'
            ? gifticonData.thumbnailPath
            : gifticonData.originalImagePath || gifticonData.thumbnailPath
        );
        if (typeof img === 'string') {
          return { uri: img };
        }
        if (img) {
          return img; // require로 불러온 로컬 이미지
        }
        // 기본 이미지 fallback
        return require('../../assets/images/dummy_starbuckscard.png');
      })()
    : require('../../assets/images/dummy_starbuckscard.png');

  // 기프티콘 ID가 변경되거나, scope가 변경될 때 데이터 로드
  // (refresh 파라미터 없이도 기본적인 데이터 로딩은 수행)
  useEffect(() => {
    if (gifticonId) {
      loadGifticonData(gifticonId);
    }
  }, [gifticonId, scope]); // scope 변경 시에도 데이터 리로드

  // 사용완료 기프티콘의 바코드 정보 로드
  useEffect(() => {
    // 사용완료된 기프티콘이고, SELF_USE 타입일 때 바코드 정보 로드
    if (gifticonData && scope === 'USED' && usageType === 'SELF_USE') {
      console.log('[BoxDetailAmountScreen] 사용완료 기프티콘 바코드 정보 자동 로드 시작');
      loadUsedGifticonBarcode(gifticonData.gifticonId);
    }
  }, [gifticonData, scope, usageType]);

  // 바코드 정보 로드 함수 (사용하기 모드)
  const loadBarcodeInfo = async () => {
    if (!gifticonData?.gifticonId) {
      console.error('[BoxDetailAmountScreen] 바코드 조회 실패: gifticonId가 없음');
      return;
    }

    setBarcodeLoading(true);
    try {
      const id = gifticonData.gifticonId;
      console.log('[BoxDetailAmountScreen] 사용가능 바코드 정보 요청 시작:', {
        id: id,
        scope: scope,
      });

      // API 호출
      const response = await gifticonService.getGifticonBarcode(id, scope);
      console.log('[BoxDetailAmountScreen] 바코드 API 응답 원본:', JSON.stringify(response));

      if (response) {
        // API 명세에 따라 바코드 경로와 번호 설정
        // gifticonBarcodeNumber와 barcodePath 필드를 사용함
        if (response.barcodePath) {
          console.log('[BoxDetailAmountScreen] 바코드 이미지 경로:', response.barcodePath);
          setBarcodeImageUrl(response.barcodePath);
        }

        if (response.gifticonBarcodeNumber) {
          console.log('[BoxDetailAmountScreen] 바코드 번호 설정:', response.gifticonBarcodeNumber);
          setBarcodeNumber(response.gifticonBarcodeNumber);
        } else {
          console.warn('[BoxDetailAmountScreen] 응답에 바코드 번호 없음:', response);
        }
      } else {
        console.warn('[BoxDetailAmountScreen] 바코드 API 응답이 비어있음');
      }
    } catch (error) {
      console.error('[BoxDetailAmountScreen] 바코드 정보 로드 실패:', error);
      console.error('[BoxDetailAmountScreen] 에러 응답:', error.response?.data);
      Alert.alert('바코드 정보 조회 실패', '바코드 정보를 불러오지 못했습니다.');
    } finally {
      setBarcodeLoading(false);
    }
  };

  // 사용완료 기프티콘의 바코드 정보 로드 함수
  const loadUsedGifticonBarcode = async id => {
    if (!id) {
      console.error('[BoxDetailAmountScreen] 사용완료 바코드 조회 실패: id가 없음');
      return;
    }

    setBarcodeLoading(true);
    try {
      console.log('[BoxDetailAmountScreen] 사용완료 바코드 정보 요청 시작:', id);

      // API 호출
      const response = await gifticonService.getUsedGifticonBarcode(id);
      console.log(
        '[BoxDetailAmountScreen] 사용완료 바코드 API 응답 원본:',
        JSON.stringify(response)
      );

      if (response) {
        // API 명세에 따라 바코드 경로와 번호 설정
        // gifticonBarcodeNumber와 barcodePath 필드를 사용함
        if (response.barcodePath) {
          console.log('[BoxDetailAmountScreen] 사용완료 바코드 이미지 경로:', response.barcodePath);
          setBarcodeImageUrl(response.barcodePath);
        }

        if (response.gifticonBarcodeNumber) {
          console.log(
            '[BoxDetailAmountScreen] 사용완료 바코드 번호 설정:',
            response.gifticonBarcodeNumber
          );
          setBarcodeNumber(response.gifticonBarcodeNumber);
        } else {
          console.warn('[BoxDetailAmountScreen] 사용완료 응답에 바코드 번호 없음:', response);
        }
      } else {
        console.warn('[BoxDetailAmountScreen] 사용완료 바코드 API 응답이 비어있음');
      }
    } catch (error) {
      console.error('[BoxDetailAmountScreen] 사용완료 바코드 정보 로드 실패:', error);
      console.error('[BoxDetailAmountScreen] 사용완료 에러 응답:', error.response?.data);
      // 바코드 정보 로드 실패 시 기본값 유지, 별도의 알림 없음
    } finally {
      setBarcodeLoading(false);
    }
  };

  // 이미지 확대 보기 토글 함수 추가
  const toggleImageView = () => {
    setImageViewVisible(!isImageViewVisible);
  };

  // 사용내역 로드 함수 개선
  const loadTransactionHistory = async dataSource => {
    const targetData = dataSource || gifticonData;
    if (!targetData || !targetData.gifticonId) {
      console.error('[BoxDetailAmountScreen] 사용내역 로드 실패: 기프티콘 데이터 없음');
      return [];
    }

    try {
      console.log('[BoxDetailAmountScreen] 사용내역 로드 시작 - ID:', targetData.gifticonId);
      const response = await gifticonService.getAmountGifticonUsageHistory(targetData.gifticonId);

      console.log('[BoxDetailAmountScreen] 사용내역 응답:', response ? 'Success' : 'No Data');

      if (response && response.usageHistories && response.usageHistories.length > 0) {
        // 날짜 기준 내림차순 정렬
        const sortedHistories = [...response.usageHistories].sort((a, b) => {
          return new Date(b.usageHistoryCreatedAt) - new Date(a.usageHistoryCreatedAt);
        });

        console.log('[BoxDetailAmountScreen] 사용내역 개수:', sortedHistories.length);
        console.log(
          '[BoxDetailAmountScreen] 첫 번째 사용내역:',
          JSON.stringify(sortedHistories[0], null, 2)
        );

        // 트랜잭션 데이터 구성
        const formattedTransactions = sortedHistories.map(history => {
          return {
            id: history.usageHistoryId.toString(),
            userName: history.userName || '사용자',
            date: formatDateTime(history.usageHistoryCreatedAt),
            amount: history.usageAmount,
            type: 'payment',
            rawDate: history.usageHistoryCreatedAt,
          };
        });

        console.log('[BoxDetailAmountScreen] 변환된 트랜잭션 개수:', formattedTransactions.length);

        // 기존 기프티콘 데이터에 트랜잭션 정보 업데이트
        setGifticonData(prev => {
          if (!prev) return { ...targetData, transactions: formattedTransactions };
          return { ...prev, transactions: formattedTransactions };
        });

        return formattedTransactions;
      } else {
        console.log('[BoxDetailAmountScreen] 사용내역이 없음');
        setGifticonData(prev => {
          if (!prev) return { ...targetData, transactions: [] };
          return { ...prev, transactions: [] };
        });
        return [];
      }
    } catch (error) {
      console.error('[BoxDetailAmountScreen] 사용내역 로드 실패:', error);
      console.error('[BoxDetailAmountScreen] 에러 응답:', error.response?.data);

      // 오류 발생 시 빈 배열 설정
      setGifticonData(prev => {
        if (!prev) return { ...targetData, transactions: [] };
        return { ...prev, transactions: [] };
      });
      return [];
    }
  };

  // 화면이 로드될 때 사용내역 불러오는 useEffect 추가
  useEffect(() => {
    if (scope === 'USED' && gifticonData && gifticonData.gifticonId) {
      console.log('[BoxDetailAmountScreen] 사용완료 기프티콘의 사용내역 자동 로드', {
        id: gifticonData.gifticonId,
        scope: scope,
      });
      loadTransactionHistory();
    }
  }, [scope, gifticonData?.gifticonId]);

  // 기프티콘 데이터 로드 완료 후 바코드 정보 미리 로드
  useEffect(() => {
    // 사용 가능한 기프티콘이고, 바코드 정보가 없을 때만 미리 로드
    if (
      gifticonData &&
      gifticonData.gifticonId &&
      scope !== 'USED' &&
      !isUsing &&
      !barcodeNumber &&
      !barcodeLoading
    ) {
      console.log('[BoxDetailAmountScreen] 바코드 정보 사전 로드 시작');
      // 지연 시간을 두고 로드 (화면 렌더링 완료 후)
      const timer = setTimeout(() => {
        loadBarcodeInfo();
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [gifticonData?.gifticonId, scope, isUsing, barcodeNumber, barcodeLoading]);

  // 렌더링 분기 직전 로그
  if (isLoading || !gifticonData) {
    // 로딩 중 표시
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

  // 만료 여부 확인
  const isExpired = new Date(gifticonData.gifticonExpiryDate) < new Date();
  // D-day 계산
  const dDay = calculateDaysLeft(gifticonData.gifticonExpiryDate);

  const brandName = route.params?.brandName || gifticonData.brandName || gifticonData.brand || '-';
  const gifticonName =
    route.params?.gifticonName || gifticonData.gifticonName || gifticonData.name || '-';

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
                <View style={styles.barcodeContainer}>
                  {barcodeLoading ? (
                    <View style={styles.barcodeLoadingContainer}>
                      <Text style={styles.barcodeLoadingText}>바코드 불러오는 중...</Text>
                    </View>
                  ) : (
                    <>
                      <Image
                        source={
                          barcodeImageUrl
                            ? { uri: barcodeImageUrl }
                            : require('../../assets/images/barcode.png')
                        }
                        style={styles.barcodeImage}
                        resizeMode="contain"
                      />
                      <View style={styles.barcodeNumberContainer}>
                        <Text style={styles.barcodeNumberText}>
                          {barcodeNumber || '바코드 번호를 불러오는 중...'}
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
                  <View style={styles.imageWrapper}>
                    <TouchableOpacity onPress={toggleImageView} activeOpacity={0.9}>
                      <Image
                        source={imageSource}
                        style={[
                          styles.gifticonImage,
                          scope === 'USED' && styles.grayScaleImage,
                          scope === 'USED' &&
                            usageType === 'SELF_USE' &&
                            styles.smallerGifticonImage,
                        ]}
                        resizeMode="cover"
                      />
                    </TouchableOpacity>
                  </View>

                  {/* 상단 액션 아이콘 */}
                  {scope !== 'USED' && (
                    <View style={styles.actionIconsContainer}>
                      {/* 내가 공유한 경우에만 공유 취소 아이콘 표시 */}
                      {scope === 'SHARE_BOX' && gifticonData.userId === Number(myUserId) && (
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
                  {scope === 'USED' && usageType === 'SELF_USE' && (
                    <View style={styles.usedBarcodeContainer}>
                      {barcodeLoading ? (
                        <Text style={styles.barcodeLoadingText}>바코드 불러오는 중...</Text>
                      ) : (
                        <>
                          <Image
                            source={
                              barcodeImageUrl
                                ? { uri: barcodeImageUrl }
                                : gifticonData.barcodeImageUrl
                                  ? { uri: gifticonData.barcodeImageUrl }
                                  : require('../../assets/images/barcode.png')
                            }
                            style={styles.usedBarcodeImage}
                            resizeMode="contain"
                          />
                          <Text style={styles.usedBarcodeNumberText}>
                            {barcodeNumber || '바코드 번호를 불러오는 중...'}
                          </Text>
                        </>
                      )}
                    </View>
                  )}

                  {/* 만료일 배지 */}
                  {scope !== 'USED' && (
                    <View
                      style={[
                        styles.ddayButtonContainer,
                        typeof dDay === 'string' && dDay === '만료됨'
                          ? styles.expiredButtonContainer
                          : dDay <= 7 && dDay !== 'D-day'
                            ? styles.urgentDDayContainer
                            : dDay === 'D-day'
                              ? styles.urgentDDayContainer
                              : styles.normalDDayContainer,
                      ]}
                    >
                      <Text
                        weight="bold"
                        style={[
                          styles.ddayButtonText,
                          typeof dDay === 'string' && dDay === '만료됨'
                            ? styles.expiredButtonText
                            : dDay <= 7 && dDay !== 'D-day'
                              ? styles.urgentDDayText
                              : dDay === 'D-day'
                                ? styles.urgentDDayText
                                : styles.normalDDayText,
                        ]}
                      >
                        {typeof dDay === 'string' ? dDay : dDay === 'D-day' ? 'D-day' : `D-${dDay}`}
                      </Text>
                    </View>
                  )}

                  {/* 사용완료 오버레이 */}
                  {scope === 'USED' && (
                    <View style={styles.usedOverlay}>
                      <Text style={styles.usedText}>{getUsageTypeText()}</Text>
                    </View>
                  )}
                </View>
              )}

              <View style={styles.infoContainer}>
                <Text style={styles.brandText}>{brandName}</Text>
                <Text weight="bold" style={styles.nameText}>
                  {gifticonName}
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

                {/* 등록자 정보 표시 (항상 표시) */}
                {gifticonData.userName && (
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

                {scope === 'USED' && (
                  <>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>사용일시</Text>
                      <Text style={styles.infoValue}>
                        {formatDateTime(getUsedAt(gifticonData))}
                      </Text>
                    </View>
                    {gifticonData.usedBy && (
                      <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>사용자</Text>
                        <Text style={styles.infoValue}>{gifticonData.usedBy}</Text>
                      </View>
                    )}
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
                      style={[styles.amountValue, scope !== 'USED' && styles.remainingAmount]}
                    >
                      {formatAmount(scope === 'USED' ? 0 : gifticonData.gifticonRemainingAmount)}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
          {/* 버튼 영역 - 사용완료가 아닌 경우에만 표시 */}
          {scope !== 'USED' && (
            <View style={styles.buttonContainer}>
              {/* 버튼 영역 - 사용 상태에 따라 다른 UI */}
              {isUsing ? (
                // 사용 모드일 때 - 금액입력/취소 버튼을 두 줄로 표시
                <>
                  <TouchableOpacity onPress={handleAmountInput} style={styles.useButton}>
                    <Text style={styles.useButtonText}>금액입력</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={handleCancel} style={styles.historyButton}>
                    <Text style={styles.historyButtonText}>취소</Text>
                  </TouchableOpacity>
                </>
              ) : (
                // 일반 모드일 때 - 상단 버튼 영역 (사용하기/사용내역)
                <>
                  <View style={styles.buttonRow}>
                    {isExpired ? (
                      // 만료된 기프티콘은 사용완료 버튼만 표시
                      <TouchableOpacity onPress={handleUse} style={styles.useButton}>
                        <Text style={styles.useButtonText}>사용완료</Text>
                      </TouchableOpacity>
                    ) : (
                      // 만료되지 않은 경우 사용하기 + 사용내역 버튼 표시
                      <>
                        <TouchableOpacity
                          onPress={handleUse}
                          style={styles.useButton}
                          disabled={gifticonData.gifticonRemainingAmount <= 0}
                        >
                          <Text style={styles.useButtonText}>사용하기</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={handleHistory} style={styles.historyButton}>
                          <Text style={styles.historyButtonText}>사용내역</Text>
                        </TouchableOpacity>
                      </>
                    )}
                  </View>

                  {scope === 'MY_BOX' && !isExpired && (
                    // 마이박스이고 만료되지 않은 경우만 공유하기/선물하기 버튼 표시
                    <View style={styles.buttonRow}>
                      <TouchableOpacity onPress={handleShare} style={styles.shareButton}>
                        <Icon name="inventory-2" type="material" size={22} color="#000000" />
                        <Text style={styles.shareButtonText}>공유하기</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={handleGift} style={styles.giftButton}>
                        <Icon name="card-giftcard" type="material" size={22} color="#000000" />
                        <Text style={styles.giftButtonText}>선물하기</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </>
              )}
            </View>
          )}
          {/* 사용내역 섹션 - 사용완료된 경우에만 표시 */}
          {scope === 'USED' && (
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

      {/* 이미지 확대 보기 모달 추가 */}
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
                // 원본 이미지 표시를 위한 소스 선택 로직 개선
                (() => {
                  // 원본 이미지 경로 우선 사용
                  if (gifticonData?.originalImagePath) {
                    return { uri: getImageUrl(gifticonData.originalImagePath) };
                  }
                  // 원본 이미지가 없는 경우 썸네일 경로 사용
                  else if (gifticonData?.thumbnailPath) {
                    return { uri: getImageUrl(gifticonData.thumbnailPath) };
                  }
                  // 모두 없는 경우 기본 이미지
                  return require('../../assets/images/dummy_starbuckscard.png');
                })()
              }
              style={styles.fullImage}
              resizeMode="contain"
            />
          </TouchableOpacity>
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
  imageWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 180,
    height: 180,
    margin: 'auto',
    marginTop: 10,
    marginBottom: 10,
    borderRadius: 8,
    overflow: 'hidden',
  },
  gifticonImage: {
    width: '100%',
    height: '100%',
    aspectRatio: 1,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  grayScaleImage: {
    opacity: 0.7,
  },
  smallerGifticonImage: {
    width: 160,
    height: 160,
    aspectRatio: 1,
    marginBottom: 2,
    marginTop: 50,
    resizeMode: 'cover',
    borderRadius: 8,
  },
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
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 10,
  },
  useButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'semibold',
  },
  historyButton: {
    flex: 1,
    marginLeft: 4,
    borderRadius: 8,
    height: 56,
    backgroundColor: '#E5F4FE',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  historyButtonText: {
    color: '#278CCC',
    fontSize: 16,
    fontWeight: 'semibold',
  },
  shareButton: {
    flex: 1,
    marginRight: 4,
    borderRadius: 8,
    height: 56,
    backgroundColor: '#EEEEEE',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  giftButton: {
    flex: 1,
    marginLeft: 4,
    borderRadius: 8,
    height: 56,
    backgroundColor: '#EEEEEE',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  shareButtonText: {
    marginLeft: 8,
    color: '#000000',
    fontSize: 16,
    fontWeight: 'semibold',
  },
  giftButtonText: {
    marginLeft: 8,
    color: '#000000',
    fontSize: 16,
    fontWeight: 'semibold',
  },
  transactionSection: {
    marginTop: 5,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
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
  bottomPadding: {
    height: 60,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
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
  modalTitle: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
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
    fontFamily: 'Pretendard-Bold',
    fontSize: 24,
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
    color: '#278CCC',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: 'white',
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
    fontFamily: 'Pretendard-Bold',
    textAlign: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
    overflow: 'hidden',
  },
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
    fontFamily: 'Pretendard-Medium',
    marginRight: 2,
  },
  magnifyButton: {
    marginLeft: 12,
    padding: 8,
  },
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
  barcodeLoadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  barcodeLoadingText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Pretendard-Bold',
  },
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
    color: '#666',
    marginBottom: 16,
    textAlign: 'center',
    fontFamily: 'Pretendard-Regular',
  },
});

export default BoxDetailAmountScreen;
