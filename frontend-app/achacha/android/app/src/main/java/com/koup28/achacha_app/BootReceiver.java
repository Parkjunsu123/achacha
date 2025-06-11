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
}