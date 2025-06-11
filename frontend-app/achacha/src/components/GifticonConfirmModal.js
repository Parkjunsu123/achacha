import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import FastImage from 'react-native-fast-image';
import { useTheme } from '../hooks/useTheme';

const { width } = Dimensions.get('window');

const GifticonConfirmModal = ({ visible, selectedGifticon, onCancel, onConfirm }) => {
  const { theme } = useTheme();

  return (
    <Modal transparent={true} visible={visible} onRequestClose={onCancel}>
      <View style={styles.confirmModalContainer}>
        <View style={styles.confirmModalContent}>
          <Text style={styles.confirmModalTitle}>선택한 기프티콘을 뿌리시겠습니까?</Text>
          <Text style={styles.confirmModalSubtitle}>한 번 뿌린 기프티콘은 되돌릴 수 없습니다.</Text>
          {selectedGifticon && (
            <View style={styles.selectedGifticonCard}>
              <FastImage
                source={{ uri: selectedGifticon.thumbnailPath }}
                style={styles.gifticonImage}
                resizeMode={FastImage.resizeMode.cover}
              />
              <Text style={styles.gifticonBrand}>{selectedGifticon.brandName}</Text>
              <Text style={styles.gifticonName}>{selectedGifticon.gifticonName}</Text>
            </View>
          )}
          <View style={styles.confirmButtonsContainer}>
            <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
              <Text style={[styles.cancelButtonText, { color: theme.colors.primary }]}>취소</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.okButton} onPress={onConfirm}>
              <Text style={styles.okButtonText}>확인</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  confirmModalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  confirmModalContent: {
    width: width * 0.85,
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
  },
  confirmModalTitle: {
    fontSize: 18,
    fontFamily: 'Pretendard-Bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  confirmModalSubtitle: {
    fontSize: 14,
    fontFamily: 'Pretendard-Medium',
    color: '#888',
    marginBottom: 20,
    textAlign: 'center',
  },
  selectedGifticonCard: {
    width: '100%',
    backgroundColor: '#f1f7ff',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  gifticonImage: {
    width: 100,
    height: 100,
    borderRadius: 5,
    marginBottom: 10,
  },
  gifticonBrand: {
    fontSize: 16,
    fontFamily: 'Pretendard-SemiBold',
    color: 'black',
    marginBottom: 5,
  },
  gifticonName: {
    fontSize: 15,
    fontFamily: 'Pretendard-Medium',
    color: 'black',
  },
  confirmButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    marginTop: 10,
    gap: 15,
  },
  cancelButton: {
    paddingVertical: 13,
    paddingHorizontal: 35,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#E6F3FF',
  },
  okButton: {
    paddingVertical: 13,
    paddingHorizontal: 35,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#56AEE9',
  },
  cancelButtonText: {
    fontSize: 18,
    fontFamily: 'Pretendard-Bold',
  },
  okButtonText: {
    fontSize: 18,
    fontFamily: 'Pretendard-Bold',
    color: 'white',
  },
});

export default GifticonConfirmModal;
