'use client';

import { useEffect, useRef } from 'react';

export default function InteractiveCoin() {
  const coinRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const coin = coinRef.current;
    if (!coin) return;

    let isMoving = false;

    const handleMove = (clientX: number, clientY: number) => {
      const rect = coin.getBoundingClientRect();
      const coinCenterX = rect.left + rect.width / 2;
      const coinCenterY = rect.top + rect.height / 2;

      const maxDelta = 140;
      const deltaX = Math.min(Math.max((clientX - coinCenterX) / maxDelta, -1), 1);
      const deltaY = Math.min(Math.max((clientY - coinCenterY) / maxDelta, -1), 1);

      const rotateY = deltaX * 45;
      const rotateX = -deltaY * 45; 

      coin.style.setProperty('--coin-rx', `${rotateX}deg`);
      coin.style.setProperty('--coin-ry', `${rotateY}deg`);
      
      const shineX = ((deltaX + 1) / 2) * 100;
      const shineY = ((deltaY + 1) / 2) * 100;
      coin.style.setProperty('--shine-x', `${shineX}%`);
      coin.style.setProperty('--shine-y', `${shineY}%`);
    };

    const onTouchStart = () => { isMoving = true; };
    const onTouchMove = (e: TouchEvent) => {
      if (!isMoving) return;
      const touch = e.touches[0];
      handleMove(touch.clientX, touch.clientY);
    };
    const onTouchEnd = () => {
      isMoving = false;
      coin.style.setProperty('--coin-rx', '0deg');
      coin.style.setProperty('--coin-ry', '0deg');
      coin.style.setProperty('--shine-x', '30%');
      coin.style.setProperty('--shine-y', '30%');
    };

    const onMouseMove = (e: MouseEvent) => {
      handleMove(e.clientX, e.clientY);
    };
    const onMouseLeave = () => {
      coin.style.setProperty('--coin-rx', '0deg');
      coin.style.setProperty('--coin-ry', '0deg');
      coin.style.setProperty('--shine-x', '30%');
      coin.style.setProperty('--shine-y', '30%');
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
          perspective: 1200px;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 250px;
          height: 250px;
        }

        .hp-coin {
          position: relative;
          width: 160px;
          height: 160px;
          transform-style: preserve-3d;
          transform: rotateX(var(--coin-rx, 0deg)) rotateY(var(--coin-ry, 0deg));
          transition: transform 0.15s cubic-bezier(0.25, 1, 0.5, 1);
        }
        
        /* Lapisan wajah koin */
        .hp-coin-face {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #ffffff 0%, #cbd5e1 45%, #94a3b8 70%, #475569 100%);
          border: 4px solid #f8fafc;
          overflow: hidden;
        }

        /* Kilauan specular reflektif */
        .hp-coin-face::after {
          content: '';
          position: absolute;
          inset: -50%;
          background: linear-gradient(
            to bottom right,
            rgba(255,255,255,0) 30%,
            rgba(255,255,255,0.7) 45%,
            rgba(255,255,255,0) 55%
          );
          transform: translate(calc(var(--shine-x, 30%) - 50%), calc(var(--shine-y, 30%) - 50%));
          mix-blend-mode: overlay;
          pointer-events: none;
        }

        /* 1. MUKA DEPAN: Berada di paling depan ruang 3D */
        .hp-coin-front {
          transform: translateZ(14px);
          box-shadow: inset 0 8px 15px rgba(0,0,0,0.25), inset 0 -8px 15px rgba(255,255,255,0.7);
          z-index: 3;
        }

        /* 2. MUKA BELAKANG: Berada di paling belakang ruang 3D */
        .hp-coin-back {
          transform: translateZ(-14px) rotateY(180deg);
          box-shadow: inset 0 8px 15px rgba(0,0,0,0.25), inset 0 -8px 15px rgba(255,255,255,0.7);
          z-index: 1;
        }

        /* 3. SOLUSI TANPA CELAH: Silinder Tengah yang dibuat menggunakan tumpukan 3D Shadow Padat */
        .hp-coin-thickness-core {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          background: #cbd5e1;
          /* Dorong ke tengah-tengah antara plat depan dan belakang */
          transform: translateZ(0px); 
          z-index: 2;
          
          /* Layering shadow presisi yang menciptakan efek silinder chrome padat 28px tanpa sambungan garis */
          box-shadow: 
            0 0 0 0.5px #94a3b8,
            /* Blok Ekstrusi Sisi Depan */
            0 0 2px #cbd5e1,
            translateZ(1px) 0 0 #cbd5e1,
            translateZ(2px) 0 0 #cbd5e1,
            translateZ(3px) 0 0 #cbd5e1,
            translateZ(4px) 0 0 #94a3b8,
            translateZ(5px) 0 0 #94a3b8,
            translateZ(6px) 0 0 #64748b,
            translateZ(7px) 0 0 #64748b,
            translateZ(8px) 0 0 #cbd5e1,
            translateZ(9px) 0 0 #f1f5f9,
            translateZ(10px) 0 0 #ffffff,
            translateZ(11px) 0 0 #ffffff,
            translateZ(12px) 0 0 #cbd5e1,
            translateZ(13px) 0 0 #94a3b8,
            /* Blok Ekstrusi Sisi Belakang */
            translateZ(-1px) 0 0 #cbd5e1,
            translateZ(-2px) 0 0 #cbd5e1,
            translateZ(-3px) 0 0 #cbd5e1,
            translateZ(-4px) 0 0 #94a3b8,
            translateZ(-5px) 0 0 #94a3b8,
            translateZ(-6px) 0 0 #475569,
            translateZ(-7px) 0 0 #334155,
            translateZ(-8px) 0 0 #475569,
            translateZ(-9px) 0 0 #64748b,
            translateZ(-10px) 0 0 #94a3b8,
            translateZ(-11px) 0 0 #cbd5e1,
            translateZ(-12px) 0 0 #f1f5f9,
            translateZ(-13px) 0 0 #94a3b8,
            /* Bayangan Luar Utama Objek ke Background */
            0 20px 40px rgba(0,0,0,0.4);
        }

        .hp-coin-face svg {
          filter: drop-shadow(0px -1px 1px rgba(255, 255, 255, 0.7)) drop-shadow(0px 2.5px 2.5px rgba(0, 0, 0, 0.35));
        }
      `}} />

      <div className="hp-hero-right" style={{ position: 'relative' }}>
        <div className="hp-coin-glow" style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          width: '300px',
          height: '300px',
          background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(0,0,0,0) 70%)',
          pointerEvents: 'none',
          zIndex: 0
        }} aria-hidden="true" />

        <div className="hp-coin-container" aria-label="Worldcoin Seamless 3D Coin">
          <div ref={coinRef} className="hp-coin">
            
            {/* SISI DEPAN (Z-Index Atas) */}
            <div className="hp-coin-face hp-coin-front">
              <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="50" cy="50" r="38" stroke="#334155" strokeWidth="7.5" fill="none"/>
                <line x1="12" y1="50" x2="88" y2="50" stroke="#334155" strokeWidth="7.5" strokeLinecap="square"/>
                <path d="M 68,29 A 21,21 0 0,0 33,50 A 21,21 0 0,0 68,71" stroke="#334155" strokeWidth="7.5" fill="none" strokeLinecap="square"/>
              </svg>
            </div>

            {/* SISI TENGAH LOGAM PADAT (Menggantikan loop segmen tipis) */}
            <div className="hp-coin-thickness-core" />

            {/* SISI BELAKANG */}
            <div className="hp-coin-face hp-coin-back">
              <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="50" cy="50" r="38" stroke="#334155" strokeWidth="7.5" fill="none"/>
                <line x1="12" y1="50" x2="88" y2="50" stroke="#334155" strokeWidth="7.5" strokeLinecap="square"/>
                <path d="M 68,29 A 21,21 0 0,0 33,50 A 21,21 0 0,0 68,71" stroke="#334155" strokeWidth="7.5" fill="none" strokeLinecap="square"/>
              </svg>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}