import React from 'react';
import { Badge as RNEBadge } from 'react-native-elements';
import { StyleSheet } from 'react-native';
import { useTheme } from 'react-native-elements';

/**
 * 뱃지 컴포넌트
 */
export const Badge = ({
  value,
  status = 'primary', // primary, success, warning, error, info
  variant = 'solid', // solid, outline
  size = 'md', // sm, md, lg
  containerStyle,
  textStyle,
  ...props
}) => {
  const { theme } = useTheme();

  // 변형과 상태에 따른 배경 및 텍스트 색상 설정
  const getStatusColor = () => {
    return theme.colors[status] || theme.colors.primary;
  };

  // 사이즈에 따른 스타일 설정
  const getSizeStyle = () => {
    const sizeStyles = {
      sm: {
        height: 18,
        minWidth: 18,
        borderRadius: 9,
        fontSize: 10,
      },
      md: {
        height: 20,
        minWidth: 20,
        borderRadius: 10,
        fontSize: 12,
      },
      lg: {
        height: 24,
        minWidth: 24,
        borderRadius: 12,
        fontSize: 14,
      },
    };

    return sizeStyles[size] || sizeStyles.md;
  };

  const badgeColor = getStatusColor();
  const sizeStyle = getSizeStyle();

  const badgeStyles = {
    backgroundColor: variant === 'outline' ? 'transparent' : badgeColor,
    borderColor: badgeColor,
    borderWidth: variant === 'outline' ? 1 : 0,
    height: sizeStyle.height,
    minWidth: sizeStyle.minWidth,
    borderRadius: sizeStyle.borderRadius,
  };

  const textStyles = {
    color: variant === 'outline' ? badgeColor : theme.colors.white,
    fontSize: sizeStyle.fontSize,
  };

  return (
    <RNEBadge
      value={value}
      badgeStyle={[styles.badge, badgeStyles, containerStyle]}
      textStyle={[styles.text, textStyles, textStyle]}
      {...props}
    />
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 0,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default Badge;
