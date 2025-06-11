import React from 'react';
import { StyleSheet, View, SafeAreaView, TouchableOpacity } from 'react-native';
import FastImage from 'react-native-fast-image';
import { Text, Divider } from '../components/ui';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from 'react-native-elements';

const LoginScreen = () => {
  const { authState, signInWithKakao } = useAuth();
  const { theme } = useTheme();

  const isLoading = authState === 'loading';

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <View style={styles.mainContainer}>
            {/* 로고 영역
            <View style={styles.logoContainer}>
              <FastImage
                source={require('../assets/images/splash_icon.png')}
                style={styles.logo}
                resizeMode={FastImage.resizeMode.contain}
              />
            </View> */}

            {/* 텍스트 영역 */}
            <View style={styles.textContainer}>
              <View style={styles.mainTextContainer}>
                <Text variant="h1" weight="bold" center color="primary" style={styles.brandText}>
                  아차차
                </Text>
                <Text variant="h1" weight="bold" center style={styles.mainText}>
                  {' 하나로 쉽고 편하게'}
                </Text>
              </View>
              <Text variant="h4" weight="semibold" center style={styles.subText}>
                기프티콘 관리부터 나눔까지,
              </Text>
              <Text variant="h4" weight="semibold" center style={styles.subText}>
                지금 바로 시작해보세요!
              </Text>
            </View>

            {/* 구분선 */}
            <Divider style={styles.divider} />

            {/* 버튼 영역 */}
            <View style={styles.buttonContainer}>
              {/* 카카오톡 로그인 버튼 */}
              <TouchableOpacity
                onPress={signInWithKakao}
                disabled={isLoading}
                style={[
                  styles.button,
                  { backgroundColor: theme.colors.loginYellow },
                  isLoading && styles.disabledButton,
                ]}
                activeOpacity={0.7}
              >
                <View style={styles.buttonContentContainer}>
                  <FastImage
                    source={require('../assets/images/login_kakaotalk.png')}
                    style={styles.buttonIcon}
                    resizeMode={FastImage.resizeMode.contain}
                  />
                  <Text
                    variant="button"
                    weight="bold"
                    size={18}
                    color={theme.colors.textBrown}
                    style={styles.loginText}
                  >
                    카카오톡 로그인
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 25,
    justifyContent: 'center',
  },
  mainContainer: {
    alignItems: 'center',
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  mainTextContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  subText: {
    marginBottom: 3,
    fontFamily: 'Pretendard-Regular',
  },
  divider: {
    width: '40%',
    marginBottom: 30,
    marginTop: 20,
  },
  buttonContainer: {
    width: '100%',
    marginTop: 0,
  },
  button: {
    width: '100%',
    height: 65,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonContentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonIcon: {
    width: 25,
    height: 25,
    marginRight: 15,
  },
  disabledButton: {
    opacity: 0.6,
  },
  loginText: {
    fontFamily: 'Pretendard-SemiBold',
  },
});

export default LoginScreen;
