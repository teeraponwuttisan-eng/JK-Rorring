import React from 'react';

interface SomboonLogoProps {
  className?: string;
  variant?: 'full' | 'horizontal' | 'icon' | 'badge';
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const SomboonLogo: React.FC<SomboonLogoProps> = ({
  className = '',
  variant = 'horizontal',
  size = 'md',
}) => {
  // Exact vector reproduction of the Somboon Advance Technology emblem & wordmark
  const Emblem = ({ width = 44, height = 44 }: { width?: number; height?: number }) => (
    <svg
      width={width}
      height={height}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0 drop-shadow-xs"
    >
      {/* Background Rounded Square */}
      <rect width="120" height="120" rx="24" fill="#204A87" />
      
      {/* Outer Bell Shape in White Outline */}
      <path
        d="M60 14C45 14 38 24 36 44C34 60 26 72 20 78C20 83 24 85 30 85H40C42 85 43 83 44 80C46 64 52 56 60 56C68 56 74 64 76 80C77 83 78 85 80 85H90C96 85 100 83 100 78C94 72 86 60 84 44C82 24 75 14 60 14Z"
        stroke="white"
        strokeWidth="7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Light Blue Concentric Ripple Rings */}
      <circle cx="60" cy="84" r="24" stroke="#48CAE4" strokeWidth="6" strokeDasharray="3 0" />
      <circle cx="60" cy="84" r="16" stroke="#90E0EF" strokeWidth="4" />
      
      {/* Center White Ball / Bearing Core */}
      <circle cx="60" cy="84" r="9" fill="white" stroke="#204A87" strokeWidth="2" />

      {/* Bell Top Loop */}
      <path
        d="M48 24C48 18 53 14 60 14C67 14 72 18 72 24"
        stroke="white"
        strokeWidth="6"
        strokeLinecap="round"
      />
    </svg>
  );

  if (variant === 'icon') {
    const dim = size === 'sm' ? 28 : size === 'lg' ? 52 : size === 'xl' ? 68 : 38;
    return <div className={`inline-flex items-center ${className}`}><Emblem width={dim} height={dim} /></div>;
  }

  if (variant === 'full') {
    return (
      <div className={`flex flex-col items-center text-center ${className}`}>
        <Emblem width={size === 'lg' ? 72 : 56} height={size === 'lg' ? 72 : 56} />
        <div className="mt-2 font-black tracking-wider text-[#1e3a8a] text-xl leading-none">
          SOMBOON
        </div>
        <div className="text-[10px] tracking-[0.25em] font-semibold text-[#1e3a8a] mt-0.5 uppercase">
          ADVANCE TECHNOLOGY
        </div>
      </div>
    );
  }

  // Default: Horizontal
  const emblemDim = size === 'sm' ? 32 : size === 'lg' ? 48 : size === 'xl' ? 56 : 40;
  const titleSize = size === 'sm' ? 'text-base' : size === 'lg' ? 'text-2xl' : 'text-lg';
  const subtitleSize = size === 'sm' ? 'text-[8px]' : size === 'lg' ? 'text-[11px]' : 'text-[9.5px]';

  return (
    <div className={`flex items-center space-x-2.5 ${className}`}>
      <Emblem width={emblemDim} height={emblemDim} />
      <div className="flex flex-col justify-center">
        <div className={`font-black tracking-tight text-[#1e3a8a] ${titleSize} leading-none`}>
          SOMBOON
        </div>
        <div className={`font-bold tracking-[0.18em] text-[#2563eb] ${subtitleSize} mt-0.5 leading-none uppercase`}>
          ADVANCE TECHNOLOGY
        </div>
      </div>
    </div>
  );
};
