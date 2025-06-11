import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

const Tooltip = ({
  visible,
  message,
  autoHide = true,
  duration = 3000,
  position = 'top',
  style,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // 보여질 때 애니메이션
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0.7,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // autoHide가 true인 경우, 일정 시간 후 숨김
      if (autoHide) {
        const timer = setTimeout(() => {
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }).start();
        }, duration);

        return () => clearTimeout(timer);
      }
    } else {
      // 숨겨질 때 애니메이션
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, fadeAnim, autoHide, duration]);

  if (!visible && fadeAnim._value === 0) return null;

  // 위치에 따른 스타일 설정
  const positionStyle = {
    top: { top: height * 0.05, left: 0, right: 0 },
    center: { top: height * 0.45, left: 0, right: 0 },
    bottom: { bottom: height * 0.1, left: 0, right: 0 },
  };

  return (
    <Animated.View
      style={[styles.tooltipContainer, positionStyle[position], { opacity: fadeAnim }, style]}
    >
      <View style={styles.tooltipBubble}>
        <Text style={styles.tooltipText}>{message}</Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  tooltipContainer: {
    position: 'absolute',
    alignItems: 'center',
    zIndex: 30,
  },
  tooltipBubble: {
    backgroundColor: 'rgba(86, 174, 233, 0.8)',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 20,
    maxWidth: width * 0.8,
  },
  tooltipText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Pretendard-Bold',
    textAlign: 'center',
  },
});

export default Tooltip;
