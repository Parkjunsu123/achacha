package com.koup28.achacha_app.presentation.theme

import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.sp
import androidx.wear.compose.material.Typography

// Font.kt에서 정의한 PretendardFamily를 임포트합니다.
// import com.koup28.achacha_app.presentation.theme.PretendardFamily // 이미 같은 패키지이므로 자동 임포트 될 수 있습니다.

val AppTypography = Typography(
    defaultFontFamily = PretendardFamily, // 앱 전체 기본 폰트를 프리텐다드로 설정

    // 모든 텍스트 스타일이 기본적으로 Pretendard-Medium 굵기를 사용하게 됩니다.
    // 만약 다른 굵기의 폰트 파일이 PretendardFamily에 정의되어 있지 않다면,
    // fontWeight를 다르게 지정해도 Medium으로 렌더링될 수 있습니다.
    title1 = TextStyle(
        // fontFamily = PretendardFamily, // defaultFontFamily로 설정했으므로 생략 가능
        fontWeight = FontWeight.Medium, // PretendardFamily에 Medium만 있다면 이것이 적용됨
        fontSize = 30.sp
    ),
    title2 = TextStyle(
        fontWeight = FontWeight.Medium,
        fontSize = 24.sp
    ),
    title3 = TextStyle(
        fontWeight = FontWeight.Medium,
        fontSize = 20.sp
    ),
    body1 = TextStyle(
        fontWeight = FontWeight.Medium,
        fontSize = 16.sp
    ),
    body2 = TextStyle(
        fontWeight = FontWeight.Medium,
        fontSize = 14.sp
    ),
    button = TextStyle(
        fontWeight = FontWeight.Medium, 
        fontSize = 15.sp
    ),
    caption1 = TextStyle(
        fontWeight = FontWeight.Medium,
        fontSize = 12.sp
    ),
    caption2 = TextStyle(
        fontWeight = FontWeight.Medium,
        fontSize = 11.sp
    )
    // 기타 필요한 스타일(overline 등)도 위와 같이 설정
) 