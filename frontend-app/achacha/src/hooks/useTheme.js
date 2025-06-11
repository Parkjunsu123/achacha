import { useTheme as useRNETheme } from 'react-native-elements';
import defaultTheme from '../theme/theme';
import { cardUtils, listItemUtils, chipUtils, checkboxUtils } from '../theme/themeUtils';

/**
 * 테마 설정과 관련된 커스텀 훅
 * react-native-elements의 useTheme 훅을 래핑하여 기본 테마를 제공합니다.
 *
 * @returns {Object} theme 객체와 편리한 접근 메서드들을 포함하는 객체
 */
export const useTheme = () => {
  const { theme = defaultTheme } = useRNETheme();

  return {
    theme,
    colors: theme.colors,

    // 색상 유틸리티 함수들
    getColor: colorName => {
      return theme.colors[colorName] || theme.colors.primary;
    },

    // 폰트 유틸리티 함수들
    getFontFamily: weight => {
      return theme.fonts.fontWeight[weight] || theme.fonts.fontWeight.regular;
    },

    getTypography: variant => {
      return theme.typography[variant] || theme.typography.body1;
    },

    // 스타일 유틸리티 함수들
    getTextStyle: (variant = 'body') => {
      switch (variant) {
        case 'h1':
          return theme.Text.h1Style;
        case 'h2':
          return theme.Text.h2Style;
        case 'h3':
          return theme.Text.h3Style;
        case 'h4':
          return theme.Text.h4Style;
        case 'body':
        default:
          return theme.Text.style;
      }
    },

    // 기타 테마 관련 유틸리티 함수들
    getSpacing: (size = 1) => {
      const baseSpacing = 8;
      return baseSpacing * size;
    },

    // 반응형 디자인을 위한 유틸리티
    breakpoints: {
      xs: 0,
      sm: 576,
      md: 768,
      lg: 992,
      xl: 1200,
    },

    // Card 관련 유틸리티 함수들
    card: {
      getVariantStyle: variant => cardUtils.getCardVariantStyle(theme, variant),
      getStyles: () => cardUtils.getCardStyles(),
    },

    // ListItem 관련 유틸리티 함수들
    listItem: {
      getVariantStyle: variant => listItemUtils.getListItemVariantStyle(theme, variant),
      getStyles: () => listItemUtils.getListItemStyles(),
    },

    // Chip 관련 유틸리티 함수들
    chip: {
      getVariantStyle: (variant, color) => chipUtils.getChipVariantStyle(theme, variant, color),
      getStyles: () => chipUtils.getChipStyles(),
    },

    // CheckBox 관련 유틸리티 함수들
    checkbox: {
      getVariantStyle: (variant, size) => checkboxUtils.getVariantStyle(variant, size),
      getStyles: () => checkboxUtils.getStyles(),
    },
  };
};

export default useTheme;
