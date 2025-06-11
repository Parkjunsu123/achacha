// 쉐어박스 메인 스크린

import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Image,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
  StatusBar,
  RefreshControl,
  FlatList,
} from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { Text } from '../../components/ui';
import { Shadow } from 'react-native-shadow-2';
import { Icon } from 'react-native-elements';
import { useNavigation, useFocusEffect, useRoute } from '@react-navigation/native';
import { fetchShareBoxes, joinShareBox } from '../../api/shareBoxService';
import { ERROR_MESSAGES } from '../../constants/errorMessages';
import useAuthStore from '../../store/authStore';

// 배경색 배열 - Theme에서 가져온 색상에 30% 투명도 적용
const BACKGROUND_COLORS = [
  'rgba(255, 149, 0, 0.1)', // cardOrange with 30% opacity
  'rgba(13, 186, 63, 0.1)', // cardGreen with 30% opacity
  'rgba(175, 82, 222, 0.1)', // cardPurple with 30% opacity
  'rgba(0, 122, 255, 0.1)', // cardBlue with 30% opacity
  'rgba(48, 176, 199, 0.1)', // cardTeal with 30% opacity
  'rgba(255, 45, 196, 0.1)', // cardPink with 30% opacity
];

// 아이콘 색상 배열 - 불투명 색상
const CARD_COLORS = [
  '#FF9500', // cardOrange
  '#0DBA3F', // cardGreen
  '#AF4AE1', // cardPurple
  '#157BEA', // cardBlue
  '#30B0C7', // cardTeal
  '#ED3EBB', // cardPink
];

// 아이콘 이름 매핑
const MATERIAL_ICONS = {
  box: 'inventory-2',
  person: 'person',
  count: 'local-mall',
};

// 기프티콘 수에 따른 아이콘 선택 함수
const getShareBoxIcon = count => {
  if (count >= 1 && count <= 3) {
    return require('../../assets/images/share_box_icon1.png');
  } else if (count >= 3 && count <= 5) {
    return require('../../assets/images/share_box_icon2.png');
  } else if (count < 1) {
    return require('../../assets/images/share_box_icon0.png');
  } else {
    return require('../../assets/images/share_box_icon3.png');
  }
};

