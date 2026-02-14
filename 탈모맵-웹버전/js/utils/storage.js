/* ========================================
   LocalStorage 관리
   
   활동 로그, 구독 상태, 댓글 등을
   LocalStorage에 저장하고 조회합니다.
   ======================================== */

const StorageManager = {
  // ===== 활동 로그 관리 =====
  
  /**
   * 저장된 모든 활동 로그 조회
   * @returns {Array} 활동 로그 배열
   */
  getActivities() {
    try {
      return JSON.parse(localStorage.getItem('activities') || '[]');
    } catch (e) {
      console.error('활동 로그 읽기 오류:', e);
      return [];
    }
  },
  
  /**
   * 새로운 활동 로그 추가
   * @param {string|Object} item - 활동 내용 (문자열 또는 객체)
   * @returns {Object} 추가된 활동 항목
   */
  addActivity(item) {
    try {
      const activities = this.getActivities();
      // 문자열인 경우 객체로 변환
      const entry = (typeof item === 'string')
        ? { text: item, ts: Date.now() }
        : { ...item, ts: Date.now() };
      
      // 최신 항목을 배열 앞에 추가
      activities.unshift(entry);
      
      // 최대 200개까지만 유지
      if (activities.length > 200) {
        activities.splice(200);
      }
      
      localStorage.setItem('activities', JSON.stringify(activities));
      return entry;
    } catch (e) {
      console.error('활동 로그 저장 오류:', e);
      return null;
    }
  },
  
  /**
   * 모든 활동 로그 삭제
   */
  clearActivities() {
    try {
      localStorage.setItem('activities', JSON.stringify([]));
      if (CONFIG.DEBUG_MODE) console.log('활동 로그 삭제됨');
    } catch (e) {
      console.error('활동 로그 삭제 오류:', e);
    }
  },
  
  // ===== 구독 상태 관리 =====
  
  /**
   * 현재 구독 상태 조회
   * @returns {boolean} 구독 중인지 여부
   */
  isSubscribed() {
    return localStorage.getItem('isSubscribed') === 'true';
  },
  
  /**
   * 구독 상태 설정
   * @param {boolean} value - 구독 상태
   */
  setSubscribed(value) {
    try {
      localStorage.setItem('isSubscribed', value ? 'true' : 'false');
      if (CONFIG.DEBUG_MODE) {
        console.log('구독 상태 변경:', value ? '구독중' : '구독안함');
      }
    } catch (e) {
      console.error('구독 상태 저장 오류:', e);
    }
  },
  
  // ===== 약국별 댓글 관리 =====
  
  /**
   * 약국별 댓글 조회
   * @param {number|string} pharmacyId - 약국 ID
   * @returns {Array} 댓글 배열
   */
  getPharmacyComments(pharmacyId) {
    try {
      const key = `pharmacy_comments_${pharmacyId}`;
      return JSON.parse(localStorage.getItem(key) || '[]');
    } catch (e) {
      console.error('댓글 읽기 오류:', e);
      return [];
    }
  },
  
  /**
   * 약국에 댓글 추가
   * @param {number|string} pharmacyId - 약국 ID
   * @param {string} text - 댓글 내용
   * @returns {Object} 추가된 댓글
   */
  addPharmacyComment(pharmacyId, text) {
    try {
      const key = `pharmacy_comments_${pharmacyId}`;
      const comments = this.getPharmacyComments(pharmacyId);
      const comment = {
        text: text,
        date: new Date().toLocaleString('ko-KR')
      };
      comments.push(comment);
      localStorage.setItem(key, JSON.stringify(comments));
      return comment;
    } catch (e) {
      console.error('댓글 저장 오류:', e);
      return null;
    }
  },
  
  /**
   * 약국의 모든 댓글 삭제
   * @param {number|string} pharmacyId - 약국 ID
   */
  clearPharmacyComments(pharmacyId) {
    try {
      const key = `pharmacy_comments_${pharmacyId}`;
      localStorage.setItem(key, JSON.stringify([]));
    } catch (e) {
      console.error('댓글 삭제 오류:', e);
    }
  },
  
  // ===== 유저 설정 관리 =====
  
  /**
   * 특정 키의 값 저장
   * @param {string} key - 저장할 키
   * @param {any} value - 저장할 값 (자동으로 JSON 변환)
   */
  setData(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error(`데이터 저장 오류 (${key}):`, e);
    }
  },
  
  /**
   * 특정 키의 값 조회
   * @param {string} key - 조회할 키
   * @param {any} defaultValue - 없을 경우 기본값
   * @returns {any} 저장된 값
   */
  getData(key, defaultValue = null) {
    try {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : defaultValue;
    } catch (e) {
      console.error(`데이터 읽기 오류 (${key}):`, e);
      return defaultValue;
    }
  },
  
  /**
   * 모든 localStorage 데이터 초기화 (주의: 되돌릴 수 없음)
   */
  clearAll() {
    if (confirm('모든 저장된 데이터를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      try {
        localStorage.clear();
        if (CONFIG.DEBUG_MODE) console.log('모든 LocalStorage 데이터 삭제됨');
      } catch (e) {
        console.error('모든 데이터 삭제 오류:', e);
      }
    }
  }
};
