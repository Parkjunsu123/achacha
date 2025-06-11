package com.koup28.achacha_app

import android.app.Application
import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.Context
import android.content.res.Configuration
import android.os.Build
import android.util.Log

import com.facebook.react.PackageList
import com.facebook.react.ReactApplication
import com.facebook.react.ReactNativeHost
import com.facebook.react.ReactPackage
import com.facebook.react.ReactHost
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.load
import com.facebook.react.defaults.DefaultReactNativeHost
import com.facebook.react.soloader.OpenSourceMergedSoMapping
import com.facebook.soloader.SoLoader
import com.koup28.achacha_app.WearSyncPackage
import com.koup28.achacha_app.NotificationPackage
import com.koup28.achacha_app.BrightnessPackage

import expo.modules.ApplicationLifecycleDispatcher
import expo.modules.ReactNativeHostWrapper

// 백그라운드 위치 알람 관련 imports
import android.app.AlarmManager
import android.app.PendingIntent
import android.content.Intent
import android.content.SharedPreferences
import android.os.PowerManager

class MainApplication : Application(), ReactApplication {

  override val reactNativeHost: ReactNativeHost = ReactNativeHostWrapper(
        this,
        object : DefaultReactNativeHost(this) {
          override fun getPackages(): List<ReactPackage> {
            val packages = PackageList(this).packages.toMutableList()
            // Packages that cannot be autolinked yet can be added manually here, for example:
            // packages.add(new MyReactNativePackage());
            packages.add(BarcodePackage())
            packages.add(WearSyncPackage())
            packages.add(BlePackage())
            packages.add(NotificationPackage())
            packages.add(BrightnessPackage())
            packages.add(LocationAlarmPackage())
            return packages
          }

          override fun getJSMainModuleName(): String = ".expo/.virtual-metro-entry"

          override fun getUseDeveloperSupport(): Boolean = BuildConfig.DEBUG

          override val isNewArchEnabled: Boolean = BuildConfig.IS_NEW_ARCHITECTURE_ENABLED
          override val isHermesEnabled: Boolean = BuildConfig.IS_HERMES_ENABLED
      }
  )

  override val reactHost: ReactHost
    get() = ReactNativeHostWrapper.createReactHost(applicationContext, reactNativeHost)

  override fun onCreate() {
    super.onCreate()
    SoLoader.init(this, OpenSourceMergedSoMapping)
    if (BuildConfig.IS_NEW_ARCHITECTURE_ENABLED) {
      // If you opted-in for the New Architecture, we load the native entry point for this app.
      load()
    }
    ApplicationLifecycleDispatcher.onApplicationCreate(this)
    // 카카오 앱키 로그 출력
    Log.d("KAKAO_APP_KEY", BuildConfig.KAKAO_APP_KEY)
    
    // Android 8.0(Oreo) 이상에서 알림 채널 생성
    // 채널을 직접 만들어 알림 중요도, 사운드, 진동, 그룹화, 사용자 설정 등을 제어할 수 있음
    // 알림 종류가 많거나, 특정 알림만 다르게 동작하도록 하고 싶으면 필수적임
    createNotificationChannel()
    
    // 백그라운드 위치 알람 설정 (추가된 부분)
    setupBackgroundLocationAlarm()
    
    // 배터리 최적화 설정 확인 (추가된 부분)
    checkBatteryOptimizations()
  }

