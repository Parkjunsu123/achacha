import React from 'react';
import { View, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import { withTheme } from 'react-native-elements';

/**
 * Divider 컴포넌트는 화면의 섹션을 구분하는 선을 표시합니다.
 */
const Divider = ({
  style,
  color,
  width,
  orientation = 'horizontal',
  subHeader,
  subHeaderStyle,
  inset = false,
  insetType = 'left',
  theme,
  ...rest
}) => {
  const { divider } = theme;

  return (
    <View
      style={StyleSheet.flatten([
        styles.divider,
        orientation === 'vertical' && styles.vertical,
        inset && (insetType === 'left' ? styles.leftInset : styles.rightInset),
        {
          borderColor: color || divider?.color || theme?.colors?.divider || '#e0e0e0',
          borderBottomWidth: width || divider?.width || StyleSheet.hairlineWidth,
        },
        style,
      ])}
      {...rest}
    />
  );
};

const styles = StyleSheet.create({
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'transparent',
    borderBottomWidth: StyleSheet.hairlineWidth,
    marginVertical: 8,
  },
  vertical: {
    height: 'auto',
    marginHorizontal: 8,
    borderBottomWidth: 0,
    borderRightWidth: StyleSheet.hairlineWidth,
    width: StyleSheet.hairlineWidth,
  },
  leftInset: {
    marginLeft: 72,
  },
  rightInset: {
    marginRight: 72,
  },
});

Divider.propTypes = {
  /**
   * 스타일 오버라이드
   */
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  /**
   * 라인 색상
   */
  color: PropTypes.string,
  /**
   * 라인 두께
   */
  width: PropTypes.number,
  /**
   * 방향 ('horizontal' 또는 'vertical')
   */
  orientation: PropTypes.oneOf(['horizontal', 'vertical']),
  /**
   * 서브헤더 텍스트
   */
  subHeader: PropTypes.string,
  /**
   * 서브헤더 스타일
   */
  subHeaderStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  /**
   * 들여쓰기 사용 여부
   */
  inset: PropTypes.bool,
  /**
   * 들여쓰기 방향 ('left' 또는 'right')
   */
  insetType: PropTypes.oneOf(['left', 'right']),
  /**
   * 테마 (withTheme에서 제공)
   */
  theme: PropTypes.object,
};

export default withTheme(Divider, 'Divider');
