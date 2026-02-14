/* ========================================
   약국 관련 기능
   
   약국 목록 조회, 상세 정보 표시,
   약국 검색 및 필터링 기능을 담당합니다.
   ======================================== */

const PharmacyManager = {
  // ===== 약국 데이터 =====
  // 약국 목록 (pharmacy_data.js에서 정의된 PHARMACIES 사용)
  pharmacies: typeof PHARMACIES !== 'undefined' ? PHARMACIES : [],
  
  // 검색/필터 상태
  searchQuery: '',
  selectedPharmacy: null,
  
  // ===== 약국 목록 렌더링 =====
  
  /**
   * 약국 목록을 컨테이너에 렌더링
   * 
   * @param {HTMLElement} containerEl - 렌더링할 컨테이너 요소
   * @param {Array} pharmacies - 약국 배열 (지정하지 않으면 this.pharmacies 사용)
   */
  renderList(containerEl, pharmacies = null) {
    // 컨테이너 확인
    if (!containerEl) {
      console.error('약국 목록 컨테이너가 없습니다.');
      return;
    }
    
    // 약국 데이터 확인
    const list = pharmacies || this.pharmacies;
    if (!Array.isArray(list)) {
      containerEl.innerHTML = '<p style="color: #888; padding: 20px; text-align: center;">약국 데이터를 불러올 수 없습니다.</p>';
      return;
    }
    
    // 컨테이너 초기화
    containerEl.innerHTML = '';
    
    // 각 약국별로 아이템 생성
    list.forEach(pharmacy => {
      // 거리 (테스트용 랜덤)
      const distance = Math.round(Math.random() * 400 + 100);
      
      // 약국 아이템 DOM 생성
      const item = document.createElement('div');
      item.className = 'pharmacy-item';
      item.dataset.id = pharmacy.id;
      item.innerHTML = `
        <div class="item-header">
          <h3>${pharmacy.name}</h3>
          <span class="distance">${distance}m</span>
        </div>
        <p class="status">영업중</p>
        <p class="address">${pharmacy.address}</p>
      `;
      
      // 클릭 이벤트: 약국 상세정보 표시
      item.addEventListener('click', () => {
        this.showDetail(pharmacy);
      });
      
      // 컨테이너에 추가
      containerEl.appendChild(item);
    });
  },
  
  // ===== 약국 상세정보 표시 =====
  
  /**
   * 약국 상세정보를 사이드 패널에 표시
   * 
   * @param {Object} pharmacy - 약국 객체
   */
  showDetail(pharmacy) {
    if (!pharmacy) {
      console.error('약국 데이터가 없습니다.');
      return;
    }
    
    // 선택된 약국 저장
    this.selectedPharmacy = pharmacy;
    
    // ===== 제목 및 기본 정보 =====
    const titleEl = document.getElementById('panel-detail-title');
    const addressEl = document.getElementById('panel-detail-address');
    const phoneEl = document.getElementById('panel-detail-phone');
    const hoursEl = document.getElementById('panel-detail-hours');
    
    if (titleEl) titleEl.innerText = pharmacy.name;
    if (addressEl) addressEl.innerText = `주소: ${pharmacy.address}`;
    if (phoneEl) phoneEl.innerText = `전화: ${pharmacy.phone}`;
    
    // ===== 영업시간 (Helpers 함수 사용) =====
    if (hoursEl) {
      hoursEl.innerHTML = Helpers.formatHoursWithBadge(pharmacy.hours);
    }
    
    // ===== 지도 버튼 설정 =====
    const kakaoBtn = document.getElementById('panel-kakao-view');
    const naverBtn = document.getElementById('panel-naver-btn');
    
    if (kakaoBtn) {
      kakaoBtn.onclick = () => {
        window.open(
          pharmacy.kakao_url || `https://map.kakao.com/search?q=${encodeURIComponent(pharmacy.name)}`,
          '_blank'
        );
      };
    }
    
    if (naverBtn) {
      naverBtn.onclick = () => {
        window.open(
          `https://search.naver.com/search.naver?query=${encodeURIComponent(pharmacy.name)}`,
          '_blank'
        );
      };
    }
    
    // ===== 사이드 패널 열기 =====
    if (typeof Panel !== 'undefined' && Panel.open) {
      Panel.open('detail');
    }
    
    // ===== 활동 로그 추가 =====
    if (typeof StorageManager !== 'undefined') {
      StorageManager.addActivity({
        type: 'visit',
        text: `방문: ${pharmacy.name}`,
        lat: pharmacy.lat,
        lng: pharmacy.lng,
        id: pharmacy.id
      });
    }
  },
  
  // ===== 약국 검색 =====
  
  /**
   * 약국명으로 검색
   * 
   * @param {string} query - 검색어
   * @returns {Array} 일치하는 약국 배열
   */
  search(query) {
    if (!query || typeof query !== 'string') {
      return this.pharmacies;
    }
    
    const q = query.toLowerCase();
    return this.pharmacies.filter(pharmacy =>
      pharmacy.name.toLowerCase().includes(q) ||
      pharmacy.address.toLowerCase().includes(q) ||
      pharmacy.phone.includes(q)
    );
  },
  
  /**
   * 특정 ID의 약국 찾기
   * 
   * @param {number} id - 약국 ID
   * @returns {Object|null} 약국 객체 또는 null
   */
  getById(id) {
    return this.pharmacies.find(p => p.id === id);
  },
  
  /**
   * 특정 좌표 근처의 약국 찾기
   * 
   * @param {number} lat - 위도
   * @param {number} lng - 경도
   * @param {number} radiusKm - 반경 (km)
   * @returns {Array} 근처 약국 배열 (거리순 정렬)
   */
  findNearby(lat, lng, radiusKm = 5) {
    // 거리 계산 함수 (간단한 공식)
    const calculateDistance = (lat1, lng1, lat2, lng2) => {
      const dx = (lng2 - lng1) * 111.32;  // 경도 거리 (km)
      const dy = (lat2 - lat1) * 110.57;  // 위도 거리 (km)
      return Math.sqrt(dx * dx + dy * dy);
    };
    
    // 반경 내 약국 필터링 및 거리순 정렬
    return this.pharmacies.filter(pharmacy => {
      const distance = calculateDistance(lat, lng, pharmacy.lat, pharmacy.lng);
      return distance <= radiusKm;
    }).sort((a, b) => {
      const distA = calculateDistance(lat, lng, a.lat, a.lng);
      const distB = calculateDistance(lat, lng, b.lat, b.lng);
      return distA - distB;
    });
  },
  
  // ===== 댓글 관리 =====
  
  /**
   * 약국에 대한 댓글 조회
   * 
   * @param {number} pharmacyId - 약국 ID
   * @returns {Array} 댓글 배열
   */
  getComments(pharmacyId) {
    if (typeof StorageManager === 'undefined') {
      return [];
    }
    return StorageManager.getPharmacyComments(pharmacyId);
  },
  
  /**
   * 약국에 댓글 추가
   * 
   * @param {number} pharmacyId - 약국 ID
   * @param {string} text - 댓글 내용
   */
  addComment(pharmacyId, text) {
    if (typeof StorageManager === 'undefined') {
      console.error('StorageManager를 이용할 수 없습니다.');
      return;
    }
    
    if (!text || text.trim() === '') {
      console.warn('댓글 내용이 없습니다.');
      return;
    }
    
    StorageManager.addPharmacyComment(pharmacyId, text);
    if (typeof Toast !== 'undefined') {
      Toast.show('댓글이 등록되었습니다.');
    }
  }
};

/**
 * 초기화 함수
 * 페이지 로드 시 호출
 */
function initPharmacyManager() {
  if (typeof PHARMACIES !== 'undefined') {
    PharmacyManager.pharmacies = PHARMACIES;
    
    // 약국 데이터 검증
    if (typeof validatePharmacies !== 'undefined' && !validatePharmacies()) {
      console.error('약국 데이터 검증 실패');
    }
  }
}

// 페이지 로드 시 자동 초기화
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPharmacyManager);
} else {
  initPharmacyManager();
}
