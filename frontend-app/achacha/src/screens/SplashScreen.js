import React, { useEffect, useState } from 'react';
import { StatusBar, StyleSheet, View, SafeAreaView } from 'react-native';
import FastImage from 'react-native-fast-image';
import { CommonActions } from '@react-navigation/native';
import { useTheme } from 'react-native-elements';
import AsyncStorage from '@react-native-async-storage/async-storage';
// import { checkIsFirstLaunch } from '../utils/appStorage'; // Temporarily disable first launch check

const SPLASH_DURATION = 2000;

const SplashScreenComponent = ({ navigation }) => {
  // const [isLoadingStorage, setIsLoadingStorage] = useState(true); // No longer needed for testing
  const [isFirstLaunch, setIsFirstLaunch] = useState(null);
  const [timePassed, setTimePassed] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    let timer = null;

    // 앱 실행 시 로그인 상태 및 온보딩 여부 확인
    const checkAuthAndLaunch = async () => {
      try {
        // 1. 로그인 상태 확인
        const accessToken = await AsyncStorage.getItem('accessToken');
        if (accessToken) {
          // 로그인 되어 있으면 바로 Main(홈)으로 이동
          navigation.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [{ name: 'Main' }],
            })
          );
          return;
        }
        // 2. 온보딩(가이드) 여부 확인
        // import { checkIsFirstLaunch } from '../utils/appStorage';
        // const firstLaunch = await checkIsFirstLaunch();
        // setIsFirstLaunch(firstLaunch);
        // timer = setTimeout(() => setTimePassed(true), SPLASH_DURATION);
        // (아래는 기존 테스트용 코드)
        setIsFirstLaunch(true); // 실제 배포 시 위 주석 해제 필요
        timer = setTimeout(() => setTimePassed(true), SPLASH_DURATION);
      } catch (e) {
        setIsFirstLaunch(true);
        timer = setTimeout(() => setTimePassed(true), SPLASH_DURATION);
      }
    };
    checkAuthAndLaunch();

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [navigation]);

  useEffect(() => {
    if (timePassed && isFirstLaunch !== null) {
      const nextRoute = isFirstLaunch ? 'GuideFirst' : 'Permission';
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: nextRoute }],
        })
      );
    }
  }, [timePassed, isFirstLaunch, navigation]);

  // Always show logo (no loading indicator needed as check is bypassed)
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
      <SafeAreaView style={styles.safeAreaContainer}>
        <View style={styles.centerContainer}>
          <View style={styles.imageContainer}>
            <FastImage
              source={require('../assets/images/splash_icon.png')}
              style={styles.image}
              resizeMode={FastImage.resizeMode.contain}
            />
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
  safeAreaContainer: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  imageContainer: {
    alignItems: 'center',
  },
  image: {
    width: 200,
    height: 100,
  },
});

export default SplashScreenComponent;
