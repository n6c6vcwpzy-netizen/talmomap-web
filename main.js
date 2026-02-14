/* ========================================
   메인 앱 초기화
   
   모든 모듈을 로드하고, 전역 이벤트
   리스너를 설정합니다.
   
   파일 로드 순서:
   1. config.js
   2. data/*.js
   3. utils/*.js
   4. ui/*.js
   5. map.js
   6. features/*.js
   7. main.js (현재 파일)
   ======================================== */

/**
 * 앱 메인 객체
 */
const App = {
  // ===== 상수 =====
  VERSION: '1.0.0',
  
  // ===== 초기화 =====
  
  /**
   * 전체 앱 초기화
   */
  init() {
    if (CONFIG.DEBUG_MODE) {
      console.log('탈모맵 앱 초기화 중...');
      console.log(`버전: ${this.VERSION}`);
    }
    
    // 초기화 단계
    this.initializeCore();
    this.setupGlobalEvents();
    this.setupPageNavigation();
    
    if (CONFIG.DEBUG_MODE) {
      console.log('✓ 앱 초기화 완료');
    }
  },
  
  /**
   * 핵심 초기화 (데이터, 저장소 등)
   */
  initializeCore() {
    // 지도 초기화 (가장 먼저!)
    if (typeof initMap !== 'undefined') {
      initMap();
    }

    // 위치정보 동의 모달 초기화
    if (typeof ConsentManager !== 'undefined') {
      ConsentManager.init();
    }
    
    // 위치 관리자 초기화
    if (typeof LocationManager !== 'undefined') {
      LocationManager.init();
    }
    
    // 저장소 초기화
    if (typeof StorageManager !== 'undefined') {
      if (CONFIG.DEBUG_MODE) {
        console.log('저장소 초기화...');
      }
    }
    
    // 약국 데이터 검증
    if (typeof validatePharmacies !== 'undefined') {
      if (CONFIG.DEBUG_MODE) {
        const valid = validatePharmacies();
        console.log(`약국 데이터 검증: ${valid ? '✓' : '✗'}`);
      }
    }
    
    // 약물 데이터 검증
    if (typeof validateDrugs !== 'undefined') {
      if (CONFIG.DEBUG_MODE) {
        const valid = validateDrugs();
        console.log(`약물 데이터 검증: ${valid ? '✓' : '✗'}`);
      }
    }
  },
  
  /**
   * 전역 이벤트 리스너 설정
   */
  setupGlobalEvents() {
    // ESC 키: 팝업/패널 닫기
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        // 팝업 닫기
        const popup = document.getElementById('pharmacy-popup');
        if (popup && popup.classList.contains('show')) {
          popup.classList.remove('show');
          popup.style.transform = '';
          popup.style.display = 'none';
        }
        
        // 패널 닫기
        if (typeof Panel !== 'undefined' && Panel.close) {
          Panel.close();
        }
        
        // 약물 이미지 모달 닫기
        const modal = document.getElementById('drug-img-modal');
        if (modal && modal.style.display === 'flex') {
          modal.style.display = 'none';
        }
      }
    });
    
    // 네트워크 상태 변화 감지
    window.addEventListener('online', () => {
      if (CONFIG.DEBUG_MODE) {
        console.log('인터넷 연결됨');
      }
      Toast.success('인터넷 연결되었습니다.');
    });
    
    window.addEventListener('offline', () => {
      if (CONFIG.DEBUG_MODE) {
        console.log('인터넷 연결 끊김');
      }
      Toast.warning('인터넷 연결이 끊어졌습니다.');
    });
  },
  
  /**
   * 페이지 네비게이션 설정 (사이드바 메뉴)
   */
  setupPageNavigation() {
    const menuButtons = document.querySelectorAll('.menu .menu-item');
    
    menuButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const page = btn.dataset.page;
        
        if (!page) {
          return;
        }
        
        // 활성 메뉴 업데이트
        menuButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        // 페이지 전환
        this.navigateTo(page);
      });
    });
  },
  
  /**
   * 특정 페이지로 네비게이션
   * 
   * @param {string} page - 페이지 ID (map, list, activity, subscribe 등)
   */
  navigateTo(page) {
    if (CONFIG.DEBUG_MODE) {
      console.log(`페이지 이동: ${page}`);
    }

    if (typeof PharmacyPopup !== 'undefined' && PharmacyPopup.closePopup) {
      PharmacyPopup.closePopup();
    } else {
      const popup = document.getElementById('pharmacy-popup');
      if (popup) {
        popup.classList.remove('show');
        popup.style.transform = '';
        popup.style.display = 'none';
      }
    }
    
    // 지도 페이지
    if (page === 'map') {
      // 패널 닫기
      if (typeof Panel !== 'undefined' && Panel.close) {
        Panel.close();
      }
      
      // 모든 페이지 섹션 숨김
      document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
      
      // 지도 페이지 표시
      const mapPage = document.getElementById('page-map');
      if (mapPage) {
        mapPage.classList.add('active');
      }
      
      // 지도 리사이즈
      setTimeout(() => {
        try {
          window.dispatchEvent(new Event('resize'));
        } catch (e) {
          // 무시
        }
      }, 300);
    } 
    // 사이드 패널 페이지들
    else if (['list', 'drugs', 'activity', 'subscribe'].includes(page)) {
      // 패널 열기 (섹션별로)
      const sectionMap = {
        'list': 'list',
        'drugs': 'drugs',
        'activity': 'activity',
        'subscribe': 'subscribe'
      };
      
      const section = sectionMap[page] || page;
      
      if (typeof Panel !== 'undefined' && Panel.open) {
        Panel.open(section);
      }
      
      // activity 로드 시 로딩 상태 표시
      if (page === 'activity') {
        const loader = document.querySelector('#panel-activity .panel-loader');
        const list = document.getElementById('activity-list');
        
        if (loader) {
          loader.style.display = 'block';
          if (list) list.style.display = 'none';
          
          // 로딩 완료 시뮬레이션
          setTimeout(() => {
            if (loader) loader.style.display = 'none';
            if (typeof ActivityManager !== 'undefined') {
              ActivityManager.render();
            }
          }, 250);
        }
      }
      
      // subscribe 로드 시 UI 업데이트
      if (page === 'subscribe') {
        if (typeof SubscriptionManager !== 'undefined') {
          SubscriptionManager.renderUI();
        }
      }
    }
  }
};

