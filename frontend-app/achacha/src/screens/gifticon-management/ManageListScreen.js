// 기프티콘 조회 스크린

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Animated,
  TouchableWithoutFeedback,
  RefreshControl,
  TextInput,
  Modal,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Icon } from 'react-native-elements';
import { Text } from '../../components/ui';
import AlertDialog from '../../components/ui/AlertDialog';
import CategoryTabs from '../../components/common/CategoryTabs';
import TabFilter from '../../components/common/TabFilter';
import { useTheme } from '../../hooks/useTheme';
import { Shadow } from 'react-native-shadow-2';
import { Swipeable } from 'react-native-gesture-handler';
import AsyncStorage from '@react-native-async-storage/async-storage';
import gifticonService from '../../api/gifticonService';
import FastImage from 'react-native-fast-image';

// 문자열을 15자로 제한하는 유틸 함수 추가
const truncateText = (text, maxLength) => {
  if (!text) return '';
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
};

const ManageListScreen = () => {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const [currentUserId, setCurrentUserId] = useState(null);

  // AsyncStorage에서 사용자 ID 가져오기
  useEffect(() => {
    const getUserId = async () => {
      try {
        const userId = await AsyncStorage.getItem('userId');
        if (userId) {
          setCurrentUserId(parseInt(userId));
          console.log('저장소에서 가져온 사용자 ID:', userId);
        }
      } catch (error) {
        console.error('사용자 ID 가져오기 실패:', error);
      }
    };
    getUserId();
  }, []);

  // route.params에서 initialTab을 가져와 초기 탭 설정
  const initialTab = route.params?.initialTab || 'mybas';

  // 카테고리 상태 - 초기값은 route.params에서 받은 initialTab으로 설정
  const [selectedCategory, setSelectedCategory] = useState(initialTab);
  // 필터 상태
  const [selectedFilter, setSelectedFilter] = useState('all');
  // 정렬 상태
  const [sortBy, setSortBy] = useState({
    mybas: 'recent',
    sharebas: 'recent',
    used: 'recent',
  });
  // 정렬 드롭다운 표시 상태
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  // 필터링된 기프티콘 상태
  const [filteredGifticons, setFilteredGifticons] = useState([]);

  // API 호출 관련 상태 추가
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [nextPage, setNextPage] = useState(null);

  // 카테고리 탭 데이터
  const categories = [
    { id: 'mybas', name: '마이박스' },
    { id: 'sharebas', name: '쉐어박스' },
    { id: 'used', name: '사용완료' },
  ];

  // 필터 탭 데이터
  const filterTabs = [
    { id: 'all', title: '전체', width: 45 },
    { id: 'product', title: '상품형', width: 55 },
    { id: 'amount', title: '금액형', width: 55 },
  ];

  // 정렬 옵션
  const sortOptions = [
    { id: 'recent', title: '등록순' },
    { id: 'expiry', title: '임박순' },
  ];

  // 사용완료 탭 정렬 옵션
  const usedSortOptions = [{ id: 'recent', title: '사용순' }];

  // 스타일 정의를 여기로 이동
  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    header: {
      height: 80,
      paddingHorizontal: 12,
      paddingTop: 30,
      marginBottom: 0,
      backgroundColor: theme.colors.background,
      flexDirection: 'row',
      alignItems: 'center',
      borderBottomWidth: 0,
    },
    headerTitle: {
      fontSize: 24,
      letterSpacing: -0.5,
      fontFamily: theme.fonts.fontWeight.bold,
      lineHeight: 36,
    },
    contentWrapper: {
      flex: 1,
      paddingHorizontal: 2,
      paddingTop: 0,
    },
    filterContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 0,
    },
    tabFilterContainer: {
      flex: 1,
    },
    sortContainer: {
      position: 'relative',
      zIndex: 1,
    },
    sortButton: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: '#E0E0E0',
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 6,
    },
    sortButtonText: {
      fontSize: 14,
      marginRight: 5,
      color: '#333',
      fontFamily: theme.fonts.fontWeight.regular,
    },
    sortDropdown: {
      position: 'absolute',
      top: 40,
      right: 0,
      backgroundColor: 'white',
      borderWidth: 1,
      borderColor: '#E0E0E0',
      borderRadius: 8,
      width: 160,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    sortOption: {
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderBottomWidth: 1,
      borderBottomColor: '#F0F0F0',
    },
    sortOptionText: {
      fontSize: 14,
      color: '#333',
      fontFamily: theme.fonts.fontWeight.regular,
    },
    sortOptionTextSelected: {
      color: '#56AEE9',
      fontFamily: theme.fonts.fontWeight.bold,
    },
    scrollView: {
      flex: 1,
      marginTop: 5,
    },
    scrollViewContent: {
      paddingTop: 0,
      paddingBottom: 30,
    },
    gifticonList: {
      paddingVertical: 1,
    },
    shadowContainer: {
      width: '100%',
      borderRadius: 12,
      marginBottom: 10,
    },
    gifticonItem: {
      width: '100%',
    },
    gifticonContent: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 8,
      backgroundColor: '#FFFFFF',
      borderRadius: 12,
      position: 'relative',
    },
    imageContainer: {
      marginLeft: 8,
      marginRight: 12,
    },
    gifticonImage: {
      width: 60,
      height: 60,
      borderRadius: 8,
    },
    textContainer: {
      flex: 1,
    },
    brandText: {
      fontSize: 16,
      color: '#333',
      marginTop: 2,
      marginBottom: 1,
      fontFamily: theme.fonts.fontWeight.bold,
    },
    nameText: {
      fontSize: 14,
      color: '#666',
      marginBottom: 1,
      paddingRight: 80,
      fontFamily: theme.fonts.fontWeight.regular,
    },
    dDayContainer: {
      position: 'absolute',
      right: 15,
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 6,
    },
    urgentDDay: {
      backgroundColor: 'rgba(234, 84, 85, 0.15)',
    },
    normalDDay: {
      backgroundColor: 'rgba(114, 191, 255, 0.15)',
    },
    dDayText: {
      fontSize: 14,
      fontFamily: theme.fonts.fontWeight.bold,
    },
    urgentDDayText: {
      color: '#EA5455',
    },
    normalDDayText: {
      color: '#72BFFF',
    },
    emptyContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      padding: 30,
    },
    emptyText: {
      fontSize: 16,
      color: '#737373',
      fontFamily: theme.fonts.fontWeight.regular,
    },
    sharedByText: {
      fontSize: 12,
      color: '#278CCC',
      fontStyle: 'normal',
      fontFamily: theme.fonts.fontWeight.bold,
    },
    shareBoxInfoContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 0,
    },
    shareBoxIcon: {
      marginRight: 3,
    },
    shareBoxText: {
      fontSize: 12,
      color: '#278CCC',
      fontFamily: theme.fonts.fontWeight.bold,
    },
    leftAction: {
      width: 100,
      backgroundColor: '#4CAF50',
      justifyContent: 'center',
      marginBottom: 10,
      borderTopLeftRadius: 12,
      borderBottomLeftRadius: 12,
    },
    rightAction: {
      width: '100',
      backgroundColor: '#278CCC',
      justifyContent: 'center',
      marginBottom: 10,
      borderTopRightRadius: 12,
      borderBottomRightRadius: 12,
    },
    actionButton: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    actionIconContainer: {
      justifyContent: 'center',
      alignItems: 'center',
      width: 80,
    },
    actionText: {
      color: 'white',
      fontSize: 12,
      marginTop: 4,
      fontFamily: theme.fonts.fontWeight.semiBold,
    },
    bookmarkContainer: {
      position: 'absolute',
      top: -2,
      left: 12,
      zIndex: 10,
    },
    expiredDDay: {
      backgroundColor: 'rgba(153, 153, 153, 0.15)',
    },
    expiredDDayText: {
      color: '#737373',
      fontFamily: theme.fonts.fontWeight.bold,
    },
    loadingContainer: {
      padding: 20,
      alignItems: 'center',
    },
    errorContainer: {
      padding: 20,
      alignItems: 'center',
      justifyContent: 'center',
    },
    errorText: {
      color: '#EA5455',
      fontSize: 16,
      fontFamily: theme.fonts.fontWeight.medium,
      textAlign: 'center',
      marginBottom: 15,
    },
    retryButton: {
      paddingHorizontal: 20,
      paddingVertical: 10,
      backgroundColor: '#278CCC',
      borderRadius: 8,
    },
    retryText: {
      color: 'white',
      fontSize: 14,
      fontFamily: theme.fonts.fontWeight.medium,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContent: {
      width: '85%',
      backgroundColor: 'white',
      borderRadius: 16,
      padding: 24,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
    modalTitle: {
      fontSize: 20,
      color: '#333',
      fontWeight: 'bold',
      marginBottom: 16,
      textAlign: 'center',
    },
    amountInfoContainer: {
      marginBottom: 16,
      backgroundColor: '#F5F8FC',
      padding: 16,
      borderRadius: 8,
    },
    amountInfoLabel: {
      fontSize: 14,
      color: '#666',
      marginBottom: 4,
    },
    amountInfoValue: {
      fontSize: 16,
      color: '#333',
      fontWeight: 'bold',
      marginBottom: 12,
    },
    inputLabel: {
      fontSize: 16,
      color: '#333',
      marginBottom: 8,
    },
    amountInput: {
      borderWidth: 1,
      borderColor: '#DDD',
      borderRadius: 8,
      paddingHorizontal: 16,
      paddingVertical: 12,
      fontSize: 16,
      marginBottom: 24,
    },
    modalButtons: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    modalButton: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
      marginHorizontal: 6,
    },
    cancelButton: {
      backgroundColor: '#F1F1F1',
    },
    confirmButton: {
      backgroundColor: '#278CCC',
    },
    cancelButtonText: {
      color: '#666',
      fontSize: 16,
      fontWeight: '500',
    },
    confirmButtonText: {
      color: 'white',
      fontSize: 16,
      fontWeight: '500',
    },
  });

  // 파라미터에서 initialTab이 변경되면 selectedCategory 업데이트
  useEffect(() => {
    if (route.params?.initialTab) {
      setSelectedCategory(route.params.initialTab);
      // 사용완료 탭으로 변경 시 정렬 옵션도 변경
      if (route.params.initialTab === 'used') {
        setSortBy(prev => ({
          ...prev,
          [route.params.initialTab]: 'recent',
        }));
      }
      // 카테고리 변경 시 필터를 항상 '전체'로 초기화
      setSelectedFilter('all');
    }
  }, [route.params?.initialTab]);

  // 카테고리 변경 시 정렬 옵션 초기화
  useEffect(() => {
    if (selectedCategory === 'used') {
      setSortBy(prev => ({
        ...prev,
        [selectedCategory]: 'recent',
      }));
    }
  }, [selectedCategory]);

  // 카테고리, 필터, 정렬 변경 시 데이터 로드
  useEffect(() => {
    loadGifticons(true);
  }, [selectedCategory, selectedFilter, sortBy]);

  // 기프티콘 목록 로드 함수
  const loadGifticons = async (reset = false) => {
    if (loading && !reset) return; // 이미 로딩 중이고 초기화가 아니면 중지

    try {
      setLoading(true);
      setError(null);

      if (reset) {
        setNextPage(null);
        setFilteredGifticons([]);
      }

      // API 호출 파라미터 구성
      const params = {
        size: 10,
      };

      // 첫 페이지 로드가 아니고, 다음 페이지 커서가 있는 경우에만 page 파라미터 추가
      if (!reset && nextPage) {
        params.page = nextPage;
      }

      // 필터 적용
      if (selectedFilter !== 'all') {
        params.type = selectedFilter.toUpperCase();
      }

      // 정렬 적용
      const currentSortBy = sortBy[selectedCategory];
      if (selectedCategory === 'used') {
        // 사용 완료 기프티콘 조회 시 'USED_DESC' 정렬 사용
        params.sort = 'USED_DESC';
      } else {
        // 사용 가능 기프티콘 조회 시 기존 정렬 사용
        params.sort = currentSortBy === 'recent' ? 'CREATED_DESC' : 'EXPIRY_ASC';
      }

      // 카테고리에 따라 API 호출 분기
      let response;
      if (selectedCategory === 'used') {
        // 사용 완료 기프티콘 조회
        response = await gifticonService.getUsedGifticons(params);
      } else {
        // 사용 가능 기프티콘 조회
        params.scope =
          selectedCategory === 'mybas'
            ? 'MY_BOX'
            : selectedCategory === 'sharebas'
              ? 'SHARE_BOX'
              : 'ALL';
        response = await gifticonService.getAvailableGifticons(params);
      }

      if (!response || !response.gifticons) {
        setError('서버에서 응답은 받았으나 유효한 데이터가 없습니다.');
        return;
      }

      // 결과 처리
      const newGifticons = response.gifticons || [];

      // 사용완료 기프티콘인 경우 scope 필드를 'USED'로 설정
      if (selectedCategory === 'used') {
        newGifticons.forEach(gifticon => {
          gifticon.scope = 'USED';
          // usedAt 필드가 없는 경우 오늘 날짜를 기본값으로 설정
          if (!gifticon.usedAt) {
            gifticon.usedAt = new Date().toISOString();
          }
        });
      }

      setFilteredGifticons(prev => (reset ? newGifticons : [...prev, ...newGifticons]));
      setHasNextPage(response.hasNextPage || false);
      setNextPage(response.nextPage || null);
    } catch (err) {
      // 네트워크 오류 세부 정보 로깅
      if (err.response) {
        // 서버 응답이 있는 경우 (4xx, 5xx 에러)
        setError(`서버 오류가 발생했습니다 (${err.response.status}). 잠시 후 다시 시도해주세요.`);
      } else if (err.request) {
        // 요청은 보냈지만 응답이 없는 경우 (네트워크 오류)
        setError('네트워크 연결을 확인해주세요. 서버에 연결할 수 없습니다.');
      } else {
        // 요청 자체가 실패한 경우
        setError('기프티콘 목록을 불러오는 데 실패했습니다. 잠시 후 다시 시도해주세요.');
      }

      // 초기화인 경우 빈 목록 설정
      if (reset) {
        setFilteredGifticons([]);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // 새로고침 처리
  const handleRefresh = () => {
    setRefreshing(true);
    loadGifticons(true);
  };

  // 더 불러오기 처리
  const handleLoadMore = () => {
    if (hasNextPage && !loading) {
      loadGifticons();
    }
  };

  // 에러 시 재시도 처리
  const handleRetry = () => {
    loadGifticons(true);
  };

  // 카테고리 변경 처리
  const handleCategoryChange = categoryId => {
    setSelectedCategory(categoryId);
    // 카테고리 변경 시 필터를 항상 '전체'로 초기화
    setSelectedFilter('all');
  };

  // 필터 변경 처리
  const handleFilterChange = filterId => {
    setSelectedFilter(filterId);
  };

  // 정렬 변경 처리
  const handleSortChange = sortId => {
    // 현재 선택된 카테고리에 대한 정렬만 변경
    setSortBy(prev => ({
      ...prev,
      [selectedCategory]: sortId,
    }));
    setShowSortDropdown(false);
  };

  // 정렬 드롭다운 토글
  const toggleSortDropdown = () => {
    setShowSortDropdown(!showSortDropdown);
  };

  // 외부 클릭 감지를 위한 이벤트 리스너 설정을 React Native 스타일로 변경
  const handleOutsidePress = () => {
    if (showSortDropdown) {
      setShowSortDropdown(false);
    }
  };

  // 날짜 차이 계산 함수
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

  // 날짜 포맷 함수
  const formatDate = dateString => {
    const date = new Date(dateString);
    const yy = String(date.getFullYear()).slice(2);
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yy}.${mm}.${dd}`;
  };

  // AlertDialog 상태 관리
  const [dialogVisible, setDialogVisible] = useState(false);
  const [selectedGifticon, setSelectedGifticon] = useState(null);

  // 금액형 기프티콘 사용 관련 상태
  const [amountDialogVisible, setAmountDialogVisible] = useState(false);
  const [amountToUse, setAmountToUse] = useState('');
  const [selectedAmountGifticon, setSelectedAmountGifticon] = useState(null);

  // 바코드 조회 처리
  const handleBarcodeView = item => {
    if (item.gifticonType === 'PRODUCT') {
      navigation.navigate('UseProductScreen', {
        id: item.gifticonId,
        barcodeNumber: item.gifticonId + '-' + Math.floor(Math.random() * 10000000), // 임시 바코드 번호
        brandName: item.brandName,
        gifticonName: item.gifticonName,
      });
    } else if (item.gifticonType === 'AMOUNT') {
      navigation.navigate('UseAmountScreen', {
        id: item.gifticonId,
        barcodeNumber: item.gifticonId + '-' + Math.floor(Math.random() * 10000000), // 임시 바코드 번호
        brandName: item.brandName,
        gifticonName: item.gifticonName,
      });
    }
  };

  // 사용 완료 다이얼로그 표시
  const showUseCompleteDialog = item => {
    // 금액형인 경우 금액 입력 다이얼로그 표시
    if (item.gifticonType === 'AMOUNT') {
      setSelectedAmountGifticon(item);
      setAmountToUse(''); // 금액 초기화
      setAmountDialogVisible(true);
    } else {
      // 상품형인 경우 기존 확인 다이얼로그 표시
      setSelectedGifticon(item);
      setDialogVisible(true);
    }
  };

  // AlertDialog 상태 관리를 위한 state 추가
  const [commonAlertVisible, setCommonAlertVisible] = useState(false);
  const [commonAlertTitle, setCommonAlertTitle] = useState('');
  const [commonAlertMessage, setCommonAlertMessage] = useState('');
  const [commonAlertType, setCommonAlertType] = useState('info');
  const [commonAlertCallback, setCommonAlertCallback] = useState(() => {});

  // 알림 다이얼로그 공통 표시 함수
  const showAlert = (title, message, callback = () => {}, type = 'info') => {
    setCommonAlertTitle(title);
    setCommonAlertMessage(message);
    setCommonAlertCallback(() => callback);
    setCommonAlertType(type);
    setCommonAlertVisible(true);
  };

  // 금액형 기프티콘 사용 처리
  const handleUseAmountGifticon = async () => {
    if (!selectedAmountGifticon) return;

    // 금액 입력값 검증
    if (!amountToUse || isNaN(parseInt(amountToUse, 10)) || parseInt(amountToUse, 10) <= 0) {
      showAlert('입력 오류', '사용할 금액을 올바르게 입력해주세요.');
      return;
    }

    const usageAmount = parseInt(amountToUse, 10);
    const remainingAmount = selectedAmountGifticon.gifticonRemainingAmount || 0;

    // 잔액 초과 검증
    if (usageAmount > remainingAmount) {
      showAlert('금액 초과', `사용 가능한 금액은 ${remainingAmount.toLocaleString()}원입니다.`);
      return;
    }

    try {
      setLoading(true);
      setAmountDialogVisible(false);

      // 금액형 기프티콘 사용 API 호출
      await gifticonService.useAmountGifticon(selectedAmountGifticon.gifticonId, usageAmount);

      // 성공 시 기프티콘 목록에서 해당 항목 갱신
      // 전체 금액을 사용한 경우에만 목록에서 제거
      if (usageAmount >= remainingAmount) {
        const updatedGifticons = filteredGifticons.filter(
          gifticon => gifticon.gifticonId !== selectedAmountGifticon.gifticonId
        );
        setFilteredGifticons(updatedGifticons);
      } else {
        // 일부 금액만 사용한 경우 잔액 갱신
        const updatedGifticons = filteredGifticons.map(gifticon => {
          if (gifticon.gifticonId === selectedAmountGifticon.gifticonId) {
            return {
              ...gifticon,
              gifticonRemainingAmount: remainingAmount - usageAmount,
            };
          }
          return gifticon;
        });
        setFilteredGifticons(updatedGifticons);
      }

      // 성공 메시지 표시
      showAlert('사용 완료', '기프티콘이 사용처리되었습니다.', () => {
        // 사용내역 화면으로 이동
        navigation.navigate('DetailAmountHistoryScreen', {
          gifticonId: selectedAmountGifticon.gifticonId,
          brandName: selectedAmountGifticon.brandName,
          gifticonName: selectedAmountGifticon.gifticonName,
          scope: usageAmount >= remainingAmount ? 'USED' : 'MY_BOX',
          usageType: 'SELF_USE',
        });
      });
    } catch (error) {
      // 에러 메시지 처리
      let errorMessage = '기프티콘 사용 중 오류가 발생했습니다.';
      if (error.response) {
        const status = error.response.status;
        if (status === 400) {
          errorMessage = '잘못된 요청입니다. 금액을 확인해주세요.';
        } else if (status === 403) {
          errorMessage = '이 기프티콘에 대한 권한이 없습니다.';
        } else if (status === 404) {
          errorMessage = '존재하지 않는 기프티콘입니다.';
        }

        // 서버에서 전달한 메시지가 있으면 우선 표시
        errorMessage = error.response.data?.message || errorMessage;
      } else if (error.request) {
        errorMessage = '서버에 연결할 수 없습니다. 네트워크 상태를 확인해주세요.';
      }

      console.error('금액형 기프티콘 사용 오류:', error);
      showAlert('오류', errorMessage);
    } finally {
      setLoading(false);
      setSelectedAmountGifticon(null);
    }
  };

  // 상품형 기프티콘 사용 완료 처리
  const handleMarkAsUsed = async () => {
    if (!selectedGifticon) return;

    try {
      setLoading(true);

      // 상품형 기프티콘 사용 완료 처리
      await gifticonService.markProductGifticonAsUsed(selectedGifticon.gifticonId);

      // 상태 업데이트 및 화면 갱신
      const updatedGifticons = filteredGifticons.filter(
        gifticon => gifticon.gifticonId !== selectedGifticon.gifticonId
      );
      setFilteredGifticons(updatedGifticons);

      // 성공 메시지 표시
      showAlert('사용 완료', '기프티콘이 사용완료 처리되었습니다.');
    } catch (error) {
      // 에러 메시지 처리
      let errorMessage = '기프티콘 사용완료 처리 중 오류가 발생했습니다.';
      if (error.response) {
        const status = error.response.status;
        if (status === 400) {
          errorMessage = '잘못된 요청입니다.';
        } else if (status === 403) {
          errorMessage = '이 기프티콘에 대한 권한이 없습니다.';
        } else if (status === 404) {
          errorMessage = '존재하지 않는 기프티콘입니다.';
        } else if (status === 409) {
          errorMessage = '이미 사용된 기프티콘입니다.';
        }

        // 서버에서 전달한 메시지가 있으면 우선 표시
        errorMessage = error.response.data?.message || errorMessage;
      } else if (error.request) {
        errorMessage = '서버에 연결할 수 없습니다. 네트워크 상태를 확인해주세요.';
      }

      console.error('상품형 기프티콘 사용완료 처리 오류:', error);
      showAlert('오류', errorMessage);
    } finally {
      setLoading(false);
      // 다이얼로그 닫기
      setDialogVisible(false);
      setSelectedGifticon(null);
    }
  };

  // 좌측 액션 (사용 완료) 렌더링
  const renderLeftActions = (progress, dragX, item) => {
    const scale = dragX.interpolate({
      inputRange: [0, 100],
      outputRange: [0, 1],
      extrapolate: 'clamp',
    });

    const opacity = dragX.interpolate({
      inputRange: [0, 50, 100],
      outputRange: [0, 0.5, 1],
      extrapolate: 'clamp',
    });

    return (
      <Animated.View style={[styles.leftAction, { opacity }]}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => showUseCompleteDialog(item)}
          activeOpacity={0.7}
        >
          <Animated.View style={[styles.actionIconContainer, { transform: [{ scale }] }]}>
            <Icon name="check-circle" type="material" color="#FFFFFF" size={24} />
            <Text style={styles.actionText}>사용 완료</Text>
          </Animated.View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  // 우측 액션 (바코드 조회) 렌더링
  const renderRightActions = (progress, dragX, item) => {
    const scale = dragX.interpolate({
      inputRange: [-100, 0],
      outputRange: [1, 0],
      extrapolate: 'clamp',
    });

    const opacity = dragX.interpolate({
      inputRange: [-100, -50, 0],
      outputRange: [1, 0.5, 0],
      extrapolate: 'clamp',
    });

    return (
      <Animated.View style={[styles.rightAction, { opacity }]}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleBarcodeView(item)}
          activeOpacity={0.7}
        >
          <Animated.View style={[styles.actionIconContainer, { transform: [{ scale }] }]}>
            <Icon name="qr-code-scanner" type="material" color="#FFFFFF" size={24} />
            <Text style={styles.actionText}>바코드 조회</Text>
          </Animated.View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  // 스와이프 레퍼런스 저장
  const swipeableRefs = useRef({});

  // 렌더링할 컨텐츠
  const renderContent = () => {
    if (error) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
            <Text style={styles.retryText}>다시 시도</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (filteredGifticons.length === 0 && !loading) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            {selectedCategory === 'mybas' && '마이박스에 기프티콘이 없습니다.'}
            {selectedCategory === 'sharebas' && '쉐어박스에 기프티콘이 없습니다.'}
            {selectedCategory === 'used' && '사용완료된 기프티콘이 없습니다.'}
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.gifticonList}>
        {filteredGifticons.map(item => renderGifticonItem(item))}
      </View>
    );
  };

  // 기프티콘 아이템 렌더링
  const renderGifticonItem = item => {
    // ImageSource 부분을 FastImage로 교체
    const imageSource =
      item.thumbnailPath && typeof item.thumbnailPath === 'string'
        ? { uri: item.thumbnailPath }
        : item.thumbnailPath || require('../../assets/images/adaptive_icon.png');

    const daysLeft = item.scope === 'USED' ? null : calculateDaysLeft(item.gifticonExpiryDate);
    const isUrgent = daysLeft !== null && typeof daysLeft === 'number' && daysLeft <= 7; // 7일 이하면 긴급(빨간색)
    const isDDay = daysLeft !== null && daysLeft === 'D-day'; // D-day인 경우
    const isExpired = daysLeft !== null && daysLeft === '만료됨'; // 만료된 경우
    const isSharedByOther = item.scope === 'SHARE_BOX' && item.userId !== currentUserId;

    // 이미지 컴포넌트를 FastImage로 교체
    const renderImage = () => (
      <FastImage
        source={imageSource}
        style={styles.gifticonImage}
        resizeMode={FastImage.resizeMode.cover}
      />
    );

    // 쉐어박스 정보를 렌더링하는 함수 추가
    const renderShareBoxInfo = () => {
      if (item.scope !== 'SHARE_BOX') return null;

      return (
        <View style={styles.shareBoxInfoContainer}>
          {item.shareBoxName && (
            <>
              <Icon
                name="inventory-2"
                type="material"
                size={12}
                color="#278CCC"
                containerStyle={styles.shareBoxIcon}
              />
              <Text style={styles.shareBoxText}>{item.shareBoxName}</Text>
            </>
          )}

          {/* 다른 사람이 공유한 경우 공유자 정보 표시 */}
          {isSharedByOther && (
            <>
              <Icon
                name="person"
                type="material"
                size={12}
                color="#278CCC"
                containerStyle={{ ...styles.shareBoxIcon, marginLeft: 4 }}
              />
              <Text style={styles.sharedByText}>{item.userName}님 공유</Text>
            </>
          )}
        </View>
      );
    };

    // 텍스트 정보 영역에서 gifticonName을 표시하는 부분
    const renderNameText = name => (
      <Text style={styles.nameText} numberOfLines={1} ellipsizeMode="tail">
        {truncateText(name, 15)}
      </Text>
    );

    // 만료된 기프티콘이나 사용완료 탭의 기프티콘은 Swipeable 기능 비활성화
    if (isExpired || selectedCategory === 'used') {
      return (
        <TouchableOpacity
          key={item.gifticonId}
          style={styles.gifticonItem}
          onPress={() => handleGifticonPress(item)}
        >
          <Shadow
            distance={12}
            startColor={'rgba(0, 0, 0, 0.008)'}
            offset={[0, 1]}
            style={styles.shadowContainer}
          >
            <View
              style={[
                styles.gifticonContent,
                { opacity: isExpired ? 0.7 : 1 },
                isSharedByOther && { borderWidth: 1, borderColor: '#278CCC' },
              ]}
            >
              {/* 이미지 영역 - 만료된 경우 흐리게 표시 */}
              <View style={styles.imageContainer}>{renderImage()}</View>

              {/* 텍스트 정보 영역 */}
              <View style={styles.textContainer}>
                <Text style={styles.brandText}>{item.brandName}</Text>
                {renderNameText(item.gifticonName)}

                {/* 쉐어박스 정보 */}
                {renderShareBoxInfo()}

                {/* 금액형 기프티콘의 경우 잔액 정보 표시 */}
                {item.gifticonType === 'AMOUNT' && item.gifticonRemainingAmount && (
                  <Text
                    style={{
                      fontSize: 12,
                      color: '#278CCC',
                      fontFamily: theme.fonts.fontWeight.bold,
                      marginTop: 3,
                    }}
                  >
                    잔액: {item.gifticonRemainingAmount.toLocaleString()}원
                  </Text>
                )}
              </View>

              {/* D-day 태그 또는 사용일자 */}
              <View
                style={[
                  styles.dDayContainer,
                  isExpired
                    ? styles.expiredDDay
                    : isUrgent || isDDay
                      ? styles.urgentDDay
                      : styles.normalDDay,
                ]}
              >
                <Text
                  style={[
                    styles.dDayText,
                    isExpired
                      ? styles.expiredDDayText
                      : isUrgent || isDDay
                        ? styles.urgentDDayText
                        : styles.normalDDayText,
                  ]}
                >
                  {item.scope === 'USED'
                    ? formatDate(item.usedAt)
                    : typeof daysLeft === 'string'
                      ? daysLeft
                      : `D-${daysLeft}`}
                </Text>
              </View>
            </View>
          </Shadow>
        </TouchableOpacity>
      );
    }

    // 금액형 기프티콘은 바코드 조회만 가능하게 (사용완료 스와이프 제거)
    if (item.gifticonType === 'AMOUNT') {
      return (
        <Swipeable
          key={item.gifticonId}
          ref={ref => (swipeableRefs.current[item.gifticonId] = ref)}
          renderLeftActions={null} // 좌측 스와이프(사용완료) 비활성화
          renderRightActions={(progress, dragX) => renderRightActions(progress, dragX, item)}
          onSwipeableOpen={direction => {
            // 다른 열린 swipeable 닫기
            Object.keys(swipeableRefs.current).forEach(key => {
              if (key !== String(item.gifticonId) && swipeableRefs.current[key]) {
                swipeableRefs.current[key].close();
              }
            });
          }}
          friction={2} // 마찰력 감소로 스와이프 감도 증가
          overshootRight={false} // 오버슈트 비활성화로 동작 개선
          rightThreshold={40} // 임계값 감소로 스와이프 인식 개선
        >
          <TouchableOpacity
            style={styles.gifticonItem}
            onPress={() => {
              // 터치 시 열려있는 swipeable 닫기
              if (swipeableRefs.current[item.gifticonId]) {
                swipeableRefs.current[item.gifticonId].close();
              }
              handleGifticonPress(item);
            }}
            activeOpacity={0.7} // 터치 피드백 개선
          >
            <Shadow
              distance={12}
              startColor={'rgba(0, 0, 0, 0.008)'}
              offset={[0, 1]}
              style={styles.shadowContainer}
            >
              <View
                style={[
                  styles.gifticonContent,
                  isSharedByOther && { borderWidth: 1, borderColor: '#278CCC' },
                ]}
              >
                {/* 이미지 영역 */}
                <View style={styles.imageContainer}>{renderImage()}</View>

                {/* 텍스트 정보 영역 */}
                <View style={styles.textContainer}>
                  <Text style={styles.brandText}>{item.brandName}</Text>
                  {renderNameText(item.gifticonName)}

                  {/* 쉐어박스 정보 */}
                  {renderShareBoxInfo()}

                  {/* 금액형 기프티콘의 경우 잔액 정보 표시 */}
                  {item.gifticonType === 'AMOUNT' && item.gifticonRemainingAmount && (
                    <Text
                      style={{
                        fontSize: 12,
                        color: '#278CCC',
                        fontFamily: theme.fonts.fontWeight.bold,
                        marginTop: 3,
                      }}
                    >
                      잔액: {item.gifticonRemainingAmount.toLocaleString()}원
                    </Text>
                  )}
                </View>

                {/* D-day 태그 */}
                <View
                  style={[
                    styles.dDayContainer,
                    isExpired
                      ? styles.expiredDDay
                      : isUrgent || isDDay
                        ? styles.urgentDDay
                        : styles.normalDDay,
                  ]}
                >
                  <Text
                    style={[
                      styles.dDayText,
                      isExpired
                        ? styles.expiredDDayText
                        : isUrgent || isDDay
                          ? styles.urgentDDayText
                          : styles.normalDDayText,
                    ]}
                  >
                    {item.scope === 'USED'
                      ? formatDate(item.usedAt)
                      : typeof daysLeft === 'string'
                        ? daysLeft
                        : `D-${daysLeft}`}
                  </Text>
                </View>
              </View>
            </Shadow>
          </TouchableOpacity>
        </Swipeable>
      );
    }

    // 상품형 기프티콘은 양쪽 스와이프 모두 가능
    return (
      <Swipeable
        key={item.gifticonId}
        ref={ref => (swipeableRefs.current[item.gifticonId] = ref)}
        renderLeftActions={(progress, dragX) => renderLeftActions(progress, dragX, item)}
        renderRightActions={(progress, dragX) => renderRightActions(progress, dragX, item)}
        onSwipeableOpen={direction => {
          // 다른 열린 swipeable 닫기
          Object.keys(swipeableRefs.current).forEach(key => {
            if (key !== String(item.gifticonId) && swipeableRefs.current[key]) {
              swipeableRefs.current[key].close();
            }
          });
        }}
        friction={1} // 마찰력 감소로 스와이프 감도 증가
        leftThreshold={40} // 임계값 감소로 스와이프 인식 개선
        rightThreshold={40} // 임계값 감소로 스와이프 인식 개선
        overshootLeft={false} // 오버슈트 비활성화로 동작 개선
        overshootRight={false} // 오버슈트 비활성화로 동작 개선
      >
        <TouchableOpacity
          style={styles.gifticonItem}
          onPress={() => {
            // 터치 시 열려있는 swipeable 닫기
            if (swipeableRefs.current[item.gifticonId]) {
              swipeableRefs.current[item.gifticonId].close();
            }
            handleGifticonPress(item);
          }}
          activeOpacity={0.7} // 터치 피드백 개선
        >
          <Shadow
            distance={12}
            startColor={'rgba(0, 0, 0, 0.008)'}
            offset={[0, 1]}
            style={styles.shadowContainer}
          >
            <View
              style={[
                styles.gifticonContent,
                isSharedByOther && { borderWidth: 1, borderColor: '#278CCC' },
              ]}
            >
              {/* 이미지 영역 */}
              <View style={styles.imageContainer}>{renderImage()}</View>

              {/* 텍스트 정보 영역 */}
              <View style={styles.textContainer}>
                <Text style={styles.brandText}>{item.brandName}</Text>
                {renderNameText(item.gifticonName)}

                {/* 쉐어박스 정보 */}
                {renderShareBoxInfo()}
              </View>

              {/* D-day 태그 */}
              <View
                style={[
                  styles.dDayContainer,
                  isExpired
                    ? styles.expiredDDay
                    : isUrgent || isDDay
                      ? styles.urgentDDay
                      : styles.normalDDay,
                ]}
              >
                <Text
                  style={[
                    styles.dDayText,
                    isExpired
                      ? styles.expiredDDayText
                      : isUrgent || isDDay
                        ? styles.urgentDDayText
                        : styles.normalDDayText,
                  ]}
                >
                  {item.scope === 'USED'
                    ? formatDate(item.usedAt)
                    : typeof daysLeft === 'string'
                      ? daysLeft
                      : `D-${daysLeft}`}
                </Text>
              </View>
            </View>
          </Shadow>
        </TouchableOpacity>
      </Swipeable>
    );
  };

  // 기프티콘 클릭 시 상세 페이지로 이동하는 함수
  const handleGifticonPress = item => {
    // 내가 공유한 기프티콘인지 확인
    const isSharer = item.scope === 'SHARE_BOX' && item.userId === currentUserId;

    // 기프티콘 ID 설정
    const gifticonId = item.gifticonId;

    // 사용완료 상태 명확하게 확인 - usageType이 있으면 무조건 사용완료로 취급
    const isUsed = item.scope === 'USED' || item.usageType;

    console.log('[ManageListScreen] 기프티콘 상세 이동:', {
      id: gifticonId,
      type: item.gifticonType,
      scope: item.scope,
      isUsed: isUsed,
      usageType: item.usageType,
    });

    // 기프티콘 유형에 따라 다른 상세 페이지로 이동
    if (item.gifticonType === 'PRODUCT') {
      navigation.navigate('DetailProduct', {
        gifticonId: gifticonId,
        scope: isUsed ? 'USED' : item.scope, // MY_BOX, SHARE_BOX 또는 USED - 명확하게 설정
        usageType: item.usageType, // usageType 있으면 무조건 전달
        usedAt: item.usedAt,
        isSharer: isSharer, // 내가 공유한 기프티콘인지 여부
      });
    } else if (item.gifticonType === 'AMOUNT') {
      navigation.navigate('DetailAmount', {
        gifticonId: gifticonId,
        scope: isUsed ? 'USED' : item.scope, // MY_BOX, SHARE_BOX 또는 USED - 명확하게 설정
        usageType: item.usageType, // usageType 있으면 무조건 전달
        usedAt: item.usedAt,
        isSharer: isSharer, // 내가 공유한 기프티콘인지 여부
      });
    }
  };

  useEffect(() => {
    // 최초 로드 시 및 탭 변경 시 데이터 로드
    loadGifticons(true);

    // 화면에 다시 포커스될 때마다 데이터 새로 로드
    const unsubscribe = navigation.addListener('focus', () => {
      // 화면이 다시 포커스를 받으면 데이터 새로고침
      handleRefresh();
    });

    return () => {
      unsubscribe();
    };
  }, [selectedCategory, selectedFilter, sortBy[selectedCategory]]);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />

      <View style={styles.header}>
        <Text variant="h2" weight="bold" style={styles.headerTitle}>
          기프티콘 관리
        </Text>
      </View>

      <TouchableWithoutFeedback onPress={handleOutsidePress}>
        <View style={styles.contentWrapper}>
          <CategoryTabs
            categories={categories}
            selectedId={selectedCategory}
            onSelectCategory={handleCategoryChange}
          />

          <View style={styles.filterContainer}>
            <View style={styles.tabFilterContainer}>
              <TabFilter
                tabs={filterTabs}
                onTabChange={handleFilterChange}
                initialTabId={selectedFilter}
              />
            </View>

            <View style={styles.sortContainer}>
              <TouchableOpacity style={styles.sortButton} onPress={toggleSortDropdown}>
                <Text style={styles.sortButtonText}>
                  {
                    (selectedCategory === 'used' ? usedSortOptions : sortOptions).find(
                      option => option.id === sortBy[selectedCategory]
                    )?.title
                  }
                </Text>
                <Icon
                  name={showSortDropdown ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
                  type="material"
                  size={18}
                  color="#333"
                />
              </TouchableOpacity>

              {showSortDropdown && (
                <View style={styles.sortDropdown}>
                  {(selectedCategory === 'used' ? usedSortOptions : sortOptions).map(option => (
                    <TouchableOpacity
                      key={option.id}
                      style={styles.sortOption}
                      onPress={() => handleSortChange(option.id)}
                    >
                      <Text
                        style={[
                          styles.sortOptionText,
                          sortBy[selectedCategory] === option.id && styles.sortOptionTextSelected,
                        ]}
                      >
                        {option.title}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          </View>

          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollViewContent}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                colors={['#278CCC']}
              />
            }
            onScroll={({ nativeEvent }) => {
              const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
              const paddingToBottom = 50;
              if (
                layoutMeasurement.height + contentOffset.y >=
                contentSize.height - paddingToBottom
              ) {
                handleLoadMore();
              }
            }}
            scrollEventThrottle={100}
          >
            {renderContent()}
          </ScrollView>
        </View>
      </TouchableWithoutFeedback>

      {selectedGifticon && (
        <AlertDialog
          isVisible={dialogVisible}
          title="사용 완료 처리"
          message={`${selectedGifticon.brandName} - ${selectedGifticon.gifticonName}을(를) 사용 완료 처리하시겠습니까?`}
          confirmText="확인"
          cancelText="취소"
          onConfirm={handleMarkAsUsed}
          onCancel={() => {
            setDialogVisible(false);
            setSelectedGifticon(null);
          }}
          onBackdropPress={() => {
            setDialogVisible(false);
            setSelectedGifticon(null);
          }}
          type="info"
        />
      )}

      {/* 금액형 기프티콘 사용 다이얼로그 */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={amountDialogVisible}
        onRequestClose={() => setAmountDialogVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setAmountDialogVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback onPress={e => e.stopPropagation()}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>금액 사용</Text>

                {selectedAmountGifticon && (
                  <View style={styles.amountInfoContainer}>
                    <Text style={styles.amountInfoLabel}>기프티콘명</Text>
                    <Text style={styles.amountInfoValue}>
                      {selectedAmountGifticon.brandName} - {selectedAmountGifticon.gifticonName}
                    </Text>

                    <Text style={styles.amountInfoLabel}>잔액</Text>
                    <Text style={styles.amountInfoValue}>
                      {selectedAmountGifticon.gifticonRemainingAmount?.toLocaleString() || 0}원
                    </Text>
                  </View>
                )}

                <Text style={styles.inputLabel}>사용할 금액</Text>
                <TextInput
                  style={styles.amountInput}
                  value={amountToUse}
                  onChangeText={text => setAmountToUse(text.replace(/[^0-9]/g, ''))}
                  placeholder="금액을 입력하세요"
                  keyboardType="numeric"
                  autoFocus={true}
                />

                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.cancelButton]}
                    onPress={() => setAmountDialogVisible(false)}
                  >
                    <Text style={styles.cancelButtonText}>취소</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.modalButton, styles.confirmButton]}
                    onPress={handleUseAmountGifticon}
                  >
                    <Text style={styles.confirmButtonText}>사용하기</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* 공통 알림 다이얼로그 추가 */}
      <AlertDialog
        isVisible={commonAlertVisible}
        title={commonAlertTitle}
        message={commonAlertMessage}
        confirmText="확인"
        onConfirm={() => {
          setCommonAlertVisible(false);
          commonAlertCallback && commonAlertCallback();
        }}
        onBackdropPress={() => setCommonAlertVisible(false)}
        type={commonAlertType}
        hideCancel={true}
      />
    </View>
  );
};

export default ManageListScreen;
