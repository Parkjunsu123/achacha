/**
 * 이미지 경로 처리 유틸리티
 * API에서 받아온 이미지 경로를 처리하는 함수들 모음
 */

/**
 * 이미지 경로를 완전한 URL로 변환
 * API에서 반환된 상대 경로를 절대 경로로 변환
 * @param {string|null} imagePath - 이미지 경로 (API에서 반환된 경로)
 * @param {string} defaultImage - 기본 이미지 (경로가 없을 경우 사용할 이미지)
 * @returns {string|object} - 이미지 URL 또는 로컬 이미지 객체
 */
export const getImageUrl = (imagePath, defaultImage = null) => {
  // imagePath가 null, undefined, 빈 문자열인 경우 기본 이미지 반환
  if (!imagePath || imagePath === undefined || imagePath === '') {
    return defaultImage;
  }

  // imagePath가 문자열이 아닌 경우 처리
  if (typeof imagePath !== 'string') {
    // 이미 require된 객체인 경우 그대로 반환
    if (typeof imagePath === 'object' && imagePath !== null) {
      return imagePath;
    }
    // 그 외의 경우 기본 이미지 반환
    return defaultImage;
  }

  // 이미 완전한 URL인 경우 (http:// 또는 https://로 시작하는 경우)
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }

  // API 서버 기본 URL
  const baseUrl = 'https://k12d205.p.ssafy.io';

  // 경로가 슬래시(/)로 시작하지 않으면 추가
  const path = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;

  // 완전한 URL 반환
  return `${baseUrl}${path}`;
};

/**
 * 여러 이미지 경로 처리를 위한 유틸리티 함수
 * @param {Array} images - 이미지 경로 배열
 * @param {object} defaultImage - 기본 이미지
 * @returns {Array} - 처리된 이미지 URL 배열
 */
export const processImageUrls = (images, defaultImage = null) => {
  if (!images || !Array.isArray(images) || images.length === 0) {
    return defaultImage ? [defaultImage] : [];
  }

  return images.map(image => getImageUrl(image, defaultImage));
};
