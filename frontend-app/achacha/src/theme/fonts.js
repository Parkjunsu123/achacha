// 폰트 패밀리 및 웨이트 정의
const fontConfig = {
  fontFamily: {
    pretendard: 'Pretendard',
  },
  fontWeight: {
    thin: 'Pretendard-Thin',
    extraLight: 'Pretendard-ExtraLight',
    light: 'Pretendard-Light',
    regular: 'Pretendard-Regular',
    medium: 'Pretendard-Medium',
    semiBold: 'Pretendard-SemiBold',
    bold: 'Pretendard-Bold',
    extraBold: 'Pretendard-ExtraBold',
    black: 'Pretendard-Black',
  },
};

// 타이포그래피 스타일 정의
const typography = {
  // 헤더 스타일
  h1: {
    fontFamily: fontConfig.fontWeight.bold,
    fontSize: 28,
    lineHeight: 36,
  },
  h2: {
    fontFamily: fontConfig.fontWeight.bold,
    fontSize: 24,
    lineHeight: 32,
  },
  h3: {
    fontFamily: fontConfig.fontWeight.semiBold,
    fontSize: 20,
    lineHeight: 28,
  },
  h4: {
    fontFamily: fontConfig.fontWeight.semiBold,
    fontSize: 18,
    lineHeight: 26,
  },
  h5: {
    fontFamily: fontConfig.fontWeight.medium,
    fontSize: 16,
    lineHeight: 24,
  },
  // 본문 스타일
  body1: {
    fontFamily: fontConfig.fontWeight.regular,
    fontSize: 16,
    lineHeight: 24,
  },
  body2: {
    fontFamily: fontConfig.fontWeight.regular,
    fontSize: 14,
    lineHeight: 22,
  },
  // 부가 스타일
  caption: {
    fontFamily: fontConfig.fontWeight.regular,
    fontSize: 12,
    lineHeight: 18,
  },
  button: {
    fontFamily: fontConfig.fontWeight.medium,
    fontSize: 16,
    lineHeight: 24,
  },
  subtitle1: {
    fontFamily: fontConfig.fontWeight.medium,
    fontSize: 16,
    lineHeight: 24,
  },
  subtitle2: {
    fontFamily: fontConfig.fontWeight.medium,
    fontSize: 14,
    lineHeight: 22,
  },
};

export { fontConfig, typography };

export default {
  fontConfig,
  typography,
};
