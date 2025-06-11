import 'dotenv/config';

export default {
  expo: {
    name: 'achacha_app',
    slug: 'achacha_app',
    scheme: 'com.koup28.achacha_app',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'light',
    newArchEnabled: true,
    splash: {
      image: './assets/splash_icon.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff',
    },
    ios: {
      supportsTablet: true,
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/adaptive_icon.png',
        backgroundColor: '#ffffff',
      },
      package: 'com.koup28.achacha_app',
      permissions: ['ACCESS_COARSE_LOCATION', 'ACCESS_FINE_LOCATION', 'ACCESS_BACKGROUND_LOCATION'],
    },
    web: {
      favicon: './assets/favicon.png',
    },
    plugins: [
      [
        '@react-native-seoul/kakao-login',
        {
          kakaoAppKey: process.env.KAKAO_APP_KEY,
          customScheme: `kakao${process.env.KAKAO_APP_KEY}`,
        },
      ],
      [
        'expo-build-properties',
        {
          android: {
            extraMavenRepos: ['https://devrepo.kakao.com/nexus/content/groups/public/'],
          },
        },
      ],
    ],
    extra: {
      kakaoAppKey: process.env.KAKAO_APP_KEY,
    },
  },
};
