package com.koup28.achacha_app // 앱 패키지 이름 사용

import android.content.Context
import android.util.Log
import androidx.annotation.NonNull
import androidx.annotation.Nullable
import com.facebook.react.bridge.*
import com.facebook.react.module.annotations.ReactModule
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.google.android.gms.tasks.Tasks
import java.nio.charset.StandardCharsets
// --- Nearby Connections 관련 import 추가 ---
import com.google.android.gms.nearby.Nearby
import com.google.android.gms.nearby.connection.*
import com.google.android.gms.tasks.OnSuccessListener
import com.google.android.gms.tasks.OnFailureListener
// --- ApiException import 추가 ---
import com.google.android.gms.common.api.ApiException
// ------------------------------------------

@ReactModule(name = WearSyncModule.NAME)
class WearSyncModule(private val reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) { // reactContext를 private val로 변경

    companion object {
        const val NAME = "WearSyncModule"
        private const val TAG = "WearSyncModule"
        // MessageClient 경로 정의
        private const val AUTH_TOKEN_PATH = "/auth_token"
        // Capability 이름 (노드 검색에 사용될 수 있음)
        private const val WEAR_CAPABILITY_NAME = "achacha" // 워치 앱과 동일하게 유지

        // --- Nearby Connections 상수 추가 ---
        private const val NEARBY_SERVICE_ID = "com.koup28.achacha_app.nearby_service" // 고유 서비스 ID
        private val NEARBY_STRATEGY = Strategy.P2P_STAR // 연결 전략 (P2P_CLUSTER 등 다른 옵션도 있음)
        // ----------------------------------
    }

    // --- Nearby Connections 클라이언트 추가 ---
    private val connectionsClient: ConnectionsClient = Nearby.getConnectionsClient(reactContext)
    // --------------------------------------

    // --- Nearby 연결된 Endpoint ID 저장 변수 ---
    private var nearbyConnectedEndpointId: String? = null // Nearby 연결 ID
    // ----------------------------------------

    override fun getName(): String {
        return NAME
    }

    // React Native로 이벤트 전송 (필요시 사용)
    private fun sendEvent(eventName: String, @Nullable params: WritableMap?) {
        reactApplicationContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit(eventName, params)
    }

    // 모듈 초기화 시 연결된 노드 찾기 시도
    override fun initialize() {
        super.initialize()
        Log.d(TAG, "Initializing WearSyncModule and finding connected node.")
        // Wearable 노드 찾기 함수 완전히 삭제
    }

    // --- Nearby Connections 콜백 정의 ---
    private val connectionLifecycleCallback = object : ConnectionLifecycleCallback() {
        override fun onConnectionInitiated(endpointId: String, connectionInfo: ConnectionInfo) {
            Log.i(TAG, "[Nearby] Connection initiated from endpoint: $endpointId, Name: ${connectionInfo.endpointName}")
            // 여기서는 자동으로 연결을 수락합니다. 실제 앱에서는 사용자 확인 등을 추가할 수 있습니다.
             Log.d(TAG, "[Nearby] Accepting connection...")
            connectionsClient.acceptConnection(endpointId, payloadCallback) // Payload 수신 콜백 등록
                .addOnSuccessListener { Log.i(TAG, "[Nearby] Connection accepted successfully for endpoint: $endpointId") }
                .addOnFailureListener { e -> Log.e(TAG, "[Nearby] Failed to accept connection for endpoint: $endpointId", e) }
        }

        override fun onConnectionResult(endpointId: String, result: ConnectionResolution) {
            when (result.status.statusCode) {
                ConnectionsStatusCodes.STATUS_OK -> {
                    Log.i(TAG, "[Nearby] Connection established successfully with endpoint: $endpointId")
                    nearbyConnectedEndpointId = endpointId // 연결된 ID 저장
                    
                    // !!!!! 연결 성공 시 자동 데이터 전송 !!!!!
                    sendLoginInfoAutomatically(endpointId) 
                    // !!!!! ----------------------------- !!!!!

                    val params = Arguments.createMap()
                    params.putString("endpointId", endpointId)
                    sendEvent("NearbyConnected", params) // JS로 연결 성공 이벤트 전송
                }
                ConnectionsStatusCodes.STATUS_CONNECTION_REJECTED -> {
                    Log.w(TAG, "[Nearby] Connection rejected by endpoint: $endpointId")
                    nearbyConnectedEndpointId = null
                }
                ConnectionsStatusCodes.STATUS_ERROR -> {
                    Log.e(TAG, "[Nearby] Connection error with endpoint: $endpointId, Status: ${result.status}")
                    nearbyConnectedEndpointId = null
                }
                else -> {
                     Log.e(TAG, "[Nearby] Unknown connection result status for endpoint: $endpointId, Status: ${result.status}")
                     nearbyConnectedEndpointId = null
                }
            }
        }

        override fun onDisconnected(endpointId: String) {
            Log.i(TAG, "[Nearby] Disconnected from endpoint: $endpointId")
            if (nearbyConnectedEndpointId == endpointId) {
                nearbyConnectedEndpointId = null // 연결 해제 시 ID 제거
            }
        }
    }

