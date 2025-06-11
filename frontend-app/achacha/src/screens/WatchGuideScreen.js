/* eslint-disable react-native/no-inline-styles */
import React, { useCallback } from 'react';
import {
  StyleSheet,
  StatusBar,
  View,
  ScrollView,
  Image,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { Icon, useTheme } from 'react-native-elements';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Text } from '../components/ui';
import { Shadow } from 'react-native-shadow-2';
import LottieView from 'lottie-react-native';

const { width } = Dimensions.get('window');

// 로티 애니메이션 파일을 미리 변수에 저장
const alertAnimation = require('../assets/lottie/alert_animation.json');

const WatchGuideScreen = () => {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  // const [isConnected, setIsConnected] = useState(false); // 워치 연결 상태

  // 뒤로가기 처리
  const handleGoBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  // 워치 연동 시작하기 버튼 처리
  const handleStartWatchConnection = useCallback(() => {
    // Settings 화면으로 이동 (SettingScreen이 아닌 Settings로 수정)
    navigation.navigate('Settings');
  }, [navigation]);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />

      {/* 안전 영역 고려한 상단 여백 */}
      <View style={{ height: insets.top, backgroundColor: theme.colors.background }} />

      {/* 커스텀 헤더 */}
      <View style={[styles.header, { backgroundColor: theme.colors.background }]}>
        <Button
          variant="ghost"
          onPress={handleGoBack}
          style={styles.backButton}
          leftIcon={
            <Icon name="arrow-back-ios" type="material" size={22} color={theme.colors.black} />
          }
        />
        <Text variant="h3" style={styles.headerTitle}>
          워치 활용 가이드
        </Text>
        <View style={styles.emptyRightSpace} />
      </View>

      {/* 메인 콘텐츠 */}
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* 상단 타이틀 및 소개 */}
        <View style={styles.introSection}>
          <Text variant="h2" weight="bold" style={styles.mainTitle}>
            스마트워치에서도,{'\n'}기프티콘은 자유롭게
          </Text>
          <Text variant="body1" style={styles.subText}>
            폰 없이도 확인하고, 선물하고, 관리하세요.{'\n'}당신의 손목에서 기프티콘을 간편하게.{' '}
          </Text>
          <Image
            source={require('../assets/images/watch.png')}
            style={styles.mainImage}
            resizeMode="contain"
          />
        </View>

        {/* 1. 스마트 연동 시작하기 */}
        {/* <Shadow distance={5} startColor={'rgba(0, 0, 0, 0.03)'} style={styles.cardShadow}>
          <View style={styles.featureCard}>
            <View style={styles.featureIconContainer}>
              <Icon
                name="watch"
                type="material"
                size={24}
                color={theme.colors.white}
                containerStyle={[styles.iconBackground, { backgroundColor: theme.colors.primary }]}
              />
            </View>
            <Text variant="h4" weight="semiBold" style={styles.featureTitle}>
              스마트 연동 시작하기
            </Text>
            <Text variant="body2" style={styles.featureDescription}>
              스마트폰과 워치를 자동으로 연동해요. Nearby API로 가까이 있을 때 자동 연결됩니다.
            </Text>

            {/* 연결 상태 표시
            <View style={styles.connectionStatusContainer}>
              <View
                style={[
                  styles.statusIndicator,
                  { backgroundColor: isConnected ? '#4CAF50' : '#FFA000' },
                ]}
              />
              <Text variant="body2" weight="semiBold" style={styles.statusText}>
                {isConnected ? '연결됨' : '연결 필요'}
              </Text>
            </View> */}
        {/* </View>
        </Shadow> */}

        {/* 2. 기프티콘 관리 기능 */}
        <Shadow distance={5} startColor={'rgba(0, 0, 0, 0.03)'} style={styles.cardShadow}>
          <View style={styles.featureCard}>
            <View style={styles.featureHeader}>
              <View style={styles.featureIconContainer}>
                <Icon
                  name="card-giftcard"
                  type="material"
                  size={24}
                  color={theme.colors.white}
                  containerStyle={[styles.iconBackground, { backgroundColor: '#F1A9D5' }]}
                />
              </View>
              <Text variant="h4" weight="semiBold" style={styles.featureTitle}>
                기프티콘 관리 기능
              </Text>
            </View>

            {/* 사용 가능한 목록 */}
            <View style={styles.subFeatureContainer}>
              <View style={styles.subFeatureHeader}>
                <Icon
                  name="check-circle"
                  type="material"
                  size={18}
                  color={'#4CAF50'}
                  containerStyle={{ marginRight: 8 }}
                />
                <Text variant="subtitle1" weight="semiBold">
                  기프티콘 조회
                </Text>
              </View>
              <Text variant="body2" style={styles.subFeatureDescription}>
                워치에서 바로 사용 가능한 기프티콘 확인
              </Text>
            </View>

            {/* 기프티콘 상세 */}
            <View style={styles.subFeatureContainer}>
              <View style={styles.subFeatureHeader}>
                <Icon
                  name="search"
                  type="material"
                  size={18}
                  color={'#2196F3'}
                  containerStyle={{ marginRight: 8 }}
                />
                <Text variant="subtitle1" weight="semiBold">
                  기프티콘 상세
                </Text>
              </View>
              <Text variant="body2" style={styles.subFeatureDescription}>
                상품명, 유효기간 및 바코드
              </Text>
              <Text variant="body2" style={styles.subFeatureDescription}>
                최대 밝기로 조정해 바코드를 또렷하게!
              </Text>
            </View>

            {/* 상품형 기프티콘 */}
            <View style={styles.giftTypeContainer}>
              <Text variant="subtitle1" weight="semiBold" style={styles.giftTypeTitle}>
                📦 상품형 기프티콘
              </Text>
              <View style={styles.giftTypeFeatureList}>
                <View style={styles.giftTypeFeature}>
                  <Icon name="check" type="material" size={16} color="#555" />
                  <Text variant="body2" style={styles.giftTypeFeatureText}>
                    사용 처리: 터치 한 번으로 사용 완료
                  </Text>
                </View>
                <View style={styles.giftTypeFeature}>
                  <Icon name="share" type="material" size={16} color="#555" />
                  <Text variant="body2" style={styles.giftTypeFeatureText}>
                    뿌리기: 근처 사용자 탐색 후 랜덤 전송
                  </Text>
                </View>
              </View>
            </View>

            {/* 금액형 기프티콘 */}
            <View style={styles.giftTypeContainer}>
              <Text variant="subtitle1" weight="semiBold" style={styles.giftTypeTitle}>
                💰 금액형 기프티콘
              </Text>
              <View style={styles.giftTypeFeatureList}>
                <View style={styles.giftTypeFeature}>
                  <Icon name="payments" type="material" size={16} color="#555" />
                  <Text variant="body2" style={styles.giftTypeFeatureText}>
                    사용 금액 입력: 입력 후 잔액 자동 계산
                  </Text>
                </View>
                <View style={styles.giftTypeFeature}>
                  <Icon name="done-all" type="material" size={16} color="#555" />
                  <Text variant="body2" style={styles.giftTypeFeatureText}>
                    잔액이 0원이 되면, 자동 완료 처리
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </Shadow>

        {/* 3. 알림함 기능 */}
        <Shadow distance={5} startColor={'rgba(0, 0, 0, 0.03)'} style={styles.cardShadow}>
          <View style={styles.featureCard}>
            <View style={styles.featureHeader}>
              <View style={styles.featureIconContainer}>
                <Icon
                  name="notifications"
                  type="material"
                  size={24}
                  color={theme.colors.white}
                  containerStyle={[styles.iconBackground, { backgroundColor: '#D095EE' }]}
                />
              </View>
              <Text variant="h4" weight="semiBold" style={styles.featureTitle}>
                알림함 기능
              </Text>
            </View>
            <Text variant="body2" style={styles.featureDescription}>
              중요 알림은 놓치지 않도록 워치에서 바로!
            </Text>

            <View style={styles.animationContainer}>
              <LottieView source={alertAnimation} autoPlay loop style={styles.lottieAnimation} />
            </View>
          </View>
        </Shadow>

        {/* 하단 여백 */}
        <View style={{ height: 80 }} />
      </ScrollView>

      {/* 하단 버튼 */}
      <View style={[styles.bottomButtonContainer, { paddingBottom: insets.bottom + 10 }]}>
        <TouchableOpacity
          onPress={handleStartWatchConnection}
          style={{
            width: '100%',
            borderRadius: 8,
            height: 56,
            backgroundColor: '#56AEE9',
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'row',
          }}
        >
          <Text
            style={{
              color: '#FFFFFF',
              fontSize: 16,
              fontWeight: 'semibold',
            }}
          >
            워치 연동하러 가기
          </Text>
        </TouchableOpacity>
      </View>
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
  backButton: {
    padding: 0,
    backgroundColor: 'transparent',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  emptyRightSpace: {
    width: 48,
    height: 48,
  },
  scrollContainer: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  introSection: {
    marginBottom: 30,
    alignItems: 'flex-start',
  },
  mainTitle: {
    fontSize: 26,
    lineHeight: 36,
    marginBottom: 10,
  },
  subText: {
    lineHeight: 24,
    marginBottom: 20,
    color: '#737373',
  },
  mainImage: {
    width: width - 50,
    height: 150,
    alignSelf: 'center',
    marginTop: 5,
  },
  cardShadow: {
    width: '100%',
    marginBottom: 20,
    borderRadius: 16,
  },
  featureCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
  },
  featureHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  featureIconContainer: {
    marginRight: 12,
    marginBottom: 0,
  },
  iconBackground: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureTitle: {
    marginBottom: 0,
  },
  featureDescription: {
    paddingHorizontal: 8,
    color: '#737373',
    marginBottom: 5,
    lineHeight: 20,
  },
  subFeatureContainer: {
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  subFeatureHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  subFeatureDescription: {
    marginLeft: 26,
    color: '#737373',
    lineHeight: 20,
  },
  giftTypeContainer: {
    marginTop: 10,
    marginBottom: 5,
    backgroundColor: '#F8F8F8',
    padding: 14,
    borderRadius: 12,
  },
  giftTypeTitle: {
    marginBottom: 12,
  },
  giftTypeFeatureList: {
    gap: 2,
    paddingHorizontal: 5,
  },
  giftTypeFeature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  giftTypeFeatureText: {
    flex: 1,
    color: '#737373',
    lineHeight: 20,
  },
  animationContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    height: 160,
  },
  lottieAnimation: {
    width: 220,
    height: 220,
  },
  bottomButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    paddingTop: 10,
    paddingHorizontal: 20,
  },
  buttonContainer: {
    width: '100%',
    height: 56,
  },
  startButton: {
    borderRadius: 12,
    paddingVertical: 15,
    height: 56,
  },
  buttonTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default WatchGuideScreen;
