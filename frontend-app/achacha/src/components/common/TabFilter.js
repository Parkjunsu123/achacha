/* eslint-disable react-native/no-inline-styles */
import React, { useState, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { Chip } from '../ui';
import { useTheme } from '../../hooks/useTheme';

/**
 * 탭 형태의 필터 컴포넌트
 * @param {Array} tabs - 표시할 탭 목록 (배열 형태: [{id: string, title: string, width?: number}])
 * @param {Function} onTabChange - 탭 변경 시 호출될 함수 (선택된 탭 ID를 인자로 받음)
 * @param {String} initialTabId - 초기 선택 탭 ID (기본값: 첫 번째 탭)
 * @param {Object} containerStyle - 컨테이너에 적용할 스타일
 */
const TabFilter = ({ tabs = [], onTabChange, initialTabId, containerStyle }) => {
  const { theme, colors } = useTheme();
  const [selectedTabId, setSelectedTabId] = useState(initialTabId || tabs[0]?.id || '');

  // initialTabId가 변경되면 내부 상태 업데이트
  useEffect(() => {
    if (initialTabId) {
      setSelectedTabId(initialTabId);
    }
  }, [initialTabId]);

  const handleTabPress = tabId => {
    setSelectedTabId(tabId);
    if (onTabChange) {
      onTabChange(tabId);
    }
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {tabs.map(tab => {
        const isSelected = tab.id === selectedTabId;
        return (
          <Chip
            key={tab.id}
            title={tab.title}
            variant="tab"
            isSelected={isSelected}
            onPress={() => handleTabPress(tab.id)}
            containerStyle={[
              styles.tab,
              {
                borderColor: isSelected ? colors.primary : colors.grey2,
                borderWidth: theme.Chip.buttonStyle.borderWidth,
                minWidth: tab.width || 55,
                justifyContent: 'center',
              },
            ]}
            titleStyle={[
              styles.tabText,
              theme.Chip.titleStyle,
              {
                color: isSelected ? colors.black : colors.black,
                fontSize: 13,
                textAlignVertical: 'center',
                includeFontPadding: false,
                fontFamily: isSelected ? 'Pretendard-Bold' : 'Pretendard-Regular',
              },
            ]}
          />
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 2,
    paddingHorizontal: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  tab: {
    height: 38,
    paddingHorizontal: 6,
    borderRadius: 8,
    marginRight: 6,
    backgroundColor: 'white',
    alignItems: 'center',
  },
  tabText: {
    fontWeight: '400',
    fontSize: 12,
    lineHeight: 16,
    textAlign: 'center',
    fontFamily: 'Pretendard-Regular',
  },
});

export default TabFilter;
