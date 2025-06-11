package com.koup28.achacha_app.presentation.ui

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.wear.compose.material.*
import com.koup28.achacha_app.presentation.theme.TitleFontFamily

@Composable
fun MainMenuScreen(
    // storedData: String? // 파라미터 제거
    onGifticonManageClick: () -> Unit, // 기프티콘 관리 버튼 클릭 콜백
    onNotificationBoxClick: () -> Unit, // 알림함 버튼 클릭 콜백
    onDeleteTokenClick: () -> Unit // 토큰 삭제 콜백 추가
) {
    Scaffold(
        timeText = { TimeText(modifier = Modifier.padding(top = 6.dp)) },
        vignette = { Vignette(vignettePosition = VignettePosition.TopAndBottom) } // 비네트 추가
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(16.dp)
                .verticalScroll(rememberScrollState()),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center // 중앙 정렬 유지
        ) {
            Text(
                text = "ㅇㅊㅊ", // 제목 변경
                style = MaterialTheme.typography.title1, // 제목 크기 조정
                textAlign = TextAlign.Center,
                fontFamily = TitleFontFamily, // 여기에 TitleFontFamily 적용
                modifier = Modifier.padding(top = 24.dp) // 상단 패딩을 24.dp로 증가
            )
            Spacer(modifier = Modifier.height(16.dp)) // 버튼 위 간격을 16.dp로 감소

            // 기프티콘 관리 버튼 (Chip) - 스타일 적용
            Chip(
                onClick = onGifticonManageClick,
                label = { 
                    Text(
                        text = "기프티콘 관리",
                        modifier = Modifier.fillMaxWidth(), // 너비 채우기
                        textAlign = TextAlign.Center // 중앙 정렬
                    )
                },
                colors = ChipDefaults.chipColors(
                    backgroundColor = Color(0xFFAECBFA), // 배경색 설정
                    contentColor = Color.Black // 텍스트 색상 설정
                ),
                modifier = Modifier.fillMaxWidth(0.8f) // 너비 조정
            )
            Spacer(modifier = Modifier.height(8.dp)) // 버튼 사이 간격

            // 알림함 버튼 (Chip) - 스타일 적용
            Chip(
                onClick = onNotificationBoxClick,
                label = { 
                    Text(
                        text = "알림함",
                        modifier = Modifier.fillMaxWidth(), 
                        textAlign = TextAlign.Center 
                    ) 
                },
                colors = ChipDefaults.chipColors(
                    backgroundColor = Color(0xFFAECBFA), 
                    contentColor = Color.Black 
                ),
                modifier = Modifier.fillMaxWidth(0.8f) 
            )
            Spacer(modifier = Modifier.height(16.dp)) // 버튼 사이 간격을 16.dp로 증가

            // 토큰 삭제 버튼 (Chip) -> 원형, 보더만 있는 스타일, 크기 조정
            Chip(
                onClick = onDeleteTokenClick,
                label = {
                    Text(
                        text = "X", 
                        style = MaterialTheme.typography.title3, 
                        textAlign = TextAlign.Center,
                        modifier = Modifier.fillMaxWidth() 
                    )
                },
                colors = ChipDefaults.outlinedChipColors( 
                    contentColor = Color(0xFFF48FB1)    
                ),
                border = ChipDefaults.outlinedChipBorder( 
                    borderColor = Color(0xFFF48FB1)     
                ),
                modifier = Modifier
                    .size(40.dp) // 버튼 크기를 40.dp로 직접 지정 (기존 SmallButtonSize보다 작게)
                    .clip(CircleShape),
                shape = CircleShape 
            )

            // // 저장된 정보 표시 제거
            // Spacer(modifier = Modifier.height(8.dp))
            // if (storedData != null) {
            //     Text(
            //         text = "저장된 정보: $storedData",
            //         style = MaterialTheme.typography.caption1,
            //         textAlign = TextAlign.Center
            //     )
            // }
        }
    }
} 