// PresentScreen.js - 선물하기 화면

import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  TextInput,
  FlatList,
  // 현재 width는 사용하지 않지만 향후 확장성을 위해 import 유지
  Dimensions,
} from 'react-native';
import { Icon } from 'react-native-elements';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '../../components/ui';
import { useTheme } from '../../hooks/useTheme';
import { useTabBar } from '../../context/TabBarContext';
import NavigationService from '../../navigation/NavigationService';
import {
  getPresentTemplates,
  getPresentTemplateColors,
  getPresentTemplateDetail,
  presentGifticon,
  presentCancelGifticon,
} from '../../api/presentService';
import { ERROR_MESSAGES } from '../../constants/errorMessages';
import KakaoShareLink from 'react-native-kakao-share-link';
import AlertDialog from '../../components/ui/AlertDialog';

// 이미지 소스를 안전하게 가져오는 헬퍼 함수 (DetailProductScreen과 동일)
const getImageSource = path => {
  if (!path) {
    return require('../../assets/images/adaptive_icon.png');
  }
  if (typeof path === 'string' && path.startsWith('http')) {
    return { uri: path };
  }
  // BASE_URL이 필요한 경우 추가 가능
  return path;
};

// eslint-disable-next-line no-unused-vars
const { width } = Dimensions.get('window');

