import { useNavigation, CommonActions } from '@react-navigation/native';
import { markAppAsLaunched } from '../utils/appStorage';

export const useGuideSteps = () => {
  const navigation = useNavigation();

  const handleStart = async () => {
    try {
      await markAppAsLaunched();
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'Permission' }],
        })
      );
    } catch (error) {
      // Fallback navigation
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'Permission' }],
        })
      );
    }
  };

  return {
    handleStart,
  };
};
