import { useEffect, useState } from 'react';

interface SplashScreenProps {
  onFinish: () => void;
  minDuration?: number;
}

export default function SplashScreen({ onFinish, minDuration = 2000 }: SplashScreenProps) {
  const [phase, setPhase] = useState<'enter' | 'visible' | 'exit'>('enter');
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    // Start enter animation
    const t1 = setTimeout(() => setPhase('visible'), 100);
    const t2 = setTimeout(() => setShowContent(true), 400);

    // Exit after minDuration
    const t3 = setTimeout(() => {
      setPhase('exit');
      setTimeout(onFinish, 500);
    }, minDuration);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [onFinish, minDuration]);

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center
        transition-all duration-700 ease-out
        ${phase === 'enter' ? 'opacity-0 scale-95' : ''}
        ${phase === 'visible' ? 'opacity-100 scale-100' : ''}
        ${phase === 'exit' ? 'opacity-0 scale-105' : ''}
      `}
      style={{
        background: 'linear-gradient(135deg, #ff751f 0%, #e05a00 50%, #c44a00 100%)',
      }}
    >
      {/* Background decorative circles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-64 h-64 rounded-full bg-white/5" />
        <div className="absolute -bottom-20 -left-20 w-48 h-48 rounded-full bg-white/5" />
        <div className="absolute top-1/3 -left-16 w-32 h-32 rounded-full bg-white/[0.03]" />
      </div>

      {/* Logo container */}
      <div
        className={`relative transition-all duration-1000 ease-out
          ${showContent ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}
        `}
      >
        {/* Glow behind logo */}
        <div className="absolute inset-0 -m-8 bg-white/10 rounded-full blur-3xl" />

        {/* Brand logo symbol */}
        <div className="relative w-28 h-28 mx-auto mb-6">
          <svg viewBox="0 0 512 512" className="w-full h-full">
            {/* Logo symbol paths from brand */}
            <g transform="translate(256, 260) scale(0.36)">
              <path fill="rgba(255,255,255,0.85)" d="M 0 -52 C 11 -52 20 -61 20 -73 L 20 -113 C 20 -165 62 -208 115 -208 C 167 -208 210 -165 210 -113 L 210 -73 C 210 -61 219 -52 231 -52 C 242 -52 252 -61 252 -73 L 252 -107 C 252 -180 197 -244 124 -249 C 45 -254 -21 -191 -21 -113 L -21 -73 C -21 -61 -12 -52 0 -52 Z"/>
              <path fill="white" d="M 439 490 L 393 44 C 389 8 359 -18 324 -18 L -92 -18 C -128 -18 -158 9 -161 44 L -173 155 C -180 230 -110 288 -38 266 L 0 254 C 45 240 94 263 111 312 C 117 329 117 348 111 365 L 94 421 C 70 498 128 577 209 577 L 360 577 C 406 577 443 536 439 490 Z"/>
              <path fill="rgba(255,255,255,0.8)" d="M 15 302 L -209 370 C -242 380 -244 426 -213 439 L -159 462 C -131 474 -108 496 -96 525 L -74 578 C -60 610 -15 608 -5 575 L 63 350 C 72 320 45 293 15 302 Z"/>
            </g>
          </svg>
        </div>

        {/* Brand name with new colors */}
        <h1 className="text-5xl font-extrabold text-white tracking-[10px] text-center">
          <span>K</span>
          <span className="text-[#ff751f]">A</span>
          <span>DIX</span>
        </h1>

        {/* Tagline */}
        <p className="text-center text-white/50 text-sm font-medium tracking-[4px] mt-3 uppercase">
          Liste de courses
        </p>

        {/* Divider */}
        <div className="flex items-center justify-center gap-3 mt-4">
          <div className="w-8 h-px bg-white/20" />
          <span className="text-white/30 text-xs">✦</span>
          <div className="w-8 h-px bg-white/20" />
        </div>

        <p className="text-center text-white/40 text-xs mt-3 font-light tracking-wider">
          Collaborative & Intelligente
        </p>
      </div>

      {/* Loading dots at bottom */}
      <div
        className={`absolute bottom-16 transition-all duration-700 delay-700
          ${showContent ? 'opacity-100' : 'opacity-0'}
        `}
      >
        <div className="flex gap-2">
          <span className="w-2 h-2 rounded-full bg-white/60 animate-bounce"
                style={{ animationDelay: '0ms', animationDuration: '1s' }} />
          <span className="w-2 h-2 rounded-full bg-white/40 animate-bounce"
                style={{ animationDelay: '200ms', animationDuration: '1s' }} />
          <span className="w-2 h-2 rounded-full bg-white/20 animate-bounce"
                style={{ animationDelay: '400ms', animationDuration: '1s' }} />
        </div>
      </div>
    </div>
  );
}
