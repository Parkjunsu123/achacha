package com.koup28.achacha_app;

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.graphics.Color;
import android.media.RingtoneManager;
import android.net.Uri;
import android.os.Build;
import android.util.Log;

import androidx.annotation.NonNull;
import androidx.core.app.NotificationCompat;

import com.google.firebase.messaging.FirebaseMessagingService;
import com.google.firebase.messaging.RemoteMessage;

import java.util.Map;

public class MyFirebaseMessagingService extends FirebaseMessagingService {
    private static final String TAG = "MyFirebaseMessaging";

    // 알림 타입 상수
    private static final String TYPE_LOCATION_BASED = "LOCATION_BASED";          // 주변 매장 알림
    private static final String TYPE_EXPIRY_DATE = "EXPIRY_DATE";                // 유효기간 만료 알림
    private static final String TYPE_RECEIVE_GIFTICON = "RECEIVE_GIFTICON";      // 기프티콘 뿌리기 수신
    private static final String TYPE_USAGE_COMPLETE = "USAGE_COMPLETE";          // 사용완료 여부 알림
    private static final String TYPE_SHAREBOX_GIFTICON = "SHAREBOX_GIFTICON";    // 쉐어박스 기프티콘 등록
    private static final String TYPE_SHAREBOX_USAGE = "SHAREBOX_USAGE_COMPLETE"; // 쉐어박스 기프티콘 사용
    private static final String TYPE_SHAREBOX_JOIN = "SHAREBOX_MEMBER_JOIN";     // 쉐어박스 멤버 참여
    private static final String TYPE_SHAREBOX_DELETED = "SHAREBOX_DELETED";      // 쉐어박스 그룹 삭제

    @Override
    public void onMessageReceived(@NonNull RemoteMessage remoteMessage) {
        super.onMessageReceived(remoteMessage);
        
        // 포그라운드에서 메시지 처리 로직
        Log.d(TAG, "From: " + remoteMessage.getFrom());
        
        // React Native 모듈로 알림 데이터 전달
        sendNotificationToReactNative(remoteMessage);
        
        // 포그라운드에서는 시스템 알림을 표시하지 않고 종료 (React Native에서 처리)
        if (isAppInForeground()) {
            Log.d(TAG, "앱이 포그라운드 상태입니다. React Native Toast로 알림을 표시합니다.");
            Log.d(TAG, "포그라운드 알림 타이틀: " + 
                (remoteMessage.getNotification() != null ? remoteMessage.getNotification().getTitle() : "제목 없음"));
            Log.d(TAG, "포그라운드 알림 내용: " + 
                (remoteMessage.getNotification() != null ? remoteMessage.getNotification().getBody() : "내용 없음"));
            return;
        }
        
        // 백그라운드 상태일 때만 시스템 알림 표시
        // 데이터 페이로드가 있는 경우
        if (remoteMessage.getData().size() > 0) {
            Log.d(TAG, "Message data payload: " + remoteMessage.getData());
            Map<String, String> data = remoteMessage.getData();
            
            // FCM 메시지에서 알림 데이터 처리
            String title = data.get("title");
            String body = data.get("body");
            String notificationType = data.get("type");
            
            // 데이터로부터 알림 생성
            if (title != null && body != null) {
                sendNotification(title, body, notificationType, data);
            }
        }

        // 알림 페이로드가 있는 경우
        if (remoteMessage.getNotification() != null) {
            Log.d(TAG, "Message Notification Body: " + remoteMessage.getNotification().getBody());
            
            // FCM의 알림 페이로드로부터 알림 생성
            String title = remoteMessage.getNotification().getTitle();
            String body = remoteMessage.getNotification().getBody();
            String notificationType = remoteMessage.getData().get("type");
            
            sendNotification(title, body, notificationType, remoteMessage.getData());
        }
    }

    @Override
    public void onNewToken(@NonNull String token) {
        super.onNewToken(token);
        Log.d(TAG, "Refreshed token: " + token);
        
        // 토큰이 업데이트될 때 서버에 새 토큰을 보내는 로직을 구현할 수 있습니다
        // sendRegistrationToServer(token);
    }
    
    /**
     * 알림 타입에 따라 적절한 아이콘 리소스 ID를 반환합니다.
     * 
     * @param notificationType 알림 타입
     * @return 해당 타입에 맞는 아이콘 리소스 ID
     */
    private int getNotificationIcon(String notificationType) {
        if (notificationType == null) {
            return R.drawable.adaptive_icon; // 기본 아이콘
        }
        
        switch (notificationType) {
            case TYPE_LOCATION_BASED:
                return R.drawable.ic_share_location; // 주변 매장 알림
            case TYPE_EXPIRY_DATE:
                return R.drawable.ic_calendar_month; // 유효기간 만료 알림
            case TYPE_RECEIVE_GIFTICON:
                return R.drawable.ic_tap_and_play; // 기프티콘 뿌리기 알림
            case TYPE_USAGE_COMPLETE:
                return R.drawable.ic_schedule; // 사용완료 여부 알림
            case TYPE_SHAREBOX_GIFTICON:
            case TYPE_SHAREBOX_USAGE:
            case TYPE_SHAREBOX_JOIN:
            case TYPE_SHAREBOX_DELETED:
                return R.drawable.ic_inventory; // 쉐어박스 관련 알림
            default:
                return R.drawable.adaptive_icon; // 기본 아이콘
        }
    }
    
