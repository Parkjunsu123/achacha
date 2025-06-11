package com.koup28.achacha_app

import android.Manifest
import android.os.Build
import android.os.Bundle
import android.content.pm.PackageManager
import android.util.Base64
import android.util.Log
import androidx.activity.result.contract.ActivityResultContracts
import androidx.core.content.ContextCompat
import java.security.MessageDigest
import java.security.NoSuchAlgorithmException

import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate

import expo.modules.ReactActivityDelegateWrapper

class MainActivity : ReactActivity() {
  // 알림 권한 요청을 위한 ActivityResultLauncher
  private val requestPermissionLauncher = registerForActivityResult(
    ActivityResultContracts.RequestPermission()
  ) { isGranted: Boolean ->
    if (isGranted) {
      Log.d("Notifications", "알림 권한이 승인되었습니다.")
    } else {
      Log.d("Notifications", "알림 권한이 거부되었습니다.")
    }
  }

  override fun onCreate(savedInstanceState: Bundle?) {
    // Set the theme to AppTheme BEFORE onCreate to support
    // coloring the background, status bar, and navigation bar.
    // This is required for expo-splash-screen.
    setTheme(R.style.AppTheme);
    super.onCreate(savedInstanceState)

    // --- 키 해시 로깅 코드 추가 ---
    try {
        val info = packageManager.getPackageInfo(packageName, PackageManager.GET_SIGNATURES)
        info.signatures?.let { signatures -> 
            for (signature in signatures) {
                val md = MessageDigest.getInstance("SHA")
                md.update(signature.toByteArray())
                val keyHash = Base64.encodeToString(md.digest(), Base64.NO_WRAP)
                Log.d("KeyHash_Native_Kotlin", "Key Hash: $keyHash")
            }
        }
    } catch (e: PackageManager.NameNotFoundException) {
        Log.e("KeyHash_Native_Kotlin", "Error getting package info", e)
    } catch (e: NoSuchAlgorithmException) {
        Log.e("KeyHash_Native_Kotlin", "Error getting SHA instance", e)
    } catch (e: Exception) {
        Log.e("KeyHash_Native_Kotlin", "Unknown error getting key hash", e)
    }
    // --- 키 해시 로깅 코드 추가 끝 ---

    // 앱 시작 시 알림 권한 요청
    askNotificationPermission()
  }

  /**
   * Android 13(TIRAMISU) 이상에서 알림 권한을 요청하는 함수
   */
  private fun askNotificationPermission() {
    // API 레벨 33(TIRAMISU) 이상에서만 권한 요청
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
      if (ContextCompat.checkSelfPermission(this, Manifest.permission.POST_NOTIFICATIONS) == 
          PackageManager.PERMISSION_GRANTED) {
        // 이미 권한이 승인된 상태
        Log.d("Notifications", "알림 권한이 이미 승인되어 있습니다.")
      } else if (shouldShowRequestPermissionRationale(Manifest.permission.POST_NOTIFICATIONS)) {
        // 사용자에게 권한이 필요한 이유를 설명하는 로직 (선택적 구현)
        Log.d("Notifications", "권한 요청 이유 표시 후 권한 요청이 필요합니다.")
        // 권한이 필요한 이유를 설명하는 UI 표시 후 권한 요청
        requestPermissionLauncher.launch(Manifest.permission.POST_NOTIFICATIONS)
      } else {
        // 직접 권한 요청
        requestPermissionLauncher.launch(Manifest.permission.POST_NOTIFICATIONS)
      }
    }
  }

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  override fun getMainComponentName(): String = "main"

  /**
   * Returns the instance of the [ReactActivityDelegate]. We use [DefaultReactActivityDelegate]
   * which allows you to enable New Architecture with a single boolean flags [fabricEnabled]
   */
  override fun createReactActivityDelegate(): ReactActivityDelegate {
    return ReactActivityDelegateWrapper(
          this,
          BuildConfig.IS_NEW_ARCHITECTURE_ENABLED,
          object : DefaultReactActivityDelegate(
              this,
              mainComponentName,
              fabricEnabled
          ){})
  }

  /**
    * Align the back button behavior with Android S
    * where moving root activities to background instead of finishing activities.
    * @see <a href="https://developer.android.com/reference/android/app/Activity#onBackPressed()">onBackPressed</a>
    */
  override fun invokeDefaultOnBackPressed() {
      if (Build.VERSION.SDK_INT <= Build.VERSION_CODES.R) {
          if (!moveTaskToBack(false)) {
              // For non-root activities, use the default implementation to finish them.
              super.invokeDefaultOnBackPressed()
          }
          return
      }

      // Use the default back button implementation on Android S
      // because it's doing more than [Activity.moveTaskToBack] in fact.
      super.invokeDefaultOnBackPressed()
  }
}