const PresentScreen = () => {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();

  const navigation = useNavigation(); // 네비게이션 객체는 handleGift 함수 내 사용
  const route = useRoute();
  const { hideTabBar } = useTabBar();

  // 템플릿 썸네일 목록 (API 연동)
  const [thumbnails, setThumbnails] = useState([]);

  // 선택된 템플릿 ID
  const [selectedTemplateId, setSelectedTemplateId] = useState(1);

  // 템플릿 상세 정보 (API 연동)
  const [templateDetail, setTemplateDetail] = useState(null);

  // 템플릿 색상 팔레트 (API 연동)
  const [colorPalettes, setColorPalettes] = useState([]);

  // 선택된 템플릿 색상 변형 (템플릿 1에서만 사용)
  const [selectedColorVariant, setSelectedColorVariant] = useState(1);

  // 기프티콘 데이터
  const [gifticonData, setGifticonData] = useState(null);

  // 사용자 메시지
  const [message, setMessage] = useState('');

  // 공유 완료 상태 추적
  const [, setIsShared] = useState(false);

  // AlertDialog 노출 상태
  const [presentDialogVisible, setPresentDialogVisible] = useState(false);

  // AlertDialog 추가
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState('info');
  const [alertCallback, setAlertCallback] = useState(() => {});

  // 탭바 숨기기
  useEffect(() => {
    hideTabBar();

    return () => {
      // 화면 벗어날 때 필요한 정리 작업
    };
  }, [hideTabBar]);

  // 기프티콘 데이터 가져오기
  useEffect(() => {
    if (route.params?.gifticonId) {
      // 실제 구현에서는 API 호출
      // gifticonId와 thumbnailPath를 파라미터로 받아서 세팅
      setGifticonData({
        id: route.params.gifticonId,
        // name, brandName은 필요시 추가 API 호출로 보완
        thumbnailPath: route.params.thumbnailPath || require('../../assets/images/dummy_mc.png'),
      });
    }
  }, [route.params]);

  // 템플릿 썸네일 API 호출
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const data = await getPresentTemplates();
        setThumbnails(data);
      } catch (e) {
        let message = '템플릿 목록을 불러오지 못했습니다.';
        const errorCode = e?.response?.data?.errorCode;
        if (errorCode && ERROR_MESSAGES[errorCode]) {
          message = ERROR_MESSAGES[errorCode];
        } else if (e?.response?.data?.message) {
          message = e.response.data.message;
        }
        showAlert('에러', message);
        setThumbnails([]);
      }
    };
    fetchTemplates();
  }, []);

  // 1번 템플릿(GENERAL) 선택 시 색상 팔레트 API 호출
  useEffect(() => {
    const fetchColors = async () => {
      if (selectedTemplateId === 1) {
        try {
          const colors = await getPresentTemplateColors(1);
          setColorPalettes(colors);
        } catch (e) {
          let message = '색상 팔레트를 불러오지 못했습니다.';
          const errorCode = e?.response?.data?.errorCode;
          if (errorCode && ERROR_MESSAGES[errorCode]) {
            message = ERROR_MESSAGES[errorCode];
          } else if (e?.response?.data?.message) {
            message = e.response.data.message;
          }
          showAlert('에러', message);
          setColorPalettes([]);
        }
      } else {
        setColorPalettes([]);
      }
    };
    fetchColors();
  }, [selectedTemplateId]);

  // 템플릿 상세 정보 API 호출
  useEffect(() => {
    const fetchTemplateDetail = async () => {
      if (selectedTemplateId) {
        try {
          const detail = await getPresentTemplateDetail(selectedTemplateId);
          setTemplateDetail(detail);
        } catch (e) {
          let message = '템플릿 상세 정보를 불러오지 못했습니다.';
          const errorCode = e?.response?.data?.errorCode;
          if (errorCode && ERROR_MESSAGES[errorCode]) {
            message = ERROR_MESSAGES[errorCode];
          } else if (e?.response?.data?.message) {
            message = e.response.data.message;
          }
          showAlert('에러', message);
          setTemplateDetail(null);
        }
      } else {
        setTemplateDetail(null);
      }
    };
    fetchTemplateDetail();
  }, [selectedTemplateId]);

  // 뒤로가기 처리 함수
  const handleGoBack = () => {
    NavigationService.goBack();
  };

  // 템플릿 선택 처리 함수
  const handleSelectTemplate = id => {
    setSelectedTemplateId(id);
    // 템플릿 1이 아닌 경우 색상 변형 리셋
    if (id !== 1) {
      setSelectedColorVariant(1);
    }
  };

  // 색상 변형 선택 처리 함수
  const handleSelectColorVariant = variantId => {
    setSelectedColorVariant(variantId);
  };

  // 갤러리에 저장 처리 함수
  const handleSaveToGallery = () => {
    // TODO: 실제 갤러리 저장 기능 구현 필요
  };

  // 알림 다이얼로그 표시 함수
  const showAlert = (title, message, callback = () => {}, type = 'info') => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertCallback(() => callback);
    setAlertType(type);
    setAlertVisible(true);
  };

  // 선물하기 처리 함수
  const handleSendGift = async () => {
    if (!gifticonData?.id) {
      showAlert('에러', '기프티콘 정보가 없습니다.');
      return;
    }
    try {
      const res = await presentGifticon(
        gifticonData.id,
        selectedTemplateId,
        selectedTemplateId === 1 ? selectedColorVariant : null,
        message
      );
      setTimeout(() => {
        setPresentDialogVisible(true);
      }, 3000);
      // API 호출 및 카카오링크 이동 후 Alert 표시
      await handleOpenKakaoShare(res.presentCardCode, res.gifticonName, res.brandName);
    } catch (e) {
      showAlert('에러', '선물하기에 실패했습니다.');
    }
  };

  // 현재 선택된 템플릿 이미지 가져오기
  const getSelectedTemplateImage = () => {
    if (templateDetail) {
      if (templateDetail.presentTemplateCategory === 'GENERAL' && templateDetail.colorCards) {
        // GENERAL 템플릿: colorPaletteId에 맞는 cardImagePath
        const card = templateDetail.colorCards.find(v => v.colorPaletteId === selectedColorVariant);
        if (card) return { uri: card.cardImagePath };
        // fallback: 첫 번째 카드
        if (templateDetail.colorCards.length > 0) {
          return { uri: templateDetail.colorCards[0].cardImagePath };
        }
      } else if (templateDetail.cardImagePath) {
        // 그 외 템플릿: cardImagePath 사용
        return { uri: templateDetail.cardImagePath };
      }
    }
    // fallback: 흰색 배경
    return { uri: '' };
  };

  // 렌더링 템플릿 썸네일 아이템
  const renderThumbnailItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.thumbnailItem,
        selectedTemplateId === item.presentTemplateId && styles.selectedThumbnailItem,
      ]}
      onPress={() => handleSelectTemplate(item.presentTemplateId)}
    >
      <Image
        source={{ uri: item.thumbnailPath }}
        style={styles.thumbnailImage}
        resizeMode="contain"
      />
    </TouchableOpacity>
  );

  useEffect(() => {
    if (selectedTemplateId === 1 && colorPalettes.length > 0) {
      setSelectedColorVariant(colorPalettes[0].colorPaletteId);
    }
  }, [colorPalettes, selectedTemplateId]);

  const handleOpenKakaoShare = async (presentCardCode, gifticonName, brandName) => {
    try {
      await KakaoShareLink.sendCustom({
        templateId: 120645,
        templateArgs: [
          { key: 'present_card_code', value: presentCardCode },
          { key: 'gifticon_name', value: gifticonName },
          { key: 'brand_name', value: brandName },
        ],
      });
      // 공유 완료 상태 설정
      setIsShared(true);
    } catch (err) {
      console.log('카카오톡 공유 실패:', err);
      showAlert('에러', '카카오톡 공유에 실패했습니다.');
    }
  };

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
          기프티콘 선물
        </Text>
        <View style={styles.rightPlaceholder} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* 템플릿 썸네일 리스트 */}
        <View style={styles.thumbnailSection}>
          <FlatList
            data={thumbnails}
            renderItem={renderThumbnailItem}
            keyExtractor={item => item.presentTemplateId.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.thumbnailList}
          />
        </View>
        {/* 색상 선택 팔레트 (템플릿 1에서만 표시) */}
        {selectedTemplateId === 1 && colorPalettes.length > 0 && (
          <View style={styles.colorPaletteContainer}>
            {colorPalettes.map(variant => (
              <TouchableOpacity
                key={variant.colorPaletteId}
                style={[
                  styles.colorOption,
                  { backgroundColor: variant.colorPaletteCode },
                  selectedColorVariant === variant.colorPaletteId && styles.selectedColorOption,
                ]}
                onPress={() => handleSelectColorVariant(variant.colorPaletteId)}
              />
            ))}
          </View>
        )}
        {/* 템플릿 카드 영역 - 새로운 레이아웃 */}
        <View style={styles.templateCardSection}>
          <View style={styles.templateCard}>
            {/* 미리보기 라벨 */}
            <View style={styles.previewLabelContainer}>
              <Text style={styles.previewLabelText}>미리보기</Text>
            </View>
            {/* 템플릿 이미지 */}
            <Image
              source={getSelectedTemplateImage()}
              style={styles.templateImage}
              resizeMode="contain"
            />

            {/* 사용자 입력 영역 */}
            <View style={styles.contentOverlay}>
              {/* 메시지 입력 영역 - 흰색 카드 */}
              <View style={styles.messageInputCard}>
                <TextInput
                  style={styles.messageInput}
                  placeholder="텍스트를 입력하세요."
                  placeholderTextColor="#767676"
                  multiline
                  value={message}
                  onChangeText={setMessage}
                  maxLength={100}
                />
              </View>

              {/* 점선 구분선 */}
              <View style={styles.dashedLine} />

              {/* 기프티콘 이미지 영역 - 흰색 카드 */}
              <View style={styles.gifticonCard}>
                {/* 기프티콘 이미지 영역 */}
                <View style={styles.gifticonImageContainer}>
                  {gifticonData && (
                    <Image
                      source={getImageSource(gifticonData.thumbnailPath)}
                      style={styles.gifticonImage}
                      resizeMode="contain"
                    />
                  )}
                </View>

                {/* 갤러리에 저장 버튼 */}
                <TouchableOpacity style={styles.galleryButton} onPress={handleSaveToGallery}>
                  <Text style={styles.galleryButtonText}>갤러리에 저장</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* 선물하기 버튼 영역 - 별도로 유지 */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.sendButton} onPress={handleSendGift}>
              <Text style={styles.sendButtonText}>선물하기</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
      {/* 선물완료 AlertDialog */}
      <AlertDialog
        isVisible={presentDialogVisible}
        onBackdropPress={() => setPresentDialogVisible(false)}
        title="알림"
        message="기프티콘 선물하기를 완료하셨나요?!"
        confirmText="네"
        cancelText="아니요"
        onConfirm={() => {
          setPresentDialogVisible(false);
          navigation.pop(2);
        }}
        onCancel={async () => {
          setPresentDialogVisible(false);
          try {
            await presentCancelGifticon(gifticonData.id);
          } finally {
            navigation.goBack();
          }
        }}
        type="warning"
      />

      {/* 일반 알림 다이얼로그 */}
      <AlertDialog
        isVisible={alertVisible}
        onBackdropPress={() => setAlertVisible(false)}
        title={alertTitle}
        message={alertMessage}
        confirmText="확인"
        onConfirm={() => {
          setAlertVisible(false);
          alertCallback && alertCallback();
        }}
        type={alertType}
        hideCancel={true}
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
  thumbnailSection: {
    marginTop: 16,
    marginBottom: 0,
  },
  thumbnailList: {
    paddingHorizontal: 16,
  },
  thumbnailItem: {
    width: 65,
    height: 65,
    marginRight: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E6E6E6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedThumbnailItem: {
    borderColor: '#56AEE9',
    borderWidth: 2,
  },
  thumbnailImage: {
    width: '100%',
    height: 55,
  },
  templateCardSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  templateCard: {
    width: '100%',
    alignItems: 'center',
    backgroundColor: 'transparent',
    position: 'relative',
  },
  previewLabelContainer: {
    position: 'absolute',
    top: 28,
    left: 10,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    zIndex: 10,
  },
  previewLabelText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: 'bold',
    letterSpacing: 1,
    fontFamily: 'Pretendard-Bold',
  },
  templateImage: {
    width: '100%',
    height: undefined,
    aspectRatio: 0.66, // 템플릿 이미지 원본 비율 유지
    resizeMode: 'contain',
  },
  contentOverlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    paddingTop: '45%', // 상단 여백
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  // 메시지 입력 카드 스타일
  messageInputCard: {
    width: '80%',
    marginBottom: 10,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 10,
  },
  messageInput: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    height: 80,
  },
  // 점선 구분선 스타일
  dashedLine: {
    width: '80%',
    height: 1,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#737373',
    marginBottom: 10,
  },
  // 기프티콘 카드 스타일
  gifticonCard: {
    width: '80%',
    height: '50%',
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
  },
  gifticonImageContainer: {
    width: '80%',
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    aspectRatio: 1,
  },
  gifticonImage: {
    width: '100%',
    height: '100%',
    aspectRatio: 1,
  },
  galleryButton: {
    width: '80%',
    height: 40,
    backgroundColor: '#E5F4FE',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  galleryButtonText: {
    color: '#278CCC',
    fontSize: 14,
    fontWeight: 'semiBold',
  },
  colorPaletteContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 15,
    marginBottom: -3,
  },
  colorOption: {
    width: 25,
    height: 25,
    borderRadius: 15,
    marginHorizontal: 8,
    borderWidth: 1,
    borderColor: '#E6E6E6',
  },
  selectedColorOption: {
    borderWidth: 2,
    borderColor: '#56AEE9',
  },
  buttonContainer: {
    marginTop: 10,
    width: '100%',
  },
  sendButton: {
    height: 56,
    borderRadius: 8,
    backgroundColor: '#56AEE9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'semibolc',
  },
});

export default PresentScreen;
