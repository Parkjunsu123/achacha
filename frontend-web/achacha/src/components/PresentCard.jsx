import React, { useState, useRef, useEffect } from 'react';
import { isMobile, isTablet } from 'react-device-detect';

// SCSS 변수값에 해당하는 상수 정의
const colorEnv = '#0077B2';
const colorEnv2 = '#006A9E'; // darken($color-env, 3%)
const colorFlap = '#004466'; // darken($color-env, 20%)
const colorBg = '#D9EFFF';   // 사용자가 최종적으로 요청한 body 배경색
const colorHeart = '#D00000';

const envBorderRadius = '6px';
const envWidth = '280px';
const envHeight = '180px';
const heartWidth = '50px';

const halfEnvWidth = '140px'; // $env-width / 2
const halfEnvHeight = '90px'; // $env-height / 2
const flapBorderBottomWidth = 'calc(180px / 2 - 8px)'; // calc(${halfEnvHeight} - 8px) -> 82px
const flapBorderTopWidth = 'calc(180px / 2 + 8px)';    // calc(${halfEnvHeight} + 8px) -> 98px
const letterTransformY = '-60px'; // -(180px / 3)

// --- 컨페티 관련 설정 ---
const confettiColors = ['#3788c7', '#f298be', '#f6e25b', '#8a5bac', '#00a944', '#ec2a28', '#43c4c0', '#f4b92f'];
const initialConfettiCount = 50; // 초기 터지는 컨페티 수 (150 -> 50으로 줄임)
const maxConfettiParticles = 200; // 최대 컨페티 입자 수 (600 -> 200으로 줄임)

// 컨페티 입자 생성 함수 (컴포넌트 외부에 정의)
const createConfettiParticle = (x, y, i, minVelocity, canvasWidth) => {
  const angle = Math.random() * (Math.PI * 2);
  const amount = Math.random() * 8.0 + (minVelocity * 0.7);
  const vx = Math.sin(angle) * amount;
  const vy = Math.cos(angle) * amount * 0.5 + (Math.random() * 2 + 1);

  return {
    x: x,
    y: y,
    vx: vx,
    vy: vy,
    width: (Math.random() * 15) + 8,
    height: (Math.random() * 20) + 8,
    color: confettiColors[i % confettiColors.length],
    circle: (Math.random() > 0.8),
    rotate: Math.random() * 360,
    direction: (Math.random() * 10) - 5,
    fallSpeed: (Math.random() / 12) + 0.08,
  };
};
// --- 컨페티 관련 설정 끝 ---

