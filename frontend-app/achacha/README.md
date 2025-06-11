## 프로젝트 구조

```
src/
├── api/                 # API 관련 설정 및 클라이언트
│   ├── apiClient.js     # axios 기반 API 클라이언트 및 인터셉터
│   ├── config.js        # API 설정 (엔드포인트, 타임아웃 등)
│   └── authErrors.js    # 인증 관련 에러 코드 및 메시지
├── assets/              # 이미지, 폰트 등 정적 파일
│   ├── images/          # 이미지 리소스 (워치 이미지, 아이콘 등)
│   └── fonts/           # 폰트 파일
├── components/          # 재사용 가능한 컴포넌트
│   ├── common/          # 공통 컴포넌트 (Modal, Header 등)
│   └── ui/              # UI 컴포넌트 (Button, Slider, Switch, Text 등)
├── context/             # React Context API 관련 파일
├── hooks/               # 커스텀 훅
│   ├── useAuth.js       # 인증 관련 커스텀 훅 (React Query 활용)
│   ├── useLocationTracking.js  # 위치 추적 관련 훅
│   ├── usePermissions.js       # 권한 관리 관련 훅
│   ├── useTheme.js             # 테마 관련 훅
│   └── useGuideSteps.js        # 가이드 스텝 관련 훅
├── navigation/          # 네비게이션 관련 파일
│   ├── AppNavigator.js       # 메인 내비게이션 설정
│   └── AuthNavigator.js      # 인증 관련 내비게이션
├── screens/             # 화면 컴포넌트
│   ├── HomeScreen.js         # 홈 화면
│   ├── SettingScreen.js      # 설정 화면
│   ├── GiftScreen.js         # 기프티콘 화면
│   └── AuthScreen.js         # 인증 화면
├── services/            # API 서비스 래퍼 함수
│   └── authService.js         # 인증 관련 API 함수
├── store/               # 상태 관리 (Zustand)
│   └── authStore.js           # 인증 상태 관리 스토어
├── theme/               # 앱 테마 설정
│   └── index.js              # 테마 설정 (색상, 폰트 등)
└── utils/               # 유틸리티 함수
    ├── helpers.js            # 헬퍼 함수
    ├── formatters.js         # 포맷팅 유틸
    └── validators.js         # 유효성 검증 유틸
```

