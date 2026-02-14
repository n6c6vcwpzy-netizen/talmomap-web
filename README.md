# 탈모맵 (Hair Loss Map) - 웹 애플리케이션

탈모 치료제와 약국을 찾아주는 웹 기반 지도 애플리케이션입니다.

**버전**: 1.0.2

## 📁 프로젝트 구조

```
탈모맵-웹버전/
├── README.md                    # 이 파일 (프로젝트 설명서)
├── index.html                   # 메인 HTML 파일 (DOM 구조만 포함)
│
├── css/                         # 모든 스타일 파일들
│   ├── main.css                 # 기본 스타일: 폰트, 색상, 애니메이션, 글로벌 요소
│   ├── layout.css               # 페이지 레이아웃: 사이드바, 지도, 검색바, 사이드 패널의 구조
│   ├── components.css           # UI 컴포넌트: 약국 카드, 팝업, 약물 그리드, 버튼, 표 등
│   └── responsive.css           # 반응형 스타일: 모바일/태블릿/데스크탑 화면 크기별 조정
│
└── js/                          # 모든 JavaScript 로직 파일들
    ├── config.js                # 설정: API 키, 상수값, 디버그 모드 등
    │
    ├── data/                    # 데이터 파일들
    │   ├── pharmacy_data.js      # 데이터: 약국 정보 배열 및 검증 함수
    │   └── drug_data.js          # 데이터: 탈모 치료제 정보 배열 및 필터 함수
    │
    ├── utils/                   # 유틸리티 (여러 모듈에서 공통 사용)
    │   ├── storage.js            # 저장소: localStorage CRUD 작업, 활동/구독/댓글 관리
    │   ├── helpers.js            # 헬퍼: 포맷팅, 검증, 디바운스/쓰로틀 유틸리티 함수들
    │   └── api.js                # API: 카카오 로컬 검색, 지오코딩, 에러 핸들링
    │
    ├── ui/                      # UI 컴포넌트들 (사용자 인터페이스)
    │   ├── toast.js              # 알림: 성공/실패/경고 메시지 표시 및 자동 사라지기
    │   └── panel.js              # 패널: 사이드 패널 열기/닫기, 섹션 전환, 지도 팬 효과
    │
    ├── features/                # 기능 모듈들 (각 기능별 비즈니스 로직)
    │   ├── pharmacy.js           # 약국: 목록 렌더링, 상세 표시, 검색, 댓글 관리
    │   ├── consent.js            # 동의: 위치정보 수집·이용 동의 모달, 로컬스토리지 관리
    │   ├── activity.js           # 활동: 활동 기록 CRUD, 시간 ago 포맷팅, 삭제 기능
    │   ├── subscription.js       # 구독: 구독 상태 관리, UI 업데이트, 결제 시뮬레이션
    │   │
    │   └── location/             # 위치 기능 (세부 모듈로 분리)
    │       ├── userLocation.js    # 사용자 위치: 현재 위치 조회, 사용자 마커 표시
    │       ├── pharmacyMarker.js  # 약국 마커: SVG 마커 생성, 표시, 제거
    │       ├── pharmacySearch.js  # 약국 검색: API 연동, 목록 업데이트
    │       ├── pharmacyPopup.js   # 약국 팝업: 상세 정보, 외부 지도 링크
    │       ├── panelInteraction.js# 패널 상호작용: 드래그, 토글, 접근성
    │       ├── mapAnimation.js     # 지도 애니메이션: 줌, 중심 이동
    │       └── location.js         # 위치 매니저 (메인): 초기화, 이벤트 연결
    │
    ├── map.js                    # 지도: 카카오 맵 초기화, 마커 렌더링, 오버레이 관리
    └── main.js                   # 진입점: 앱 초기화, 모듈 검증, 글로벌 이벤트 리스너 설정
```

## 📋 CSS 파일 상세 설명

