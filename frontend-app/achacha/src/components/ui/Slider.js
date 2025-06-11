import React, { useState, useEffect } from 'react';
import { Slider as RNESlider } from 'react-native-elements';
import { View, StyleSheet, TouchableWithoutFeedback } from 'react-native';
import { useTheme } from 'react-native-elements';
import { Text } from './index';

/**
 * react-native-elements Slider의 defaultProps 경고를 방지하기 위한 래퍼 컴포넌트
 */
const SliderWrapper = ({
  value,
  minimumValue,
  maximumValue,
  step,
  onValueChange,
  onSlidingComplete,
  disabled,
  trackStyle,
  thumbStyle,
  minimumTrackTintColor,
  maximumTrackTintColor,
  thumbTintColor,
  thumbProps,
  ...props
}) => {
  return (
    <RNESlider
      value={value}
      minimumValue={minimumValue}
      maximumValue={maximumValue}
      step={step}
      onValueChange={onValueChange}
      onSlidingComplete={onSlidingComplete}
      disabled={disabled}
      trackStyle={trackStyle}
      thumbStyle={thumbStyle}
      minimumTrackTintColor={minimumTrackTintColor}
      maximumTrackTintColor={maximumTrackTintColor}
      thumbTintColor={thumbTintColor}
      thumbProps={thumbProps}
      {...props}
    />
  );
};

/**
 * 슬라이더 컴포넌트
 */
