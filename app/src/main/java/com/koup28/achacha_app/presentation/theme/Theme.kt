package com.koup28.achacha_app.presentation.theme

import androidx.compose.runtime.Composable
import androidx.wear.compose.material.MaterialTheme
import androidx.wear.compose.material.Colors
// import androidx.wear.compose.material.Typography // AppTypography를 사용하므로 주석 처리 또는 삭제
import androidx.compose.ui.graphics.Color

// Font.kt와 Type.kt에서 정의한 PretendardFamily와 AppTypography를 사용합니다.
// import com.koup28.achacha_app.presentation.theme.AppTypography // 이미 같은 패키지

// Define basic Colors and Typography if not provided by default
internal val wearColorPalette: Colors = Colors(
    // Define your colors here or use defaults
    primary = Color(0xFF00BCD4), // Example Cyan
    primaryVariant = Color(0xFF0097A7),
    secondary = Color(0xFF80DEEA),
    // ... other colors
    background = Color.Black, // 예시: Wear OS 기본 배경색
    surface = Color.DarkGray, // 예시: Wear OS 카드 배경색
    error = Color.Red,
    onPrimary = Color.Black,
    onSecondary = Color.Black,
    onBackground = Color.White,
    onSurface = Color.White,
    onError = Color.Black
)

// internal val Typography = Typography( // 이 부분은 Type.kt의 AppTypography로 대체되므로 삭제 또는 주석 처리
// Define your typography styles here or use defaults
// )

@Composable
fun AchachaAppTheme( // 테마 함수 이름 변경 (필요에 따라 원래 이름 사용)
    content: @Composable () -> Unit
) {
    MaterialTheme(
        colors = wearColorPalette, // 기존 색상 팔레트 유지 또는 AppColorPalette 사용
        typography = AppTypography, // Type.kt에서 정의한 AppTypography 사용
        // For shapes, we generally recommend using the default Material Wear shapes which are
        // optimized for round and non-round devices.
        content = content
    )
} 