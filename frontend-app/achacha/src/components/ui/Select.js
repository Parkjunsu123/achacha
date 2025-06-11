import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import { useTheme } from 'react-native-elements';
import { Text } from './index';

/**
 * 셀렉트(드롭다운) 컴포넌트
 */
export const Select = ({
  items = [],
  value,
  onChange,
  placeholder = '선택하세요',
  label,
  multiple = false,
  disabled = false,
  error,
  helper,
  searchable = false,
  variant = 'outline', // outline, filled, underlined
  size = 'md', // sm, md, lg
  containerStyle,
  dropDownContainerStyle,
  labelStyle,
  textStyle,
  ...props
}) => {
  const [open, setOpen] = useState(false);
  const [localValue, setLocalValue] = useState(value);
  const [localItems, setLocalItems] = useState(items);
  const { theme } = useTheme();

  // 값 변경 핸들러
  const handleValueChange = selectedValue => {
    setLocalValue(selectedValue);
    onChange && onChange(selectedValue);
  };

  // 사이즈에 따른 높이 결정
  const getHeight = () => {
    switch (size) {
      case 'sm':
        return 32;
      case 'lg':
        return 48;
      case 'md':
      default:
        return 40;
    }
  };

  // 변형에 따른 스타일 설정
  const getVariantStyle = () => {
    const borderColor = error ? theme.colors.error : theme.colors.grey3;

    switch (variant) {
      case 'filled':
        return {
          style: {
            ...styles.dropdown,
            ...styles.filled,
            minHeight: getHeight(),
            borderColor: borderColor,
            backgroundColor: theme.colors.grey0,
          },
          dropDownContainerStyle: {
            ...styles.dropdownContainer,
            borderColor: borderColor,
          },
        };
      case 'underlined':
        return {
          style: {
            ...styles.dropdown,
            ...styles.underlined,
            minHeight: getHeight(),
            borderColor: borderColor,
          },
          dropDownContainerStyle: {
            ...styles.dropdownContainer,
            borderColor: borderColor,
          },
        };
      case 'outline':
      default:
        return {
          style: {
            ...styles.dropdown,
            ...styles.outline,
            minHeight: getHeight(),
            borderColor: borderColor,
            backgroundColor: theme.colors.white,
          },
          dropDownContainerStyle: {
            ...styles.dropdownContainer,
            borderColor: borderColor,
          },
        };
    }
  };

  const variantStyle = getVariantStyle();

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text variant="body2" weight="medium" style={[styles.label, labelStyle]}>
          {label}
        </Text>
      )}

      <DropDownPicker
        open={open}
        value={localValue}
        items={localItems}
        setOpen={setOpen}
        setValue={setLocalValue}
        setItems={setLocalItems}
        onChangeValue={handleValueChange}
        placeholder={placeholder}
        disabled={disabled}
        disabledStyle={[styles.disabled, { backgroundColor: theme.colors.grey1 }]}
        multiple={multiple}
        searchable={searchable}
        listMode="SCROLLVIEW"
        scrollViewProps={{
          nestedScrollEnabled: true,
        }}
        style={variantStyle.style}
        dropDownContainerStyle={[variantStyle.dropDownContainerStyle, dropDownContainerStyle]}
        textStyle={[styles.text, { color: theme.colors.black }, textStyle]}
        placeholderStyle={[styles.placeholderText, { color: theme.colors.grey4 }]}
        disabledTextStyle={[styles.disabledText, { color: theme.colors.grey4 }]}
        selectedItemContainerStyle={[
          styles.selectedItem,
          { backgroundColor: `${theme.colors.primary}20` },
        ]}
        selectedItemLabelStyle={[styles.selectedItemLabel, { color: theme.colors.primary }]}
        {...props}
      />

      {(error || helper) && (
        <Text variant="caption" color={error ? 'error' : 'grey5'} style={styles.helperText}>
          {error || helper}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 6,
  },
  dropdown: {
    borderWidth: 1,
  },
  // 변형 스타일
  outline: {
    borderRadius: 8,
  },
  filled: {
    borderRadius: 8,
  },
  underlined: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    borderBottomWidth: 1,
    borderRadius: 0,
  },
  dropdownContainer: {
    borderWidth: 1,
  },
  // 텍스트 스타일
  text: {
    fontSize: 14,
  },
  placeholderText: {
    // 색상은 테마로 적용
  },
  // 비활성화 스타일
  disabled: {
    opacity: 0.8,
  },
  disabledText: {
    // 색상은 테마로 적용
  },
  // 선택된 아이템 스타일
  selectedItem: {
    // 배경색은 테마로 적용
  },
  selectedItemLabel: {
    fontWeight: 'bold',
    // 색상은 테마로 적용
  },
  // 헬퍼 텍스트 스타일
  helperText: {
    fontSize: 12,
    marginTop: 4,
  },
});

export default Select;
