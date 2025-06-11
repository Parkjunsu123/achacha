import React from 'react';
import { Overlay as RNEOverlay } from 'react-native-elements';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from 'react-native-elements';
import { Text } from './index';

/**
 * react-native-elements Overlay의 defaultProps 경고를 방지하기 위한 래퍼 컴포넌트
 */
const Overlay = ({ isVisible = false, onBackdropPress, overlayStyle, children, ...props }) => {
  return (
    <RNEOverlay
      isVisible={isVisible}
      onBackdropPress={onBackdropPress}
      overlayStyle={overlayStyle}
      {...props}
    >
      {children}
    </RNEOverlay>
  );
};

/**
 * 알림 다이얼로그 컴포넌트
 */
export const AlertDialog = ({
  isVisible,
  onBackdropPress,
  title,
  message,
  confirmText = '확인',
  cancelText = '취소',
  onConfirm,
  onCancel,
  type = 'info', // info, success, warning, error
  hideCancel = false,
}) => {
  const { theme } = useTheme();

  // 타입에 따른 버튼 색상 매핑
  const getButtonColor = () => {
    // 항상 '#56AEE9' 색상 반환 (요구사항에 따라)
    return '#56AEE9';
  };

  return (
    <Overlay isVisible={isVisible} onBackdropPress={onBackdropPress} overlayStyle={styles.overlay}>
      <View style={styles.container}>
        <Text variant="subtitle1" weight="bold" style={styles.title}>
          {title}
        </Text>
        {message && (
          <Text variant="body2" color="grey5" style={styles.message}>
            {message}
          </Text>
        )}

        <View style={[styles.buttonContainer, hideCancel && styles.singleButtonContainer]}>
          {!hideCancel && (
            <TouchableOpacity
              style={[styles.button, styles.cancelButton, { backgroundColor: theme.colors.grey1 }]}
              onPress={onCancel}
            >
              <Text variant="button" color="grey5" style={styles.cancelText}>
                {cancelText}
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[
              styles.button,
              styles.confirmButton,
              { backgroundColor: getButtonColor() },
              hideCancel && styles.fullWidthButton,
            ]}
            onPress={onConfirm}
          >
            <Text variant="button" color="white" style={styles.confirmText}>
              {confirmText}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Overlay>
  );
};

const styles = StyleSheet.create({
  overlay: {
    width: '80%',
    borderRadius: 10,
    padding: 0,
    backgroundColor: 'white',
  },
  container: {
    padding: 20,
  },
  title: {
    fontSize: 18,
    marginBottom: 12,
    fontFamily: 'Pretendard-Bold',
  },
  message: {
    fontSize: 15,
    marginBottom: 20,
    fontFamily: 'Pretendard-Regular',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  singleButtonContainer: {
    justifyContent: 'flex-end',
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullWidthButton: {
    width: '100%',
  },
  cancelButton: {
    marginRight: 10,
  },
  cancelText: {
    fontWeight: '500',
    fontFamily: 'Pretendard-Medium',
  },
  confirmText: {
    fontWeight: '500',
    fontFamily: 'Pretendard-Medium',
  },
});

export default AlertDialog;
