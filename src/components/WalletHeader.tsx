import React from 'react';
import { RotateCcw } from 'lucide-react';

interface WalletHeaderProps {
  onResetAll?: () => void;
}

export const WalletHeader: React.FC<WalletHeaderProps> = ({ onResetAll }) => {
  return (
    <header className="w-full pt-5 pb-3 bg-white select-none">
      <div className="max-w-xl mx-auto px-4 flex items-center justify-between relative">
        <div className="w-8"></div>
        {/* Main Title: "영철씨의 지갑" in authentic Gungsuh style */}
        <h1 className="font-bold text-4xl sm:text-5xl text-stone-950 tracking-widest text-center flex-1">
          영철씨의 지갑
        </h1>

        {/* Minimal reset button */}
        {onResetAll ? (
          <button
            onClick={onResetAll}
            className="w-8 h-8 flex items-center justify-center text-stone-400 hover:text-stone-700 transition-colors cursor-pointer"
            title="초기화"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        ) : (
          <div className="w-8"></div>
        )}
      </div>
    </header>
  );
};
