/* ========================================
   지도 애니메이션 기능
   
   줌 변경, 지도 중심 이동 등
   ======================================== */

const MapAnimation = {
  /**
   * 지도 줌 애니메이션 처리
   */
  setupMapZoomAnimation() {
    if (!window.map || typeof kakao === 'undefined') {
      return;
    }
    
    try {
      // 줌 변경 이벤트 리스너
      kakao.maps.event.addListener(map, 'zoom_changed', () => {
        const zoomLevel = map.getLevel();
        if (CONFIG.DEBUG_MODE) {
          console.log('현재 줌 레벨:', zoomLevel);
        }
      });
      
      // 지도 중심 이동 시 부드러운 애니메이션
      kakao.maps.event.addListener(map, 'center_changed', () => {
        // 중심 이동 완료
        if (CONFIG.DEBUG_MODE) {
          console.log('지도 중심 이동 완료');
        }
      });
    } catch (e) {
      console.error('줌 애니메이션 설정 실패:', e);
    }
  }
};
