package com.koup28.achacha_app.presentation.ui

import androidx.activity.compose.BackHandler
import androidx.compose.foundation.layout.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.wear.compose.material.*
import androidx.wear.compose.material.MaterialTheme
import androidx.wear.compose.material.Scaffold
import androidx.wear.compose.material.Text
import androidx.wear.compose.material.TimeText
import androidx.wear.compose.material.Vignette
import androidx.wear.compose.material.Chip
import androidx.wear.compose.material.ChipDefaults
import java.time.LocalDate
import java.time.LocalDateTime
import java.time.format.DateTimeFormatter
import java.time.format.DateTimeParseException

// Import Accompanist Pager and related components
import com.google.accompanist.pager.ExperimentalPagerApi
import com.google.accompanist.pager.HorizontalPager
import com.google.accompanist.pager.rememberPagerState
import androidx.compose.runtime.LaunchedEffect // Keep LaunchedEffect for pager state observation
import androidx.compose.foundation.rememberScrollState // 추가
import androidx.compose.foundation.verticalScroll // 추가

// 날짜 형식 변환 함수 (YYYY-MM-DD -> YYYY.MM.DD)
fun formatExpiryDate(dateStr: String): String {
    return try {
        val inputFormatter = DateTimeFormatter.ISO_LOCAL_DATE // YYYY-MM-DD
        val outputFormatter = DateTimeFormatter.ofPattern("yyyy.MM.dd")
        LocalDate.parse(dateStr, inputFormatter).format(outputFormatter)
    } catch (e: DateTimeParseException) {
        dateStr // 파싱 실패 시 원본 반환
    }
}

