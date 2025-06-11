package com.koup28.achacha_app;

import android.app.Activity;
import android.view.Window;
import android.view.WindowManager;
import android.util.Log;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

public class BrightnessModule extends ReactContextBaseJavaModule {
    private float previousBrightness = -1;
    private static final String TAG = "BrightnessModule";

    public BrightnessModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    public String getName() {
        return "BrightnessModule";
    }

    @ReactMethod
    public void setBrightness(final float brightness) {
        Log.d(TAG, "setBrightness 호출됨: " + brightness);
        final Activity activity = getCurrentActivity();
        if (activity != null) {
            activity.runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    try {
                        Window window = activity.getWindow();
                        WindowManager.LayoutParams layoutParams = window.getAttributes();
                        
                        // 이전 밝기 저장 (brightness가 -1이 아닐 때만)
                        if (brightness != -1 && previousBrightness == -1) {
                            previousBrightness = layoutParams.screenBrightness;
                            Log.d(TAG, "이전 밝기 저장: " + previousBrightness);
                        }
                        
                        // -1이면 저장된 이전 밝기로 복원, 아니면 지정된 밝기로 설정
                        if (brightness == -1) {
                            Log.d(TAG, "이전 밝기로 복원: " + previousBrightness);
                            layoutParams.screenBrightness = previousBrightness;
                            previousBrightness = -1; // 복원 후 초기화
                        } else {
                            Log.d(TAG, "밝기 설정: " + brightness);
                            layoutParams.screenBrightness = brightness; // 0.0 ~ 1.0
                        }
                        
                        window.setAttributes(layoutParams);
                        Log.d(TAG, "밝기 변경 완료");
                    } catch (Exception e) {
                        Log.e(TAG, "밝기 설정 중 오류 발생: " + e.getMessage());
                        e.printStackTrace();
                    }
                }
            });
        } else {
            Log.e(TAG, "현재 액티비티가 null입니다");
        }
    }
} 