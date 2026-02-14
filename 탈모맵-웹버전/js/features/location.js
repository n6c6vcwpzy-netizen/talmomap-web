/* ========================================
   위치 및 지도 기능
   
   사용자 위치 조회, 주변 약국 검색,
   지도 마커 표시 등을 담당합니다.
   ======================================== */

const LocationManager = {
  // ===== 초기화 =====
  
  /**
   * 위치 관리자 초기화
   */
  init() {
    this.setupButtons();
    this.attachEventListeners();
    
    // 패널 상호작용 초기화
    if (typeof PanelInteraction !== 'undefined') {
      PanelInteraction.setupInitialState();
      PanelInteraction.setupPanelDrag();
      PanelInteraction.setupPanelToggle();
    }
    
    // 지도 준비 완료 후 애니메이션 설정
    setTimeout(() => {
      if (typeof window.map !== 'undefined' && window.map) {
        if (typeof MapAnimation !== 'undefined') {
          MapAnimation.setupMapZoomAnimation();
        }
      }
    }, 500);
  },
  
  /**
   * UI 버튼 설정
   */
  setupButtons() {
    // 내 위치 찾기 버튼
    let locateBtn = document.getElementById('locate-btn');
    if (!locateBtn) {
      locateBtn = document.createElement('button');
      locateBtn.id = 'locate-btn';
      locateBtn.title = '내 위치 찾기';
      locateBtn.innerHTML = '<i class="fas fa-location-arrow"></i>';
      Object.assign(locateBtn.style, {
        position: 'absolute',
        bottom: '90px',
        right: '20px',
        zIndex: '120',
        padding: '12px',
        background: 'white',
        borderRadius: '50%',
        border: '1px solid #ddd',
        cursor: 'pointer',
        boxShadow: '0 4px 12px rgba(0,0,0,0.12)'
      });
      
      const mainContent = document.querySelector('.main-content');
      if (mainContent) {
        mainContent.appendChild(locateBtn);
      }
    }

    if (typeof ConsentManager !== 'undefined') {
      ConsentManager.syncState();
    }
  },
  
  // ===== 이벤트 리스너 =====
  
  /**
   * 이벤트 리스너 연결
   */
  attachEventListeners() {
    // 내 위치 찾기 버튼
    const locateBtn = document.getElementById('locate-btn');
    if (locateBtn) {
      locateBtn.addEventListener('click', () => {
        if (typeof ConsentManager !== 'undefined') {
          ConsentManager.requestConsent(() => {
            if (typeof UserLocation !== 'undefined') {
              UserLocation.getCurrentLocation();
            }
          });
          return;
        }

        if (typeof UserLocation !== 'undefined') {
          UserLocation.getCurrentLocation();
        }
      });
    }
    
    // 주변 약국 찾기 버튼
    const nearbyBtn = document.getElementById('find-nearby-btn');
    if (nearbyBtn) {
      nearbyBtn.addEventListener('click', () => {
        if (typeof map !== 'undefined') {
          try {
            const center = map.getCenter();
            const lat = center.getLat();
            const lng = center.getLng();
            if (typeof PharmacySearch !== 'undefined') {
              PharmacySearch.searchNearbyPharmacies(lat, lng, CONFIG.SEARCH_RADIUS || 1000);
            }
          } catch (e) {
            Toast.error('지도를 불러올 수 없습니다.');
            console.error('지도 중심 조회 실패:', e);
          }
        }
      });
    }
    
    // 팝업 닫기 버튼
    const popupCloseBtn = document.getElementById('popup-close');
    if (popupCloseBtn) {
      popupCloseBtn.addEventListener('click', () => {
        if (typeof PharmacyPopup !== 'undefined' && PharmacyPopup.closePopup) {
          PharmacyPopup.closePopup();
          return;
        }

        const popup = document.getElementById('pharmacy-popup');
        if (popup) {
          popup.classList.remove('show');
          popup.style.transform = '';
          popup.style.display = 'none';
        }
      });
    }
  }
};
