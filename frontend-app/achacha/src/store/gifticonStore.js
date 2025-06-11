import { create } from 'zustand';

/**
 * 기프티콘 관련 상태를 관리하는 Zustand 스토어
 */
const useGifticonStore = create(set => ({
  // 이미지 관련 상태
  gifticonImages: {}, // { gifticonId: { original: uri, edited: uri } }

  // 현재 작업 중인 기프티콘 이미지 상태
  currentGifticonId: null,
  currentOriginalImageUri: null,
  currentEditedImageUri: null,

  // 바코드 관련 정보 추가
  barcodeInfo: {}, // { gifticonId: { value: string, format: string, boundingBox: object, imageUri: string } }
  currentBarcodeInfo: null,

  // 이미지 편집 상태 추가
  cropData: null, // 크롭 영역 정보 (x, y, width, height, cropperRotation 등)

  // 이미지 설정 (편집 전/후 모두 저장)
  setGifticonImages: (gifticonId, originalUri, editedUri) =>
    set(state => ({
      gifticonImages: {
        ...state.gifticonImages,
        [gifticonId]: {
          original: originalUri,
          edited: editedUri || originalUri, // 편집된 이미지가 없으면 원본 사용
        },
      },
    })),

  // 현재 작업 중인 기프티콘 이미지 설정
  setCurrentGifticon: (gifticonId, originalUri, editedUri) =>
    set({
      currentGifticonId: gifticonId,
      currentOriginalImageUri: originalUri,
      currentEditedImageUri: editedUri || originalUri,
    }),

  // 편집된 이미지만 업데이트
  updateEditedImage: (gifticonId, editedUri) =>
    set(state => {
      // 이미 저장된 기프티콘 이미지가 있는 경우
      if (state.gifticonImages[gifticonId]) {
        return {
          gifticonImages: {
            ...state.gifticonImages,
            [gifticonId]: {
              ...state.gifticonImages[gifticonId],
              edited: editedUri,
            },
          },
          // 현재 작업 중인 기프티콘이면 현재 상태도 업데이트
          ...(state.currentGifticonId === gifticonId ? { currentEditedImageUri: editedUri } : {}),
        };
      }

      // 저장된 기프티콘 이미지가 없는 경우 (예상치 못한 상황)
      console.warn(`ID ${gifticonId}에 대한 기프티콘 이미지 정보가 없습니다.`);
      return state;
    }),

  // 현재 작업 중인 편집된 이미지 업데이트
  updateCurrentEditedImage: editedUri =>
    set(state => ({
      currentEditedImageUri: editedUri,
      // 현재 작업 중인 기프티콘 ID가 있으면 저장된 이미지도 업데이트
      gifticonImages: state.currentGifticonId
        ? {
            ...state.gifticonImages,
            [state.currentGifticonId]: {
              original: state.currentOriginalImageUri,
              edited: editedUri,
            },
          }
        : state.gifticonImages,
    })),

  // 크롭 데이터 설정
  setCropData: cropData =>
    set(state => ({
      cropData: cropData,
    })),

  // 크롭 데이터 초기화
  resetCropData: () =>
    set(state => ({
      cropData: null,
    })),

  // 바코드 정보 설정 추가
  setBarcodeInfo: (gifticonId, barcodeValue, barcodeFormat, boundingBox, barcodeImageUri) =>
    set(state => ({
      barcodeInfo: {
        ...state.barcodeInfo,
        [gifticonId]: {
          value: barcodeValue,
          format: barcodeFormat,
          boundingBox: boundingBox,
          imageUri: barcodeImageUri,
        },
      },
      // 현재 작업 중인 기프티콘이면 현재 바코드 정보도 업데이트
      ...(state.currentGifticonId === gifticonId
        ? {
            currentBarcodeInfo: {
              value: barcodeValue,
              format: barcodeFormat,
              boundingBox: boundingBox,
              imageUri: barcodeImageUri,
            },
          }
        : {}),
    })),

  // 현재 작업 중인 바코드 정보 설정
  setCurrentBarcodeInfo: (barcodeValue, barcodeFormat, barcodeBoundingBox, barcodeImageUri) =>
    set(state => ({
      ...state,
      currentBarcodeInfo: {
        value: barcodeValue,
        format: barcodeFormat,
        boundingBox: barcodeBoundingBox,
        imageUri: barcodeImageUri,
      },
    })),

  // 바코드 이미지만 업데이트
  updateBarcodeImage: (gifticonId, barcodeImageUri) =>
    set(state => {
      // 이미 저장된 바코드 정보가 있는 경우
      if (state.barcodeInfo[gifticonId]) {
        return {
          barcodeInfo: {
            ...state.barcodeInfo,
            [gifticonId]: {
              ...state.barcodeInfo[gifticonId],
              imageUri: barcodeImageUri,
            },
          },
          // 현재 작업 중인 기프티콘이면 현재 바코드 정보도 업데이트
          ...(state.currentGifticonId === gifticonId
            ? {
                currentBarcodeInfo: {
                  ...state.currentBarcodeInfo,
                  imageUri: barcodeImageUri,
                },
              }
            : {}),
        };
      }
      return state;
    }),

  // 바코드 값만 업데이트
  updateBarcodeValue: (gifticonId, barcodeValue) =>
    set(state => {
      // 이미 저장된 바코드 정보가 있는 경우
      if (state.barcodeInfo[gifticonId]) {
        return {
          barcodeInfo: {
            ...state.barcodeInfo,
            [gifticonId]: {
              ...state.barcodeInfo[gifticonId],
              value: barcodeValue,
            },
          },
          // 현재 작업 중인 기프티콘이면 현재 바코드 정보도 업데이트
          ...(state.currentGifticonId === gifticonId
            ? {
                currentBarcodeInfo: {
                  ...state.currentBarcodeInfo,
                  value: barcodeValue,
                },
              }
            : {}),
        };
      }
      return state;
    }),

  // 기프티콘 이미지 상태 초기화
  resetGifticonImages: () =>
    set({
      currentGifticonId: null,
      currentOriginalImageUri: null,
      currentEditedImageUri: null,
      currentBarcodeInfo: null,
      cropData: null, // 크롭 데이터도 함께 초기화
    }),

  // 기프티콘 등록 화면 관련 상태
  registerForm: {
    initialized: false, // 초기화 여부 플래그
    imageUri: null, // 선택된 이미지 URI
    originalImageUri: null, // 원본 이미지 URI
    cropData: null, // 크롭 영역 정보 추가
    brandSearchText: '', // 브랜드 검색 텍스트
    selectedBrand: null, // 선택된 브랜드
    productName: '', // 상품명
    expiryDate: null, // 유효기간
    dateInputText: '', // 유효기간 텍스트 입력
    amount: '', // 금액 (금액형일 경우)
    barcodeNumber: '', // 바코드 번호
    barcodeImageUri: null, // 바코드 이미지 URI
    barcodeFormat: null, // 바코드 포맷
    ocrTrainingDataId: null, // OCR 학습 데이터 ID
    boxType: 'MY_BOX', // 박스 타입 (MY_BOX 또는 SHARE_BOX)
    shareBoxId: null, // 쉐어박스 ID
    gifticonType: 'PRODUCT', // 기프티콘 타입 (PRODUCT 또는 AMOUNT)
  },

  // 기프티콘 등록 폼 초기화
  initRegisterForm: data =>
    set(state => ({
      registerForm: {
        ...state.registerForm,
        initialized: true,
        imageUri: data.imageUri || null,
        originalImageUri: data.originalImageUri || data.imageUri || null,
        cropData: data.cropData || null, // 크롭 데이터 초기화 추가
        brandSearchText: data.brandName || '',
        selectedBrand: data.selectedBrand || null,
        productName: data.gifticonName || '',
        expiryDate: data.gifticonExpiryDate ? new Date(data.gifticonExpiryDate) : null,
        dateInputText: data.gifticonExpiryDate
          ? formatDateForInput(new Date(data.gifticonExpiryDate))
          : '',
        amount: data.gifticonOriginalAmount
          ? formatAmount(data.gifticonOriginalAmount.toString())
          : '',
        barcodeNumber: data.gifticonBarcodeNumber || data.barcodeValue || '',
        barcodeImageUri: data.barcodeImageUri || null,
        barcodeFormat: data.barcodeFormat || null,
        ocrTrainingDataId: data.ocrTrainingDataId || null,
        boxType: data.boxType || 'MY_BOX',
        shareBoxId: data.shareBoxId || null,
        gifticonType: data.gifticonType || 'PRODUCT',
      },
    })),

  // 기프티콘 등록 폼 리셋
  resetRegisterForm: () =>
    set(state => ({
      registerForm: {
        initialized: false,
        imageUri: null,
        originalImageUri: null,
        cropData: null, // 크롭 데이터 초기화 추가
        brandSearchText: '',
        selectedBrand: null,
        productName: '',
        expiryDate: null,
        dateInputText: '',
        amount: '',
        barcodeNumber: '',
        barcodeImageUri: null,
        barcodeFormat: null,
        ocrTrainingDataId: null,
        boxType: 'MY_BOX',
        shareBoxId: null,
        gifticonType: 'PRODUCT',
      },
    })),

  // 개별 필드 업데이트 함수들
  updateRegisterFormField: (field, value) =>
    set(state => ({
      registerForm: {
        ...state.registerForm,
        [field]: value,
      },
    })),

  // 바코드 정보 업데이트
  updateRegisterFormBarcode: (barcodeNumber, barcodeFormat, barcodeImageUri) =>
    set(state => ({
      registerForm: {
        ...state.registerForm,
        barcodeNumber,
        barcodeFormat,
        barcodeImageUri,
      },
    })),

  // 이미지 업데이트
  updateRegisterFormImage: (imageUri, originalImageUri = null, cropData = null) =>
    set(state => ({
      registerForm: {
        ...state.registerForm,
        imageUri,
        originalImageUri: originalImageUri || imageUri,
        cropData: cropData || state.registerForm.cropData,
      },
    })),

  // 크롭 데이터만 업데이트
  updateRegisterFormCropData: cropData =>
    set(state => ({
      registerForm: {
        ...state.registerForm,
        cropData,
      },
    })),

  // 유효기간 업데이트 (날짜 객체와 텍스트 동시에)
  updateRegisterFormExpiryDate: date =>
    set(state => ({
      registerForm: {
        ...state.registerForm,
        expiryDate: date,
        dateInputText: date ? formatDateForInput(date) : '',
      },
    })),

  // 유효기간 텍스트만 업데이트
  updateRegisterFormExpiryDateText: text =>
    set(state => ({
      registerForm: {
        ...state.registerForm,
        dateInputText: text,
      },
    })),

  // 브랜드 선택
  selectBrand: brand =>
    set(state => ({
      registerForm: {
        ...state.registerForm,
        selectedBrand: brand,
        brandSearchText: brand ? brand.brandName : state.registerForm.brandSearchText,
      },
    })),
}));

// 날짜 포맷팅 헬퍼 함수
const formatDateForInput = date => {
  if (!date) return '';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}.${month}.${day}`;
};

// 금액 포맷팅 헬퍼 함수
const formatAmount = value => {
  // 숫자와 쉼표 이외의 문자 제거
  const numericValue = value.replace(/[^0-9]/g, '');
  // 쉼표 추가하여 반환
  return numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

export default useGifticonStore;
