/* eslint-disable react-native/no-inline-styles */
// 금액형 사용 스크린

import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  Image,
  StatusBar,
  TouchableOpacity,
  Modal,
  TextInput,
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

const UseAmountScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const [modalVisible, setModalVisible] = useState(false);
  const [amount, setAmount] = useState('');
  const insets = useSafeAreaInsets();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [barcodeData, setBarcodeData] = useState(null);

  // route.params에서 정보 가져오기
  const { id, gifticonId, barcodeNumber, remainingAmount, brandName, gifticonName } =
    route.params || {};
  const actualGifticonId = id || gifticonId;

  // 기본 상품 정보 - 이후 API에서 가져온 데이터로 대체될 변수들
  const productInfo = {
    name: brandName && gifticonName ? `${brandName} | ${gifticonName}` : '상품권',
    barcodeNumber: barcodeNumber || '23424-325235-2352525-45345',
    remainingAmount: remainingAmount || 0,
  };

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

        // remainingAmount 업데이트
        productInfo.remainingAmount = response?.gifticonRemainingAmount || remainingAmount || 0;

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
  }, [actualGifticonId, navigation, route.params, remainingAmount]);

  // 뒤로가기
  const handleGoBack = () => {
    navigation.goBack();
  };

  // 금액 입력 모달 표시
  const handleShowModal = () => {
    setModalVisible(true);
  };

  // 모달 취소
  const handleCloseModal = () => {
    setModalVisible(false);
    setAmount('');
  };

  // 금액 칩 선택 처리
  const handleChipSelect = value => {
    const remainingAmt = barcodeData?.gifticonRemainingAmount || productInfo.remainingAmount || 0;

    if (value === 'all') {
      // '전액' 선택 시 남은 잔액 전체 설정 (콤마 포함)
      setAmount(remainingAmt.toLocaleString());
    } else {
      // 기존 금액에 선택한 금액 추가 (콤마 제거 후 계산)
      const currentAmount = amount ? parseInt(extractNumber(amount), 10) : 0;
      const newAmount = currentAmount + value;

      // 잔액보다 크면 잔액으로 제한
      if (newAmount > remainingAmt) {
        setAmount(remainingAmt.toLocaleString());
      } else {
        setAmount(newAmount.toLocaleString());
      }
    }
  };

  // 숫자에 콤마 추가하는 함수
  const formatAmount = amount => {
    return amount.toLocaleString() + '원';
  };

  // 입력된 텍스트에서 콤마를 제거하고 숫자만 추출하는 함수
  const extractNumber = text => {
    return text.replace(/,/g, '');
  };

  // 사용하지 않는 함수 제거

  // 금액 입력 완료 및 사용완료 처리
  const handleUseComplete = async () => {
    // 콤마 제거 후 숫자로 변환
    const numericAmount = amount ? parseInt(extractNumber(amount), 10) : 0;

    // 입력 검증
    if (!amount || amount.trim() === '') {
      Alert.alert('알림', '금액을 입력해주세요.');
      return;
    }

    // 숫자 검증
    if (isNaN(numericAmount) || numericAmount <= 0) {
      Alert.alert('알림', '유효한 금액을 입력해주세요. (0보다 큰 숫자)');
      return;
    }

    // 잔액 초과 검증 (이미 입력 시 제한되지만 추가 검증)
    const remainingAmt = barcodeData?.gifticonRemainingAmount || productInfo.remainingAmount || 0;
    if (numericAmount > remainingAmt) {
      Alert.alert('알림', `사용 가능한 금액(${remainingAmt.toLocaleString()}원)을 초과하였습니다.`);
      return;
    }

    try {
      setIsLoading(true);
      setModalVisible(false);

      // 금액형 기프티콘 사용 API 호출
      await gifticonService.useAmountGifticon(actualGifticonId, numericAmount);

      setIsLoading(false);

      // 화면 방향을 세로로 변경
      Orientation.lockToPortrait();

      // 성공 메시지 표시
      Alert.alert('성공', '기프티콘이 성공적으로 사용되었습니다.', [
        {
          text: '확인',
          onPress: () => {
            // 먼저 DetailAmountScreen으로 돌아가기
            navigation.goBack();

            // 그 후 사용내역 화면으로 이동
            setTimeout(() => {
              navigation.navigate('DetailAmountHistoryScreen', {
                gifticonId: actualGifticonId,
                brandName: brandName,
                gifticonName: gifticonName,
                scope: numericAmount >= remainingAmt ? 'USED' : 'MY_BOX',
                usageType: 'SELF_USE',
              });
            }, 100); // 약간의 시간을 두어 네비게이션이 올바르게 처리되게 함
          },
        },
      ]);
    } catch (err) {
      // 에러 발생 시 화면 방향을 세로로 변경
      Orientation.lockToPortrait();

      setIsLoading(false);
      console.error('기프티콘 사용 오류:', err);

      // 에러 메시지 처리
      let errorMessage = '기프티콘 사용 처리 중 오류가 발생했습니다.';

      if (err.response) {
        const status = err.response.status;

        // 서버 응답 상태코드별 메시지 처리
        if (status === 400) {
          errorMessage = '잘못된 요청입니다. 금액을 확인해주세요.';
        } else if (status === 401) {
          errorMessage = '인증이 필요합니다. 다시 로그인해주세요.';
        } else if (status === 403) {
          errorMessage = '이 기프티콘에 대한 권한이 없습니다.';
        } else if (status === 404) {
          errorMessage = '기프티콘을 찾을 수 없습니다.';
        } else if (status === 409) {
          errorMessage = '이미 사용된 기프티콘이거나 처리 중 충돌이 발생했습니다.';
        }

        // 서버에서 전달한 메시지가 있으면 이를 사용
        if (err.response.data?.message) {
          errorMessage = err.response.data.message;
        }
      } else if (err.request) {
        // 요청은 전송되었으나 응답을 받지 못한 경우
        errorMessage = '서버 응답이 없습니다. 네트워크 연결을 확인해주세요.';
      }

      Alert.alert('오류', errorMessage, [{ text: '확인' }]);
    }
  };

  // 취소 처리
  const handleCancel = () => {
    // 화면 방향을 세로로 변경 후 이전 화면으로
    Orientation.lockToPortrait();
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
                <TouchableOpacity style={styles.actionButton} onPress={handleShowModal}>
                  <Text style={styles.actionButtonText}>금액 입력</Text>
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

      {/* 금액 입력 모달 */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>사용 금액 입력</Text>

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
                  const remainingAmt =
                    barcodeData?.gifticonRemainingAmount || productInfo.remainingAmount || 0;

                  // 잔액 초과 검사
                  if (numValue > remainingAmt) {
                    // 잔액으로 제한
                    setAmount(remainingAmt.toLocaleString());
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
              잔액:{' '}
              {formatAmount(barcodeData?.gifticonRemainingAmount || productInfo.remainingAmount)}
            </Text>

            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={handleCloseModal}
                activeOpacity={0.7}
              >
                <Text style={styles.modalCancelButtonText}>취소</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalConfirmButton}
                onPress={handleUseComplete}
                activeOpacity={0.7}
              >
                <Text style={styles.modalConfirmButtonText}>확인</Text>
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
  // 모달 스타일
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
    fontWeight: 'bold',
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
    fontSize: 24,
    fontWeight: 'bold',
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
  modalCancelButton: {
    flex: 1,
    backgroundColor: '#F2F2F2',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginRight: 8,
  },
  modalConfirmButton: {
    flex: 1,
    backgroundColor: '#56AEE9',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginLeft: 8,
  },
  modalCancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  modalConfirmButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: 'white',
  },
});

export default UseAmountScreen;