    // Payload 수신 콜백 (폰에서는 주로 전송만 하므로 간단히 로깅만)
    private val payloadCallback = object : PayloadCallback() {
        override fun onPayloadReceived(endpointId: String, payload: Payload) {
            Log.i(TAG, "[Nearby] Payload received from endpoint: $endpointId")
            // 폰은 주로 보내기만 할 것이므로, 받은 데이터 처리는 간단히
            if (payload.type == Payload.Type.BYTES) {
                val receivedBytes = payload.asBytes() ?: return
                Log.d(TAG, "[Nearby] Received bytes payload: ${String(receivedBytes)}")
            }
        }

        override fun onPayloadTransferUpdate(endpointId: String, update: PayloadTransferUpdate) {
             Log.d(TAG, "[Nearby] Payload transfer update from $endpointId: Status=${update.status}, TotalBytes=${update.totalBytes}, BytesTransferred=${update.bytesTransferred}")
        }
    }
    // ----------------------------------

    // --- 자동 로그인 정보 전송 함수 (새로 추가 또는 기존 함수 활용) ---
    private fun sendLoginInfoAutomatically(endpointId: String) {
        try {
            // AsyncStorage에서 토큰 가져오기
            val sharedPreferences = reactContext.getSharedPreferences("auth_prefs", Context.MODE_PRIVATE)
            val accessToken = sharedPreferences.getString("accessToken", null)
            val refreshToken = sharedPreferences.getString("refreshToken", null)

            if (accessToken == null) {
                Log.e(TAG, "[Nearby Auto Send] No access token found in storage")
                return
            }

            // 토큰 정보를 JSON 형식으로 변환
            val loginInfo = """
                {
                    "accessToken": "$accessToken",
                    "refreshToken": "$refreshToken"
                }
            """.trimIndent()

            Log.i(TAG, "[Nearby Auto Send] Sending login info to $endpointId")

            val payload = Payload.fromBytes(loginInfo.toByteArray(Charsets.UTF_8))
            connectionsClient.sendPayload(endpointId, payload)
                .addOnSuccessListener {
                    Log.d(TAG, "[Nearby Auto Send] Successfully sent login info to $endpointId")
                }
                .addOnFailureListener { e ->
                    Log.e(TAG, "[Nearby Auto Send] Failed to send login info to $endpointId", e)
                }
        } catch (e: Exception) {
            Log.e(TAG, "[Nearby Auto Send] Error while sending login info", e)
        }
    }
    // -----------------------------------------------------------------

    // --- Nearby Advertising 시작 함수 ---
    @ReactMethod
    fun startNearbyAdvertising(promise: Promise) {
        Log.i(TAG, "[Nearby] Attempting to start advertising...")
        val advertisingOptions = AdvertisingOptions.Builder().setStrategy(NEARBY_STRATEGY).build()
        // 사용자 이름 또는 기기 이름을 Advertising 이름으로 사용
        val localEndpointName = reactContext.packageName // 또는 Build.MODEL 등 사용 가능

        connectionsClient.startAdvertising(
            localEndpointName, // 이 기기를 식별하는 이름
            NEARBY_SERVICE_ID, // 서비스 ID
            connectionLifecycleCallback, // 연결 콜백
            advertisingOptions
        ).addOnSuccessListener {
            Log.i(TAG, "[Nearby] Advertising started successfully!")
            promise.resolve("Nearby Advertising started successfully.")
        }.addOnFailureListener { e ->
            // Log detailed error information
            val statusCode = (e as? ApiException)?.statusCode
            val statusMessage = ConnectionsStatusCodes.getStatusCodeString(statusCode ?: ConnectionsStatusCodes.STATUS_ERROR)
            Log.e(TAG, "[Nearby] Failed to start advertising. Status: $statusMessage ($statusCode)", e)
            promise.reject("ADVERTISING_FAILED", "Failed to start Nearby Advertising: $statusMessage ($statusCode)", e)
        }
    }
    // ------------------------------------

