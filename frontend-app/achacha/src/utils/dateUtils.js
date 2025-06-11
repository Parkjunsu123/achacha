/**
 * 주어진 만료일로부터 오늘까지의 디데이 계산 함수
 */
export const calculateDday = expiryDate => {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // 시간, 분, 초, 밀리초를 0으로 설정하여 날짜만 비교

  const expiry = new Date(expiryDate);
  expiry.setHours(0, 0, 0, 0); // 시간, 분, 초, 밀리초를 0으로 설정하여 날짜만 비교

  const diffTime = expiry.getTime() - today.getTime(); // 두 날짜 간의 시간 차이
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // 시간 차이를 일수로 변환

  return diffDays > 0 ? `D-${diffDays}` : '만료됨';
};
