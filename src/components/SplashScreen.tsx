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
        background: 'linear-gradient(135deg, #636c55 0%, #4e5542 50%, #3f4536 100%)',
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

        {/* Shopping bag icon */}
        <div className="relative w-24 h-24 mx-auto mb-6">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            {/* Bag handle */}
            <path d="M 30 25 Q 25 0 40 -8 Q 55 -15 65 -5 Q 75 5 70 25"
                  fill="none" stroke="white" strokeWidth="4" strokeLinecap="round"/>
            {/* Bag body */}
            <path d="M 15 25 L 85 25 L 75 90 L 25 90 Z"
                  fill="white" opacity="0.95" rx="6"/>
            {/* Leaf accent */}
            <path d="M 50 15 Q 30 -10 50 -40 Q 70 -15 55 15 Z"
                  fill="#d4a55e" opacity="0.7"/>
            {/* Small dots */}
            <circle cx="38" cy="50" r="2.5" fill="rgba(78,69,66,0.12)"/>
            <circle cx="62" cy="60" r="2" fill="rgba(78,69,66,0.10)"/>
          </svg>
        </div>

        {/* Brand name */}
        <h1 className="text-5xl font-extrabold text-white tracking-[8px] text-center">
          <span>K</span>
          <span className="text-[#d4a55e]">A</span>
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
