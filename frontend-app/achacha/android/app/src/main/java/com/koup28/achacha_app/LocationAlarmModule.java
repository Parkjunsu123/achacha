package com.koup28.achacha_app;

import android.app.AlarmManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Build;
import android.util.Log;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Promise;

public class LocationAlarmModule extends ReactContextBaseJavaModule {
    private static final String TAG = "LocationAlarmModule";
    private final ReactApplicationContext reactContext;

    public LocationAlarmModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
    }

    @Override
    public String getName() {
        return "LocationAlarmModule";
    }

    @ReactMethod
    public void startLocationAlarm(Promise promise) {
        try {
            Log.d(TAG, "startLocationAlarm 호출됨");
            
            AlarmManager alarmManager = (AlarmManager) reactContext.getSystemService(Context.ALARM_SERVICE);
            Intent intent = new Intent(reactContext, LocationAlarmReceiver.class);
            
            int flags = PendingIntent.FLAG_UPDATE_CURRENT;
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                flags |= PendingIntent.FLAG_IMMUTABLE;
            }
            
            PendingIntent pendingIntent = PendingIntent.getBroadcast(
                reactContext, 
                0, 
                intent, 
                flags
            );
            
            long triggerAtMillis = System.currentTimeMillis() + 10000; // 10초 후에 시작
            
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                alarmManager.setExactAndAllowWhileIdle(
                    AlarmManager.RTC_WAKEUP,
                    triggerAtMillis,
                    pendingIntent
                );
                Log.d(TAG, "알람 설정됨 (setExactAndAllowWhileIdle)");
            } else if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT) {
                alarmManager.setExact(
                    AlarmManager.RTC_WAKEUP,
                    triggerAtMillis,
                    pendingIntent
                );
                Log.d(TAG, "알람 설정됨 (setExact)");
            } else {
                alarmManager.set(
                    AlarmManager.RTC_WAKEUP,
                    triggerAtMillis,
                    pendingIntent
                );
                Log.d(TAG, "알람 설정됨 (set)");
            }
            
            // 알람 상태 저장
            SharedPreferences prefs = reactContext.getSharedPreferences("achacha_app_prefs", Context.MODE_PRIVATE);
            prefs.edit().putBoolean("background_location_alarm_set", true).apply();
            
            promise.resolve(true);
        } catch (Exception e) {
            Log.e(TAG, "위치 알람 시작 실패: " + e.getMessage());
            promise.reject("ERROR", "위치 알람 시작 실패: " + e.getMessage());
        }
    }

    @ReactMethod
    public void stopLocationAlarm(Promise promise) {
        try {
            Log.d(TAG, "stopLocationAlarm 호출됨");
            
            AlarmManager alarmManager = (AlarmManager) reactContext.getSystemService(Context.ALARM_SERVICE);
            Intent intent = new Intent(reactContext, LocationAlarmReceiver.class);
            
            int flags = PendingIntent.FLAG_UPDATE_CURRENT;
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                flags |= PendingIntent.FLAG_IMMUTABLE;
            }
            
            PendingIntent pendingIntent = PendingIntent.getBroadcast(
                reactContext, 
                0, 
                intent, 
                flags
            );
            
            // 알람 취소
            alarmManager.cancel(pendingIntent);
            
            // 알람 상태 저장
            SharedPreferences prefs = reactContext.getSharedPreferences("achacha_app_prefs", Context.MODE_PRIVATE);
            prefs.edit().putBoolean("background_location_alarm_set", false).apply();
            
            Log.d(TAG, "위치 알람 중지됨");
            promise.resolve(true);
        } catch (Exception e) {
            Log.e(TAG, "위치 알람 중지 실패: " + e.getMessage());
            promise.reject("ERROR", "위치 알람 중지 실패: " + e.getMessage());
        }
    }

    @ReactMethod
    public void isLocationAlarmRunning(Promise promise) {
        try {
            SharedPreferences prefs = reactContext.getSharedPreferences("achacha_app_prefs", Context.MODE_PRIVATE);
            boolean isRunning = prefs.getBoolean("background_location_alarm_set", false);
            Log.d(TAG, "위치 알람 상태 확인: " + (isRunning ? "실행 중" : "중지됨"));
            promise.resolve(isRunning);
        } catch (Exception e) {
            Log.e(TAG, "알람 상태 확인 실패: " + e.getMessage());
            promise.reject("ERROR", "알람 상태 확인 실패: " + e.getMessage());
        }
    }
}