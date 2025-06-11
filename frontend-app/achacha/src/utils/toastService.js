import Toast from 'react-native-toast-message';
import React from 'react';
import HeadupToast from '../components/ui/HeadupToast';
import NavigationService from '../navigation/NavigationService';
import notificationService from '../api/notificationService';

// 참조 타입 상수
const REFERENCE_TYPES = {
  GIFTICON: 'gifticon',
  SHAREBOX: 'sharebox',
};

/**
 * 커스텀 토스트 설정
 */
export const toastConfig = {
  // 성공 토스트
  success: props => <HeadupToast {...props} />,

  // 에러 토스트
  error: props => <HeadupToast {...props} />,

  // 정보 토스트
  info: props => <HeadupToast {...props} />,

  // 알림 토스트
  notificationToast: props => {
    const data = props.props || {};

    // 직접 알림 데이터와 네비게이션 객체를 분리하여 전달
    const notificationData = {
      notificationType: data.notificationType,
      referenceEntityType: data.referenceEntityType,
      referenceEntityId: data.referenceEntityId,
    };

    console.log('[토스트 컨피그] notificationToast 렌더링:', {
      propsAvailable: !!props,
      dataAvailable: !!data,
      notificationData: JSON.stringify(notificationData),
      hasNavigationConfig: !!data.navigationConfig,
      hasOnPress: !!data.onPress,
    });

    // HeadupToast에 전달할 props
    const propsWithHandler = {
      ...props,
      onPress: data.onPress, // 직접 onPress 핸들러를 상위 레벨로 이동
      props: {
        ...data,
        type: data.notificationType,
        notificationData: data.notificationData || notificationData,
        navigationConfig: data.navigationConfig,
      },
    };

    return <HeadupToast {...propsWithHandler} />;
  },
};

/**
 * 푸시 알림을 토스트 메시지로 표시
 * @param {Object} message - FCM 메시지 객체
 */
