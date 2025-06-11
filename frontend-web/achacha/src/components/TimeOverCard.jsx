import React, { useEffect, useRef } from 'react';
import lottie from 'lottie-web';
import timeOverAnimation from '../assets/time_over.json';

const TimeOverCard = () => {
  const animationContainer = useRef(null);

  useEffect(() => {
    if (animationContainer.current) {
      const anim = lottie.loadAnimation({
        container: animationContainer.current,
        renderer: 'svg',
        loop: true,
        autoplay: true,
        animationData: timeOverAnimation
      });

      return () => anim.destroy();
    }
  }, []);

  return (
    <div className="flex flex-col items-center justify-center p-4 w-full max-w-md mx-auto">
        {/* 애니메이션 컨테이너 */}
        <div className="w-16 h-16 mb-2">
        <div ref={animationContainer} className="w-16 h-16" />
        </div>

        {/* 텍스트 컨테이너 */}
        <div className="text-center">
        <h2 className="text-6xl text-[#278CCC] mb-0 leading-[1]">아차차!</h2>
        <h2 className="text-[180px] text-gray-600 leading-[1] mb-2">지금은 선물 확인이 어려워요.</h2>
        <p className="text-4xl text-gray-400 leading-tight">선물 링크는 24시간 동안만 유효해요.</p>
        </div>
    </div>
  );
};

export default TimeOverCard; 