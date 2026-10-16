import React, { useState } from 'react';
import bill1000 from '../assets/currency/bill_1000.jpg';
import bill5000 from '../assets/currency/bill_5000.jpg';
import bill10000 from '../assets/currency/bill_10000.jpg';
import bill50000 from '../assets/currency/bill_50000.jpg';

interface BillVisualProps {
  value: 1000 | 5000 | 10000 | 50000;
  className?: string;
  isFloating?: boolean;
}

const billImages: Record<number, string> = {
  1000: bill1000,
  5000: bill5000,
  10000: bill10000,
  50000: bill50000,
};

const billColors: Record<number, { bg: string; text: string; label: string; portrait: string }> = {
  1000: { bg: 'bg-[#6b92ba]', text: 'text-blue-900', label: '천원', portrait: '퇴계 이황' },
  5000: { bg: 'bg-[#d69f7e]', text: 'text-amber-950', label: '오천원', portrait: '율곡 이이' },
  10000: { bg: 'bg-[#8cb369]', text: 'text-emerald-950', label: '만원', portrait: '세종대왕' },
  50000: { bg: 'bg-[#f4d06f]', text: 'text-yellow-950', label: '오만원', portrait: '신사임당' },
};

export const BillVisual: React.FC<BillVisualProps> = ({
  value,
  className = '',
  isFloating = false,
}) => {
  const [imgError, setImgError] = useState(false);
  const info = billColors[value];
  const imgSrc = billImages[value];

  return (
    <div
      className={`relative w-full aspect-[2.08/1] rounded-sm overflow-hidden select-none border border-black/10 transition-transform ${
        isFloating ? 'shadow-xl drop-shadow-[0_12px_12px_rgba(0,0,0,0.25)]' : 'shadow-md'
      } ${className}`}
    >
      {!imgError && imgSrc ? (
        <img
          src={imgSrc}
          alt={`${value.toLocaleString()}원 지폐`}
          onError={() => setImgError(true)}
          className="w-full h-full object-cover pointer-events-none block"
          loading="eager"
        />
      ) : (
        <div className={`w-full h-full ${info.bg} flex flex-col justify-between p-2 text-stone-900 border-2 border-stone-400`}>
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold font-serif">한국은행 {info.label}</span>
            <span className="text-xs font-bold">{value.toLocaleString()}</span>
          </div>
          <div className="text-center font-serif text-sm font-bold opacity-80">
            {info.portrait}
          </div>
          <div className="flex justify-between items-end">
            <span className="text-base font-black font-sans tracking-tight">{value.toLocaleString()}</span>
            <span className="text-xs font-serif opacity-75">SPECIMEN</span>
          </div>
        </div>
      )}
      {/* Subtle paper texture highlight overlay */}
      <div className="absolute inset-0 bg-gradient-to-tr from-black/5 via-transparent to-white/10 pointer-events-none" />
    </div>
  );
};
