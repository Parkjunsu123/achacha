import React from 'react';
import { View } from 'react-native';
import { Skeleton as RNESkeleton } from 'react-native-elements';
import { skeletonUtils } from '../../theme/themeUtils';

/**
 * 스켈레톤 로딩 컴포넌트
 */
export const Skeleton = ({
  width,
  height,
  variant = 'rect', // rect, circle, text
  animation = true,
  style,
  borderRadius,
  ...props
}) => {
  // themeUtils를 사용하여 변형에 따른 스타일 계산
  const variantStyle = skeletonUtils.getVariantStyle(variant, width, height, borderRadius);

  return (
    <RNESkeleton
      animation={animation ? 'wave' : 'none'}
      width={variantStyle.width}
      height={variantStyle.height}
      style={[{ borderRadius: variantStyle.borderRadius }, style]}
      {...props}
    />
  );
};

// 미리 정의된 스켈레톤 패턴
export const SkeletonGroup = ({
  type = 'list', // list, card, profile, detail
  count = 1,
  style,
}) => {
  const styles = skeletonUtils.getSkeletonStyles();

  const renderItems = () => {
    const items = [];

    for (let i = 0; i < count; i++) {
      switch (type) {
        case 'card':
          items.push(
            <View key={i} style={[styles.card, style]}>
              <Skeleton width="100%" height={120} />
              <View style={styles.cardContent}>
                <Skeleton variant="text" width="80%" />
                <Skeleton variant="text" width="60%" style={styles.mt10} />
                <Skeleton variant="text" width="40%" style={styles.mt10} />
              </View>
            </View>
          );
          break;

        case 'profile':
          items.push(
            <View key={i} style={[styles.profile, style]}>
              <Skeleton variant="circle" width={60} height={60} />
              <View style={styles.profileContent}>
                <Skeleton variant="text" width="70%" />
                <Skeleton variant="text" width="40%" style={styles.mt10} />
              </View>
            </View>
          );
          break;

        case 'detail':
          items.push(
            <View key={i} style={[styles.detail, style]}>
              <Skeleton variant="text" width="60%" height={24} />
              <Skeleton variant="text" width="90%" style={styles.mt10} />
              <Skeleton variant="text" width="90%" style={styles.mt5} />
              <Skeleton variant="text" width="90%" style={styles.mt5} />
              <Skeleton width="100%" height={200} style={styles.mt10} />
            </View>
          );
          break;

        case 'list':
        default:
          items.push(
            <View key={i} style={[styles.listItem, style]}>
              <Skeleton variant="circle" width={40} height={40} />
              <View style={styles.listContent}>
                <Skeleton variant="text" width="80%" />
                <Skeleton variant="text" width="60%" style={styles.mt5} />
              </View>
            </View>
          );
          break;
      }
    }

    return items;
  };

  return <View style={styles.groupContainer}>{renderItems()}</View>;
};

export default Skeleton;
