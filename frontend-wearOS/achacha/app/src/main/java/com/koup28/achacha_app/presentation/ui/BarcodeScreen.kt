package com.koup28.achacha_app.presentation.ui

import android.app.Activity
import android.util.Log
import android.view.WindowManager
import androidx.activity.compose.BackHandler
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.wear.compose.material.*
import coil.compose.rememberAsyncImagePainter
import com.koup28.achacha_app.data.BarcodeInfo
import androidx.compose.foundation.border
import androidx.compose.ui.zIndex

@Composable
fun BarcodeScreen(
    gifticonId: Int?,
    barcodeInfo: BarcodeInfo?,
    isLoading: Boolean,
    error: String?,
    onBackClick: () -> Unit,
    onRetryClick: () -> Unit
) {
    val context = LocalContext.current
    // val window = (context as? Activity)?.window // 임시 주석 처리

    // var originalBrightness by remember { mutableFloatStateOf(WindowManager.LayoutParams.BRIGHTNESS_OVERRIDE_NONE) } // 임시 주석 처리

    // DisposableEffect(window) { // 임시 주석 처리
    //     if (window != null) {
    //         val currentAttributes = window.attributes
    //         originalBrightness = currentAttributes.screenBrightness 
    //         window.attributes = currentAttributes.apply {
    //             screenBrightness = WindowManager.LayoutParams.BRIGHTNESS_OVERRIDE_FULL
    //         }
    //         Log.d("BarcodeScreen", "Set brightness to MAX")
    //     }
    // 
    //     onDispose {
    //         if (window != null) {
    //             window.attributes = window.attributes.apply {
    //                 screenBrightness = originalBrightness
    //             }
    //             Log.d("BarcodeScreen", "Restored brightness to $originalBrightness")
    //         }
    //     }
    // } // 임시 주석 처리

    // 시스템 뒤로가기 버튼 처리
    BackHandler(enabled = true) {
        onBackClick()
    }

    Scaffold(
        timeText = { TimeText(modifier = Modifier.padding(top = 6.dp)) },
        vignette = { Vignette(vignettePosition = VignettePosition.TopAndBottom) }
    ) {
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(Color.White)
                .clickable { onBackClick() } // 전체 화면 클릭 리스너 복원
                .padding(16.dp), // 원래 패딩으로 복원
            contentAlignment = Alignment.Center
        ) {
            when {
                isLoading -> {
                    CircularProgressIndicator(modifier = Modifier.align(Alignment.Center))
                }
                error != null -> {
                    Column(
                        modifier = Modifier.align(Alignment.Center),
                        horizontalAlignment = Alignment.CenterHorizontally,
                        verticalArrangement = Arrangement.Center
                    ) {
                        Text(
                            text = error,
                            color = MaterialTheme.colors.error,
                            textAlign = TextAlign.Center
                        )
                        Spacer(modifier = Modifier.height(8.dp))
                        Button(onClick = onRetryClick) {
                            Text("재시도")
                        }
                        Spacer(modifier = Modifier.height(8.dp))
                        Button(onClick = onBackClick) { // 이 버튼은 유지
                            Text("뒤로 (버튼)")
                        }
                    }
                }
                barcodeInfo != null -> {
                    Box(
                        modifier = Modifier
                            .align(Alignment.Center)
                            .size(180.dp)
                            .background(Color.White)
                        ,
                        contentAlignment = Alignment.Center
                    ) {
                        Image(
                            painter = rememberAsyncImagePainter(
                                model = barcodeInfo.barcodeDrawableResId ?: barcodeInfo.barcodePath,
                                onError = { err ->
                                    Log.e("BarcodeScreen", "Image load error: \\${err.result.throwable.localizedMessage}")
                                },
                                onLoading = { }
                            ),
                            contentDescription = "바코드 이미지",
                            modifier = Modifier.fillMaxSize(),
                            contentScale = ContentScale.Fit
                        )
                        Text(
                            text = barcodeInfo.gifticonBarcodeNumber,
                            style = MaterialTheme.typography.body2,
                            fontSize = 18.sp,
                            color = Color.Black,
                            textAlign = TextAlign.Center,
                            modifier = Modifier
                                .align(Alignment.Center)
                                .zIndex(1f)
                                .offset(y = 40.dp)
                        )
                    }
                }
                else -> {
                    Column(
                        modifier = Modifier.align(Alignment.Center),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Text("바코드 정보를 표시할 수 없습니다.", textAlign = TextAlign.Center, color = Color.Black)
                        Spacer(modifier = Modifier.height(8.dp))
                    }
                }
            }
        }
    }
} 