package com.koup28.achacha_app.presentation.theme

import androidx.compose.ui.text.font.Font
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import com.koup28.achacha_app.R // R 클래스의 정확한 임포트 경로를 확인해주세요.

// Pretendard-Medium 폰트 사용
val PretendardFamily = FontFamily(
    Font(R.font.pretendard_medium, FontWeight.Medium) // res/font/pretendard_medium.otf (또는 .ttf) 로 가정
    // 다른 굵기의 폰트 파일(Regular, Bold 등)도 추가하셨다면 여기에 포함시켜야 합니다.
    // 예: Font(R.font.pretendard_regular, FontWeight.Normal),
    //     Font(R.font.pretendard_bold, FontWeight.Bold)
)

// "title_font.ttf"를 위한 새로운 FontFamily 정의
val TitleFontFamily = FontFamily(
    Font(R.font.title_font, FontWeight.Normal) // res/font/title_font.ttf 로 가정
    // 만약 title_font.ttf가 다양한 굵기를 지원하고 해당 파일들이 있다면 여기에 추가 가능
    // 예: Font(R.font.title_font_bold, FontWeight.Bold)
) 