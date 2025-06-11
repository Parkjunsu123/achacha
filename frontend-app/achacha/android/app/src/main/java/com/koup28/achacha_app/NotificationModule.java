package com.koup28.achacha_app;

import android.util.Log;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.google.firebase.messaging.RemoteMessage;

import java.util.Map;

/**
 * FCM 메시지를 React Native로 전달하는 모듈
 */
public class NotificationModule extends ReactContextBaseJavaModule {
    private static final String TAG = "NotificationModule";
    private static final String MODULE_NAME = "NotificationModule";
    private static final String EVENT_FCM_MESSAGE_RECEIVED = "fcmMessageReceived";
    
    private static ReactApplicationContext reactContext;

    public NotificationModule(ReactApplicationContext context) {
        super(context);
        reactContext = context;
    }

    @NonNull
    @Override
    public String getName() {
        return MODULE_NAME;
    }

    /**
     * FCM 메시지를 React Native로 전달하는 메서드
     * MyFirebaseMessagingService에서 호출됨
     */
    public static void emitMessageReceived(RemoteMessage remoteMessage) {
        if (reactContext == null) {
            Log.e(TAG, "React 컨텍스트가 없어서 알림을 전달할 수 없습니다.");
            return;
        }

        try {
            // RemoteMessage 객체를 WritableMap으로 변환
            WritableMap params = convertRemoteMessageToWritableMap(remoteMessage);
            
            // React Native에 이벤트 발송
            reactContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit(EVENT_FCM_MESSAGE_RECEIVED, params);
            
            Log.d(TAG, "FCM 메시지 이벤트를 React Native로 발송함");
        } catch (Exception e) {
            Log.e(TAG, "FCM 메시지를 React Native로 전달하는 중 오류 발생", e);
        }
    }

    /**
     * RemoteMessage 객체를 WritableMap으로 변환
     */
    private static WritableMap convertRemoteMessageToWritableMap(RemoteMessage remoteMessage) {
        WritableMap messageMap = Arguments.createMap();
        
        // 알림 페이로드
        if (remoteMessage.getNotification() != null) {
            WritableMap notificationMap = Arguments.createMap();
            
            RemoteMessage.Notification notification = remoteMessage.getNotification();
            if (notification.getTitle() != null) {
                notificationMap.putString("title", notification.getTitle());
            }
            if (notification.getBody() != null) {
                notificationMap.putString("body", notification.getBody());
            }
            
            messageMap.putMap("notification", notificationMap);
        }
        
        // 데이터 페이로드
        if (remoteMessage.getData().size() > 0) {
            WritableMap dataMap = Arguments.createMap();
            
            for (Map.Entry<String, String> entry : remoteMessage.getData().entrySet()) {
                dataMap.putString(entry.getKey(), entry.getValue());
            }
            
            messageMap.putMap("data", dataMap);
        }
        
        return messageMap;
    }

    /**
     * React Native에서 이벤트 리스너 추가를 확인하는 메서드
     * 네이티브 모듈 초기화 확인용
     */
    @ReactMethod
    public void addListener(String eventName) {
        // 이벤트 리스너 추가에 대한 처리
        Log.d(TAG, "이벤트 리스너 추가: " + eventName);
    }

    /**
     * React Native에서 이벤트 리스너 제거를 확인하는 메서드
     */
    @ReactMethod
    public void removeListeners(Integer count) {
        // 이벤트 리스너 제거에 대한 처리
        Log.d(TAG, "이벤트 리스너 " + count + "개 제거");
    }
} 