/* eslint-disable react-native/no-inline-styles */
// 상품형 사용 스크린

import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  Image,
  StatusBar,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Icon } from 'react-native-elements';
import { useNavigation, useRoute } from '@react-navigation/native';
import Orientation from 'react-native-orientation-locker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '../../../components/ui';
import gifticonService from '../../../api/gifticonService';
import { BASE_URL } from '../../../api/config';
import BrightnessControl from '../../../utils/BrightnessControl';

const UseProductScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [barcodeData, setBarcodeData] = useState(null);

  // route.params에서 정보 가져오기
  const { id, gifticonId, barcodeNumber, brandName, gifticonName } = route.params || {};
  const actualGifticonId = id || gifticonId;

  // 화면 로드 시 가로 모드로 설정 및 화면 밝기 최대로 설정
  useEffect(() => {
    // 가로 모드로 고정
    Orientation.lockToLandscape();

    // 화면 밝기 최대로 설정
    BrightnessControl.setMaxBrightness();

    // 컴포넌트 언마운트 시 원래 모드로 복귀 및 밝기 복원
    return () => {
      Orientation.lockToPortrait();

      // 화면 밝기 원래대로 복원
      BrightnessControl.restoreBrightness();
    };
  }, []);

  // 바코드 데이터 로드
  useEffect(() => {
    const loadBarcodeData = async () => {
      if (!actualGifticonId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // route.params에서 isUsed 값을 확인하여 사용완료 기프티콘인지 확인
        const isUsedGifticon = route.params?.isUsed || false;

        let response;
        if (isUsedGifticon) {
          // 사용완료 기프티콘 바코드 조회
          response = await gifticonService.getUsedGifticonBarcode(actualGifticonId);
        } else {
          // 사용 가능 기프티콘 바코드 조회
          response = await gifticonService.getAvailableGifticonBarcode(actualGifticonId);
        }

        setBarcodeData(response);
        setIsLoading(false);
      } catch (err) {
        console.error('바코드 로드 에러:', err);
        setError(err);
        setIsLoading(false);

        // 에러 메시지 표시
        if (err.response) {
          const errorMessage = err.response.data?.message || '바코드 로드 중 오류가 발생했습니다.';

          Alert.alert('오류', errorMessage, [
            {
              text: '확인',
              onPress: () => navigation.goBack(),
            },
          ]);
        } else {
          Alert.alert('오류', '네트워크 연결을 확인해주세요.', [
            {
              text: '확인',
              onPress: () => navigation.goBack(),
            },
          ]);
        }
      }
    };

    loadBarcodeData();
  }, [actualGifticonId, navigation, route.params]);

  // 뒤로가기
  const handleGoBack = () => {
    navigation.goBack();
  };

  // 사용 완료 처리
  const handleUseComplete = async () => {
    try {
      setIsLoading(true);
      // 사용완료 처리 API 호출
      await gifticonService.useProductGifticon(actualGifticonId);
      setIsLoading(false);

      // 성공 메시지 표시
      Alert.alert('성공', '기프티콘이 사용완료 처리되었습니다.', [
        {
          text: '확인',
          onPress: () => {
            // 사용완료 후 ManageListScreen으로 이동하면서 네비게이션 스택 초기화
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
          },
        },
      ]);
    } catch (err) {
      setIsLoading(false);
      console.error('기프티콘 사용 완료 처리 오류:', err);

      // 에러 메시지 표시
      let errorMessage = '기프티콘 사용완료 처리 중 오류가 발생했습니다.';
      if (err.response && err.response.data && err.response.data.message) {
        errorMessage = err.response.data.message;
      }

      Alert.alert('오류', errorMessage, [{ text: '확인' }]);
    }
  };

  // 취소 처리
  const handleCancel = () => {
    navigation.goBack();
  };

  // 로딩 중인 경우
  if (isLoading) {
    return (
      <View
        style={[
          styles.container,
          { backgroundColor: 'white', justifyContent: 'center', alignItems: 'center' },
        ]}
      >
        <StatusBar hidden />
        <ActivityIndicator size="large" color="#56AEE9" />
        <Text style={{ marginTop: 15, fontSize: 16, color: '#333' }}>
          바코드 정보를 불러오는 중...
        </Text>
      </View>
    );
  }

  // 에러가 있는 경우 (이미 Alert로 처리했으므로 빈 화면 렌더링)
  if (error && !barcodeData) {
    return (
      <View style={[styles.container, { backgroundColor: 'white' }]}>
        <StatusBar hidden />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: 'white' }]}>
      <StatusBar hidden />

      {/* 좌측 Safe Area */}
      <View style={{ width: insets.left, height: '100%' }} />

      <View style={styles.mainContent}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
            <Icon name="arrow-back-ios" type="material" size={22} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {brandName && gifticonName ? `${brandName} | ${gifticonName}` : '바코드 조회'}
          </Text>
        </View>

        <View style={styles.content}>
          <View style={styles.barcodeSection}>
            <Image
              source={
                barcodeData?.barcodePath
                  ? {
                      uri: barcodeData.barcodePath.startsWith('http')
                        ? barcodeData.barcodePath
                        : `${BASE_URL}${barcodeData.barcodePath}`,
                    }
                  : require('../../../assets/images/barcode.png')
              }
              style={styles.barcodeImage}
              resizeMode="contain"
            />
            <Text style={styles.barcodeNumber}>
              {barcodeData?.gifticonBarcodeNumber || barcodeNumber || '바코드 정보 없음'}
            </Text>
          </View>

          <View style={styles.actionSection}>
            {!route.params?.isUsed ? (
              // 일반 사용 가능 기프티콘
              <>
                <TouchableOpacity style={styles.actionButton} onPress={handleUseComplete}>
                  <Text style={styles.actionButtonText}>사용완료</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
                  <Text style={styles.cancelButtonText}>취소</Text>
                </TouchableOpacity>
              </>
            ) : (
              // 사용완료 기프티콘 - 확인 버튼만 표시
              <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
                <Text style={styles.cancelButtonText}>확인</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      {/* 우측 Safe Area */}
      <View style={{ width: insets.right, height: '100%' }} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row', // 가로 모드에서 좌우 안전 영역을 위해 row로 변경
  },
  mainContent: {
    flex: 1,
    flexDirection: 'column',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
    color: '#333',
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    justifyContent: 'flex-start',
  },
  barcodeSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
  },
  barcodeImage: {
    width: '100%',
    height: 150,
    marginBottom: 10,
  },
  barcodeNumber: {
    fontSize: 22,
    fontWeight: '600',
    color: '#000',
    marginTop: 10,
    textAlign: 'center',
  },
  actionSection: {
    width: 150,
    justifyContent: 'center',
  },
  actionButton: {
    backgroundColor: '#56AEE9',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
    width: '100%',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: '#EEEEEE',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    width: '100%',
  },
  cancelButtonText: {
    color: '#278CCC',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default UseProductScreen;
