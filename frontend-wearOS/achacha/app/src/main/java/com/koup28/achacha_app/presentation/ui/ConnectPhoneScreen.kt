package com.koup28.achacha_app.presentation.ui

import androidx.compose.foundation.layout.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.wear.compose.material.Chip
import androidx.wear.compose.material.ChipDefaults
import androidx.wear.compose.material.MaterialTheme
import androidx.wear.compose.material.Scaffold
import androidx.wear.compose.material.Text
import androidx.wear.compose.material.TimeText
import androidx.wear.compose.material.Vignette
import androidx.wear.compose.material.VignettePosition
import androidx.compose.ui.graphics.Color
import androidx.wear.compose.material.CircularProgressIndicator
import androidx.wear.compose.material.Button
import com.koup28.achacha_app.presentation.theme.TitleFontFamily
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember

@Composable
fun ConnectPhoneScreen(
    onConnectClick: () -> Unit
) {
    val (isConnecting, setIsConnecting) = remember { mutableStateOf(false) }
    Scaffold(
        timeText = { TimeText(modifier = Modifier.padding(top = 6.dp)) },
        vignette = { Vignette(vignettePosition = VignettePosition.TopAndBottom) }
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(horizontal = 16.dp, vertical = 8.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            Text(
                text = "ㅇㅊㅊ",
                style = MaterialTheme.typography.title2,
                textAlign = TextAlign.Center,
                fontFamily = TitleFontFamily
            )
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                text = "앱 사용을 위해\n스마트폰과 연결해주세요.",
                style = MaterialTheme.typography.body1,
                textAlign = TextAlign.Center
            )
            Spacer(modifier = Modifier.height(16.dp))
            Chip(
                onClick = {
                    setIsConnecting(true)
                    onConnectClick()
                },
                label = { 
                    Text(
                        text = if (isConnecting) "연결중..." else "연결 시작", 
                        modifier = Modifier.fillMaxWidth(),
                        textAlign = TextAlign.Center
                    ) 
                },
                enabled = !isConnecting,
                colors = ChipDefaults.chipColors(
                    backgroundColor = Color(0xFFAECBFA), 
                    contentColor = Color.Black
                ),
                modifier = Modifier.fillMaxWidth(0.8f)
            )
        }
    }
} 