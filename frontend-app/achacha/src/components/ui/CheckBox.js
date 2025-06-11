import React from 'react';
import { View } from 'react-native';
import { CheckBox as RNECheckBox } from 'react-native-elements';
import { useTheme } from '../../hooks/useTheme';

/**
 * react-native-elements CheckBox의 defaultProps 경고를 방지하기 위한 래퍼 컴포넌트
 */
const CheckBoxWrapper = ({
  title,
  checked,
  onPress,
  size,
  iconType,
  checkedIcon,
  uncheckedIcon,
  checkedColor,
  uncheckedColor,
  containerStyle,
  textStyle,
  disabled,
  ...props
}) => {
  return (
    <RNECheckBox
      title={title}
      checked={checked}
      onPress={onPress}
      size={size}
      iconType={iconType}
      checkedIcon={checkedIcon}
      uncheckedIcon={uncheckedIcon}
      checkedColor={checkedColor}
      uncheckedColor={uncheckedColor}
      containerStyle={containerStyle}
      textStyle={textStyle}
      disabled={disabled}
      {...props}
    />
  );
};

/**
 * 체크박스 컴포넌트
 *
 * @param {Object} props - 컴포넌트 props
 * @param {string} props.title - 체크박스 텍스트
 * @param {boolean} props.checked - 체크박스 상태
 * @param {Function} props.onPress - 체크박스 클릭 이벤트 핸들러
 * @param {string} props.size - 체크박스 크기 (small, medium, large)
 * @param {string} props.variant - 체크박스 변형 (default, square, circle)
 * @param {string} props.color - 체크박스 색상
 * @param {boolean} props.disabled - 비활성화 여부
 * @param {Object} props.containerStyle - 컨테이너 스타일
 * @param {Object} props.textStyle - 텍스트 스타일
 */
const CheckBox = ({
  title,
  checked,
  onPress,
  size = 'medium',
  variant = 'default',
  color,
  disabled = false,
  containerStyle,
  textStyle,
  ...rest
}) => {
  const { theme, checkbox } = useTheme();
  const styles = checkbox.getStyles();
  const variantStyle = checkbox.getVariantStyle(variant, size);

  // 체크박스 색상 설정
  const checkedColor = color ? theme.colors[color] || color : theme.colors.primary;
  const uncheckedColor = theme.colors.grey3;

  return (
    <View style={[styles.container, containerStyle]}>
      <CheckBoxWrapper
        title={title}
        checked={checked}
        onPress={disabled ? undefined : onPress}
        size={variantStyle.size}
        iconType={variantStyle.iconType}
        checkedIcon={variantStyle.checkedIcon}
        uncheckedIcon={variantStyle.uncheckedIcon}
        checkedColor={disabled ? theme.colors.disabled : checkedColor}
        uncheckedColor={disabled ? theme.colors.grey2 : uncheckedColor}
        containerStyle={[
          styles.checkboxContainer,
          variantStyle.containerStyle,
          disabled && styles.disabledContainer,
        ]}
        textStyle={[
          styles.text,
          {
            color: disabled ? theme.colors.grey4 : theme.colors.black,
          },
          textStyle,
        ]}
        disabled={disabled}
        {...rest}
      />
    </View>
  );
};

export default CheckBox;
