import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Icon } from 'react-native-elements';
import notificationService from '../../api/notificationService';

// NotificationScreen.js에서 사용하는 것과 동일한 아이콘 매핑
const NOTIFICATION_ICONS = {
  EXPIRY_DATE: 'calendar-month', // 유효기간 만료 알림
  LOCATION_BASED: 'share-location', // 주변 매장 알림
  USAGE_COMPLETE: 'schedule', // 사용완료 여부 알림
  RECEIVE_GIFTICON: 'tap-and-play', // 기프티콘 뿌리기 수신
  SHAREBOX_GIFTICON: 'inventory-2', // 쉐어박스 기프티콘 등록
  SHAREBOX_USAGE_COMPLETE: 'inventory-2', // 쉐어박스 기프티콘 사용
  SHAREBOX_MEMBER_JOIN: 'inventory-2', // 쉐어박스 멤버 참여
  SHAREBOX_DELETED: 'inventory-2', // 쉐어박스 그룹 삭제
  // 기본 타입도 추가
  SUCCESS: 'check-circle',
  ERROR: 'error',
  INFO: 'info',
};

// 참조 타입 상수
const REFERENCE_TYPES = {
  GIFTICON: 'gifticon',
  SHAREBOX: 'sharebox',
};

/**
 * 상단 헤드업 스타일 토스트 컴포넌트
 */
