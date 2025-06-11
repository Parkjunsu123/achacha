import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SplashScreenComponent from '../screens/SplashScreen';
import BottomTabBar from '../components/common/BottomTabBar';

// 일반 import로 변경
import PermissionScreen from '../screens/PermissionScreen';
import LoginScreen from '../screens/LoginScreen';
import GuideFirstScreen from '../screens/GuideScreen';
import NotificationScreen from '../screens/NotificationScreen';
import RegisterMainScreen from '../screens/gifticon-management/gifticon-register/RegisterMainScreen';
import RegisterDetailScreen from '../screens/gifticon-management/gifticon-register/RegisterDetailScreen';
import ManageListScreen from '../screens/gifticon-management/ManageListScreen';
import DetailProductScreen from '../screens/gifticon-management/gifticon-detail/DetailProductScreen';
import DetailAmountScreen from '../screens/gifticon-management/gifticon-detail/DetailAmountScreen';
import DetailAmountHistoryScreen from '../screens/gifticon-management/gifticon-detail/DetailAmountHistoryScreen';
import UseProductScreen from '../screens/gifticon-management/gifticon-use/UseProductScreen';
import UseAmountScreen from '../screens/gifticon-management/gifticon-use/UseAmountScreen';
import PresentScreen from '../screens/gifticon-management/PresentScreen';
import GiveAwayScreen from '../screens/give-away/GiveAwayScreen';
import SettingScreen from '../screens/SettingScreen';
import WatchGuideScreen from '../screens/WatchGuideScreen';
import MapScreen from '../screens/MapScreen';
// 쉐어박스 스크린 추가
import BoxMainScreen from '../screens/gifticon-share-box/BoxMainScreen';
import BoxCreateScreen from '../screens/gifticon-share-box/BoxCreateScreen';
import BoxListScreen from '../screens/gifticon-share-box/BoxListScreen';
import BoxDetailProductScreen from '../screens/gifticon-share-box/BoxDetailProductScreen';
import BoxDetailAmountScreen from '../screens/gifticon-share-box/BoxDetailAmountScreen';
import BoxDetailAmountHistoryScreen from '../screens/gifticon-share-box/BoxDetailAmountHistoryScreen';
import BoxSettingScreen from '../screens/gifticon-share-box/BoxSettingScreen';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  return (
    <Stack.Navigator initialRouteName="Splash" screenOptions={{ headerShown: false }}>
      {/* 로그인 및 온보딩 화면 (탭바 없음) */}
      <Stack.Screen name="Splash" component={SplashScreenComponent} />
      <Stack.Screen name="GuideFirst" component={GuideFirstScreen} />
      <Stack.Screen name="Permission" component={PermissionScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />

      {/* 기타 화면 */}
      <Stack.Screen
        name="Notification"
        component={NotificationScreen}
        options={{
          animation: 'fade_from_bottom',
          animationDuration: 150,
          gestureEnabled: true,
          gestureDirection: 'horizontal',
        }}
      />
      <Stack.Screen
        name="Settings"
        component={SettingScreen}
        options={{
          animation: 'fade_from_bottom',
          animationDuration: 150,
          gestureEnabled: true,
          gestureDirection: 'horizontal',
        }}
      />
      <Stack.Screen
        name="Register"
        component={RegisterMainScreen}
        options={{
          animation: 'slide_from_right',
          animationDuration: 200,
        }}
      />
      <Stack.Screen
        name="RegisterDetail"
        component={RegisterDetailScreen}
        options={{
          animation: 'slide_from_right',
          animationDuration: 200,
        }}
      />
      <Stack.Screen
        name="List"
        component={ManageListScreen}
        options={{
          animation: 'slide_from_right',
          animationDuration: 200,
        }}
      />
      <Stack.Screen
        name="DetailProduct"
        component={DetailProductScreen}
        options={{
          animation: 'slide_from_right',
          animationDuration: 200,
        }}
      />
      <Stack.Screen
        name="DetailAmount"
        component={DetailAmountScreen}
        options={{
          animation: 'slide_from_right',
          animationDuration: 200,
        }}
      />
      <Stack.Screen
        name="DetailAmountHistoryScreen"
        component={DetailAmountHistoryScreen}
        options={{
          animation: 'slide_from_right',
          animationDuration: 200,
        }}
      />
      <Stack.Screen
        name="UseProductScreen"
        component={UseProductScreen}
        options={{
          animation: 'slide_from_right',
          animationDuration: 200,
        }}
      />
      <Stack.Screen
        name="UseAmountScreen"
        component={UseAmountScreen}
        options={{
          animation: 'slide_from_right',
          animationDuration: 200,
        }}
      />
      <Stack.Screen
        name="PresentScreen"
        component={PresentScreen}
        options={{
          animation: 'slide_from_right',
          animationDuration: 200,
        }}
      />
      <Stack.Screen
        name="GiveAwayScreen"
        component={GiveAwayScreen}
        options={{
          animation: 'slide_from_right',
          animationDuration: 200,
        }}
      />
      <Stack.Screen
        name="MapScreen"
        component={MapScreen}
        options={{
          animation: 'slide_from_right',
          animationDuration: 200,
        }}
      />

      {/* 쉐어박스 관련 화면 */}
      <Stack.Screen
        name="BoxMain"
        component={BoxMainScreen}
        options={{
          animation: 'slide_from_right',
          animationDuration: 200,
        }}
      />
      <Stack.Screen
        name="BoxCreate"
        component={BoxCreateScreen}
        options={{
          animation: 'slide_from_right',
          animationDuration: 200,
        }}
      />
      <Stack.Screen
        name="BoxList"
        component={BoxListScreen}
        options={{
          animation: 'slide_from_right',
          animationDuration: 200,
        }}
      />
      <Stack.Screen
        name="BoxDetailProduct"
        component={BoxDetailProductScreen}
        options={{
          animation: 'slide_from_right',
          animationDuration: 200,
        }}
      />
      <Stack.Screen
        name="BoxDetailAmount"
        component={BoxDetailAmountScreen}
        options={{
          animation: 'slide_from_right',
          animationDuration: 200,
        }}
      />
      <Stack.Screen
        name="BoxDetailAmountHistoryScreen"
        component={BoxDetailAmountHistoryScreen}
        options={{
          animation: 'slide_from_right',
          animationDuration: 200,
        }}
      />
      <Stack.Screen
        name="BoxSetting"
        component={BoxSettingScreen}
        options={{
          animation: 'slide_from_right',
          animationDuration: 200,
        }}
      />
      <Stack.Screen
        name="WatchGuideScreen"
        component={WatchGuideScreen}
        options={{
          animation: 'slide_from_right',
          animationDuration: 200,
        }}
      />

      {/* 메인 탭바 화면 */}
      <Stack.Screen name="Main" component={MainNavigator} />
    </Stack.Navigator>
  );
};

// 메인 네비게이터 (탭바가 있는 화면들)
const MainNavigator = () => {
  return <BottomTabBar />;
};

export default AppNavigator;
