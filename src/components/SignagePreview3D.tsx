import React, { useState } from 'react';
import { Sun, Zap, Sparkles, Power } from 'lucide-react';
import { useApp } from '../context/AppContext';

type LightingMode = 'gold' | 'blue' | 'dual' | 'off';

export function SignagePreview3D() {
  const { lang } = useApp();
  const isAr = lang === 'ar';
  const [mode, setMode] = useState<LightingMode>('dual');
  const [tilt, setTilt] = useState({ rx: 4, ry: -6 });

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({
      rx: Number((-y * 10).toFixed(2)),
      ry: Number((x * 12).toFixed(2)),
    });
  };

  const handlePointerLeave = () => {
    setTilt({ rx: 4, ry: -6 });
  };

  const modes: { id: LightingMode; labelAr: string; labelEn: string; icon: React.ReactNode }[] = [
    { id: 'dual', labelAr: 'إضاءة مزدوجة', labelEn: 'Dual LED', icon: <Sparkles className="w-3.5 h-3.5" /> },
    { id: 'gold', labelAr: 'هالة ذهبية', labelEn: 'Gold Halo', icon: <Sun className="w-3.5 h-3.5" /> },
    { id: 'blue', labelAr: 'أزرق كهربائي', labelEn: 'Electric Blue', icon: <Zap className="w-3.5 h-3.5" /> },
    { id: 'off', labelAr: 'إضاءة نهارية', labelEn: 'Daylight Off', icon: <Power className="w-3.5 h-3.5" /> },
  ];

  const isGoldActive = mode === 'gold' || mode === 'dual';
  const isBlueActive = mode === 'blue' || mode === 'dual';

  return (
    <div className="bg-[#12141A]/95 border border-white/10 rounded-xl p-5 backdrop-blur-md">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <p className="text-xs font-medium text-[#D4AF37]">
            {isAr ? 'معاينة الإضاءة ثلاثية الأبعاد' : 'Interactive 3D LED Preview'}
          </p>
          <p className="text-xs text-[#A1A6B3] mt-0.5">
            {isAr ? 'حرّك المؤشر لاختبار العمق والانعكاس' : 'Move pointer to inspect 3D letter depth'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1 bg-[#0A0B0E] p-1 rounded-lg border border-white/10">
          {modes.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setMode(m.id)}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                mode === m.id
                  ? 'bg-[#1D6BFF] text-white'
                  : 'text-[#A1A6B3] hover:text-white'
              }`}
            >
              {m.icon}
              <span>{isAr ? m.labelAr : m.labelEn}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 3D Architectural Cladding Panel */}
      <div
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        className="perspective-scene relative h-44 sm:h-48 w-full flex items-center justify-center overflow-hidden rounded-lg bg-[#090A0D] border border-white/10 select-none"
      >
        {/* Architectural grid seams on cladding */}
        <div
          className="absolute inset-0 opacity-25 pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(to right, rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.06) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />

        {/* Ambient LED Backlight Wash */}
        {isGoldActive && (
          <div
            className="absolute w-72 h-24 rounded-full blur-2xl transition-opacity duration-300 pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(212,175,55,0.34), transparent 70%)' }}
          />
        )}
        {isBlueActive && (
          <div
            className="absolute inset-x-8 bottom-3 h-1 blur-sm transition-opacity duration-300 pointer-events-none"
            style={{ background: 'linear-gradient(90deg, transparent, #1D6BFF, transparent)' }}
          />
        )}

        {/* 3D Sign Plaque */}
        <div
          className="preserve-3d relative px-8 py-5 rounded-lg border transition-transform duration-150 ease-out"
          style={{
            transform: `rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`,
            background: 'linear-gradient(145deg, #1A1D24 0%, #0E1015 100%)',
            borderColor: isBlueActive
              ? 'rgba(59, 130, 246, 0.5)'
              : isGoldActive
                ? 'rgba(212, 175, 55, 0.45)'
                : 'rgba(255, 255, 255, 0.12)',
            boxShadow:
              mode === 'dual'
                ? '0 20px 35px rgba(0,0,0,0.65), 0 0 24px rgba(29,107,255,0.22), 0 0 36px rgba(212,175,55,0.18)'
                : mode === 'gold'
                  ? '0 20px 35px rgba(0,0,0,0.65), 0 0 32px rgba(212,175,55,0.28)'
                  : mode === 'blue'
                    ? '0 20px 35px rgba(0,0,0,0.65), 0 0 32px rgba(29,107,255,0.34)'
                    : '0 20px 35px rgba(0,0,0,0.65)',
          }}
        >
          {/* LED Profile Top & Bottom Channels */}
          <div
            className="absolute inset-x-4 top-0 h-[2px] transition-all duration-300"
            style={{
              background: isBlueActive ? '#3B82F6' : 'rgba(255,255,255,0.1)',
              boxShadow: isBlueActive ? '0 0 12px #3B82F6' : 'none',
            }}
          />
          <div
            className="absolute inset-x-4 bottom-0 h-[2px] transition-all duration-300"
            style={{
              background: isGoldActive ? '#D4AF37' : 'rgba(255,255,255,0.1)',
              boxShadow: isGoldActive ? '0 0 12px #D4AF37' : 'none',
            }}
          />

          <div
            className="text-center transition-all duration-300"
            style={{ transform: 'translateZ(24px)' }}
          >
            <div
              className={`text-xl sm:text-2xl font-extrabold tracking-tight transition-all duration-300 ${
                isGoldActive ? 'text-[#F6D778] led-text-gold' : 'text-[#D4D6DC]'
              }`}
            >
              {isAr ? 'محمود شعبان' : 'MAHMOUD SHAABAN'}
            </div>
            <div
              className={`text-xs font-semibold tracking-widest mt-1 transition-all duration-300 ${
                isBlueActive ? 'text-[#60A5FA] led-text-blue' : 'text-[#8C92A0]'
              }`}
            >
              {isAr ? 'للدعاية والإعلان والواجهات' : 'ARCHITECTURAL SIGNAGE'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
