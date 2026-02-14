/* ========================================
   위치정보 수집·이용 동의 관리

   최초 1회 동의 모달 표시,
   localStorage 저장 및 UI 제어
   ======================================== */

const ConsentManager = {
  STORAGE_KEY: 'locationConsent',
  modal: null,
  acceptBtn: null,
  declineBtn: null,
  pendingAction: null,

  init() {
    this.modal = document.getElementById('location-consent-modal');
    if (!this.modal) {
      return;
    }

    this.acceptBtn = document.getElementById('consent-accept-btn');
    this.declineBtn = document.getElementById('consent-decline-btn');

    this.bindEvents();
    this.syncState();

    // 초기 상태에 따라 모달 표시
    if (!this.getStatus()) {
      this.show();
    }
  },

  bindEvents() {
    if (this.acceptBtn) {
      this.acceptBtn.addEventListener('click', () => this.accept());
    }

    if (this.declineBtn) {
      this.declineBtn.addEventListener('click', () => this.decline());
    }
  },

  getStatus() {
    try {
      return localStorage.getItem(this.STORAGE_KEY);
    } catch (e) {
      return null;
    }
  },

  hasConsent() {
    return this.getStatus() === 'granted';
  },

  isDenied() {
    return this.getStatus() === 'denied';
  },

  requestConsent(onGranted) {
    if (this.hasConsent()) {
      if (typeof onGranted === 'function') {
        onGranted();
      }
      return;
    }

    this.pendingAction = typeof onGranted === 'function' ? onGranted : null;
    this.show();
  },

  accept() {
    try {
      localStorage.setItem(this.STORAGE_KEY, 'granted');
    } catch (e) {
      // 저장 실패는 무시
    }

    this.hide();
    this.syncState();

    if (typeof Toast !== 'undefined') {
      Toast.success('위치정보 수집·이용에 동의했습니다.');
    }

    if (this.pendingAction) {
      const action = this.pendingAction;
      this.pendingAction = null;
      action();
    }
  },

  decline() {
    try {
      localStorage.setItem(this.STORAGE_KEY, 'denied');
    } catch (e) {
      // 저장 실패는 무시
    }

    this.hide();
    this.syncState();

    if (typeof Toast !== 'undefined') {
      Toast.warning('위치정보 동의를 거부하여 내 위치 기능이 제한됩니다.');
    }

    this.pendingAction = null;
  },

  show() {
    if (!this.modal) {
      return;
    }

    this.modal.classList.add('show');
    this.modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
  },

  hide() {
    if (!this.modal) {
      return;
    }

    this.modal.classList.remove('show');
    this.modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
  },

  syncState() {
    this.updateLocationButtons();
  },

  updateLocationButtons() {
    const locateBtn = document.getElementById('locate-btn');
    if (locateBtn) {
      if (this.hasConsent()) {
        locateBtn.disabled = false;
        locateBtn.classList.remove('is-disabled');
        locateBtn.setAttribute('aria-disabled', 'false');
        locateBtn.title = '내 위치 찾기';
      } else {
        locateBtn.disabled = true;
        locateBtn.classList.add('is-disabled');
        locateBtn.setAttribute('aria-disabled', 'true');
        locateBtn.title = '위치정보 동의 후 사용 가능합니다';
      }
    }
  }
};
