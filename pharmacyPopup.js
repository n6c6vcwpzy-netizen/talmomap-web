/* ========================================
   약국 팝업 표시 기능
   
   약국 상세 정보 표시, 외부 지도 링크
   ======================================== */

const PharmacyPopup = {
  isDragInitialized: false,
  popupShifted: 0,
  selectedIndex: -1,

  /**
   * 약국 팝업 닫기
   */
  closePopup() {
    const popupEl = document.getElementById('pharmacy-popup');
    if (!popupEl) {
      return;
    }

    popupEl.classList.remove('show');
    popupEl.style.transform = '';
    popupEl.style.display = 'none';

    if (window.map && this.popupShifted) {
      try {
        map.panBy(0, this.popupShifted);
      } catch (e) {
        // 무시
      }
      this.popupShifted = 0;
    }
    
    if (typeof PharmacyMarker !== 'undefined') {
      PharmacyMarker.resetMarkerHighlight();
    }
    this.selectedIndex = -1;
  },

  /**
   * 모바일 드래그 닫기 설정
   */
  setupDragToClose() {
    if (this.isDragInitialized) {
      return;
    }

    const popupEl = document.getElementById('pharmacy-popup');
    if (!popupEl) {
      return;
    }

    const headerEl = popupEl.querySelector('.popup-header') || popupEl;
    let startY = 0;
    let currentY = 0;
    let isDragging = false;

    headerEl.addEventListener('touchstart', (e) => {
      if (!popupEl.classList.contains('show')) {
        return;
      }
      startY = e.touches[0].clientY;
      currentY = 0;
      isDragging = true;
    }, { passive: true });

    headerEl.addEventListener('touchmove', (e) => {
      if (!isDragging) return;
      currentY = e.touches[0].clientY - startY;
      if (currentY > 0) {
        popupEl.style.transform = `translateY(${currentY}px)`;
        e.preventDefault();
      }
    }, { passive: false });

    headerEl.addEventListener('touchend', () => {
      if (!isDragging) return;
      isDragging = false;

      if (currentY > 120) {
        this.closePopup();
      } else {
        popupEl.style.transform = '';
      }
      currentY = 0;
    });

    this.isDragInitialized = true;
  },

  /**
   * 약국 팝업 표시
   * 
   * @param {Object} pharmacy - 약국 정보
   * @param {number} index - 마커 인덱스
   */
  showPharmacyPopup(pharmacy, index = -1) {
    const popupEl = document.getElementById('pharmacy-popup');
    if (!popupEl) {
      return;
    }

    popupEl.style.display = 'block';
    
    if (typeof PharmacyMarker !== 'undefined' && index >= 0) {
      PharmacyMarker.highlightMarker(index);
      this.selectedIndex = index;
    }
    // 제목
    const titleEl = document.getElementById('popup-title');
    if (titleEl) titleEl.innerText = pharmacy.place_name;
    
    // 주소
    const addressEl = document.getElementById('popup-address');
    if (addressEl) addressEl.innerText = `주소: ${pharmacy.address_name || '정보 없음'}`;
    
    // 전화
    const phoneEl = document.getElementById('popup-phone');
    if (phoneEl) phoneEl.innerText = `전화: ${pharmacy.phone || '정보 없음'}`;
    
    // 영업시간
    const hoursEl = document.getElementById('popup-hours');
    if (hoursEl) {
      if (typeof Helpers !== 'undefined') {
        hoursEl.innerHTML = Helpers.formatHoursWithBadge(pharmacy.opening_hours);
      } else {
        hoursEl.innerText = `영업시간: ${pharmacy.opening_hours || '정보 없음'}`;
      }
    }
    
    // 네이버/카카오 지도 보기 버튼 이벤트 추가
    setTimeout(() => {
      // 네이버 지도 보기 버튼 - 좌표로 상세 페이지 이동
      const naverBtn = document.getElementById('naver-map-btn');
      if (naverBtn) {
        naverBtn.onclick = () => {
          // 네이버 지도 - 좌표 기반 URL
          const url = `https://map.naver.com/p/search/${encodeURIComponent(pharmacy.place_name)}/place/${pharmacy.y},${pharmacy.x}`;
          window.open(url, '_blank');
        };
      }
      
      // 카카오 지도 보기 버튼 - place_id로 상세 페이지 이동
      const kakaoBtn = document.getElementById('popup-kakao-view');
      if (kakaoBtn) {
        kakaoBtn.onclick = () => {
          // 카카오맵 - place_id가 있으면 상세 페이지, 없으면 검색
          if (pharmacy.id) {
            const url = `https://place.map.kakao.com/${pharmacy.id}`;
            window.open(url, '_blank');
          } else {
            // place_id가 없으면 검색 결과로
            const url = `https://map.kakao.com/?q=${encodeURIComponent(pharmacy.place_name)}`;
            window.open(url, '_blank');
          }
        };
      }
    }, 100);
    
    // 드래그 닫기 초기화
    this.setupDragToClose();

    // 팝업 표시
    popupEl.classList.add('show');

    // 지도 고정: 팝업 표시 시 지도 이동 없음
    this.popupShifted = 0;
    
    // 활동 로그
    if (typeof StorageManager !== 'undefined') {
      StorageManager.addActivity({
        type: 'visit',
        text: `약국 검색: ${pharmacy.place_name}`,
        lat: pharmacy.y,
        lng: pharmacy.x
      });
    }
  }
};
