package com.koup28.achacha_app.presentation.ui

import android.bluetooth.BluetoothManager
import android.bluetooth.le.*
import android.content.Context
import android.os.ParcelUuid
import android.util.Log
import androidx.compose.animation.core.*
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.layout.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.util.lerp
import androidx.wear.compose.material.*
import kotlinx.coroutines.*
import com.koup28.achacha_app.data.ApiService
import com.koup28.achacha_app.data.GiveAwayRequest
import java.util.UUID
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.draw.clip
import androidx.compose.foundation.clickable
import android.util.Base64
import com.koup28.achacha_app.data.UserDataStore
import kotlinx.coroutines.flow.firstOrNull
import org.json.JSONObject

@Composable
fun SharingScreen(
    gifticonId: Int?, // 실제 나눔 로직 시작 시 사용될 ID
    onBackClick: () -> Unit, // 탐색 중지 또는 뒤로 가기
    apiService: ApiService, // ApiService 인스턴스 전달 필요
    context: Context, // LocalContext.current 전달 필요
    onScanFail: () -> Unit // 콜백 추가
) {
    Log.d("NavigationCheck", "SharingScreen (Nearby Search UI) Composable called with gifticonId: $gifticonId")

    val SERVICE_UUID = UUID.fromString("00001bf0-0000-1000-8000-00805f9b34fb")
    var isScanning by remember { mutableStateOf(true) }
    var resultText by remember { mutableStateOf("") }
    val coroutineScope = rememberCoroutineScope()
    var scanJob by remember { mutableStateOf<Job?>(null) }
    var scannerRef by remember { mutableStateOf<BluetoothLeScanner?>(null) }
    var scanCallbackRef by remember { mutableStateOf<ScanCallback?>(null) }

    // BLE 스캔 및 API 호출 로직
    LaunchedEffect(gifticonId) {
        if (gifticonId == null) return@LaunchedEffect
        val foundUserIds = mutableSetOf<String>()
        val bluetoothManager = context.getSystemService(Context.BLUETOOTH_SERVICE) as BluetoothManager
        val bluetoothAdapter = bluetoothManager.adapter
        val scanner = bluetoothAdapter.bluetoothLeScanner
        scannerRef = scanner

        val scanCallback = object : ScanCallback() {
            override fun onScanResult(callbackType: Int, result: ScanResult) {
                val scanRecord = result.scanRecord
                val bleTokenBytes = scanRecord?.getServiceData(ParcelUuid(SERVICE_UUID))
                Log.d("BLE_SCAN", "raw bytes: ${bleTokenBytes?.contentToString()}")
                val bleToken = bleTokenBytes?.toString(Charsets.UTF_8)
                Log.d("BLE_SCAN", "스캔 결과: $bleToken (raw: $bleTokenBytes)")
                val hasOurUuid = scanRecord?.serviceUuids?.contains(ParcelUuid(SERVICE_UUID)) == true
                if (hasOurUuid) {
                    Log.d("BLE_SCAN", "우리 서비스 UUID가 포함된 기기 발견: ${result.device?.address}")
                }
                if (!bleToken.isNullOrEmpty()) {
                    foundUserIds.add(bleToken)
                    Log.d("BLE_SCAN", "사용자 발견: $bleToken")
                }
            }
            override fun onBatchScanResults(results: List<ScanResult>) {
                Log.d("BLE_SCAN", "배치 스캔 결과: ${results.size}개")
                results.forEach { onScanResult(ScanSettings.CALLBACK_TYPE_ALL_MATCHES, it) }
            }
            override fun onScanFailed(errorCode: Int) {
                Log.e("BLE_SCAN", "스캔 실패: $errorCode")
            }
        }
        scanCallbackRef = scanCallback

        Log.d("BLE_SCAN", "BLE 스캔 시작")
        scanner.startScan(null, ScanSettings.Builder().build(), scanCallback)
        scanJob = coroutineScope.launch {
            delay(5000)
            if (isScanning) {
                Log.d("BLE_SCAN", "BLE 스캔 종료")
                scanner.stopScan(scanCallback)
                isScanning = false
                // API 호출
                Log.d("BLE_SCAN", "발견된 사용자: ${foundUserIds.toList()}")
                if (foundUserIds.isNotEmpty()) {
                    try {
                        Log.d("BLE_SCAN", "나눔 API 호출 시작")
                        val userDataStore = UserDataStore(context)
                        val token = userDataStore.accessTokenFlow.firstOrNull()
                        if (token.isNullOrEmpty()) {
                            Log.e("BLE_SCAN", "토큰이 없습니다. 인증 필요.")
                            resultText = "인증 토큰이 없습니다."
                            return@launch
                        }
                        val authorizationHeader = "Bearer $token"
                        Log.d("BLE_SCAN", "API에 전달할 uuids: ${foundUserIds.toList()}")
                        val response = apiService.giveAwayGifticon(
                            authorizationHeader,
                            gifticonId,
                            GiveAwayRequest(foundUserIds.toList())
                        )
                        Log.d("BLE_SCAN", "나눔 API 응답: ${response.code()} / 성공여부: ${response.isSuccessful}")
                        if (response.isSuccessful) {
                            resultText = "뿌리기 성공!"
                        } else {
                            val errorBody = response.errorBody()?.string()
                            val errorMsg = parseGiveAwayError(errorBody)
                            resultText = "나눔 실패: $errorMsg"
                            Log.e("BLE_SCAN", "나눔 API 에러 바디: $errorBody")
                        }
                    } catch (e: Exception) {
                        Log.e("BLE_SCAN", "나눔 API 호출 실패: ${e.localizedMessage}")
                        resultText = "뿌리기 실패: ${e.localizedMessage}"
                    }
                } else {
                    Log.d("BLE_SCAN", "주변 사용자를 찾지 못함 (serviceUuids: $SERVICE_UUID)")
                    onScanFail() // 콜백 호출
                    return@launch
                }
            }
        }
    }

    // 탐색 중지 버튼 클릭 시 스캔 중단
    fun stopScanEarly() {
        if (isScanning) {
            scannerRef?.let { scanner ->
                scanCallbackRef?.let { callback ->
                    scanner.stopScan(callback)
                }
            }
            scanJob?.cancel()
            isScanning = false
            resultText = "탐색이 중단되었습니다."
        }
    }

    Scaffold(
        timeText = { TimeText(modifier = Modifier.padding(top = 4.dp)) }, // 패딩 약간 조절
        // Vignette는 레이더 애니메이션과 함께 사용할 경우 화면 가장자리가 어두워져 방해가 될 수 있으므로 일단 제거 고려
        // vignette = { Vignette(vignettePosition = VignettePosition.TopAndBottom) }
    ) {
        if (resultText == "뿌리기 성공!") {
            GiveAwaySuccessScreen(onBackClick = onBackClick)
        } else {
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(horizontal = 12.dp, vertical = 8.dp), // 패딩 조절
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.SpaceBetween // 요소들을 위, 중간, 아래로 분산
            ) {
                Text(
                    if (isScanning) "주변 탐색 중..." else "",
                    style = MaterialTheme.typography.title3,
                    modifier = Modifier.padding(top = 20.dp) // 상단 여백 추가
                )

                RadarAnimation(modifier = Modifier.weight(1f).aspectRatio(1f).padding(8.dp)) // 레이더 애니메이션 영역

                if (resultText.isNotEmpty()) {
                    Text(resultText, color = Color.Black, modifier = Modifier.padding(8.dp))
                }

                // 탐색 중일 때만 버튼 노출, 탐색이 끝나면 버튼 없음
                if (isScanning) {
                    Chip(
                        onClick = {
                            stopScanEarly()
                            onBackClick()
                        },
                        label = {
                            Text(
                                text = "탐색 중지",
                                textAlign = TextAlign.Center,
                                modifier = Modifier.fillMaxWidth()
                            )
                        },
                        colors = ChipDefaults.chipColors(
                            backgroundColor = Color(0xFFAECBFA),
                            contentColor = Color.Black
                        ),
                        modifier = Modifier
                            .fillMaxWidth(0.5f)
                            .padding(bottom = 8.dp)
                    )
                }
            }
        }
    }
}