// ===== 초기화 시작 =====

/**
 * 페이지 로드 완료 후 앱 초기화
 */
function startApp() {
  // 카카오 지도 SDK CORS 경고 억제 (정상 동작이므로 무시)
  const originalWarn = console.warn;
  console.warn = function(...args) {
    if (args[0]?.includes('parser-blocking') || args[0]?.includes('cross site')) {
      return;
    }
    originalWarn.apply(console, args);
  };
  
  // 디버그 모드: 모든 필수 모듈 확인
  if (typeof CONFIG !== 'undefined' && CONFIG.DEBUG_MODE) {
    const requiredModules = [
      { name: 'CONFIG', check: () => typeof CONFIG !== 'undefined' },
      { name: 'StorageManager', check: () => typeof StorageManager !== 'undefined' },
      { name: 'Helpers', check: () => typeof Helpers !== 'undefined' },
      { name: 'Toast', check: () => typeof Toast !== 'undefined' }
    ];
    
    let allLoaded = true;
    requiredModules.forEach(mod => {
      const exists = mod.check();
      if (!exists) {
        console.warn(`경고: ${mod.name} 모듈이 로드되지 않았습니다.`);
        allLoaded = false;
      }
    });
    
    if (!allLoaded) {
      console.warn('일부 모듈이 누락되었지만 앱을 시작합니다.');
    }
  }
  
  // 앱 초기화
  App.init();
}

// DOM 로드 완료 시점에 시작
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startApp);
} else {
  // 이미 로드된 경우
  startApp();
}

// 윈도우 로드 완료 후 최종 정리
window.addEventListener('load', () => {
  if (CONFIG.DEBUG_MODE) {
    console.log('페이지 완전 로드됨');
  }
});
