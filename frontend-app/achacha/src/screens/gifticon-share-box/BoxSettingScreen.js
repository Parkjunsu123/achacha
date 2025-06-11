// 쉐어박스 설정 스크린

import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  TextInput,
  Alert,
  Image,
} from 'react-native';
import { Icon } from 'react-native-elements';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '../../components/ui';
import { useTheme } from '../../hooks/useTheme';
import NavigationService from '../../navigation/NavigationService';
import {
  leaveShareBox,
  fetchShareBoxSettings,
  fetchShareBoxUsers,
  changeShareBoxName,
  changeShareBoxParticipationSetting,
} from '../../api/shareBoxService';
import { ERROR_MESSAGES } from '../../constants/errorMessages';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Clipboard from '@react-native-clipboard/clipboard';
import Switch from '../../components/ui/Switch';
import KakaoShareLink from 'react-native-kakao-share-link';

const BoxSettingScreen = () => {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const route = useRoute();
  const navigation = useNavigation();

  // 쉐어박스 이름 가져오기
  const [shareBoxName, setShareBoxName] = useState('');
  const [memberEntryEnabled, setMemberEntryEnabled] = useState(true);
  const [shareBoxCode, setShareBoxCode] = useState('');
  const [members, setMembers] = useState([]);
  const [shareBoxUserId, setShareBoxUserId] = useState(null); // 방장 userId
  const [userId, setUserId] = useState(null); // 내 userId

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const data = await fetchShareBoxSettings(route.params?.shareBoxId);
        console.log('[API 응답] settings:', data);
        setShareBoxName(data.shareBoxName);
        setMemberEntryEnabled(data.shareBoxAllowParticipation);
        setShareBoxCode(data.shareBoxInviteCode);
      } catch (e) {
        const errorCode = e?.response?.data?.errorCode;
        let message = '쉐어박스 설정 정보를 불러오지 못했습니다.';
        if (errorCode && ERROR_MESSAGES[errorCode]) {
          message = ERROR_MESSAGES[errorCode];
        } else if (e?.response?.data?.message) {
          message = e.response.data.message;
        }
        Alert.alert('접근 불가', message);
        if (errorCode === 'SHAREBOX_008') {
          // 필요하다면 BoxMainScreen 등으로 이동 처리
          navigation.reset({
            index: 0,
            routes: [{ name: 'BoxMain' }],
          });
        }
      }
    };
    loadSettings();
  }, [route.params?.shareBoxId]);

  useEffect(() => {
    const getUserId = async () => {
      const id = await AsyncStorage.getItem('userId');
      console.log('[AsyncStorage userId]', id);
      setUserId(id ? Number(id) : null);
    };
    getUserId();
  }, []);

  // 참가자 목록 불러오기
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const data = await fetchShareBoxUsers(route.params?.shareBoxId);
        setShareBoxUserId(data.shareBoxUserId); // 방장 userId 저장
        // 방장 ID와 참가자 목록을 활용해 멤버 배열 생성
        const membersList = data.participations.map(user => ({
          id: user.userId,
          name: user.userName,
          role: user.userId === data.shareBoxUserId ? '방장' : '멤버',
        }));
        setMembers(membersList);
      } catch (e) {
        const errorCode = e?.response?.data?.errorCode;
        let message = '참가자 목록을 불러오지 못했습니다.';
        if (errorCode && ERROR_MESSAGES[errorCode]) {
          message = ERROR_MESSAGES[errorCode];
        } else if (e?.response?.data?.message) {
          message = e.response.data.message;
        }
        Alert.alert('오류', message);
      }
    };
    loadUsers();
  }, [route.params?.shareBoxId]);

  useEffect(() => {
    console.log('[방 진입] userId:', userId, 'shareBoxUserId:', shareBoxUserId);
  }, [userId, shareBoxUserId]);

  useEffect(() => {
    console.log('[userId 변경]', userId);
  }, [userId]);

  useEffect(() => {
    console.log('[shareBoxUserId 변경]', shareBoxUserId);
  }, [shareBoxUserId]);

  // 뒤로가기 핸들러
  const handleGoBack = () => {
    NavigationService.goBack();
  };

  // 이름 변경 핸들러
  const handleNameChange = text => {
    setShareBoxName(text);
  };

  // 멤버 입장 토글 핸들러
  const toggleMemberEntry = async () => {
    if (userId !== shareBoxUserId) return;
    try {
      const newValue = !memberEntryEnabled;
      const res = await changeShareBoxParticipationSetting(route.params?.shareBoxId, newValue);
      setMemberEntryEnabled(newValue);
      Alert.alert('알림', res); // 서버에서 반환하는 메시지 그대로 표시
    } catch (e) {
      const errorCode = e?.response?.data?.errorCode;
      let message = '멤버 입장 허용 설정 변경에 실패했습니다.';
      if (errorCode && ERROR_MESSAGES[errorCode]) {
        message = ERROR_MESSAGES[errorCode];
      } else if (e?.response?.data?.message) {
        message = e.response.data.message;
      }
      Alert.alert('오류', message);
    }
  };

  // 초대 코드 복사 핸들러
  const copyInviteCode = () => {
    Clipboard.setString(shareBoxCode);
    Alert.alert('알림', '초대 코드가 클립보드에 복사되었습니다.');
  };

  // 쉐어박스 나가기 핸들러
  const leaveShareBoxHandler = async () => {
    try {
      await leaveShareBox(route.params.shareBoxId);
      Alert.alert('알림', '쉐어박스를 나갔습니다.');
      // BoxMainScreen으로 이동 및 목록 새로고침 트리거
      navigation.pop(2);
    } catch (e) {
      const errorCode = e?.response?.data?.errorCode;
      let message = '쉐어박스 나가기에 실패했습니다.';
      if (errorCode && ERROR_MESSAGES[errorCode]) {
        message = ERROR_MESSAGES[errorCode];
      } else if (e?.response?.data?.message) {
        message = e.response.data.message;
      }
      console.log('[쉐어박스 나가기 에러]', e);
      console.log('[에러코드]', errorCode);
      console.log('[에러메시지]', e?.response?.data?.message);
      Alert.alert('오류', message);
    }
  };

  // 나가기 버튼 클릭 핸들러 (방장 여부에 따라 안내)
  const handleLeavePress = () => {
    if (userId && shareBoxUserId && userId === shareBoxUserId) {
      Alert.alert('알림', '쉐어박스가 모든 인원에게 삭제됩니다. 정말 나가시겠습니까?', [
        { text: '취소', style: 'cancel' },
        { text: '확인', onPress: leaveShareBoxHandler },
      ]);
    } else {
      Alert.alert('알림', '쉐어박스에서 나가면 기프티콘이 회수됩니다. 정말 나가시겠습니까?', [
        { text: '취소', style: 'cancel' },
        { text: '확인', onPress: leaveShareBoxHandler },
      ]);
    }
  };

  // 이름 변경 버튼 핸들러
  const handleChangeName = async () => {
    try {
      if (!shareBoxName.trim()) {
        Alert.alert('알림', '쉐어박스 이름을 입력해 주세요.');
        return;
      }
      const res = await changeShareBoxName(route.params?.shareBoxId, shareBoxName.trim());
      Alert.alert('알림', res, [
        {
          text: '확인',
          onPress: () => {
            // 이전 화면으로 돌아가면서 새로고침 트리거
            navigation.goBack();
          },
        },
      ]);
    } catch (e) {
      const errorCode = e?.response?.data?.errorCode;
      let message = '쉐어박스 이름 변경에 실패했습니다.';
      if (errorCode && ERROR_MESSAGES[errorCode]) {
        message = ERROR_MESSAGES[errorCode];
      } else if (e?.response?.data?.message) {
        message = e.response.data.message;
      }
      Alert.alert('오류', message);
    }
  };

  // 카카오톡 공유 함수
  const handleKakaoShare = async () => {
    try {
      await KakaoShareLink.sendCustom({
        templateId: 120597, // 실제 사용하는 템플릿 ID로 교체
        templateArgs: [
          { key: 'invite_code', value: shareBoxCode },
        ],
      });
    } catch (e) {
      console.error(e);
      Alert.alert('에러', '카카오톡 공유에 실패했습니다.');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />

      {/* 안전 영역 상단 여백 */}
      <View style={{ height: insets.top, backgroundColor: theme.colors.background }} />

      {/* 커스텀 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButtonContainer}>
          <Icon name="arrow-back-ios" type="material" size={22} color={theme.colors.black} />
        </TouchableOpacity>
        <Text variant="h3" weight="bold" style={styles.headerTitle}>
          쉐어박스 설정
        </Text>
        <View style={styles.rightPlaceholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollViewContentContainer}
      >
        <View style={styles.contentContainer}>
          {/* 쉐어박스 이름 */}
          <View style={styles.section}>
            <Text variant="body1" weight="medium" style={styles.sectionLabel}>
              이름
            </Text>
            <View style={styles.inputContainer}>
              <TextInput
                value={shareBoxName}
                onChangeText={handleNameChange}
                style={[styles.input, userId !== shareBoxUserId && { color: '#B0B0B0' }]}
                placeholder="쉐어박스 이름을 입력하세요"
                editable={userId === shareBoxUserId}
              />
              <TouchableOpacity
                style={[
                  styles.confirmButton,
                  userId !== shareBoxUserId && { backgroundColor: '#E0E0E0' },
                ]}
                onPress={userId === shareBoxUserId ? handleChangeName : null}
                disabled={userId !== shareBoxUserId}
              >
                <Text
                  variant="body2"
                  weight="medium"
                  style={[
                    styles.confirmButtonText,
                    userId !== shareBoxUserId && { color: '#B0B0B0' },
                  ]}
                >
                  변경
                </Text>
              </TouchableOpacity>
            </View>
            {userId !== shareBoxUserId && (
              <Text variant="caption" style={{ color: '#B0B0B0', marginTop: 4 }}>
                방장만 이름을 변경할 수 있습니다.
              </Text>
            )}
          </View>

          {/* 멤버 입장 */}
          <View style={styles.section}>
            <View style={styles.rowContainer}>
              <Text variant="body1" weight="medium">
                멤버 입장 허용
              </Text>
              <Switch
                value={memberEntryEnabled}
                onValueChange={toggleMemberEntry}
                disabled={userId !== shareBoxUserId}
              />
            </View>
            {userId !== shareBoxUserId && (
              <Text variant="caption" style={{ color: '#B0B0B0', marginTop: 4 }}>
                방장만 멤버 입장 허용 여부를 변경할 수 있습니다.
              </Text>
            )}
          </View>

          {/* 쉐어박스 초대 코드 */}
          <View style={styles.section}>
            <Text variant="body1" weight="medium" style={styles.sectionTitle}>
              초대 코드
            </Text>
            <View style={[styles.codeContainer, { backgroundColor: '#F0F9FF' }]}>
              <Text variant="h3" weight="bold" style={styles.codeText}>
                {shareBoxCode}
              </Text>
              <View style={{ flexDirection: 'row' }}>
                <TouchableOpacity style={[styles.confirmButton, { marginRight: 6 ,backgroundColor: '#FFEB00', minWidth: 40}]} onPress={handleKakaoShare}>
                <Image
                    source={require('../../assets/images/kakaotalk_sharing_btn_small.png')}
                    style={{ width: 15, height: 15 }}
                    resizeMode="contain"
                  />
                </TouchableOpacity>
                <TouchableOpacity style={styles.confirmButton} onPress={copyInviteCode}>
                  <Text variant="body2" weight="medium" style={styles.confirmButtonText}>
                    복사
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* 멤버 목록 */}
          <View style={styles.section}>
            <Text variant="body1" weight="medium" style={styles.sectionTitle}>
              멤버 목록
            </Text>
            {members.map(member => (
              <View key={member.id} style={styles.memberItem}>
                <Text variant="body1">{member.name}</Text>
                <Text
                  variant="body2"
                  style={[styles.memberRole, member.role === '방장' && styles.managerRole]}
                >
                  {member.role}
                </Text>
              </View>
            ))}
          </View>

          {/* 쉐어박스 나가기 버튼 */}
          <TouchableOpacity style={styles.leaveButton} onPress={handleLeavePress}>
            <Text variant="body1" weight="semibold" style={styles.leaveButtonText}>
              나가기
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  backButtonContainer: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    textAlign: 'center',
    flex: 1,
  },
  rightPlaceholder: {
    width: 44,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContentContainer: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  contentContainer: {
    padding: 20,
  },
  gifticonCardSection: {
    marginBottom: 24,
    alignItems: 'center',
  },
  gifticonCard: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#72BFFF',
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  gifticonImage: {
    width: '80%',
    height: '80%',
  },
  galleryButton: {
    width: '100%',
    height: 50,
    backgroundColor: '#E5F4FE',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  galleryButtonText: {
    color: '#278CCC',
    fontSize: 16,
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 24,
  },
  sectionLabel: {
    marginBottom: 8,
  },
  sectionTitle: {
    marginBottom: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EEEEEE',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 48,
  },
  input: {
    flex: 1,
    fontSize: 16,
    height: '100%',
  },
  editButton: {
    marginLeft: 8,
  },
  editButtonText: {
    color: '#007AFF',
  },
  switchContainer: {
    width: 52,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    justifyContent: 'center',
  },
  switchThumb: {
    width: 22,
    height: 22,
    borderRadius: 11,
  },
  codeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 8,
  },
  codeText: {
    fontSize: 16,
  },
  memberItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  memberRole: {
    color: '#737373',
  },
  managerRole: {
    color: '#56AEE9',
    fontWeight: 'bold',
  },
  leaveButton: {
    alignItems: 'center',
    marginTop: 0,
    borderWidth: 1,
    borderColor: '#EA5455',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignSelf: 'center',
  },
  leaveButtonText: {
    color: '#EA5455',
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 0,
  },
  confirmButton: {
    backgroundColor: 'rgba(114, 191, 255, 0.15)',
    borderRadius: 8,
    padding: 7,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 60,
  },
  confirmButtonText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#56AEE9',
  },
});

export default BoxSettingScreen;
