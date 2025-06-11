/* eslint-disable react-native/no-inline-styles */
import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  FlatList,
  Image,
  TouchableOpacity,
  Dimensions,
  ImageBackground,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import { useTheme } from '../hooks/useTheme';
import { Text } from '../components/ui';
import { Shadow } from 'react-native-shadow-2';
import NavigationService from '../navigation/NavigationService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Carousel from 'react-native-reanimated-carousel';
import Animated from 'react-native-reanimated';
import gifticonService from '../api/gifticonService';
import notificationService from '../api/notificationService';
import { useHeaderBar } from '../context/HeaderBarContext';
import { useNavigation } from '@react-navigation/native';
import { fetchUserById } from '../api/userInfo';

// 캐러셀에 표시할 카드 데이터
const CAROUSEL_CARDS = [
  {
    id: '1',
    type: 'sharebox',
    title: '나누면 즐거움 두배,\n쉐어박스',
    image: require('../assets/images/share_box.png'),
    iconName: 'inventory-2',
    onPress: () => NavigationService.navigate('TabSharebox'),
  },
  {
    id: '2',
    type: 'radar',
    title: '쓱- 뿌리기\n행운의 주인공은?',
    image: require('../assets/images/home_radar.png'),
    onPress: () => NavigationService.navigate('TabMap'),
  },
  {
    id: '3',
    type: 'gift',
    title: '기프티콘을 선물해봐요!',
    subtitle: '포장은 저희가 해드릴게요.',
    image: require('../assets/images/home_gift.png'),
    onPress: () => NavigationService.navigate('TabGifticonManage'),
  },
];

const { width: screenWidth } = Dimensions.get('window');

