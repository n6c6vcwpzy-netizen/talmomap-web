/* ========================================
   설정 파일 (Configuration)
   
   API 키, 기본값, 상수들을 중앙에서 관리합니다.
   여러 파일에서 참조하므로 가장 먼저 로드되어야 합니다.
   ======================================== */

// 앱 설정 객체
const CONFIG = {
  // ===== 카카오 맵 API =====
  // 로컬 검색 API 키 (주변 약국 찾기 기능에 사용)
  // 프로덕션: 실제 카카오 개발자 센터에서 발급한 키 사용
  KAKAO_LOCAL_API_KEY: '4ba66d0c18b39a7dc17f0e1992d78b2b',
  
  // ===== 지도 기본 설정 =====
  // 초기 지도 중심 좌표 (서울 시청)
  MAP_CENTER: {
    lat: 37.5665,  // 위도
    lng: 126.9780  // 경도
  },
  
  // 주변 약국 검색 기본 반경 (미터)
  SEARCH_RADIUS: 1000,
  
  // ===== 구독 정보 =====
  // 월간 구독료
  SUBSCRIPTION_PRICE: '990원/월',
  
  // 무료 체험 기간 (표시용)
  TRIAL_TIME: '23시간 45분',
  
  // ===== 개발자 설정 =====
  // 콘솔 로그 표시 여부 (false = 배포 모드, true = 개발 모드)
  DEBUG_MODE: false
};

// 설정 검증 함수
function validateConfig() {
  if (!CONFIG.KAKAO_LOCAL_API_KEY) {
    console.warn('경고: 카카오 로컬 API 키가 설정되지 않았습니다.');
  }
  if (!CONFIG.MAP_CENTER || !CONFIG.MAP_CENTER.lat || !CONFIG.MAP_CENTER.lng) {
    console.error('오류: 지도 중심 좌표가 올바르게 설정되지 않았습니다.');
  }
}

// 페이지 로드 시 설정 검증
if (document.readyState !== 'loading') {
  validateConfig();
} else {
  document.addEventListener('DOMContentLoaded', validateConfig);
}
