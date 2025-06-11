import React from 'react';
import { View, StyleSheet, Modal, Text } from 'react-native';
import LottieView from 'lottie-react-native';

// 로티 애니메이션 파일을 미리 변수에 저장
const ocrAnimation = require('../../assets/lottie/ocr_animation.json');

const LoadingOcrModal = ({ visible, message = '이미지 처리 중...' }) => {
  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent>
      <View style={styles.container}>
        <LottieView source={ocrAnimation} autoPlay loop style={styles.lottieAnimation} />
        <Text style={styles.loadingText}>{message}</Text>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  lottieAnimation: {
    width: 170,
    height: 170,
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    textAlign: 'center',
  },
});

export default LoadingOcrModal;
