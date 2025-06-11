import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import FastImage from 'react-native-fast-image';
import { calculateDday } from '../../utils/dateUtils';
import { useNavigation } from '@react-navigation/native';

const MapGifticonItem = ({
  gifticon,
  onUse = () => {},
  onSelectBrand = () => {},
  isSelected = false,
}) => {
  const {
    brandName,
    gifticonExpiryDate,
    gifticonName,
    thumbnailPath,
    gifticonId,
    brandId,
    gifticonType,
  } = gifticon;
  const navigation = useNavigation();

  const dday = calculateDday(gifticonExpiryDate);
  const isExpired = dday === '만료됨'; // 만료 상태 확인

  let numericDday = Infinity;
  if (!isExpired && dday && typeof dday === 'string') {
    // 만료가 아닐 때만 numericDday 계산
    if (dday.toUpperCase() === 'D-DAY') {
      numericDday = 0;
    } else if (dday.startsWith('D-')) {
      const parts = dday.split('-');
      if (parts.length === 2) {
        const dayValue = parseInt(parts[1], 10);
        if (!isNaN(dayValue)) {
          numericDday = dayValue;
        }
      }
    }
  }

  // 아이템 클릭 핸들러
  const handleItemPress = () => {
    onSelectBrand(brandId);
  };

  // 사용 버튼 클릭 핸들러
  const handleUsePress = e => {
    e.stopPropagation();

    // 기프티콘 타입에 따라 다른 페이지로 이동
    if (gifticonType === 'AMOUNT') {
      navigation.navigate('DetailAmount', {
        gifticonId: gifticonId,
        scope: 'MY_BOX',
      });
    } else {
      navigation.navigate('DetailProduct', {
        gifticonId: gifticonId,
        scope: 'MY_BOX',
      });
    }
  };

  return (
    <TouchableOpacity
      style={[styles.container, isSelected && styles.selectedContainer]}
      onPress={handleItemPress}
      activeOpacity={0.7}
    >
      <FastImage
        source={{ uri: thumbnailPath }}
        style={styles.image}
        resizeMode={FastImage.resizeMode.cover}
      />
      {/* 기프티콘 정보 */}
      <View style={styles.infoContainer}>
        <View style={styles.titleContainer}>
          <Text style={styles.brand}>
            {brandName.length > 11 ? `${brandName.substring(0, 11)}...` : brandName}
          </Text>
          <View
            style={[
              styles.ddayContainer,
              isExpired
                ? styles.expiredDDayBackground
                : numericDday <= 7
                  ? styles.urgentDDayBackground
                  : styles.normalDDayBackground,
            ]}
          >
            <Text
              style={[
                styles.ddayText,
                isExpired
                  ? styles.expiredDDayText
                  : numericDday <= 7
                    ? styles.urgentDDayText
                    : styles.normalDDayText,
              ]}
            >
              {dday}
            </Text>
          </View>
        </View>

        <Text style={styles.menuName}>
          {gifticonName.length > 16 ? `${gifticonName.substring(0, 10)}...` : gifticonName}
        </Text>
      </View>

      {/* 사용 버튼 */}
      <TouchableOpacity style={styles.useButton} onPress={handleUsePress}>
        <Text style={styles.buttonText}>사용</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F5FBFF',
    borderRadius: 8,
    marginBottom: 13,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  selectedContainer: {
    borderColor: '#56AEE9',
    backgroundColor: '#EBF7FF',
  },
  image: {
    width: 55,
    height: 55,
    borderRadius: 5,
  },
  infoContainer: {
    flex: 1,
    marginLeft: 12,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 10,
  },
  brand: {
    fontSize: 16,
    fontFamily: 'Pretendard-SemiBold',
  },
  menuName: {
    fontSize: 14,
    fontFamily: 'Pretendard-Medium',
  },
  ddayText: {
    fontSize: 15,
    fontFamily: 'Pretendard-SemiBold',
  },
  ddayContainer: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 5,
  },
  urgentDDayBackground: {
    backgroundColor: 'rgba(234, 84, 85, 0.15)',
  },
  normalDDayBackground: {
    backgroundColor: 'rgba(114, 191, 255, 0.15)',
  },
  urgentDDayText: {
    color: '#EA5455',
  },
  normalDDayText: {
    color: '#72BFFF',
  },
  expiredDDayBackground: {
    backgroundColor: 'rgba(153, 153, 153, 0.15)',
  },
  expiredDDayText: {
    color: '#737373',
    fontFamily: 'Pretendard-SemiBold',
  },
  useButton: {
    backgroundColor: '#56AEE9',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Pretendard-SemiBold',
  },
});

export default MapGifticonItem;
