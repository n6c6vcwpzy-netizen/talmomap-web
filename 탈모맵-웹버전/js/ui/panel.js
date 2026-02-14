/* ========================================
   사이드 패널 관리
   
   사이드 패널(오른쪽)의 열기, 닫기,
   섹션 전환 등의 동작을 담당합니다.
   ======================================== */

const Panel = {
  // ===== 상태 =====
  isOpen: false,
  currentSection: null,
  panelShifted: 0,  // 지도 팬 이동 거리
  
  // ===== 패널 열기 =====
  
  /**
   * 사이드 패널을 특정 섹션을 표시하며 열기
   * 
   * @param {string} sectionId - 표시할 섹션 ID (예: 'detail', 'list', 'activity' 등)
   */
  open(sectionId = 'list') {
    const sidePanel = document.getElementById('side-panel');
    if (!sidePanel) {
      console.error('사이드 패널 요소가 없습니다.');
      return;
    }

    
    // ===== 모든 섹션 숨김 =====
    document.querySelectorAll('.panel-section').forEach(section => {
      section.style.display = 'none';
      section.classList.remove('active');
    });
    
    // ===== 선택된 섹션만 표시 =====
    const targetSection = document.getElementById(`panel-${sectionId}`);
    if (targetSection) {
      targetSection.style.display = 'block';
      targetSection.classList.add('active');
      this.currentSection = sectionId;
    }
    
    // ===== 패널 표시 =====
    sidePanel.classList.add('open');
    sidePanel.setAttribute('aria-hidden', 'false');
    sidePanel.removeAttribute('inert');
    sidePanel.style.transform = '';
    
    // ===== 배경 스크롤 비활성화 (모바일) =====
    document.body.classList.add('modal-open');
    
    // 지도 이동 비활성화 (탭 열림 시 지도 고정)
    this.panelShifted = 0;
    
    if (CONFIG.DEBUG_MODE) {
      console.log(`패널 열기: ${sectionId}`);
    }
  },
  
  // ===== 패널 닫기 =====
  
  /**
   * 사이드 패널을 닫기
   */
  close() {
    const sidePanel = document.getElementById('side-panel');
    if (!sidePanel) {
      console.error('사이드 패널 요소가 없습니다.');
      return;
    }
    
    // 이미 닫혀있으면 반환
    if (!sidePanel.classList.contains('open')) {
      return;
    }
    
    // ===== 패널 숨김 =====
    sidePanel.classList.remove('open');
    sidePanel.setAttribute('aria-hidden', 'true');
    sidePanel.setAttribute('inert', '');
    sidePanel.style.transform = '';
    
    // ===== 모든 섹션 숨김 =====
    document.querySelectorAll('.panel-section').forEach(section => {
      section.style.display = 'none';
      section.classList.remove('active');
    });
    
    // ===== 배경 스크롤 활성화 =====
    document.body.classList.remove('modal-open');
    
    // 지도 이동 비활성화 (닫힘 시에도 지도 고정)
    this.panelShifted = 0;
    
    this.currentSection = null;
    this.isOpen = false;
    
    if (CONFIG.DEBUG_MODE) {
      console.log('패널 닫음');
    }
  },
  
  // ===== 섹션 전환 =====
  
  /**
   * 패널 내에서 섹션을 전환
   * 
   * @param {string} sectionId - 이동할 섹션 ID
   */
  switchSection(sectionId) {
    // 모든 섹션 숨김
    document.querySelectorAll('.panel-section').forEach(section => {
      section.style.display = 'none';
      section.classList.remove('active');
    });
    
    // 선택된 섹션만 표시
    const targetSection = document.getElementById(`panel-${sectionId}`);
    if (targetSection) {
      targetSection.style.display = 'block';
      targetSection.classList.add('active');
      this.currentSection = sectionId;
    }
  },
  
  // ===== 토글 =====
  
  /**
   * 패널을 토글 (열려있으면 닫고, 닫혀있으면 열기)
   * 
   * @param {string} sectionId - 열 때 표시할 섹션 ID
   */
  toggle(sectionId = 'list') {
    const sidePanel = document.getElementById('side-panel');
    if (!sidePanel) {
      return;
    }
    
    if (sidePanel.classList.contains('open')) {
      this.close();
    } else {
      this.open(sectionId);
    }
  }
};

// ===== 패널 닫기 버튼 이벤트 =====
document.addEventListener('DOMContentLoaded', () => {
  const closeBtn = document.getElementById('panel-close');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      Panel.close();
    });
  }
  
  // ESC 키로 패널 닫기
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      Panel.close();
    }
  });
});
