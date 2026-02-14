/* ========================================
   토스트 알림 모듈
   
   사용자 알림, 성공/오류 메시지를
   화면 하단에 표시합니다.
   ======================================== */

const Toast = {
  // ===== 상수 =====
  // 기본 표시 시간 (밀리초)
  DEFAULT_TIMEOUT: 3000,
  
  // 타입별 색상 (향후 확장용)
  TYPES: {
    INFO: 'info',
    SUCCESS: 'success',
    ERROR: 'error',
    WARNING: 'warning'
  },
  
  // ===== 토스트 표시 메인 함수 =====
  
  /**
   * 토스트 메시지 표시
   * 
   * @param {string} text - 표시할 메시지
   * @param {number} timeout - 표시 시간 (밀리초, 기본값: 3000)
   * @param {string} type - 토스트 타입 (기본값: 'info')
   */
  show(text, timeout = this.DEFAULT_TIMEOUT, type = this.TYPES.INFO) {
    // DOM 요소 확인
    const toastEl = document.getElementById('toast');
    if (!toastEl) {
      console.error('토스트 요소를 찾을 수 없습니다. HTML에 id="toast" 요소가 있는지 확인하세요.');
      return;
    }
    
    // 메시지 설정
    toastEl.innerText = text;
    
    // 타입에 따른 클래스 설정 (향후 스타일링에 사용)
    toastEl.className = 'toast';
    if (type !== this.TYPES.INFO) {
      toastEl.classList.add(`toast-${type}`);
    }
    
    // 표시
    toastEl.style.display = 'block';
    
    // 애니메이션 트리거를 위해 다음 프레임에서 클래스 추가
    requestAnimationFrame(() => {
      toastEl.classList.add('show');
    });
    
    // 자동 숨김 처리
    const timeoutId = setTimeout(() => {
      this.hide(toastEl);
    }, timeout);
    
    // 클릭으로도 숨김 가능
    const clickHandler = () => {
      clearTimeout(timeoutId);
      this.hide(toastEl);
      toastEl.removeEventListener('click', clickHandler);
    };
    toastEl.addEventListener('click', clickHandler);
  },
  
  /**
   * 성공 토스트 표시
   * @param {string} text - 메시지
   * @param {number} timeout - 표시 시간
   */
  success(text, timeout = this.DEFAULT_TIMEOUT) {
    this.show(text, timeout, this.TYPES.SUCCESS);
  },
  
  /**
   * 오류 토스트 표시
   * @param {string} text - 메시지
   * @param {number} timeout - 표시 시간
   */
  error(text, timeout = this.DEFAULT_TIMEOUT) {
    this.show(text, timeout, this.TYPES.ERROR);
  },
  
  /**
   * 경고 토스트 표시
   * @param {string} text - 메시지
   * @param {number} timeout - 표시 시간
   */
  warning(text, timeout = this.DEFAULT_TIMEOUT) {
    this.show(text, timeout, this.TYPES.WARNING);
  },
  
  // ===== 토스트 숨김 함수 =====
  
  /**
   * 토스트 메시지 숨김
   * @param {HTMLElement} toastEl - 토스트 요소 (지정하지 않으면 자동 탐색)
   */
  hide(toastEl = null) {
    const element = toastEl || document.getElementById('toast');
    if (!element) return;
    
    // show 클래스 제거
    element.classList.remove('show');
    
    // 애니메이션 완료 후 display 숨김
    setTimeout(() => {
      element.style.display = 'none';
    }, 200);  // CSS 전환 애니메이션 시간과 맞춤
  },
  
  /**
   * 모든 토스트 숨김
   */
  hideAll() {
    const allToasts = document.querySelectorAll('.toast');
    allToasts.forEach(toast => this.hide(toast));
  }
};

// 전역 함수로도 접근 가능하게 (하위 호환성)
function showToast(text, timeout = 3000) {
  Toast.show(text, timeout);
}