    /**
     * 알림 타입에 따른 색상을 반환합니다.
     * 
     * @param notificationType 알림 타입
     * @return 해당 타입에 맞는 색상
     */
    private int getNotificationColor(String notificationType) {
        if (notificationType == null) {
            return Color.parseColor("#4B9CFF"); // 기본 색상
        }
        
        switch (notificationType) {
            case TYPE_EXPIRY_DATE:
                return Color.parseColor("#EF9696");
            case TYPE_LOCATION_BASED:
                return Color.parseColor("#8CDA8F");
            case TYPE_USAGE_COMPLETE:
                return Color.parseColor("#6BB2EA");
            case TYPE_RECEIVE_GIFTICON:
                return Color.parseColor("#D095EE");
            case TYPE_SHAREBOX_GIFTICON:
            case TYPE_SHAREBOX_USAGE:
            case TYPE_SHAREBOX_JOIN:
            case TYPE_SHAREBOX_DELETED:
                return Color.parseColor("#F1A9D5");
            default:
                return Color.parseColor("#4B9CFF");
        }
    }
    
    /**
     * 알림을 생성하고 표시합니다.
     */
    private void sendNotification(String title, String body, String notificationType, Map<String, String> data) {
        Intent intent = new Intent(getApplicationContext(), MainActivity.class);
        intent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP);
        
        // FCM 데이터를 인텐트에 추가
        for (Map.Entry<String, String> entry : data.entrySet()) {
            intent.putExtra(entry.getKey(), entry.getValue());
        }
        
        // 알림을 탭했을 때 실행될 PendingIntent
        PendingIntent pendingIntent = PendingIntent.getActivity(
            getApplicationContext(), 
            0, 
            intent, 
            PendingIntent.FLAG_IMMUTABLE | PendingIntent.FLAG_UPDATE_CURRENT
        );
        
        String channelId = getApplicationContext().getString(R.string.default_notification_channel_id);
        Uri defaultSoundUri = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION);
        
        // 알림 타입에 따라 다른 아이콘과 색상 사용
        int icon = getNotificationIcon(notificationType);
        int color = getNotificationColor(notificationType);
        
        // 알림 생성
        NotificationCompat.Builder notificationBuilder =
            new NotificationCompat.Builder(getApplicationContext(), channelId)
                .setSmallIcon(icon)
                .setContentTitle(title)
                .setContentText(body)
                .setAutoCancel(true)
                .setSound(defaultSoundUri)
                .setColor(color)
                .setContentIntent(pendingIntent);
        
        NotificationManager notificationManager =
            (NotificationManager) getApplicationContext().getSystemService(Context.NOTIFICATION_SERVICE);
        
        // Android Oreo 이상에서는 채널 확인 (MainApplication에서 이미 생성됨)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = notificationManager.getNotificationChannel(channelId);
            if (channel == null) {
                // 채널이 없는 경우 생성 (대비책)
                channel = new NotificationChannel(
                    channelId,
                    "아차차 알림",
                    NotificationManager.IMPORTANCE_HIGH
                );
                notificationManager.createNotificationChannel(channel);
            }
        }
        
        // 알림 표시
        int notificationId = (int) System.currentTimeMillis();
        notificationManager.notify(notificationId, notificationBuilder.build());
    }

    /**
     * React Native 모듈로 알림 데이터 전달
     * RN에서 토스트 메시지로 표시하도록 처리
     */
    private void sendNotificationToReactNative(RemoteMessage remoteMessage) {
        try {
            // 로그 추가
            Log.d(TAG, "React Native로 FCM 메시지 전달 시도 중...");
            if (remoteMessage.getNotification() != null) {
                Log.d(TAG, "알림 제목: " + remoteMessage.getNotification().getTitle());
                Log.d(TAG, "알림 내용: " + remoteMessage.getNotification().getBody());
            }
            if (remoteMessage.getData().size() > 0) {
                Log.d(TAG, "데이터 페이로드: " + remoteMessage.getData());
            }
            
            // NotificationModule로 메시지 전달
            com.koup28.achacha_app.NotificationModule.emitMessageReceived(remoteMessage);
            Log.d(TAG, "FCM 메시지가 React Native로 성공적으로 전달됨");
        } catch (Exception e) {
            Log.e(TAG, "React Native에 알림 데이터 전달 중 오류 발생", e);
            e.printStackTrace();
        }
    }

    /**
     * 앱이 포그라운드 상태인지 확인
     * @return 포그라운드 상태이면 true, 아니면 false
     */
    private boolean isAppInForeground() {
        // ActivityManager를 통해 앱의 상태를 확인
        android.app.ActivityManager activityManager = 
            (android.app.ActivityManager) getApplicationContext().getSystemService(Context.ACTIVITY_SERVICE);
        
        if (activityManager == null) {
            return false;
        }
        
        // 실행 중인 앱 목록 가져오기
        java.util.List<android.app.ActivityManager.RunningAppProcessInfo> appProcesses = 
            activityManager.getRunningAppProcesses();
        
        if (appProcesses == null) {
            return false;
        }
        
        final String packageName = getApplicationContext().getPackageName();
        
        for (android.app.ActivityManager.RunningAppProcessInfo appProcess : appProcesses) {
            if (appProcess.importance == 
                    android.app.ActivityManager.RunningAppProcessInfo.IMPORTANCE_FOREGROUND && 
                    appProcess.processName.equals(packageName)) {
                return true;
            }
        }
        
        return false;
    }
} 