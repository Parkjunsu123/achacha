// KakaoBridge.jsx
import React, { useEffect } from 'react';

const KakaoBridge = () => {
  useEffect(() => {
    // URL에서 code 파라미터 추출
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');

    // 딥링크 호출
    window.location.href = `achacha://sharebox?code=${code}`;

    // 앱스토어 이동 코드 제거됨
  }, []);

  return (
    <div style={{ textAlign: 'center', marginTop: 80 }}>
      <p>아차차</p>
    </div>
  );
};

export default KakaoBridge;