    // --- Nearby Advertising 중지 함수 (필요시 구현) ---
    @ReactMethod
    fun stopNearbyAdvertising(promise: Promise) {
        Log.i(TAG, "[Nearby] Stopping advertising...")
        connectionsClient.stopAdvertising()
        // stopAdvertising은 결과를 반환하지 않으므로 즉시 성공 처리
        Log.i(TAG, "[Nearby] Advertising stopped.")
        promise.resolve("Nearby Advertising stopped.")
    }
    // -------------------------------------

    // --- Nearby 연결 해제 함수 (필요시 구현) ---
     @ReactMethod
    fun disconnectNearby(promise: Promise) {
        if (nearbyConnectedEndpointId != null) {
             Log.i(TAG, "[Nearby] Disconnecting from endpoint: $nearbyConnectedEndpointId")
            connectionsClient.disconnectFromEndpoint(nearbyConnectedEndpointId!!)
            nearbyConnectedEndpointId = null // 즉시 null 처리 (실제 콜백은 나중에 올 수 있음)
             promise.resolve("Disconnection initiated.")
        } else {
             Log.w(TAG, "[Nearby] No active connection to disconnect.")
             promise.reject("NO_CONNECTION", "No active Nearby connection.")
        }
    }
    // -------------------------------------

    // 간단한 Ping 메시지를 보내는 새 함수 (기존 MessageClient 방식)
    @ReactMethod
    fun sendPingToWear(promise: Promise) {
        // ... (기존 sendPingToWear 내용) ...
        // TODO: 이 함수를 Nearby Connections 방식으로 변경하거나 별도 함수로 분리 필요
         Log.w(TAG, "[Legacy] sendPingToWear (MessageClient) called. Consider using Nearby.")
         promise.reject("DEPRECATED", "Use Nearby Connections instead.")
        /* // 기존 MessageClient 코드 (참고용)
        val nodeId = connectedNodeId
        if (nodeId == null) {
            promise.reject("NO_NODE", "No connected wearable node found.")
            return
        }
        val pingPath = "/ping"
        val pingPayload = "ping from phone".toByteArray(StandardCharsets.UTF_8)
        Log.d(TAG, "[Ping Test] Sending ping to node $nodeId, path: $pingPath")
        val sendMessageTask = messageClient.sendMessage(nodeId, pingPath, pingPayload)
        sendMessageTask.addOnSuccessListener {
            Log.i(TAG, "[Ping Test] Ping message sent successfully to node $nodeId.")
            promise.resolve("Ping sent successfully.")
        }
        sendMessageTask.addOnFailureListener { e ->
            Log.e(TAG, "[Ping Test] Failed to send ping message to node $nodeId.", e)
            promise.reject("PING_FAILED", "Failed to send ping message.", e)
        }
        */
    }

    // 모듈 정리 시 (필요한 경우 리스너 제거 등)
    override fun invalidate() {
        super.invalidate()
        Log.w(TAG, "<<<<< WearSyncModule invalidated! Stopping all endpoints. >>>>>") // Use Warning log
        // 앱 종료 시 Nearby 리소스 정리
        connectionsClient.stopAllEndpoints() // 모든 연결 및 검색/광고 중지
        Log.i(TAG, "[Nearby] Stopped all Nearby endpoints in invalidate.")
        // Listener 등이 있다면 여기서 제거
    }

    @ReactMethod
    fun saveAccessTokenToNative(token: String, promise: Promise) {
        try {
            val sharedPreferences = reactContext.getSharedPreferences("auth_prefs", Context.MODE_PRIVATE)
            sharedPreferences.edit().putString("accessToken", token).apply()
            Log.i(TAG, "[Bridge] AccessToken saved to SharedPreferences: $token")
            promise.resolve(true)
        } catch (e: Exception) {
            Log.e(TAG, "[Bridge] Failed to save AccessToken", e)
            promise.reject("SAVE_TOKEN_FAILED", "Failed to save access token", e)
        }
    }
} 