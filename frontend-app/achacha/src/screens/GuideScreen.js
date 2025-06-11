import React, { useRef, useState } from 'react';
import {
  Image,
  Dimensions,
  StatusBar,
  StyleSheet,
  View,
  SafeAreaView,
  FlatList,
} from 'react-native';
import { Button, Text } from '../components/ui';
import { useGuideSteps } from '../hooks/useGuideSteps';
import { useTheme } from 'react-native-elements';
import { guideSteps } from '../constants/guideContent';

const { width } = Dimensions.get('window');

const GuideFirstScreen = () => {
  const { handleStart } = useGuideSteps();
  const { theme } = useTheme();
  const flatListRef = useRef(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [hasViewedAll, setHasViewedAll] = useState(false);

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      const newIndex = viewableItems[0].index;
      setCurrentStep(newIndex);

      // 마지막 아이템을 확인했는지 체크
      if (newIndex === guideSteps.length - 1) {
        setHasViewedAll(true);
      }
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  // 각 가이드 아이템 렌더링
  const renderItem = ({ item }) => (
    <View style={styles.slideContainer}>
      <View style={styles.imageWrapper}>
        <View style={styles.imageContainer}>
          <Image
            source={item.image}
            style={[styles.contentImage, item.imageStyle]}
            resizeMode="contain"
          />
        </View>
      </View>

      <View style={styles.textContainer}>
        <Text variant="h1" weight="bold" size={24} center style={styles.guideText}>
          {item.title}
        </Text>
        <Text variant="h1" weight="semibold" size={24} center style={styles.guidesubText}>
          {item.subText1}
        </Text>
        {item.subText2 ? (
          <Text variant="h1" weight="semibold" size={24} center style={styles.guidesubText}>
            {item.subText2}
          </Text>
        ) : null}
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <View style={styles.mainContainer}>
            <FlatList
              ref={flatListRef}
              data={guideSteps}
              renderItem={renderItem}
              keyExtractor={(_, index) => index.toString()}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onViewableItemsChanged={onViewableItemsChanged}
              viewabilityConfig={viewabilityConfig}
            />

            <View style={styles.indicatorContainer}>
              {guideSteps.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.indicator,
                    {
                      backgroundColor: index === currentStep ? theme.colors.primary : '#e0e0e0',
                    },
                  ]}
                />
              ))}
            </View>
          </View>

          <Button
            title="시작하기"
            onPress={handleStart}
            variant="primary"
            size="lg"
            isDisabled={!hasViewedAll}
            style={[styles.button, !hasViewedAll && styles.buttonDisabled]}
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
    paddingHorizontal: 24,
    paddingVertical: 8,
    justifyContent: 'space-between',
  },
  mainContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  slideContainer: {
    width: width - 48, // paddingHorizontal 24 * 2
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageWrapper: {
    width: '100%',
    alignItems: 'center',
    height: width * 0.9,
    justifyContent: 'center',
  },
  imageContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentImage: {
    width: width * 0.7,
    height: width * 0.7,
  },
  textContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
    height: 150,
  },
  guideText: {
    marginBottom: 6,
    lineHeight: 30,
  },
  guidesubText: {
    fontFamily: 'Pretendard-Regular',
    lineHeight: 35,
  },
  indicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    position: 'absolute',
    bottom: 70,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  button: {
    width: '100%',
    height: 56,
    borderRadius: 8,
    marginBottom: 20,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});

export default GuideFirstScreen;