const HomeScreen = () => {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const { updateNotificationCount } = useHeaderBar();
  const [nickname, setNickname] = useState('');
  const carouselRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const [expiringGifticons, setExpiringGifticons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const printTokens = async () => {
      const userId = await AsyncStorage.getItem('userId');

      // userId로 사용자 정보 조회
      if (userId) {
        try {
          const userInfo = await fetchUserById(userId);
          if (userInfo && userInfo.userName) {
            setNickname(userInfo.userName);
          }
          // eslint-disable-next-line no-catch-shadow
        } catch (error) {
          console.error('사용자 정보 조회 실패:', error);
        }
      }
    };
    printTokens();

    const loadExpiringGifticons = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = {
          page: 0,
          size: 5,
          sort: 'EXPIRY_ASC',
          scope: 'MY_BOX',
        };
        const response = await gifticonService.getAvailableGifticons(params);

        if (response && response.gifticons) {
          const formattedGifticons = response.gifticons.map(item => ({
            id: item.gifticonId,
            brand: item.brandName,
            name: item.gifticonName,
            image: item.thumbnailPath
              ? { uri: item.thumbnailPath }
              : require('../assets/images/adaptive_icon.png'),
            expiryDate: new Date(item.gifticonExpiryDate),
            gifticonType: item.gifticonType,
          }));
          setExpiringGifticons(formattedGifticons);
        } else {
          setExpiringGifticons([]);
        }
      } catch (err) {
        setError(err.message || '기프티콘을 불러오는 데 실패했습니다.');
        setExpiringGifticons([]);
      } finally {
        setLoading(false);
      }
    };

    const loadNotificationCount = async () => {
      try {
        const response = await notificationService.getUnreadNotificationsCount();

        if (response && response.count !== undefined) {
          updateNotificationCount(response.count);
        } else {
          updateNotificationCount(0);
        }
      } catch (err) {
        updateNotificationCount(0);
      }
    };

    // 초기 데이터 로드
    loadExpiringGifticons();
    loadNotificationCount();

    // 화면에 포커스될 때마다 알림 개수 및 기프티콘 목록 모두 새로고침
    const unsubscribeFocus = navigation.addListener('focus', () => {
      // 알림 개수 갱신
      loadNotificationCount();

      // 만료 임박 기프티콘 목록 새로고침
      loadExpiringGifticons();
    });

    // 컴포넌트 언마운트 시 이벤트 리스너 정리
    return () => {
      unsubscribeFocus();
    };
  }, []);

  const calculateDaysLeft = expiryDate => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiry = new Date(expiryDate);
    expiry.setHours(0, 0, 0, 0);
    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // 새로고침 처리 함수
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // 만료 임박 기프티콘 새로고침
      const params = {
        page: 0,
        size: 5,
        sort: 'EXPIRY_ASC',
        scope: 'MY_BOX',
      };
      const response = await gifticonService.getAvailableGifticons(params);

      if (response && response.gifticons) {
        const formattedGifticons = response.gifticons.map(item => ({
          id: item.gifticonId,
          brand: item.brandName,
          name: item.gifticonName,
          image: item.thumbnailPath
            ? { uri: item.thumbnailPath }
            : require('../assets/images/adaptive_icon.png'),
          expiryDate: new Date(item.gifticonExpiryDate),
          gifticonType: item.gifticonType,
        }));
        setExpiringGifticons(formattedGifticons);
      } else {
        setExpiringGifticons([]);
      }

      // 알림 개수 새로고침
      const notificationResponse = await notificationService.getUnreadNotificationsCount();
      if (notificationResponse && notificationResponse.count !== undefined) {
        updateNotificationCount(notificationResponse.count);
      } else {
        updateNotificationCount(0);
      }

      // 사용자 정보도 갱신
      const userId = await AsyncStorage.getItem('userId');
      if (userId) {
        const userInfo = await fetchUserById(userId);
        if (userInfo && userInfo.userName) {
          setNickname(userInfo.userName);
        }
      }
    } catch (err) {
      console.error('새로고침 중 오류 발생:', err);
      setError(err.message || '데이터를 새로고침하는 데 실패했습니다.');
    } finally {
      setRefreshing(false);
    }
  }, [updateNotificationCount]);

  // 스타일 정의를 컴포넌트 내부로 이동하여 theme에 접근 가능하도록 합니다.
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      paddingHorizontal: 2,
      paddingTop: 0,
    },
    contentContainer: {
      paddingTop: 0,
      paddingBottom: 30,
    },
    welcomeSection: {
      paddingHorizontal: 8,
      alignItems: 'flex-start',
      marginBottom: 15,
    },
    welcomeText: {
      letterSpacing: 0,
      fontSize: 20,
      lineHeight: 28,
    },
    carouselSection: {
      alignItems: 'center',
      marginBottom: 10,
      overflow: 'hidden',
    },
    carouselCard: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      height: 130,
      width: '100%',
      borderRadius: 15,
      overflow: 'hidden',
    },
    giftListContainer: {
      marginBottom: 10,
      paddingHorizontal: 2,
      minHeight: 190,
    },
    giftListContent: {
      paddingRight: 10,
      paddingBottom: 5,
    },
    shadowContainer: {
      borderRadius: 12,
      width: '100%',
    },
    giftItemContainer: {
      width: 180,
      marginRight: 10,
    },
    giftCard: {
      width: '100%',
      height: 180,
      backgroundColor: '#FFFFFF',
      borderRadius: 12,
      paddingVertical: 5,
      overflow: 'visible',
    },
    expiredGiftCard: {
      opacity: 0.6,
    },
    giftImageContainer: {
      width: '100%',
      height: 80,
      justifyContent: 'center',
      alignItems: 'center',
      paddingTop: 5,
    },
    giftImage: {
      width: '55%',
      height: '85%',
    },
    giftBrand: {
      color: '#000000',
      textAlign: 'center',
      marginTop: 2,
      letterSpacing: -0.2,
    },
    giftName: {
      color: '#000000',
      textAlign: 'center',
      paddingHorizontal: 10,
      letterSpacing: -0.1,
    },
    dDayBaseContainer: {
      width: '45%',
      paddingHorizontal: 10,
      paddingVertical: 1,
      borderRadius: 5,
      alignSelf: 'center',
      marginTop: 10,
      marginBottom: 6,
    },
    dDayBaseText: {
      alignSelf: 'center',
      letterSpacing: -0.1,
    },
    urgentDdayContainer: {
      backgroundColor: 'rgba(234, 84, 85, 0.15)',
    },
    normalDdayContainer: {
      backgroundColor: 'rgba(114, 191, 255, 0.15)',
    },
    expiredDdayContainer: {
      backgroundColor: 'rgba(153, 153, 153, 0.15)',
    },
    urgentDdayText: {
      color: '#EA5455',
    },
    normalDdayText: {
      color: '#72BFFF',
    },
    expiredDdayText: {
      color: '#737373',
    },
    loadingContainer: {
      height: 180,
      justifyContent: 'center',
      alignItems: 'center',
    },
    errorContainer: {
      height: 180,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 20,
    },
    errorText: {
      color: theme.colors.error,
      textAlign: 'center',
    },
    emptyGifticonCard: {
      width: '100%',
      height: 180,
      backgroundColor: '#e0e0e0',
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 15,
    },
    emptyGifticonCardText: {
      color: theme.colors.border,
      textAlign: 'center',
      fontSize: 16,
      lineHeight: 22,
    },
    bottomCardSection: {
      paddingHorizontal: 2,
      marginBottom: 10,
    },
    giftMessageCard: {
      backgroundColor: '#E5F4FE',
      borderRadius: 15,
      padding: 15,
      flexDirection: 'row',
      justifyContent: 'flex-start',
      alignItems: 'center',
      height: 120,
      overflow: 'hidden',
      position: 'relative',
    },
    giftMessageTextContainer: {
      flex: 1.5,
      paddingLeft: 10,
      paddingRight: 0,
      justifyContent: 'center',
      height: '100%',
    },
    giftMessageTextContainerRadar: {
      flex: 1.5,
      paddingLeft: 15,
      paddingRight: 10,
      justifyContent: 'center',
      height: '100%',
    },
    giftMessageTextContainerSharebox: {
      flex: 1.5,
      paddingLeft: 25,
      paddingRight: 10,
      justifyContent: 'center',
      height: '100%',
    },
    giftMessageTitle: {
      marginBottom: 2,
      letterSpacing: -0.2,
      lineHeight: 25,
    },
    giftMessageSubtitle: {
      color: '#737373',
      letterSpacing: -0.3,
    },
    giftMessageImageContainer: {
      flex: 1,
      alignItems: 'flex-end',
      marginTop: -10,
      marginBottom: -10,
    },
    giftMessageImage: {
      width: 100,
      height: 100,
    },
    giftMessageImage1: {
      width: 100,
      height: 100,
      marginRight: 20,
    },
    giftMessageImage2: {
      width: 100,
      height: 100,
      marginRight: 15,
    },
    mapMessageCard: {
      borderRadius: 8,
      overflow: 'hidden',
      height: 90,
    },
    mapBackgroundImage: {
      width: '100%',
      height: '100%',
      position: 'relative',
    },
    mapBackgroundImageStyle: {
      width: '100%',
      height: '100%',
      borderRadius: 15,
    },
    mapOverlay: {
      backgroundColor: 'rgba(255, 255, 255, 0.65)',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      padding: 15,
      flexDirection: 'row',
    },
    mapMessageTextContainer: {
      flex: 1.5,
      paddingLeft: 10,
      paddingRight: 0,
      justifyContent: 'center',
      height: '100%',
    },
    mapTitleContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 10,
    },
    mapMarkerImage: {
      width: 30,
      height: 30,
      marginRight: 5,
    },
    mapMessageTitle: {
      alignSelf: 'center',
      marginBottom: 2,
      letterSpacing: -0.2,
      lineHeight: 30,
      color: '#000000',
    },
    bottomWatchSection: {
      paddingHorizontal: 2,
      marginBottom: 10,
    },
    watchMessageCard: {
      backgroundColor: '#FFFFFF',
      borderRadius: 8,
      padding: 15,
      flexDirection: 'row',
      justifyContent: 'flex-start',
      alignItems: 'center',
      height: 90,
      overflow: 'hidden',
      position: 'relative',
    },
    watchMessageTextContainer: {
      flex: 1.5,
      paddingLeft: 10,
      paddingRight: 0,
      justifyContent: 'center',
      height: '100%',
    },
    watchTitleContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 10,
    },
    watchMessageTitle: {
      marginBottom: 2,
      letterSpacing: -0.2,
      lineHeight: 20,
    },
    watchMessageSubtitle: {
      color: '#737373',
      letterSpacing: -0.3,
    },
    watchGuideImageContainer: {
      flex: 1,
      alignItems: 'flex-end',
      justifyContent: 'center',
      marginRight: 5,
    },
    watchGuideImage: {
      marginTop: 15,
      width: 75,
      height: 75,
    },
    carouselPaginationOverlay: {
      position: 'absolute',
      bottom: 10,
      right: 10,
      backgroundColor: 'rgba(0, 0, 0, 0.15)',
      borderRadius: 15,
      paddingHorizontal: 8,
      paddingVertical: 2,
    },
    paginationText: {
      color: 'white',
      fontSize: 12,
    },
  });

  const handleGifticonPress = item => {
    if (!item || !item.id || !item.gifticonType) {
      return;
    }

    const params = {
      gifticonId: item.id,
    };

    if (item.gifticonType === 'PRODUCT') {
      NavigationService.navigate('DetailProduct', params);
    } else if (item.gifticonType === 'AMOUNT') {
      NavigationService.navigate('DetailAmount', params);
    }
  };

  const renderGiftItem = ({ item }) => {
    const daysLeft = calculateDaysLeft(item.expiryDate);
    const dDayDisplay = daysLeft < 0 ? '만료' : daysLeft === 0 ? 'D-day' : `D-${daysLeft}`;
    const isExpired = daysLeft < 0;
    const isUrgent = !isExpired && daysLeft <= 7;

    let dDayContainerStyle = styles.normalDdayContainer;
    if (isExpired) {
      dDayContainerStyle = styles.expiredDdayContainer;
    } else if (isUrgent) {
      dDayContainerStyle = styles.urgentDdayContainer;
    }

    let dDayTextStyle = styles.normalDdayText;
    if (isExpired) {
      dDayTextStyle = styles.expiredDdayText;
    } else if (isUrgent) {
      dDayTextStyle = styles.urgentDdayText;
    }

    return (
      <TouchableOpacity onPress={() => handleGifticonPress(item)} activeOpacity={0.8}>
        <View style={styles.giftItemContainer}>
          <Shadow
            distance={12}
            startColor={'rgba(0, 0, 0, 0.008)'}
            offset={[0, 1]}
            style={styles.shadowContainer}
          >
            <View style={[styles.giftCard, isExpired && styles.expiredGiftCard]}>
              <View style={styles.giftImageContainer}>
                <FastImage
                  source={item.image}
                  style={styles.giftImage}
                  resizeMode={FastImage.resizeMode.contain}
                />
              </View>
              <Text variant="body2" weight="regular" style={styles.giftBrand}>
                {item.brand}
              </Text>
              <Text
                variant="body1"
                weight="semiBold"
                style={styles.giftName}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {item.name}
              </Text>
              <View style={[styles.dDayBaseContainer, dDayContainerStyle]}>
                <Text variant="body2" weight="bold" style={[styles.dDayBaseText, dDayTextStyle]}>
                  {dDayDisplay}
                </Text>
              </View>
            </View>
          </Shadow>
        </View>
      </TouchableOpacity>
    );
  };

  const renderCarouselItem = ({ item, index }) => {
    if (item.type === 'sharebox') {
      return (
        <Animated.View style={styles.carouselCard}>
          <TouchableOpacity onPress={item.onPress} style={{ width: '100%', height: '100%' }}>
            <View style={[styles.giftMessageCard, { backgroundColor: '#F0ECFF' }]}>
              <View style={styles.giftMessageTextContainerSharebox}>
                <Text variant="h3" weight="bold" style={styles.giftMessageTitle}>
                  {item.title}
                </Text>
              </View>
              <View style={styles.giftMessageImageContainer}>
                <FastImage
                  source={item.image}
                  style={styles.giftMessageImage1}
                  resizeMode={FastImage.resizeMode.contain}
                />
              </View>
              <View style={styles.carouselPaginationOverlay}>
                <Text variant="caption" weight="regular" style={styles.paginationText}>
                  {activeIndex + 1} / {CAROUSEL_CARDS.length}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        </Animated.View>
      );
    } else if (item.type === 'radar') {
      return (
        <Animated.View style={styles.carouselCard}>
          <TouchableOpacity onPress={item.onPress} style={{ width: '100%', height: '100%' }}>
            <View style={[styles.giftMessageCard, { backgroundColor: '#FDF3E3' }]}>
              <View style={styles.giftMessageTextContainerRadar}>
                <Text variant="h3" weight="bold" style={styles.giftMessageTitle}>
                  {item.title}
                </Text>
              </View>
              <View style={styles.giftMessageImageContainer}>
                <FastImage
                  source={item.image}
                  style={styles.giftMessageImage2}
                  resizeMode={FastImage.resizeMode.contain}
                />
              </View>
              <View style={styles.carouselPaginationOverlay}>
                <Text variant="caption" weight="regular" style={styles.paginationText}>
                  {activeIndex + 1} / {CAROUSEL_CARDS.length}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        </Animated.View>
      );
    } else if (item.type === 'gift') {
      return (
        <Animated.View style={styles.carouselCard}>
          <TouchableOpacity onPress={item.onPress} style={{ width: '100%', height: '100%' }}>
            <View style={styles.giftMessageCard}>
              <View style={styles.giftMessageTextContainer}>
                <Text variant="h3" weight="bold" style={styles.giftMessageTitle}>
                  {item.title}
                </Text>
                <Text variant="body1" weight="regular" style={styles.giftMessageSubtitle}>
                  {item.subtitle}
                </Text>
              </View>
              <View style={styles.giftMessageImageContainer}>
                <FastImage
                  source={item.image}
                  style={styles.giftMessageImage}
                  resizeMode={FastImage.resizeMode.contain}
                />
              </View>
              <View style={styles.carouselPaginationOverlay}>
                <Text variant="caption" weight="regular" style={styles.paginationText}>
                  {activeIndex + 1} / {CAROUSEL_CARDS.length}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        </Animated.View>
      );
    }
    return null;
  };

  const renderExpiringGifticonSection = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      );
    }

    if (expiringGifticons.length === 0) {
      return (
        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
          <View style={styles.emptyGifticonCard}>
            <Text style={styles.emptyGifticonCardText}>
              아직 등록한 기프티콘이 없어요. {'\n'}등록하러 가볼까요?
            </Text>
          </View>
        </TouchableOpacity>
      );
    }

    return (
      <FlatList
        data={expiringGifticons}
        renderItem={renderGiftItem}
        keyExtractor={item => item.id.toString()}
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.giftListContent}
      />
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
      >
        <View style={styles.welcomeSection}>
          <Text variant="h3" weight="bold" style={styles.welcomeText}>
            어서오세요!{' '}
            <Text variant="h3" weight="bold" color="primary" style={null}>
              {nickname || '아차차'}
            </Text>{' '}
            님,{'\n'}당신을 위한 기프티콘이 기다려요.
          </Text>
        </View>

        <View style={styles.carouselSection}>
          <Carousel
            ref={carouselRef}
            width={screenWidth - 30}
            height={130}
            data={CAROUSEL_CARDS}
            renderItem={renderCarouselItem}
            onSnapToItem={setActiveIndex}
            loop
            autoPlay={true}
            autoPlayInterval={4000}
            style={{ borderRadius: 15, overflow: 'hidden' }}
            defaultIndex={0}
            enabled={true}
            snapEnabled
            pagingEnabled
            mode="default"
            modeConfig={{
              snapDirection: 'left',
              stackInterval: 0,
              moveSize: undefined,
            }}
            panGestureHandlerProps={{
              activeOffsetX: [-10, 10],
            }}
            withAnimation={{
              type: 'timing',
              config: {
                duration: 600,
              },
            }}
          />
        </View>

        <View style={styles.giftListContainer}>{renderExpiringGifticonSection()}</View>

        <View style={styles.bottomCardSection}>
          <TouchableOpacity onPress={() => NavigationService.navigate('TabMap')}>
            <View style={styles.mapMessageCard}>
              <View style={styles.mapBackgroundImage}>
                <FastImage
                  source={require('../assets/images/map.png')}
                  style={styles.mapBackgroundImageStyle}
                  resizeMode={FastImage.resizeMode.cover}
                />
                <View style={styles.mapOverlay}>
                  <View style={styles.mapMessageTextContainer}>
                    <View style={styles.mapTitleContainer}>
                      <FastImage
                        source={require('../assets/images/map_marker.png')}
                        style={styles.mapMarkerImage}
                        resizeMode={FastImage.resizeMode.contain}
                      />
                      <Text variant="h3" weight="semiBold" style={styles.mapMessageTitle}>
                        MAP
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomWatchSection}>
          <TouchableOpacity onPress={() => NavigationService.navigate('WatchGuideScreen')}>
            <View style={styles.watchMessageCard}>
              <View style={styles.watchMessageTextContainer}>
                <View style={styles.watchTitleContainer} />
                <Text variant="h4" weight="semiBold" style={styles.watchMessageTitle}>
                  스마트 워치가 있으신가요?
                </Text>
                <Text variant="body2" weight="regular" style={styles.watchMessageSubtitle}>
                  워치 활용 가이드 보러가기 →
                </Text>
              </View>
              <View style={styles.watchGuideImageContainer}>
                <FastImage
                  source={require('../assets/images/watch_guide.png')}
                  style={styles.watchGuideImage}
                  resizeMode={FastImage.resizeMode.contain}
                />
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default HomeScreen;
