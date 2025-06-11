import React, { useCallback, useMemo } from 'react';
import { StyleSheet, Platform, Dimensions, View } from 'react-native';
import FastImage from 'react-native-fast-image';
import { useTabBar } from '../../context/TabBarContext';
import { Icon, useTheme } from 'react-native-elements';
import { Badge } from '../ui';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

// 화면 크기 계산
const { width } = Dimensions.get('window');
const ICON_SIZE = width > 380 ? 28 : 26;

// 헤더 컴포넌트
const HeaderBar = ({ notificationCount = 3 }) => {
  const { isTabBarVisible } = useTabBar();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets(); // 안전 영역 정보 가져오기
  const navigation = useNavigation(); // 네비게이션 훅 사용

  // 알림 버튼 클릭 핸들러 - 직접 네비게이션 사용
  const handleNotificationPress = useCallback(() => {
    // 화면 전환 시 탭바를 자동으로 숨기지 않도록 파라미터 전달
    navigation.navigate('Notification', { keepTabBarVisible: true });
  }, [navigation]);

  // 설정 버튼 클릭 핸들러
  const handleSettingsPress = useCallback(() => {
    // 화면 전환 시 탭바를 자동으로 숨기지 않도록 파라미터 전달
    navigation.navigate('Settings', { keepTabBarVisible: true });
  }, [navigation]);

  // 메모이제이션된 뱃지 카운트 컴포넌트
  const BadgeComponent = useMemo(() => {
    if (notificationCount <= 0) return null;

    return (
      <View style={styles.badgeContainer}>
        <Badge value={notificationCount.toString()} status="error" size="sm" />
      </View>
    );
  }, [notificationCount]);

  // 탭바가 숨겨져 있을 때는 헤더도 숨김
  if (!isTabBarVisible) {
    return null;
  }

  return (
    <View>
      {/* 안전 영역 고려한 상단 여백 */}
      <View style={{ height: insets.top, backgroundColor: theme.colors.background }} />

      <View style={[styles.header, { backgroundColor: theme.colors.background }]}>
        {/* 로고 영역 */}
        <View style={styles.logoContainer}>
          <FastImage
            source={require('../../assets/images/splash_icon.png')}
            style={styles.logo}
            resizeMode={FastImage.resizeMode.contain}
          />
        </View>

        {/* 우측 아이콘 버튼 영역 */}
        <View style={styles.iconContainer}>
          {/* 알림 버튼 */}
          <View style={styles.notificationBadgeContainer}>
            <Icon
              name="notifications-none"
              size={ICON_SIZE}
              color={theme.colors.primary}
              type="material"
              containerStyle={styles.notificationIcon}
              onPress={handleNotificationPress}
            />
            {/* 알림 뱃지 - Badge 컴포넌트 사용 */}
            {BadgeComponent}
          </View>

          {/* 설정 버튼 */}
          <Icon
            name="settings"
            size={ICON_SIZE}
            color={theme.colors.primary}
            type="material"
            containerStyle={styles.settingsIcon}
            onPress={handleSettingsPress}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    height: 60,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingTop: 10,
    borderBottomWidth: 0,
    ...Platform.select({
      ios: {
        shadowColor: 'transparent',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0,
        shadowRadius: 0,
      },
      android: {
        elevation: 0,
      },
    }),
  },
  logoContainer: {
    height: 35,
    justifyContent: 'center',
    marginLeft: 8,
  },
  logo: {
    width: 90,
    height: 30,
  },
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginRight: 10,
    paddingRight: 0,
  },
  notificationBadgeContainer: {
    position: 'relative',
    marginRight: 17,
  },
  notificationIcon: {
    padding: 0,
    backgroundColor: 'transparent',
  },
  settingsIcon: {
    padding: 0,
    backgroundColor: 'transparent',
  },
  badgeContainer: {
    position: 'absolute',
    top: -4,
    right: -4,
    zIndex: 1,
  },
});

export default HeaderBar;
