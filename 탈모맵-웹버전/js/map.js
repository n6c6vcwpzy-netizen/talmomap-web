/* ========================================
   지도 초기화 및 관리
   
   카카오 지도 SDK 로드, 초기화,
   마커 표시 등을 담당합니다.
   ======================================== */

let map = null;  // 전역 지도 객체

/**
 * 카카오 지도 초기화
 */
function initMap() {
  // kakao.maps가 로드되지 않았으면 재시도
  if (typeof kakao === 'undefined' || !kakao.maps) {
    if (CONFIG.DEBUG_MODE) {
      console.log('카카오 지도 SDK 대기 중...');
    }
    setTimeout(initMap, 100);
    return;
  }
  
  // 지도 컨테이너 확인
  const mapContainer = document.getElementById('map');
  if (!mapContainer) {
    if (CONFIG.DEBUG_MODE) {
      console.error('지도 컨테이너 요소를 찾을 수 없습니다.');
    }
    return;
  }
  
  /**
   * 지도 생성 함수 (kakao.maps.load 래핑)
   */
  const createMap = () => {
    // 모바일 여부 판단
    const isMobile = window.innerWidth <= 768;
    
    // 지도 옵션
    const options = {
      center: new kakao.maps.LatLng(CONFIG.MAP_CENTER.lat, CONFIG.MAP_CENTER.lng),
      level: isMobile ? 5 : 3  // 모바일에서는 더 넓게
    };
    
    // 지도 생성
    map = new kakao.maps.Map(mapContainer, options);
    
    if (CONFIG.DEBUG_MODE) {
      console.log('지도 초기화 완료');
    }
    
    // 레이아웃 안정화를 위한 리사이즈 트리거
    setTimeout(() => {
      try {
        window.dispatchEvent(new Event('resize'));
      } catch (e) {
        // 무시
      }
    }, 300);
    
    // 빈 지도로 시작 (카카오 API 검색으로만 약국 표시)
  };
  
  // kakao.maps.load 사용 가능하면 사용, 아니면 직접 생성
  if (typeof kakao.maps.load === 'function') {
    kakao.maps.load(createMap);
  } else {
    createMap();
  }
}

/**
 * 약국 초기 마커 표시
 * 
 * @param {Array} pharmacies - 약국 배열
 */
function initPharmacyMarkers(pharmacies) {
  if (!map || !Array.isArray(pharmacies)) {
    return;
  }
  
  try {
    // SVG 마커 생성 (개선된 디자인)
    const svgMarker = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 70 100" width="70" height="100">
        <!-- 그림자 효과 -->
        <defs>
          <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" flood-opacity="0.3"/>
          </filter>
        </defs>
        <!-- 파란색 핀 모양 -->
        <path d="M 35 5 C 50 5 62 17 62 32 C 62 55 35 95 35 95 C 35 95 8 55 8 32 C 8 17 20 5 35 5 Z" fill="#1e5a96" filter="url(#shadow)"/>
        <!-- 흰색 원 배경 -->
        <circle cx="35" cy="32" r="18" fill="white"/>
        <!-- 파란색 테두리 원 -->
        <circle cx="35" cy="32" r="16" fill="none" stroke="#1e5a96" stroke-width="2"/>
        <!-- 녹색 십자가 (더 깔끔하게) -->
        <g fill="#4CAF50" stroke="#2E7D32" stroke-width="0.5">
          <rect x="32.5" y="25" width="5" height="14" rx="1"/>
          <rect x="28" y="29.5" width="14" height="5" rx="1"/>
        </g>
      </svg>
    `;
    
    const svgBlob = new Blob([svgMarker], {type: 'image/svg+xml'});
    const svgUrl = URL.createObjectURL(svgBlob);
    
    console.log('마커 SVG 생성 완료');
    
    const markerImage = new kakao.maps.MarkerImage(
      svgUrl,
      new kakao.maps.Size(50, 70),
      {offset: new kakao.maps.Point(25, 70)}
    );

    pharmacies.forEach(pharmacy => {
      const marker = new kakao.maps.Marker({
        position: new kakao.maps.LatLng(pharmacy.lat, pharmacy.lng),
        map: map,
        title: pharmacy.name,
        image: markerImage
      });
      
      // 마커 클릭 이벤트
      kakao.maps.event.addListener(marker, 'click', () => {
        if (typeof PharmacyManager !== 'undefined') {
          PharmacyManager.showDetail(pharmacy);
        }
      });
    });
    
    console.log(`${pharmacies.length}개의 약국 마커 표시 완료`);
    
    if (CONFIG.DEBUG_MODE) {
      console.log(`${pharmacies.length}개의 약국 마커 표시`);
    }
  } catch (error) {
    console.error('약국 마커 생성 실패:', error);
  }
}

/**
 * 지도 중심을 특정 좌표로 이동
 * 
 * @param {number} lat - 위도
 * @param {number} lng - 경도
 * @param {number} level - 줌 레벨 (기본값: 현재 레벨 유지)
 */
function panMapTo(lat, lng, level = null) {
  if (!map || typeof kakao === 'undefined') {
    return;
  }
  
  try {
    const latlng = new kakao.maps.LatLng(lat, lng);
    map.setCenter(latlng);
    
    if (level !== null && typeof level === 'number') {
      map.setLevel(level);
    }
    
    if (CONFIG.DEBUG_MODE) {
      console.log(`지도 이동: (${lat}, ${lng})`);
    }
  } catch (error) {
    console.error('지도 이동 실패:', error);
  }
}

/**
 * 현재 지도 중심 좌표 조회
 * 
   * @returns {Object|null} {lat, lng} 또는 null
 */
function getMapCenter() {
  if (!map || typeof kakao === 'undefined') {
    return null;
  }
  
  try {
    const center = map.getCenter();
    return {
      lat: center.getLat(),
      lng: center.getLng()
    };
  } catch (error) {
    console.error('지도 중심 조회 실패:', error);
    return null;
  }
}

/**
 * 현재 지도 줌 레벨 조회
 * 
 * @returns {number|null} 줌 레벨 또는 null
 */
function getMapLevel() {
  if (!map) {
    return null;
  }
  
  try {
    return map.getLevel();
  } catch (error) {
    console.error('지도 줌 레벨 조회 실패:', error);
    return null;
  }
}

// ===== 페이지 로드 시 초기화 =====

// 문서가 완전히 로드된 경우
if (document.readyState === 'complete') {
  initMap();
} else {
  // 문서 로드 완료 대기
  window.addEventListener('load', initMap);
}

// 창 크기 변경 시 지도 리사이즈
window.addEventListener('resize', () => {
  if (map) {
    try {
      // 약간의 지연 후 리사이즈 이벤트 트리거
      setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
      }, 100);
    } catch (e) {
      // 무시
    }
  }
});
