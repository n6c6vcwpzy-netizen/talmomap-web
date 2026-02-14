/* ========================================
   패널 상호작용 기능
   
   패널 드래그, 토글 기능
   ======================================== */

const PanelInteraction = {
  /**
   * 초기 상태 설정 (패널 비활성화 상태)
   */
  setupInitialState() {
    const panel = document.getElementById('side-panel');
    if (panel) {
      // 초기: 패널 닫혀있음 상태
      panel.classList.remove('open');
      panel.setAttribute('inert', '');
      panel.setAttribute('aria-hidden', 'true');
    }
  },
  
  /**
   * 패널 드래그 기능 추가 (모바일)
   */
  setupPanelDrag() {
    const panel = document.getElementById('side-panel');
    if (!panel) return;
    
    let startY = 0;
    let currentY = 0;
    let isDragging = false;
    
    panel.addEventListener('touchstart', (e) => {
      startY = e.touches[0].clientY;
      isDragging = true;
    });
    
    panel.addEventListener('touchmove', (e) => {
      if (!isDragging) return;
      currentY = e.touches[0].clientY - startY;
      if (currentY > 0) {
        panel.style.transform = `translateY(${currentY}px)`;
      }
    });
    
    panel.addEventListener('touchend', () => {
      if (!isDragging) return;
      isDragging = false;
      
      // 100px 이상 아래로 드래그하면 닫기
      if (currentY > 100) {
        this.togglePanel(false);
      } else {
        panel.style.transform = '';
      }
      currentY = 0;
    });
  },
  
  /**
   * 약국 목록 탭 클릭 시 토글
   */
  setupPanelToggle() {
    // 약국 메뉴 버튼에 토글 기능 추가
    const listBtn = document.querySelector('.menu-item[data-page="list"]');
    if (listBtn) {
      listBtn.addEventListener('click', (e) => {
        const panel = document.getElementById('side-panel');
        
        // 이미 열려있으면 닫기
        if (panel && panel.classList.contains('open')) {
          e.preventDefault();
          e.stopPropagation();
          this.togglePanel(false);
        } else {
          // 닫혀있으면 열기
          this.togglePanel(true);
        }
      });
    }
    
    // X 버튼 클릭 시 패널 닫기
    this.setupCloseButton();
  },
  
  /**
   * X 버튼 클릭 이벤트 설정
   */
  setupCloseButton() {
    const closeBtn = document.getElementById('panel-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.togglePanel(false);
      });
    }
  },
  
  /**
   * 패널 열기/닫기 처리
   * 
   * @param {boolean} isOpen - 패널을 열지(true) 닫을지(false) 여부
   */
  togglePanel(isOpen) {
    if (typeof Panel !== 'undefined') {
      if (isOpen) {
        const section = Panel.currentSection || 'list';
        Panel.open(section);
      } else {
        Panel.close();
      }
      return;
    }

    const panel = document.getElementById('side-panel');
    if (!panel) return;

    if (isOpen) {
      // 패널 열기
      panel.classList.add('open');
      panel.style.transform = '';
      panel.style.zIndex = '1000';
      panel.removeAttribute('inert');
      panel.setAttribute('aria-hidden', 'false');
    } else {
      // 패널 닫기
      panel.classList.remove('open');
      panel.style.transform = '';
      panel.style.zIndex = '1000';  // 유지: X 버튼 클릭 가능하게
      panel.setAttribute('inert', '');
      panel.setAttribute('aria-hidden', 'true');
    }
  },
  
  /**
   * 패널 접근성 업데이트 (aria-hidden 관리)
   * 
   * @param {HTMLElement} panel - 패널 요소
   * @param {boolean} isOpen - 패널 열려있는지 여부
   */
  updatePanelAccessibility(panel, isOpen) {
    if (!panel) return;
    
    if (isOpen) {
      // 패널 열 때
      panel.setAttribute('aria-hidden', 'false');
      panel.removeAttribute('inert');
    } else {
      // 패널 닫을 때
      panel.setAttribute('aria-hidden', 'true');
      panel.setAttribute('inert', '');
    }
  },
  
  /**
   * 모든 패널 및 팝업 닫기
   */
  closeAllPanels() {
    // 패널 닫기
    this.togglePanel(false);
    
    // 팝업 닫기
    const popup = document.getElementById('pharmacy-popup');
    if (popup) {
      popup.classList.remove('show');
      popup.style.display = 'none';
    }
  }
};