  /**
   * Android 8.0(Oreo) 이상에서 알림 채널을 생성하는 함수
   */
  private fun createNotificationChannel() {
    // Android Oreo 이상에서만 채널 생성 필요
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      val channelId = getString(R.string.default_notification_channel_id)
      val channelName = "아차차 알림"
      val channelDescription = "아차차 서비스에서 보내는 알림입니다."
      val importance = NotificationManager.IMPORTANCE_HIGH
      
      val channel = NotificationChannel(channelId, channelName, importance).apply {
        description = channelDescription
      }
      
      // 채널을 시스템에 등록
      val notificationManager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
      notificationManager.createNotificationChannel(channel)
      
      Log.d("Notifications", "알림 채널이 생성되었습니다: $channelId")
    }
  }
  
  /**
   * 백그라운드 위치 알람 설정 메서드
   */
  private fun setupBackgroundLocationAlarm() {
    val prefs = getSharedPreferences("achacha_app_prefs", Context.MODE_PRIVATE)
    val isAlarmSet = prefs.getBoolean("background_location_alarm_set", false)
    
    if (!isAlarmSet) {
      Log.d("BackgroundLocation", "백그라운드 위치 알람 설정 시작")
      
      try {
        val alarmManager = getSystemService(Context.ALARM_SERVICE) as AlarmManager
        val intent = Intent(this, LocationAlarmReceiver::class.java)
        
        val flags = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
          PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        } else {
          PendingIntent.FLAG_UPDATE_CURRENT
        }
        
        val pendingIntent = PendingIntent.getBroadcast(
          this, 
          0, 
          intent, 
          flags
        )
        
        // 현재 시간 + 1분 후에 알람 설정
        val triggerAtMillis = System.currentTimeMillis() + 60 * 1000
        
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
          if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            // Android 12 이상에서는 canScheduleExactAlarms 권한 확인
            if (alarmManager.canScheduleExactAlarms()) {
              alarmManager.setExactAndAllowWhileIdle(
                AlarmManager.RTC_WAKEUP,
                triggerAtMillis,
                pendingIntent
              )
              Log.d("BackgroundLocation", "알람 설정 완료 (setExactAndAllowWhileIdle)")
            } else {
              // 정확한 알람 권한이 없으면 일반 알람 사용
              alarmManager.set(
                AlarmManager.RTC_WAKEUP,
                triggerAtMillis,
                pendingIntent
              )
              Log.d("BackgroundLocation", "알람 설정 완료 (set - 권한 없음)")
              
              // 권한 필요 상태 저장 (MainActivity에서 확인 후 요청)
              prefs.edit().putBoolean("need_exact_alarm_permission", true).apply()
            }
          } else {
            // Android 12 미만에서는 바로 설정 가능
            alarmManager.setExactAndAllowWhileIdle(
              AlarmManager.RTC_WAKEUP,
              triggerAtMillis,
              pendingIntent
            )
            Log.d("BackgroundLocation", "알람 설정 완료 (setExactAndAllowWhileIdle)")
          }
        } else {
          // Android 6.0 미만에서는 set 사용
          alarmManager.set(
            AlarmManager.RTC_WAKEUP,
            triggerAtMillis,
            pendingIntent
          )
          Log.d("BackgroundLocation", "알람 설정 완료 (set - 구버전)")
        }
        
        // 알람 설정 기록
        prefs.edit().putBoolean("background_location_alarm_set", true).apply()
        Log.d("BackgroundLocation", "알람 설정 상태 저장 완료")
      } catch (e: Exception) {
        Log.e("BackgroundLocation", "알람 설정 중 오류 발생: ${e.message}")
        e.printStackTrace()
      }
    } else {
      Log.d("BackgroundLocation", "이미 알람이 설정되어 있음")
    }
  }
  
  /**
   * 배터리 최적화 설정 확인
   */
  private fun checkBatteryOptimizations() {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
      try {
        val pm = getSystemService(Context.POWER_SERVICE) as PowerManager
        val packageName = packageName
        
        if (!pm.isIgnoringBatteryOptimizations(packageName)) {
          // 배터리 최적화 무시 권한 요청을 MainActivity에서 처리하도록 플래그 설정
          val prefs = getSharedPreferences("achacha_app_prefs", Context.MODE_PRIVATE)
          prefs.edit().putBoolean("should_request_battery_opt", true).apply()
          Log.d("BatteryOptimizations", "배터리 최적화 무시 권한 필요")
        } else {
          Log.d("BatteryOptimizations", "배터리 최적화 무시 권한 있음")
        }
      } catch (e: Exception) {
        Log.e("BatteryOptimizations", "배터리 최적화 확인 중 오류: ${e.message}")
      }
    }
  }

  override fun onConfigurationChanged(newConfig: Configuration) {
    super.onConfigurationChanged(newConfig)
    ApplicationLifecycleDispatcher.onConfigurationChanged(this, newConfig)
  }
}