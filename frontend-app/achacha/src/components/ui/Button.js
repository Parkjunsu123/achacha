import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, View } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { buttonUtils } from '../../theme/themeUtils';

/**
 * 기본 버튼 컴포넌트
 */
export const Button = ({
  onPress,
  title,
  variant = 'primary', // primary, secondary, outline, ghost, link
  size = 'md', // sm, md, lg
  isDisabled = false,
  isLoading = false,
  leftIcon,
  rightIcon,
  style,
  textStyle,
  ...props
}) => {
  const { theme } = useTheme();
  const styles = buttonUtils.getButtonStyles();

  // 버튼 스타일 가져오기
  const buttonStyle = [
    styles.button,
    styles[variant],
    styles[`${size}Size`],
    isDisabled && styles.disabled,
    style,
  ];

  // 텍스트 스타일 가져오기
  const buttonTextStyle = [
    styles.text,
    styles[`${variant}Text`],
    styles[`${size}Text`],
    isDisabled && styles.disabledText,
    { fontFamily: theme.fonts.fontWeight.semiBold },
    textStyle,
  ];

  // theme utils를 사용하여 스타일 속성 가져오기
  const backgroundColor = buttonUtils.getBackgroundColor(theme, variant, isDisabled);
  const textColor = buttonUtils.getTextColor(theme, variant, isDisabled);
  const borderColor = buttonUtils.getBorderColor(theme, variant, isDisabled);

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled || isLoading}
      style={[
        buttonStyle,
        {
          backgroundColor,
          borderColor,
        },
      ]}
      activeOpacity={0.7}
      {...props}
    >
      {isLoading ? (
        <ActivityIndicator size="small" color={textColor} />
      ) : (
        <View style={styles.contentContainer}>
          {leftIcon && <View style={styles.iconLeft}>{leftIcon}</View>}
          <Text style={[buttonTextStyle, { color: textColor }]}>{title}</Text>
          {rightIcon && <View style={styles.iconRight}>{rightIcon}</View>}
        </View>
      )}
    </TouchableOpacity>
  );
};

export default Button;
