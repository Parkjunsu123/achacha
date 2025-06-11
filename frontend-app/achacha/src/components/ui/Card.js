import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Icon } from 'react-native-elements';
import { Shadow } from 'react-native-shadow-2';
import FastImage from 'react-native-fast-image';
import { Text } from './index';

/**
 * 기본 Card 컴포넌트
 */
const Card = ({ children, style, ...props }) => {
  return (
    <Shadow
      distance={12}
      startColor={'rgba(0, 0, 0, 0.007)'}
      offset={[0, 1]}
      style={styles.shadowContainer}
    >
      <View style={[styles.card, style]} {...props}>
        {children}
      </View>
    </Shadow>
  );
};

/**
 * GiftCard 컴포넌트 - HomeScreen의 기프티콘 카드
 */
const GiftCard = ({ brand, name, image, daysLeft, style, ...props }) => {
  return (
    // eslint-disable-next-line react-native/no-inline-styles
    <View style={{ width: 180, height: 200, marginRight: 10 }}>
      <Shadow
        distance={12}
        startColor={'rgba(0, 0, 0, 0.008)'}
        offset={[0, 1]}
        style={styles.giftShadowContainer}
      >
        <View style={[styles.giftCard, style]} {...props}>
          <View style={styles.giftImageContainer}>
            <FastImage
              source={image}
              style={styles.giftImage}
              resizeMode={FastImage.resizeMode.contain}
            />
          </View>
          <View style={styles.giftInfo}>
            <Text variant="caption" weight="semiBold" style={styles.giftBrand}>
              {brand}
            </Text>
            <Text variant="body2" style={styles.giftName} numberOfLines={1} ellipsizeMode="tail">
              {name}
            </Text>
          </View>
          <View style={styles.dDayContainer}>
            <Text variant="caption" weight="semiBold" style={styles.dDayText}>
              D-{daysLeft}
            </Text>
          </View>
        </View>
      </Shadow>
    </View>
  );
};

/**
 * FeatureCard 컴포넌트 - HomeScreen의 쉐어박스 카드
 */
const FeatureCard = ({ title, iconName, count, imageSource, style, onPress, ...props }) => {
  // 터치 가능한 View로 래핑
  const CardContent = () => (
    <View style={[styles.featureCard, style]} {...props}>
      <Text variant="body1" weight="semiBold" style={styles.featureTitle}>
        {title}
      </Text>
      {iconName && count && (
        <View style={styles.shareBoxIcon}>
          <Icon name={iconName} size={24} color="#737373" />
          <Text variant="caption" style={styles.shareBoxCount}>
            {count}
          </Text>
        </View>
      )}
      {imageSource && (
        <FastImage
          source={imageSource}
          style={styles.featureImage}
          resizeMode={FastImage.resizeMode.contain}
        />
      )}
    </View>
  );

  // onPress 속성이 있는 경우 TouchableOpacity로 감싸고, 그렇지 않으면 일반 View 사용
  return (
    // eslint-disable-next-line react-native/no-inline-styles
    <View style={{ width: '48%' }}>
      <Shadow
        distance={12}
        startColor={'rgba(0, 0, 0, 0.008)'}
        offset={[0, 1]}
        style={styles.featureShadowContainer}
      >
        {onPress ? (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={onPress}
            style={{ width: '100%', height: '100%' }}
          >
            <CardContent />
          </TouchableOpacity>
        ) : (
          <CardContent />
        )}
      </Shadow>
    </View>
  );
};

/**
 * RadarCard 컴포넌트 - HomeScreen의 레이더 카드
 */
