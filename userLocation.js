/* ========================================
   사용자 위치 관련 기능
   
   현재 위치 조회, 사용자 마커 표시
   ======================================== */

const UserLocation = {
  userMarker: null,
  
  /**
   * 사용자의 현재 위치 조회
   */
  getCurrentLocation() {
    if (typeof ConsentManager !== 'undefined' && !ConsentManager.hasConsent()) {
      ConsentManager.requestConsent(() => this.getCurrentLocation());
      return;
    }

    if (!navigator.geolocation) {
      Toast.error('이 브라우저는 위치 정보를 지원하지 않습니다.');
      return;
    }
    
    Toast.show('위치를 확인하는 중입니다...');
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        
        // 지도 중심 이동
        try {
          if (window.map && typeof kakao !== 'undefined') {
            map.setCenter(new kakao.maps.LatLng(lat, lng));
            map.setLevel(3);
          }
        } catch (e) {
          console.error('지도 이동 실패:', e);
        }
        
        // 사용자 마커 표시
        this.showUserMarker(lat, lng);
        
        // 활동 로그
        if (typeof StorageManager !== 'undefined') {
          StorageManager.addActivity({
            type: 'location',
            text: '내 위치로 이동',
            lat: lat,
            lng: lng
          });
        }
        
        Toast.success('현재 위치로 이동했습니다.');
      },
      (error) => {
        let message = '위치 정보를 가져올 수 없습니다.';
        if (error.code === error.PERMISSION_DENIED) {
          message = '위치 정보 접근이 거부되었습니다.';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          message = '위치 정보가 이용 불가능합니다.';
        } else if (error.code === error.TIMEOUT) {
          message = '위치 정보 요청이 타임아웃되었습니다.';
        }
        Toast.error(message);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  },
  
  /**
   * 사용자 위치 마커 표시
   * 
   * @param {number} lat - 위도
   * @param {number} lng - 경도
   */
  showUserMarker(lat, lng) {
    if (!window.map || typeof kakao === 'undefined') {
      return;
    }
    
    try {
      if (this.userMarker) {
        // 기존 마커 위치 변경
        this.userMarker.setPosition(new kakao.maps.LatLng(lat, lng));
      } else {
        // 새 마커 생성
        this.userMarker = new kakao.maps.Marker({
          position: new kakao.maps.LatLng(lat, lng),
          map: map,
          title: '내 위치'
        });
      }
    } catch (e) {
      console.error('사용자 마커 표시 실패:', e);
    }
  }
};