export const showNotificationToast = message => {
  const currentTime = new Date().toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  const { title, body } = message.notification || {};
  const data = message.data || {};

  // 알림 데이터 보강
  const referenceEntityId = data.referenceEntityId || data.id || data.gifticonId || data.shareBoxId;

  // FCM에서 데이터가 문자열로 전달될 수 있으므로 숫자형으로 변환 시도
  let parsedReferenceEntityId = referenceEntityId;
  try {
    // 숫자형으로 변환 시도
    const parsed = parseInt(referenceEntityId, 10);
    if (!isNaN(parsed)) {
      parsedReferenceEntityId = parsed;
    }
  } catch (e) {
    console.error('참조 ID 파싱 오류:', e);
  }

  // 최종 알림 데이터 구성
  const notificationData = {
    notificationType: data.notificationType || data.type,
    referenceEntityType: data.referenceEntityType || data.type,
    referenceEntityId: parsedReferenceEntityId,
  };

  console.log(`[${currentTime}] [토스트 서비스] 알림 토스트 데이터:`, {
    title,
    body,
    notificationData,
    originalData: data,
    parsedReferenceEntityId,
  });

  // 직접 처리할 onPress 핸들러 정의
  const handleToastPress = async () => {
    try {
      console.log(`[${currentTime}] [토스트 서비스] 토스트 클릭 처리 시작`);

      // 먼저 토스트 숨기기
      Toast.hide();

      // 필요한 데이터 확인
      if (!notificationData || !notificationData.referenceEntityId) {
        console.error(`[${currentTime}] [토스트 서비스] 알림 데이터 부족:`, notificationData);
        return;
      }

      const { notificationType, referenceEntityType, referenceEntityId } = notificationData;

      // 기프티콘 관련 알림 처리
      if (
        ['EXPIRY_DATE', 'USAGE_COMPLETE', 'RECEIVE_GIFTICON', 'LOCATION_BASED'].includes(
          notificationType
        ) &&
        referenceEntityType === REFERENCE_TYPES.GIFTICON
      ) {
        console.log(`[${currentTime}] [토스트 서비스] 기프티콘 알림 처리:`, referenceEntityId);

        // API 호출로 기프티콘 타입 확인
        const gifticonDetail = await notificationService.getGifticonDetail(referenceEntityId);

        // 기프티콘 타입에 따라 적절한 화면으로 이동
        if (gifticonDetail.gifticonType === 'AMOUNT') {
          NavigationService.navigate('DetailAmount', {
            gifticonId: referenceEntityId,
            scope: 'MY_BOX',
          });
        } else {
          NavigationService.navigate('DetailProduct', {
            gifticonId: referenceEntityId,
            scope: 'MY_BOX',
          });
        }
      }
      // 쉐어박스 관련 알림 처리
      else if (
        ['SHAREBOX_GIFTICON', 'SHAREBOX_USAGE_COMPLETE', 'SHAREBOX_MEMBER_JOIN'].includes(
          notificationType
        ) &&
        referenceEntityType === REFERENCE_TYPES.SHAREBOX
      ) {
        console.log(`[${currentTime}] [토스트 서비스] 쉐어박스 알림 처리 시작:`, {
          notificationType,
          referenceEntityType,
          referenceEntityId,
          referenceEntityIdType: typeof referenceEntityId,
        });

        // 100% 숫자로 변환되도록 보장
        let shareBoxId = referenceEntityId;
        if (typeof shareBoxId === 'string') {
          shareBoxId = parseInt(shareBoxId, 10);
        }

        console.log(`[${currentTime}] [토스트 서비스] 쉐어박스 네비게이션 시도:`, {
          shareBoxId,
          shareBoxIdType: typeof shareBoxId,
          initialTab: notificationType === 'SHAREBOX_USAGE_COMPLETE' ? 'used' : 'available',
        });

        // BoxList 화면으로 이동
        NavigationService.navigate('BoxList', {
          shareBoxId: shareBoxId,
          initialTab: notificationType === 'SHAREBOX_USAGE_COMPLETE' ? 'used' : 'available',
        });

        console.log(`[${currentTime}] [토스트 서비스] BoxList 네비게이션 성공`);
      }
    } catch (error) {
      console.error(`[${currentTime}] [토스트 서비스] 알림 처리 중 오류:`, error);
    }
  };

  // 기존 알림이 있으면 모두 제거
  Toast.hide();

  // 토스트 메시지 표시
  Toast.show({
    type: 'notificationToast',
    position: 'top',
    props: {
      title: title || '새로운 알림',
      message: body || '새로운 알림이 도착했습니다.',
      notificationType: notificationData.notificationType,
      referenceEntityType: notificationData.referenceEntityType,
      referenceEntityId: notificationData.referenceEntityId,
      notificationData: notificationData,
      onPress: handleToastPress, // 직접 처리할 onPress 함수 전달
      navigationConfig: { navigate: NavigationService.navigate },
    },
    visibilityTime: 5000,
    autoHide: true,
    topOffset: 0,
    onShow: () => console.log(`[${currentTime}] [토스트 서비스] 알림 토스트가 표시되었습니다.`),
    onHide: () => console.log(`[${currentTime}] [토스트 서비스] 알림 토스트가 숨겨졌습니다.`),
  });
};

/**
 * 일반 토스트 메시지 표시
 * @param {string} type - 토스트 타입 (success, error, info)
 * @param {string} title - 토스트 제목
 * @param {string} message - 토스트 메시지
 */
export const showToast = (type, title, message) => {
  // 기존 토스트 모두 제거
  Toast.hide();

  // 토스트 표시
  Toast.show({
    type: type || 'info',
    position: 'top',
    text1: title,
    text2: message,
    visibilityTime: 3000,
    autoHide: true,
    topOffset: 0,
  });
};

export default {
  toastConfig,
  showNotificationToast,
  showToast,
};
