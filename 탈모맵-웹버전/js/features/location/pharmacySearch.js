/* ========================================
   약국 검색 기능
   
   카카오 API를 통한 주변 약국 검색,
   약국 목록 업데이트
   ======================================== */

const PharmacySearch = {
  /**
   * 카카오 API를 사용해 주변 약국 검색
   * 
   * @param {number} lat - 위도
   * @param {number} lng - 경도
   * @param {number} radius - 검색 반경 (미터)
   */
  async searchNearbyPharmacies(lat, lng, radius = 1000) {
    if (!CONFIG.KAKAO_LOCAL_API_KEY) {
      Toast.error('카카오 API 키가 설정되지 않았습니다.');
      return;
    }
    
    // 기존 마커 제거
    if (typeof PharmacyMarker !== 'undefined') {
      PharmacyMarker.clearKakaoMarkers();
    }
    
    Toast.show('주변 약국을 검색하는 중입니다...');
    
    try {
      // API 호출
      const data = await API.searchNearbyPharmacies(lat, lng, radius);
      
      if (!data.documents || data.documents.length === 0) {
        Toast.show(`검색된 약국이 없습니다. (반경 ${radius}m)`);
        return;
      }
      
      // 지도에 마커 표시
      if (typeof PharmacyMarker !== 'undefined') {
        PharmacyMarker.displayPharmacyMarkers(data.documents);
      }
      
      // 약국 목록 패널 업데이트
      this.updatePharmacyList(data.documents);
      
      // 지도 중심 이동 (애니메이션 포함)
      if (window.map && typeof kakao !== 'undefined') {
        map.panTo(new kakao.maps.LatLng(lat, lng));
      }
      
      Toast.success('주변 약국 검색 완료');
      
      if (CONFIG.DEBUG_MODE) {
        console.log(`주변 약국 ${data.documents.length}개 발견`);
      }
    } catch (error) {
      Toast.error('주변 약국 검색 중 오류가 발생했습니다.');
      console.error('약국 검색 오류:', error);
    }
  },
  
  /**
   * 약국 목록 패널 업데이트
   * 
   * @param {Array} pharmacies - 약국 배열
   */
  updatePharmacyList(pharmacies) {
    const listContainer = document.getElementById('panel-list');
    if (!listContainer) {
      return;
    }
    
    listContainer.innerHTML = '';
    
    // 거리순으로 정렬
    const sorted = [...pharmacies].sort((a, b) =>
      (parseInt(a.distance) || 0) - (parseInt(b.distance) || 0)
    );
    
    sorted.forEach((pharmacy, index) => {
      const item = document.createElement('div');
      item.className = 'pharmacy-item';
      
      item.innerHTML = `
        <div class="item-header">
          <h3>${pharmacy.place_name}</h3>
          <span class="distance">${pharmacy.distance ? pharmacy.distance + 'm' : ''}</span>
        </div>
        <p class="status">${pharmacy.phone ? '전화: ' + pharmacy.phone : ''}</p>
        <p class="address">${pharmacy.address_name || ''}</p>
      `;
      
      item.addEventListener('click', () => {
        try {
          if (window.map) {
            map.setCenter(new kakao.maps.LatLng(pharmacy.y, pharmacy.x));
          }
        } catch (e) {
          console.error('지도 이동 실패:', e);
        }
        
        if (typeof PharmacyMarker !== 'undefined') {
          PharmacyMarker.highlightMarker(index);
        }
        
        if (typeof PharmacyPopup !== 'undefined') {
          PharmacyPopup.showPharmacyPopup(pharmacy, index);
        }
      });
      
      listContainer.appendChild(item);
    });
  }
};
