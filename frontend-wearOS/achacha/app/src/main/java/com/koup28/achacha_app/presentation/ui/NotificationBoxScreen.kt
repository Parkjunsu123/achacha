package com.koup28.achacha_app.presentation.ui

import androidx.activity.compose.BackHandler
import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Notifications
import androidx.compose.material.icons.outlined.EventAvailable
import androidx.compose.material.icons.outlined.LocationOn
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.wear.compose.foundation.lazy.ScalingLazyColumn
import androidx.wear.compose.foundation.lazy.items
import androidx.wear.compose.foundation.lazy.rememberScalingLazyListState
import androidx.wear.compose.material.*
import androidx.compose.runtime.getValue
import androidx.compose.runtime.setValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.ui.platform.LocalContext
import com.koup28.achacha_app.data.ApiService
import com.koup28.achacha_app.data.UserDataStore
import kotlinx.coroutines.flow.firstOrNull
import kotlinx.coroutines.launch
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.koup28.achacha_app.data.NotificationDto
import com.koup28.achacha_app.data.NotificationApiResponse
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

// API 응답 형식에 맞춘 알림 데이터 클래스
data class NotificationData(
    val notificationId: Int,
    val notificationTitle: String,
    val notificationContent: String,
    val notificationType: String
)

// 임시로 알림 타입에 따른 아이콘 매핑 함수
@Composable
fun getIconForNotificationType(type: String): ImageVector {
    return when (type) {
        "EXPIRY_DATE" -> Icons.Outlined.EventAvailable // 예시 아이콘
        "LOCATION_BASED" -> Icons.Outlined.LocationOn // 예시 아이콘
        // 다른 타입에 대한 아이콘 추가
        else -> Icons.Filled.Notifications // 기본 아이콘
    }
}

