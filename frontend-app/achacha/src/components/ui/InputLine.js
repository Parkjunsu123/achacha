import React, { forwardRef } from 'react';
import { StyleSheet, Platform } from 'react-native';
import { Input } from 'react-native-elements';
import { useTheme } from '../../hooks/useTheme';
import Icon from 'react-native-vector-icons/MaterialIcons';

/**
 * React Native Elements를 기반으로 한 커스텀 인풋 컴포넌트
 * 언더라인 스타일과 아이콘 지원
 */
const InputLine = forwardRef(
  (
    {
      value,
      onChangeText,
      placeholder,
      label,
      leftIcon,
      rightIcon,
      errorMessage,
      isDisabled = false,
      isInvalid = false,
      isRequired = false,
      secureTextEntry = false,
      keyboardType = 'default',
      style,
      inputContainerStyle,
      inputStyle,
      labelStyle,
      errorStyle,
      onSubmitEditing,
      returnKeyType,
      autoCapitalize = 'none',
      blurOnSubmit,
      ...props
    },
    ref
  ) => {
    const { theme } = useTheme();

    // 에러 상태에 따른 색상 설정
    const borderColor = isInvalid ? theme.colors.error : theme.colors.grey3;

    // 아이콘 렌더링 함수
    const renderLeftIcon = () => {
      if (!leftIcon) return null;

      if (React.isValidElement(leftIcon)) {
        return leftIcon;
      }

      return <Icon name={leftIcon} size={20} color={theme.colors.grey5} style={styles.iconStyle} />;
    };

    const renderRightIcon = () => {
      if (!rightIcon) return null;

      if (React.isValidElement(rightIcon)) {
        return rightIcon;
      }

      return (
        <Icon name={rightIcon} size={20} color={theme.colors.grey5} style={styles.iconStyle} />
      );
    };

    return (
      <Input
        ref={ref}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.grey4}
        label={label}
        leftIcon={leftIcon ? renderLeftIcon() : null}
        rightIcon={rightIcon ? renderRightIcon() : null}
        errorMessage={isInvalid ? errorMessage : ''}
        disabled={isDisabled}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        onSubmitEditing={onSubmitEditing}
        returnKeyType={returnKeyType}
        autoCapitalize={autoCapitalize}
        blurOnSubmit={blurOnSubmit}
        containerStyle={[styles.containerStyle, style]}
        inputContainerStyle={[
          styles.inputContainerStyle,
          { borderBottomColor: borderColor },
          inputContainerStyle,
        ]}
        inputStyle={[styles.inputStyle, { fontFamily: theme.fonts.fontWeight.regular }, inputStyle]}
        labelStyle={[styles.labelStyle, { fontFamily: theme.fonts.fontWeight.medium }, labelStyle]}
        errorStyle={[styles.errorStyle, errorStyle]}
        {...props}
      />
    );
  }
);

const styles = StyleSheet.create({
  containerStyle: {
    paddingHorizontal: 0,
    marginBottom: 16,
  },
  inputContainerStyle: {
    borderBottomWidth: 1,
  },
  inputStyle: {
    fontSize: 14,
    minHeight: 30,
    ...Platform.select({
      ios: {
        paddingVertical: 5,
      },
      android: {
        paddingVertical: 5,
      },
    }),
  },
  labelStyle: {
    fontSize: 14,
    color: '#333333',
    marginBottom: 6,
  },
  errorStyle: {
    fontSize: 12,
    marginTop: 4,
  },
  iconStyle: {
    marginRight: 8,
  },
});

InputLine.displayName = 'InputLine';

export default InputLine;
