import React, { useEffect } from 'react';
import { Image, StyleSheet, View, SafeAreaView, Platform } from 'react-native';
import { Button, Text } from '../components/ui';
// import * as Notifications from 'expo-notifications';
// import * as Location from 'expo-location';
// import * as ImagePicker from 'expo-image-picker';
import { BleManager } from 'react-native-ble-plx';
import { useNavigation } from '@react-navigation/native';
import PermissionItem from '../components/PermissionItem';
import { usePermissions } from '../hooks/usePermissions';
import { useTheme } from 'react-native-elements';

const PermissionScreen = () => {
  const navigation = useNavigation();
  const { permissionsStatus, requestAllPermissions } = usePermissions();
  const { theme } = useTheme();

  // BLE-PLX 매니저 초기화
  useEffect(() => {
    const manager = new BleManager();

    // 이벤트 구독을 위한 변수
    let stateSubscription = null;

    // 블루투스 상태 변경 감지
    if (Platform.OS === 'ios') {
      stateSubscription = manager.onStateChange(state => {
        // state는 'Unknown', 'Resetting', 'Unsupported', 'Unauthorized', 'PoweredOff', 'PoweredOn' 중 하나
        if (state === 'PoweredOn') {
          // iOS에서 블루투스가 켜져 있을 때 수행할 작업
        }
      }, true); // true는 즉시 현재 상태를 체크하고 호출함을 의미
    }

    // 컴포넌트 언마운트 시 리소스 정리
    return () => {
      if (stateSubscription) {
        stateSubscription.remove();
      }

      // BLE-PLX 매니저 리소스 정리
      manager.destroy();
    };
  }, []);

  // "다음" 버튼 클릭 핸들러
  const handlePressNext = async () => {
    // 훅에서 반환된 요청 함수 호출
    await requestAllPermissions();
    // 네비게이션은 useEffect에서 처리
  };

  // permissionsStatus 상태 변경 감지하여 네비게이션 처리
  useEffect(() => {
    if (permissionsStatus === 'success') {
      navigation.navigate('Login');
    } else if (permissionsStatus === 'fail') {
      // 심각한 오류 발생 시 (훅 내부 Alert 후 추가 동작 필요 시)
      // 필요한 오류 처리 로직 추가
    }
    // 'checking' 이나 'idle' 상태에서는 아무것도 하지 않음
  }, [permissionsStatus, navigation]);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <View style={styles.centerContainer}>
            <View style={styles.headerContainer}>
              <View style={styles.titleContainer}>
                <Image
                  source={require('../assets/images/splash_icon.png')}
                  style={styles.logoImage}
                  resizeMode="contain"
                />
                <Text variant="h1" weight="bold" size={24} style={styles.permissionText}>
                  이용을 위해
                </Text>
              </View>
              <Text variant="h1" weight="bold" size={24} center style={styles.permissionText}>
                아래 권한을 허용해주세요.
              </Text>
            </View>

            <View style={styles.permissionsContainer}>
              <PermissionItem
                iconName="notifications"
                title="알림"
                description="기프티콘 유효기간 및 위치 기반 알림을 받기 위해 알림 권한이 필요합니다."
              />
              <PermissionItem
                iconName="bluetooth"
                title="블루투스"
                description="기프티콘 공유 및 위치 기반 알림 기능을 위해 블루투스 권한이 필요합니다."
              />
              <PermissionItem
                iconName="location-pin"
                title="위치"
                description="근처 매장 정보와 설정 변경 내 지도를 제공하기 위해 위치 권한이 필요합니다."
              />
              <PermissionItem
                iconName="photo-library"
                title="갤러리"
                description={
                  '기프티콘 이미지 업로드를 위하여 갤러리 접근 권한이 필요합니다. (일부 기기에서는 별도의 요청이 없을 수 있습니다.)'
                }
              />
            </View>
          </View>

          <Button
            title={permissionsStatus === 'checking' ? '권한 확인 중...' : '다음'}
            onPress={handlePressNext}
            variant="primary"
            size="lg"
            isDisabled={permissionsStatus === 'checking'}
            style={[styles.button, permissionsStatus === 'checking' && styles.buttonDisabled]}
          />
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    marginTop: 50,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  headerContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 30,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  logoImage: {
    width: 80,
    height: 30,
    marginBottom: 7,
    marginRight: 10,
  },
  permissionText: {
    lineHeight: 30,
    marginBottom: 6,
  },
  permissionsContainer: {
    width: '100%',
    paddingHorizontal: 12,
    paddingLeft: 5,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  button: {
    width: '100%',
    height: 56,
    borderRadius: 8,
    marginBottom: 20,
  },
});

export default PermissionScreen;
