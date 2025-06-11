plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
    alias(libs.plugins.kotlin.compose)
    alias(libs.plugins.kotlin.serialization)
}

android {
    namespace = "com.koup28.achacha_app"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.koup28.achacha_app"
        minSdk = 30
        targetSdk = 35
        versionCode = 1
        versionName = "1.0"

    }

    buildTypes {
        release {
            isMinifyEnabled = false
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_11
        targetCompatibility = JavaVersion.VERSION_11
    }
    kotlinOptions {
        jvmTarget = "11"
    }
    buildFeatures {
        compose = true
    }
}

dependencies {

    // implementation(libs.play.services.wearable)
    implementation("com.google.android.gms:play-services-wearable:18.2.0") // 최신 버전 중 하나로 명시
    implementation("com.google.android.gms:play-services-nearby:19.1.0") // Nearby 추가

    // Security (for EncryptedSharedPreferences)
    implementation("androidx.security:security-crypto:1.1.0-alpha06") // 최신 안정 버전 확인 필요

    implementation(platform(libs.compose.bom))
    implementation(libs.ui)
    implementation(libs.ui.graphics)
    implementation(libs.ui.tooling.preview)
    implementation(libs.compose.material)
    implementation(libs.compose.foundation)

    // Add Wear Compose Material Dependency
    implementation(libs.wear.compose.material)

    // Add Material Icons Core (기본 아이콘)
    // implementation(libs.material.icons.core) // 별칭 대신 직접 좌표 사용
    implementation("androidx.compose.material:material-icons-core") // Compose BOM이 버전 관리
    // Add Material Icons Extended (확장 아이콘 - Backspace 등 포함)
    implementation("androidx.compose.material:material-icons-extended-android:1.6.7") // 확장 아이콘 추가

    // Add Wear Compose Foundation Dependency (ScalingLazyColumn 포함)
    implementation("androidx.wear.compose:compose-foundation:1.3.1")

    implementation(libs.wear.tooling.preview)
    implementation(libs.activity.compose)
    implementation(libs.core.splashscreen)
    androidTestImplementation(platform(libs.compose.bom))
    androidTestImplementation(libs.ui.test.junit4)
    debugImplementation(libs.ui.tooling)
    debugImplementation(libs.ui.test.manifest)

    // DataStore Preferences (별칭 대신 직접 명시)
    implementation("androidx.datastore:datastore-preferences:1.1.1")

    // Kotlinx Serialization JSON (runtime)
    implementation(libs.kotlinx.serialization.json)

    // Accompanist Pager
    implementation(libs.accompanist.pager)
    implementation(libs.accompanist.pager.indicators)

    // Retrofit for API communication
    implementation("com.squareup.retrofit2:retrofit:2.9.0")
    // implementation("com.squareup.retrofit2:converter-kotlinx-serialization:1.0.0") // 문제 발생 가능성, 주석 처리
    implementation("com.jakewharton.retrofit:retrofit2-kotlinx-serialization-converter:1.0.0") // 이 컨버터 사용
    implementation("com.squareup.okhttp3:logging-interceptor:4.11.0") // For logging API requests/responses

    // Coil for image loading
    implementation("io.coil-kt:coil-compose:2.5.0")

    // implementation(libs.play.services.wearable) // 이미 위에서 명시적으로 선언되어 중복 제거
    implementation("androidx.fragment:fragment-ktx:1.6.2")

    implementation("com.squareup.retrofit2:converter-scalars:2.9.0")
}