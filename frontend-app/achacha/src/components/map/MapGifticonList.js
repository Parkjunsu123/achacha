import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BottomSheetFlatList } from '@gorhom/bottom-sheet';
import MapGifticonItem from './MapGifticonItem';

const MapGifticonList = ({ gifticons, onUseGifticon, onSelectBrand, selectedBrand }) => {
  // 기프티콘 목록을 유효기간 임박순으로 정렬
  const sortedGifticons = useMemo(() => {
    if (!gifticons || gifticons.length === 0) return [];

    return [...gifticons].sort((a, b) => {
      const dateA = new Date(a.gifticonExpiryDate);
      const dateB = new Date(b.gifticonExpiryDate);
      return dateA - dateB; // 오름차순 정렬 (가장 가까운 날짜가 먼저)
    });
  }, [gifticons]);

  // 보유하고 있는 기프티콘이 없을 때
  if (!gifticons || gifticons.length === 0) {
    return (
      <View style={[styles.container, styles.emptyContainer]}>
        <Text style={styles.emptyText}>사용 가능한 기프티콘이 없습니다.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>사용 가능한 기프티콘</Text>
      <BottomSheetFlatList
        data={sortedGifticons}
        renderItem={({ item }) => (
          <MapGifticonItem
            gifticon={item}
            onUse={onUseGifticon}
            onSelectBrand={onSelectBrand}
            isSelected={selectedBrand === item.brandId}
          />
        )}
        keyExtractor={item => String(item.gifticonId)}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    fontSize: 18,
    fontFamily: 'Pretendard-Bold',
    marginBottom: 14,
    marginHorizontal: 20,
    marginTop: 4,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    fontFamily: 'Pretendard-Regular',
  },
});

export default MapGifticonList;
