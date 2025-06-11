// 테마 관련 유틸리티 함수 모음
import { StyleSheet } from 'react-native';

/**
 * 버튼 스타일 관련 유틸리티 함수
 */
export const buttonUtils = {
  getBackgroundColor: (theme, variant, isDisabled) => {
    if (isDisabled) return theme.colors.disabled;

    switch (variant) {
      case 'primary':
        return theme.colors.primary;
      case 'secondary':
        return theme.colors.secondary;
      case 'outline':
      case 'ghost':
      case 'link':
      case 'custom':
        return 'transparent';
      default:
        return 'transparent';
    }
  },

  getTextColor: (theme, variant, isDisabled) => {
    if (isDisabled) return theme.colors.grey4;

    switch (variant) {
      case 'primary':
      case 'secondary':
        return theme.colors.white;
      case 'custom':
        return null;
      case 'outline':
      case 'ghost':
      case 'link':
      default:
        return theme.colors.primary;
    }
  },

  getBorderColor: (theme, variant, isDisabled) => {
    if (isDisabled) return 'transparent';
    return variant === 'outline' ? theme.colors.primary : 'transparent';
  },

  getButtonStyles: () =>
    StyleSheet.create({
      button: {
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 0,
      },
      contentContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
      },
      // 텍스트 스타일
      text: {
        textAlign: 'center',
      },
      // 변형 스타일
      outline: {
        borderWidth: 1,
      },
      // 크기 스타일
      smSize: {
        paddingVertical: 8,
        paddingHorizontal: 12,
      },
      mdSize: {
        paddingVertical: 10,
        paddingHorizontal: 16,
      },
      lgSize: {
        paddingVertical: 12,
        paddingHorizontal: 20,
      },
      // 텍스트 크기 스타일
      smText: {
        fontSize: 12,
      },
      mdText: {
        fontSize: 14,
      },
      lgText: {
        fontSize: 16,
      },
      // 아이콘 스타일
      iconLeft: {
        marginRight: 8,
      },
      iconRight: {
        marginLeft: 8,
      },
    }),
};

/**
 * 입력 필드 스타일 관련 유틸리티 함수
 */
export const inputUtils = {
  getContainerStyle: (theme, variant, size, isInvalid, isFocused, isDisabled) => {
    const baseStyle = {
      flexDirection: 'row',
      alignItems: 'center',
      width: '100%',
      borderWidth: 1,
    };

    // 변형에 따른 스타일
    const variantStyle = {
      outline: {
        borderRadius: 8,
      },
      filled: {
        borderRadius: 8,
      },
      underlined: {
        borderWidth: 0,
        borderBottomWidth: 1,
        borderRadius: 0,
      },
    };

    // 크기에 따른 스타일
    const sizeStyle = {
      sm: { height: 32 },
      md: { height: 40 },
      lg: { height: 48 },
    };

    return {
      ...baseStyle,
      ...variantStyle[variant],
      ...sizeStyle[size],
      borderColor: isInvalid
        ? theme.colors.error
        : isFocused
          ? theme.colors.primary
          : theme.colors.grey3,
      backgroundColor:
        variant === 'filled'
          ? theme.colors.grey0
          : isDisabled
            ? theme.colors.grey1
            : theme.colors.white,
    };
  },

  getInputStyles: () => {
    // 시스템 폰트를 사용하여 정의
    // 실제 테마의 폰트를 여기서 정의할 수 없으므로 Input.js에서 적용
    return StyleSheet.create({
      wrapper: {
        width: '100%',
        marginBottom: 16,
      },
      input: {
        flex: 1,
        paddingHorizontal: 12,
      },
      smInput: {
        fontSize: 12,
      },
      mdInput: {
        fontSize: 14,
      },
      lgInput: {
        fontSize: 16,
      },
      inputWithLeftIcon: {
        paddingLeft: 8,
      },
      inputWithRightIcon: {
        paddingRight: 8,
      },
      label: {
        marginBottom: 6,
      },
      helperText: {
        marginTop: 4,
      },
      iconContainer: {
        paddingHorizontal: 10,
        justifyContent: 'center',
        alignItems: 'center',
      },
    });
  },
};

