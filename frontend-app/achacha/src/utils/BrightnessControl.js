import { NativeModules, Platform } from 'react-native';

const { BrightnessModule } = NativeModules;

/**
 * 화면 밝기를 제어하는 유틸리티
 */
const BrightnessControl = {
  /**
   * 화면 밝기를 최대로 설정
   */
  setMaxBrightness: () => {
    if (Platform.OS === 'android' && BrightnessModule) {
      BrightnessModule.setBrightness(1.0); // 최대 밝기 (0.0 ~ 1.0)
    }
  },

  /**
   * 이전 밝기로 복원
   */
  restoreBrightness: () => {
    if (Platform.OS === 'android' && BrightnessModule) {
      BrightnessModule.setBrightness(-1); // -1은 이전 밝기로 복원을 의미
    }
  },
};

export default BrightnessControl;
