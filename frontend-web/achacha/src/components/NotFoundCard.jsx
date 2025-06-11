import React from 'react';

const NotFoundCard = () => {
  return (
    <div className="flex flex-col items-center justify-center p-4 w-full max-w-md mx-auto">
      <div className="text-center">
        <h2 className="text-5xl text-gray-600 leading-tight mb-4">선물 카드를 찾을 수 없습니다.</h2>
        <p className="text-2xl text-gray-400 leading-tight">
          선물 링크를 다시 확인해주세요.
        </p>
      </div>
    </div>
  );
};

export default NotFoundCard; 