### main.css (기본 스타일)
- 전역 폰트 패밀리 설정 (Noto Sans KR)
- 색상 정의 (주색상 #4a90e2, 성공 #22c55e 등)
- 토스트 알림 애니메이션
- 뱃지, 배너 등 글로벌 요소 스타일

### layout.css (페이지 레이아웃)
- `.app-container`: 전체 앱 컨테이너 (Flexbox 레이아웃)
- `.sidebar`: 왼쪽 메뉴 사이드바 (너비 96px)
- `.main-content`: 메인 콘텐츠 영역
- `.side-panel`: 오른쪽 사이드 패널 (슬라이드 애니메이션)
- `.search-bar-container`: 상단 검색바 위치 설정

### components.css (UI 컴포넌트)
- `.pharmacy-item`: 약국 목록 카드
- `.drug-card`: 약물 그리드 카드
- `.popup-table`: 약국 재고 표
- `.button` 스타일: `.naver-btn`, `.kakao-btn` 등
- `.activity-item`: 활동 기록 아이템
- `.subscribe-card`: 구독 카드

### responsive.css (반응형 스타일)
- 768px (태블릿 이상)
- 600px (태블릿)
- 480px (작은 화면)
- 1024px (데스크탑)
- 1440px (큰 화면)

모바일에서 사이드바가 하단 탭바로 변환됨

---

## 🔧 JavaScript 파일 상세 설명

### 1️⃣ config.js (설정)
```javascript
const CONFIG = {
  KAKAO_API_KEY: '...',       // 카카오 로컬 API 키
  MAP_CENTER: { lat, lng },   // 지도 중심 좌표
  SEARCH_RADIUS: 1000,        // 주변 약국 검색 반경(m)
  SUBSCRIPTION_PRICE: 990,    // 월 구독료(원)
  DEBUG_MODE: true            // 디버그 로그 출력 여부
}
```

### 2️⃣ pharmacy_data.js (약국 데이터)
```javascript
const PHARMACIES = [
  {
    id: 1,
    name: '약국명',
    lat: 37.5665,
    lng: 126.9780,
    address: '주소',
    phone: '전화번호',
    hours: '09:00 - 20:00',
    stock: [{ name, stock, price }, ...]
  },
  // ...
]
```

### 3️⃣ drug_data.js (약물 데이터)
```javascript
const DRUGS = [
  {
    id: 'propecia',
    name: '프로페시아 (Finasteride)',
    type: '경구',
    image: 'URL',
    benefits: '효능 설명',
    efficacy: '효과',
    dosing: '복용량',
    notes: '주의사항'
  },
  // ...
]
```

### 4️⃣ storage.js (로컬스토리지 관리)
```javascript
StorageManager = {
  addActivity(item),          // 활동 기록 추가
  getActivities(),            // 활동 기록 조회
  clearActivities(),          // 활동 기록 삭제
  
  setSubscribed(bool),        // 구독 상태 저장
  isSubscribed(),             // 구독 상태 조회
  
  addComment(key, text),      // 댓글 추가
  getComments(key),           // 댓글 조회
  clearComments(key)          // 댓글 삭제
}
```

### 5️⃣ helpers.js (유틸리티 함수)
```javascript
Helpers = {
  formatHoursWithBadge(hours),    // "09:00 - 20:00" → "영업중" 뱃지
  getTimeAgo(timestamp),          // 타임스탬프 → "2시간 전"
  formatDistance(meters),         // 거리 포맷팅 (m, km)
  formatCurrency(number),         // 통화 포맷팅 (원)
  formatDate(date),               // 날짜 포맷팅
  debounce(func, wait),           // 함수 디바운싱
  throttle(func, wait)            // 함수 쓰로틀링
}
```

### 6️⃣ api.js (카카오 API 연동)
```javascript
API = {
  searchNearbyPharmacies(lat, lng, radius),  // 주변 약국 검색
  searchPlaces(query, lat, lng),             // 장소 검색
  getPlaceDetails(id),                       // 장소 상세 정보
  geocode(address),                          // 주소 → 좌표 변환
  fetchWithRetry(url, options, retries)      // 재시도 포함 fetch
}
```

### 7️⃣ toast.js (알림 시스템)
```javascript
Toast = {
  show(message, timeout),         // 일반 알림
  success(message),               // 성공 알림 (초록색)
  error(message),                 // 오류 알림 (빨간색)
  warning(message)                // 경고 알림 (주황색)
}
```

### 8️⃣ panel.js (사이드 패널 관리)
```javascript
Panel = {
  open(sectionId),                // 패널 열기 + 지도 팬 효과
  close(),                        // 패널 닫기 + 지도 복원
  switchSection(sectionId),       // 섹션 전환 (목록→상세)
  toggle(sectionId)               // 토글
}
```

### 9️⃣ map.js (지도 초기화)
```javascript
// 카카오 맵 SDK 로드
// 약국 마커 렌더링
// 오버레이 생성 (재고 수량 표시)
// initPharmacyMarkers() 호출
```

### 🔟 pharmacy.js (약국 관리)
```javascript
PharmacyManager = {
  renderList(container),          // 약국 목록 렌더링
  showDetail(pharmacy),           // 약국 상세 정보 표시
  search(query),                  // 약국 검색
  getNearby(lat, lng, radius),    // 주변 약국 찾기
  addComment(pharmacyId, text),   // 댓글 추가
  getComments(pharmacyId)         // 댓글 조회
}
```

### 1️⃣1️⃣ drug.js (약물 관리)
```javascript
DrugManager = {
  renderGrid(container),          // 약물 그리드 렌더링
  filterByType(type),             // 유형별 필터
  search(query),                  // 약물 검색
  sort(field),                    // 정렬
  showDetail(drug),               // 약물 상세 정보 표시
  showImageModal(imageUrl)        // 이미지 모달
}
```

### 1️⃣2️⃣ location.js (위치 서비스 - 메인 매니저)
```javascript
LocationManager = {
  init(),                         // 초기화: 버튼 생성, 이벤트 연결, 패널/애니메이션 설정
  setupButtons(),                 // 내 위치 찾기 버튼 생성 및 스타일 설정
  attachEventListeners()          // 버튼 클릭 이벤트 연결
}
```

### 1️⃣2️⃣-1️⃣ 위치 기능 세부 모듈

#### userLocation.js (사용자 위치)
```javascript
UserLocation = {
  getCurrentLocation(),           // 브라우저 Geolocation API로 위치 조회
  showUserMarker(lat, lng)        // 카카오 맵에 사용자 위치 마커 표시
}
```

#### pharmacyMarker.js (약국 마커)
```javascript
PharmacyMarker = {
  displayPharmacyMarkers(pharmacies),  // SVG 기반 약국 마커 생성 및 표시
  clearKakaoMarkers()                   // 모든 약국 마커 제거
}
```

#### pharmacySearch.js (약국 검색)
```javascript
PharmacySearch = {
  async searchNearbyPharmacies(lat, lng, radius),  // 카카오 API로 주변 약국 검색
  updatePharmacyList(pharmacies)                    // 약국 목록 패널 업데이트
}
```

#### pharmacyPopup.js (약국 팝업)
```javascript
PharmacyPopup = {
  showPharmacyPopup(pharmacy)    // 약국 상세 정보 팝업 표시 및 네이버/카카오 지도 링크 설정
}
```

#### panelInteraction.js (패널 상호작용)
```javascript
PanelInteraction = {
  setupPanelDrag(),              // 모바일 터치 드래그로 패널 닫기
  setupPanelToggle(),            // 약국 탭 클릭으로 패널 토글
  updatePanelAccessibility(panel, isOpen)  // inert 속성으로 접근성 관리
}
```

#### mapAnimation.js (지도 애니메이션)
```javascript
MapAnimation = {
  setupMapZoomAnimation()        // 줌/중심 이동 이벤트 리스너 설정
}
```

### 1️⃣3️⃣ activity.js (활동 기록)
```javascript
ActivityManager = {
  add(type, text, coords),        // 활동 기록 추가
  getAll(),                       // 모든 활동 조회
  render(container),              // 활동 목록 렌더링
  delete(id),                     // 활동 삭제
  clear()                         // 모든 활동 삭제
}
```

### 1️⃣4️⃣ subscription.js (구독 관리)
```javascript
SubscriptionManager = {
  isSubscribed(),                 // 구독 상태 확인
  subscribe(),                    // 구독 신청
  cancel(),                       // 구독 취소
  updateUI(),                     // UI 업데이트
  showTrialBanner()               // 트라이얼 배너 표시
}
```

### 1️⃣5️⃣ main.js (앱 진입점)
```javascript
const App = {
  init() {
    // 1. 모듈 검증
    // 2. 글로벌 이벤트 리스너 설정
    // 3. 페이지 네비게이션 연결
    // 4. DOM 준비 완료 이벤트 대기
  }
}
```

---

## ⚡ 로드 순서 (매우 중요!)

JavaScript 파일이 로드되는 순서는 매우 중요합니다:

```
1. config.js                    ← 설정
2. pharmacy_data.js             ← 약국 데이터
3. drug_data.js                 ← 약물 데이터
4. storage.js                   ← 저장소
5. helpers.js                   ← 헬퍼
6. api.js                       ← API
7. toast.js                     ← 토스트
8. panel.js                     ← 패널
9. map.js                       ← 지도 초기화
10. pharmacy.js                 ← 약국
11. drug.js                     ← 약물
12. activity.js                 ← 활동
13. subscription.js             ← 구독
14. 위치 기능 (분리 모듈 로드)
    - userLocation.js           ← 사용자 위치
    - pharmacyMarker.js         ← 약국 마커
    - pharmacySearch.js         ← 약국 검색
    - pharmacyPopup.js          ← 약국 팝업
    - panelInteraction.js       ← 패널 상호작용
    - mapAnimation.js           ← 지도 애니메이션
    - location.js               ← 위치 매니저 (메인)
15. main.js                     ← 메인 진입점
```

---

## 🚀 사용 방법

1. **파일 구조 유지**: CSS는 `css/` 폴더에, JS는 `js/` 폴더 아래 계층적으로 배치
2. **로드 순서 준수**: `index.html`의 `<script>` 태그 순서 변경 금지
3. **한국어 주석**: 모든 함수와 변수에 한국어 설명 작성
4. **모듈 독립성**: 각 모듈은 자신이 필요한 것만 사용

---

## 🔐 API 키 보안

- `js/config.js`에 카카오 API 키 저장
- 실제 프로덕션에서는 환경 변수 사용 권장
- `.gitignore`에 `config.js` 추가 권장

---

## 📱 반응형 디자인

- **1440px 이상**: 풀 데스크탑 UI
- **1024px ~ 1439px**: 데스크탑 (좌측 사이드바 96px)
- **768px ~ 1023px**: 태블릿
- **480px ~ 767px**: 스마트폰 (하단 탭바로 변환)
- **480px 미만**: 극소형 화면

---

## 🔧 개발 및 유지보수

### 새 기능 추가
1. `js/features/` 폴더에 새 모듈 생성
2. 필요한 헬퍼 및 API 함수를 `utils/`에서 import
3. `main.js`에 초기화 코드 추가

### 버그 수정
1. 콘솔에서 에러 메시지 확인 (CONFIG.DEBUG_MODE = true)
2. 해당 모듈 파일 찾기
3. 함수 주석 참고하여 수정

### 스타일 수정
1. 해당 CSS 파일 찾기 (구조 참고)
2. 수정 후 `responsive.css` 영향 확인
3. 모바일/태블릿/데스크탑 모두 테스트

---

## 📞 연락처 및 지원

문제가 발생하거나 질문이 있으면:
1. 콘솔(F12)에서 에러 확인
2. 로드 순서 재확인
3. CONFIG.DEBUG_MODE를 true로 설정하여 로그 확인

---

**마지막 업데이트**: 2026년 2월 14일 (v1.0.2)

### 📝 변경 사항 (v1.0.2)
- ✅ **위치정보 수집·이용 동의 모달** 추가
  - 최초 1회 동의 요청 (localStorage 저장)
  - 동의 전 내 위치 기능 비활성화
  - "거부" 선택 시 위치 기반 기능 제한
  - 법적 안전성 강화 (「위치정보의 보호 및 이용 등에 관한 법률」 준수)
- ✅ **약국 팝업 UI/UX 개선**
  - 모바일에서 팝업 높이를 45vh로 제한
  - 헤더에서 드래그로 팝업 닫기 가능 (120px 이상 드래그)
  - 댓글 영역 공백 축소 (한 줄 정도만)
- ✅ **약국 탭과 팝업 높이 통일**
  - 모바일 환경에서 약국 탭도 45vh로 통일
  - 시각적 일관성 강화
- ✅ **지도에 마커 강조 기능 추가**
  - 약국 마커 클릭 시 십자가를 녹색(#4CAF50) → 빨간색(#ef4444)으로 변경
  - 약국 탭 리스트 클릭 시도 마커 빨간색으로 강조
  - 팝업 닫을 때 마커 강조 제거 (다시 녹색으로)
  - PharmacyMarker에 `createMarkerSVG()`, `highlightMarker()`, `resetMarkerHighlight()` 메서드 추가
- ✅ **레이어 순서 정리**
  - 약국 탭과 상세 팝업이 동시에 보이도록 처리
  - 팝업의 z-index 우선순위 유지
- ✅ **Consent Manager 모듈 추가** (js/features/consent.js)
  - `init()`: 모달 초기화 및 자동 표시
  - `requestConsent(callback)`: 동의 요청 및 콜백 실행
  - `hasConsent()` / `isDenied()`: 상태 확인
  - `updateLocationButtons()`: 위치 버튼 활성/비활성화

### 📝 변경 사항 (v1.0.1)
- ✅ location.js를 기능별로 6개 모듈로 분리
  - userLocation.js: 사용자 위치 조회
  - pharmacyMarker.js: SVG 약국 마커
  - pharmacySearch.js: 약국 검색 및 목록 업데이트
  - pharmacyPopup.js: 약국 팝업 및 외부 지도 링크
  - panelInteraction.js: 패널 드래그/토글 및 접근성
  - mapAnimation.js: 지도 애니메이션
- ✅ 접근성 개선: aria-hidden 대신 inert 속성 사용
- ✅ LocationManager.init() main.js에 통합
- ✅ 파비콘 추가 (약 이모지 SVG)
- ✅ 위치 권한 거부 시 상세 오류 메시지
