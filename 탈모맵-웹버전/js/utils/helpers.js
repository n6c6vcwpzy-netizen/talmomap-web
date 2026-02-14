/* ========================================
   공용 헬퍼 함수
   
   전체 앱에서 사용되는 유틸리티 함수들입니다.
   텍스트 포맷, 시간 계산, 거리 표시 등
   ======================================== */

const Helpers = {
  // ===== 시간 포맷 함수 =====
  
  /**
   * 영업시간을 포맷하고 현재 영업 여부를 뱃지로 표시
   * @param {string} hours - 영업시간 (예: "09:00 - 20:00")
   * @returns {string} HTML로 포맷된 영업시간 + 뱃지
   */
  formatHoursWithBadge(hours) {
    if (!hours) {
      return '영업시간: 정보 없음';
    }
    
    // 시간 형식 추출 (09:00 - 20:00 형식)
    const timeMatch = String(hours).match(/(\d{1,2}:\d{2})\s*[-~–]\s*(\d{1,2}:\d{2})/);
    if (!timeMatch) {
      return `영업시간: ${hours}`;
    }
    
    const startTime = timeMatch[1];  // "09:00"
    const endTime = timeMatch[2];     // "20:00"
    
    // 현재 시각
    const now = new Date();
    
    // 시간:분을 분 단위로 변환
    const timeToMinutes = (timeStr) => {
      const [hours, minutes] = timeStr.split(':').map(Number);
      return hours * 60 + minutes;
    };
    
    const startMinutes = timeToMinutes(startTime);
    const endMinutes = timeToMinutes(endTime);
    const nowMinutes = now.getHours() * 60 + now.getMinutes();
    
    // 현재 시각이 영업시간 내인지 확인
    const isOpen = startMinutes <= nowMinutes && nowMinutes <= endMinutes;
    
    // 뱃지 생성
    const badge = isOpen
      ? '<span class="badge-open">영업중</span>'
      : '<span class="badge-closed">영업종료</span>';
    
    return `영업시간: ${startTime} - ${endTime} ${badge}`;
  },
  
  /**
   * 경과 시간을 사람이 읽을 수 있는 형식으로 변환
   * @param {number} timestamp - milliseconds 시간값
   * @returns {string} "방금 전", "5분 전" 등의 문자열
   */
  getTimeAgo(timestamp) {
    const now = Date.now();
    const diffSeconds = Math.floor((now - timestamp) / 1000);
    
    if (diffSeconds < 60) {
      return '방금 전';
    }
    
    const diffMinutes = Math.floor(diffSeconds / 60);
    if (diffMinutes < 60) {
      return `${diffMinutes}분 전`;
    }
    
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) {
      return `${diffHours}시간 전`;
    }
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}일 전`;
  },
  
  // ===== 거리 포맷 함수 =====
  
  /**
   * 미터 단위의 거리를 포맷된 문자열로 변환
   * @param {number} meters - 미터 단위 거리
   * @returns {string} "500m" 또는 "1.5km" 형식
   */
  formatDistance(meters) {
    if (typeof meters !== 'number' || meters < 0) {
      return '거리 계산 불가';
    }
    
    if (meters < 1000) {
      return `${Math.round(meters)}m`;
    }
    
    return `${(meters / 1000).toFixed(1)}km`;
  },
  
  // ===== 숫자 포맷 함수 =====
  
  /**
   * 한국식 통화 포맷 (1000 → "1,000원")
   * @param {number} amount - 금액
   * @returns {string} 포맷된 금액 문자열
   */
  formatCurrency(amount) {
    if (typeof amount !== 'number') {
      return '금액 오류';
    }
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
      minimumFractionDigits: 0
    }).format(amount);
  },
  
  /**
   * 일반 숫자 포맷 (1000 → "1,000")
   * @param {number} num - 숫자
   * @returns {string} 콤마가 포함된 숫자 문자열
   */
  formatNumber(num) {
    if (typeof num !== 'number') {
      return '0';
    }
    return num.toLocaleString('ko-KR');
  },
  
  // ===== 날짜 포맷 함수 =====
  
  /**
   * Date 객체를 한국식 날짜 문자열로 변환
   * @param {Date} date - 날짜 객체
   * @param {boolean} includeTime - 시간도 포함할지 여부
   * @returns {string} "2026년 2월 12일" 또는 "2026년 2월 12일 오후 3:30" 형식
   */
  formatDate(date, includeTime = false) {
    if (!(date instanceof Date) || isNaN(date.getTime())) {
      return '날짜 오류';
    }
    
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    
    let result = `${year}년 ${month}월 ${day}일`;
    
    if (includeTime) {
      const hours = date.getHours();
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const period = hours >= 12 ? '오후' : '오전';
      const displayHours = hours % 12 || 12;
      result += ` ${period} ${displayHours}:${minutes}`;
    }
    
    return result;
  },
  
  // ===== 유효성 검증 함수 =====
  
  /**
   * 전화번호가 유효한 형식인지 확인
   * @param {string} phone - 전화번호
   * @returns {boolean} 유효한지 여부
   */
  isValidPhone(phone) {
    const phoneRegex = /^0\d{1,2}-?\d{3,4}-?\d{4}$/;
    return phoneRegex.test(String(phone).replace(/\s/g, ''));
  },
  
  /**
   * 이메일이 유효한 형식인지 확인
   * @param {string} email - 이메일
   * @returns {boolean} 유효한지 여부
   */
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(String(email).toLowerCase());
  },
  
  /**
   * URL이 유효한지 확인
   * @param {string} url - URL
   * @returns {boolean} 유효한지 여부
   */
  isValidUrl(url) {
    try {
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  },
  
  // ===== 기타 유틸리티 =====
  
  /**
   * 텍스트에서 특수문자 제거
   * @param {string} text - 텍스트
   * @returns {string} 정제된 텍스트
   */
  sanitizeText(text) {
    return String(text).replace(/[<>\"']/g, '');
  },
  
  /**
   * 배열에서 중복 제거
   * @param {Array} arr - 배열
   * @returns {Array} 중복이 제거된 배열
   */
  unique(arr) {
    return [...new Set(arr)];
  },
  
  /**
   * 객체의 키-값을 URL 쿼리 파라미터로 변환
   * @param {Object} params - 파라미터 객체
   * @returns {string} "key1=value1&key2=value2" 형식
   */
  toQueryString(params) {
    if (typeof params !== 'object' || params === null) {
      return '';
    }
    return Object.entries(params)
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
      .join('&');
  },
  
  /**
   * 디바운스 함수 (입력이 멈춘 후 일정 시간 후에 함수 실행)
   * @param {Function} func - 실행할 함수
   * @param {number} delay - 지연 시간 (밀리초)
   * @returns {Function} 디바운스된 함수
   */
  debounce(func, delay = 300) {
    let timeoutId;
    return function (...args) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
  },
  
  /**
   * 쓰로틀 함수 (일정 시간마다 최대 1회만 실행)
   * @param {Function} func - 실행할 함수
   * @param {number} limit - 최소 간격 (밀리초)
   * @returns {Function} 쓰로틀된 함수
   */
  throttle(func, limit = 300) {
    let inThrottle;
    return function (...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }
};
