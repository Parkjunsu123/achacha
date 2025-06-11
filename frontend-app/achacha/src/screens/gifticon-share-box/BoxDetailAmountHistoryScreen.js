// 쉐어박스 금액형 사용내역 스크린

import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Icon } from 'react-native-elements';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text, Divider, AlertDialog } from '../../components/ui';
import { useTheme } from '../../hooks/useTheme';
import { useTabBar } from '../../context/TabBarContext';
import { useRoute, useNavigation } from '@react-navigation/native';
import gifticonService from '../../api/gifticonService';

const BoxDetailAmountHistoryScreen = () => {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { showTabBar, hideTabBar } = useTabBar();
  const route = useRoute();
  const navigation = useNavigation();
  const [transactions, setTransactions] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [scope, setScope] = useState('SHARE_BOX');
  const [usageType, setUsageType] = useState(null);
  const [gifticonId, setGifticonId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [gifticonData, setGifticonData] = useState(null);
  const [brandName, setBrandName] = useState('');
  const [gifticonName, setGifticonName] = useState('');
  const [usedAmount, setUsedAmount] = useState(null);
  const [error, setError] = useState(null);

  // AlertDialog 관련 상태 변수
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [alertCallback, setAlertCallback] = useState(null);

  // 바텀탭 표시
  useEffect(() => {
    showTabBar();

    // 라우트 파라미터에서 정보 가져오기
    if (route.params) {
      if (route.params.id) {
        setGifticonId(route.params.id);
      } else if (route.params.gifticonId) {
        setGifticonId(route.params.gifticonId);
      }

      if (route.params.scope) {
        setScope(route.params.scope);
      }

      if (route.params.usageType) {
        setUsageType(route.params.usageType);
      }

      // 브랜드명이 전달된 경우 이를 미리 설정
      if (route.params.brandName && !gifticonData) {
        setGifticonData(prevData => ({
          ...prevData,
          brand: route.params.brandName,
          name: route.params.gifticonName || '',
        }));
      }

      // 사용 금액 정보 있는 경우 설정
      if (route.params.usedAmount) {
        setUsedAmount(route.params.usedAmount);
      }
    }
  }, [route.params, showTabBar, gifticonData]);

  // 기프티콘 ID가 변경될 때 사용내역 로드
  useEffect(() => {
    if (gifticonId) {
      loadUsageHistory();
    }
  }, [gifticonId]);

  // 사용내역 로드 함수
  const loadUsageHistory = async () => {
    try {
      setLoading(true);

      // 먼저 기프티콘 상세 정보를 가져와서 브랜드명을 얻습니다.
      let brandName = '';
      try {
        // 먼저 상세 정보를 통해 브랜드명 가져오기 시도
        const detailResponse = await gifticonService.getGifticonDetail(gifticonId, scope);
        brandName = detailResponse.brandName || '';
      } catch (detailError) {
        console.log('상세 정보 조회 실패, 브랜드명을 가져오지 못했습니다:', detailError);
      }

      // 사용내역 API 호출
      const response = await gifticonService.getAmountGifticonUsageHistory(gifticonId);

      setGifticonData({
        id: response.gifticonId,
        brand: brandName || response.brandName || '', // 브랜드명 설정
        name: response.gifticonName,
        amount: response.gifticonOriginalAmount,
        totalBalance: response.gifticonOriginalAmount,
        usedAmount: response.gifticonOriginalAmount - response.gifticonRemainingAmount,
        remainingBalance: response.gifticonRemainingAmount,
      });

      // API 응답에서 거래내역 데이터 구성
      if (response.usageHistories && response.usageHistories.length > 0) {
        // 날짜 기준 내림차순 정렬
        const sortedHistories = [...response.usageHistories].sort((a, b) => {
          return new Date(b.usageHistoryCreatedAt) - new Date(a.usageHistoryCreatedAt);
        });

        // 트랜잭션 데이터 구성
        const formattedTransactions = sortedHistories.map(history => ({
          id: history.usageHistoryId.toString(),
          userName: history.userName,
          date: formatDateTime(history.usageHistoryCreatedAt),
          amount: history.usageAmount,
          type: 'payment',
          timestamp: new Date(history.usageHistoryCreatedAt).getTime(),
        }));

        setTransactions(formattedTransactions);
      } else {
        setTransactions([]);
      }

      // 만약 API에서 브랜드명과 기프티콘명을 제공하는 경우, 여기에 추가
      if (response.brandName && !brandName) {
        setBrandName(response.brandName);
      }

      if (response.gifticonName && !gifticonName) {
        setGifticonName(response.gifticonName);
      }

      setLoading(false);
    } catch (error) {
      console.error('사용내역 로드 중 오류 발생:', error);

      // 에러 메시지 표시
      if (error.response) {
        const status = error.response.status;
        const errorData = error.response.data;

        if (status === 403) {
          showAlert('접근 권한 없음', '해당 기프티콘에 접근할 수 없습니다.');
        } else if (status === 404) {
          showAlert('사용내역 없음', '사용내역을 찾을 수 없습니다.');
        } else {
          showAlert(
            '오류',
            `사용내역을 불러오는 중 오류가 발생했습니다. ${errorData?.message || ''}`
          );
        }
      } else {
        showAlert('오류', '네트워크 연결을 확인해주세요.');
      }

      // 오류 발생 시 route.params에서 전달된 정보를 사용해 임시 트랜잭션 생성
      if (route.params?.usedAmount) {
        const tempTransaction = {
          id: '1',
          userName: '사용자',
          date: formatDateTime(new Date()),
          amount:
            typeof route.params.usedAmount === 'string'
              ? parseInt(route.params.usedAmount.replace(/,/g, ''), 10)
              : route.params.usedAmount,
          type: 'payment',
          rawDate: new Date(),
        };

        setTransactions([tempTransaction]);
      }

      setLoading(false);
    }
  };

  // 날짜 포맷 함수 (YYYY.MM.DD HH:MM)
  const formatDateTime = dateTimeString => {
    const date = new Date(dateTimeString);
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const hh = String(date.getHours()).padStart(2, '0');
    const min = String(date.getMinutes()).padStart(2, '0');

    return `${yyyy}.${mm}.${dd} ${hh}:${min}`;
  };

  // 숫자에 천단위 콤마 추가
  const formatNumber = number => {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  // 뒤로가기 함수
  const handleGoBack = () => {
    navigation.goBack();
  };

  // 수정하기 함수
  const handleEdit = transactionId => {
    const transaction = transactions.find(t => t.id === transactionId);
    if (transaction) {
      setEditingId(transactionId);
      setEditValue(transaction.amount.toString());
    }
  };

  // 수정 취소 함수
  const handleCancelEdit = () => {
    setEditingId(null);
    setEditValue('');
  };

  // 수정 저장 함수
  const handleSaveEdit = async transactionId => {
    // 입력값 검증
    if (!editValue || editValue.trim() === '') {
      showAlert('알림', '금액을 입력해주세요.');
      return;
    }

    // 숫자 변환 전 입력값 검증 (숫자만 허용)
    if (!/^\d+$/.test(editValue)) {
      showAlert('알림', '금액은 숫자만 입력 가능합니다.');
      return;
    }

    // 숫자로 변환
    const amount = parseInt(editValue, 10);
    if (isNaN(amount) || amount <= 0) {
      showAlert('알림', '올바른 금액을 입력하세요. (0보다 큰 숫자)');
      return;
    }

    try {
      setLoading(true);

      console.log('[BoxDetailAmountHistoryScreen] 사용내역 수정 요청:', {
        gifticonId,
        transactionId,
        amount,
        inputType: typeof amount,
      });

      // API 호출로 사용내역 수정
      await gifticonService.updateAmountGifticonUsageHistory(
        gifticonId,
        parseInt(transactionId, 10),
        amount
      );

      // UI 상태 업데이트
      setTransactions(prev => {
        const updatedTransactions = prev.map(item =>
          item.id === transactionId ? { ...item, amount } : item
        );
        // 정렬 유지
        return [...updatedTransactions].sort((a, b) => b.timestamp - a.timestamp);
      });

      setEditingId(null);
      setEditValue('');

      // 전체 데이터 다시 로드 (잔액 업데이트를 위해)
      await loadUsageHistory();

      // 성공 메시지 표시
      showAlert('성공', '기프티콘 사용금액이 변경되었습니다.', () => {
        // 이전 화면으로 돌아가기
        navigation.goBack();
      });
    } catch (error) {
      console.error('사용내역 수정 오류:', error);

      // 에러 메시지 표시
      let errorMessage = '사용내역 수정 중 오류가 발생했습니다.';

      if (error.response) {
        console.error('에러 응답:', JSON.stringify(error.response.data, null, 2));

        const status = error.response.status;

        // 특정 에러 코드에 따른 메시지 처리
        if (status === 400) {
          errorMessage = '잘못된 요청입니다. 금액을 확인해주세요.';
        } else if (status === 403) {
          errorMessage = '권한이 없습니다.';
        } else if (status === 404) {
          errorMessage = '해당 사용내역을 찾을 수 없습니다.';
        } else if (status === 500) {
          errorMessage = '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
        }

        // 서버에서 온 메시지가 있으면 이를 우선 사용
        if (error.response.data?.message) {
          errorMessage = error.response.data.message;
        }
      } else if (error.request) {
        errorMessage = '서버 응답이 없습니다. 네트워크 연결을 확인해주세요.';
      } else {
        errorMessage = `오류: ${error.message}`;
      }

      showAlert('오류', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // 삭제하기 함수
  const handleDelete = transactionId => {
    showAlert('거래 내역 삭제', '이 거래 내역을 삭제하시겠습니까?', async () => {
      try {
        setLoading(true);

        console.log('[BoxDetailAmountHistoryScreen] 사용내역 삭제 요청:', {
          gifticonId,
          transactionId,
        });

        // API 호출로 사용내역 삭제
        await gifticonService.deleteAmountGifticonUsageHistory(
          gifticonId,
          parseInt(transactionId, 10)
        );

        // UI 상태 업데이트
        setTransactions(prev => {
          const filteredTransactions = prev.filter(item => item.id !== transactionId);
          return filteredTransactions;
        });

        // 전체 데이터 다시 로드 (잔액 업데이트를 위해)
        await loadUsageHistory();

        // 성공 메시지 표시
        showAlert('성공', '기프티콘 사용내역이 삭제되었습니다.', () => {
          // 이전 화면으로 돌아가기
          navigation.goBack();
        });
      } catch (error) {
        console.error('사용내역 삭제 오류:', error);

        // 에러 메시지 표시
        let errorMessage = '사용내역 삭제 중 오류가 발생했습니다.';

        if (error.response) {
          console.error('에러 응답:', JSON.stringify(error.response.data, null, 2));

          const status = error.response.status;

          // 특정 에러 코드에 따른 메시지 처리
          if (status === 400) {
            errorMessage = '잘못된 요청입니다.';
          } else if (status === 403) {
            errorMessage = '권한이 없습니다.';
          } else if (status === 404) {
            errorMessage = '해당 사용내역을 찾을 수 없습니다.';
          } else if (status === 500) {
            errorMessage = '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
          }

          // 서버에서 온 메시지가 있으면 이를 우선 사용
          if (error.response.data?.message) {
            errorMessage = error.response.data.message;
          }
        } else if (error.request) {
          errorMessage = '서버 응답이 없습니다. 네트워크 연결을 확인해주세요.';
        } else {
          errorMessage = `오류: ${error.message}`;
        }

        showAlert('오류', errorMessage);
      } finally {
        setLoading(false);
      }
    });
  };

  // amount 표시 함수
  const renderAmount = (amount, type) => {
    const prefix = type === 'payment' ? '-' : '';
    return `${prefix}${formatNumber(amount)}원`;
  };

  // AlertDialog를 표시하는 함수
  const showAlert = (title, message, callback = null) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertCallback(() => callback);
    setAlertVisible(true);
  };

  // AlertDialog 닫기 함수
  const closeAlert = () => {
    setAlertVisible(false);
    if (alertCallback) {
      alertCallback();
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />

      {/* 안전 영역 상단 여백 */}
      <View style={{ height: insets.top, backgroundColor: theme.colors.background }} />

      {/* 커스텀 헤더 */}
      <View style={[styles.header, { backgroundColor: theme.colors.background }]}>
        <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
          <Icon name="chevron-left" type="feather" size={24} color={theme.colors.black} />
        </TouchableOpacity>
        <Text variant="h3" weight="bold" style={styles.headerTitle}>
          기프티콘 사용내역
        </Text>
        <View style={styles.rightPlaceholder} />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#56AEE9" />
          <Text style={styles.loadingText}>데이터를 불러오는 중...</Text>
        </View>
      ) : scope === 'USED' && usageType !== 'SELF_USE' ? (
        <View style={styles.noAccessContainer}>
          <Text style={styles.noAccessText}>
            직접 사용한 기프티콘만 사용내역을 확인할 수 있습니다.
          </Text>
        </View>
      ) : !gifticonData ? (
        <View style={styles.noAccessContainer}>
          <Text style={styles.noAccessText}>기프티콘 정보를 찾을 수 없습니다.</Text>
        </View>
      ) : (
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.contentContainer}>
            <View style={styles.infoHeaderContainer}>
              <Text style={styles.brandText}>{brandName}</Text>
              <Text weight="bold" style={styles.nameText}>
                {gifticonName}
              </Text>
            </View>

            {/* 잔액 정보 */}
            <View style={styles.balanceSection}>
              <View style={styles.balanceRow}>
                <Text style={styles.balanceLabel}>총 금액</Text>
                <Text weight="bold" style={styles.balanceValue}>
                  {formatNumber(gifticonData.totalBalance)}원
                </Text>
              </View>
              <View style={styles.balanceRow}>
                <Text style={styles.balanceLabel}>사용 금액</Text>
                <Text weight="bold" style={styles.balanceValue}>
                  {formatNumber(gifticonData.usedAmount)}원
                </Text>
              </View>
              <View style={styles.balanceRow}>
                <Text style={styles.balanceLabel}>남은 금액</Text>
                <Text weight="bold" style={[styles.balanceValue, { color: '#56AEE9' }]}>
                  {formatNumber(gifticonData.remainingBalance)}원
                </Text>
              </View>
            </View>

            <Divider style={styles.divider} />

            {/* 거래 내역 */}
            <View style={styles.transactionsContainer}>
              {transactions.length === 0 ? (
                <View style={styles.emptyStateContainer}>
                  <Text style={styles.emptyStateText}>사용 내역이 없습니다.</Text>
                </View>
              ) : (
                transactions.map(transaction => (
                  <View key={transaction.id}>
                    {editingId === transaction.id ? (
                      <View style={styles.editItemContainer}>
                        <View style={styles.editInfoSection}>
                          <Text weight="bold" style={styles.transactionUser}>
                            {transaction.userName}
                          </Text>
                          <Text style={styles.transactionDate}>{transaction.date}</Text>
                        </View>
                        <View style={styles.editActionSection}>
                          <TextInput
                            style={styles.editInput}
                            value={editValue}
                            onChangeText={setEditValue}
                            keyboardType="numeric"
                            placeholder="금액 입력"
                          />
                          <TouchableOpacity
                            style={[styles.editButton, styles.cancelButton]}
                            onPress={handleCancelEdit}
                          >
                            <Text style={styles.cancelButtonText}>취소</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[styles.editButton, styles.saveButton]}
                            onPress={() => handleSaveEdit(transaction.id)}
                          >
                            <Text style={styles.saveButtonText}>수정</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    ) : (
                      <View style={styles.transactionItem}>
                        <View style={styles.transactionLeft}>
                          <Text weight="bold" style={styles.transactionUser}>
                            {transaction.userName}
                          </Text>
                          <Text style={styles.transactionDate}>{transaction.date}</Text>
                        </View>
                        <View style={styles.transactionRight}>
                          <Text weight="bold" style={[styles.amountText, { color: '#56AEE9' }]}>
                            {renderAmount(transaction.amount, transaction.type)}
                          </Text>
                          <View style={styles.actionIcons}>
                            <TouchableOpacity
                              onPress={() => handleEdit(transaction.id)}
                              style={styles.iconButton}
                            >
                              <Icon name="edit" type="feather" size={20} color="#AAAAAA" />
                            </TouchableOpacity>
                            <TouchableOpacity
                              onPress={() => handleDelete(transaction.id)}
                              style={styles.iconButton}
                            >
                              <Icon name="trash-2" type="feather" size={20} color="#AAAAAA" />
                            </TouchableOpacity>
                          </View>
                        </View>
                      </View>
                    )}
                  </View>
                ))
              )}
            </View>
          </View>
        </ScrollView>
      )}

      {/* AlertDialog */}
      <AlertDialog
        isVisible={alertVisible}
        title={alertTitle}
        message={alertMessage}
        confirmText="확인"
        onConfirm={closeAlert}
        hideCancel={true}
        type="info"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    textAlign: 'center',
    flex: 1,
  },
  rightPlaceholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 24,
  },
  infoHeaderContainer: {
    marginVertical: 10,
    alignItems: 'center',
  },
  brandText: {
    fontSize: 18,
    color: '#333',
    marginBottom: 7,
  },
  nameText: {
    fontSize: 20,
    color: '#000',
    marginTop: 4,
    textAlign: 'center',
  },
  balanceSection: {
    marginTop: 10,
    borderRadius: 12,
    padding: 16,
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
  },
  balanceLabel: {
    fontSize: 18,
    color: '#737373',
  },
  balanceValue: {
    fontSize: 18,
    color: '#333',
  },
  divider: {
    marginVertical: 20,
  },
  transactionsContainer: {
    marginTop: 10,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 12,
  },
  transactionLeft: {
    flexDirection: 'column',
    justifyContent: 'center',
  },
  transactionRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  transactionUser: {
    fontSize: 16,
    color: '#333',
  },
  transactionDate: {
    fontSize: 14,
    color: '#737373',
    marginTop: 4,
  },
  amountText: {
    fontSize: 18,
    color: '#278CCC',
    marginRight: 15,
  },
  actionIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    padding: 2,
    marginLeft: 4,
  },
  editItemContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  editInfoSection: {
    marginBottom: 12,
  },
  editActionSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editInput: {
    flex: 1,
    height: 40,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 10,
  },
  editButton: {
    height: 40,
    paddingHorizontal: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  cancelButton: {
    backgroundColor: '#CDE7F9',
  },
  saveButton: {
    backgroundColor: '#56AEE9',
  },
  cancelButtonText: {
    color: '#56AEE9',
    fontSize: 14,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 14,
  },
  noAccessContainer: {
    padding: 24,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: 300,
  },
  noAccessText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  emptyStateContainer: {
    padding: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});

export default BoxDetailAmountHistoryScreen;
