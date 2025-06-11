import { NavigationService } from '../navigation/NavigationService';
import gifticonService from '../api/gifticonService';

/**
 * 푸시 알림 클릭 이벤트를 처리하는 함수
 * @param {Object} notification - 알림 객체
 * @param {string} notification.referenceEntityType - 참조 엔티티 타입 ('gifticon' 또는 'sharebox')
 * @param {number} notification.referenceEntityId - 참조 엔티티 ID
 * @param {string} notification.notificationType - 알림 타입 (EXPIRY_DATE, LOCATION_BASED, 등)
 */
export const handleNotificationPress = async notification => {
  // notification이 없거나 필수 정보가 없는 경우 무시
  if (!notification || !notification.referenceEntityType || !notification.referenceEntityId) {
    console.log('[NotificationHandler] 유효하지 않은 알림 데이터:', notification);
    return;
  }

  try {
    const { referenceEntityType, referenceEntityId, notificationType } = notification;

    // navigation이 초기화됐는지 확인
    if (!NavigationService.navigationRef.current) {
      console.log(
        '[NotificationHandler] Navigation이 초기화되지 않았습니다. 잠시 후 재시도합니다.'
      );
      // 0.5초 후에 재시도
      setTimeout(() => handleNotificationPress(notification), 500);
      return;
    }

    // 기프티콘 관련 알림인 경우
    if (referenceEntityType.toLowerCase() === 'gifticon') {
      const gifticonId = referenceEntityId;

      // 기프티콘 타입(상품형/금액형) 확인을 위해 기프티콘 정보 조회
      try {
        const gifticonInfo = await gifticonService.getGifticonInfo(gifticonId);
        const gifticonType = gifticonInfo.gifticonType; // 'PRODUCT' 또는 'AMOUNT'
        const scope = gifticonInfo.scope || 'MY_BOX'; // 기본값은 MY_BOX

        // 기프티콘 타입에 따라 다른 상세 화면으로 이동
        if (gifticonType === 'AMOUNT') {
          NavigationService.navigate('DetailAmountScreen', {
            gifticonId,
            scope,
            refresh: true,
          });
        } else {
          NavigationService.navigate('DetailProductScreen', {
            gifticonId,
            scope,
            refresh: true,
          });
        }
      } catch (error) {
        console.error('[NotificationHandler] 기프티콘 정보 조회 실패:', error);
        // 정보 조회 실패 시 기본적으로 상품형 화면으로 이동
        NavigationService.navigate('DetailProductScreen', {
          gifticonId,
          scope: 'MY_BOX',
          refresh: true,
        });
      }
    }

    // 쉐어박스 관련 알림인 경우
    else if (referenceEntityType.toLowerCase() === 'sharebox') {
      const shareBoxId = referenceEntityId;

      // 쉐어박스 삭제 알림은 홈 화면으로 이동
      if (notificationType === 'SHAREBOX_DELETED') {
        console.log('[NotificationHandler] 쉐어박스 삭제 알림: BoxMainScreen으로 이동');
        NavigationService.navigate('BoxMainScreen');
        return;
      }

      // 쉐어박스 목록 화면으로 이동
      NavigationService.navigate('BoxListScreen', {
        shareBoxId,
        initialTab: 'available', // 기본 탭은 사용가능 탭으로 설정
      });
    }

    // 알려지지 않은 타입의 알림인 경우
    else {
      console.log('[NotificationHandler] 알 수 없는 알림 타입:', referenceEntityType);
    }
  } catch (error) {
    console.error('[NotificationHandler] 알림 처리 중 오류:', error);
  }
};

export default {
  handleNotificationPress,
};
