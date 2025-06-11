package com.koup28.achacha_app.presentation.ui

import androidx.activity.compose.BackHandler
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.SolidColor
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.wear.compose.material.*
import java.text.NumberFormat
import java.util.Currency

@Composable
fun EnterAmountScreen(
    gifticonId: Int?,
    remainingAmount: Int?,
    onConfirmClick: (amount: Int) -> Unit,
    onCancelClick: () -> Unit
) {
    val currentRemaining = remainingAmount ?: 0
    var amountToUse by remember { mutableIntStateOf(0) }

    val currencyFormat = remember { NumberFormat.getCurrencyInstance().apply { 
        maximumFractionDigits = 0
        currency = Currency.getInstance("KRW")
    } }

    val scrollState = rememberScrollState()

    BackHandler(enabled = true) {
        onCancelClick()
    }

    Scaffold(
        timeText = { TimeText(modifier = Modifier.padding(top = 6.dp)) },
        vignette = { Vignette(vignettePosition = VignettePosition.TopAndBottom) },
        positionIndicator = { PositionIndicator(scrollState = scrollState) }
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .verticalScroll(scrollState)
                .padding(start = 12.dp, end = 12.dp, top = 16.dp, bottom = 24.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            Column(
                horizontalAlignment = Alignment.CenterHorizontally,
                modifier = Modifier.padding(top = 8.dp)
            ) {
                Text(
                    text = "사용금액",
                    style = MaterialTheme.typography.title3
                )
                BasicTextField(
                    value = amountToUse.toString(),
                    onValueChange = { newValue ->
                        val filteredValue = newValue.filter { it.isDigit() }
                        if (filteredValue.isEmpty()) {
                            amountToUse = 0
                        } else {
                            val longValue = filteredValue.toLongOrNull() ?: 0L
                            amountToUse = longValue.coerceAtMost(currentRemaining.toLong()).toInt()
                        }
                    },
                    modifier = Modifier.width(IntrinsicSize.Min),
                    textStyle = TextStyle(
                        fontFamily = MaterialTheme.typography.display1.fontFamily,
                        fontWeight = FontWeight.Bold,
                        fontSize = 36.sp,
                        textAlign = TextAlign.Center,
                        color = MaterialTheme.colors.onSurface
                    ),
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                    singleLine = true,
                    cursorBrush = SolidColor(MaterialTheme.colors.primary)
                )
                Text(
                    text = "잔액: ${currencyFormat.format(currentRemaining)}", 
                    style = MaterialTheme.typography.caption1,
                    color = Color.Gray
                )
            }

            Spacer(modifier = Modifier.height(12.dp))

            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                Row(
                    modifier = Modifier.fillMaxWidth(0.9f),
                    horizontalArrangement = Arrangement.SpaceEvenly
                ) {
                    listOf(1000, 5000, 10000).forEach { value ->
                        val buttonText = when(value) {
                            1000 -> "1천"
                            5000 -> "5천"
                            10000 -> "1만"
                            else -> ""
                        }
                        val buttonColor = Color(0xFFAECBFA)
                        Chip(
                            onClick = { 
                                amountToUse = (amountToUse + value).coerceAtMost(currentRemaining)
                             },
                            label = { Text(buttonText, textAlign = TextAlign.Center, modifier = Modifier.fillMaxWidth()) },
                            modifier = Modifier.weight(1f).padding(horizontal = 2.dp),
                            colors = ChipDefaults.outlinedChipColors(
                                contentColor = buttonColor
                            ),
                            border = ChipDefaults.outlinedChipBorder(borderColor = buttonColor)
                        )
                    }
                }
                Spacer(modifier = Modifier.height(6.dp))
                Row(
                    modifier = Modifier.fillMaxWidth(0.9f),
                    horizontalArrangement = Arrangement.SpaceEvenly
                ){
                    Chip(
                        onClick = { amountToUse = 0 },
                        label = { Text("초기화", textAlign = TextAlign.Center, modifier = Modifier.fillMaxWidth()) },
                        modifier = Modifier.weight(1f).padding(horizontal = 2.dp),
                        colors = ChipDefaults.chipColors(
                            backgroundColor = Color(0xFFAECBFA),
                            contentColor = Color.Black
                        )
                    )
                    Chip(
                        onClick = { amountToUse = currentRemaining },
                        label = { Text("전액", textAlign = TextAlign.Center, modifier = Modifier.fillMaxWidth()) },
                        modifier = Modifier.weight(1f).padding(horizontal = 2.dp),
                        colors = ChipDefaults.chipColors(
                            backgroundColor = Color(0xFFAECBFA),
                            contentColor = Color.Black
                        )
                    )
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            Chip(
                onClick = { 
                    if (amountToUse > 0) {
                        onConfirmClick(amountToUse)
                    }
                 },
                label = { 
                    Text(
                        "사용 완료", 
                        textAlign = TextAlign.Center, 
                        modifier = Modifier.fillMaxWidth()
                    )
                },
                colors = ChipDefaults.chipColors(
                    backgroundColor = Color(0xFFAECBFA),
                    contentColor = Color.Black
                ),
                enabled = amountToUse > 0,
                modifier = Modifier.fillMaxWidth(0.7f)
            )
        }
    }
} 