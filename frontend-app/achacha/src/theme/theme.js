// React Native Elements 테마 설정
import { fontConfig, typography } from './fonts';

const theme = {
  colors: {
    // 메인 색상
    primary: '#56AEE9',
    // 강조 색상
    secondary: '#278CCC',
    // 백그라운드
    tertiary: '#A7DAF9',
    // 배경 색상
    background: '#FAFAFA',
    // 텍스트 색상
    black: '#000000',
    white: '#FFFFFF',
    textBrown: '#462000',
    // 카드 색상
    cardOrange: '#FF9500',
    cardGreen: '#0DBA3F',
    cardPurple: '#AF52DE',
    cardBlue: '#007AFF',
    cardTeal: '#30B0C7',
    cardPink: '#FF2DC3',
    // 로그인 버튼 색상
    loginYellow: '#FFEB00',
    loginRed: '#EF4040',
    // 하단 탭 및 보더 색상
    grey0: '#f9f9f9',
    grey1: '#e0e0e0',
    grey2: '#cccccc',
    grey3: '#718096', // border 색상
    grey4: '#999999',
    grey5: '#737373',
    greyOutline: '#718096', // border 색상과 동일
    // 기본 색상
    success: '#56AEE9',
    warning: '#EA5455',
    error: '#EA5455',
    disabled: '#cccccc',
  },
  // 폰트 설정 추가
  fonts: fontConfig,
  typography: typography,
  Button: {
    raised: true,
    buttonStyle: {
      borderRadius: 10,
    },
  },
  // 기존의 Text 주석을 풀고 수정
  Text: {
    style: {
      fontFamily: fontConfig.fontWeight.regular,
      color: '#000000',
    },
    h1Style: {
      fontFamily: fontConfig.fontWeight.bold,
      fontSize: 28,
      lineHeight: 36,
    },
    h2Style: {
      fontFamily: fontConfig.fontWeight.bold,
      fontSize: 24,
      lineHeight: 32,
    },
    h3Style: {
      fontFamily: fontConfig.fontWeight.semiBold,
      fontSize: 20,
      lineHeight: 28,
    },
    h4Style: {
      fontFamily: fontConfig.fontWeight.semiBold,
      fontSize: 18,
      lineHeight: 26,
    },
  },
  Card: {
    containerStyle: {
      borderRadius: 10,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
      marginBottom: 15,
    },
    wrapperStyle: {
      padding: 12,
    },
    titleStyle: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 8,
      color: '#000000',
    },
    dividerStyle: {
      marginVertical: 8,
    },
    featuredTitleStyle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: '#FFFFFF',
      marginBottom: 5,
      textShadowColor: 'rgba(0, 0, 0, 0.75)',
      textShadowOffset: { width: -1, height: 1 },
      textShadowRadius: 5,
    },
    featuredSubtitleStyle: {
      fontSize: 14,
      color: '#FFFFFF',
      textShadowColor: 'rgba(0, 0, 0, 0.75)',
      textShadowOffset: { width: -1, height: 1 },
      textShadowRadius: 5,
    },
    imageStyle: {
      borderTopLeftRadius: 10,
      borderTopRightRadius: 10,
    },
  },
  Input: {
    inputContainerStyle: {
      borderBottomWidth: 1,
      borderColor: '#718096',
    },
  },
  Badge: {
    badgeStyle: {
      borderRadius: 5,
    },
  },
  Avatar: {
    rounded: true,
  },
  Icon: {
    type: 'material',
    size: 24,
    color: '#56AEE9',
  },
  ListItem: {
    containerStyle: {
      borderBottomWidth: 1,
      borderColor: '#718096',
      paddingVertical: 12,
    },
    contentContainerStyle: {
      marginLeft: 10,
    },
    titleStyle: {
      fontSize: 16,
      color: '#000000',
      fontWeight: '500',
    },
    subtitleStyle: {
      fontSize: 14,
      color: '#737373',
    },
    chevronStyle: {
      color: '#56AEE9',
    },
    checkmarkStyle: {
      color: '#56AEE9',
    },
    buttonGroupContainerStyle: {
      borderRadius: 8,
    },
    accordionStyle: {
      backgroundColor: '#f9f9f9',
    },
    swipeableContainerStyle: {
      borderRadius: 0,
    },
    inputStyle: {
      fontSize: 14,
    },
  },
  Divider: {
    style: {
      backgroundColor: '#718096',
      opacity: 0.3,
    },
  },
  SearchBar: {
    containerStyle: {
      backgroundColor: 'transparent',
      borderBottomWidth: 0,
      borderTopWidth: 0,
    },
    inputContainerStyle: {
      backgroundColor: '#f9f9f9',
      borderRadius: 10,
    },
  },
  Chip: {
    buttonStyle: {
      backgroundColor: '#f9f9f9',
      borderRadius: 25,
      borderWidth: 1,
      borderColor: '#e0e0e0',
      paddingVertical: 6,
      paddingHorizontal: 12,
    },
    titleStyle: {
      fontSize: 14,
      color: '#000000',
    },
    containerStyle: {
      marginRight: 8,
      marginBottom: 8,
    },
    iconStyle: {
      marginRight: 4,
    },
  },
  CheckBox: {
    containerStyle: {
      backgroundColor: 'transparent',
      borderWidth: 0,
      padding: 8,
      paddingLeft: 0,
      marginLeft: 0,
      marginRight: 0,
    },
    textStyle: {
      fontWeight: '400',
      fontSize: 14,
      color: '#000000',
    },
    checkedColor: '#56AEE9',
    uncheckedColor: '#718096',
    iconType: 'material',
    checkedIcon: 'check-box',
    uncheckedIcon: 'check-box-outline-blank',
    size: 24,
  },
};

export default theme;
