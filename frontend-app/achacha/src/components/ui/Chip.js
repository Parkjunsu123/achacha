import React from 'react';
import { TouchableOpacity } from 'react-native';
import { Icon } from 'react-native-elements';
import { useTheme } from '../../hooks/useTheme';
import { Text } from './index';

/**
 * Chip 컴포넌트
 * 태그, 필터, 액션 등을 표시하는 작은 UI 요소
 */
const Chip = ({
  title,
  icon,
  closeIcon,
  onPress,
  onClose,
  containerStyle,
  titleStyle,
  iconStyle,
  closeIconStyle,
  disabled = false,
  variant = 'default',
  color,
  isSelected = false,
  ...props
}) => {
  const { chip } = useTheme();
  const chipStyles = chip.getStyles();

  // 탭 변형을 위한 처리
  let variantToUse = variant;
  if (variant === 'tab') {
    variantToUse = isSelected ? 'solid' : 'outlined';
  }

  const variantStyle = chip.getVariantStyle(variantToUse, color);

  const renderIcon = () => {
    if (!icon) return null;

    if (React.isValidElement(icon)) {
      return React.cloneElement(icon, {
        style: [chipStyles.icon, iconStyle],
      });
    }

    return (
      <Icon
        name={typeof icon === 'string' ? icon : 'label'}
        type="material"
        size={16}
        color={variantStyle.textColor}
        style={[chipStyles.icon, iconStyle]}
      />
    );
  };

  const renderCloseIcon = () => {
    if (!onClose) return null;

    if (React.isValidElement(closeIcon)) {
      return React.cloneElement(closeIcon, {
        style: [chipStyles.closeIcon, closeIconStyle],
      });
    }

    return (
      <TouchableOpacity onPress={onClose} disabled={disabled}>
        <Icon
          name={typeof closeIcon === 'string' ? closeIcon : 'close'}
          type="material"
          size={16}
          color={variantStyle.textColor}
          style={[chipStyles.closeIcon, closeIconStyle]}
        />
      </TouchableOpacity>
    );
  };

  // 탭 스타일 적용
  const tabStyle = variant === 'tab' ? chipStyles.tab : {};

  return (
    <TouchableOpacity
      style={[
        chipStyles.container,
        {
          backgroundColor: variantStyle.backgroundColor,
          borderColor: variantStyle.borderColor,
          borderWidth: variantStyle.borderWidth,
        },
        tabStyle,
        containerStyle,
      ]}
      onPress={onPress}
      disabled={disabled || !onPress}
      activeOpacity={0.7}
      {...props}
    >
      {renderIcon()}
      <Text
        variant="caption"
        weight={variant === 'tab' && isSelected ? 'semiBold' : 'regular'}
        style={[chipStyles.title, titleStyle]}
        color={variantStyle.textColor}
      >
        {title}
      </Text>
      {renderCloseIcon()}
    </TouchableOpacity>
  );
};

export default Chip;