const HeadupToast = props => {
  // 기본 props 및 확장 props 추출
  const { text1, text2, onPress, onClose, props: customProps = {} } = props;

  // 알림 타입 및 아이콘 결정
  const type = customProps.type || 'default';
  const iconColor = getIconColor(type);
  const iconName = getIconName(type);

  // 제목과 메시지 (커스텀 props 또는 기본 props 사용)
  const title = customProps.title || text1 || '';
  const message = customProps.message || text2 || '';

  // 알림 객체 데이터 추출 (NotificationScreen과 동일한 형식)
  const notificationData = customProps.notificationData || null;

  // 네비게이션 설정
  const navigationConfig = customProps.navigationConfig || null;

  // 알림 클릭 처리 함수
  const handleNotificationPress = async () => {
    console.log('[HeadupToast] 알림 클릭 이벤트 발생');

    // 알림 표시 닫기
    if (onClose) {
      onClose();
    }

    // 먼저 customProps에 onPress가 있으면 실행
    if (customProps.onPress) {
      console.log('[HeadupToast] customProps.onPress 실행');
      customProps.onPress();
      return;
    }

    // 기존 onPress가 있으면 실행
    if (onPress) {
      console.log('[HeadupToast] 기본 onPress 실행');
      onPress();
      return;
    }

    // 이하 코드는 onPress 또는 customProps.onPress가 지정되어 있지 않을 때만 실행됨
    // notificationData가 없거나 네비게이션 설정이 없으면 처리 불가
    if (!notificationData || !navigationConfig || !navigationConfig.navigate) {
      console.log('[HeadupToast] 알림 데이터 또는 네비게이션 설정이 없습니다', {
        hasNotificationData: !!notificationData,
        hasNavigationConfig: !!navigationConfig,
        hasNavigate: !!(navigationConfig && navigationConfig.navigate),
      });
      return;
    }

    console.log('[HeadupToast] 알림 데이터:', {
      notificationData: JSON.stringify(notificationData),
      navigationConfig: navigationConfig ? 'exists' : 'null',
    });

    const { notificationType, referenceEntityType, referenceEntityId } = notificationData;
    const { navigate } = navigationConfig;

    if (!referenceEntityId) {
      console.log('[HeadupToast] 참조 ID가 없습니다:', notificationData);
      return;
    }

    try {
      // 기프티콘 관련 알림 처리
      if (
        ['EXPIRY_DATE', 'USAGE_COMPLETE', 'RECEIVE_GIFTICON', 'LOCATION_BASED'].includes(
          notificationType
        ) &&
        referenceEntityType === REFERENCE_TYPES.GIFTICON
      ) {
        console.log('[HeadupToast] 기프티콘 알림 처리 시작');
        // 기프티콘 상세 정보를 먼저 가져와서 타입 확인
        const gifticonDetail = await notificationService.getGifticonDetail(referenceEntityId);
        console.log('[HeadupToast] 기프티콘 상세 조회 결과:', JSON.stringify(gifticonDetail));

        // 기프티콘 타입에 따라 적절한 상세 화면으로 이동
        if (gifticonDetail.gifticonType === 'AMOUNT') {
          // 금액형 기프티콘
          console.log('[HeadupToast] 금액형 기프티콘으로 이동:', referenceEntityId);
          navigate('DetailAmount', {
            gifticonId: referenceEntityId,
            scope: 'MY_BOX', // 기본값은 MY_BOX로 설정
          });
        } else {
          // 상품형 기프티콘 (기본값)
          console.log('[HeadupToast] 상품형 기프티콘으로 이동:', referenceEntityId);
          navigate('DetailProduct', {
            gifticonId: referenceEntityId,
            scope: 'MY_BOX', // 기본값은 MY_BOX로 설정
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
        // 로그 추가
        console.log('[HeadupToast] 쉐어박스 알림 처리 시작 - 원본 데이터:', {
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

        console.log('[HeadupToast] 쉐어박스 알림 처리 - 변환된 shareBoxId:', {
          shareBoxId,
          shareBoxIdType: typeof shareBoxId,
          initialTab: notificationType === 'SHAREBOX_USAGE_COMPLETE' ? 'used' : 'available',
        });

        try {
          // 쉐어박스 기프티콘 목록 화면으로 이동
          // BoxList 스크린의 파라미터는 shareBoxId여야 함
          navigate('BoxList', {
            shareBoxId: shareBoxId,
            initialTab: notificationType === 'SHAREBOX_USAGE_COMPLETE' ? 'used' : 'available',
          });
          console.log('[HeadupToast] BoxList 네비게이션 성공');
        } catch (navError) {
          console.error('[HeadupToast] 쉐어박스 네비게이션 오류:', navError);
        }
      } else {
        console.log('[HeadupToast] 처리되지 않은 알림 타입:', notificationType);
      }
    } catch (error) {
      console.error('[HeadupToast] 알림 처리 중 오류 발생:', error);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.content}
        activeOpacity={0.9}
        onPress={handleNotificationPress}
      >
        <View style={[styles.iconContainer, { backgroundColor: iconColor + '20' }]}>
          <Icon name={iconName} type="material" size={22} color={iconColor} />
        </View>

        <View style={styles.textContainer}>
          {title ? (
            <Text style={[styles.title, { fontFamily: 'Pretendard-Bold' }]} numberOfLines={1}>
              {title}
            </Text>
          ) : null}

          {message ? (
            <Text style={[styles.message, { fontFamily: 'Pretendard-Regular' }]} numberOfLines={2}>
              {message}
            </Text>
          ) : null}
        </View>

        <TouchableOpacity
          style={styles.closeButton}
          onPress={e => {
            // 이벤트 버블링 방지
            e.stopPropagation();
            if (onClose) onClose();
          }}
        >
          <Icon name="close" type="material" size={18} color="#888" />
        </TouchableOpacity>
      </TouchableOpacity>
    </View>
  );
};

// 알림 타입에 따른 아이콘 선택 (NotificationScreen.js와 동일하게)
const getIconName = type => {
  // 일반 타입 (success, error, info) 처리
  if (type === 'success') return NOTIFICATION_ICONS.SUCCESS;
  if (type === 'error') return NOTIFICATION_ICONS.ERROR;
  if (type === 'info') return NOTIFICATION_ICONS.INFO;

  // 알림 타입이 NOTIFICATION_ICONS에 있는 경우 매핑된 아이콘 반환
  if (NOTIFICATION_ICONS[type]) {
    return NOTIFICATION_ICONS[type];
  }

  // 기본 아이콘
  return 'notifications';
};

// 알림 타입에 따른 색상 선택
const getIconColor = type => {
  switch (type) {
    case 'success':
    case 'SUCCESS':
    case 'LOCATION_BASED':
      return '#8CDA8F'; // 녹색

    case 'error':
    case 'ERROR':
    case 'EXPIRY_DATE':
      return '#EF9696'; // 빨간색

    case 'USAGE_COMPLETE':
      return '#6BB2EA'; // 파란색

    case 'info':
    case 'INFO':
    case 'RECEIVE_GIFTICON':
      return '#D095EE'; // 보라색

    case 'SHAREBOX_GIFTICON':
    case 'SHAREBOX_USAGE_COMPLETE':
    case 'SHAREBOX_MEMBER_JOIN':
    case 'SHAREBOX_DELETED':
      return '#F1A9D5'; // 분홍색

    default:
      return '#4B9CFF'; // 기본 파란색
  }
};

const styles = StyleSheet.create({
  container: {
    width: '92%',
    alignSelf: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    shadowColor: '#737373',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginTop: 50,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
  },
  textContainer: {
    flex: 1,
    paddingRight: 5,
  },
  title: {
    fontSize: 15,
    color: '#000',
    marginBottom: 5,
  },
  message: {
    fontSize: 13,
    lineHeight: 18,
    color: '#737373',
  },
  closeButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default HeadupToast;
