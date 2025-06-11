package com.koup28.achacha_app.data

import kotlinx.serialization.Serializable

@Serializable
data class BarcodeInfo(
    val gifticonBarcodeNumber: String,
    val barcodePath: String? = null,
    @kotlinx.serialization.Transient
    val barcodeDrawableResId: Int? = null
) 