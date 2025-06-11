import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Icon } from 'react-native-elements';
import { Text } from './index';

// NotificationScreen.js에서 사용하는 아이콘과 색상 정의를 활용
const NOTIFICATION_ICONS = {
  EXPIRY_DATE: 'calendar-month', // 유효기간 만료 알림
  LOCATION_BASED: 'share-location', // 주변 매장 알림
  USAGE_COMPLETE: 'schedule', // 사용완료 여부 알림
  RECEIVE_GIFTICON: 'tap-and-play', // 기프티콘 뿌리기 수신
  SHAREBOX_GIFTICON: 'inventory-2', // 쉐어박스 기프티콘 등록
  SHAREBOX_USAGE_COMPLETE: 'inventory-2', // 쉐어박스 기프티콘 사용
  SHAREBOX_MEMBER_JOIN: 'inventory-2', // 쉐어박스 멤버 참여
  SHAREBOX_DELETED: 'inventory-2', // 쉐어박스 그룹 삭제
};

// 알림 유형에 따른 아이콘 색상
const getIconColorByType = type => {
  switch (type) {
    case 'EXPIRY_DATE':
      return '#EF9696';
    case 'LOCATION_BASED':
      return '#8CDA8F';
    case 'USAGE_COMPLETE':
      return '#6BB2EA';
    case 'RECEIVE_GIFTICON':
      return '#D095EE';
    case 'SHAREBOX_GIFTICON':
    case 'SHAREBOX_USAGE_COMPLETE':
    case 'SHAREBOX_MEMBER_JOIN':
    case 'SHAREBOX_DELETED':
      return '#F1A9D5';
    default:
      return '#4B9CFF';
  }
};

/**
 * 커스텀 토스트 알림 컴포넌트
 */
const ToastNotification = ({ notificationType, title, message, onPress, onClose, hide }) => {
  const iconName = NOTIFICATION_ICONS[notificationType] || 'notifications';
  const iconColor = getIconColorByType(notificationType);

  if (hide) return null;

  return (
    <TouchableOpacity activeOpacity={0.9} style={styles.container} onPress={onPress}>
      <View style={styles.content}>
        <View style={[styles.iconContainer, { backgroundColor: iconColor + '20' }]}>
          <Icon name={iconName} type="material" size={24} color={iconColor} />
        </View>
        <View style={styles.textContainer}>
          <Text weight="bold" style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          <Text style={styles.message} numberOfLines={2}>
            {message}
          </Text>
        </View>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Icon name="close" type="material" size={18} color="#999" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '92%',
    alignSelf: 'center',
    position: 'absolute',
    top: 10,
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    zIndex: 99999,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    color: '#333',
    marginBottom: 3,
  },
  message: {
    fontSize: 13,
    color: '#555',
  },
  closeButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ToastNotification;