const RadarCard = ({ text, image, style, onPress, ...props }) => {
  // 터치 가능한 View로 래핑
  const CardContent = () => (
    <View style={[styles.radarCard, style]} {...props}>
      <Text variant="h5" weight="bold" style={styles.radarText}>
        {text}
      </Text>
      <FastImage
        source={image}
        style={styles.fullRadarImage}
        resizeMode={FastImage.resizeMode.cover}
      />
    </View>
  );

  // onPress 속성이 있는 경우 TouchableOpacity로 감싸고, 그렇지 않으면 일반 View 사용
  return (
    // eslint-disable-next-line react-native/no-inline-styles
    <View style={{ width: '48%' }}>
      <Shadow
        distance={12}
        startColor={'rgba(0, 0, 0, 0.008)'}
        offset={[0, 1]}
        style={styles.featureShadowContainer}
      >
        {onPress ? (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={onPress}
            style={{ width: '100%', height: '100%' }}
          >
            <CardContent />
          </TouchableOpacity>
        ) : (
          <CardContent />
        )}
      </Shadow>
    </View>
  );
};

/**
 * GiftCard2 컴포넌트 - HomeScreen의 하단 선물 카드
 */
const GiftCard2 = ({ title, subtitle, image, style, ...props }) => {
  return (
    <Shadow
      distance={12}
      startColor={'rgba(0, 0, 0, 0.008)'}
      offset={[0, 1]}
      style={styles.shadowContainer}
    >
      <View style={[styles.giftCard2, style]} {...props}>
        <View style={styles.giftCard2Content}>
          <View>
            <Text variant="subtitle1" weight="semiBold" style={styles.giftCard2Text}>
              {title}
            </Text>
            <Text variant="body2" style={styles.giftCard2SubText}>
              {subtitle}
            </Text>
          </View>
          <FastImage
            source={image}
            style={styles.giftCard2Image}
            resizeMode={FastImage.resizeMode.contain}
          />
        </View>
      </View>
    </Shadow>
  );
};

// 스타일 정의
const styles = StyleSheet.create({
  card: {
    width: '100%',
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    marginBottom: 12,
  },
  // GiftCard 스타일
  giftCard: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
  },
  giftImageContainer: {
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    margin: 10,
    borderRadius: 8,
  },
  giftImage: {
    width: '65%',
    height: '65%',
  },
  giftInfo: {
    paddingHorizontal: 10,
  },
  giftBrand: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
    textAlign: 'center',
  },
  giftName: {
    fontSize: 14,
    fontWeight: '500',
    color: 'black',
    textAlign: 'center',
  },
  dDayContainer: {
    backgroundColor: '#F6C5C5',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'center',
    marginTop: 8,
  },
  dDayText: {
    color: '#D33434',
    fontSize: 14,
    fontWeight: '600',
  },
  // FeatureCard 스타일
  featureCard: {
    width: '100%',
    height: '100%',
    paddingVertical: 14,
    paddingHorizontal: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    justifyContent: 'start',
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    left: 3,
    marginBottom: 10,
    lineHeight: 24,
  },
  shareBoxIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
    bottom: 14,
    left: 12,
  },
  shareBoxCount: {
    fontSize: 12,
    color: '#666',
    marginLeft: 6,
  },
  featureImage: {
    width: '90%',
    height: 70,
    position: 'absolute',
    bottom: 14,
    right: -5,
  },
  // RadarCard 스타일
  radarCard: {
    width: '100%',
    height: '100%',
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    padding: 0,
    position: 'relative',
  },
  radarText: {
    fontSize: 18,
    color: '#333',
    textAlign: 'right',
    position: 'absolute',
    top: 60,
    left: 0,
    right: 16,
    zIndex: 1,
    lineHeight: 24,
    letterSpacing: -0.5,
  },
  fullRadarImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    resizeMode: 'cover',
  },
  // GiftCard2 스타일
  giftCard2: {
    padding: 16,
    marginBottom: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    width: '100%',
  },
  giftCard2Content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  giftCard2Text: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  giftCard2SubText: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  giftCard2Image: {
    width: 140,
    height: 80,
  },
  shadowContainer: {
    borderRadius: 10,
    width: '100%',
  },
  giftShadowContainer: {
    borderRadius: 10,
    width: '100%',
    height: '100%',
  },
  featureShadowContainer: {
    borderRadius: 10,
    width: '100%',
    height: 160,
  },
});

// 컴포넌트 연결
Card.GiftCard = GiftCard;
Card.FeatureCard = FeatureCard;
Card.RadarCard = RadarCard;
Card.GiftCard2 = GiftCard2;

export default Card;
