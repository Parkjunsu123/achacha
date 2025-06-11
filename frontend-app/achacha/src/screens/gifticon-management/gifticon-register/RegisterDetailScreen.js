// 기프티콘 등록 상세 스크린

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Platform,
  Modal,
  StatusBar,
  Alert,
  PermissionsAndroid,
  ActivityIndicator,
  FlatList,
  TextInput,
  Keyboard,
} from 'react-native';
import { Button, InputLine, Text, LoadingOcrModal } from '../../../components/ui';
import { useTheme } from '../../../hooks/useTheme';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation, useRoute } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon as RNEIcon } from 'react-native-elements';
import ImagePicker from 'react-native-image-crop-picker';
import { detectAndCropBarcode, detectBarcode } from '../../../utils/BarcodeUtils';
import useGifticonStore from '../../../store/gifticonStore';
// 기프티콘 서비스 import
import gifticonService from '../../../api/gifticonService';
import brandService from '../../../api/brandService'; // 브랜드 서비스 추가
import { fetchShareBoxes } from '../../../api/shareBoxService'; // 쉐어박스 API 추가

const RegisterDetailScreen = () => {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();

  // Zustand 스토어에서 바코드 관련 기능 불러오기
  const setCurrentBarcodeInfo = useGifticonStore(state => state.setCurrentBarcodeInfo);
  // 크롭 데이터 관련 기능 추가
  const cropData = useGifticonStore(state => state.registerForm.cropData);
  const updateRegisterFormCropData = useGifticonStore(state => state.updateRegisterFormCropData);
  const updateRegisterFormImage = useGifticonStore(state => state.updateRegisterFormImage);

  // 상태 선언
  const [brandSearchText, setBrandSearchText] = useState(''); // 브랜드 검색 텍스트
  const [brandList, setBrandList] = useState([]); // 브랜드 검색 결과 목록
  const [showBrandList, setShowBrandList] = useState(false); // 브랜드 목록 표시 여부
  const [selectedBrand, setSelectedBrand] = useState(null); // 선택된 브랜드 정보
  const [productName, setProductName] = useState('');
  const [expiryDate, setExpiryDate] = useState(null);
  const [amount, setAmount] = useState('');
  const [barcodeNumber, setBarcodeNumber] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isBoxModalVisible, setBoxModalVisible] = useState(false);
  const [isImageOptionVisible, setImageOptionVisible] = useState(false);
  const [isTypeLocked, setTypeLocked] = useState(!!route.params?.imageUri); // 이미지가 전달되었으면 타입 잠금
  const [isBarcodeImageModalVisible, setBarcodeImageModalVisible] = useState(false);
  const [currentImageUri, setCurrentImageUri] = useState(route.params?.imageUri || null);
  const [originalImageUri, setOriginalImageUri] = useState(route.params?.imageUri || null);
  // OCR 학습 데이터 ID 상태 추가
  const [ocrTrainingDataId, setOcrTrainingDataId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isOcrLoading, setIsOcrLoading] = useState(false); // OCR 처리 로딩 상태 추가
  // 박스 및 기프티콘 타입 상태
  const [boxType, setBoxType] = useState(route.params?.boxType || 'MY_BOX');
  const [shareBoxId, setShareBoxId] = useState(route.params?.shareBoxId || null);
  const [gifticonType, setGifticonType] = useState(route.params?.gifticonType || 'PRODUCT');
  // 바코드 이미지 URI 상태 추가
  const [barcodeImageUri, setBarcodeImageUri] = useState(null);
  // 쉐어박스 목록 상태 및 로딩 상태 추가
  const [shareBoxes, setShareBoxes] = useState([]);
  const [isLoadingShareBoxes, setIsLoadingShareBoxes] = useState(false);
  // 날짜 텍스트 입력 상태 추가
  const [dateInputText, setDateInputText] = useState('');

  // ref 관련 설정
  const processingRef = useRef(false);
  // 등록 진행 중인지 표시하는 ref 추가
  const isRegistering = useRef(false);
  // 화면 데이터 상태 관리
  const [barcode, setBarcode] = useState('');

  const [barcodeFormat, setBarcodeFormat] = useState(null);
  const [isOriginalImageVisible, setOriginalImageVisible] = useState(false); // 원본 이미지 팝업 표시 여부

  // 이미지 소스를 위한 타임스탬프 useRef 추가
  const imageTimestampRef = useRef(Date.now());

  // 이미지 처리 최적화
  const imageSource = useCallback(uri => {
    if (!uri) return null;
    // 고정 타임스탬프를 사용하여 렌더링 횟수 줄이기
    return { uri: `${uri}?timestamp=${imageTimestampRef.current}` };
  }, []);

  // 브랜드 입력 위치 관련 상태 및 함수 제거
  const brandInputContainerRef = useRef(null);
  const brandSearchDebounceTimeout = useRef(null);

  // 화면이 마운트되거나 방향이 변경될 때 위치 측정 - 제거
  useEffect(() => {
    // 코드 제거
  }, []);

  // 초기 화면 로드시 이미지가 있는지 확인
  useEffect(() => {
    // 스토어에 저장된 이미지와 크롭 데이터 불러오기
    const registerFormData = useGifticonStore.getState().registerForm;

    // ✅ 이미 초기화된 데이터가 있는지 확인하는 플래그
    const hasExistingData = registerFormData.initialized;

    if (registerFormData.imageUri) {
      setCurrentImageUri(registerFormData.imageUri);

      // 원본 이미지 설정
      if (registerFormData.originalImageUri) {
        setOriginalImageUri(registerFormData.originalImageUri);
      } else {
        setOriginalImageUri(registerFormData.imageUri);
      }

      console.log('스토어에서 이미지 로드:', registerFormData.imageUri);
      console.log('스토어에서 크롭 데이터 로드:', registerFormData.cropData);
    }

    // 처음 진입했을 때만 route.params로부터 초기화
    if (!hasExistingData) {
      if (route.params?.selectedImage) {
        try {
          const imageUri = route.params.selectedImage.uri;
          console.log('[상세 화면] 편집된 이미지 로드:', imageUri);
          if (imageUri) {
            setCurrentImageUri(imageUri);

            // 원본 이미지 URI 처리
            if (route.params?.originalImage && route.params.originalImage.uri) {
              console.log('[상세 화면] 원본 이미지 로드:', route.params.originalImage.uri);
              setOriginalImageUri(route.params.originalImage.uri);
            } else {
              // 원본 이미지가 없는 경우 현재 이미지를 원본으로 설정
              setOriginalImageUri(imageUri);
            }

            // route.params에 cropData가 있으면 저장
            if (route.params?.cropData) {
              console.log('[상세 화면] 크롭 데이터 로드:', route.params.cropData);
              updateRegisterFormCropData(route.params.cropData);
            }

            // Zustand 스토어에 이미지 상태 저장
            updateRegisterFormImage(
              imageUri,
              route.params?.originalImage?.uri || imageUri,
              route.params?.cropData
            );
          } else {
            console.warn('[상세 화면] 유효하지 않은 이미지 URI');
          }
        } catch (error) {
          console.error('[상세 화면] 이미지 로드 중 오류:', error);
        }
      }

      // 바코드 정보 가져오기 (메인 화면에서 전달받은 정보) - 최초 한 번만 설정
      if (route.params?.barcodeValue && !barcode) {
        console.log('[상세 화면] 이전 화면에서 전달받은 바코드:', route.params.barcodeValue);

        // 바코드 정보 설정
        setBarcode(route.params.barcodeValue);
        setBarcodeNumber(route.params.barcodeValue);

        if (route.params?.barcodeFormat) {
          setBarcodeFormat(route.params.barcodeFormat);
        }

        // 바코드 이미지 정보 설정
        if (route.params?.barcodeImageUri) {
          console.log(
            '[상세 화면] 이전 화면에서 전달받은 바코드 이미지:',
            route.params.barcodeImageUri
          );
          // 바코드 이미지 URI 설정
          setBarcodeImageUri(route.params.barcodeImageUri);
        }
      }

      // OCR 학습 데이터 ID 처리
      if (route.params?.ocrTrainingDataId) {
        console.log('[상세 화면] OCR 학습 데이터 ID 설정:', route.params.ocrTrainingDataId);
        setOcrTrainingDataId(route.params.ocrTrainingDataId);
      }

      // 메타데이터를 통해 기프티콘 정보 설정
      if (route.params?.gifticonMetadata) {
        console.log('[상세 화면] 메타데이터 정보 설정:', route.params.gifticonMetadata);

        const metadata = route.params.gifticonMetadata;

        // 브랜드 정보 처리
        if (metadata.brandName) {
          console.log('[상세 화면] 브랜드명 설정:', metadata.brandName);
          setBrandSearchText(metadata.brandName);

          // 브랜드 검색 및 선택 자동화 시도
          (async () => {
            try {
              const brandService = require('../../../api/brandService').default;
              const brandResults = await brandService.searchBrands(metadata.brandName);
              if (brandResults && brandResults.length > 0) {
                // 가장 일치하는 첫 번째 브랜드 선택
                console.log('[상세 화면] 브랜드 자동 선택:', brandResults[0]);
                setSelectedBrand(brandResults[0]);
                setBrandList(brandResults);
              }
            } catch (err) {
              console.error('[상세 화면] 브랜드 자동 검색 실패:', err);
            }
          })();
        }

        // 상품명 설정
        if (metadata.gifticonName) {
          console.log('[상세 화면] 상품명 설정:', metadata.gifticonName);
          setProductName(metadata.gifticonName);
        }

        // 바코드 번호 설정 (barcodeValue가 없는 경우)
        if (metadata.gifticonBarcodeNumber && !route.params?.barcodeValue) {
          console.log('[상세 화면] 바코드 번호 설정:', metadata.gifticonBarcodeNumber);
          setBarcode(metadata.gifticonBarcodeNumber);
          setBarcodeNumber(metadata.gifticonBarcodeNumber);
        }

        // 유효기간 설정
        if (metadata.gifticonExpiryDate) {
          console.log('[상세 화면] 유효기간 설정:', metadata.gifticonExpiryDate);
          setExpiryDate(new Date(metadata.gifticonExpiryDate));
        }

        // 금액형 기프티콘인 경우 금액 설정 (콤마 포맷팅 적용)
        if (metadata.gifticonOriginalAmount && gifticonType === 'AMOUNT') {
          console.log('[상세 화면] 금액 설정:', metadata.gifticonOriginalAmount);
          setAmount(formatAmount(metadata.gifticonOriginalAmount.toString()));
        }
      } else {
        // 개별 메타데이터 정보 처리 (역호환성 용)
        if (route.params?.brandName) {
          console.log('[상세 화면] 브랜드명 설정 (개별):', route.params.brandName);
          setBrandSearchText(route.params.brandName);

          // 브랜드 검색 및 선택 자동화 시도
          (async () => {
            try {
              const brandService = require('../../../api/brandService').default;
              const brandResults = await brandService.searchBrands(route.params.brandName);
              if (brandResults && brandResults.length > 0) {
                console.log('[상세 화면] 브랜드 자동 선택 (개별):', brandResults[0]);
                setSelectedBrand(brandResults[0]);
                setBrandList(brandResults);
              }
            } catch (err) {
              console.error('[상세 화면] 브랜드 자동 검색 실패 (개별):', err);
            }
          })();
        }

        if (route.params?.gifticonName) {
          console.log('[상세 화면] 상품명 설정 (개별):', route.params.gifticonName);
          setProductName(route.params.gifticonName);
        }

        if (route.params?.gifticonBarcodeNumber && !barcode) {
          console.log('[상세 화면] 바코드 번호 설정 (개별):', route.params.gifticonBarcodeNumber);
          setBarcode(route.params.gifticonBarcodeNumber);
          setBarcodeNumber(route.params.gifticonBarcodeNumber);
        }

        if (route.params?.gifticonExpiryDate) {
          console.log('[상세 화면] 유효기간 설정 (개별):', route.params.gifticonExpiryDate);
          setExpiryDate(new Date(route.params.gifticonExpiryDate));
        }

        if (route.params?.gifticonOriginalAmount && gifticonType === 'AMOUNT') {
          console.log('[상세 화면] 금액 설정 (개별):', route.params.gifticonOriginalAmount);
          setAmount(formatAmount(route.params.gifticonOriginalAmount.toString()));
        }
      }

      // 기프티콘 타입 및 등록 위치 정보 가져오기
      if (route.params?.gifticonType) {
        setGifticonType(route.params.gifticonType);
        setTypeLocked(true);
      }

      if (route.params?.boxType) {
        setBoxType(route.params.boxType);
      }

      if (route.params?.shareBoxId) {
        setShareBoxId(route.params.shareBoxId);
      }

      // 타입과 위치가 선택되어 있지 않으면 모달 자동 표시
      if (!route.params?.gifticonType) {
        // 약간의 딜레이 후 모달 표시 (화면 전환 애니메이션이 끝난 후)
        setTimeout(() => {
          setBoxModalVisible(true);
        }, 300);
      }

      // 유효기간이 설정되면 dateInputText도 함께 업데이트
      if (route.params?.gifticonExpiryDate) {
        console.log('[상세 화면] 유효기간 설정 (개별):', route.params.gifticonExpiryDate);
        const expiryDate = new Date(route.params.gifticonExpiryDate);
        setExpiryDate(expiryDate);

        // dateInputText 업데이트
        const year = expiryDate.getFullYear();
        const month = String(expiryDate.getMonth() + 1).padStart(2, '0');
        const day = String(expiryDate.getDate()).padStart(2, '0');
        setDateInputText(`${year}.${month}.${day}`);
      }

      // 초기화 완료 표시
      const updateRegisterFormField = useGifticonStore.getState().updateRegisterFormField;
      updateRegisterFormField('initialized', true);
      console.log('[상세 화면] 초기화 완료 플래그 설정');
    }

    // 컴포넌트 언마운트 시 메모리 정리
    return () => {
      // 임시 이미지 파일이 있다면 여기서 정리할 수 있음
    };
  }, [route.params, gifticonType]);

  // 메타데이터에서 유효기간 설정 시 dateInputText 업데이트를 위한 useEffect 추가
  useEffect(() => {
    if (expiryDate && !dateInputText) {
      const year = expiryDate.getFullYear();
      const month = String(expiryDate.getMonth() + 1).padStart(2, '0');
      const day = String(expiryDate.getDate()).padStart(2, '0');
      setDateInputText(`${year}.${month}.${day}`);
    }
  }, [expiryDate, dateInputText]);

  // 편집된 이미지가 있을 경우 썸네일에 표시 (로직 개선)
  useEffect(() => {
    if (currentImageUri) {
      console.log('편집된 이미지로 썸네일 업데이트:', currentImageUri);
    }
  }, [currentImageUri]);

  // 뒤로가기 처리
  const handleGoBack = () => {
    // 이미지가 등록되었거나 정보가 입력된 경우에만 확인 대화상자 표시
    if (currentImageUri || productName || brandSearchText || dateInputText || barcode) {
      Alert.alert(
        '등록 취소',
        '기프티콘 등록을 취소하시겠습니까? 입력한 정보는 저장되지 않습니다.',
        [
          {
            text: '취소',
            style: 'cancel',
            onPress: () => {
              // 취소 시 스토어의 initialized 상태 유지
              const updateRegisterFormField = useGifticonStore.getState().updateRegisterFormField;
              updateRegisterFormField('initialized', true);
            },
          },
          {
            text: '확인',
            onPress: () => {
              // 등록 취소 시 스토어 상태 초기화
              const resetRegisterForm = useGifticonStore.getState().resetRegisterForm;
              resetRegisterForm();
              navigation.goBack();
            },
          },
        ],
        { cancelable: false }
      );
    } else {
      // 아무 정보도 입력되지 않았으면 바로 뒤로가기
      navigation.goBack();
    }
  };

  // 날짜 선택기 표시
  const showDatePickerHandler = () => {
    setShowDatePicker(true);
  };

  // 날짜 변경 처리
  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setExpiryDate(selectedDate);

      // dateInputText도 함께 업데이트
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const day = String(selectedDate.getDate()).padStart(2, '0');
      const formattedDate = `${year}.${month}.${day}`;
      setDateInputText(formattedDate);

      // ✅ 스토어에도 날짜 정보 저장
      const updateRegisterFormField = useGifticonStore.getState().updateRegisterFormField;
      updateRegisterFormField('expiryDate', selectedDate);
      updateRegisterFormField('dateInputText', formattedDate);
    }
  };

  // 텍스트 형식 날짜 입력 처리 함수 수정
  const handleDateTextChange = text => {
    // 숫자와 마침표만 허용
    let formattedText = text.replace(/[^0-9.]/g, '');

    // YYYYMMDD 형식을 YYYY.MM.DD 형식으로 자동 변환
    if (formattedText.length === 8 && !formattedText.includes('.')) {
      formattedText = `${formattedText.substring(0, 4)}.${formattedText.substring(4, 6)}.${formattedText.substring(6, 8)}`;
    }
    // YY.MM.DD 또는 YY.M.DD 등의 형식 처리
    else if (formattedText.includes('.')) {
      const parts = formattedText.split('.');
      // 입력 과정 중에는 그대로 유지
      if (parts.length === 3) {
        // 날짜 부분이 완성되었을 때 포맷팅
        if (parts[0].length === 4 && parts[1].length > 0 && parts[2].length > 0) {
          // 월이 1~12 사이인지 확인
          let month = parseInt(parts[1], 10);
          if (month > 0 && month <= 12) {
            month = String(month).padStart(2, '0');
          }

          // 일이 1~31 사이이고 해당 월에 유효한지 확인
          let day = parseInt(parts[2], 10);
          if (day > 0 && day <= 31) {
            day = String(day).padStart(2, '0');
          }

          formattedText = `${parts[0]}.${month}.${day}`;
        }
      }
    }

    // 입력된 텍스트 저장
    setDateInputText(formattedText);

    // ✅ 스토어에 dateInputText 저장
    const updateRegisterFormField = useGifticonStore.getState().updateRegisterFormField;
    updateRegisterFormField('dateInputText', formattedText);

    // 완전한 날짜 포맷이 아니면 Date 객체 업데이트하지 않음
    const parts = formattedText.split('.');
    if (parts.length !== 3) return;

    // 각 부분이 적절한 길이가 아니면 업데이트하지 않음
    if (parts[0].length < 4 || parts[1].length < 1 || parts[2].length < 1) return;

    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // 월은 0부터 시작
    const day = parseInt(parts[2], 10);

    // 입력된 값이 유효한 숫자인지 확인
    if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
      const newDate = new Date(year, month, day);

      // 유효한 날짜인지 확인
      if (!isNaN(newDate.getTime())) {
        setExpiryDate(newDate);

        // ✅ 스토어에 expiryDate 저장
        updateRegisterFormField('expiryDate', newDate);
      }
    }
  };

  // 박스 모달 표시
  const showBoxModal = () => {
    setBoxModalVisible(true);
  };

  // 박스 선택 완료
  const handleBoxSelected = () => {
    // 타입과 박스 모두 선택되었는지 확인
    if (gifticonType && boxType) {
      setBoxModalVisible(false);
      setTypeLocked(true);
    } else {
      Alert.alert('알림', '기프티콘 타입과 등록 위치를 모두 선택해주세요.');
    }
  };

  // 이미지 컨테이너 터치 핸들러
  const handleImageContainerPress = () => {
    try {
      // 이미지가 있으면 원본 이미지 팝업 표시, 없으면 이미지 옵션 모달 표시
      if (currentImageUri) {
        // 원본 이미지가 있는 경우에만 원본 이미지 모달 표시
        if (originalImageUri) {
          console.log('원본 이미지 모달 표시:', originalImageUri);
          setOriginalImageVisible(true);
        }
      } else {
        // 이미지가 없는 경우 이미지 옵션 모달 표시
        setImageOptionVisible(true);
      }
    } catch (error) {
      console.error('이미지 컨테이너 터치 처리 오류:', error);
    }
  };

  // 안드로이드 카메라 권한 요청
  const requestCameraPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CAMERA, {
          title: '카메라 접근 권한',
          message: '기프티콘 등록을 위해 카메라 접근 권한이 필요합니다.',
          buttonNeutral: '나중에 묻기',
          buttonNegative: '취소',
          buttonPositive: '확인',
        });
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        return false;
      }
    }
    return true;
  };

  // 바코드 확인 함수 - 저장된 바코드 정보를 확인할 수 있도록 개선
  const showBarcodeImage = () => {
    // 디버깅 로그
    console.log('[기프티콘 등록] 바코드 확인 - 현재 바코드:', barcode);
    console.log('[기프티콘 등록] 바코드 이미지 URI:', barcodeImageUri);
    console.log('[기프티콘 등록] 현재 이미지 URI:', currentImageUri);
    console.log('[기프티콘 등록] 원본 이미지 URI:', originalImageUri);

    // 바코드 번호가 없으면 수동 입력 요청
    if (!barcode && !barcodeNumber) {
      Alert.alert(
        '바코드 정보 없음',
        '인식된 바코드 번호가 없습니다. 바코드 번호를 수동으로 입력하시겠습니까?',
        [
          { text: '취소', style: 'cancel' },
          {
            text: '바코드 인식 재시도',
            onPress: async () => {
              if (originalImageUri) {
                try {
                  console.log('[기프티콘 등록] 바코드 재인식 시도:', originalImageUri);
                  const result = await detectBarcode(originalImageUri);

                  if (result.success && result.barcodes.length > 0) {
                    const firstBarcode = result.barcodes[0];
                    setBarcode(firstBarcode.value);
                    setBarcodeFormat(firstBarcode.format);

                    // 바코드 이미지 영역 저장 시도
                    if (firstBarcode.boundingBox) {
                      try {
                        const cropResult = await detectAndCropBarcode(originalImageUri);
                        if (cropResult.success && cropResult.croppedImageUri) {
                          setBarcodeImageUri(cropResult.croppedImageUri);
                          setBarcodeImageModalVisible(true);
                          console.log(
                            '[기프티콘 등록] 바코드 이미지 저장 성공:',
                            cropResult.croppedImageUri
                          );
                        }
                      } catch (cropError) {
                        console.error('[기프티콘 등록] 바코드 크롭 오류:', cropError);
                      }
                    }

                    // 바코드 정보 저장
                    setCurrentBarcodeInfo(
                      firstBarcode.value,
                      firstBarcode.format,
                      firstBarcode.boundingBox
                    );

                    // 바코드 이미지 모달 표시
                    setBarcodeImageModalVisible(true);
                  } else {
                    Alert.alert('알림', '바코드를 인식할 수 없습니다. 직접 입력해주세요.', [
                      { text: '취소', style: 'cancel' },
                      {
                        text: '수동 입력',
                        onPress: () => {
                          Alert.prompt(
                            '바코드 번호 입력',
                            '바코드 번호를 직접 입력해주세요.',
                            [
                              { text: '취소', style: 'cancel' },
                              {
                                text: '저장',
                                onPress: value => {
                                  if (value && value.trim()) {
                                    setBarcode(value.trim());
                                    Alert.alert('완료', '바코드 번호가 저장되었습니다.', [
                                      {
                                        text: '확인',
                                        onPress: () => setBarcodeImageModalVisible(true),
                                      },
                                    ]);
                                  } else {
                                    Alert.alert('오류', '유효한 바코드 번호를 입력해주세요.');
                                  }
                                },
                              },
                            ],
                            'plain-text'
                          );
                        },
                      },
                    ]);
                  }
                } catch (error) {
                  console.error('[기프티콘 등록] 바코드 재인식 오류:', error);
                  Alert.alert('오류', '바코드 인식 중 문제가 발생했습니다.');
                }
              } else {
                Alert.alert('알림', '원본 이미지가 없습니다. 이미지를 다시 업로드해주세요.');
              }
            },
          },
          {
            text: '수동 입력',
            onPress: () => {
              Alert.prompt(
                '바코드 번호 입력',
                '바코드 번호를 직접 입력해주세요.',
                [
                  { text: '취소', style: 'cancel' },
                  {
                    text: '저장',
                    onPress: value => {
                      if (value && value.trim()) {
                        setBarcode(value.trim());
                        Alert.alert('완료', '바코드 번호가 저장되었습니다.', [
                          {
                            text: '확인',
                            onPress: () => setBarcodeImageModalVisible(true),
                          },
                        ]);
                      } else {
                        Alert.alert('오류', '유효한 바코드 번호를 입력해주세요.');
                      }
                    },
                  },
                ],
                'plain-text'
              );
            },
          },
        ]
      );
      return;
    }

    // 바코드 번호는 있지만 바코드 이미지가 없는 경우 바코드 이미지 추출 시도
    if ((barcode || barcodeNumber) && !barcodeImageUri && originalImageUri) {
      console.log('[기프티콘 등록] 바코드 이미지 추출 재시도');

      // // 사용자에게 알림
      // Alert.alert('바코드 이미지 추출', '바코드 이미지를 추출하고 있습니다. 잠시만 기다려주세요.', [
      //   { text: '확인' },
      // ]);

      // 잠시 후 바코드 이미지 추출 시도
      setTimeout(async () => {
        try {
          setIsLoading(true);

          // 바코드 추출 시도
          const result = await detectAndCropBarcode(originalImageUri);

          if (result.success && result.croppedImageUri) {
            console.log('[기프티콘 등록] 바코드 이미지 추출 성공:', result.croppedImageUri);
            setBarcodeImageUri(result.croppedImageUri);

            // 바코드 번호가 없는 경우에만 설정
            if (!barcode && result.barcodeValue) {
              setBarcode(result.barcodeValue);
              setBarcodeFormat(result.barcodeFormat);
            }
          } else {
            console.log('[기프티콘 등록] 바코드 이미지 추출 실패');
          }

          setIsLoading(false);
          // 바코드 이미지 모달 표시
          setBarcodeImageModalVisible(true);
        } catch (error) {
          console.error('[기프티콘 등록] 바코드 이미지 추출 오류:', error);
          setIsLoading(false);
          // 오류가 발생해도 바코드 번호만이라도 표시
          setBarcodeImageModalVisible(true);
        }
      }, 300);
      return;
    }

    // 바코드 정보 모달 표시
    setBarcodeImageModalVisible(true);
  };

  // 이미지 선택 시 바코드 자동 추출 및 인식 기능 추가
  const processImageForBarcode = useCallback(
    async imageUri => {
      if (!imageUri) return;

      try {
        console.log('[이미지 처리] 바코드 인식 시작:', imageUri);

        // 바코드 감지 및 추출 실행
        const result = await detectAndCropBarcode(imageUri);

        if (result.success) {
          console.log('[이미지 처리] 바코드 인식 및 추출 성공:', result);

          // 바코드 정보 저장
          setBarcode(result.barcodeValue);
          setBarcodeFormat(result.barcodeFormat);
          setBarcodeImageUri(result.croppedImageUri);

          // Zustand 스토어에 바코드 정보 저장 (이미지 URI 포함)
          setCurrentBarcodeInfo(
            result.barcodeValue,
            result.barcodeFormat,
            result.boundingBox,
            result.croppedImageUri
          );

          // 성공 메시지 (선택적)
          if (!result.boundingBox) {
            console.log('[이미지 처리] 바코드 값은 인식했으나 정확한 위치는 파악하지 못했습니다.');
          }
        } else {
          console.log('[이미지 처리] 바코드 인식 실패:', result.message);
        }
      } catch (error) {
        console.error('[이미지 처리] 오류:', error);
      }
    },
    [setCurrentBarcodeInfo]
  );

  // 갤러리에서 이미지 선택
  const handlePickFromGallery = useCallback(async () => {
    try {
      setImageOptionVisible(false);

      const image = await ImagePicker.openPicker({
        mediaType: 'photo',
        cropping: false,
        includeExif: true,
        // 이미지 크기 제한 추가
        // compressImageMaxWidth: 1000,
        // compressImageMaxHeight: 1000,
        // compressImageQuality: 0.8,
      });

      console.log('갤러리에서 선택한 이미지:', image);
      setCurrentImageUri(image.path);
      setOriginalImageUri(image.path);

      // 바코드 처리를 먼저 수행
      console.log('[갤러리 선택] 바코드 처리 먼저 수행');
      await processImageForBarcode(image.path);

      // 기프티콘 이미지 메타데이터 API 호출
      setIsLoading(true);
      setIsOcrLoading(true); // OCR 로딩 모달 표시
      try {
        const metadata = await gifticonService.getGifticonImageMetadata(
          { uri: image.path, type: image.mime, fileName: image.filename || 'image.jpg' },
          gifticonType
        );

        console.log('기프티콘 메타데이터 조회 결과:', metadata);

        // OCR 학습 데이터 ID 저장 (강조)
        if (metadata && metadata.ocrTrainingDataId) {
          console.log('[갤러리 선택] OCR 학습 데이터 ID 저장:', metadata.ocrTrainingDataId);
          setOcrTrainingDataId(metadata.ocrTrainingDataId);
        } else {
          console.log('[갤러리 선택] OCR 학습 데이터 ID가 없습니다');
        }

        // 응답 데이터로 폼 채우기
        if (metadata) {
          // 브랜드 정보 처리
          if (metadata.brandName) {
            // 브랜드명 설정
            setBrandSearchText(metadata.brandName);

            // 브랜드 자동 검색 수행 (선택은 사용자가 하도록 함)
            try {
              const brandResults = await brandService.searchBrands(metadata.brandName);
              if (brandResults && brandResults.length > 0) {
                setBrandList(brandResults);
                setShowBrandList(true);

                // 가장 일치하는 브랜드 자동 선택 추가
                setSelectedBrand(brandResults[0]);
                console.log('[갤러리 선택] 브랜드 자동 선택:', brandResults[0]);
              }
            } catch (err) {
              console.error('브랜드 자동 검색 실패:', err);
            }
          }

          setProductName(metadata.gifticonName || '');

          // 바코드 번호는 이미 바코드 인식을 통해 설정되었을 수 있으므로 조건부로 설정
          if (metadata.gifticonBarcodeNumber && !barcode) {
            setBarcodeNumber(metadata.gifticonBarcodeNumber);
            setBarcode(metadata.gifticonBarcodeNumber);
            setBarcodeFormat('CODE_128');
          } else {
            // 이미 바코드가 인식된 경우 API 결과는 참고만 함
            setBarcodeNumber(metadata.gifticonBarcodeNumber || '');
          }

          // 유효기간이 있으면 Date 객체로 변환
          if (metadata.gifticonExpiryDate) {
            setExpiryDate(new Date(metadata.gifticonExpiryDate));
          }

          // 금액형 기프티콘인 경우 금액 설정 (콤마 포맷팅 적용)
          if (metadata.gifticonOriginalAmount && gifticonType === 'AMOUNT') {
            setAmount(formatAmount(metadata.gifticonOriginalAmount.toString()));
          }
        }
      } catch (error) {
        console.error('기프티콘 메타데이터 조회 실패:', error);

        // 네트워크 오류 확인
        const errorMessage =
          error.message.includes('네트워크') || error.message.includes('Network')
            ? '네트워크 연결을 확인해주세요. 오프라인 상태에서는 기프티콘 정보를 자동으로 인식할 수 없습니다.'
            : '기프티콘 정보를 자동으로 인식하지 못했습니다. 정보를 직접 입력해주세요.';

        // 에러 발생 시 사용자에게 알림
        Alert.alert('정보 조회 실패', errorMessage, [{ text: '확인' }]);
      } finally {
        setIsLoading(false);
        setIsOcrLoading(false); // OCR 로딩 모달 숨김
      }
    } catch (error) {
      // 사용자가 취소한 경우 무시
      if (error.code !== 'E_PICKER_CANCELLED') {
        console.error('[갤러리 이미지 선택] 오류:', error);
        Alert.alert('오류', '이미지 선택 중 문제가 발생했습니다.');
      }
    }
  }, [processImageForBarcode, gifticonType, barcode, formatAmount]);

  // 카메라로 촬영 함수 수정
  const handleTakePhoto = useCallback(async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
      Alert.alert('권한 없음', '카메라를 사용하기 위해 권한이 필요합니다.');
      return;
    }

    try {
      setImageOptionVisible(false);

      const image = await ImagePicker.openCamera({
        width: 1000,
        height: 1000,
        cropping: false,
        includeExif: true,
        // // 이미지 크기 제한 추가
        // compressImageMaxWidth: 1000,
        // compressImageMaxHeight: 1000,
        // compressImageQuality: 0.8,
      });

      console.log('[이미지 선택] 카메라로 촬영:', image.path);

      // 이미지 URI 저장
      setCurrentImageUri(image.path);
      setOriginalImageUri(image.path);

      // 바코드 처리를 먼저 수행
      console.log('[카메라 촬영] 바코드 처리 먼저 수행');
      await processImageForBarcode(image.path);

      // 기프티콘 이미지 메타데이터 API 호출
      setIsLoading(true);
      setIsOcrLoading(true); // OCR 로딩 모달 표시
      try {
        const metadata = await gifticonService.getGifticonImageMetadata(
          { uri: image.path, type: image.mime, fileName: image.filename || 'image.jpg' },
          gifticonType
        );

        console.log('기프티콘 메타데이터 조회 결과:', metadata);

        // OCR 학습 데이터 ID 저장 (강조)
        if (metadata && metadata.ocrTrainingDataId) {
          console.log('[카메라 촬영] OCR 학습 데이터 ID 저장:', metadata.ocrTrainingDataId);
          setOcrTrainingDataId(metadata.ocrTrainingDataId);
        } else {
          console.log('[카메라 촬영] OCR 학습 데이터 ID가 없습니다');
        }

        // 응답 데이터로 폼 채우기
        if (metadata) {
          // 브랜드 정보 처리
          if (metadata.brandName) {
            // 브랜드명 설정
            setBrandSearchText(metadata.brandName);

            // 브랜드 자동 검색 수행 (선택은 사용자가 하도록 함)
            try {
              const brandResults = await brandService.searchBrands(metadata.brandName);
              if (brandResults && brandResults.length > 0) {
                setBrandList(brandResults);
                setShowBrandList(true);

                // 가장 일치하는 브랜드 자동 선택 추가
                setSelectedBrand(brandResults[0]);
                console.log('[카메라 촬영] 브랜드 자동 선택:', brandResults[0]);
              }
            } catch (err) {
              console.error('브랜드 자동 검색 실패:', err);
            }
          }

          setProductName(metadata.gifticonName || '');

          // 바코드 번호는 이미 바코드 인식을 통해 설정되었을 수 있으므로 조건부로 설정
          if (metadata.gifticonBarcodeNumber && !barcode) {
            setBarcodeNumber(metadata.gifticonBarcodeNumber);
            setBarcode(metadata.gifticonBarcodeNumber);
            setBarcodeFormat('CODE_128');
          } else {
            // 이미 바코드가 인식된 경우 API 결과는 참고만 함
            setBarcodeNumber(metadata.gifticonBarcodeNumber || '');
          }

          // 유효기간이 있으면 Date 객체로 변환
          if (metadata.gifticonExpiryDate) {
            setExpiryDate(new Date(metadata.gifticonExpiryDate));
          }

          // 금액형 기프티콘인 경우 금액 설정 (콤마 포맷팅 적용)
          if (metadata.gifticonOriginalAmount && gifticonType === 'AMOUNT') {
            setAmount(formatAmount(metadata.gifticonOriginalAmount.toString()));
          }
        }
      } catch (error) {
        console.error('기프티콘 메타데이터 조회 실패:', error);

        // 네트워크 오류 확인
        const errorMessage =
          error.message.includes('네트워크') || error.message.includes('Network')
            ? '네트워크 연결을 확인해주세요. 오프라인 상태에서는 기프티콘 정보를 자동으로 인식할 수 없습니다.'
            : '기프티콘 정보를 자동으로 인식하지 못했습니다. 정보를 직접 입력해주세요.';

        // 에러 발생 시 사용자에게 알림
        Alert.alert('정보 조회 실패', errorMessage, [{ text: '확인' }]);
      } finally {
        setIsLoading(false);
        setIsOcrLoading(false); // OCR 로딩 모달 숨김
      }
    } catch (error) {
      // 사용자가 취소한 경우 무시
      if (error.code !== 'E_PICKER_CANCELLED') {
        console.error('[이미지 선택] 오류:', error);
        Alert.alert('오류', '카메라 사용 중 문제가 발생했습니다.');
      }
    }
  }, [processImageForBarcode, requestCameraPermission, gifticonType, barcode, formatAmount]);

  // 박스명 가져오기
  const getShareBoxName = id => {
    const box = shareBoxes.find(item => item.shareBoxId === id);
    return box ? box.shareBoxName : '';
  };

  // 금액 포맷팅 함수 추가
  const formatAmount = value => {
    // 숫자와 쉼표 이외의 문자 제거
    const numericValue = value.replace(/[^0-9]/g, '');

    // 쉼표 추가하여 반환
    return numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  // 금액 입력 핸들러
  const handleAmountChange = text => {
    // 포맷팅된 금액 설정
    const formattedAmount = formatAmount(text);
    setAmount(formattedAmount);

    // ✅ 스토어에 금액 정보 저장
    const updateRegisterFormField = useGifticonStore.getState().updateRegisterFormField;
    updateRegisterFormField('amount', formattedAmount);
  };

  // 기프티콘 등록 처리
  const handleRegister = async () => {
    if (!currentImageUri) {
      Alert.alert('알림', '기프티콘 이미지를 등록해주세요.');
      return;
    }

    if (!selectedBrand) {
      Alert.alert('알림', '브랜드를 선택해주세요.');
      return;
    }

    if (!productName.trim()) {
      Alert.alert('알림', '상품명을 입력해주세요.');
      return;
    }

    if (!expiryDate) {
      Alert.alert('알림', '유효기간을 입력해주세요.');
      return;
    }

    // 금액형인 경우 금액 검증
    if (gifticonType === 'AMOUNT') {
      // 쉼표를 제거한 순수 숫자 값 얻기
      const numericAmount = amount.replace(/,/g, '');

      if (!numericAmount || isNaN(Number(numericAmount)) || Number(numericAmount) <= 0) {
        Alert.alert('알림', '유효한 금액을 입력해주세요.');
        return;
      }
    }

    try {
      // 등록 시작 시 플래그 설정
      isRegistering.current = true;

      // 로딩 상태 활성화
      setIsLoading(true);

      // 기프티콘 정보 구성
      const gifticonData = {
        gifticonBarcodeNumber: barcode, // 항상 현재 사용자가 입력한 값 사용
        brandId: selectedBrand.brandId, // 선택한 브랜드 ID 사용
        gifticonName: productName,
        gifticonExpiryDate: expiryDate.toISOString().split('T')[0], // YYYY-MM-DD 형식으로 변환
        gifticonType: gifticonType,
        gifticonAmount: gifticonType === 'AMOUNT' ? parseInt(amount.replace(/,/g, ''), 10) : null,
        shareBoxId: boxType === 'SHARE_BOX' ? shareBoxId : null,
        ocrTrainingDataId: ocrTrainingDataId, // 이미지 메타데이터 조회 시 받은 OCR 학습 데이터 ID
      };

      console.log('[기프티콘 등록] 요청 데이터:', gifticonData);

      // OCR 학습 데이터 ID 로깅
      if (ocrTrainingDataId) {
        console.log('[기프티콘 등록] OCR 학습 데이터 ID 포함:', ocrTrainingDataId);
      } else {
        console.log('[기프티콘 등록] OCR 학습 데이터 ID 없음');
      }

      // 이미지 파일 정보
      const originalImage = {
        uri: originalImageUri,
        type: 'image/jpeg',
        fileName: 'original.jpg',
      };

      // 썸네일 이미지 (현재는 동일하게 전송, 실제로는 리사이징 필요)
      const thumbnailImage = {
        uri: currentImageUri,
        type: 'image/jpeg',
        fileName: 'thumbnail.jpg',
      };

      // 바코드 이미지 (바코드 인식 성공했을 경우에만)
      const barcodeImage = barcodeImageUri
        ? {
            uri: barcodeImageUri,
            type: 'image/jpeg',
            fileName: 'barcode.jpg',
          }
        : null;

      // API 호출
      const response = await gifticonService.registerGifticon(
        gifticonData,
        originalImage,
        thumbnailImage,
        barcodeImage
      );

      console.log('기프티콘 등록 성공:', response);

      // 성공 메시지 표시
      Alert.alert('성공', '기프티콘이 성공적으로 등록되었습니다.', [
        {
          text: '확인',
          onPress: () => {
            // ✅ 등록 성공 시에만 상태 초기화
            const resetRegisterForm = useGifticonStore.getState().resetRegisterForm;
            resetRegisterForm();

            // 기프티콘 타입에 따라 다른 상세 화면으로 이동
            const targetScreen =
              gifticonType === 'PRODUCT' ? 'DetailProductScreen' : 'DetailAmountScreen';

            // 탭 네비게이션을 먼저 설정하고 그 안에 있는 스택 네비게이션을 설정
            navigation.reset({
              index: 0,
              routes: [
                {
                  name: 'Main',
                  params: {
                    screen: 'TabGifticonManage',
                    params: {
                      screen: targetScreen,
                      params: {
                        gifticonId: response.gifticonId,
                        scope: boxType === 'SHARE_BOX' ? 'SHARE_BOX' : 'MY_BOX',
                        shareBoxId: boxType === 'SHARE_BOX' ? shareBoxId : null,
                      },
                    },
                  },
                },
              ],
            });
          },
        },
      ]);
    } catch (error) {
      console.error('기프티콘 등록 실패:', error);

      // 등록 실패 시 플래그 해제
      isRegistering.current = false;

      // 에러 코드에 따라 적절한 메시지 표시
      let errorMessage = '기프티콘 등록 중 오류가 발생했습니다.';

      if (error.response && error.response.data) {
        const { errorCode, message } = error.response.data;

        if (errorCode === 'GIFTICON_006') {
          errorMessage = '금액형 기프티콘은 금액을 입력해야 합니다.';
        } else if (errorCode === 'GIFTICON_007') {
          errorMessage = '이미 등록된 바코드 번호입니다.';

          // ✅ 바코드 중복 에러 발생 시 기존 등록 폼 상태 유지 명시
          const updateRegisterFormField = useGifticonStore.getState().updateRegisterFormField;
          updateRegisterFormField('initialized', true);
        } else if (errorCode === 'FILE_001' || errorCode === 'FILE_002') {
          errorMessage = '파일 업로드 중 문제가 발생했습니다.';
        } else if (message) {
          errorMessage = message;
        }
      }

      // ✅ 등록 실패 시에는 상태를 초기화하지 않고 에러 메시지만 표시
      Alert.alert('오류', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // 날짜를 YYYY.MM.DD 형식으로 포맷 - expiryDate가 없을 때 dateInputText 반환
  const formatDate = date => {
    if (!date) return dateInputText;

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}.${month}.${day}`;
  };

  // 이미지 편집기 실행 함수
  const showImageEditor = async imageUri => {
    try {
      if (!imageUri) {
        console.warn('이미지 URI가 없습니다');
        return;
      }

      if (processingRef.current) {
        console.warn('이미지 처리 중입니다');
        return;
      }

      processingRef.current = true;
      console.log('이미지 편집 시작:', imageUri);

      // 원본 이미지가 있으면 원본을 사용하여 매번 새롭게 편집
      const sourceUri = originalImageUri || imageUri;

      // 크롭 설정 객체 생성
      const cropperOptions = {
        path: sourceUri,
        width: 300,
        height: 300,
        cropperToolbarTitle: '이미지 편집',
        cropperToolbarColor: '#000000',
        cropperStatusBarColor: '#000000',
        cropperActiveWidgetColor: '#56AEE9',
        cropperToolbarWidgetColor: '#FFFFFF',
        loadingLabelText: '처리 중...',
        mediaType: 'photo',
        cropperChooseText: '적용',
        cropperCancelText: '취소',
        // 자유롭게 비율 조정 가능
        freeStyleCropEnabled: true,
        // 회전 활성화
        enableRotationGesture: true,
      };

      // 이전에 저장된 크롭 데이터가 있으면 초기 크롭 영역 설정
      if (cropData) {
        console.log('저장된 크롭 데이터 적용:', cropData);
        // cropData 속성을 cropperOptions에 추가
        Object.assign(cropperOptions, {
          cropperInitialCropBoxX: cropData.x,
          cropperInitialCropBoxY: cropData.y,
          cropperInitialCropBoxWidth: cropData.width,
          cropperInitialCropBoxHeight: cropData.height,
          // 회전 각도가 있으면 적용
          cropperRotation: cropData.rotation || 0,
        });
      }

      // ImagePicker 라이브러리의 openCropper 사용
      ImagePicker.openCropper(cropperOptions)
        .then(image => {
          console.log('크롭 결과:', image);

          // 편집된 이미지 URI 저장
          setCurrentImageUri(image.path);

          // 크롭 영역 정보 추출 및 저장
          const newCropData = {
            x: image.cropRect?.x || 0,
            y: image.cropRect?.y || 0,
            width: image.cropRect?.width || image.width,
            height: image.cropRect?.height || image.height,
            rotation: image.cropRect?.rotation || 0,
          };

          console.log('새 크롭 데이터 저장:', newCropData);

          // Zustand 스토어에 크롭 데이터 저장
          updateRegisterFormCropData(newCropData);

          // 이미지 URI와 크롭 데이터를 함께 저장 (옵션)
          updateRegisterFormImage(image.path, originalImageUri, newCropData);

          processingRef.current = false;
        })
        .catch(error => {
          processingRef.current = false;

          // 사용자가 취소한 경우는 무시
          if (error.code !== 'E_PICKER_CANCELLED') {
            console.error('크롭 오류:', error);
            Alert.alert('오류', '이미지 편집 중 문제가 발생했습니다.');
          }
        });
    } catch (error) {
      console.error('이미지 편집 오류:', error);
      processingRef.current = false;
      Alert.alert('오류', '이미지 편집 중 문제가 발생했습니다. 다시 시도해주세요.');
    }
  };

  // 브랜드 검색 함수
  const searchBrands = useCallback(
    async searchText => {
      try {
        if (!searchText || searchText.trim().length === 0) {
          setBrandList([]);
          setShowBrandList(false);
          return;
        }

        // 검색 로딩 표시 (매우 짧은 시간 동안)
        setBrandSearchLoading(true);

        const keyword = searchText.trim();

        // API 호출
        const results = await brandService.searchBrands(keyword);

        // 결과 설정 - 렌더링 최적화를 위해 이전 상태와 비교 후 변경
        if (JSON.stringify(results) !== JSON.stringify(brandList)) {
          setBrandList(results || []);
        }
        setShowBrandList(true); // 결과가 없어도 메시지 표시를 위해 true로 설정

        console.log('브랜드 검색 결과:', results);
      } catch (error) {
        console.error('브랜드 검색 오류:', error);
        // 오류 처리
        setBrandList([]);
        setShowBrandList(true); // 오류 메시지 표시를 위해 true로 설정
      } finally {
        setBrandSearchLoading(false);
      }
    },
    [brandList]
  );

  // 브랜드 검색 로딩 상태
  const [brandSearchLoading, setBrandSearchLoading] = useState(false);

  // 브랜드 검색어 변경 핸들러 최적화
  const handleBrandSearchChange = useCallback(
    text => {
      setBrandSearchText(text);

      // 사용자가 직접 입력하는 경우 브랜드 선택 상태 초기화
      if (selectedBrand && selectedBrand.brandName !== text) {
        setSelectedBrand(null);
      }

      // 디바운싱 최적화
      if (brandSearchDebounceTimeout.current) {
        clearTimeout(brandSearchDebounceTimeout.current);
      }

      // 빈 검색어인 경우 목록 숨김
      if (!text.trim()) {
        setShowBrandList(false);
        setBrandList([]);
        return;
      }

      // 디바운스 시간 조정 - 더 빠른 응답을 위해 시간 줄임
      brandSearchDebounceTimeout.current = setTimeout(() => {
        searchBrands(text);
      }, 200);
    },
    [searchBrands, selectedBrand]
  );

  // 브랜드 선택 핸들러
  const handleSelectBrand = useCallback(item => {
    console.log('브랜드 선택:', item);
    setSelectedBrand(item);
    setBrandSearchText(item.brandName);

    // ✅ 스토어에 브랜드 정보 저장
    const updateRegisterFormField = useGifticonStore.getState().updateRegisterFormField;
    updateRegisterFormField('selectedBrand', item);
    updateRegisterFormField('brandSearchText', item.brandName);

    // 즉시 목록 닫기
    setShowBrandList(false);
  }, []);

  // 화면 터치 시 브랜드 목록 닫기
  const handleScreenPress = useCallback(() => {
    if (showBrandList) {
      setShowBrandList(false);
    }
    // 키보드는 유지 (기존 코드는 여기서 키보드를 닫았을 수 있음)
  }, [showBrandList]);

  // 컴포넌트 언마운트 시 메모리 정리
  useEffect(() => {
    return () => {
      // 타이머 정리
      if (brandSearchDebounceTimeout.current) {
        clearTimeout(brandSearchDebounceTimeout.current);
      }

      // 이미지 캐시 정리 로직 (옵션)
    };
  }, []);

  // 화면을 떠날 때 상태 초기화 처리
  useEffect(() => {
    // 등록 화면에서 다른 화면으로 이동할 때 상태 초기화
    const unsubscribe = navigation.addListener('blur', () => {
      // 등록 중인 경우에는 blur 이벤트에서 상태 초기화하지 않음
      if (!isRegistering.current) {
        console.log('[기프티콘 등록] 화면을 떠나 상태 초기화');
        const resetRegisterForm = useGifticonStore.getState().resetRegisterForm;
        resetRegisterForm();
      }
    });

    return unsubscribe;
  }, [navigation]);

  // 쉐어박스 목록 불러오기
  const loadShareBoxes = async () => {
    try {
      setIsLoadingShareBoxes(true);
      const res = await fetchShareBoxes({ size: 20 });
      setShareBoxes(res.shareBoxes || []);
    } catch (e) {
      console.error('쉐어박스 목록 불러오기 실패:', e);
      Alert.alert('에러', '쉐어박스 목록을 불러오지 못했습니다.');
    } finally {
      setIsLoadingShareBoxes(false);
    }
  };

  // 컴포넌트 마운트 시 쉐어박스 목록 불러오기
  useEffect(() => {
    loadShareBoxes();
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />

      {/* OCR 로딩 모달 - 특별한 애니메이션과 함께 표시 */}
      <LoadingOcrModal visible={isOcrLoading} message="기프티콘 정보를 분석하고 있습니다..." />

      {/* 안전 영역 고려한 상단 여백 */}
      <View style={{ height: insets.top, backgroundColor: theme.colors.background }} />

      {/* 커스텀 헤더 */}
      <View style={[styles.header, { backgroundColor: theme.colors.background }]}>
        <Button
          variant="ghost"
          onPress={handleGoBack}
          style={styles.backButton}
          leftIcon={<Icon name="arrow-back-ios" size={22} color={theme.colors.black} />}
        />
        <Text variant="h3" weight="bold" style={styles.headerTitle}>
          기프티콘 등록
        </Text>
        <View style={styles.rightPlaceholder} />
      </View>

      <TouchableOpacity activeOpacity={1} style={styles.content} onPress={handleScreenPress}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.contentContainer}
          keyboardShouldPersistTaps="always"
          removeClippedSubviews={false}
          maxToRenderPerBatch={5}
          windowSize={10}
          scrollEventThrottle={16}
          keyboardDismissMode="none"
        >
          {/* 이미지 선택 영역 */}
          <View style={styles.imageContainerWrapper}>
            <TouchableOpacity style={styles.imageContainer} onPress={handleImageContainerPress}>
              {currentImageUri ? (
                <Image
                  source={imageSource(currentImageUri)}
                  style={styles.image}
                  resizeMode="cover"
                  key={`image-${Date.now()}`} // 강제 리렌더링을 위한 키 추가
                />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <RNEIcon name="image" type="material" size={60} color="#CCCCCC" />
                  <Text variant="body2" color="#666666" style={styles.placeholderText}>
                    이미지를 등록해주세요
                  </Text>
                </View>
              )}
            </TouchableOpacity>

            <Button
              title={currentImageUri ? '이미지 편집하기' : '이미지 등록하기'}
              variant="outline"
              style={styles.imageButton}
              onPress={() => {
                if (currentImageUri) {
                  showImageEditor(currentImageUri);
                } else {
                  setImageOptionVisible(true);
                }
              }}
            />
          </View>

          {/* 기프티콘 타입 및 박스 정보 */}
          <View style={styles.infoSection}>
            <TouchableOpacity
              style={[styles.infoRow, isTypeLocked && styles.disabledRow]}
              onPress={() => {
                if (!isTypeLocked) {
                  showBoxModal();
                } else {
                  Alert.alert('알림', '기프티콘 유형은 최초 등록 후 변경할 수 없습니다.');
                }
              }}
            >
              <Text variant="body1" weight="semiBold" style={styles.infoLabel}>
                기프티콘 타입
              </Text>
              {isTypeLocked ? (
                <View style={styles.typeChip}>
                  <Text variant="body2" weight="regular" color="white">
                    {gifticonType === 'PRODUCT' ? '상품형' : '금액형'}
                  </Text>
                </View>
              ) : (
                <View style={styles.boxSelector}>
                  <Text variant="body2" style={[styles.boxText, { color: '#999' }]}>
                    선택해주세요
                  </Text>
                  <Icon name="chevron-right" size={20} color={theme.colors.gray400} />
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.infoRow} onPress={showBoxModal}>
              <Text variant="body1" weight="semiBold" style={styles.infoLabel}>
                등록 위치
              </Text>
              {isTypeLocked ? (
                <View style={styles.boxSelector}>
                  <Text variant="body2" style={styles.boxText}>
                    {boxType === 'MY_BOX' ? '마이박스' : getShareBoxName(shareBoxId)}
                  </Text>
                  <Icon name="chevron-right" size={20} color={theme.colors.gray400} />
                </View>
              ) : (
                <View style={styles.boxSelector}>
                  <Text variant="body2" style={[styles.boxText, { color: '#999' }]}>
                    선택해주세요
                  </Text>
                  <Icon name="chevron-right" size={20} color={theme.colors.gray400} />
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* 입력 폼 - 타입 및 박스가 선택된 경우에만 활성화 */}
          {isTypeLocked ? (
            <View style={styles.formContainer}>
              <Text variant="h4" weight="bold" style={styles.formSectionTitle}>
                바코드 번호 입력
              </Text>
              <InputLine
                value={barcode}
                onChangeText={text => {
                  setBarcode(text);
                  setBarcodeNumber(text);
                  // Zustand 스토어에 바코드 정보 저장 - 바코드 번호가 변경되어도 스토어에 반영
                  setCurrentBarcodeInfo(text, barcodeFormat, null, barcodeImageUri);

                  // ✅ 바코드 번호만 업데이트하고 다른 상태는 유지
                  const updateRegisterFormField =
                    useGifticonStore.getState().updateRegisterFormField;
                  updateRegisterFormField('barcodeNumber', text);
                }}
                placeholder="바코드 번호를 입력해주세요."
                keyboardType="numeric"
                containerStyle={styles.inputContainer}
                editable={true}
                autoCorrect={false}
                textContentType="none"
                returnKeyType="done"
                onSubmitEditing={() => {
                  Keyboard.dismiss();
                }}
                blurOnSubmit={true}
                rightIcon={
                  <TouchableOpacity onPress={showBarcodeImage}>
                    <Icon name="image" size={22} color="#333333" />
                  </TouchableOpacity>
                }
              />

              <Text variant="h4" weight="bold" style={styles.formSectionTitle}>
                기프티콘 정보 입력
              </Text>
              <View ref={brandInputContainerRef} style={styles.inputWrapper}>
                <InputLine
                  value={brandSearchText}
                  onChangeText={handleBrandSearchChange}
                  placeholder="브랜드명을 입력해주세요."
                  containerStyle={styles.inputContainer}
                  rightIcon={
                    selectedBrand ? (
                      <View style={styles.selectedBrandIndicator}>
                        <Icon name="check-circle" size={20} color="#2ECC71" />
                      </View>
                    ) : null
                  }
                  onFocus={() => {
                    // 검색어가 있을 경우 브랜드 검색 수행
                    if (brandSearchText.trim().length > 0) {
                      searchBrands(brandSearchText);
                    }
                  }}
                />

                {/* 브랜드 자동완성 목록 */}
                {showBrandList && (
                  <View style={styles.brandListContainer}>
                    {brandSearchLoading ? (
                      <View style={styles.brandListLoading}>
                        <ActivityIndicator size="small" color={theme.colors.primary} />
                        <Text style={styles.brandListLoadingText}>검색 중...</Text>
                      </View>
                    ) : brandList.length > 0 ? (
                      <FlatList
                        data={brandList.slice(0, 5)} // 최대 5개로 제한하여 성능 개선
                        keyExtractor={item => item.brandId.toString()}
                        renderItem={({ item }) => (
                          <TouchableOpacity
                            style={styles.brandItem}
                            onPress={() => handleSelectBrand(item)}
                            activeOpacity={0.7}
                          >
                            <Text style={styles.brandItemText}>{item.brandName}</Text>
                          </TouchableOpacity>
                        )}
                        style={styles.brandList}
                        keyboardShouldPersistTaps="handled"
                        scrollEnabled={false}
                      />
                    ) : (
                      <View style={styles.noBrandResults}>
                        <Text style={styles.noBrandResultsText}>
                          &quot;{brandSearchText}&quot;에 대한 검색 결과가 없습니다.
                        </Text>
                      </View>
                    )}
                  </View>
                )}
              </View>

              <InputLine
                value={productName}
                onChangeText={text => {
                  setProductName(text);

                  // ✅ 스토어에 상품명 저장
                  const updateRegisterFormField =
                    useGifticonStore.getState().updateRegisterFormField;
                  updateRegisterFormField('productName', text);
                }}
                placeholder="상품명을 입력해주세요."
                containerStyle={styles.inputContainer}
                rightIcon={
                  productName && productName.trim() ? (
                    <View style={styles.selectedBrandIndicator}>
                      <Icon name="check-circle" size={20} color="#2ECC71" />
                    </View>
                  ) : null
                }
              />

              {/* 유효기간 입력 필드 - 날짜 직접 입력 가능 */}
              <View style={styles.dateInputContainer}>
                <InputLine
                  value={dateInputText || formatDate(expiryDate)}
                  onChangeText={handleDateTextChange}
                  placeholder="유효기간을 입력해주세요. (YYYY.MM.DD)"
                  containerStyle={styles.inputContainer}
                  rightIcon={
                    <TouchableOpacity onPress={showDatePickerHandler}>
                      <Icon name="calendar-today" size={22} color="#333333" />
                    </TouchableOpacity>
                  }
                  keyboardType="numeric"
                />
              </View>

              {showDatePicker && (
                <DateTimePicker
                  value={expiryDate || new Date()}
                  mode="date"
                  display="default"
                  onChange={handleDateChange}
                />
              )}

              {/* 금액형인 경우 금액 입력 필드 추가 */}
              {gifticonType === 'AMOUNT' && (
                <>
                  <Text variant="h4" weight="bold" style={styles.formSectionTitle}>
                    금액 정보 입력
                  </Text>
                  <InputLine
                    value={amount}
                    onChangeText={text => {
                      handleAmountChange(text);

                      // ✅ 스토어에 금액 저장
                      const updateRegisterFormField =
                        useGifticonStore.getState().updateRegisterFormField;
                      updateRegisterFormField('amount', text);
                    }}
                    placeholder="금액을 입력해주세요."
                    keyboardType="numeric"
                    containerStyle={styles.inputContainer}
                    inputStyle={styles.amountInput}
                    rightIcon={
                      <Text variant="body1" style={styles.amountUnit}>
                        원
                      </Text>
                    }
                  />
                </>
              )}
            </View>
          ) : (
            <View style={styles.infoGuideContainer}>
              <RNEIcon name="info-outline" type="material" size={24} color="#4A90E2" />
              <Text style={styles.infoGuideText}>
                기프티콘 유형과 등록 위치를 선택하여 등록을 계속 진행해주세요.
              </Text>
            </View>
          )}
        </ScrollView>
      </TouchableOpacity>

      {/* 버튼 영역 */}
      <View style={styles.footer}>
        <Button
          title="등록하기"
          onPress={handleRegister}
          size="lg"
          style={styles.button}
          disabled={!isTypeLocked || isLoading}
        />
      </View>

      {/* 로딩 인디케이터 - 일반 처리용 */}
      {isLoading && !isOcrLoading && (
        <View style={styles.loadingContainer}>
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text variant="body1" style={styles.loadingText}>
              처리 중...
            </Text>
          </View>
        </View>
      )}

      {/* 이미지 옵션 모달 */}
      <Modal
        visible={isImageOptionVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setImageOptionVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setImageOptionVisible(false)}
        >
          <View style={styles.modalContent}>
            <Text variant="h4" weight="bold" style={styles.modalTitle}>
              이미지 선택
            </Text>
            <TouchableOpacity
              style={styles.modalOption}
              onPress={() => {
                setImageOptionVisible(false);
                handlePickFromGallery();
              }}
            >
              <Icon name="photo-library" size={24} color="#333333" style={styles.modalOptionIcon} />
              <Text variant="body1">갤러리에서 선택</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalOption}
              onPress={() => {
                setImageOptionVisible(false);
                handleTakePhoto();
              }}
            >
              <Icon name="camera-alt" size={24} color="#333333" style={styles.modalOptionIcon} />
              <Text variant="body1">카메라로 촬영</Text>
            </TouchableOpacity>
            <Button
              title="취소"
              variant="outline"
              onPress={() => setImageOptionVisible(false)}
              style={styles.modalCancelButton}
            />
          </View>
        </TouchableOpacity>
      </Modal>

      {/* 박스 선택 모달 */}
      <Modal
        visible={isBoxModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => {
          // 이미 선택되어 있는 경우에만 모달 닫기 가능
          if (isTypeLocked) {
            setBoxModalVisible(false);
          } else {
            Alert.alert('알림', '기프티콘 타입과 등록 위치를 선택해주세요.');
          }
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, styles.boxModalContent]}>
            <Text variant="h4" weight="bold" style={styles.modalTitle}>
              기프티콘 정보 선택
            </Text>

            {!isTypeLocked && (
              <>
                <Text variant="h5" weight="bold" style={styles.modalSubtitle}>
                  기프티콘 타입
                </Text>

                {/* 상품형/금액형 선택 버튼 */}
                <View style={styles.typeButtonsContainer}>
                  <TouchableOpacity
                    style={[
                      styles.typeButton,
                      gifticonType === 'PRODUCT' && styles.typeButtonSelected,
                    ]}
                    onPress={() => setGifticonType('PRODUCT')}
                  >
                    <Text
                      style={[
                        styles.typeButtonText,
                        gifticonType === 'PRODUCT' && styles.typeButtonTextSelected,
                      ]}
                    >
                      상품형
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.typeButton,
                      gifticonType === 'AMOUNT' && styles.typeButtonSelected,
                    ]}
                    onPress={() => setGifticonType('AMOUNT')}
                  >
                    <Text
                      style={[
                        styles.typeButtonText,
                        gifticonType === 'AMOUNT' && styles.typeButtonTextSelected,
                      ]}
                    >
                      금액형
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            )}

            <Text variant="h4" weight="bold" style={[styles.modalSubtitle, styles.sectionTitle]}>
              등록 위치
            </Text>

            <Text variant="h5" weight="bold" style={styles.modalSubtitle}>
              기본
            </Text>

            {/* 마이박스 선택 */}
            <View style={styles.boxSection}>
              <View style={styles.boxRow}>
                <TouchableOpacity
                  style={[
                    styles.checkboxContainer,
                    boxType === 'MY_BOX' && styles.checkboxContainerSelected,
                  ]}
                  onPress={() => {
                    setBoxType('MY_BOX');
                    setShareBoxId(null);
                  }}
                >
                  <View style={styles.checkbox}>
                    {boxType === 'MY_BOX' && (
                      <Icon name="check" size={16} color={theme.colors.primary} />
                    )}
                  </View>
                  <Text style={styles.checkboxLabel}>마이박스</Text>
                </TouchableOpacity>
              </View>
            </View>

            <Text variant="h5" weight="bold" style={[styles.modalSubtitle, styles.sectionTitle]}>
              쉐어 박스
            </Text>

            {/* 쉐어박스 선택 */}
            <View style={styles.boxSection}>
              {isLoadingShareBoxes ? (
                <View style={styles.loadingShareBoxContainer}>
                  <ActivityIndicator size="small" color={theme.colors.primary} />
                  <Text style={styles.loadingShareBoxText}>쉐어박스 목록을 불러오는 중...</Text>
                </View>
              ) : shareBoxes.length > 0 ? (
                <ScrollView style={styles.shareBoxScrollView} showsVerticalScrollIndicator={false}>
                  {shareBoxes.map(box => (
                    <View key={box.shareBoxId} style={styles.boxRow}>
                      <TouchableOpacity
                        style={[
                          styles.checkboxContainer,
                          boxType === 'SHARE_BOX' &&
                            shareBoxId === box.shareBoxId &&
                            styles.checkboxContainerSelected,
                        ]}
                        onPress={() => {
                          setBoxType('SHARE_BOX');
                          setShareBoxId(box.shareBoxId);
                        }}
                      >
                        <View style={styles.checkbox}>
                          {boxType === 'SHARE_BOX' && shareBoxId === box.shareBoxId && (
                            <Icon name="check" size={16} color={theme.colors.primary} />
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
                          <Text
                            style={[styles.ownerText, box.isOwner && styles.ownerTextHighlight]}
                          >
                            {box.ownerName || box.shareBoxUserName || '나'}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    </View>
                  ))}
                </ScrollView>
              ) : (
                <View style={styles.emptyShareBoxContainer}>
                  <Text style={styles.emptyShareBoxText}>참여 중인 쉐어박스가 없습니다.</Text>
                </View>
              )}
            </View>

            <View style={styles.boxButtonContainer}>
              <Button
                title="확인"
                variant="primary"
                onPress={handleBoxSelected}
                style={styles.boxModalButton}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* 원본 이미지 팝업 모달 */}
      <Modal
        visible={isOriginalImageVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setOriginalImageVisible(false)}
      >
        <TouchableOpacity
          style={styles.originalImageModalOverlay}
          activeOpacity={1}
          onPress={() => setOriginalImageVisible(false)}
        >
          <View style={styles.originalImageModalContent}>
            <Text style={styles.originalImageGuideText}>업로드된 원본 이미지</Text>
            <Image
              source={imageSource(originalImageUri)}
              style={styles.originalImage}
              resizeMode="contain"
            />
          </View>
        </TouchableOpacity>
      </Modal>

      {/* 바코드 이미지 확인 모달 */}
      <Modal
        visible={isBarcodeImageModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setBarcodeImageModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.originalImageModalOverlay}
          activeOpacity={1}
          onPress={() => setBarcodeImageModalVisible(false)}
        >
          <View
            style={styles.newBarcodeModalContent}
            onStartShouldSetResponder={() => true}
            onResponderRelease={() => setBarcodeImageModalVisible(false)}
          >
            <Text weight="bold" style={styles.newBarcodeTitle}>
              바코드 정보
            </Text>

            {/* 바코드 이미지 */}
            {barcodeImageUri ? (
              <Image
                source={imageSource(barcodeImageUri)}
                style={styles.newBarcodeImage}
                resizeMode="contain"
              />
            ) : (
              <View style={styles.noNewBarcodeImage}>
                <Icon name="qr-code" size={50} color="#CCCCCC" />
              </View>
            )}

            {/* 바코드 번호 - 수정 가능하도록 변경 */}
            <TextInput
              style={styles.newBarcodeNumberInput}
              value={barcode || barcodeNumber}
              onChangeText={text => {
                setBarcode(text);
                setBarcodeNumber(text);
                setCurrentBarcodeInfo(text, barcodeFormat, null, barcodeImageUri);

                // ✅ 바코드 번호만 업데이트하고 다른 상태는 유지
                const updateRegisterFormField = useGifticonStore.getState().updateRegisterFormField;
                updateRegisterFormField('barcodeNumber', text);
              }}
              keyboardType="numeric"
              selectionColor="#A7DAF9"
              autoFocus={true}
              onBlur={null}
              blurOnSubmit={true}
              returnKeyType="done"
              onSubmitEditing={() => {
                Keyboard.dismiss();
              }}
            />

            {/* 바코드 복사 버튼 */}
            <TouchableOpacity
              style={styles.newBarcodeCopyButton}
              onPress={() => {
                Alert.alert(
                  '알림',
                  `바코드 번호 ${barcode || barcodeNumber}이(가) 복사되었습니다.`
                );
              }}
            >
              <Icon name="content-copy" size={20} color="white" />
              <Text style={styles.newBarcodeCopyText}>바코드 복사</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 18,
    paddingVertical: 20,
    justifyContent: 'space-between',
  },
  contentContainer: {
    paddingBottom: 20,
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
  backButton: {
    padding: 0,
    backgroundColor: 'transparent',
  },
  headerTitle: {
    textAlign: 'center',
    flex: 1,
  },
  rightPlaceholder: {
    width: 48,
  },
  imageContainerWrapper: {
    alignItems: 'center',
    marginVertical: 15,
  },
  imageContainer: {
    width: 150,
    height: 150,
    borderRadius: 10,
    backgroundColor: '#F9F9F9',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    // 렌더링 최적화
    backfaceVisibility: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    backfaceVisibility: 'hidden',
  },
  imagePlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    marginTop: 10,
  },
  imageButton: {
    marginTop: 10,
    width: 180,
  },
  infoSection: {
    borderRadius: 10,
    padding: 5,
    marginBottom: 5,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 50,
    alignItems: 'center',
    paddingVertical: 8,
  },
  infoLabel: {
    fontSize: 15,
  },
  typeChip: {
    backgroundColor: '#718096',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 5,
  },
  boxSelector: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  boxText: {
    marginRight: 4,
    color: '#4A5568',
  },
  formContainer: {
    paddingHorizontal: 50,
    marginTop: 2,
  },
  formSectionTitle: {
    marginTop: 10,
    marginBottom: 0,
    paddingHorizontal: 6,
  },
  inputContainer: {
    marginBottom: 0,
  },
  button: {
    width: '100%',
    height: 56,
    borderRadius: 8,
    marginBottom: 0,
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
    maxHeight: '90%',
  },
  modalTitle: {
    textAlign: 'center',
    marginBottom: 20,
  },
  modalSubtitle: {
    marginBottom: 12,
  },
  sectionTitle: {
    marginTop: 15,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  modalOptionIcon: {
    marginRight: 16,
  },
  modalCancelButton: {
    marginTop: 16,
  },
  boxSection: {
    marginBottom: 10,
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
  boxModalButton: {
    flex: 1,
    marginHorizontal: 5,
    height: 50,
  },
  infoGuideContainer: {
    backgroundColor: '#F0F7FF',
    borderRadius: 10,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  infoGuideText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    color: '#4A5568',
    lineHeight: 20,
  },
  typeButtonsContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    overflow: 'hidden',
  },
  typeButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    borderRightWidth: 0.5,
    borderLeftWidth: 0.5,
    borderColor: '#E0E0E0',
  },
  typeButtonSelected: {
    backgroundColor: '#4A90E2',
  },
  typeButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666666',
  },
  typeButtonTextSelected: {
    color: 'white',
  },
  disabledRow: {
    opacity: 0.8,
  },
  originalImageModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  originalImageModalContent: {
    width: '90%',
    height: '80%',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 16,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    padding: 10,
  },
  originalImageGuideText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
    position: 'absolute',
    top: 20,
    textAlign: 'center',
    width: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingVertical: 8,
    zIndex: 10,
  },
  originalImage: {
    width: '100%',
    height: '100%',
  },
  footer: {
    padding: 18,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingBox: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
  },
  newBarcodeModalContent: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 15,
    paddingBottom: 30,
  },
  newBarcodeTitle: {
    color: '#333',
    fontSize: 20,
    marginTop: 10,
    marginBottom: 10,
  },
  newBarcodeImage: {
    width: '100%',
    height: 100,
    marginBottom: 10,
    resizeMode: 'contain',
  },
  noNewBarcodeImage: {
    width: '100%',
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  newBarcodeCopyButton: {
    flexDirection: 'row',
    backgroundColor: '#56AEE9',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  newBarcodeCopyText: {
    color: 'white',
    fontWeight: '500',
    fontSize: 16,
    marginLeft: 10,
  },
  inputWrapper: {
    position: 'relative',
    zIndex: 10,
    marginBottom: 0,
  },
  brandListContainer: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 8,
    maxHeight: 200,
    overflow: 'hidden',
    position: 'absolute',
    width: '100%',
    zIndex: 9999,
    top: '50%',
  },
  brandList: {
    width: '100%',
    // 스크롤 없이 고정 높이 사용
  },
  brandItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
  },
  brandItemText: {
    fontSize: 14,
    color: '#333',
  },
  noBrandResults: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noBrandResultsText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  brandListLoading: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandListLoadingText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#666',
  },
  selectedBrandIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  amountInput: {
    textAlign: 'right',
    paddingRight: 8,
    fontSize: 16,
  },
  amountUnit: {
    fontSize: 16,
    paddingTop: 0,
    color: '#333333',
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
  },
  loadingShareBoxContainer: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  loadingShareBoxText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#666',
  },
  emptyShareBoxContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E6E6E6',
    borderRadius: 8,
    marginBottom: 10,
  },
  emptyShareBoxText: {
    color: '#666',
    fontSize: 14,
  },
  shareBoxScrollView: {
    maxHeight: 250, // 스크롤 영역 최대 높이 설정
  },
  newBarcodeNumberInput: {
    color: '#333',
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 25,
    borderWidth: 2,
    borderColor: '#4A90E2',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    width: '90%',
  },
  dateInputContainer: {
    marginBottom: 10,
  },
});

export default RegisterDetailScreen;
