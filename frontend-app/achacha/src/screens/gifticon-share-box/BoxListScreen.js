// 쉐어박스 목록 스크린
// 사용완료 리스트에서 사용자 사용일자 보이게 처리해야 함

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Image,
  TouchableOpacity,
  StatusBar,
  Animated,
  TouchableWithoutFeedback,
  FlatList,
  Alert,
} from 'react-native';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { Icon } from 'react-native-elements';
import { Text } from '../../components/ui';
import AlertDialog from '../../components/ui/AlertDialog';
import CategoryTabs from '../../components/common/CategoryTabs';
import TabFilter from '../../components/common/TabFilter';
import { useTheme } from '../../hooks/useTheme';
import { Shadow } from 'react-native-shadow-2';
import { Swipeable } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  fetchAvailableGifticons,
  fetchUsedGifticons,
  fetchShareBoxSettings,
} from '../../api/shareBoxService';
import { API_BASE_URL } from '../../api/config';
import { useAuth } from '../../hooks/useAuth';
import gifticonService from '../../api/gifticonService';

const BoxListScreen = () => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();
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

  // 쉐어박스 ID와 이름 가져오기
  const shareBoxId = route.params?.shareBoxId || 0;
  const shareBoxName = route.params?.shareBoxName;

  // route.params에서 initialTab을 가져와 초기 탭 설정
  const initialTab = route.params?.initialTab || 'available';

  // 카테고리 상태 - 초기값은 route.params에서 받은 initialTab으로 설정
  const [selectedCategory, setSelectedCategory] = useState(initialTab);
  // 필터 상태
  const [selectedFilter, setSelectedFilter] = useState('all');
  // 정렬 상태를 카테고리별로 관리
  const [sortBy, setSortBy] = useState({
    available: 'recent',
    used: 'recent',
  });
  // 정렬 드롭다운 표시 상태
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  // 필터링된 기프티콘 상태
  const [filteredGifticons, setFilteredGifticons] = useState([]);

  // AlertDialog 상태 관리
  const [dialogVisible, setDialogVisible] = useState(false);
  const [selectedGifticon, setSelectedGifticon] = useState(null);

  // 스와이프 레퍼런스 저장
  const swipeableRefs = useRef({});

  // 카테고리 탭 데이터 - 사용가능, 사용완료만 표시
  const categories = [
    { id: 'available', name: '사용가능' },
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

  // 추가된 상태
  const [availableGifticons, setAvailableGifticons] = useState([]);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [nextPage, setNextPage] = useState(null);
  const [loading, setLoading] = useState(false);

  // 사용완료 관련 상태
  const [usedGifticons, setUsedGifticons] = useState([]);
  const [usedHasNextPage, setUsedHasNextPage] = useState(false);
  const [usedNextPage, setUsedNextPage] = useState(null);
  const [usedLoading, setUsedLoading] = useState(false);

  // 박스 이름 상태 추가
  const [boxName, setBoxName] = useState('');

  // 새로고침 상태 추가
  const [refreshing, setRefreshing] = useState(false);

  // 사용완료 목록 콘솔 출력
  useEffect(() => {
    if (selectedCategory === 'used') {
      console.log('[사용완료 탭] usedGifticons 리스트:', usedGifticons);
    }
  }, [usedGifticons, selectedCategory]);

  // 스타일 정의를 여기로 이동
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      paddingHorizontal: 2,
      paddingTop: 0,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingTop: 12,
      paddingBottom: 8,
      paddingHorizontal: 16,
    },
    backButton: {
      padding: 4,
    },
    title: {
      flex: 1,
      textAlign: 'center',
    },
    settingsButton: {
      width: 38,
      height: 38,
      justifyContent: 'center',
      alignItems: 'center',
    },
    categoryTabContainer: {
      paddingHorizontal: 16,
      marginTop: 1,
      marginBottom: 1,
    },
    filterSortContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 16,
      marginBottom: 1,
    },
    filterContainer: {
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
    },
    sortOptionTextSelected: {
      color: '#56AEE9',
    },
    scrollView: {
      flex: 1,
      marginTop: 5,
    },
    scrollViewContent: {
      paddingHorizontal: 16,
      paddingBottom: 30,
    },
    gifticonList: {
      paddingVertical: 1,
    },
    emptyContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      padding: 30,
    },
    emptyText: {
      fontSize: 16,
      color: '#737373',
    },
    gifticonItem: {
      width: '100%',
    },
    shadowContainer: {
      width: '100%',
      borderRadius: 12,
      marginBottom: 10,
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
    gifticonContent: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 8,
      backgroundColor: '#FFFFFF',
      borderRadius: 12,
      position: 'relative',
    },
    textContainer: {
      flex: 1,
    },
    brandText: {
      fontSize: 16,
      color: '#333',
      marginTop: 2,
      marginBottom: 1,
    },
    nameText: {
      fontSize: 14,
      color: '#666',
      marginBottom: 1,
      paddingRight: 80,
    },
    shareBoxInfoContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 0,
    },
    shareBoxIcon: {
      marginRight: 3,
    },
    sharedByText: {
      fontSize: 12,
      color: '#278CCC',
      fontStyle: 'normal',
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
    },
    urgentDDayText: {
      color: '#EA5455',
    },
    normalDDayText: {
      color: '#72BFFF',
    },
    // 스와이프 액션 관련 스타일
    leftAction: {
      width: 100, // 1/3 정도 보이도록 너비 조정
      backgroundColor: '#4CAF50', // 초록색 계열
      justifyContent: 'center',
      marginBottom: 10,
      borderTopLeftRadius: 12,
      borderBottomLeftRadius: 12,
    },
    rightAction: {
      width: '100', // 1/3 정도 보이도록 너비 조정
      backgroundColor: '#278CCC', // 파란색 계열
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
          used: 'recent',
        }));
      }
      // 카테고리 변경 시 필터를 항상 '전체'로 초기화
      setSelectedFilter('all');
    }

    // shareBoxId로 데이터 불러오기 (실제 구현 시)
  }, [route.params?.initialTab, shareBoxId, user?.id]);

  // 카테고리 변경 시 정렬 옵션 초기화
  useEffect(() => {
    if (selectedCategory === 'used') {
      setSortBy(prev => ({
        ...prev,
        used: 'recent',
      }));
    }
  }, [selectedCategory]);

  // 카테고리에 따른 기프티콘 필터링 (복원)
  useEffect(() => {
    filterGifticons();
  }, [selectedCategory, selectedFilter, sortBy]);

  // 카테고리에 따른 기프티콘 필터링
  const filterGifticons = () => {
    let filtered = [];

    // 카테고리 필터링
    switch (selectedCategory) {
      case 'available':
        filtered = filtered.filter(item => item.scope === 'SHARE_BOX');
        break;
      case 'used':
        filtered = filtered.filter(item => item.scope === 'USED');
        break;
      default:
        break;
    }

    // 필터 적용
    if (selectedFilter !== 'all') {
      if (selectedFilter === 'product') {
        filtered = filtered.filter(item => item.gifticonType === 'PRODUCT');
      } else if (selectedFilter === 'amount') {
        filtered = filtered.filter(item => item.gifticonType === 'AMOUNT');
      }
    }

    // 현재 선택된 카테고리의 정렬 기준 적용
    const currentSortBy = sortBy[selectedCategory];

    // 정렬 적용
    if (currentSortBy === 'recent') {
      if (selectedCategory === 'used') {
        // 사용완료 탭에서는 사용일시 기준 최신순
        filtered.sort((a, b) => new Date(b.usedAt) - new Date(a.usedAt));
      } else {
        // 등록일시 기준 최신순
        filtered.sort((a, b) => new Date(b.gifticonCreatedAt) - new Date(a.gifticonCreatedAt));
      }
    } else if (currentSortBy === 'expiry') {
      // D-day 기준 임박순
      filtered.sort((a, b) => {
        const aDaysLeft = calculateDaysLeft(a.gifticonExpiryDate);
        const bDaysLeft = calculateDaysLeft(b.gifticonExpiryDate);
        return aDaysLeft - bDaysLeft;
      });
    }

    setFilteredGifticons(filtered);
  };

  // 정렬 드롭다운 토글
  const toggleSortDropdown = () => {
    setShowSortDropdown(!showSortDropdown);
  };

  // 정렬 선택 핸들러
  const handleSelectSort = sortOption => {
    setSortBy(prev => ({
      ...prev,
      [selectedCategory]: sortOption,
    }));
    setShowSortDropdown(false);
  };

  // 카테고리 선택 핸들러
  const handleSelectCategory = categoryId => {
    setSelectedCategory(categoryId);

    // 사용완료 탭에서는 사용순으로만 정렬
    if (categoryId === 'used') {
      setSortBy(prev => ({
        ...prev,
        used: 'recent',
      }));
    }

    // 필터는 항상 '전체'로 초기화
    setSelectedFilter('all');
  };

  // 필터 선택 핸들러
  const handleSelectFilter = filterId => {
    console.log('필터 선택됨:', filterId);
    setSelectedFilter(filterId);
  };

  // 설정 화면으로 이동하는 핸들러 추가
  const handleSettingsPress = () => {
    navigation.navigate('BoxSetting', {
      shareBoxId,
      shareBoxName,
    });
  };

  // 뒤로가기 핸들러
  const handleGoBack = () => {
    navigation.goBack();
  };

  // 날짜 포맷 함수 - YY.MM.DD 형식
  const formatDate = dateString => {
    const date = new Date(dateString);
    const year = String(date.getFullYear()).slice(2); // 4자리 년도에서 뒤의 2자리만 사용
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}.${month}.${day}`;
  };

  // 만료일까지 남은 일수 계산
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
    setSelectedGifticon(item);
    setDialogVisible(true);
  };

  // 사용 완료 처리
  const handleMarkAsUsed = async () => {
    if (!selectedGifticon) return;

    try {
      // 실제 상품형 기프티콘 사용완료 API 호출
      await gifticonService.markProductGifticonAsUsed(selectedGifticon.gifticonId);

      // 성공 알림
      Alert.alert('성공', '기프티콘이 사용완료 처리되었습니다.');

      // 새로고침 트리거 (refreshing 상태 활용)
      setRefreshing(true);
      // 사용완료 탭이면 usedGifticons 새로고침
      if (selectedCategory === 'used') {
        const res = await fetchUsedGifticons({
          shareBoxId,
          type: selectedFilter === 'all' ? undefined : selectedFilter.toUpperCase(),
          sort: 'USED_DESC',
          page: undefined,
          size: 20,
        });
        setUsedGifticons(res.gifticons);
        setUsedHasNextPage(res.hasNextPage);
        setUsedNextPage(res.nextPage);
      } else {
        // 사용가능 탭이면 availableGifticons 새로고침
        const res = await fetchAvailableGifticons({
          shareBoxId,
          type: selectedFilter === 'all' ? undefined : selectedFilter.toUpperCase(),
          sort: sortBy.available === 'recent' ? 'CREATED_DESC' : 'EXPIRY_ASC',
          page: undefined,
          size: 20,
        });
        setAvailableGifticons(res.gifticons);
        setHasNextPage(res.hasNextPage);
        setNextPage(res.nextPage);
      }
    } catch (error) {
      Alert.alert(
        '사용완료 실패',
        error?.response?.data?.message || '기프티콘 사용완료 처리에 실패했습니다.'
      );
    } finally {
      setDialogVisible(false);
      setSelectedGifticon(null);
      setRefreshing(false);
    }
  };

  // 기프티콘 클릭 핸들러
  const handleGifticonPress = item => {
    if (item.gifticonType === 'PRODUCT') {
      navigation.navigate('BoxDetailProduct', { gifticon: item, scope: item.scope });
    } else if (item.gifticonType === 'AMOUNT') {
      navigation.navigate('BoxDetailAmount', { gifticon: item, scope: item.scope });
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
            <Text style={styles.actionText} weight="semiBold">
              사용 완료
            </Text>
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
            <Text style={styles.actionText} weight="semiBold">
              바코드 조회
            </Text>
          </Animated.View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  // 기프티콘 아이템 렌더링
  const renderGifticonItem = item => {
    const daysLeft = item.scope === 'USED' ? null : calculateDaysLeft(item.gifticonExpiryDate);
    const isUrgent = daysLeft !== null && typeof daysLeft === 'number' && daysLeft <= 7;
    const isDDay = daysLeft !== null && daysLeft === 'D-day';
    const isExpired = daysLeft !== null && daysLeft === '만료됨';
    const isSharedByOther = item.scope === 'SHARE_BOX' && item.userId !== currentUserId;

    // 사용 완료된 기프티콘은 스와이프 불가능
    if (item.scope === 'USED') {
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
                isExpired && { opacity: 0.7 },
                isSharedByOther && { borderWidth: 1, borderColor: '#278CCC' },
              ]}
            >
              {/* 이미지 영역 */}
              <View style={styles.imageContainer}>
                <Image
                  source={{ uri: getImageUrl(item.thumbnailPath) }}
                  style={styles.gifticonImage}
                />
              </View>

              {/* 텍스트 정보 영역 */}
              <View style={styles.textContainer}>
                <Text style={styles.brandText} weight="bold">
                  {item.brandName}
                </Text>
                <Text style={styles.nameText} numberOfLines={1} ellipsizeMode="tail">
                  {item.gifticonName}
                </Text>

                {/* 사용완료 기프티콘에 사용자 정보 표시 */}
                {item.scope === 'USED' && item.usedBy && (
                  <View style={styles.shareBoxInfoContainer}>
                    <Icon
                      name="person"
                      type="material"
                      size={12}
                      color="#278CCC"
                      containerStyle={styles.shareBoxIcon}
                    />
                    <Text style={styles.sharedByText} weight="bold">
                      {item.usedBy}님 사용
                    </Text>
                  </View>
                )}
              </View>

              {/* D-day 또는 사용일자 태그 */}
              <View
                style={[styles.dDayContainer, isUrgent ? styles.urgentDDay : styles.normalDDay]}
              >
                <Text
                  style={[
                    styles.dDayText,
                    isUrgent ? styles.urgentDDayText : styles.normalDDayText,
                  ]}
                  weight="bold"
                >
                  {item.scope === 'USED' ? formatDate(item.usedAt) : `D-${daysLeft}`}
                </Text>
              </View>
            </View>
          </Shadow>
        </TouchableOpacity>
      );
    }

    // 만료된 기프티콘은 Swipeable 기능 비활성화
    if (isExpired) {
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
                { opacity: 0.7 },
                isSharedByOther && { borderWidth: 1, borderColor: '#278CCC' },
              ]}
            >
              {/* 이미지 영역 - 만료된 경우 흐리게 표시 */}
              <View style={styles.imageContainer}>
                <Image
                  source={{ uri: getImageUrl(item.thumbnailPath) }}
                  style={styles.gifticonImage}
                />
              </View>

              {/* 텍스트 정보 영역 */}
              <View style={styles.textContainer}>
                <Text style={styles.brandText} weight="bold">
                  {item.brandName}
                </Text>
                <Text style={styles.nameText} numberOfLines={1} ellipsizeMode="tail">
                  {item.gifticonName}
                </Text>

                {/* 쉐어박스 정보 - 다른 사람이 공유한 경우에만 표시 */}
                {item.scope === 'SHARE_BOX' && item.userName && item.userId !== currentUserId && (
                  <View style={styles.shareBoxInfoContainer}>
                    <Icon
                      name="person"
                      type="material"
                      size={12}
                      color="#278CCC"
                      containerStyle={styles.shareBoxIcon}
                    />
                    <Text style={styles.sharedByText} weight="bold">
                      {item.userName}님 공유
                    </Text>
                  </View>
                )}
              </View>

              {/* 만료 태그 */}
              <View style={[styles.dDayContainer, styles.expiredDDay]}>
                <Text style={[styles.dDayText, styles.expiredDDayText]} weight="bold">
                  {daysLeft}
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
                <View style={styles.imageContainer}>
                  <Image
                    source={{ uri: getImageUrl(item.thumbnailPath) }}
                    style={styles.gifticonImage}
                  />
                </View>

                {/* 텍스트 정보 영역 */}
                <View style={styles.textContainer}>
                  <Text style={styles.brandText} weight="bold">
                    {item.brandName}
                  </Text>
                  <Text style={styles.nameText} numberOfLines={1} ellipsizeMode="tail">
                    {item.gifticonName}
                  </Text>

                  {/* 쉐어박스 정보 - 다른 사람이 공유한 경우에만 표시 */}
                  {item.scope === 'SHARE_BOX' && item.userName && item.userId !== currentUserId && (
                    <View style={styles.shareBoxInfoContainer}>
                      <Icon
                        name="person"
                        type="material"
                        size={12}
                        color="#278CCC"
                        containerStyle={styles.shareBoxIcon}
                      />
                      <Text style={styles.sharedByText} weight="bold">
                        {item.userName}님 공유
                      </Text>
                    </View>
                  )}

                  {/* 금액형 기프티콘의 경우 잔액 정보 표시 */}
                  {item.gifticonType === 'AMOUNT' && item.gifticonRemainingAmount && (
                    <Text
                      style={{
                        fontSize: 12,
                        color: '#278CCC',
                        fontWeight: 'bold',
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
                    weight="bold"
                  >
                    {typeof daysLeft === 'string' ? daysLeft : isDDay ? 'D-day' : `D-${daysLeft}`}
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
              <View style={styles.imageContainer}>
                <Image
                  source={{ uri: getImageUrl(item.thumbnailPath) }}
                  style={styles.gifticonImage}
                />
              </View>

              {/* 텍스트 정보 영역 */}
              <View style={styles.textContainer}>
                <Text style={styles.brandText} weight="bold">
                  {item.brandName}
                </Text>
                <Text style={styles.nameText} numberOfLines={1} ellipsizeMode="tail">
                  {item.gifticonName}
                </Text>

                {/* 쉐어박스 정보 - 다른 사람이 공유한 경우에만 표시 */}
                {item.scope === 'SHARE_BOX' && item.userName && item.userId !== currentUserId && (
                  <View style={styles.shareBoxInfoContainer}>
                    <Icon
                      name="person"
                      type="material"
                      size={12}
                      color="#278CCC"
                      containerStyle={styles.shareBoxIcon}
                    />
                    <Text style={styles.sharedByText} weight="bold">
                      {item.userName}님 공유
                    </Text>
                  </View>
                )}
              </View>

              {/* D-day 또는 사용일자 태그 */}
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
                  weight="bold"
                >
                  {typeof daysLeft === 'string' ? daysLeft : isDDay ? 'D-day' : `D-${daysLeft}`}
                </Text>
              </View>
            </View>
          </Shadow>
        </TouchableOpacity>
      </Swipeable>
    );
  };

  // 외부 클릭 감지를 위한 이벤트 리스너 설정 (React Native 방식으로 수정)
  const handleOutsidePress = () => {
    if (showSortDropdown) {
      setShowSortDropdown(false);
    }
  };

  // 필터/정렬 값에 따라 API 호출
  useEffect(() => {
    if (selectedCategory !== 'available') return;

    console.log('현재 로그인한 사용자 ID:', currentUserId);
    console.log('API 호출 - available', {
      shareBoxId,
      type: selectedFilter === 'all' ? undefined : selectedFilter.toUpperCase(),
      sort: sortBy.available === 'recent' ? 'CREATED_DESC' : 'EXPIRY_ASC',
    });

    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await fetchAvailableGifticons({
          shareBoxId,
          type: selectedFilter === 'all' ? undefined : selectedFilter.toUpperCase(),
          sort: sortBy.available === 'recent' ? 'CREATED_DESC' : 'EXPIRY_ASC',
          page: undefined,
          size: 20,
        });
        console.log(
          '기프티콘 목록 응답:',
          res.gifticons.map(item => ({
            gifticonId: item.gifticonId,
            gifticonName: item.gifticonName,
            userId: item.userId,
            userName: item.userName,
          }))
        );
        setAvailableGifticons(res.gifticons);
        setHasNextPage(res.hasNextPage);
        setNextPage(res.nextPage);
      } catch (e) {
        console.log('API 에러:', e);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedCategory, selectedFilter, sortBy.available, shareBoxId, currentUserId]);

  useEffect(() => {
    console.log('[사용완료 탭] API 호출 시작:', {
      selectedCategory,
      selectedFilter,
      sortBy: sortBy.used,
      shareBoxId,
    });
    if (selectedCategory !== 'used') return;

    const fetchData = async () => {
      setUsedLoading(true);
      try {
        console.log('[사용완료 탭] API 요청 파라미터:', {
          shareBoxId,
          type: selectedFilter === 'all' ? undefined : selectedFilter.toUpperCase(),
          sort: 'USED_DESC',
          page: undefined,
          size: 20,
        });
        const res = await fetchUsedGifticons({
          shareBoxId,
          type: selectedFilter === 'all' ? undefined : selectedFilter.toUpperCase(),
          sort: 'USED_DESC',
          page: undefined,
          size: 20,
        });
        console.log('[사용완료 탭] API 응답:', {
          gifticonsCount: res.gifticons?.length,
          hasNextPage: res.hasNextPage,
          nextPage: res.nextPage,
        });
        setUsedGifticons(res.gifticons);
        setUsedHasNextPage(res.hasNextPage);
        setUsedNextPage(res.nextPage);
      } catch (e) {
        console.error('[사용완료 탭] API 에러:', e);
      } finally {
        setUsedLoading(false);
      }
    };

    fetchData();
  }, [selectedCategory, selectedFilter, sortBy.used, shareBoxId]);

  // shareBoxId로 서버에서 최신 박스 이름 받아오기
  useEffect(() => {
    if (!shareBoxId) return;
    const fetchBoxInfo = async () => {
      try {
        const data = await fetchShareBoxSettings(shareBoxId);
        setBoxName(data.shareBoxName);
      } catch (e) {
        console.error('쉐어박스 정보 조회 실패:', e);
        Alert.alert('알림', '삭제되었거나 접근할 수 없는 쉐어박스입니다.', [
          { text: '확인', onPress: () => navigation.goBack() },
        ]);
      }
    };
    fetchBoxInfo();
  }, [shareBoxId, navigation]);

  useFocusEffect(
    React.useCallback(() => {
      const refreshAll = async () => {
        setRefreshing(true);
        try {
          // 최신 박스 이름
          if (shareBoxId) {
            const boxInfo = await fetchShareBoxSettings(shareBoxId);
            setBoxName(boxInfo.shareBoxName);
          }
          // 최신 기프티콘 목록
          if (selectedCategory === 'available') {
            const res = await fetchAvailableGifticons({
              shareBoxId,
              type: selectedFilter === 'all' ? undefined : selectedFilter.toUpperCase(),
              sort: sortBy.available === 'recent' ? 'CREATED_DESC' : 'EXPIRY_ASC',
              page: undefined,
              size: 20,
            });
            setAvailableGifticons(res.gifticons);
            setHasNextPage(res.hasNextPage);
            setNextPage(res.nextPage);
          } else if (selectedCategory === 'used') {
            const res = await fetchUsedGifticons({
              shareBoxId,
              type: selectedFilter === 'all' ? undefined : selectedFilter.toUpperCase(),
              sort: 'USED_DESC',
              page: undefined,
              size: 20,
            });
            setUsedGifticons(res.gifticons);
            setUsedHasNextPage(res.hasNextPage);
            setUsedNextPage(res.nextPage);
          }
        } catch (e) {
          // 에러 처리
        } finally {
          setRefreshing(false);
        }
      };
      refreshAll();
    }, [shareBoxId, selectedCategory, selectedFilter, sortBy])
  );

  const getImageUrl = thumbnailPath => {
    if (!thumbnailPath) return null;
    // 이미 http(s)로 시작하면 그대로 사용
    if (thumbnailPath.startsWith('http://') || thumbnailPath.startsWith('https://')) {
      return thumbnailPath;
    }
    // 아니면 API_BASE_URL을 붙여서 사용
    return API_BASE_URL + thumbnailPath;
  };

  // FlatList 데이터 준비
  const getGifticonData = () => {
    if (selectedCategory === 'available')
      return availableGifticons.map(item => ({ ...item, scope: 'SHARE_BOX' }));
    if (selectedCategory === 'used')
      return usedGifticons.map(item => ({ ...item, scope: 'USED', usedBy: item.userName }));
    return [];
  };
  const isListLoading = selectedCategory === 'available' ? loading : usedLoading;
  const isListRefreshing = refreshing;
  const hasMore = selectedCategory === 'available' ? hasNextPage : usedHasNextPage;
  const nextPageNum = selectedCategory === 'available' ? nextPage : usedNextPage;

  // 무한스크롤 핸들러
  const handleLoadMore = () => {
    if (isListLoading || !hasMore) return;
    if (selectedCategory === 'available') {
      fetchAvailableGifticons({
        shareBoxId,
        type: selectedFilter === 'all' ? undefined : selectedFilter.toUpperCase(),
        sort: sortBy.available === 'recent' ? 'CREATED_DESC' : 'EXPIRY_ASC',
        page: nextPageNum,
        size: 20,
      }).then(res => {
        setAvailableGifticons(prev => [...prev, ...res.gifticons]);
        setHasNextPage(res.hasNextPage);
        setNextPage(res.nextPage);
      });
    } else if (selectedCategory === 'used') {
      fetchUsedGifticons({
        shareBoxId,
        type: selectedFilter === 'all' ? undefined : selectedFilter.toUpperCase(),
        sort: 'USED_DESC',
        page: nextPageNum,
        size: 20,
      }).then(res => {
        setUsedGifticons(prev => [...prev, ...res.gifticons]);
        setUsedHasNextPage(res.hasNextPage);
        setUsedNextPage(res.nextPage);
      });
    }
  };

  return (
    <TouchableWithoutFeedback onPress={handleOutsidePress}>
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />

        {/* 안전 영역 상단 여백 */}
        <View style={{ height: insets.top, backgroundColor: theme.colors.background }} />

        {/* 헤더 */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
            <Icon name="chevron-left" type="material" size={30} color={theme.colors.text} />
          </TouchableOpacity>
          <Text variant="h3" weight="bold" style={styles.title}>
            {boxName}
          </Text>
          <TouchableOpacity onPress={handleSettingsPress} style={styles.settingsButton}>
            <Icon name="settings" type="material" size={24} color={theme.colors.grey3} />
          </TouchableOpacity>
        </View>

        {/* 카테고리 탭 */}
        <View style={styles.categoryTabContainer}>
          <CategoryTabs
            categories={categories}
            selectedId={selectedCategory}
            onSelectCategory={handleSelectCategory}
          />
        </View>

        {/* 필터 및 정렬 영역 */}
        <View style={styles.filterSortContainer}>
          {/* 필터 탭 */}
          <View style={styles.filterContainer}>
            <TabFilter
              tabs={filterTabs}
              initialTabId={selectedFilter}
              onTabChange={handleSelectFilter}
            />
          </View>

          {/* 정렬 드롭다운 */}
          <View style={styles.sortContainer}>
            <TouchableOpacity style={styles.sortButton} onPress={toggleSortDropdown}>
              <Text style={styles.sortButtonText}>
                {(selectedCategory === 'used' ? usedSortOptions : sortOptions).find(
                  option => option.id === sortBy[selectedCategory]
                )?.title || '정렬'}
              </Text>
              <Icon
                name={showSortDropdown ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
                type="material"
                size={18}
                color="#333"
              />
            </TouchableOpacity>

            {/* 정렬 드롭다운 메뉴 */}
            {showSortDropdown && (
              <View style={styles.sortDropdown}>
                {(selectedCategory === 'used' ? usedSortOptions : sortOptions).map(option => (
                  <TouchableOpacity
                    key={option.id}
                    style={styles.sortOption}
                    onPress={() => handleSelectSort(option.id)}
                  >
                    <Text
                      style={[
                        styles.sortOptionText,
                        sortBy[selectedCategory] === option.id && styles.sortOptionTextSelected,
                      ]}
                      weight={sortBy[selectedCategory] === option.id ? 'bold' : 'regular'}
                    >
                      {option.title}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </View>

        {/* 기프티콘 목록 (FlatList) */}
        <FlatList
          data={getGifticonData()}
          keyExtractor={item => String(item.gifticonId)}
          renderItem={({ item }) => renderGifticonItem(item)}
          contentContainerStyle={styles.scrollViewContent}
          refreshing={isListRefreshing}
          onRefresh={handleLoadMore}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.7}
          ListFooterComponent={
            isListLoading ? (
              <Text style={{ textAlign: 'center', margin: 16 }}>로딩 중...</Text>
            ) : null
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {selectedCategory === 'available'
                  ? '사용가능한 기프티콘이 없습니다'
                  : '사용완료한 기프티콘이 없습니다'}
              </Text>
            </View>
          }
        />

        {/* 사용 완료 확인 다이얼로그 */}
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
      </View>
    </TouchableWithoutFeedback>
  );
};

export default BoxListScreen;
