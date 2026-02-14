/* ========================================
   약국 마커 표시 기능
   
   카카오 API 마커 생성, 표시, 제거
   ======================================== */

const PharmacyMarker = {
  kakaoMarkers: [],
  selectedMarkerIndex: -1,
  
  /**
   * SVG 마커 생성 (색상 지정 가능)
   * @param {string} crossColor - 십자 색상 (#4CAF50 또는 #ef4444)
   */
  createMarkerSVG(crossColor = '#4CAF50') {
    const borderColor = crossColor === '#ef4444' ? '#dc2626' : '#2E7D32';
    return `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 70 100" width="70" height="100">
        <defs>
          <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" flood-opacity="0.3"/>
          </filter>
        </defs>
        <path d="M 35 5 C 50 5 62 17 62 32 C 62 55 35 95 35 95 C 35 95 8 55 8 32 C 8 17 20 5 35 5 Z" fill="#1e5a96" filter="url(#shadow)"/>
        <circle cx="35" cy="32" r="18" fill="white"/>
        <circle cx="35" cy="32" r="16" fill="none" stroke="#1e5a96" stroke-width="2"/>
        <g fill="${crossColor}" stroke="${borderColor}" stroke-width="0.5">
          <rect x="32.5" y="25" width="5" height="14" rx="1"/>
          <rect x="28" y="29.5" width="14" height="5" rx="1"/>
        </g>
      </svg>
    `;
  },
  
  /**
   * 약국 마커를 지도에 표시
   */
  displayPharmacyMarkers(pharmacies) {
    if (!window.map || typeof kakao === 'undefined') {
      return;
    }
    
    const svgMarker = this.createMarkerSVG('#4CAF50');
    
    const svgBlob = new Blob([svgMarker], {type: 'image/svg+xml'});
    const svgUrl = URL.createObjectURL(svgBlob);
    
    const markerImage = new kakao.maps.MarkerImage(
      svgUrl,
      new kakao.maps.Size(50, 70),
      {offset: new kakao.maps.Point(25, 70)}
    );
    
    pharmacies.forEach((pharmacy, index) => {
      try {
        const marker = new kakao.maps.Marker({
          position: new kakao.maps.LatLng(pharmacy.y, pharmacy.x),
          map: map,
          title: pharmacy.place_name,
          image: markerImage
        });
        
        marker.pharmacyIndex = index;
        
        kakao.maps.event.addListener(marker, 'click', () => {
          if (typeof PharmacyPopup !== 'undefined') {
            PharmacyPopup.showPharmacyPopup(pharmacy, index);
          }
        });
        
        this.kakaoMarkers.push(marker);
      } catch (e) {
        console.error('마커 생성 실패:', e);
      }
    });
  },
  
  /**
   * 특정 마커 강조 (십자를 빨간색으로)
   */
  highlightMarker(index) {
    if (index === this.selectedMarkerIndex) return;
    this.resetMarkerHighlight();
    
    const marker = this.kakaoMarkers[index];
    if (marker) {
      const svgMarker = this.createMarkerSVG('#ef4444');
      const svgBlob = new Blob([svgMarker], {type: 'image/svg+xml'});
      const svgUrl = URL.createObjectURL(svgBlob);
      const highlightImage = new kakao.maps.MarkerImage(svgUrl, new kakao.maps.Size(50, 70), {offset: new kakao.maps.Point(25, 70)});
      marker.setImage(highlightImage);
      this.selectedMarkerIndex = index;
    }
  },
  
  /**
   * 강조된 마커 초기화 (다시 녹색으로)
   */
  resetMarkerHighlight() {
    if (this.selectedMarkerIndex >= 0) {
      const marker = this.kakaoMarkers[this.selectedMarkerIndex];
      if (marker) {
        const svgMarker = this.createMarkerSVG('#4CAF50');
        const svgBlob = new Blob([svgMarker], {type: 'image/svg+xml'});
        const svgUrl = URL.createObjectURL(svgBlob);
        const normalImage = new kakao.maps.MarkerImage(svgUrl, new kakao.maps.Size(50, 70), {offset: new kakao.maps.Point(25, 70)});
        marker.setImage(normalImage);
      }
      this.selectedMarkerIndex = -1;
    }
  },
  
  /**
   * 카카오 API 마커 제거
   */
  clearKakaoMarkers() {
    this.kakaoMarkers.forEach(marker => {
      try {
        marker.setMap(null);
      } catch (e) {
        console.error('마커 제거 실패:', e);
      }
    });
    this.kakaoMarkers = [];
    this.selectedMarkerIndex = -1;
  }
};