@Composable
fun RadarAnimation(modifier: Modifier = Modifier) {
    val infiniteTransition = rememberInfiniteTransition(label = "radar_transition")
    val primaryColor = MaterialTheme.colors.primary

    val animationDuration = 1500
    val initialAlpha = 1f
    val targetAlpha = 0f
    val initialRadiusRatio = 0.1f
    val targetRadiusRatio = 1.0f
    val numCircles = 3
    val delayBetweenCircles = animationDuration / numCircles

    val animatedValues = List(numCircles) { i ->
        infiniteTransition.animateFloat(
            initialValue = 0f,
            targetValue = 1f,
            animationSpec = infiniteRepeatable(
                animation = tween(durationMillis = animationDuration, easing = LinearEasing),
                repeatMode = RepeatMode.Restart,
                initialStartOffset = StartOffset(i * delayBetweenCircles)
            ),
            label = "radar_circle_$i"
        )
    }

    BoxWithConstraints(modifier = modifier, contentAlignment = Alignment.Center) {
        val canvasSize = constraints.maxWidth.coerceAtMost(constraints.maxHeight)
        val maxRadius = canvasSize / 2f

        Canvas(modifier = Modifier.size(canvasSize.dp)) { // size를 dp로 변환
            val center = Offset(size.width / 2, size.height / 2)

            animatedValues.forEach { animatedFloatState ->
                val animatedValue = animatedFloatState.value

                val currentRadius = lerp(initialRadiusRatio, targetRadiusRatio, animatedValue) * maxRadius
                val currentAlpha = lerp(initialAlpha, targetAlpha, animatedValue)
                val currentStrokeWidth = lerp(4f, 1f, animatedValue)

                if (currentAlpha > 0) {
                    drawCircle(
                        color = primaryColor.copy(alpha = currentAlpha),
                        radius = currentRadius,
                        center = center,
                        style = Stroke(width = currentStrokeWidth)
                    )
                }
            }
        }
    }
}