const Slider = ({
  value,
  values = [0, 1, 2, 3, 7, 30, 60, 90], // 기존 코드와의 호환성을 위한 값 배열
  minimumValue = 0,
  maximumValue = 100,
  step = 1,
  onValueChange,
  onSlidingComplete,
  disabled = false,
  label,
  showValue = true,
  showMinMax = false,
  renderValue,
  trackStyle,
  thumbStyle,
  containerStyle,
  activeColor, // 기존 코드와의 호환성
  inactiveColor, // 기존 코드와의 호환성
  minimumTrackTintColor,
  maximumTrackTintColor,
  thumbTintColor,
  valueTextStyle,
  labelTextStyle,
  minMaxTextStyle,
  showThumbLabel = true, // thumb에 값 표시 여부
  thumbLabelStyle, // thumb 라벨 스타일
  ...props
}) => {
  // 값 배열(values)이 제공된 경우 이를 처리하는 로직
  const useValueArray = values && values.length > 0;

  // 현재 값에 해당하는 배열 인덱스 찾기
  const findClosestIndex = val => {
    if (!useValueArray || !values.length) return 0;

    // 정확히 일치하는 값이 있으면 해당 인덱스 반환
    const exactIndex = values.indexOf(val);
    if (exactIndex !== -1) return exactIndex;

    // 가장 가까운 값의 인덱스 찾기
    let closestIndex = 0;
    let minDiff = Math.abs(values[0] - val);

    for (let i = 1; i < values.length; i++) {
      const diff = Math.abs(values[i] - val);
      if (diff < minDiff) {
        minDiff = diff;
        closestIndex = i;
      }
    }

    return closestIndex;
  };

  // 초기 인덱스 계산
  const initialIndex = findClosestIndex(value);

  // 로컬 상태 설정
  const [localIndex, setLocalIndex] = useState(initialIndex);
  const [localValue, setLocalValue] = useState(useValueArray ? values[initialIndex] : value);

  // 외부 값이 변경되면 로컬 상태 업데이트
  useEffect(() => {
    if (useValueArray) {
      const newIndex = findClosestIndex(value);
      setLocalIndex(newIndex);
      setLocalValue(values[newIndex]);
    } else {
      setLocalValue(value);
    }
  }, [value, useValueArray, values]);

  const { theme } = useTheme();

  // 로컬 값 변경 핸들러
  const handleValueChange = newValue => {
    if (useValueArray) {
      const index = Math.round(newValue);
      if (index >= 0 && index < values.length) {
        const valueFromArray = values[index];
        setLocalIndex(index);
        setLocalValue(valueFromArray);

        if (onValueChange) {
          onValueChange(valueFromArray);
        }
      }
    } else {
      setLocalValue(newValue);

      if (onValueChange) {
        onValueChange(newValue);
      }
    }
  };

  // 슬라이딩 완료 핸들러
  const handleSlidingComplete = newValue => {
    if (useValueArray) {
      const index = Math.round(newValue);
      if (index >= 0 && index < values.length) {
        const valueFromArray = values[index];
        setLocalIndex(index);
        setLocalValue(valueFromArray);

        if (onSlidingComplete) {
          onSlidingComplete(valueFromArray);
        }
      }
    } else if (onSlidingComplete) {
      onSlidingComplete(newValue);
    }
  };

  // 마커 위치 클릭 핸들러
  const handleMarkerPress = index => {
    if (disabled) return;

    if (useValueArray && index >= 0 && index < values.length) {
      setLocalIndex(index);
      const newValue = values[index];
      setLocalValue(newValue);

      if (onValueChange) {
        onValueChange(newValue);
      }

      if (onSlidingComplete) {
        onSlidingComplete(newValue);
      }
    }
  };

  // 조정값 텍스트 포맷 함수
  const formatAdjustmentText = val => {
    if (val === 0) return '당일';
    if (val === 1) return '1일 전';
    if (val === 2) return '2일 전';
    if (val === 3) return '3일 전';
    if (val === 7) return '일주일 전';
    if (val === 30) return '30일 전';
    if (val === 60) return '60일 전';
    if (val === 90) return '90일 전';
    return `${val}일 전`;
  };

  // values 배열을 사용하는 경우, min/max 값을 조정
  const effectiveMinValue = useValueArray ? 0 : minimumValue;
  const effectiveMaxValue = useValueArray ? values.length - 1 : maximumValue;

  // 테마에서 색상 가져오기
  const primaryColor = theme.colors.primary;
  const backgroundColor = theme.colors.background;

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text variant="label" style={[styles.labelText, labelTextStyle]}>
          {label}
        </Text>
      )}

      {/* 슬라이더 위에 중앙 정렬된 "당일 ~ [조정값]" 텍스트 */}
      <View style={styles.adjustmentTextContainer}>
        <Text variant="body1" weight="medium" color={primaryColor} style={styles.adjustmentText}>
          {localValue === 0 ? '당일만' : `당일 ~ ${formatAdjustmentText(localValue)}`}
        </Text>
      </View>

      {/* 마커 표시 */}
      {useValueArray && (
        <View style={styles.markersContainer}>
          {values.map((val, idx) => (
            <TouchableWithoutFeedback
              key={idx}
              onPress={() => handleMarkerPress(idx)}
              disabled={disabled}
            >
              <View
                style={[
                  styles.marker,
                  localIndex === idx && styles.activeMarker,
                  disabled && styles.disabledMarker,
                ]}
              >
                <Text
                  style={[
                    styles.markerText,
                    localIndex === idx && styles.activeMarkerText,
                    disabled && styles.disabledMarkerText,
                  ]}
                >
                  {val}
                </Text>
              </View>
            </TouchableWithoutFeedback>
          ))}
        </View>
      )}

      <View style={styles.sliderArea}>
        <SliderWrapper
          value={useValueArray ? localIndex : localValue}
          minimumValue={effectiveMinValue}
          maximumValue={effectiveMaxValue}
          step={useValueArray ? 1 : step} // values 배열 사용 시 정수 인덱스만 사용
          onValueChange={handleValueChange}
          onSlidingComplete={handleSlidingComplete}
          disabled={disabled}
          trackStyle={[styles.track, trackStyle, disabled && styles.disabledTrack]}
          thumbStyle={[
            styles.thumb,
            { backgroundColor: thumbTintColor || '#A7DAF9' },
            thumbStyle,
            disabled && styles.disabledThumb,
          ]}
          minimumTrackTintColor={minimumTrackTintColor || activeColor || primaryColor}
          maximumTrackTintColor={maximumTrackTintColor || inactiveColor || theme.colors.grey2}
          thumbTintColor={thumbTintColor || backgroundColor}
          allowTouchTrack={true} // 트랙 터치 활성화, 슬라이더를 터치하면 해당 위치로 이동
          thumbProps={{
            children: showThumbLabel ? (
              <View style={styles.thumbLabelContainer}>
                <Text
                  variant="caption"
                  weight="bold"
                  color="white"
                  style={[styles.thumbLabel, thumbLabelStyle]}
                >
                  {localValue}
                </Text>
              </View>
            ) : null,
            hitSlop: { top: 15, right: 15, bottom: 15, left: 15 }, // 터치 영역 확장
          }}
          {...props}
        />
      </View>

      {!useValueArray && showMinMax && (
        <View style={styles.minMaxContainer}>
          <Text variant="caption" color="grey5" style={[styles.minMaxText, minMaxTextStyle]}>
            {minimumValue}
          </Text>
          <Text variant="caption" color="grey5" style={[styles.minMaxText, minMaxTextStyle]}>
            {maximumValue}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginVertical: 0,
  },
  labelText: {
    marginBottom: 8,
    fontSize: 14,
    color: '#333',
  },
  sliderArea: {
    position: 'relative',
    paddingVertical: 8,
    marginHorizontal: 10, // 슬라이더 양쪽 여백
  },
  adjustmentTextContainer: {
    alignItems: 'center',
    marginBottom: 6,
  },
  adjustmentText: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  track: {
    height: 6,
    borderRadius: 3,
  },
  disabledTrack: {
    opacity: 0.5,
  },
  thumb: {
    width: 40,
    height: 40,
    borderRadius: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    zIndex: 10,
  },
  disabledThumb: {
    opacity: 0.5,
    backgroundColor: '#CCCCCC',
  },
  thumbLabelContainer: {
    position: 'absolute',
    top: -24,
    left: -10,
    width: 48,
    height: 24,
    backgroundColor: '#56AEE9',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbLabel: {
    fontSize: 12,
    color: 'white',
  },
  minMaxContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    marginTop: 4,
  },
  minMaxText: {
    fontSize: 12,
  },
  markersContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 14,
    paddingTop: 4,
    paddingBottom: 2,
  },
  marker: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  activeMarker: {
    backgroundColor: 'rgba(86, 174, 233, 0.1)',
  },
  disabledMarker: {
    opacity: 0.5,
  },
  markerText: {
    fontSize: 10,
    color: '#666',
  },
  activeMarkerText: {
    color: '#56AEE9',
    fontWeight: 'bold',
  },
  disabledMarkerText: {
    color: '#999',
  },
});

export default Slider;