@OptIn(ExperimentalPagerApi::class) // Opt-in for experimental Pager API
@Composable
fun GifticonDetailScreen(
    // Updated parameters
    gifticons: List<ApiGifticon>,
    initialIndex: Int,
    onCurrentGifticonIndexChanged: (Int) -> Unit, // Callback when page changes
    onShowBarcodeClick: (gifticonId: Int) -> Unit,
    // Add callbacks for new buttons
    onShareClick: (gifticonId: Int) -> Unit,
    onUseClick: (gifticonId: Int) -> Unit,
    onBackPress: () -> Unit // 뒤로가기 콜백 추가
) {
    // Handle empty list or invalid index
    if (gifticons.isEmpty() || initialIndex < 0 || initialIndex >= gifticons.size) {
        Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
            Text("기프티콘 정보를 표시할 수 없습니다.")
        }
        // 뒤로가기 핸들러는 여기에도 추가할 수 있지만, 일반적으로 메인 컨텐츠에 연결
        BackHandler(enabled = true) { onBackPress() }
        return // Exit composable if data is invalid
    }

    // Remember the pager state, starting from the initial index
    val pagerState = rememberPagerState(initialPage = initialIndex)

    // Use LaunchedEffect to monitor currentPage changes and call the callback
    LaunchedEffect(pagerState.currentPage) {
        onCurrentGifticonIndexChanged(pagerState.currentPage)
    }

    // 시스템 뒤로가기 버튼 처리
    BackHandler(enabled = true) {
        onBackPress()
    }

    Scaffold(
        timeText = { TimeText(modifier = Modifier.padding(top = 6.dp)) },
        vignette = { Vignette(vignettePosition = VignettePosition.TopAndBottom) }
        // Optional: Add position indicator for the pager here if desired
        // positionIndicator = { HorizontalPagerIndicator(pagerState = pagerState, ...) }
    ) {
        // Use HorizontalPager to enable swipe navigation
        HorizontalPager(
            count = gifticons.size, // Total number of pages
            state = pagerState,     // Control the pager state
            modifier = Modifier.fillMaxSize()
        ) { pageIndex -> // Content lambda for each page
            // Get the gifticon for the current page
            val currentGifticon = gifticons[pageIndex]

            // Column displaying the gifticon details (same as before)
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .verticalScroll(rememberScrollState()) // 세로 스크롤 추가
                    .padding(start = 16.dp, end = 16.dp, top = 24.dp, bottom = 32.dp), // 상하 패딩 추가/조정
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.Center // 중앙 정렬 유지 (스크롤 시 시작점 확인 필요)
            ) {
                Text(
                    text = currentGifticon.brandName,
                    style = MaterialTheme.typography.title3,
                    textAlign = TextAlign.Center,
                    modifier = Modifier.padding(top = 8.dp) // 브랜드명 상단 마진 추가
                )
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = currentGifticon.gifticonName,
                    style = MaterialTheme.typography.body1,
                    textAlign = TextAlign.Center
                )
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = "유효기간: ${formatExpiryDate(currentGifticon.gifticonExpiryDate)}",
                    style = MaterialTheme.typography.caption1,
                    textAlign = TextAlign.Center
                )

                // 금액권 타입이고 잔액 정보가 있을 경우 표시
                if (currentGifticon.gifticonType == "AMOUNT") {
                    currentGifticon.gifticonOriginalAmount?.let {
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = "원래 금액: %,d원".format(it),
                            style = MaterialTheme.typography.caption1,
                            textAlign = TextAlign.Center
                        )
                    }
                    currentGifticon.gifticonRemainingAmount?.let {
                        Spacer(modifier = Modifier.height(4.dp)) // 유효기간과 잔액 사이 간격
                        Text(
                            text = "잔액: %,d원".format(it),
                            style = MaterialTheme.typography.body2, // caption1에서 body2로 변경하여 폰트 크기 증가
                            textAlign = TextAlign.Center,
                            color = Color.Gray // 약간 흐린 색으로 표시 (선택 사항)
                        )
                    }
                    Spacer(modifier = Modifier.height(8.dp)) // 잔액과 바코드 버튼 사이 간격
                } else {
                    // 금액권이 아니거나 잔액 정보가 없으면 기존 간격 유지
                    Spacer(modifier = Modifier.height(8.dp)) // Reduced from 16.dp
                }

                // 바코드 보기 버튼 (Chip)
                Chip(
                    onClick = {
                        // currentGifticon이 null이 될 수 없으므로 안전 호출 제거 가능 (위에서 이미 체크)
                        onShowBarcodeClick(currentGifticon.gifticonId)
                    },
                    label = {
                        Text(
                            text = "바코드 보기",
                            modifier = Modifier.fillMaxWidth(),
                            textAlign = TextAlign.Center
                        )
                    },
                    colors = ChipDefaults.chipColors(
                        backgroundColor = Color(0xFFAECBFA), // 메인 메뉴와 동일한 색상
                        contentColor = Color.Black
                    ),
                    modifier = Modifier.fillMaxWidth(0.8f)
                )
                Spacer(modifier = Modifier.height(8.dp)) // Spacing between barcode and new buttons

                // Row for Share and Use buttons
                Row(
                    modifier = Modifier.fillMaxWidth(0.8f),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    // 금액형이 아니고 shareBoxName이 null일 때만 나눔(뿌리기) 버튼 노출
                    if (currentGifticon.gifticonType != "AMOUNT" && currentGifticon.shareBoxName == null) {
                        Chip(
                            onClick = { onShareClick(currentGifticon.gifticonId) },
                            modifier = Modifier.weight(1f),
                            label = { Text("뿌리기", textAlign = TextAlign.Center, modifier = Modifier.fillMaxWidth()) },
                            colors = ChipDefaults.chipColors(
                                backgroundColor = Color(0xFFAECBFA),
                                contentColor = Color.Black
                            )
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                    }
                    // 사용 버튼은 항상 노출
                    Chip(
                        onClick = { onUseClick(currentGifticon.gifticonId) },
                        modifier = Modifier.weight(1f),
                        label = { Text("사용", textAlign = TextAlign.Center, modifier = Modifier.fillMaxWidth()) },
                        colors = ChipDefaults.chipColors(
                            backgroundColor = Color(0xFFAECBFA),
                            contentColor = Color.Black
                        )
                    )
                }
            }
        }
    }
} 