// 탐색 실패 전용 스크린 추가
@Composable
fun BleScanFailScreen(onBackClick: () -> Unit) {
    Scaffold(
        timeText = { TimeText(modifier = Modifier.padding(top = 4.dp)) },
    ) {
        Box(
            modifier = Modifier
                .fillMaxSize()
                .clickable { onBackClick() }, // 전체 화면 터치 시 뒤로
            contentAlignment = Alignment.Center
        ) {
            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                Text(
                    text = "탐색 실패!",
                    style = MaterialTheme.typography.title2,
                    color = MaterialTheme.colors.onBackground, // 기존 텍스트와 동일한 색상
                    modifier = Modifier.padding(bottom = 8.dp)
                )
                Text(
                    text = "현재 탐색되는 사용자가 없습니다.",
                    style = MaterialTheme.typography.body1,
                    textAlign = TextAlign.Center
                )
                Spacer(modifier = Modifier.height(16.dp))
                // Chip 버튼 제거
            }
        }
    }
}

// 뿌리기 완료 전용 스크린 추가
@Composable
fun GiveAwaySuccessScreen(onBackClick: () -> Unit) {
    Scaffold(
        timeText = { TimeText(modifier = Modifier.padding(top = 4.dp)) },
    ) {
        Box(
            modifier = Modifier
                .fillMaxSize()
                .clickable { onBackClick() }, // 전체 화면 터치 시 뒤로
            contentAlignment = Alignment.Center
        ) {
            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                Text(
                    text = "뿌리기 완료!",
                    style = MaterialTheme.typography.title2,
                    color = MaterialTheme.colors.primary,
                    modifier = Modifier.padding(bottom = 8.dp)
                )
                Text(
                    text = "기프티콘을 성공적으로 뿌렸습니다.",
                    style = MaterialTheme.typography.body1,
                    textAlign = TextAlign.Center
                )
                Spacer(modifier = Modifier.height(16.dp))
            }
        }
    }
}

// Preview는 필요시 유지하거나 수정
// @Preview(device = WearDevices.SMALL_ROUND, showSystemUi = true)
// @Composable
// fun SharingScreenPreview() {
//     Achacha_wearOSTheme {
//         SharingScreen(gifticonId = 123, navController = rememberSwipeDismissableNavController())
//     }
// }

fun parseGiveAwayError(errorBody: String?): String {
    if (errorBody.isNullOrBlank()) return "알 수 없는 오류가 발생했습니다."
    return try {
        val json = JSONObject(errorBody)
        when (json.optString("errorCode")) {
            "GIFTICON_010" -> "기프티콘 잔액이 부족합니다."
            "GIFTICON_011" -> "기프티콘 타입이 올바르지 않습니다."
            "GIFTICON_013" -> "유효기간이 지난 기프티콘입니다."
            "GIFTICON_002" -> "해당 기프티콘에 접근 권한이 없습니다."
            "GIFTICON_004" -> "이미 사용된 기프티콘입니다."
            "GIFTICON_005" -> "삭제된 기프티콘입니다."
            else -> json.optString("message", "알 수 없는 오류가 발생했습니다.")
        }
    } catch (e: Exception) {
        errorBody // 파싱 실패 시 원본 메시지 반환
    }
} 