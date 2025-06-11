import React from 'react';
import { View, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Text } from './index';

/**
 * 커스텀 스위치 컴포넌트
 * 활성화(ON) 상태: 연한 파란색(#C9EAFC) 배경에 중간 파란색(#83C8F5) 동그라미
 * 비활성화(OFF) 상태: 흰색 배경에 하늘색(#A7DAF9) 테두리, 하늘색(#A7DAF9) 동그라미
 */
export const Switch = ({
  value,
  onValueChange,
  disabled = false,
  trackColor,
  thumbColor,
  label,
  labelPosition = 'left', // left, right, top, bottom
  size = 'md', // sm, md, lg
  style,
  labelStyle,
  containerStyle,
  ...props
}) => {
  const translateX = React.useRef(new Animated.Value(value ? 1 : 0)).current;

  React.useEffect(() => {
    Animated.timing(translateX, {
      toValue: value ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [value, translateX]);

  // 사이즈에 따른 스타일 결정
  const getSizeStyle = () => {
    switch (size) {
      case 'sm':
        return {
          width: 44,
          height: 24,
          borderRadius: 12,
          thumbSize: 18,
        };
      case 'lg':
        return {
          width: 60,
          height: 32,
          borderRadius: 16,
          thumbSize: 26,
        };
      case 'md':
      default:
        return {
          width: 52,
          height: 28,
          borderRadius: 14,
          thumbSize: 22,
        };
    }
  };

  const sizeStyle = getSizeStyle();

  // 레이블 위치에 따른 컨테이너 스타일 결정
  const getContainerStyle = () => {
    switch (labelPosition) {
      case 'right':
        return styles.containerRow;
      case 'top':
        return styles.containerColumnReverse;
      case 'bottom':
        return styles.containerColumn;
      case 'left':
      default:
        return styles.containerRowReverse;
    }
  };

  return (
    <View style={[getContainerStyle(), containerStyle]}>
      {label && (
        <Text
          variant="body2"
          color={disabled ? 'grey4' : 'black'}
          style={[
            styles.label,
            ['top', 'bottom'].includes(labelPosition) && styles.verticalLabel,
            labelStyle,
          ]}
        >
          {label}
        </Text>
      )}

      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => !disabled && onValueChange && onValueChange(!value)}
        disabled={disabled}
        style={[style]}
      >
        <View
          style={[
            styles.track,
            // eslint-disable-next-line react-native/no-inline-styles
            {
              width: sizeStyle.width,
              height: sizeStyle.height,
              borderRadius: sizeStyle.borderRadius,
              // 활성화 상태: 연한 파란색(#C9EAFC) 배경, 비활성화 상태: 흰색 배경
              backgroundColor: value ? '#C9EAFC' : '#FFFFFF',
              // 테두리 설정: 활성화 시 #83C8F5 테두리, 비활성화 시 하늘색(#A7DAF9) 테두리
              borderColor: value ? '#83C8F5' : '#A7DAF9',
              borderWidth: 1,
            },
            disabled && styles.disabledTrack,
          ]}
        >
          <Animated.View
            style={[
              styles.thumb,
              // eslint-disable-next-line react-native/no-inline-styles
              {
                width: sizeStyle.thumbSize,
                height: sizeStyle.thumbSize,
                borderRadius: sizeStyle.thumbSize / 2,
                // 활성화 상태: 중간 파란색(#83C8F5), 비활성화 상태: 하늘색(#A7DAF9)
                backgroundColor: value ? '#83C8F5' : '#A7DAF9',
                transform: [
                  {
                    translateX: translateX.interpolate({
                      inputRange: [0, 1],
                      outputRange: [4, sizeStyle.width - sizeStyle.thumbSize - 4],
                    }),
                  },
                ],
              },
              disabled && styles.disabledThumb,
            ]}
          />
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  containerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  containerRowReverse: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  containerColumn: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  containerColumnReverse: {
    flexDirection: 'column-reverse',
    alignItems: 'flex-start',
  },
  label: {
    fontSize: 14,
    marginHorizontal: 8,
  },
  verticalLabel: {
    marginVertical: 4,
    marginHorizontal: 0,
  },
  track: {
    justifyContent: 'center',
  },
  thumb: {
    position: 'absolute',
    elevation: 0,
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
  },
  disabledTrack: {
    opacity: 0.8,
  },
  disabledThumb: {
    opacity: 0.8,
  },
});

export default Switch;
