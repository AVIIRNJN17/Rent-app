import React from 'react';

interface CatMascotProps {
  size?: number;
  className?: string;
  showGlow?: boolean;
  withRing?: boolean;
}

export const CatMascot: React.FC<CatMascotProps> = ({
  size = 48,
  className = '',
  showGlow = true,
  withRing = true,
}) => {
  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Golden Aura Glow */}
      {showGlow && (
        <div
          className="absolute inset-0 rounded-2xl bg-amber-400/25 blur-md -z-10 animate-pulse pointer-events-none"
          style={{ transform: 'scale(1.15)' }}
        />
      )}

      <svg
        viewBox="0 0 512 512"
        width={size}
        height={size}
        className="w-full h-full drop-shadow-md select-none transition-transform duration-300 hover:scale-105"
      >
        <defs>
          <linearGradient id="cmBgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#231F1A" />
            <stop offset="50%" stopColor="#141311" />
            <stop offset="100%" stopColor="#090807" />
          </linearGradient>

          <linearGradient id="cmGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFF2B2" />
            <stop offset="35%" stopColor="#E5C158" />
            <stop offset="70%" stopColor="#D4AF37" />
            <stop offset="100%" stopColor="#996515" />
          </linearGradient>

          <linearGradient id="cmEarInner" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#E5C158" />
            <stop offset="100%" stopColor="#B8860B" />
          </linearGradient>

          <linearGradient id="cmFurGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="70%" stopColor="#F4EFE6" />
            <stop offset="100%" stopColor="#E2D7C5" />
          </linearGradient>
        </defs>

        {/* Squircle App Container */}
        <rect
          x="16"
          y="16"
          width="480"
          height="480"
          rx="116"
          fill="url(#cmBgGrad)"
          stroke="url(#cmGoldGrad)"
          strokeWidth="8"
        />

        {/* Decorative Greek Meander Ring */}
        {withRing && (
          <circle
            cx="256"
            cy="256"
            r="208"
            fill="none"
            stroke="url(#cmGoldGrad)"
            strokeWidth="3"
            strokeDasharray="14 10"
            opacity="0.35"
          />
        )}

        {/* Cat Body */}
        <path d="M160 410 C160 330 200 310 256 310 C312 310 352 330 352 410 Z" fill="url(#cmFurGrad)" />

        {/* Left Ear */}
        <path d="M168 220 L132 110 C130 102 142 96 150 104 L212 165 Z" fill="url(#cmFurGrad)" />
        <path d="M168 200 L146 126 C144 120 152 116 156 122 L198 165 Z" fill="url(#cmEarInner)" opacity="0.9" />

        {/* Right Ear */}
        <path d="M344 220 L380 110 C382 102 370 96 362 104 L300 165 Z" fill="url(#cmFurGrad)" />
        <path d="M344 200 L366 126 C368 120 360 116 356 122 L314 165 Z" fill="url(#cmEarInner)" opacity="0.9" />

        {/* Cat Head */}
        <circle cx="256" cy="235" r="105" fill="url(#cmFurGrad)" />

        {/* Royal Greek Laurel Crown */}
        <g transform="translate(256, 142) scale(0.9)">
          <path d="M-55 10 C-35 -15 -15 -10 0 0 C15 -10 35 -15 55 10 C45 22 30 12 0 16 C-30 12 -45 22 -55 10 Z" fill="url(#cmGoldGrad)" />
          <polygon points="-30,6 -20,-22 -10,4" fill="url(#cmGoldGrad)" />
          <polygon points="-12,4 0,-34 12,4" fill="url(#cmGoldGrad)" />
          <polygon points="10,4 20,-22 30,6" fill="url(#cmGoldGrad)" />
          <circle cx="0" cy="-14" r="5" fill="#FFE27A" />
          <circle cx="-20" cy="-8" r="3.5" fill="#FFE27A" />
          <circle cx="20" cy="-8" r="3.5" fill="#FFE27A" />
        </g>

        {/* Big Friendly Eyes */}
        <ellipse cx="215" cy="225" rx="15" ry="20" fill="#241E15" />
        <ellipse cx="297" cy="225" rx="15" ry="20" fill="#241E15" />

        {/* Golden Highlights in Eyes */}
        <circle cx="212" cy="220" r="6" fill="#FFF8DC" />
        <circle cx="218" cy="229" r="2.5" fill="#FFF8DC" />
        <circle cx="294" cy="220" r="6" fill="#FFF8DC" />
        <circle cx="300" cy="229" r="2.5" fill="#FFF8DC" />

        {/* Nose & Smile */}
        <polygon points="256,248 248,238 264,238" fill="#D4AF37" />
        <path d="M248 250 Q240 262 232 254" fill="none" stroke="#241E15" strokeWidth="3.5" strokeLinecap="round" />
        <path d="M264 250 Q272 262 280 254" fill="none" stroke="#241E15" strokeWidth="3.5" strokeLinecap="round" />

        {/* Blush */}
        <ellipse cx="192" cy="242" rx="12" ry="7" fill="#E5C158" opacity="0.4" />
        <ellipse cx="320" cy="242" rx="12" ry="7" fill="#E5C158" opacity="0.4" />

        {/* Gold Whiskers */}
        <line x1="185" y1="236" x2="135" y2="230" stroke="url(#cmGoldGrad)" strokeWidth="3" strokeLinecap="round" />
        <line x1="185" y1="244" x2="130" y2="246" stroke="url(#cmGoldGrad)" strokeWidth="3" strokeLinecap="round" />
        <line x1="185" y1="252" x2="138" y2="262" stroke="url(#cmGoldGrad)" strokeWidth="3" strokeLinecap="round" />

        <line x1="327" y1="236" x2="377" y2="230" stroke="url(#cmGoldGrad)" strokeWidth="3" strokeLinecap="round" />
        <line x1="327" y1="244" x2="382" y2="246" stroke="url(#cmGoldGrad)" strokeWidth="3" strokeLinecap="round" />
        <line x1="327" y1="252" x2="374" y2="262" stroke="url(#cmGoldGrad)" strokeWidth="3" strokeLinecap="round" />

        {/* Collar & Rupee Medallion */}
        <path d="M195 320 Q256 345 317 320" fill="none" stroke="url(#cmGoldGrad)" strokeWidth="12" strokeLinecap="round" />
        <circle cx="256" cy="358" r="28" fill="url(#cmGoldGrad)" stroke="#FFF2B2" strokeWidth="3" />
        <circle cx="256" cy="358" r="22" fill="#181613" />
        <text x="256" y="367" fontFamily="'Cinzel', serif" fontSize="24" fontWeight="900" fill="url(#cmGoldGrad)" textAnchor="middle">₹</text>

        {/* Paws */}
        <ellipse cx="210" cy="386" rx="22" ry="16" fill="url(#cmFurGrad)" stroke="url(#cmGoldGrad)" strokeWidth="2.5" />
        <ellipse cx="302" cy="386" rx="22" ry="16" fill="url(#cmFurGrad)" stroke="url(#cmGoldGrad)" strokeWidth="2.5" />
      </svg>
    </div>
  );
};
