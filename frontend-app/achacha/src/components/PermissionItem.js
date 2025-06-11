import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Text } from './ui';

const ICON_SIZE = 28; // 아이콘 크기 상수
const ICON_MARGIN_RIGHT = 12; // 아이콘 오른쪽 마진 상수
const { width } = Dimensions.get('window');

const PermissionItem = ({ iconName, title, description }) => (
  <View style={styles.permissionItemContainer}>
    {/* 상단 행: 아이콘 + 제목 */}
    <View style={styles.itemTopRow}>
      <MaterialIcons name={iconName} size={ICON_SIZE} style={styles.icon} />
      <Text variant="subtitle1" weight="bold">
        {title}
      </Text>
    </View>
    {/* 하단 행: 설명 */}
    <Text variant="body2" weight="regular" color="#666666" style={styles.permissionDescription}>
      {description}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  permissionItemContainer: {
    marginBottom: 25,
    alignItems: 'flex-start', // 왼쪽 정렬 유지
    width: '100%', // 너비 유지
    paddingHorizontal: 4,
  },
  itemTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  icon: {
    color: '#737373', // $textSecondary 색상값
    marginRight: ICON_MARGIN_RIGHT,
  },
  permissionDescription: {
    textAlign: 'left', // 왼쪽 정렬 유지
    paddingLeft: ICON_SIZE + ICON_MARGIN_RIGHT, // 아이콘과 제목을 같은 라인에 맞춤
    paddingRight: 10,
    lineHeight: 22,
    width: width * 0.85,
  },
});

export default PermissionItem;