function PresentCard({ presentCard }) {
  // 애니메이션 상태
  const [showEnvelope, setShowEnvelope] = useState(true);
  const [isEnvelopeOpen, setIsEnvelopeOpen] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  // 로딩 상태 추가
  const [isLoading, setIsLoading] = useState(true);
  
  // 화면 크기 감지를 위한 상태
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);
  
  // 기존 PresentCard 상태
  const [showFullMessage, setShowFullMessage] = useState(false);
  const messageRef = useRef(null);
  const [isLongMessage, setIsLongMessage] = useState(false);

  // --- 컨페티 상태 및 Ref ---
  const [runConfetti, setRunConfetti] = useState(false);
  const confettiCanvasRef = useRef(null);
  const animationFrameIdRef = useRef(null);
  const confettiItemsRef = useRef([]);
  const confettiGenStartTimeRef = useRef(0);
  // --- 컨페티 상태 및 Ref 끝 ---

  // 리소스 프리로딩을 위한 상태
  const [imagesLoaded, setImagesLoaded] = useState(false);
  
  // --- Body 배경색 설정 및 해제 ---
  useEffect(() => {
    const originalBodyColor = document.body.style.backgroundColor;
    document.body.style.backgroundColor = colorBg;

    return () => {
      document.body.style.backgroundColor = originalBodyColor; // 컴포넌트 언마운트 시 원래 색으로 복원
    };
  }, []); // 마운트 시 한 번만 실행

  // 이미지 프리로딩 로직
  useEffect(() => {
    if (!presentCard) return;

    const imagesToLoad = [];
    let loadedCount = 0;
    
    // 편지봉투가 표시되는 동안 기프티콘과 템플릿 이미지를 미리 로드
    if (presentCard.gifticonOriginalPath) {
      const img1 = new Image();
      img1.src = presentCard.gifticonOriginalPath;
      imagesToLoad.push(img1);
      img1.onload = () => {
        loadedCount++;
        if (loadedCount >= imagesToLoad.length) setImagesLoaded(true);
      };
      img1.onerror = () => {
        loadedCount++;
        if (loadedCount >= imagesToLoad.length) setImagesLoaded(true);
      };
    }
    
    if (presentCard.gifticonThumbnailPath) {
      const img2 = new Image();
      img2.src = presentCard.gifticonThumbnailPath;
      imagesToLoad.push(img2);
      img2.onload = () => {
        loadedCount++;
        if (loadedCount >= imagesToLoad.length) setImagesLoaded(true);
      };
      img2.onerror = () => {
        loadedCount++;
        if (loadedCount >= imagesToLoad.length) setImagesLoaded(true);
      };
    }
    
    if (presentCard.templateCardPath) {
      const img3 = new Image();
      img3.src = presentCard.templateCardPath;
      imagesToLoad.push(img3);
      img3.onload = () => {
        loadedCount++;
        if (loadedCount >= imagesToLoad.length) setImagesLoaded(true);
      };
      img3.onerror = () => {
        loadedCount++;
        if (loadedCount >= imagesToLoad.length) setImagesLoaded(true);
      };
    }
    
    // 이미지가 없거나 모두 로딩 실패해도 계속 진행
    if (imagesToLoad.length === 0) {
      setImagesLoaded(true);
    }
  }, [presentCard]);

  // 초기 로딩 상태 처리
  useEffect(() => {
    // 리소스 및 애니메이션 준비를 위한 짧은 지연
    const loadingTimer = setTimeout(() => {
      if (imagesLoaded) {
        setIsLoading(false);
      } else {
        // 이미지가 아직 로딩 중이면 추가 확인
        const checkImagesLoaded = setInterval(() => {
          if (imagesLoaded) {
            setIsLoading(false);
            clearInterval(checkImagesLoaded);
          }
        }, 100);
        
        // 최대 3초까지만 기다림
        setTimeout(() => {
          clearInterval(checkImagesLoaded);
          setIsLoading(false);
        }, 3000);
        
        return () => clearInterval(checkImagesLoaded);
      }
    }, 500); // 시간을 300ms에서 500ms로 늘려 충분한 로딩 시간 확보

    return () => clearTimeout(loadingTimer);
  }, [imagesLoaded]);

  // 애니메이션 로직
  useEffect(() => {
    if (isLoading) return; // 로딩 중일 때는 애니메이션 시작하지 않음
    
    const openTimer = setTimeout(() => {
      setIsEnvelopeOpen(true);
    }, 100); // 약간의 딜레이 후 열기 시작

    const transitionStartTimer = setTimeout(() => {
      setIsTransitioning(true);
    }, 3000); // 3초 후 페이드아웃 시작

    const switchTimer = setTimeout(() => {
      setShowEnvelope(false);
      setIsTransitioning(false);
    }, 3500); // 3.5초 후 카드 내용 표시

    return () => {
      clearTimeout(openTimer);
      clearTimeout(transitionStartTimer);
      clearTimeout(switchTimer);
    };
  }, [isLoading]); // isLoading 의존성 추가

  // 메시지 길이 감지 로직
  useEffect(() => {
    if (!showEnvelope && messageRef.current && presentCard?.presentCardMessage) {
      const lineHeight = parseInt(getComputedStyle(messageRef.current).lineHeight, 10) || 24;
      const messageHeight = messageRef.current.clientHeight;
      const lines = messageHeight / lineHeight;
      setIsLongMessage(lines > 3);
    }
  }, [showEnvelope, presentCard?.presentCardMessage, showFullMessage]); // showFullMessage 추가하여 모달 닫힐 때 재계산

  // --- 컨페티 시작/중지 로직 ---
  useEffect(() => {
    if (!showEnvelope) { // 편지봉투 애니메이션 끝나고 카드 보일 때
      setRunConfetti(true);
      confettiGenStartTimeRef.current = Date.now(); // 새 입자 생성 시작 시간 기록

      const confettiTimer = setTimeout(() => {
        setRunConfetti(false);
      }, 5000); // 5초 후 컨페티 중지

      return () => clearTimeout(confettiTimer);
    }
  }, [showEnvelope]);
  // --- 컨페티 시작/중지 로직 끝 ---

  // --- 컨페티 애니메이션 효과 ---
  useEffect(() => {
    if (!runConfetti || !confettiCanvasRef.current) {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
        animationFrameIdRef.current = null;
      }
      if (confettiCanvasRef.current) {
        const canvas = confettiCanvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
      confettiItemsRef.current = []; // 입자 배열 초기화
      return;
    }

    const canvas = confettiCanvasRef.current;
    const ctx = canvas.getContext('2d');
    let canvasWidth = window.innerWidth;
    let canvasHeight = window.innerHeight;
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    // 초기 입자 생성
    if (confettiItemsRef.current.length === 0) {
        // 모바일 환경에서는 입자 수 줄이기
        const particleCount = (isMobile || screenWidth < 768) ? Math.floor(initialConfettiCount / 2) : initialConfettiCount;
        for (let i = 0; i < particleCount; i++) {
            confettiItemsRef.current.push(
              createConfettiParticle(canvasWidth / 2, canvasHeight / 3, i, 10, canvasWidth)
            );
        }
    }
    
    let lastTime = Date.now();

    const renderConfettiFrame = () => {
      if (!runConfetti && confettiItemsRef.current.length === 0) { // 이미 중지되었고 입자도 없으면 루프 종료
        if (animationFrameIdRef.current) cancelAnimationFrame(animationFrameIdRef.current);
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        return;
      }

      const currentTime = Date.now();
      const deltaTime = (currentTime - lastTime) / (1000 / 60); // 60FPS 기준 delta
      lastTime = currentTime;

      ctx.clearRect(0, 0, canvasWidth, canvasHeight);

      // 추가 입자 생성 (처음 2초 동안)
      if (runConfetti && currentTime - confettiGenStartTimeRef.current < 2000) {
        if (confettiItemsRef.current.length < maxConfettiParticles) {
          // 모바일 환경에서는 프레임당 생성 입자 수 줄이기
          const newParticlesPerFrame = (isMobile || screenWidth < 768) ? 1 : 2;
          for (let k = 0; k < newParticlesPerFrame; k++) {
            confettiItemsRef.current.push(
              createConfettiParticle(Math.random() * canvasWidth, -20, confettiItemsRef.current.length, 10, canvasWidth)
            );
          }
        }
      }
      
      let activeParticles = 0;
      confettiItemsRef.current.forEach((item) => {
        if (item.y > canvasHeight + item.height * 2 && item.vy > 0) { // 화면 아래로 사라진 입자는 건너뛰기 (배열에서 제거는 복잡하므로)
             if (!runConfetti) { // 중지 명령 후 화면 밖으로 나간 입자는 그냥 두어 자연스럽게 사라지도록
                // confettiItemsRef.current.splice(index, 1); // runConfetti false면 더이상 추가 안되므로 그냥두면 됨.
             }
             // return; // 활성 입자 카운트에서 제외
        } else {
            activeParticles++;
        }


        item.vx *= (1.0 - 0.02 * deltaTime); // X축 공기저항/감속 (레퍼런스보다 약간 줄임)
        item.vy += (deltaTime * item.fallSpeed); // 중력
        // item.vy /= (1.0 + 0.05 * deltaTime); // Y축 감속 (레퍼런스 스타일, 필요시 활성화)

        item.x += (deltaTime * item.vx);
        item.y += (deltaTime * item.vy);
        item.rotate += (deltaTime * item.direction);

        ctx.fillStyle = item.color;
        if (item.circle) {
          ctx.beginPath();
          ctx.arc(item.x, item.y, item.width / 2, 0, 2 * Math.PI);
          ctx.fill();
          ctx.closePath();
        } else {
          ctx.save();
          ctx.translate(item.x, item.y);
          ctx.rotate(item.rotate * Math.PI / 180);
          ctx.fillRect(-item.width / 2, -item.height / 2, item.width, item.height);
          ctx.restore();
        }
      });

      // runConfetti가 false가 되었고, 모든 입자가 화면 밖으로 나갔거나 매우 적으면 최종 정리
      if (!runConfetti && activeParticles === 0 && confettiItemsRef.current.length > 0) {
          confettiItemsRef.current = []; // 모든 입자 제거
          ctx.clearRect(0,0, canvasWidth, canvasHeight);
          if(animationFrameIdRef.current) cancelAnimationFrame(animationFrameIdRef.current);
          return;
      }
      
      // runConfetti가 true이거나, false라도 아직 활성 입자가 있으면 계속 애니메이션
      if (runConfetti || activeParticles > 0) {
        animationFrameIdRef.current = requestAnimationFrame(renderConfettiFrame);
      } else {
        ctx.clearRect(0,0,canvasWidth,canvasHeight); // 모든 애니메이션 종료 후 최종 클리어
        confettiItemsRef.current = [];
      }
    };

    renderConfettiFrame();

    const handleResize = () => {
      canvasWidth = window.innerWidth;
      canvasHeight = window.innerHeight;
      if (canvas) {
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
      // 컴포넌트 언마운트 시 클린업
      if(ctx) {
        ctx.clearRect(0,0,canvasWidth,canvasHeight);
      }
      confettiItemsRef.current = [];
    };
  }, [runConfetti]); // runConfetti 상태에 따라 이 효과를 재실행
  // --- 컨페티 애니메이션 효과 끝 ---

  // 화면 크기 변경 감지
  useEffect(() => {
    const handleWindowResize = () => {
      setScreenWidth(window.innerWidth);
    };
    
    window.addEventListener('resize', handleWindowResize);
    
    return () => {
      window.removeEventListener('resize', handleWindowResize);
    };
  }, []);
  
  // 템플릿 내 컴포넌트 위치 계산 함수
  const calculateTopPosition = () => {
    if (screenWidth < 460) {
      // 스크린 너비가 460px 미만일 때는 top 값을 줄임
      return 150
    } else if (screenWidth < 600) {
      // 600px 미만일 때는 중간 위치
      return 145;
    } else {
      // 그 이상일 때는 기존 값 유지
      return 150;
    }
  };
  
  // 스케일링 수치 계산 (반응형을 위한 비율 조정)
  const calculateScaling = () => {
    if (screenWidth < 360) {
      return 0.85; // 매우 작은 화면
    } else if (screenWidth < 460) {
      return 0.9; // 작은 화면
    } else {
      return 1; // 기본 크기
    }
  };
  
  // 화면 너비에 따른 템플릿 내 요소들의 여백 및 크기 조정
  const getResponsiveStyles = () => {
    // 모바일 환경에서는 더 컴팩트한 스타일 적용
    return {
      messageContainerStyle: {
        width: `${screenWidth < 460 ? '85%' : '80%'}`,
        marginTop: `${screenWidth < 460 ? '0%' : '5%'}`,
        padding: `${screenWidth < 460 ? '12px' : '20px'}`,
        minHeight: `${screenWidth < 460 ? '70px' : '90px'}`,
        height: `${screenWidth < 460 ? '70px' : '90px'}`,
      },
      gifticonContainerStyle: {
        width: `${screenWidth < 460 ? '85%' : '80%'}`,
        marginTop: `${screenWidth < 460 ? '5px' : '10px'}`,
        padding: `${screenWidth < 460 ? '8px' : '10px'}`,
      },
      thumbnailSize: {
        width: `${screenWidth < 460 ? '65px' : '80px'}`,
        marginBottom: `${screenWidth < 460 ? '5px' : '10px'}`
      },
      buttonStyle: {
        height: `${screenWidth < 460 ? '30px' : '35px'}`,
        padding: `${screenWidth < 460 ? '8px' : '12px'}`,
      },
      dividerStyle: {
        margin: `${screenWidth < 460 ? '5px 0' : '10px 0'}`
      },
      expiryContainerStyle: {
        margin: `${screenWidth < 460 ? '8px auto' : '15px auto'}`,
        padding: `${screenWidth < 460 ? '6px 10px' : '8px 12px'}`,
      },
      modalStyle: {
        padding: `${screenWidth < 460 ? '20px' : '30px'}`,
        width: `${screenWidth < 460 ? '95%' : '90%'}`,
        maxWidth: `${screenWidth < 460 ? '320px' : '500px'}`,
        borderRadius: `${screenWidth < 460 ? '12px' : '16px'}`,
      }
    };
  };

  // 로딩 중이면 빈 div 반환 (화면에 아무것도 보이지 않음)
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: colorBg }}>
        <style>
          {`
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
            .loader {
              width: 50px;
              height: 50px;
              border-radius: 50%;
              border: 3px solid rgba(0, 0, 0, 0.1);
              border-top-color: ${colorEnv};
              animation: spin 1s linear infinite;
            }
          `}
        </style>
        <div className="loader"></div>
      </div>
    );
  }

  // 편지봉투 애니메이션 JSX
  if (showEnvelope) {
    return (
      <>
        <style>{`
          /* Envelope specific styles */
          .envelope-container {
            font-family: 'Pretendard', sans-serif;
            background-color: ${colorBg};
            opacity: ${isTransitioning ? '0' : '1'};
            transition: opacity 0.5s ease-out;
          }
          #envelope {
            position: relative;
            width: ${envWidth};
            height: ${envHeight};
            border-bottom-left-radius: ${envBorderRadius};
            border-bottom-right-radius: ${envBorderRadius};
            margin-left: auto;
            margin-right: auto;
            top: 150px;
            background-color: ${colorFlap}; /* $color-flap */
            box-shadow: 0 4px 20px rgba(0,0,0,.2);
          }
          .front { 
            position: absolute;
            width: 0;
            height: 0;
            z-index: 30;
          }
          .flap {
            border-left: ${halfEnvWidth} solid transparent;
            border-right: ${halfEnvWidth} solid transparent;
            border-bottom: ${flapBorderBottomWidth} solid transparent;
            border-top: ${flapBorderTopWidth} solid ${colorFlap}; /* $color-flap */
            transform-origin: top;
            pointer-events: none;
          }
          .pocket {
            border-left: ${halfEnvWidth} solid ${colorEnv}; /* $color-env */
            border-right: ${halfEnvWidth} solid ${colorEnv}; /* $color-env */
            border-bottom: ${halfEnvHeight} solid ${colorEnv2}; /* $color-env2 */
            border-top: ${halfEnvHeight} solid transparent;
            border-bottom-left-radius: ${envBorderRadius};
            border-bottom-right-radius: ${envBorderRadius};
          }
          .letter {
            position: relative;
            background-color: #fff;
            width: 90%;
            margin-left: auto;
            margin-right: auto;
            height: 90%;
            top: 5%;
            border-radius: ${envBorderRadius};
            box-shadow: 0 2px 26px rgba(0,0,0,.12);
          }
          .letter:after {
            content: '';
            position: absolute;
            top: 0;
            bottom: 0;
            left: 0;
            right: 0;
            background-image: 
                linear-gradient(180deg, 
                rgba(255,255,255,0.00) 25%, 
                rgba(215,227,239,0.70) 55%, 
                rgba(215,227,239,1.00) 100%);
          }
          .words {
            position: absolute;
            left: 10%;
            width: 80%;
            height: 14%;
            background-color: #EEEFF0;
          }
          .words.line1 { top: 15%; width: 20%; height: 7%; }
          .words.line2 { top: 30%; }
          .words.line3 { top: 50%; }
          .words.line4 { top: 70%; }

          #envelope.open .flap {
            transform: rotateX(180deg);
            transition: transform .4s ease, z-index .6s;
            z-index: 10;
          }
          #envelope.close .flap {
            transform: rotateX(0deg);
            transition: transform .4s .6s ease, z-index 1s;
            z-index: 50;
          }
          #envelope.close .letter {
            transform: translateY(0px); 
            transition: transform .4s ease, z-index 1s;
            z-index: 10;
          }
          #envelope.open .letter {
            transform: translateY(${letterTransformY});
            transition: transform .4s .6s ease, z-index .6s;
            z-index: 20;
          }
          .hearts {
            position: absolute;
            top: ${halfEnvHeight};
            left: 0;
            right: 0;
            z-index: 20;
          }
          .heart {
            position: absolute;
            bottom: 0;
            right: 10%;
            pointer-events: none;
          }
          .heart:before,
          .heart:after {
            position: absolute;
            content: "";
            left: ${heartWidth};
            top: 0;
            width: ${heartWidth};
            height: calc(${heartWidth} * 1.6); /* 80px */
            background: ${colorHeart}; /* $color-heart */
            border-radius: ${heartWidth} ${heartWidth} 0 0;
            transform: rotate(-45deg);
            transform-origin: 0 100%;
          }
          .heart:after {
            left: 0;
            transform: rotate(45deg);
            transform-origin: 100% 100%;
          }
          #envelope.close .heart {
            opacity: 0;
            animation: none;
          }
          #envelope.open .heart.a1 {
            left: 20%;
            transform: scale(0.6);
            opacity: 1;
            animation: одиночнаяАнимацияПодъема 4s linear 1, анимацияПокачивания 2s ease-in-out 4 alternate; /* Renamed for clarity */
            animation-fill-mode: forwards;
            animation-delay: .7s;
          }
          #envelope.open .heart.a2 {
            left: 55%;
            transform: scale(1);
            opacity: 1;
            animation: одиночнаяАнимацияПодъема 5s linear 1, анимацияПокачивания 4s ease-in-out 2 alternate;
            animation-fill-mode: forwards;
            animation-delay: .7s;
          }
          #envelope.open .heart.a3 {
            left: 10%;
            transform: scale(0.8);
            opacity: 1;
            animation: одиночнаяАнимацияПодъема 7s linear 1, анимацияПокачивания 2s ease-in-out 6 alternate; 
            animation-fill-mode: forwards;
            animation-delay: .7s;
          }

          @keyframes одиночнаяАнимацияПодъема { /* slideUp */
              0% { top: 0; }
              100% { top: -600px; }
          }
          @keyframes анимацияПокачивания { /* sideSway */
              0% { margin-left: 0px; }
              100% { margin-left: 50px; }
          }
        `}</style>
        <div className="min-h-screen flex flex-col items-center justify-center p-4 envelope-container">
          <div className="envlope-wrapper h-[380px]"> {/* Approx envHeight + 200px */}
              <div id="envelope" className={isEnvelopeOpen ? 'open' : 'close'}>
                  <div className="front flap"></div>
                  <div className="front pocket"></div>
                  <div className="letter">
                      <div className="words line1"></div>
                      <div className="words line2"></div>
                      <div className="words line3"></div>
                      <div className="words line4"></div>
                  </div>
                  <div className="hearts">
                      <div className="heart a1"></div>
                      <div className="heart a2"></div>
                      <div className="heart a3"></div>
                  </div>
              </div>
          </div>
        </div>
      </>
    );
  }

  if (!presentCard) {
    console.error('PresentCard: 전달받은 데이터가 없습니다.');
    return <div className="min-h-screen flex items-center justify-center p-4" style={{ fontFamily: 'Pretendard, sans-serif' }}><p>선물 정보를 불러오지 못했습니다.</p></div>;
  }
  
  // HTML 응답 체크
  if (typeof presentCard === 'string' && presentCard.includes('<!doctype html>')) {
    console.error('PresentCard: HTML이 데이터로 전달되었습니다. API 응답 확인이 필요합니다.');
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4" style={{ fontFamily: 'Pretendard, sans-serif' }}>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded max-w-md">
          <h2 className="font-bold mb-2">API 응답 오류</h2>
          <p>서버가 JSON 데이터 대신 HTML을 반환했습니다.</p>
          <p className="text-sm mt-2">서버 설정이나 API 엔드포인트를 확인해주세요.</p>
        </div>
      </div>
    );
  }

  // 디버깅용 콘솔 출력 (개발 확인용)
  console.log('PresentCard: 전달받은 데이터 (타입):', typeof presentCard, presentCard);
  
  // 데이터 유효성 검사
  const isValidData = 
    presentCard.gifticonOriginalPath &&
    presentCard.templateCardPath;
    
  if (!isValidData) {
    console.error('PresentCard: 필수 데이터가 누락되었습니다. 받은 데이터:', presentCard);
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4" style={{ fontFamily: 'Pretendard, sans-serif' }}>
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded max-w-md">
          <h2 className="font-bold mb-2">데이터 형식 오류</h2>
          <p>필수 정보가 누락되었습니다.</p>
          <p className="text-sm mt-2">
            {!presentCard.gifticonOriginalPath && <span className="block">기프티콘 이미지 누락</span>}
            {!presentCard.templateCardPath && <span className="block">템플릿 카드 이미지 누락</span>}
          </p>
        </div>
      </div>
    );
  }

  const {
    presentCardCode,
    presentCardMessage,
    gifticonOriginalPath,
    gifticonThumbnailPath,
    templateCardPath,
    expiryDateTime
  } = presentCard;
  
  // 메시지가 비어있을 경우 기본 메시지로 대체
  const displayMessage = presentCardMessage || "아차차에서 선물이 도착했어요!";

  // 디버깅용 콘솔 출력 (개발 확인용)
  console.log('PresentCard: 구조분해할당 완료된 데이터:', {
    presentCardCode: presentCardCode || '(없음)',
    presentCardMessage: presentCardMessage || '(없음)',
    gifticonOriginalPath: gifticonOriginalPath || '(없음)',
    gifticonThumbnailPath: gifticonThumbnailPath || '(없음)', 
    templateCardPath: templateCardPath || '(없음)',
    expiryDateTime: expiryDateTime || '(없음)'
  });

  // 이미지 다운로드 함수
  const handleSaveImage = () => {
    // 이미지 다운로드 링크 생성
    const link = document.createElement('a');
    link.href = gifticonOriginalPath;
    link.download = `기프티콘_${presentCardCode || 'image'}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 반응형 스타일 가져오기
  const responsiveStyles = getResponsiveStyles();

  return (
    <>
      {/* --- 컨페티 캔버스 --- */}
      {runConfetti && (
        <canvas
          ref={confettiCanvasRef}
          id="confetti-canvas"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            pointerEvents: 'none',
            zIndex: 9999, // 다른 요소들 위에 오도록 z-index 설정
            willChange: 'transform', // 성능 최적화를 위한 레이어 힌트
          }}
        />
      )}
      {/* --- 컨페티 캔버스 끝 --- */}

      {/* 전체 카드 컨테이너 */}
      <div 
        className="min-h-screen flex flex-col items-center justify-center p-4" 
        style={{ 
          fontFamily: 'Pretendard, sans-serif',
          opacity: 0,
          animation: 'fadeIn 0.5s forwards',
        }}
      >
        <style>
          {`
            @keyframes fadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
            }
          `}
        </style>
        {/* 전체 카드 컨테이너 */}
        <div style={{ position: 'relative', width: '100%', maxWidth: '400px' }}>
          {/* 템플릿 이미지 (배경) */}
          <img 
            src={templateCardPath} 
            alt="템플릿 카드" 
            style={{ 
              width: '100%', 
              display: 'block',
              borderRadius: '8px',
              boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)'
            }} 
          />
          
          {/* 컨텐츠 오버레이 */}
          <div style={{ 
            position: 'absolute', 
            top: calculateTopPosition(), 
            left: '50%', 
            width: '90%', 
            height: 'auto',
            minHeight: screenWidth < 460 ? '70%' : '80%', 
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            transform: 'translateX(-50%)'
          }}>
            {/* 메시지 영역 */}
            <div 
              style={{ 
                backgroundColor: 'white', 
                borderRadius: '12px',
                padding: responsiveStyles.messageContainerStyle.padding,
                width: responsiveStyles.messageContainerStyle.width,
                marginTop: responsiveStyles.messageContainerStyle.marginTop,
                marginBottom: '10px',
                textAlign: 'center',
                height: responsiveStyles.messageContainerStyle.height,
                minHeight: responsiveStyles.messageContainerStyle.minHeight,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                overflowY: isLongMessage && !showFullMessage ? 'hidden' : 'auto',
                cursor: isLongMessage ? 'pointer' : 'default',
                position: 'relative',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
                fontFamily: 'Pretendard, sans-serif'
              }}
              onClick={() => isLongMessage && setShowFullMessage(true)}
            >
              <p 
                ref={messageRef}
                style={{ 
                  fontSize: `${screenWidth < 460 ? '15px' : '18px'}`, 
                  fontWeight: '600',
                  color: '#000',
                  margin: 0,
                  wordBreak: 'break-word'
                }}
              >
                {displayMessage.split('\n').map((line, i) => (
                  <React.Fragment key={i}>
                    {line}
                    {i < displayMessage.split('\n').length - 1 && <br />}
                  </React.Fragment>
                ))}
              </p>
              {isLongMessage && !showFullMessage && (
                <div style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  width: '100%',
                  height: '30px',
                  background: 'linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(255,255,255,1) 100%)',
                  pointerEvents: 'none'
                }}></div>
              )}
            </div>
            
            {/* 구분선 */}
            <div style={{ 
              width: responsiveStyles.messageContainerStyle.width, 
              height: '1px',
              background: 'linear-gradient(to right, #6E6E6E 50%, transparent 50%)',
              backgroundSize: '16px 2px',
              margin: responsiveStyles.dividerStyle.margin
            }}></div>
            
            {/* 기프티콘 영역 - 하나의 흰색 컨테이너로 통합 */}
            <div style={{ 
              width: responsiveStyles.gifticonContainerStyle.width,
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
              padding: responsiveStyles.gifticonContainerStyle.padding,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              marginTop: responsiveStyles.gifticonContainerStyle.marginTop,
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
            }}>
              {/* 썸네일 이미지 */}
              <div style={{ 
                border: '1px solid #3B82F6',
                borderRadius: '8px',
                padding: '2px',
                marginBottom: responsiveStyles.thumbnailSize.marginBottom,
                width: responsiveStyles.thumbnailSize.width,
                height: responsiveStyles.thumbnailSize.width, // 너비와 동일하게 설정하여 정사각형으로 만듦
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden' // 넘치는 부분 숨김
              }}>
                <img 
                  src={gifticonThumbnailPath || gifticonOriginalPath} 
                  alt="기프티콘 썸네일" 
                  style={{ 
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain', // 컨테이너 내에서 비율 유지하며 맞춤
                    display: 'block'
                  }}
                  onError={(e) => {
                    console.error('썸네일 이미지 로드 실패:', e);
                    if (e.target.src.includes('fallback-image.png')) {
                      e.target.onerror = null;
                      return;
                    }
                    
                    if (gifticonOriginalPath && e.target.src !== gifticonOriginalPath) {
                      e.target.src = gifticonOriginalPath;
                      e.target.onerror = (e2) => {
                        console.error('원본 이미지도 로드 실패:', e2);
                        e2.target.src = "/fallback-image.png";
                        e2.target.onerror = null;
                      };
                    } else {
                      e.target.src = "/fallback-image.png";
                      e.target.onerror = null;
                    }
                  }}
                />
              </div>
              
              {/* 갤러리에 저장 버튼 */}
              <button 
                onClick={handleSaveImage} 
                style={{ 
                  backgroundColor: '#E8F4FC',
                  color: '#3669A1',
                  fontWeight: '500',
                  padding: responsiveStyles.buttonStyle.padding,
                  borderRadius: '8px',
                  height: responsiveStyles.buttonStyle.height,
                  width: '90%',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: 'Pretendard, sans-serif',
                  fontSize: `${screenWidth < 460 ? '14px' : '16px'}`
                }}
              >
                갤러리에 저장
              </button>
            </div>

            {/* 유효기간 정보 - 검정색 배경(40% 불투명도)과 시계 아이콘
            {expiryDateTime && (
              <div style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'rgba(0, 0, 0, 0.3)',
                color: 'white',
                padding: responsiveStyles.expiryContainerStyle.padding,
                borderRadius: '8px',
                margin: responsiveStyles.expiryContainerStyle.margin,
                width: '60%',
                textAlign: 'center',
                fontFamily: 'Pretendard, sans-serif'
              }}>
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 24 24" 
                  fill="currentColor"
                  style={{ 
                    width: `${screenWidth < 460 ? '16px' : '18px'}`, 
                    height: `${screenWidth < 460 ? '16px' : '18px'}`, 
                    marginRight: '6px',
                    verticalAlign: 'middle',
                    position: 'relative',
                    top: '-1px'
                  }}
                >
                  <path d="M12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12H4C4 16.4183 7.58172 20 12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4C9.53614 4 7.33243 5.11383 5.86492 6.86543L8 9H2V3L4.44656 5.44648C6.28002 3.33509 8.9841 2 12 2ZM13 7L12.9998 11.585L16.2426 14.8284L14.8284 16.2426L10.9998 12.413L11 7H13Z"></path>
                </svg>
                <span style={{ 
                  fontSize: `${screenWidth < 460 ? '12px' : '14px'}`,
                  display: 'inline-block',
                  verticalAlign: 'middle',
                  lineHeight: '18px',
                  fontWeight: '400'
                }}>{expiryDateTime}</span>
              </div>
            )} */}
          </div>
        </div>

        {/* 전체 메시지 오버레이 */}
        {showFullMessage && (
          <div 
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 1000,
              padding: '20px',
              fontFamily: 'Pretendard, sans-serif'
            }}
            onClick={() => setShowFullMessage(false)}
          >
            <div 
              style={{
                backgroundColor: 'white',
                borderRadius: responsiveStyles.modalStyle.borderRadius,
                padding: responsiveStyles.modalStyle.padding,
                width: responsiveStyles.modalStyle.width,
                maxWidth: responsiveStyles.modalStyle.maxWidth,
                maxHeight: '80%',
                overflowY: 'auto',
                position: 'relative'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 style={{ fontWeight: '700', fontSize: `${screenWidth < 460 ? '18px' : '20px'}`, marginBottom: `${screenWidth < 460 ? '15px' : '20px'}` }}>메시지 전체보기</h3>
              <p style={{ 
                fontSize: `${screenWidth < 460 ? '16px' : '18px'}`, 
                fontWeight: '600',
                lineHeight: '1.6',
                wordBreak: 'break-word'
              }}>
                {displayMessage.split('\n').map((line, i) => (
                  <React.Fragment key={i}>
                    {line}
                    {i < displayMessage.split('\n').length - 1 && <br />}
                  </React.Fragment>
                ))}
              </p>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default PresentCard;

