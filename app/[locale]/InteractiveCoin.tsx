'use client';

import { useEffect, useRef } from 'react';

export default function InteractiveCoin() {
  const coinRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const coin = coinRef.current;
    if (!coin) return;

    let isMoving = false;

    const handleMove = (clientX: number, clientY: number) => {
      // MATIKAN animasi otomatis saat ada interaksi jari/mouse agar tidak bentrok
      coin.style.animation = 'none';

      const rect = coin.getBoundingClientRect();
      const coinCenterX = rect.left + rect.width / 2;
      const coinCenterY = rect.top + rect.height / 2;

      const maxDelta = 160;
      const deltaX = Math.min(Math.max((clientX - coinCenterX) / maxDelta, -1), 1);
      const deltaY = Math.min(Math.max((clientY - coinCenterY) / maxDelta, -1), 1);

      const rotateY = deltaX * 40;
      const rotateX = -deltaY * 40; 

      coin.style.setProperty('--coin-rx', `${rotateX}deg`);
      coin.style.setProperty('--coin-ry', `${rotateY}deg`);
      
      const shineX = ((deltaX + 1) / 2) * 100;
      const shineY = ((deltaY + 1) / 2) * 100;
      coin.style.setProperty('--shine-x', `${shineX}%`);
      coin.style.setProperty('--shine-y', `${shineY}%`);
    };

    // AKTIF: Event Listener untuk Layar Sentuh HP (Touchscreen)
    const onTouchStart = () => { 
      isMoving = true; 
    };
    const onTouchMove = (e: TouchEvent) => {
      if (!isMoving) return;
      const touch = e.touches[0];
      handleMove(touch.clientX, touch.clientY);
    };
    const onTouchEnd = () => {
      isMoving = false;
      resetCoin();
    };

    // AKTIF: Event Listener untuk Mouse desktop
    const onMouseMove = (e: MouseEvent) => {
      handleMove(e.clientX, e.clientY);
    };
    const onMouseLeave = () => {
      resetCoin();
    };

    const resetCoin = () => {
      coin.style.setProperty('--coin-rx', '0deg');
      coin.style.setProperty('--coin-ry', '0deg');
      coin.style.setProperty('--shine-x', '30%');
      coin.style.setProperty('--shine-y', '30%');
      // HIDUPKAN KEMBALI animasi putar pelan saat jari/mouse sudah lepas
      coin.style.animation = 'slowSwing 6s ease-in-out infinite alternate';
    };

    coin.addEventListener('touchstart', onTouchStart, { passive: true });
    coin.addEventListener('touchmove', onTouchMove, { passive: true });
    coin.addEventListener('touchend', onTouchEnd);
    coin.addEventListener('mousemove', onMouseMove);
    coin.addEventListener('mouseleave', onMouseLeave);

    return () => {
      coin.removeEventListener('touchstart', onTouchStart);
      coin.removeEventListener('touchmove', onTouchMove);
      coin.removeEventListener('touchend', onTouchEnd);
      coin.removeEventListener('mousemove', onMouseMove);
      coin.removeEventListener('mouseleave', onMouseLeave);
    };
  }, []);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        .hp-coin-container {
          perspective: 1500px;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 280px;
          height: 280px;
        }

        .hp-coin {
          position: relative;
          width: 180px;
          height: 180px;
          transform-style: preserve-3d;
          transform: rotateX(var(--coin-rx, 0deg)) rotateY(var(--coin-ry, 0deg));
          transition: transform 0.2s cubic-bezier(0.215, 0.610, 0.355, 1);
          will-change: transform;
          cursor: grab;
          
          /* Animasi default saat diam: Ayun menoleh kiri-kanan pelan */
          animation: slowSwing 6s ease-in-out infinite alternate;
        }

        .hp-coin:active {
          cursor: grabbing;
        }

        /* KEYFRAMES: Berputar sebagian saja (tidak full 360) agar efek 3D timbul */
        @keyframes slowSwing {
          0% {
            transform: rotateX(-5deg) rotateY(-25deg);
            --shine-x: 15%;
            --shine-y: 20%;
          }
          100% {
            transform: rotateX(5deg) rotateY(25deg);
            --shine-x: 75%;
            --shine-y: 50%;
          }
        }
        
        .hp-coin-face {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: radial-gradient(circle at 35% 35%, #1e1e1e 0%, #121212 50%, #050505 100%);
          border: 4px solid #262626;
          overflow: hidden;
          backface-visibility: hidden;
        }

        .hp-coin-face::after {
          content: '';
          position: absolute;
          inset: -60%;
          background: linear-gradient(
            135deg,
            rgba(255,255,255,0) 0%,
            rgba(255,255,255,0) 35%,
            rgba(255,255,255,0.15) 47%,
            rgba(255,255,255,0.25) 50%,
            rgba(255,255,255,0.15) 53%,
            rgba(255,255,255,0) 65%,
            rgba(255,255,255,0) 100%
          );
          transform: translate(calc(var(--shine-x, 30%) - 50%), calc(var(--shine-y, 30%) - 50%));
          mix-blend-mode: screen;
          pointer-events: none;
        }

        .hp-coin-front {
          transform: translateZ(10px);
          box-shadow: inset 0 4px 10px rgba(255,255,255,0.05), inset 0 -4px 10px rgba(0,0,0,0.8);
          z-index: 3;
        }

        .hp-coin-back {
          transform: translateZ(-10px) rotateY(180deg);
          box-shadow: inset 0 4px 10px rgba(255,255,255,0.05), inset 0 -4px 10px rgba(0,0,0,0.8);
          z-index: 1;
        }

        .hp-coin-thickness-core {
          position: absolute;
          inset: 1px;
          border-radius: 50%;
          background: #171717;
          transform: translateZ(0px);
          z-index: 2;
          box-shadow: 
            0 1px 0 #262626, 0 -1px 0 #262626, 1px 0 0 #0a0a0a, -1px 0 0 #0a0a0a,
            0 0 0 1px #1f1f1f,
            0 20px 40px rgba(0, 0, 0, 0.65),
            0 10px 15px rgba(0, 0, 0, 0.45);
        }

        .hp-coin-face svg {
          filter: drop-shadow(0px 2px 3px rgba(0, 0, 0, 0.8));
          transition: transform 0.2s ease;
        }
      `}} />

      <div className="hp-hero-right" style={{ position: 'relative' }}>
        <div className="hp-coin-glow" style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          width: '320px',
          height: '320px',
          background: 'radial-gradient(circle, rgba(255,255,255,0.03) 0%, rgba(0,0,0,0) 70%)',
          pointerEvents: 'none',
          zIndex: 0
        }} aria-hidden="true" />

        <div className="hp-coin-container" aria-label="World App Minimalist 3D Coin">
          <div ref={coinRef} className="hp-coin">
            
            {/* SISI DEPAN */}
            <div className="hp-coin-face hp-coin-front">
              <svg width="105" height="105" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="50" cy="50" r="38" stroke="#FFFFFF" strokeWidth="7" fill="none"/>
                <line x1="12" y1="50" x2="88" y2="50" stroke="#FFFFFF" strokeWidth="7" strokeLinecap="round"/>
                <path d="M 68,29 A 21,21 0 0,0 33,50 A 21,21 0 0,0 68,71" stroke="#FFFFFF" strokeWidth="7" fill="none" strokeLinecap="round"/>
              </svg>
            </div>

            {/* SISI TENGAH */}
            <div className="hp-coin-thickness-core" />

            {/* SISI BELAKANG */}
            <div className="hp-coin-face hp-coin-back">
              <svg width="105" height="105" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="50" cy="50" r="38" stroke="#FFFFFF" strokeWidth="7" fill="none"/>
                <line x1="12" y1="50" x2="88" y2="50" stroke="#FFFFFF" strokeWidth="7" strokeLinecap="round"/>
                <path d="M 68,29 A 21,21 0 0,0 33,50 A 21,21 0 0,0 68,71" stroke="#FFFFFF" strokeWidth="7" fill="none" strokeLinecap="round"/>
              </svg>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}