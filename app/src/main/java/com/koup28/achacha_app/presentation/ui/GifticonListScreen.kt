package com.koup28.achacha_app.presentation.ui

import androidx.activity.compose.BackHandler
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.wear.compose.foundation.lazy.ScalingLazyColumn
import androidx.wear.compose.foundation.lazy.rememberScalingLazyListState
import androidx.wear.compose.material.* // Material 포함 SwipeToDismissBox
import kotlinx.serialization.Serializable
import java.time.LocalDate
import java.time.format.DateTimeFormatter
import java.time.temporal.ChronoUnit

// API 응답 구조에 맞는 데이터 클래스 (필드 상세 반영)
@Serializable
data class ApiGifticon(
    val gifticonId: Int,
    val gifticonName: String,
    val gifticonType: String? = null, // 사용 안 할 수도 있지만 정의
    val gifticonExpiryDate: String,
    val gifticonRemainingAmount: Int? = null, // 잔액 필드 추가 (Nullable Int)
    val brandId: Int? = null,
    val brandName: String,
    val scope: String? = null,
    val userId: Int? = null,
    val userName: String? = null,
    val shareBoxId: Int? = null,
    val shareBoxName: String? = null,
    val gifticonOriginalAmount: Int? = null
)

@Serializable
data class GifticonResponse(
    val gifticons: List<ApiGifticon>
)

// D-day 계산 함수 (유지)
fun calculateDday(expiryDateStr: String): Long? {
    return try { // 함수 본문 및 return 추가
        val formatter = DateTimeFormatter.ISO_LOCAL_DATE // "YYYY-MM-DD"
        val expiryDate = LocalDate.parse(expiryDateStr, formatter)
        val today = LocalDate.now()
        ChronoUnit.DAYS.between(today, expiryDate)
    } catch (e: Exception) {
        null // 날짜 파싱 실패 시 null 반환
    }
}

// --- 임시 UI 상태 데이터 클래스 (ViewModel 구현 전 테스트용) ---
// 실제로는 ViewModel 파일에 정의
data class GifticonListUiState(
    val isLoading: Boolean = false,
    val gifticons: List<ApiGifticon> = emptyList(),
    val error: String? = null
)
// ----------------------------------------------------------

@Composable
fun GifticonListScreen(
    gifticons: List<ApiGifticon>,
    isLoading: Boolean,
    error: String?,
    onGifticonClick: (gifticonId: Int) -> Unit,
    onBackPress: () -> Unit,
    hasNextPage: Boolean,
    nextPage: Int?,
    isLoadingMore: Boolean,
    onLoadMore: (page: Int) -> Unit
) {
    val listState = rememberScalingLazyListState()

    // 무한 스크롤: 마지막 아이템에 도달하면 onLoadMore 호출
    LaunchedEffect(listState.centerItemIndex, gifticons.size, hasNextPage, isLoadingMore) {
        if (
            hasNextPage &&
            !isLoadingMore &&
            listState.layoutInfo.visibleItemsInfo.lastOrNull()?.index == gifticons.lastIndex &&
            nextPage != null
        ) {
            onLoadMore(nextPage)
        }
    }

    // 시스템 뒤로가기 버튼 처리
    BackHandler(enabled = true) {
        onBackPress()
    }

    Scaffold(
        timeText = { TimeText(modifier = Modifier.padding(top = 6.dp)) },
        vignette = { Vignette(vignettePosition = VignettePosition.TopAndBottom) },
        positionIndicator = { PositionIndicator(scalingLazyListState = listState) }
    ) {
         when {
             isLoading -> {
                Box(
                    modifier = Modifier.fillMaxSize(),
                    contentAlignment = Alignment.Center
                ) {
                    CircularProgressIndicator()
                }
             }
             error != null -> {
                Box(
                    modifier = Modifier.fillMaxSize().padding(16.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = "오류: $error\\n아래로 스와이프하여 재시도하세요.",
                        textAlign = TextAlign.Center,
                        style = MaterialTheme.typography.body1
                    )
                }
             }
             else -> {
                ScalingLazyColumn(
                    modifier = Modifier.fillMaxSize().padding(horizontal = 8.dp),
                    state = listState,
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.spacedBy(8.dp, Alignment.Top)
                ) {
                    item { 
                         Text(
                             text = "기프티콘 관리",
                             style = MaterialTheme.typography.title2,
                             textAlign = TextAlign.Center,
                             modifier = Modifier.padding(bottom = 8.dp, top = 24.dp)
                         )
                     }

                    if (gifticons.isEmpty()) {
                        item { 
                            Box(
                                modifier = Modifier.fillMaxSize().padding(top = 24.dp),
                                contentAlignment = Alignment.Center
                            ) {
                                Text(
                                    text = "아직 등록된 기프티콘이 없어요!",
                                    style = MaterialTheme.typography.body1,
                                    textAlign = TextAlign.Center
                                )
                            }
                        }
                    } else {
                        items(gifticons.size) { index ->
                            val gifticon = gifticons[index]
                            val dDay = calculateDday(gifticon.gifticonExpiryDate)
                            Chip(
                                onClick = { onGifticonClick(gifticon.gifticonId) },
                                label = { 
                                    Row(
                                        modifier = Modifier.fillMaxWidth(),
                                        verticalAlignment = Alignment.CenterVertically
                                    ) {
                                        Column(
                                            modifier = Modifier.weight(1f)
                                        ) {
                                            Text(
                                                text = gifticon.brandName,
                                                style = MaterialTheme.typography.caption2,
                                                fontSize = 11.sp,
                                                maxLines = 1,
                                                overflow = TextOverflow.Ellipsis
                                            )
                                            Text(
                                                text = gifticon.gifticonName,
                                                style = MaterialTheme.typography.body2,
                                                maxLines = 1,
                                                overflow = TextOverflow.Ellipsis
                                            )
                                        }
                                        Text(
                                            text = when { 
                                                dDay == null -> "-" 
                                                dDay < 0 -> "만료" 
                                                else -> "D-$dDay"
                                            },
                                            style = MaterialTheme.typography.body1,
                                            textAlign = TextAlign.End,
                                            color = when {
                                                dDay == null -> Color.Gray
                                                dDay < 0 -> Color.DarkGray 
                                                dDay < 7 -> Color.Red
                                                else -> Color.Unspecified
                                            }
                                        )
                                    }
                                },
                                colors = ChipDefaults.secondaryChipColors(),
                                modifier = Modifier.fillMaxWidth(),
                                contentPadding = PaddingValues(horizontal = 16.dp, vertical = 12.dp)
                            )
                        }
                        // 로딩 인디케이터 (추가 로딩 중일 때)
                        if (isLoadingMore) {
                            item {
                                Box(
                                    modifier = Modifier.fillMaxWidth(),
                                    contentAlignment = Alignment.Center
                                ) {
                                    CircularProgressIndicator(modifier = Modifier.size(24.dp))
                                }
                            }
                        }
                    }
                    item { Spacer(modifier = Modifier.height(24.dp)) }
                }
            }
        }
    }
} 