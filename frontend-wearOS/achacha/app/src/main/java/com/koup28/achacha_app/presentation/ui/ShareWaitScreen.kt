package com.koup28.achacha_app.presentation.ui

import androidx.activity.compose.BackHandler
import androidx.compose.foundation.Image
import androidx.compose.foundation.gestures.detectDragGestures
import androidx.compose.foundation.layout.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.wear.compose.material.*
import com.koup28.achacha_app.R // R 클래스 import 확인

@Composable
fun ShareWaitScreen(
    // gifticonId: Int?, // 이 화면에서는 직접 사용하지 않으므로 제거하거나 MainActivity에서만 관리 가능
    onBackClick: () -> Unit, // 시스템 뒤로가기 시 호출됩니다.
    onSwipeUpToShare: () -> Unit // 위로 스와이프 시 호출될 콜백
) {
    var offsetY by remember { mutableFloatStateOf(0f) }

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
                .pointerInput(Unit) {
                    detectDragGestures(
                        onDragStart = { offsetY = 0f }, // 드래그 시작 시 Y 오프셋 초기화
                        onDrag = { change, dragAmount ->
                            change.consume()
                            offsetY += dragAmount.y
                        },
                        onDragEnd = {
                            if (offsetY < -50) { // 임계값, 위로 충분히 드래그했는지 확인 (값 조절 가능)
                                onSwipeUpToShare()
                            }
                            offsetY = 0f // 드래그 종료 시 오프셋 초기화
                        }
                    )
                }
                .padding(16.dp),
            contentAlignment = Alignment.Center
        ) {
            Column(
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.Center
            ) {
                Image(
                    painter = painterResource(id = R.drawable.gift), // gift.png 사용
                    contentDescription = "뿌리기 선물 아이콘",
                    modifier = Modifier.size(80.dp) // 이미지 크기 조절
                )
                Spacer(modifier = Modifier.height(16.dp))
                Text(
                    text = "뿌리기를 위하여\n위로 쓸어주세요",
                    style = MaterialTheme.typography.body1,
                    textAlign = TextAlign.Center
                )
            }
        }
    }
} 