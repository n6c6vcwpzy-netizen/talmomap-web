/* ========================================
   구독 기능 관리
   
   구독 상태, UI 업데이트, 결제 시뮬레이션을
   담당합니다.
   ======================================== */

const SubscriptionManager = {
  // ===== 상태 =====
  // 구독 상태 (초기값: LocalStorage에서 로드)
  isSubscribed: StorageManager && StorageManager.isSubscribed ? StorageManager.isSubscribed() : false,
  
  // ===== 초기화 =====
  
  /**
   * 구독 관리자 초기화
   */
  init() {
    this.loadState();
    this.renderUI();
    this.attachEventListeners();
    
    // 이미 구독중이면 구독 패널 숨김
    if (this.isSubscribed) {
      this.hideSubscriptionPanel();
    }
  },
  
  // ===== 상태 관리 =====
  
  /**
   * 저장된 구독 상태 로드
   */
  loadState() {
    if (typeof StorageManager !== 'undefined') {
      this.isSubscribed = StorageManager.isSubscribed();
    }
  },
  
  /**
   * 구독 상태 저장
   * 
   * @param {boolean} subscribed - 구독 여부
   */
  saveState(subscribed) {
    this.isSubscribed = subscribed;
    if (typeof StorageManager !== 'undefined') {
      StorageManager.setSubscribed(subscribed);
    }
  },
  
  // ===== UI 렌더링 =====
  
  /**
   * 현재 구독 상태에 따라 UI 업데이트
   */
  renderUI() {
    // 구독 버튼
    const subscribeBtn = document.getElementById('subscribe-btn');
    // 상태 텍스트
    const statusText = document.querySelector('.status-text');
    // 상태 카드
    const statusCard = document.querySelector('.status-card');
    // 구독 카드 (구독 전)
    const subscribeCard = document.getElementById('panel-subscribe-card');
    // 결제 수단 (구독 전)
    const paymentBlock = document.getElementById('panel-payment-methods');
    // 관리 블록 (구독 후)
    const manageBlock = document.getElementById('panel-management');
    // 패널 상태 표시
    const panelStatus = document.getElementById('panel-sub-status');
    
    if (this.isSubscribed) {
      // ===== 구독중 상태 =====
      if (statusText) statusText.innerText = '구독 중';
      if (statusCard) {
        statusCard.style.borderColor = '#3b82f6';
        statusCard.style.background = '#eff6ff';
      }
      
      if (subscribeBtn) {
        subscribeBtn.innerText = '구독 중';
        subscribeBtn.disabled = true;
        subscribeBtn.style.opacity = '0.6';
      }
      
      if (panelStatus) panelStatus.innerText = '구독 중';
      
      // 구독 전 UI 숨김
      if (subscribeCard) subscribeCard.style.display = 'none';
      if (paymentBlock) paymentBlock.style.display = 'none';
      
      // 구독 후 UI 표시
      if (manageBlock) manageBlock.style.display = 'block';
      
      // 사이드바 배너 업데이트
      const sidebarTrial = document.querySelector('.sidebar .trial-banner');
      if (sidebarTrial) {
        const timeEl = sidebarTrial.querySelector('.time');
        if (timeEl) {
          timeEl.innerText = '구독중';
        }
        sidebarTrial.classList.add('subscribed');
      }
    } else {
      // ===== 미구독 상태 =====
      if (statusText) statusText.innerText = '구독되지 않음';
      if (statusCard) {
        statusCard.style.borderColor = '';
        statusCard.style.background = '';
      }
      
      if (subscribeBtn) {
        subscribeBtn.innerText = '구독하기';
        subscribeBtn.disabled = false;
        subscribeBtn.style.opacity = '1';
      }
      
      if (panelStatus) panelStatus.innerText = '구독되지 않음';
      
      // 구독 전 UI 표시
      if (subscribeCard) subscribeCard.style.display = 'block';
      if (paymentBlock) paymentBlock.style.display = 'block';
      
      // 구독 후 UI 숨김
      if (manageBlock) manageBlock.style.display = 'none';
      
      // 사이드바 배너 업데이트
      const sidebarTrial = document.querySelector('.sidebar .trial-banner');
      if (sidebarTrial) {
        const timeEl = sidebarTrial.querySelector('.time');
        if (timeEl) {
          // 원래 트라이얼 시간 표시
          timeEl.innerText = CONFIG && CONFIG.TRIAL_TIME ? `남은 시간: ${CONFIG.TRIAL_TIME}` : '남은 시간: 23시간 45분';
        }
        sidebarTrial.classList.remove('subscribed');
      }
    }
  },
  
  // ===== 구독/취소 동작 =====
  
  /**
   * 구독 실행
   */
  subscribe() {
    // 구독 상태 변경
    this.saveState(true);
    
    // UI 업데이트
    this.renderUI();
    
    // 구독 패널 숨김
    this.hideSubscriptionPanel();
    
    // 토스트 메시지
    if (typeof Toast !== 'undefined') {
      Toast.success('구독이 완료되었습니다. 감사합니다!');
    } else {
      showToast('구독이 완료되었습니다. 감사합니다!');
    }
    
    // 활동 로그
    if (typeof StorageManager !== 'undefined') {
      StorageManager.addActivity('구독 시작');
    }
    
    if (CONFIG.DEBUG_MODE) {
      console.log('구독 완료');
    }
  },
  
  /**
   * 구독 취소
   */
  cancel() {
    if (!confirm('구독을 취소하시겠습니까?')) {
      return;
    }
    
    // 구독 상태 변경
    this.saveState(false);
    
    // UI 업데이트
    this.renderUI();
    
    // 토스트 메시지
    if (typeof Toast !== 'undefined') {
      Toast.show('구독이 취소되었습니다.');
    } else {
      showToast('구독이 취소되었습니다.');
    }
    
    if (CONFIG.DEBUG_MODE) {
      console.log('구독 취소');
    }
  },
  
  // ===== 패널 관리 =====
  
  /**
   * 구독 패널 숨김
   */
  hideSubscriptionPanel() {
    const panel = document.getElementById('subscription-panel');
    if (!panel) {
      return;
    }
    
    // 이미 숨겨져있으면 반환
    if (panel.style.display === 'none' || panel.classList.contains('hidden')) {
      return;
    }
    
    // 표시 상태 보장
    panel.style.display = 'block';
    
    // 숨김 애니메이션 시작
    requestAnimationFrame(() => {
      panel.classList.add('hidden');
    });
    
    // 애니메이션 완료 후 처리
    const onTransitionEnd = () => {
      panel.style.display = 'none';
      panel.classList.remove('hidden');
      panel.removeEventListener('transitionend', onTransitionEnd);
    };
    
    panel.addEventListener('transitionend', onTransitionEnd);
    
    // 레이아웃 업데이트
    try {
      window.dispatchEvent(new Event('resize'));
    } catch (e) {
      // 무시
    }
  },
  
  // ===== 이벤트 리스너 =====
  
  /**
   * 이벤트 리스너 연결
   */
  attachEventListeners() {
    // 구독 버튼
    const subscribeBtn = document.getElementById('subscribe-btn');
    if (subscribeBtn) {
      subscribeBtn.addEventListener('click', () => {
        this.subscribe();
      });
    }
    
    // 구독 취소 버튼
    const cancelBtn = document.getElementById('cancel-subscribe-btn');
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => {
        this.cancel();
      });
    }
    
    // 결제 수단 변경 버튼
    const changePaymentBtn = document.getElementById('change-payment-btn');
    if (changePaymentBtn) {
      changePaymentBtn.addEventListener('click', () => {
        if (typeof Toast !== 'undefined') {
          Toast.show('결제 수단 변경 화면은 현재 모의 기능입니다.');
        } else {
          showToast('결제 수단 변경 화면은 현재 모의 기능입니다.');
        }
      });
    }
    
    // 결제 수단 선택 버튼들
    document.querySelectorAll('.payment-methods button').forEach(btn => {
      btn.addEventListener('click', () => {
        // 구독 버튼 클릭으로 처리
        if (subscribeBtn) {
          subscribeBtn.click();
        }
      });
    });
    
    // 패널 구독 버튼
    const panelSubscribeBtn = document.getElementById('panel-subscribe-btn');
    if (panelSubscribeBtn) {
      panelSubscribeBtn.addEventListener('click', () => {
        // 구독 완료
        this.subscribe();
        // 패널 닫기
        if (typeof Panel !== 'undefined' && Panel.close) {
          Panel.close();
        }
      });
    }
  }
};

// ===== 초기화 =====
document.addEventListener('DOMContentLoaded', () => {
  SubscriptionManager.init();
});