/**
 * 스켈레톤 컴포넌트 스타일 관련 유틸리티 함수
 */
export const skeletonUtils = {
  getVariantStyle: (variant, width, height, borderRadius) => {
    switch (variant) {
      case 'circle':
        return {
          width: width || 48,
          height: height || 48,
          borderRadius: borderRadius || 24,
        };
      case 'text':
        return {
          width: width || '100%',
          height: height || 16,
          borderRadius: borderRadius || 4,
        };
      case 'rect':
      default:
        return {
          width: width || 100,
          height: height || 80,
          borderRadius: borderRadius || 4,
        };
    }
  },

  getSkeletonStyles: () =>
    StyleSheet.create({
      groupContainer: {
        width: '100%',
      },
      listItem: {
        flexDirection: 'row',
        marginBottom: 16,
        alignItems: 'center',
      },
      listContent: {
        marginLeft: 10,
        flex: 1,
      },
      card: {
        marginBottom: 16,
        borderRadius: 8,
        overflow: 'hidden',
      },
      cardContent: {
        padding: 12,
      },
      profile: {
        flexDirection: 'row',
        marginBottom: 16,
        alignItems: 'center',
      },
      profileContent: {
        marginLeft: 12,
        flex: 1,
      },
      detail: {
        width: '100%',
      },
      mt5: {
        marginTop: 5,
      },
      mt10: {
        marginTop: 10,
      },
    }),
};

/**
 * 카드 컴포넌트 스타일 관련 유틸리티 함수
 */
export const cardUtils = {
  getCardVariantStyle: (theme, variant = 'default') => {
    const baseStyle = {
      borderRadius: 10,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
      backgroundColor: theme.colors.background,
    };

    switch (variant) {
      case 'elevated':
        return {
          ...baseStyle,
          shadowOpacity: 0.2,
          shadowRadius: 6,
          elevation: 5,
        };
      case 'outlined':
        return {
          ...baseStyle,
          shadowOpacity: 0,
          shadowRadius: 0,
          elevation: 0,
          borderWidth: 1,
          borderColor: theme.colors.grey2,
        };
      case 'colored':
        return {
          ...baseStyle,
          backgroundColor: theme.colors.background,
        };
      case 'default':
      default:
        return baseStyle;
    }
  },

  getCardStyles: () =>
    StyleSheet.create({
      container: {
        marginBottom: 15,
        overflow: 'hidden',
      },
      wrapper: {
        padding: 12,
      },
      divider: {
        marginVertical: 8,
      },
      title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
      },
      featuredContainer: {
        position: 'relative',
      },
      featuredContent: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 15,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
      },
      featuredTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 5,
      },
      featuredSubtitle: {
        fontSize: 14,
        color: 'white',
      },
      image: {
        width: '100%',
        height: 200,
      },
    }),
};

/**
 * 리스트 아이템 컴포넌트 스타일 관련 유틸리티 함수
 */
export const listItemUtils = {
  getListItemVariantStyle: (theme, variant = 'default') => {
    const baseStyle = {
      borderBottomWidth: 1,
      borderColor: theme.colors.grey3,
      backgroundColor: theme.colors.background,
    };

    switch (variant) {
      case 'elevated':
        return {
          ...baseStyle,
          borderBottomWidth: 0,
          marginVertical: 4,
          marginHorizontal: 8,
          borderRadius: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.1,
          shadowRadius: 2,
          elevation: 2,
        };
      case 'outlined':
        return {
          ...baseStyle,
          borderWidth: 1,
          borderBottomWidth: 1,
          marginVertical: 4,
          borderRadius: 8,
        };
      case 'colored':
        return {
          ...baseStyle,
          backgroundColor: theme.colors.grey0,
        };
      case 'default':
      default:
        return baseStyle;
    }
  },

  getListItemStyles: () =>
    StyleSheet.create({
      container: {
        paddingVertical: 12,
        paddingHorizontal: 16,
      },
      content: {
        flex: 1,
        marginLeft: 10,
      },
      title: {
        fontSize: 16,
        fontWeight: '500',
      },
      subtitle: {
        fontSize: 14,
        color: '#737373',
        marginTop: 4,
      },
      chevron: {
        marginLeft: 8,
      },
      accordionContent: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: '#f9f9f9',
      },
      swipeableActionContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
      },
      buttonGroup: {
        marginTop: 8,
      },
      input: {
        borderBottomWidth: 0,
      },
    }),
};

