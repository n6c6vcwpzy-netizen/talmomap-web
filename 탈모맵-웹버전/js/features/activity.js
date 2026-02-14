/* ========================================
   활동 로그 기능
   
   사용자의 약국 방문, 검색, 위치 이동
   등의 활동 내역을 관리합니다.
   ======================================== */

const ActivityManager = {
  // ===== 상태 =====
  activities: [],
  
  // ===== 초기화 =====
  
  /**
   * 활동 로그 매니저 초기화
   */
  init() {
    // LocalStorage에서 활동 로그 로드
    this.loadActivities();
    
    // UI 이벤트 리스너 연결
    this.attachEventListeners();
    
    if (CONFIG.DEBUG_MODE) {
      console.log(`활동 로그 로드: ${this.activities.length}개`);
    }
  },
  
  // ===== 데이터 관리 =====
  
  /**
   * LocalStorage에서 활동 로그 로드
   */
  loadActivities() {
    if (typeof StorageManager !== 'undefined') {
      this.activities = StorageManager.getActivities();
    } else {
      try {
        this.activities = JSON.parse(localStorage.getItem('activities') || '[]');
      } catch (e) {
        console.error('활동 로그 로드 실패:', e);
        this.activities = [];
      }
    }
  },
  
  /**
   * 새로운 활동 기록
   * 
   * @param {string|Object} item - 활동 내용 (문자열 또는 객체)
   */
  addActivity(item) {
    if (typeof StorageManager !== 'undefined') {
      StorageManager.addActivity(item);
    } else {
      const entry = (typeof item === 'string')
        ? { text: item, ts: Date.now() }
        : { ...item, ts: Date.now() };
      
      this.activities.unshift(entry);
      if (this.activities.length > 200) {
        this.activities.splice(200);
      }
      try {
        localStorage.setItem('activities', JSON.stringify(this.activities));
      } catch (e) {
        console.error('활동 로그 저장 실패:', e);
      }
    }
    
    // UI 업데이트
    this.render();
  },
  
  /**
   * 모든 활동 로그 삭제
   */
  clearAll() {
    if (!confirm('모든 활동 내역을 삭제하시겠습니까?')) {
      return;
    }
    
    if (typeof StorageManager !== 'undefined') {
      StorageManager.clearActivities();
    } else {
      this.activities = [];
      try {
        localStorage.setItem('activities', JSON.stringify([]));
      } catch (e) {
        console.error('활동 로그 삭제 실패:', e);
      }
    }
    
    // UI 업데이트
    this.render();
    
    if (typeof Toast !== 'undefined') {
      Toast.show('활동 내역이 삭제되었습니다.');
    }
  },
  
  // ===== UI 렌더링 =====
  
  /**
   * 활동 로그 UI 렌더링
   * 
   * @param {HTMLElement} containerEl - 렌더링 대상 (지정하지 않으면 자동 탐색)
   */
  render(containerEl = null) {
    // 컨테이너 탐색
    const containers = containerEl
      ? [containerEl]
      : [
        document.getElementById('activity-list'),
        document.getElementById('page-activity-list')
      ].filter(Boolean);
    
    if (containers.length === 0) {
      if (CONFIG.DEBUG_MODE) {
        console.warn('활동 로그 컨테이너를 찾을 수 없습니다.');
      }
      return;
    }
    
    // 활동 데이터 로드
    this.loadActivities();
    
    containers.forEach(container => {
      this.renderInContainer(container);
    });
  },
  
  /**
   * 특정 컨테이너에 활동 로그 렌더링
   * 
   * @param {HTMLElement} container - 대상 컨테이너
   */
  renderInContainer(container) {
    if (!container) {
      return;
    }
    
    // 빈 상태 확인
    if (this.activities.length === 0) {
      const emptyEl = container.parentElement?.querySelector('.panel-empty');
      if (emptyEl) emptyEl.style.display = 'block';
      container.style.display = 'none';
      container.innerHTML = '';
      return;
    }
    
    // 빈 상태 숨김
    const emptyEl = container.parentElement?.querySelector('.panel-empty');
    if (emptyEl) emptyEl.style.display = 'none';
    container.style.display = 'block';
    container.innerHTML = '';
    
    // 활동 아이템 생성
    this.activities.forEach(activity => {
      const li = document.createElement('li');
      li.className = 'activity-item';
      
      // 타임스탐프 포맷
      const date = new Date(activity.ts);
      const timeAgo = typeof Helpers !== 'undefined'
        ? Helpers.getTimeAgo(activity.ts)
        : this.getTimeAgo(activity.ts);
      
      // HTML 생성
      li.innerHTML = `
        <div>
          <strong>${activity.text}</strong>
          <div class="time">${timeAgo} · ${date.toLocaleString('ko-KR')}</div>
        </div>
      `;
      
      // 지도에 표시 클릭 이벤트 (좌표가 있는 경우)
      if (activity.lat && activity.lng && typeof map !== 'undefined') {
        li.style.cursor = 'pointer';
        li.title = '지도에서 보기';
        
        li.addEventListener('click', () => {
          try {
            // 지도 중심 이동
            map.setCenter(new kakao.maps.LatLng(activity.lat, activity.lng));
            
            // 약국 상세정보 표시
            if (activity.id && typeof PharmacyManager !== 'undefined') {
              const pharmacy = PharmacyManager.getById(activity.id);
              if (pharmacy) {
                PharmacyManager.showDetail(pharmacy);
              }
            }
          } catch (e) {
            if (CONFIG.DEBUG_MODE) {
              console.warn('지도 이동 실패:', e);
            }
          }
        });
      }
      
      container.appendChild(li);
    });
  },
  
  // ===== 유틸리티 =====
  
  /**
   * 시간 차이 문자열 (Helpers 없을 때 대체 함수)
   * 
   * @param {number} timestamp - milliseconds
   * @returns {string} "5분 전" 등의 문자열
   */
  getTimeAgo(timestamp) {
    const now = Date.now();
    const diff = Math.floor((now - timestamp) / 1000);
    
    if (diff < 60) return '방금 전';
    if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
    return `${Math.floor(diff / 86400)}일 전`;
  },
  
  // ===== 이벤트 리스너 =====
  
  /**
   * 이벤트 리스너 연결
   */
  attachEventListeners() {
    // 활동 지우기 버튼
    const clearBtn = document.getElementById('clear-activity-btn');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        this.clearAll();
      });
    }
    
    // 페이지 로드 시 활동 로그 표시
    setTimeout(() => {
      this.render();
    }, 100);
  }
};

/**
 * 전역 함수: 활동 추가 (하위 호환성)
 * @param {string|Object} item - 활동 내용
 */
function addActivity(item) {
  if (typeof ActivityManager !== 'undefined') {
    ActivityManager.addActivity(item);
  } else if (typeof StorageManager !== 'undefined') {
    StorageManager.addActivity(item);
  }
}

// ===== 초기화 =====
document.addEventListener('DOMContentLoaded', () => {
  ActivityManager.init();
});
