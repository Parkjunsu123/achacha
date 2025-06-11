import AsyncStorage from '@react-native-async-storage/async-storage';

const HAS_LAUNCHED_KEY = 'hasLaunchedBefore';

/**
 * 앱이 처음 실행되었는지 확인합니다.
 * @returns {Promise<boolean>} 처음 실행 시 true, 아닐 경우 false를 반환합니다.
 */
export const checkIsFirstLaunch = async () => {
  try {
    const hasLaunched = await AsyncStorage.getItem(HAS_LAUNCHED_KEY);
    return hasLaunched === null;
  } catch (error) {
    console.error('AsyncStorage 읽기 오류 (checkIsFirstLaunch):', error);
    return false; // 오류 발생 시 안전하게 첫 실행이 아닌 것으로 처리
  }
};

/**
 * 앱이 실행되었음을 (가이드 완료 등) 표시합니다.
 */
export const markAppAsLaunched = async () => {
  try {
    await AsyncStorage.setItem(HAS_LAUNCHED_KEY, 'true');
  } catch (error) {
    //
  }
};