/**
 * 칩 컴포넌트 스타일 관련 유틸리티 함수
 */
export const chipUtils = {
  getChipVariantStyle: (theme, variant = 'default', color) => {
    const baseStyle = {
      borderRadius: 25,
      paddingVertical: 6,
      paddingHorizontal: 12,
    };

    // 색상 처리
    let backgroundColor = theme.colors.grey0;
    let textColor = theme.colors.black;
    let borderColor = theme.colors.grey2;

    if (color && theme.colors[color]) {
      switch (variant) {
        case 'solid':
          backgroundColor = theme.colors[color];
          textColor = theme.colors.white;
          borderColor = 'transparent';
          break;
        case 'outlined':
          backgroundColor = 'transparent';
          textColor = theme.colors[color];
          borderColor = theme.colors[color];
          break;
        default:
          backgroundColor = `${theme.colors[color]}20`; // 투명도 20%
          textColor = theme.colors[color];
          borderColor = 'transparent';
      }
    } else {
      switch (variant) {
        case 'solid':
          backgroundColor = theme.colors.primary;
          textColor = theme.colors.white;
          borderColor = 'transparent';
          break;
        case 'outlined':
          backgroundColor = 'transparent';
          textColor = theme.colors.primary;
          borderColor = theme.colors.primary;
          break;
        case 'default':
        default:
          // 기본값 유지
          break;
      }
    }

    return {
      ...baseStyle,
      backgroundColor,
      borderColor,
      textColor,
      borderWidth: variant === 'outlined' ? 1 : 0,
    };
  },

  getChipStyles: () =>
    StyleSheet.create({
      container: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 8,
        marginBottom: 8,
      },
      title: {
        fontSize: 14,
      },
      icon: {
        marginRight: 4,
      },
      closeIcon: {
        marginLeft: 4,
      },
      tab: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 15,
        marginVertical: 8,
        minWidth: 80,
        justifyContent: 'center',
      },
    }),
};

/**
 * 체크박스 컴포넌트 스타일 관련 유틸리티 함수
 */
export const checkboxUtils = {
  getVariantStyle: (variant = 'default', size = 'medium') => {
    // 사이즈에 따른 스타일 설정
    const sizeMap = {
      small: 18,
      medium: 24,
      large: 32,
    };

    const iconSize = sizeMap[size] || sizeMap.medium;

    // 기본 스타일 설정
    const baseStyle = {
      size: iconSize,
      iconType: 'material',
      containerStyle: {},
    };

    // 변형에 따른 스타일 및 아이콘 설정
    switch (variant) {
      case 'square':
        return {
          ...baseStyle,
          checkedIcon: 'check-box',
          uncheckedIcon: 'check-box-outline-blank',
        };
      case 'circle':
        return {
          ...baseStyle,
          iconType: 'material-community',
          checkedIcon: 'checkbox-marked-circle',
          uncheckedIcon: 'checkbox-blank-circle-outline',
        };
      case 'default':
      default:
        return {
          ...baseStyle,
          checkedIcon: 'check-box',
          uncheckedIcon: 'check-box-outline-blank',
        };
    }
  },

  getStyles: () =>
    StyleSheet.create({
      container: {
        width: '100%',
      },
      checkboxContainer: {
        backgroundColor: 'transparent',
        borderWidth: 0,
        padding: 0,
        margin: 0,
        marginLeft: 0,
        marginRight: 0,
      },
      text: {
        fontWeight: '400',
        marginLeft: 8,
      },
      disabledContainer: {
        opacity: 0.6,
      },
    }),
};

export default {
  buttonUtils,
  inputUtils,
  skeletonUtils,
  cardUtils,
  listItemUtils,
  chipUtils,
  checkboxUtils,
};
