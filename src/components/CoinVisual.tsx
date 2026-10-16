import React, { useState } from 'react';
import coin10Real from '../assets/currency/coin_10_real.jpg';
import coin100Real from '../assets/currency/coin_100_real.jpg';
import coin500Real from '../assets/currency/coin_500_real.jpg';

interface CoinVisualProps {
  value: 10 | 100 | 500;
  size?: number;
  className?: string;
  isFloating?: boolean;
}

const coinImages: Record<number, string> = {
  10: coin10Real,
  100: coin100Real,
  500: coin500Real,
};

export const CoinVisual: React.FC<CoinVisualProps> = ({
  value,
  size = 80,
  className = '',
  isFloating = false,
}) => {
  const [imgError, setImgError] = useState(false);

  // Scaled dimensions according to real Korean coin diameters:
  // 10 won: smallest
  // 100 won: medium
  // 500 won: largest
  const scale = value === 10 ? 0.82 : value === 100 ? 0.98 : 1.15;
  const actualSize = Math.round(size * scale);
  const imgSrc = coinImages[value];

  return (
    <div
      style={{ width: `${actualSize}px`, height: `${actualSize}px` }}
      className={`relative inline-flex items-center justify-center select-none rounded-full transition-transform ${
        isFloating ? 'animate-bounce drop-shadow-md' : 'hover:scale-105 active:scale-95'
      } ${className}`}
    >
      {!imgError && imgSrc ? (
        <div className="w-full h-full rounded-full overflow-hidden">
          <img
            src={imgSrc}
            alt={`${value}원 동전`}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover object-center rounded-full pointer-events-none scale-[1.24]"
            loading="eager"
          />
        </div>
      ) : (
        <div className="w-full h-full rounded-full bg-stone-300 border border-stone-500 flex flex-col items-center justify-center text-stone-800 font-bold">
          <span className="text-xs">{value}</span>
          <span className="text-[10px]">한국은행</span>
        </div>
      )}
    </div>
  );
};
