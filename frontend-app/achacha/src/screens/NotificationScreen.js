import React, { useEffect, useCallback, useState, useRef } from 'react';
import {
  StyleSheet,
  FlatList,
  StatusBar,
  View,
  ActivityIndicator,
  Platform,
  InteractionManager,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { Icon, useTheme } from 'react-native-elements';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTabBar } from '../context/TabBarContext';
import { useHeaderBar } from '../context/HeaderBarContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ListItem, Text, AlertDialog } from '../components/ui';
import notificationService from '../api/notificationService';

// 알림 타입에 따른 아이콘 정의
const NOTIFICATION_ICONS = {
  EXPIRY_DATE: 'calendar-month', // 유효기간 만료 알림
  LOCATION_BASED: 'share-location', // 주변 매장 알림
  USAGE_COMPLETE: 'schedule', // 사용완료 여부 알림
  RECEIVE_GIFTICON: 'tap-and-play', // 기프티콘 뿌리기 수신
  SHAREBOX_GIFTICON: 'inventory-2', // 쉐어박스 기프티콘 등록
  SHAREBOX_USAGE_COMPLETE: 'inventory-2', // 쉐어박스 기프티콘 사용
  SHAREBOX_MEMBER_JOIN: 'inventory-2', // 쉐어박스 멤버 참여
  SHAREBOX_DELETED: 'inventory-2', // 쉐어박스 그룹 삭제
};

// 참조 타입 상수
const REFERENCE_TYPES = {
  GIFTICON: 'gifticon',
  SHAREBOX: 'sharebox',
};

// 날짜 형식을 "YYYY년 MM월 DD일"로 변환하는 함수
const formatDateToKorean = dateString => {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  return `${year}년 ${month}월 ${day}일`;
};

// 날짜만 추출하는 함수 (YYYY-MM-DD 형식 반환)
const extractDateOnly = dateTimeString => {
  if (!dateTimeString) return '';

  // Date 객체 생성
  const date = new Date(dateTimeString);

  // 년/월/일 추출 (월은 0부터 시작하므로 +1)
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  // YYYY-MM-DD 형식으로 반환
  return `${year}-${month}-${day}`;
};

const NotificationScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { theme } = useTheme();
  const { hideTabBar, showTabBar } = useTabBar();
  const { updateNotificationCount } = useHeaderBar();
  const insets = useSafeAreaInsets(); // 안전 영역 정보 가져오기

  // 상태 관리
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [nextPage, setNextPage] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [error, setError] = useState(null);
  const [displayData, setDisplayData] = useState([]); // 화면에 표시할 데이터

  // 알림 다이얼로그 상태
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');

  // 페이지 정보 및 로딩 플래그
  const isMounted = useRef(true);
  const loadingMoreRef = useRef(false); // 중복 로딩 방지용 ref
  const currentParams = useRef({
    sort: 'CREATED_DESC',
    size: 6, // 페이지당 항목 수 6개
  });

  // 라우트 파라미터에서 keepTabBarVisible 옵션 확인
  const keepTabBarVisible = route.params?.keepTabBarVisible || false;

  // 알림 데이터를 날짜별로 그룹화
  useEffect(() => {
    if (!notifications || notifications.length === 0) {
      setDisplayData([]);
      return;
    }

    // 1. 날짜별로 알림 그룹화 (년월일이 같은 알림끼리 묶기)
    const dateGroups = {};

    notifications.forEach(notification => {
      if (!notification || !notification.notificationCreatedAt) return;

      // 년월일만 추출
      const dateKey = extractDateOnly(notification.notificationCreatedAt);

      // 해당 날짜 그룹이 없으면 생성
      if (!dateGroups[dateKey]) {
        dateGroups[dateKey] = [];
      }

      // 해당 날짜 그룹에 알림 추가
      dateGroups[dateKey].push({
        ...notification,
        type: 'notification',
        // 고유 ID 생성 (실제 ID + 타임스탬프 + 랜덤값)
        uniqueId: `${notification.notificationId || '0'}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      });
    });

    // 2. 날짜 내림차순 정렬 (최신 날짜 먼저)
    const sortedDates = Object.keys(dateGroups).sort((a, b) => {
      return new Date(b) - new Date(a);
    });

    // 3. 최종 표시 데이터 구성
    const newDisplayData = [];

    sortedDates.forEach(date => {
      // 날짜 헤더 추가 (각 날짜당 하나만)
      newDisplayData.push({
        id: `date-${date}`,
        type: 'date',
        date,
      });

      // 해당 날짜의 알림들 시간 내림차순 정렬 (최신 시간 먼저)
      const sortedNotifications = dateGroups[date].sort((a, b) => {
        if (!a.notificationCreatedAt || !b.notificationCreatedAt) return 0;
        return new Date(b.notificationCreatedAt) - new Date(a.notificationCreatedAt);
      });

      // 정렬된 알림들 추가
      newDisplayData.push(...sortedNotifications);
    });

    // 상태 업데이트
    setDisplayData(newDisplayData);
  }, [notifications]);

  // 알림 내역 초기 로딩
  const loadNotifications = useCallback(async (refresh = false) => {
    if (!isMounted.current || isLoading || isRefreshing) return;

    try {
      if (refresh) {
        setIsRefreshing(true);
        // 새로고침 시 첫 페이지부터 다시 로딩
        currentParams.current = {
          ...currentParams.current,
          page: null,
        };
      } else {
        setIsLoading(true);
      }

      setError(null);

      // API 호출
      const result = await notificationService.getNotifications(currentParams.current);

      if (isMounted.current) {
        if (refresh) {
          // 새로고침 시 데이터 덮어쓰기
          setNotifications(result.notifications || []);
        } else {
          // 초기 로딩 시 데이터 설정
          setNotifications(result.notifications || []);
        }

        setHasNextPage(result.hasNextPage || false);
        setNextPage(result.nextPage || null);

        // 미확인 알림 개수도 함께 업데이트
        fetchUnreadCount();
      }
    } catch (err) {
      console.error('알림 내역 로딩 실패:', err);
      if (isMounted.current) {
        setError('알림 내역을 불러오는데 실패했습니다');
      }
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    }
  }, []);

  // 더 많은 알림 로딩 (페이지네이션)
  const loadMoreNotifications = useCallback(async () => {
    // 더 로드할 페이지가 없거나, 현재 로딩 중이거나, 마운트되지 않았을 경우 로딩 중단
    if (!hasNextPage || isLoadingMore || !isMounted.current || loadingMoreRef.current) {
      return;
    }

    // 중복 호출 방지
    loadingMoreRef.current = true;
    setIsLoadingMore(true);

    try {
      // 다음 페이지 정보 설정
      currentParams.current = {
        ...currentParams.current,
        page: nextPage,
      };

      // API 호출
      const result = await notificationService.getNotifications(currentParams.current);

      if (!isMounted.current) return;

      if (!result.notifications || result.notifications.length === 0) {
        // 결과가 없으면 더 이상 로딩 안함
        setHasNextPage(false);
      } else {
        // 기존 알림 리스트에 새로운 알림 추가
        setNotifications(prev => {
          // 모든 알림을 합침
          const combined = [...prev, ...result.notifications];

          // notificationId로 중복 제거 (최신 항목 유지)
          const uniqueIds = new Set();
          const uniqueNotifications = [];

          // 역순으로 처리하여 최신 알림 먼저 검사 (중복 시 최신 버전 유지)
          for (let i = combined.length - 1; i >= 0; i--) {
            const item = combined[i];
            if (item && item.notificationId && !uniqueIds.has(item.notificationId)) {
              uniqueIds.add(item.notificationId);
              uniqueNotifications.unshift(item); // 원래 순서로 다시 추가
            }
          }

          return uniqueNotifications;
        });

        // 페이지네이션 정보 업데이트
        setHasNextPage(result.hasNextPage || false);
        setNextPage(result.nextPage || null);
      }
    } catch (err) {
      console.error('추가 알림 로딩 실패:', err);
    } finally {
      if (isMounted.current) {
        setIsLoadingMore(false);
        setTimeout(() => {
          loadingMoreRef.current = false;
        }, 300);
      }
    }
  }, [hasNextPage, isLoadingMore, nextPage]);

  // 미확인 알림 개수 가져오기
  const fetchUnreadCount = useCallback(async () => {
    if (!isMounted.current) return;

    try {
      const result = await notificationService.getUnreadNotificationsCount();
      if (isMounted.current) {
        const count = result.count || 0;
        setUnreadCount(count);
        updateNotificationCount(count); // HeaderBar의 알림 카운트도 업데이트
      }
    } catch (err) {
      console.error('미확인 알림 개수 조회 실패:', err);
    }
  }, [updateNotificationCount]);

  // 사용자 새로고침 핸들러
  const handleRefresh = useCallback(() => {
    loadNotifications(true);
  }, [loadNotifications]);

  // 화면 진입 시 데이터 로딩 및 탭바 처리
  useEffect(() => {
    isMounted.current = true;
    loadingMoreRef.current = false;

    // 화면 진입 시 자동으로 데이터 로딩
    const loadInitialData = async () => {
      await loadNotifications(true); // true를 전달하여 새로고침 모드로 실행
    };
    loadInitialData();

    // 화면 진입 시 모든 알림 읽음 처리
    const markAllAsReadOnMount = async () => {
      try {
        // 알림 데이터 로드 후 약간의 딜레이를 주고 읽음 처리 실행
        await new Promise(resolve => setTimeout(resolve, 500));

        if (isMounted.current && unreadCount > 0) {
          await notificationService.markAllNotificationsAsRead();

          // 화면에 반영
          setNotifications(prev =>
            prev.map(notif => ({
              ...notif,
              notificationIsRead: true,
            }))
          );

          // 읽지 않은 알림 개수 업데이트
          setUnreadCount(0);
          updateNotificationCount(0); // HeaderBar의 알림 카운트도 업데이트
          console.log('[NotificationScreen] 모든 알림을 자동으로 읽음 처리했습니다.');
        }
      } catch (err) {
        console.error('[NotificationScreen] 자동 알림 읽음 처리 실패:', err);
      }
    };

    markAllAsReadOnMount();

    // 애니메이션이 완료된 후에 탭바 숨기기
    const interactionComplete = InteractionManager.runAfterInteractions(() => {
      if (!keepTabBarVisible) {
        hideTabBar();
      }
    });

    // 화면 이탈 시 탭바 복원 및 리소스 정리
    return () => {
      isMounted.current = false;
      loadingMoreRef.current = false;
      interactionComplete.cancel();
      showTabBar();
    };
  }, [
    hideTabBar,
    showTabBar,
    keepTabBarVisible,
    loadNotifications,
    unreadCount,
    updateNotificationCount,
  ]);

  // 뒤로가기 처리
  const handleGoBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  // 알림 항목 선택 처리
  const handleNotificationPress = useCallback(
    async item => {
      if (item.type !== 'notification') return;

      // 알림 타입 및 참조 엔티티에 따라 적절한 화면으로 이동
      const { notificationType, referenceEntityType, referenceEntityId } = item;

      console.log('[디버그] 알림 클릭:', {
        notificationType,
        referenceEntityType,
        referenceEntityId,
        item: JSON.stringify(item),
      });

      if (!referenceEntityId) {
        console.log('참조 ID가 없습니다:', item);
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
          console.log('[디버그] 기프티콘 알림 처리 시작');

          try {
            // 기프티콘 상세 정보를 먼저 가져와서 타입 확인
            const gifticonDetail = await notificationService.getGifticonDetail(referenceEntityId);
            console.log('[디버그] 기프티콘 상세 조회 결과:', JSON.stringify(gifticonDetail));

            // 기프티콘 상태 확인 (삭제 또는 선물/뿌리기/공유된 경우)
            if (
              !gifticonDetail ||
              gifticonDetail.gifticonStatus === 'DELETED' ||
              gifticonDetail.gifticonStatus === 'GIFTED' ||
              gifticonDetail.gifticonStatus === 'SHARED' ||
              gifticonDetail.gifticonStatus === 'TRANSFERRED'
            ) {
              // 삭제되었거나 존재하지 않는 기프티콘인 경우 처리
              showAlert('알림', '삭제되었거나 존재하지 않는 기프티콘입니다.');
              return;
            }

            // 기프티콘 타입에 따라 적절한 상세 화면으로 이동
            if (gifticonDetail.gifticonType === 'AMOUNT') {
              // 금액형 기프티콘
              console.log('[디버그] 금액형 기프티콘으로 이동:', referenceEntityId);
              navigation.navigate('DetailAmount', {
                gifticonId: referenceEntityId,
                scope: 'MY_BOX', // 기본값은 MY_BOX로 설정
              });
            } else {
              // 상품형 기프티콘 (기본값)
              console.log('[디버그] 상품형 기프티콘으로 이동:', referenceEntityId);
              navigation.navigate('DetailProduct', {
                gifticonId: referenceEntityId,
                scope: 'MY_BOX', // 기본값은 MY_BOX로 설정
              });
            }
          } catch (gifticonError) {
            console.error('[디버그] 기프티콘 상세 조회 오류:', gifticonError);
            // 기프티콘 조회 실패 시 (존재하지 않는 경우)
            showAlert('알림', '삭제되었거나 존재하지 않는 기프티콘입니다.');
            return;
          }
        }
        // 쉐어박스 관련 알림 처리
        else if (
          ['SHAREBOX_GIFTICON', 'SHAREBOX_USAGE_COMPLETE', 'SHAREBOX_MEMBER_JOIN'].includes(
            notificationType
          ) &&
          referenceEntityType === REFERENCE_TYPES.SHAREBOX
        ) {
          console.log('[디버그] 쉐어박스 알림 처리:', {
            shareBoxId: referenceEntityId,
            initialTab: notificationType === 'SHAREBOX_USAGE_COMPLETE' ? 'used' : 'available',
          });

          try {
            // 문자열이 아닌 숫자로 변환하여 전달
            const shareBoxId = parseInt(referenceEntityId, 10);

            // 쉐어박스 접근 가능 여부 확인 (API 호출)
            const isAccessible = await notificationService.checkShareBoxAccessibility(shareBoxId);

            if (!isAccessible) {
              showAlert('알림', '참여 중이지 않거나 삭제된 쉐어박스입니다.');
              return;
            }

            // 쉐어박스 기프티콘 목록 화면으로 이동
            navigation.navigate('BoxList', {
              shareBoxId: shareBoxId,
              initialTab: notificationType === 'SHAREBOX_USAGE_COMPLETE' ? 'used' : 'available',
            });
          } catch (navError) {
            console.error('[디버그] 쉐어박스 네비게이션 오류:', navError);
            showAlert('알림', '삭제되었거나 나가기 처리한 쉐어박스입니다.');
          }
        }
        // 쉐어박스 삭제 알림 처리
        else if (notificationType === 'SHAREBOX_DELETED') {
          console.log('[디버그] 쉐어박스 삭제 알림: 네비게이션 없음');
          // 삭제된 쉐어박스 알림은 네비게이션 하지 않음
        } else {
          console.log('처리되지 않은 알림 타입:', notificationType);
        }
      } catch (error) {
        console.error('[디버그] 알림 처리 중 오류 발생:', error);
        showAlert('오류', '알림을 처리하는 중 문제가 발생했습니다.');
      }
    },
    [navigation]
  );

  // 알림 유형에 따른 아이콘 색상 가져오기
  const getIconColorByType = useCallback(type => {
    switch (type) {
      case 'EXPIRY_DATE':
        return '#EF9696';
      case 'LOCATION_BASED':
        return '#8CDA8F';
      case 'USAGE_COMPLETE':
        return '#6BB2EA';
      case 'RECEIVE_GIFTICON':
        return '#D095EE';
      case 'SHAREBOX_GIFTICON':
      case 'SHAREBOX_USAGE_COMPLETE':
      case 'SHAREBOX_MEMBER_JOIN':
      case 'SHAREBOX_DELETED':
        return '#F1A9D5';
      default:
        return '#4B9CFF';
    }
  }, []);

  // 날짜 구분선 렌더링
  const renderDateDivider = useCallback(date => {
    const formattedDate = formatDateToKorean(date);

    return (
      <View style={styles.dividerContainer}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>{formattedDate}</Text>
        <View style={styles.dividerLine} />
      </View>
    );
  }, []);

  // 아이템 렌더링 (알림 또는 날짜 구분선)
  const renderItem = useCallback(
    ({ item }) => {
      // 날짜 구분선인 경우
      if (item.type === 'date') {
        return renderDateDivider(item.date);
      }

      // 알림 항목인 경우
      return (
        <ListItem.NotificationCard
          title={item.notificationTitle}
          message={item.notificationContent}
          time={item.notificationCreatedAt}
          onPress={() => handleNotificationPress(item)}
          icon={NOTIFICATION_ICONS[item.notificationType] || 'notifications'}
          iconColor={getIconColorByType(item.notificationType)}
          isRead={item.notificationIsRead}
        />
      );
    },
    [handleNotificationPress, getIconColorByType, renderDateDivider]
  );

  // 메시지 표시 (로딩, 오류, 데이터 없음)
  const renderMessage = useCallback(() => {
    if (isLoading && notifications.length === 0) {
      return (
        <View style={styles.messageContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.messageText}>알림을 불러오는 중입니다...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.messageContainer}>
          <Icon name="error-outline" type="material" size={48} color={theme.colors.error} />
          <Text style={styles.messageText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => loadNotifications(true)}>
            <Text style={styles.retryButtonText}>다시 시도</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (notifications.length === 0) {
      return (
        <View style={styles.messageContainer}>
          <Icon name="notifications-off" type="material" size={48} color={theme.colors.grey3} />
          <Text style={styles.messageText}>알림이 없습니다</Text>
        </View>
      );
    }

    return null;
  }, [isLoading, notifications.length, error, theme.colors, loadNotifications]);

  // 리스트 푸터 (더 로딩 중 표시)
  const renderFooter = useCallback(() => {
    if (!isLoadingMore) return null;

    return (
      <View style={styles.footerContainer}>
        <ActivityIndicator size="small" color={theme.colors.primary} />
        <Text style={styles.footerText}>더 불러오는 중...</Text>
      </View>
    );
  }, [isLoadingMore, theme.colors.primary]);

  // 고유한 키 값을 생성하는 함수
  const keyExtractor = useCallback(item => {
    return item.uniqueId || item.id || `${item.notificationId || ''}-${Math.random()}`;
  }, []);

  // AlertDialog 표시 함수
  const showAlert = (title, message) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertVisible(true);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />

      {/* 안전 영역 고려한 상단 여백 */}
      <View style={{ height: insets.top, backgroundColor: theme.colors.background }} />

      {/* 커스텀 헤더 */}
      <View style={[styles.header, { backgroundColor: theme.colors.background }]}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButtonContainer}>
          <Icon name="arrow-back-ios" type="material" size={22} color={theme.colors.black} />
        </TouchableOpacity>
        <Text variant="h3" weight="bold" style={styles.headerTitle}>
          알림함
        </Text>
        <View style={styles.rightPlaceholder} />
      </View>

      {renderMessage()}

      {notifications.length > 0 && (
        <FlatList
          data={displayData}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={7}
          removeClippedSubviews={Platform.OS === 'android'}
          onEndReached={loadMoreNotifications}
          onEndReachedThreshold={0.3}
          ListFooterComponent={renderFooter}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              colors={[theme.colors.primary]}
              tintColor={theme.colors.primary}
            />
          }
        />
      )}

      {/* 알림 다이얼로그 */}
      <AlertDialog
        isVisible={alertVisible}
        onBackdropPress={() => setAlertVisible(false)}
        title={alertTitle}
        message={alertMessage}
        confirmText="확인"
        onConfirm={() => setAlertVisible(false)}
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
    height: 44,
  },
  listContainer: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  messageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  messageText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#4B9CFF',
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: '500',
  },
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
  },
  footerText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666666',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#DDDDDD',
  },
  dividerText: {
    paddingHorizontal: 12,
    fontSize: 14,
    color: '#666666',
    fontWeight: '500',
  },
});

export default NotificationScreen;