@Composable
fun NotificationBoxScreen(
    onBackClick: () -> Unit,
    apiService: ApiService,
    userDataStore: UserDataStore
) {
    val listState = rememberScalingLazyListState()
    val context = LocalContext.current
    var notifications by remember { mutableStateOf<List<NotificationDto>>(emptyList()) }
    var isLoading by remember { mutableStateOf(true) }
    var error by remember { mutableStateOf<String?>(null) }
    var nextPage by remember { mutableStateOf<Int?>(null) }
    var hasNextPage by remember { mutableStateOf(false) }
    var isLoadingMore by remember { mutableStateOf(false) }

    // 시스템 뒤로가기 버튼 처리
    BackHandler(enabled = true) {
        onBackClick()
    }

    // 알림 불러오기 (최초 1회)
    LaunchedEffect(Unit) {
        isLoading = true
        error = null
        try {
            val token = userDataStore.accessTokenFlow.firstOrNull()
            if (token.isNullOrEmpty()) {
                error = "인증 토큰이 없습니다."
                isLoading = false
                return@LaunchedEffect
            }
            val response = apiService.getNotifications(
                authorization = "Bearer $token",
                type = null, // 전체
                page = nextPage?.toString(),
                size = 6
            )
            if (response.isSuccessful) {
                val body = response.body()
                if (body != null) {
                    // 모든 알림을 필터링 없이 그대로 보여줌
                    notifications = body.notifications
                    hasNextPage = body.hasNextPage
                    nextPage = body.nextPage
                } else {
                    error = "알림 데이터를 불러올 수 없습니다."
                }
            } else {
                // 에러 바디 로그 추가
                val errorBody = response.errorBody()?.string()
                android.util.Log.e("NOTI_API", "알림 API 호출 실패: $errorBody")
                error = "알림 API 호출 실패: ${response.code()}"
            }
        } catch (e: Exception) {
            // 예외 발생 시 Raw 응답 로그 추가
            android.util.Log.e("NOTI_API", "알림 불러오기 예외: ${e.localizedMessage}", e)
            error = "알림 불러오기 오류: ${e.localizedMessage}"
        } finally {
            isLoading = false
        }
    }

    // 다음 페이지 호출 함수
    suspend fun loadNextPage() {
        if (!hasNextPage || isLoadingMore) return
        isLoadingMore = true
        try {
            val token = userDataStore.accessTokenFlow.firstOrNull()
            if (token.isNullOrEmpty()) return
            val response = apiService.getNotifications(
                authorization = "Bearer $token",
                type = null,
                page = nextPage?.toString(),
                size = 6
            )
            if (response.isSuccessful) {
                val body = response.body()
                if (body != null) {
                    notifications = notifications + body.notifications // append
                    hasNextPage = body.hasNextPage
                    nextPage = body.nextPage
                }
            }
        } finally {
            isLoadingMore = false
        }
    }

    // 스크롤 하단 감지하여 다음 페이지 자동 호출
    LaunchedEffect(listState.centerItemIndex, notifications.size) {
        if (
            hasNextPage &&
            !isLoadingMore &&
            listState.layoutInfo.visibleItemsInfo.lastOrNull()?.index == notifications.lastIndex
        ) {
            loadNextPage()
        }
    }

    Scaffold(
        timeText = { TimeText(modifier = Modifier.padding(top = 6.dp)) },
        vignette = { Vignette(vignettePosition = VignettePosition.TopAndBottom) },
        positionIndicator = { PositionIndicator(scalingLazyListState = listState) }
    ) {
        ScalingLazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(horizontal = 8.dp),
            state = listState,
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(8.dp, Alignment.Top)
        ) {
            item {
                Text(
                    text = "알림함",
                    style = MaterialTheme.typography.title2,
                    textAlign = TextAlign.Center,
                    modifier = Modifier.padding(top = 24.dp, bottom = 8.dp)
                )
            }
            when {
                isLoading -> {
                    item {
                        Box(modifier = Modifier.fillMaxWidth(), contentAlignment = Alignment.Center) {
                            CircularProgressIndicator()
                        }
                    }
                }
                error != null -> {
                    item {
                        Text(
                            text = error ?: "알 수 없는 오류",
                            color = MaterialTheme.colors.error,
                            textAlign = TextAlign.Center,
                            modifier = Modifier.padding(16.dp)
                        )
                    }
                }
                notifications.isEmpty() -> {
                    item {
                        Text(
                            text = "알림이 없습니다.",
                            textAlign = TextAlign.Center,
                            modifier = Modifier.padding(16.dp)
                        )
                    }
                }
                else -> {
                    items(notifications) { notification ->
                        Chip(
                            onClick = { /* TODO: 알림 클릭 시 동작 구현 */ },
                            label = {
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Column(
                                        modifier = Modifier.weight(1f)
                                    ) {
                                        Text(
                                            text = notification.notificationTitle,
                                            fontWeight = FontWeight.Bold,
                                            fontSize = 15.sp,
                                            maxLines = 1,
                                            overflow = TextOverflow.Ellipsis
                                        )
                                        Spacer(modifier = Modifier.height(2.dp))
                                        Text(
                                            text = notification.notificationContent,
                                            style = MaterialTheme.typography.body2,
                                            fontSize = 13.sp,
                                            color = Color.LightGray,
                                            maxLines = 2,
                                            overflow = TextOverflow.Ellipsis
                                        )
                                    }
                                    Spacer(modifier = Modifier.width(8.dp))
                                    Icon(
                                        imageVector = getIconForNotificationType(notification.notificationType),
                                        contentDescription = "알림 아이콘",
                                        modifier = Modifier.size(ChipDefaults.IconSize)
                                    )
                                }
                            },
                            colors = ChipDefaults.chipColors(
                                backgroundColor = Color(0xFF3E3E4A),
                                contentColor = Color.White
                            ),
                            modifier = Modifier.fillMaxWidth(),
                            contentPadding = PaddingValues(horizontal = 16.dp, vertical = 12.dp)
                        )
                    }
                }
            }
        }
    }
} 