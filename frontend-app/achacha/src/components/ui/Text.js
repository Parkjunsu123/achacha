import React from 'react';
import { Text as RNText } from 'react-native';
import useTheme from '../../hooks/useTheme';

/**
 * 글로벌 폰트 스타일을 적용한 커스텀 Text 컴포넌트
 *
 * @param {Object} props - 컴포넌트 프롭스
 * @param {string} props.variant - 텍스트 스타일 변형 (h1, h2, h3, h4, h5, body1, body2, caption, button, subtitle1, subtitle2)
 * @param {string} props.weight - 폰트 가중치 (thin, extraLight, light, regular, medium, semiBold, bold, extraBold, black)
 * @param {number} props.size - 커스텀 폰트 크기
 * @param {string} props.color - 텍스트 색상
 * @param {Object} props.style - 추가 스타일
 * @param {boolean} props.center - 텍스트 중앙 정렬 여부
 * @returns {React.ReactElement} - 커스텀 텍스트 컴포넌트
 */
const Text = ({
  children,
  variant = 'body1',
  weight,
  size,
  color,
  style,
  center = false,
  ...rest
}) => {
  const { theme } = useTheme();

  // 기본 스타일 가져오기
  const variantStyle = theme.typography[variant] || theme.typography.body1;

  // 가중치가 지정된 경우 폰트 패밀리 재정의
  const fontFamily = weight ? theme.fonts.fontWeight[weight] : variantStyle.fontFamily;

  // 기본 스타일에 사용자 정의 스타일 적용
  const textStyle = {
    ...variantStyle,
    fontFamily,
    ...(size && { fontSize: size }),
    ...(color && { color: theme.colors[color] || color }),
    ...(center && { textAlign: 'center' }),
  };

  return (
    <RNText style={[textStyle, style]} {...rest}>
      {children}
    </RNText>
  );
};

export default Text;
