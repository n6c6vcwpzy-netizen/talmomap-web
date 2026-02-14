/* ========================================
   API 호출 모듈
   
   외부 서비스(카카오, 네이버 등)와의
   API 통신을 담당합니다.
   ======================================== */

const API = {
  // ===== 카카오 로컬 API =====
  
  /**
   * 주변 약국 검색 (카카오 로컬 API 사용)
   * 
   * @param {number} lat - 위도
   * @param {number} lng - 경도
   * @param {number} radius - 검색 반경 (기본값: 1000m)
   * @param {number} page - 페이지 번호 (기본값: 1)
   * @param {number} size - 한 페이지 결과 수 (기본값: 15)
   * @returns {Promise<Object>} 검색 결과 (지점 정보 배열 포함)
   */
  async searchNearbyPharmacies(lat, lng, radius = 1000, page = 1, size = 15) {
    // 검색 API URL 생성
    // PM9 = 약국 카테고리 코드
    const url = `https://dapi.kakao.com/v2/local/search/category.json?` +
      `category_group_code=PM9&` +
      `x=${lng}&y=${lat}&` +
      `radius=${radius}&` +
      `sort=distance&` +
      `page=${page}&size=${size}`;
    
    try {
      if (CONFIG.DEBUG_MODE) {
        console.log('[Kakao API] 요청:', url);
      }
      
      // API 요청 (카카오 인증 헤더 포함)
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `KakaoAK ${CONFIG.KAKAO_LOCAL_API_KEY}`
        }
      });
      
      // 응답 상태 확인
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API 오류 [${response.status}]: ${errorText}`);
      }
      
      // JSON 파싱
      const data = await response.json();
      
      if (CONFIG.DEBUG_MODE) {
        console.log('[Kakao API] 응답:', data);
      }
      
      return data;
    } catch (error) {
      console.error('[Kakao API] 오류:', error);
      throw error;
    }
  },
  
  // ===== 약국 영업시간 조회 =====
  
  /**
   * 카카오 지도 장소 페이지에서 영업시간을 추출
   * (CORS 제약으로 인해 best-effort 방식)
   * 
   * @param {string} placeUrl - 카카오 지도 장소 URL
   * @param {number} timeoutMs - 요청 타임아웃 (밀리초)
   * @returns {Promise<string|null>} 영업시간 문자열 또는 null
   */
  async fetchPlaceHours(placeUrl, timeoutMs = 6000) {
    // URL이 없으면 즉시 반환
    if (!placeUrl) {
      return null;
    }
    
    // 타임아웃 구현
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    
    try {
      // 페이지 HTML 요청
      const response = await fetch(placeUrl, {
        signal: controller.signal,
        credentials: 'omit',  // CORS 문제 방지
        mode: 'no-cors'
      });
      
      clearTimeout(timeoutId);
      
      // 상태 확인
      if (!response.ok) {
        if (CONFIG.DEBUG_MODE) {
          console.warn('[영업시간 조회] HTTP 오류:', response.status);
        }
        return null;
      }
      
      // HTML 텍스트 파싱
      const text = await response.text();
      
      // 방법 1: JSON-LD 데이터에서 영업시간 추출
      const jsonLdPattern = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
      const jsonLdMatches = [...text.matchAll(jsonLdPattern)];
      
      for (const match of jsonLdMatches) {
        try {
          const jsonData = JSON.parse(match[1]);
          
          // openingHours 필드 확인
          if (jsonData.openingHours && Array.isArray(jsonData.openingHours)) {
            if (jsonData.openingHours.length > 0) {
              return jsonData.openingHours[0];
            }
          }
          
          // openingHoursSpecification 필드 확인
          if (jsonData.openingHoursSpecification) {
            const spec = jsonData.openingHoursSpecification;
            if (Array.isArray(spec) && spec.length > 0 && spec[0].opens && spec[0].closes) {
              return `${spec[0].opens} - ${spec[0].closes}`;
            }
            if (spec.opens && spec.closes) {
              return `${spec.opens} - ${spec.closes}`;
            }
          }
        } catch (parseError) {
          // JSON 파싱 오류는 무시하고 다음 JSON 시도
          continue;
        }
      }
      
      return null;
    } catch (error) {
      if (error.name === 'AbortError') {
        if (CONFIG.DEBUG_MODE) {
          console.warn('[영업시간 조회] 타임아웃');
        }
      } else {
        if (CONFIG.DEBUG_MODE) {
          console.warn('[영업시간 조회] 오류:', error.message);
        }
      }
      return null;
    }
  },
  
  // ===== 네이버 검색 =====
  
  /**
   * 네이버에서 약국/약물 검색
   * @param {string} query - 검색어
   * @returns {string} 네이버 검색 URL
   */
  getNaverSearchUrl(query) {
    return `https://search.naver.com/search.naver?query=${encodeURIComponent(query)}`;
  },
  
  // ===== 지오코딩 =====
  
  /**
   * 주소를 좌표로 변환 (Kakao 지오코딩 API 사용)
   * 
   * @param {string} address - 주소 문자열
   * @returns {Promise<Object|null>} {lat, lng} 또는 null
   */
  async geocodeAddress(address) {
    if (!address || !CONFIG.KAKAO_LOCAL_API_KEY) {
      return null;
    }
    
    const url = `https://dapi.kakao.com/v2/local/search/address.json?query=${encodeURIComponent(address)}`;
    
    try {
      const response = await fetch(url, {
        headers: {
          'Authorization': `KakaoAK ${CONFIG.KAKAO_LOCAL_API_KEY}`
        }
      });
      
      if (!response.ok) {
        return null;
      }
      
      const data = await response.json();
      
      if (!data.documents || data.documents.length === 0) {
        return null;
      }
      
      const result = data.documents[0];
      return {
        lat: parseFloat(result.y),
        lng: parseFloat(result.x),
        address: result.address_name
      };
    } catch (error) {
      console.error('[지오코딩] 오류:', error);
      return null;
    }
  },
  
  // ===== 에러 처리 =====
  
  /**
   * API 에러 메시지 생성
   * @param {Error} error - 에러 객체
   * @param {string} context - 컨텍스트 (어디서 발생했는지)
   * @returns {string} 사용자 친화적인 에러 메시지
   */
  getErrorMessage(error, context = 'API 호출') {
    if (error.name === 'AbortError') {
      return `${context} 중 타임아웃이 발생했습니다.`;
    }
    
    if (error.message.includes('Failed to fetch')) {
      return '네트워크 연결을 확인해주세요.';
    }
    
    if (error.message.includes('API 오류')) {
      return `${context} 실패: ${error.message}`;
    }
    
    return `${context} 중 오류가 발생했습니다.`;
  }
};

/**
 * fetch 재시도 래퍼 (네트워크 불안정 시 여러 번 시도)
 * @param {Function} fetchFn - fetch 함수
 * @param {number} maxRetries - 최대 재시도 횟수
 * @param {number} delayMs - 재시도 간 대기 시간
 * @returns {Promise<Response>} 응답 또는 에러
 */
async function fetchWithRetry(fetchFn, maxRetries = 3, delayMs = 1000) {
  let lastError;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetchFn();
      if (response.ok) {
        return response;
      }
      lastError = new Error(`HTTP ${response.status}`);
    } catch (error) {
      lastError = error;
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delayMs * (i + 1)));
      }
    }
  }
  
  throw lastError;
}
