// headlessLocationPlugin.js
const fs = require('fs');
const path = require('path');

const BackgroundLocationServiceContent = `
package com.koup28.achacha_app;

import android.content.Intent;
import android.os.Bundle;
import com.facebook.react.HeadlessJsTaskService;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.jstasks.HeadlessJsTaskConfig;

public class BackgroundLocationService extends HeadlessJsTaskService {
  @Override
  protected HeadlessJsTaskConfig getTaskConfig(Intent intent) {
    Bundle extras = intent.getExtras();
    if (extras == null) {
      extras = new Bundle();
    }
    return new HeadlessJsTaskConfig(
      "BACKGROUND_LOCATION_UPDATE",
      Arguments.fromBundle(extras),
      30000, // 작업 시간 제한: 30초
      true // 앱이 포그라운드에 있어도 실행
    );
  }
}`;

const LocationAlarmReceiverContent = `
package com.koup28.achacha_app;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.os.Build;
import android.app.AlarmManager;
import android.app.PendingIntent;

public class LocationAlarmReceiver extends BroadcastReceiver {
  @Override
  public void onReceive(Context context, Intent intent) {
    // 위치 업데이트 서비스 시작
    Intent serviceIntent = new Intent(context, BackgroundLocationService.class);
    
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      context.startForegroundService(serviceIntent);
    } else {
      context.startService(serviceIntent);
    }
    
    // 다음 알람 설정
    scheduleNextAlarm(context);
  }
  
  private void scheduleNextAlarm(Context context) {
    AlarmManager alarmManager = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
    Intent intent = new Intent(context, LocationAlarmReceiver.class);
    
    int flags = PendingIntent.FLAG_UPDATE_CURRENT;
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
      flags |= PendingIntent.FLAG_IMMUTABLE;
    }
    
    PendingIntent pendingIntent = PendingIntent.getBroadcast(
      context, 
      0, 
      intent, 
      flags
    );
    
    // 5분마다 반복 알람
    long intervalMillis = 5 * 60 * 1000; // 5분
    long triggerAtMillis = System.currentTimeMillis() + intervalMillis;
    
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
      alarmManager.setExactAndAllowWhileIdle(
        AlarmManager.RTC_WAKEUP,
        triggerAtMillis,
        pendingIntent
      );
    } else if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT) {
      alarmManager.setExact(
        AlarmManager.RTC_WAKEUP,
        triggerAtMillis,
        pendingIntent
      );
    } else {
      alarmManager.set(
        AlarmManager.RTC_WAKEUP,
        triggerAtMillis,
        pendingIntent
      );
    }
  }
}`;

const BootReceiverContent = `
package com.koup28.achacha_app;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.app.AlarmManager;
import android.app.PendingIntent;
import android.os.Build;

public class BootReceiver extends BroadcastReceiver {
  @Override
  public void onReceive(Context context, Intent intent) {
    if (intent.getAction().equals("android.intent.action.BOOT_COMPLETED")) {
      // 기기 재부팅 시 알람 재설정
      SharedPreferences prefs = context.getSharedPreferences("achacha_app_prefs", Context.MODE_PRIVATE);
      boolean isAlarmSet = prefs.getBoolean("background_location_alarm_set", false);
      
      if (isAlarmSet) {
        scheduleLocationAlarm(context);
      }
    }
  }
  
  private void scheduleLocationAlarm(Context context) {
    AlarmManager alarmManager = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
    Intent intent = new Intent(context, LocationAlarmReceiver.class);
    
    int flags = PendingIntent.FLAG_UPDATE_CURRENT;
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
      flags |= PendingIntent.FLAG_IMMUTABLE;
    }
    
    PendingIntent pendingIntent = PendingIntent.getBroadcast(
      context, 
      0, 
      intent, 
      flags
    );
    
    // 5분마다 반복 알람
    long intervalMillis = 5 * 60 * 1000; // 5분
    long triggerAtMillis = System.currentTimeMillis() + intervalMillis;
    
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
      alarmManager.setExactAndAllowWhileIdle(
        AlarmManager.RTC_WAKEUP,
        triggerAtMillis,
        pendingIntent
      );
    } else if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT) {
      alarmManager.setExact(
        AlarmManager.RTC_WAKEUP,
        triggerAtMillis,
        pendingIntent
      );
    } else {
      alarmManager.set(
        AlarmManager.RTC_WAKEUP,
        triggerAtMillis,
        pendingIntent
      );
    }
  }
}`;

// Expo config plugin 함수
const withHeadlessLocation = config => {
  // 안드로이드 수정
  if (config.android) {
    // 권한 추가
    config.android.permissions = [
      ...(config.android.permissions || []),
      'android.permission.WAKE_LOCK',
      'android.permission.RECEIVE_BOOT_COMPLETED',
      'android.permission.SCHEDULE_EXACT_ALARM',
      'android.permission.USE_EXACT_ALARM',
    ];
  }

  return config;
};

// 빌드 시 실행되는 함수
module.exports = config => {
  return withHeadlessLocation(config);
};

// 빌드 후 실행되는 함수 (Java 파일 생성)
module.exports.onBuildComplete = ({ modRequest, platform }) => {
  if (platform === 'android') {
    const javaPath = path.join(
      modRequest.projectRoot,
      'android',
      'app',
      'src',
      'main',
      'java',
      'com',
      'koup28',
      'achacha_app'
    );

    if (!fs.existsSync(javaPath)) {
      fs.mkdirSync(javaPath, { recursive: true });
    }

    // BackgroundLocationService.java 파일 생성
    const backgroundServicePath = path.join(javaPath, 'BackgroundLocationService.java');
    fs.writeFileSync(backgroundServicePath, BackgroundLocationServiceContent);

    // LocationAlarmReceiver.java 파일 생성
    const alarmReceiverPath = path.join(javaPath, 'LocationAlarmReceiver.java');
    fs.writeFileSync(alarmReceiverPath, LocationAlarmReceiverContent);

    // BootReceiver.java 파일 생성
    const bootReceiverPath = path.join(javaPath, 'BootReceiver.java');
    fs.writeFileSync(bootReceiverPath, BootReceiverContent);

    console.log('헤드리스 위치 추적 Java 파일 생성 완료');
  }
};