const BoxMainScreen = () => {
  const { theme } = useTheme();
  const [isJoinModalVisible, setIsJoinModalVisible] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  const navigation = useNavigation();
  const [shareBoxes, setShareBoxes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const route = useRoute();
  const isLoggedIn = useAuthStore(state => state.isLoggedIn);

  // 무한스크롤용 데이터 로딩
  const loadShareBoxes = async (nextPage = 0) => {
    if (loading || (!hasNextPage && nextPage !== 0)) {
      console.log('[무한스크롤] 로딩 중이거나 더 이상 데이터가 없습니다:', {
        loading,
        hasNextPage,
        nextPage,
      });
      return;
    }
    setLoading(true);
    try {
      console.log('[무한스크롤] 데이터 로딩 시작:', { nextPage });
      const data = await fetchShareBoxes({ page: nextPage, size: 8 });
      console.log('[무한스크롤] 받아온 데이터:', {
        shareBoxesCount: data.shareBoxes?.length,
        hasNextPage: data.hasNextPage,
        nextPage: data.nextPage,
      });
      setShareBoxes(prev => (nextPage === 0 ? data.shareBoxes : [...prev, ...data.shareBoxes]));
      setHasNextPage(data.hasNextPage);
      setPage(data.nextPage);
    } catch (e) {
      console.error('[무한스크롤] 에러 발생:', e);
      if (nextPage === 0) setShareBoxes([]);
      Alert.alert('목록 불러오기 실패', '쉐어박스 목록을 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadShareBoxes(0);
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      loadShareBoxes(0);
    }, [])
  );

  useEffect(() => {
    console.log('[딥링크 진입] route.params:', route.params);
    if (route.params?.code) {
      console.log('[딥링크 진입] code 파라미터 감지:', route.params.code);
      setInviteCode(route.params.code);
      setIsJoinModalVisible(true);
    }
  }, [route.params?.code]);

  useEffect(() => {
    if (!isLoggedIn) {
      navigation.replace('Login');
    }
  }, [isLoggedIn]);

  // 쉐어박스 참여 버튼 클릭 핸들러
  const handleJoinPress = () => {
    setIsJoinModalVisible(true);
  };

  // 모달 닫기 핸들러
  const handleCloseModal = () => {
    setIsJoinModalVisible(false);
    setInviteCode('');
    // route.params.code가 존재하면 초기화
    if (route.params?.code) {
      navigation.setParams({ code: null });
    }
  };

  // 취소 버튼 핸들러
  const handleCancelPress = () => {
    handleCloseModal();
  };

  // 확인 버튼 핸들러
  const handleConfirmPress = async () => {
    if (!inviteCode.trim()) {
      return;
    }

    try {
      await joinShareBox(inviteCode.trim());
      alert('쉐어박스에 성공적으로 참여하였습니다!');
      handleCloseModal();
      // 쉐어박스 목록 새로고침
      await loadShareBoxes(0);
    } catch (error) {
      // 에러 상세 로그 추가
      console.log('[쉐어박스 참여 에러]', error);
      console.log('[에러코드]', error?.response?.data?.errorCode);
      console.log('[에러메시지]', error?.response?.data?.message);

      let message = '참여에 실패했습니다. 다시 시도해 주세요.';
      const errorCode = error?.response?.data?.errorCode;
      if (errorCode && ERROR_MESSAGES[errorCode]) {
        message = ERROR_MESSAGES[errorCode];
      } else if (error?.response?.data?.message) {
        message = error.response.data.message;
      }
      alert(message);
    }
  };

  // 쉐어박스 생성 버튼 클릭 핸들러
  const handleCreatePress = () => {
    // BoxCreateScreen으로 이동
    navigation.navigate('BoxCreate');
  };

  // 쉐어박스 카드 클릭 핸들러
  const handleBoxPress = item => {
    // BoxListScreen으로 이동
    navigation.navigate('BoxList', {
      shareBoxId: item.shareBoxId || Math.floor(Math.random() * 1000) + 1, // ID가 없는 경우 임의의 ID 생성
      shareBoxName: item.shareBoxName,
    });
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadShareBoxes(0); // 첫 페이지부터 다시 불러오기
    setRefreshing(false);
  };

  // FlatList의 렌더 함수로 분리
  const renderShareBox = ({ item, index }) => {
    // 배경색과 아이콘 색상 설정
    const backgroundColor = BACKGROUND_COLORS[index % BACKGROUND_COLORS.length];
    const cardColor = CARD_COLORS[index % CARD_COLORS.length];
    const iconImage = getShareBoxIcon(item.gifticonCount);
    return (
      <TouchableOpacity
        style={styles.boxWrapper}
        onPress={() => handleBoxPress(item)}
        activeOpacity={0.8}
      >
        <Shadow
          distance={12}
          startColor={'rgba(0, 0, 0, 0.008)'}
          offset={[0, 1]}
          style={styles.shadowContainer}
        >
          <View style={[styles.boxCard, { backgroundColor }]}>
            {/* 상단 정보 영역 */}
            <View style={styles.boxTopArea}>
              {/* 박스명 */}
              <Text
                variant="h3"
                weight="semibold"
                style={styles.boxTitle}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {item.shareBoxName}
              </Text>

              {/* 호스트 정보 */}
              <View style={styles.roleContainer}>
                <Icon
                  name={MATERIAL_ICONS.person}
                  type="material"
                  size={17}
                  color="#718096"
                  containerStyle={styles.personIconContainer}
                />
                <Text variant="body2" weight="semibold" style={styles.boxRole}>
                  {item.shareBoxUserName}
                </Text>
              </View>
            </View>

            {/* 중앙 영역 - 이미지와 카운트를 한 줄에 배치 */}
            <View style={styles.boxMiddleArea}>
              {/* 왼쪽에 카운트 표시 */}
              <View style={[styles.countContainer, { backgroundColor: `${cardColor}20` }]}>
                <Icon
                  name={MATERIAL_ICONS.box}
                  type="material"
                  size={16}
                  color={cardColor}
                  containerStyle={styles.boxCountIconContainer}
                />
                <Text
                  variant="body2"
                  weight="semibold"
                  style={[styles.countText, { color: `${cardColor}` }]}
                >
                  {item.gifticonCount}
                </Text>
              </View>

              {/* 오른쪽에 이미지 배치 */}
              <View style={styles.boxImageArea}>
                <Image source={iconImage} style={styles.boxImage} resizeMode="contain" />
              </View>
            </View>
          </View>
        </Shadow>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.screenContainer, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />

      {/* 새로운 헤더 영역 */}
      <View style={styles.header}>
        <Text variant="h2" weight="bold" style={styles.headerTitle}>
          쉐어박스
        </Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity style={styles.joinButton} onPress={handleJoinPress} activeOpacity={0.7}>
            <Text variant="body2" weight="medium" style={styles.joinButtonText}>
              참여
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.createButton}
            onPress={handleCreatePress}
            activeOpacity={0.7}
          >
            <Text variant="body2" weight="medium" style={styles.createButtonText}>
              생성
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* FlatList로 쉐어박스 목록 렌더링 */}
      <FlatList
        data={shareBoxes}
        keyExtractor={(item, idx) => String(item.shareBoxId || idx)}
        renderItem={renderShareBox}
        numColumns={2}
        contentContainerStyle={styles.scrollContent}
        columnWrapperStyle={{ justifyContent: 'space-between' }}
        onEndReached={() => {
          console.log('[무한스크롤] 스크롤 끝 도달:', {
            currentPage: page,
            loading,
            hasNextPage,
            shareBoxesCount: shareBoxes.length,
          });
          if (!loading && hasNextPage) loadShareBoxes(page);
        }}
        onEndReachedThreshold={0.7}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text variant="body1" style={styles.emptyText}>
              쉐어박스가 없습니다.
            </Text>
          </View>
        }
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
      />

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#56AEE9" />
        </View>
      )}

      {/* 초대코드 입력 모달 */}
      <Modal
        visible={isJoinModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text variant="h3" weight="bold" style={styles.modalTitle}>
              초대코드 입력하기
            </Text>
            <Text variant="body2" style={styles.modalSubtitle}>
              {'초대받은 쉐어박스에 참여하려면\n공유받은 초대코드를 입력해 주세요.'}
            </Text>
            <TextInput
              style={styles.codeInput}
              placeholder="초대코드"
              placeholderTextColor="#A0AEC0"
              value={inviteCode}
              onChangeText={text => {
                // 영문(대소문자) 또는 숫자만 허용, 10자리로 자르기
                const filtered = text.replace(/[^a-zA-Z0-9]/g, '').slice(0, 10);
                setInviteCode(filtered);
              }}
              autoCapitalize="characters"
              autoCorrect={false}
              fontFamily="Pretendard-Regular"
              maxLength={10}
            />
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleCancelPress}
                activeOpacity={0.7}
              >
                <Text variant="body1" weight="medium" style={styles.cancelButtonText}>
                  취소
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={handleConfirmPress}
                activeOpacity={0.7}
              >
                <Text variant="body1" weight="medium" style={styles.confirmButtonText}>
                  확인
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
  },
  header: {
    height: 80,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingTop: 30,
    paddingBottom: 0,
    marginBottom: 0,
    backgroundColor: 'transparent',
  },
  headerTitle: {
    fontSize: 24,
    letterSpacing: -0.5,
    fontFamily: 'Pretendard-Bold',
  },
  headerButtons: {
    flexDirection: 'row',
  },
  joinButton: {
    backgroundColor: '#E5F4FE',
    paddingHorizontal: 25,
    paddingVertical: 8,
    borderRadius: 10,
    marginRight: 7,
  },
  joinButtonText: {
    color: '#56AEE9',
    fontFamily: 'Pretendard-Medium',
  },
  createButton: {
    backgroundColor: '#56AEE9',
    paddingHorizontal: 25,
    paddingVertical: 8,
    borderRadius: 10,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontFamily: 'Pretendard-Medium',
  },
  scrollContent: {
    paddingTop: 10,
    paddingBottom: 30,
    paddingHorizontal: 2,
  },
  boxesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  boxWrapper: {
    width: '48%',
    marginBottom: 12,
  },
  shadowContainer: {
    borderRadius: 12,
    width: '100%',
  },
  boxCard: {
    width: '100%',
    borderRadius: 12,
    padding: 13,
    paddingBottom: 2,
    overflow: 'visible',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
  },
  boxTopArea: {
    width: '100%',
  },
  boxTitle: {
    fontSize: 18,
    letterSpacing: -0.3,
    marginBottom: 2,
    marginLeft: 1,
    color: '#000000',
    paddingRight: 5,
    fontFamily: 'Pretendard-SemiBold',
  },
  roleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  personIconContainer: {
    marginRight: 2,
    padding: 0,
  },
  boxRole: {
    color: '#718096',
    fontFamily: 'Pretendard-Regular',
    fontSize: 13,
    letterSpacing: -0.2,
    marginBottom: 2,
  },
  boxMiddleArea: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    marginBottom: 0,
  },
  boxImageArea: {
    marginTop: -10,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  boxImage: {
    width: 60,
    height: 60,
    marginBottom: 2,
  },
  countContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    marginTop: 7,
    alignSelf: 'flex-start',
  },
  boxCountIconContainer: {
    marginRight: 4,
    padding: 0,
  },
  countText: {
    fontSize: 12,
    fontFamily: 'Pretendard-Bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    marginBottom: 8,
    textAlign: 'center',
    fontFamily: 'Pretendard-Bold',
  },
  modalSubtitle: {
    color: '#718096',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
    fontFamily: 'Pretendard-Regular',
  },
  codeInput: {
    width: '100%',
    height: 48,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 16,
    marginBottom: 24,
    fontSize: 16,
    fontFamily: 'Pretendard-Regular',
  },
  buttonContainer: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#E2E8F0',
    paddingVertical: 12,
    borderRadius: 10,
    marginRight: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#4A5568',
    fontFamily: 'Pretendard-Medium',
  },
  confirmButton: {
    flex: 1,
    backgroundColor: '#56AEE9',
    paddingVertical: 12,
    borderRadius: 10,
    marginLeft: 8,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: 'white',
    fontFamily: 'Pretendard-Medium',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: '#718096',
    fontFamily: 'Pretendard-Regular',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default BoxMainScreen;
