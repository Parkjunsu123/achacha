/* eslint-disable react-native/no-inline-styles */
// 상세 스크린 - 상품형

import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Modal,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { Icon } from 'react-native-elements';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '../../../components/ui';
import AlertDialog from '../../../components/ui/AlertDialog';
import { useTheme } from '../../../hooks/useTheme';
import { useTabBar } from '../../../context/TabBarContext';
import NavigationService from '../../../navigation/NavigationService';
import { fetchShareBoxes, shareGifticonToShareBox } from '../../../api/shareBoxService';
import gifticonService from '../../../api/gifticonService';
import { BASE_URL } from '../../../api/config';
import useAuthStore from '../../../store/authStore';

// 이미지 소스를 안전하게 가져오는 헬퍼 함수
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

const DetailProductScreen = () => {
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
  // 기프티콘 데이터 상태
  const [gifticonData, setGifticonData] = useState(null);
  // 로딩 상태
  const [isLoading, setIsLoading] = useState(true);
  // 사용 상태 관리
  const [isUsing, setIsUsing] = useState(false);
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
  // 쉐어박스 목록
  const [shareBoxes, setShareBoxes] = useState([]);
  // 이미지 확대 보기 상태
  const [isImageViewVisible, setImageViewVisible] = useState(false);
  // 바코드 정보 상태 추가
  const [barcodeInfo, setBarcodeInfo] = useState(null);
  const [barcodeLoading, setBarcodeLoading] = useState(false);

  // AlertDialog 상태 변수들
  const [customAlertVisible, setCustomAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [alertConfirmCallback, setAlertConfirmCallback] = useState(() => {});

  // 바텀탭 표시 - 화면이 포커스될 때마다 표시 보장
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      showTabBar();
    });

    // 초기 로드 시에도 바텀탭 표시
    showTabBar();

    return unsubscribe;
  }, [navigation, showTabBar]);

  // route.params에서 scope와 gifticonId를 가져오는 부분
  useEffect(() => {
    if (route.params) {
      if (route.params.scope) {
        setScope(route.params.scope);
      }
      if (route.params.gifticonId) {
        setGifticonId(route.params.gifticonId);
      }
      // 공유박스에서 내가 공유한 것인지 확인
      if (route.params.isSharer) {
        setIsSharer(route.params.isSharer);
      }
      // refresh 플래그가 true이면 데이터 다시 로드
      if (route.params.refresh && route.params.gifticonId) {
        loadGifticonData(route.params.gifticonId);
      }
    }
  }, [route.params]);

  // 기프티콘 ID가 있으면 데이터 로드
  useEffect(() => {
    if (gifticonId) {
      loadGifticonData(gifticonId);
    }
  }, [gifticonId]);

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

  // 뒤로가기 처리 함수
  const handleGoBack = () => {
    NavigationService.goBack();
  };

  // 기프티콘 데이터 로드 함수
  const loadGifticonData = async id => {
    setIsLoading(true);
    try {
      const response = await gifticonService.getGifticonDetail(id, scope);
      setGifticonData(response);
      // gifticonData가 세팅된 후 경로 확인
      if (response) {
        setIsSharer(response.isSharer);
      }

      // 사용완료 기프티콘인 경우 바코드 정보도 함께 로드
      if (scope === 'USED' && response.usageType === 'SELF_USE') {
        try {
          console.log(`[DetailProductScreen] 사용완료 바코드 정보 로드 시작 - ID: ${id}`);
          const barcodeResponse = await gifticonService.getUsedGifticonBarcode(id);
          if (barcodeResponse) {
            console.log('[DetailProductScreen] 바코드 정보 로드 성공');
            setBarcodeInfo({
              barcodeNumber: barcodeResponse.gifticonBarcodeNumber,
              barcodePath: barcodeResponse.barcodePath,
            });
          }
        } catch (barcodeError) {
          console.error('[DetailProductScreen] 바코드 정보 로드 실패:', barcodeError);
        }
      }

      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      // 에러 처리 로직 추가 (예: 에러 상태 설정, 토스트 메시지 등)
      setAlertTitle('오류');
      setAlertMessage('기프티콘 정보를 불러오는데 실패했습니다.');
      setAlertConfirmCallback(() => () => {});
      setCustomAlertVisible(true);
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
  const calculateDaysLeft = dateString => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // 현재 날짜의 시간을 00:00:00으로 설정
    const expiry = new Date(dateString);
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

  // 공유하기 기능 - 모달 표시로 변경
  const handleShare = () => {
    setShareBoxType('SHARE_BOX');
    if (shareBoxes.length > 0) {
      setSelectedShareBoxId(shareBoxes[0].shareBoxId);
    } else {
      setSelectedShareBoxId(null);
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

  // 바코드 정보 로드 함수 추가
  const loadBarcodeInfo = async () => {
    if (!gifticonId) return;

    setBarcodeLoading(true);
    try {
      // API 호출로 바코드 정보 가져오기
      const response = await gifticonService.getGifticonBarcode(gifticonId, scope);

      if (response) {
        setBarcodeInfo({
          barcodeNumber: response.gifticonBarcodeNumber,
          barcodePath: response.barcodePath,
        });
      }
    } catch (error) {
      // 오류 메시지 처리
      let errorMessage = '바코드 정보를 불러오는데 실패했습니다.';

      // 선물/뿌리기 완료된 기프티콘인 경우 바코드 정보가 없음을 알림
      if (
        isUsed &&
        (gifticonData.usageType === 'PRESENT' || gifticonData.usageType === 'GIVE_AWAY')
      ) {
        errorMessage = '선물/뿌리기로 사용된 기프티콘은 바코드 정보를 확인할 수 없습니다.';
      }

      setAlertTitle('알림');
      setAlertMessage(errorMessage);
      setAlertConfirmCallback(() => () => {});
      setCustomAlertVisible(true);
    } finally {
      setBarcodeLoading(false);
    }
  };

  // 사용하기 기능
  const handleUse = async () => {
    // 만료된 경우 바로 사용완료 처리
    const isExpired = calculateDaysLeft(gifticonData.gifticonExpiryDate) === '만료됨';

    if (isExpired || isUsing) {
      // 이미 사용 중인 경우 또는 만료된 경우 바로 사용 완료 처리
      try {
        // API 호출로 기프티콘 상태를 사용완료로 변경
        await gifticonService.useProductGifticon(gifticonId);

        // 성공 메시지 표시
        setAlertTitle('성공');
        setAlertMessage('기프티콘이 사용완료 처리되었습니다.');
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
      } catch (error) {
        // 오류 처리
        let errorMessage = '기프티콘 사용완료 처리 중 오류가 발생했습니다.';
        if (error.response && error.response.data && error.response.data.message) {
          errorMessage = error.response.data.message;
        }
        setAlertTitle('오류');
        setAlertMessage(errorMessage);
        setAlertConfirmCallback(() => () => {});
        setCustomAlertVisible(true);
      }
    } else {
      // 만료되지 않은 경우 사용 모드로 전환
      setIsUsing(true);
      // 바코드 정보 불러오기
      await loadBarcodeInfo();
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
      navigation.navigate('UseProductScreen', {
        id: gifticonData.gifticonId,
        gifticonId: gifticonData.gifticonId,
        isUsed: true,
        barcodeNumber: barcodeInfo?.barcodeNumber,
        barcodePath: barcodeInfo?.barcodePath,
        brandName: gifticonData.brandName,
        gifticonName: gifticonData.gifticonName,
      });
    } else if (!isUsed) {
      // 일반 사용 모드
      navigation.navigate('UseProductScreen', {
        id: gifticonData.gifticonId,
        gifticonId: gifticonData.gifticonId,
        barcodeNumber: barcodeInfo?.barcodeNumber,
        barcodePath: barcodeInfo?.barcodePath,
        brandName: gifticonData.brandName,
        gifticonName: gifticonData.gifticonName,
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
        console.log('[DetailProductScreen] 기프티콘 공유 취소 성공:', gifticonId);

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
      <View style={[styles.container, styles.loadingContainer]}>
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
                      <ActivityIndicator size="large" color="#56AEE9" />
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
                  {/* SELF_USE 유형의 사용완료 기프티콘인 경우 바코드 표시 */}
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
                <Text weight="bold" style={styles.nameText}>
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

                {/* 사용완료된 경우 사용일시 표시 */}
                {isUsed && (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>사용일시</Text>
                    <Text style={styles.infoValue}>
                      {formatDateTime(gifticonData.usageHistoryCreatedAt)}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </View>

          {/* 버튼 영역 - 사용완료가 아닌 경우에만 표시 */}
          {!isUsed && (
            <View style={styles.buttonContainer}>
              {/* 사용하기/사용완료 버튼 */}
              {!isUsing ? (
                // 일반 모드일 때
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
                    {calculateDaysLeft(gifticonData.gifticonExpiryDate) === '만료됨'
                      ? '사용완료'
                      : '사용하기'}
                  </Text>
                </TouchableOpacity>
              ) : (
                // 사용 모드일 때 - 사용완료 버튼 + 취소 버튼
                <>
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
                      사용완료
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
              )}

              {!isUsing &&
                scope === 'MY_BOX' &&
                calculateDaysLeft(gifticonData.gifticonExpiryDate) !== '만료됨' && (
                  // 만료되지 않은 마이박스 기프티콘에만 공유하기, 선물하기 버튼 표시
                  <View style={[styles.buttonRow, { marginTop: 10 }]}>
                    <TouchableOpacity
                      onPress={handleShare}
                      style={{
                        flex: 1,
                        marginRight: 4,
                        borderRadius: 8,
                        height: 56,
                        backgroundColor: '#EEEEEE',
                        justifyContent: 'center',
                        alignItems: 'center',
                        flexDirection: 'row',
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
                      onPress={handleGift}
                      style={{
                        flex: 1,
                        marginLeft: 4,
                        borderRadius: 8,
                        height: 56,
                        backgroundColor: '#EEEEEE',
                        justifyContent: 'center',
                        alignItems: 'center',
                        flexDirection: 'row',
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
            </View>
          )}
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

      {/* 공유 모달 */}
      <Modal
        visible={isShareModalVisible}
        transparent
        animationType="slide"
        onRequestClose={handleCloseShareModal}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, styles.boxModalContent]}>
            <Text variant="h4" weight="bold" style={styles.modalTitle}>
              쉐어박스 선택
            </Text>

            {/* <Text variant="h5" weight="bold" style={[styles.modalSubtitle, styles.sectionTitle]}>
              등록 위치
            </Text> */}

            {/* <Text variant="h5" weight="bold" style={styles.modalSubtitle}>
              공유 위치
            </Text> */}

            {/* 쉐어박스 선택 */}
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
    justifyContent: 'center',
  },
  contentContainer: {
    padding: 16,
  },
  cardContainer: {
    marginBottom: 2,
  },
  gifticonCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E6F4FB',
  },
  imageContainer: {
    backgroundColor: '#EEEEEE',
    alignItems: 'center',
    justifyContent: 'center',
    height: 300,
    borderBottomWidth: 1,
    borderBottomColor: '#E6F4FB',
    position: 'relative',
  },
  gifticonImage: {
    width: 200,
    height: 200,
    aspectRatio: 1,
    resizeMode: 'cover',
    marginBottom: 20,
    borderRadius: 8,
  },
  // 바코드 관련 스타일
  barcodeContainer: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    height: 300,
  },
  barcodeImage: {
    width: '90%',
    height: '80%',
  },
  barcodeNumberContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  barcodeNumberText: {
    fontSize: 18,
    color: '#333',
  },
  magnifyButton: {
    padding: 5,
  },
  infoContainer: {
    padding: 16,
  },
  brandText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 6,
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
    fontWeight: '500',
    marginRight: 8,
  },
  infoValue: {
    flex: 1,
    fontSize: 16,
    color: '#000',
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
  loadingContainer: {
    backgroundColor: '#FFFFFF',
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
  grayScaleImage: {
    opacity: 0.7,
    // React Native는 기본적으로 grayscale 필터를 지원하지 않기 때문에
    // 투명도를 낮춰 흑백처럼 보이게 합니다.
    // 실제 앱에서는 이미지 처리 라이브러리 사용을 고려할 수 있습니다.
  },
  smallerGifticonImage: {
    width: 160,
    height: 160,
    aspectRatio: 1,
    marginTop: 10,
    marginBottom: 10,
    resizeMode: 'cover',
    borderRadius: 8,
  },
  usedBarcodeContainer: {
    alignItems: 'center',
    width: '90%',
    marginTop: 5, // 바코드 상단 여백 추가
    marginBottom: 10,
    padding: 10,
    borderRadius: 8,
  },
  usedBarcodeImage: {
    width: '100%',
    height: 60,
  },
  usedBarcodeNumberText: {
    fontSize: 16,
    color: '#333',
    marginTop: 5,
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
  actionRemoveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F9F9F9',
    marginLeft: 8,
  },
  actionRemoveText: {
    fontSize: 14,
    color: '#718096',
    marginLeft: 4,
    fontWeight: '500',
  },
  // 모달 관련 스타일
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
  },
  boxModalContent: {
    maxHeight: '70%',
  },
  modalTitle: {
    textAlign: 'center',
    marginBottom: 20,
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
  loadingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  errorText: {
    color: '#D33434',
    fontSize: 16,
    fontWeight: '500',
  },
  emptyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  emptyText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
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
  barcodeLoadingContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  barcodeLoadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
  },
});

export default DetailProductScreen;
