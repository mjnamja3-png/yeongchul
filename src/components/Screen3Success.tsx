import React, { useEffect, useState } from 'react';
import walletStandingImg from '../assets/images/wallet_standing.jpg';
import walletOpenImg from '../assets/images/wallet_open.jpg';
import { CoinVisual } from './CoinVisual';
import { BillVisual } from './BillVisual';
import { ChangeResult } from '../utils/changeCalculator';
import { ArrowRight, Sparkles } from 'lucide-react';

interface Screen3SuccessProps {
  changeResult: ChangeResult;
  onAdvance: () => void;
}

export const Screen3Success: React.FC<Screen3SuccessProps> = ({
  changeResult,
  onAdvance,
}) => {
  const [walletLoaded, setWalletLoaded] = useState(true);
  const [walletSrc, setWalletSrc] = useState(walletStandingImg);
  const [secondsLeft, setSecondsLeft] = useState(3);

  // Auto advance countdown after 3 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onAdvance();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onAdvance]);

  // Shimmering stream of floating gold coins & bills
  const particleCoins = [
    { id: 1, val: 500 as const, left: '26%', top: '12%', delay: '0s', dur: '1.4s', rot: -15 },
    { id: 2, val: 100 as const, left: '48%', top: '6%', delay: '0.2s', dur: '1.3s', rot: 25 },
    { id: 3, val: 500 as const, left: '62%', top: '16%', delay: '0.4s', dur: '1.5s', rot: -8 },
    { id: 4, val: 10 as const, left: '38%', top: '22%', delay: '0.15s', dur: '1.2s', rot: 18 },
    { id: 5, val: 100 as const, left: '54%', top: '28%', delay: '0.35s', dur: '1.4s', rot: -22 },
  ];

  return (
    <div className="relative min-h-[680px] w-full flex flex-col items-center justify-between py-6 px-4 bg-white select-none">
      {/* Top Greeting Message */}
      <div className="text-center pt-2 pb-2">
        <h1 className="font-calligraphy font-bold text-3xl sm:text-4xl text-stone-900 tracking-wider leading-relaxed">
          감사합니다!
        </h1>
        <h2 className="font-calligraphy font-bold text-2xl sm:text-3xl text-stone-800 tracking-wide mt-1">
          다음번에 또 오세요!
        </h2>
      </div>

      {/* Center Visual: Open Black Leather Wallet with dynamic stream of falling gold coins & bills */}
      <div className="relative w-full max-w-[360px] h-[340px] flex items-center justify-center my-2">
        {/* Floating/Falling stream of gold coins into wallet */}
        <div className="absolute inset-x-0 top-0 h-[210px] pointer-events-none z-20 overflow-visible">
          {/* Animated Gold Coins */}
          {particleCoins.map((p) => (
            <div
              key={p.id}
              className="absolute transform -translate-x-1/2 drop-shadow-lg"
              style={{
                left: p.left,
                top: p.top,
                animation: `coinStreamFall ${p.dur} ease-in-out infinite`,
                animationDelay: p.delay,
              }}
            >
              <CoinVisual value={p.val} size={52} isFloating={false} />
            </div>
          ))}

          {/* Animated Bills floating gently down */}
          <div
            className="absolute left-[30%] top-[4%] w-24 transform -translate-x-1/2 drop-shadow-md"
            style={{
              animation: 'billStreamFall 1.8s ease-in-out infinite',
              animationDelay: '0.3s',
            }}
          >
            <BillVisual value={1000} />
          </div>

          <div
            className="absolute left-[64%] top-[10%] w-28 transform -translate-x-1/2 drop-shadow-md"
            style={{
              animation: 'billStreamFall 2.1s ease-in-out infinite',
              animationDelay: '0.6s',
            }}
          >
            <BillVisual value={10000} />
          </div>

          {/* Golden sparkles around the stream */}
          <div className="absolute left-[20%] top-[18%] text-amber-400 animate-pulse">
            <Sparkles className="w-5 h-5 fill-amber-300" />
          </div>
          <div className="absolute right-[22%] top-[8%] text-yellow-400 animate-ping">
            <Sparkles className="w-4 h-4 fill-yellow-200" />
          </div>
          <div className="absolute left-[45%] top-[2%] text-amber-500 animate-pulse">
            <Sparkles className="w-6 h-6 fill-amber-300" />
          </div>
        </div>

        {/* The Open Black Leather Wallet */}
        <div className="relative w-[300px] sm:w-[330px] aspect-square rounded-2xl overflow-hidden shadow-2xl border border-stone-200/80 bg-stone-900 z-10 flex items-center justify-center">
          {walletLoaded ? (
            <img
              src={walletSrc}
              alt="열려있는 검정 가죽 지갑"
              onError={() => {
                if (walletSrc !== walletOpenImg) {
                  setWalletSrc(walletOpenImg);
                } else {
                  setWalletLoaded(false);
                }
              }}
              className="w-full h-full object-cover object-center"
            />
          ) : (
            <div className="w-full h-full bg-[#1c1917] p-6 flex flex-col justify-between text-stone-200 border-4 border-stone-800">
              <div className="text-center font-calligraphy text-amber-400 text-lg">
                가죽 지갑
              </div>
              <div className="h-32 border-2 border-dashed border-stone-700 rounded-lg flex items-center justify-center text-sm text-stone-400">
                거스름돈 보관함
              </div>
            </div>
          )}

          {/* Subtle golden ambient glow inside wallet mouth */}
          <div className="absolute inset-x-8 top-12 h-20 bg-amber-400/20 blur-xl pointer-events-none rounded-full" />
        </div>
      </div>

      {/* Bottom Text: 거스름 돈: 13500원 입금되었습니다! */}
      <div className="text-center w-full max-w-sm pt-2">
        <div className="font-bold text-2xl sm:text-3xl text-stone-900 tracking-widest">
          거 스 름 돈 :
        </div>
        <div className="font-bold text-4xl sm:text-5xl text-emerald-700 my-1 tracking-tight">
          {changeResult.total.toLocaleString()}원
        </div>
        <div className="font-bold text-2xl sm:text-3xl text-stone-900 tracking-tight">
          입금되었습니다!
        </div>

        {changeResult.summaryText !== '거스름돈 없음' && (
          <div className="mt-2 text-sm text-stone-600 bg-amber-50/80 border border-amber-200 rounded-lg py-1.5 px-3 inline-block">
            {changeResult.summaryText}
          </div>
        )}

        {/* Auto-advance status button */}
        <div className="mt-5 flex justify-center">
          <button
            onClick={onAdvance}
            className="flex items-center gap-2 px-6 py-3 bg-stone-900 hover:bg-black text-white text-base font-bold rounded-xl shadow-lg transition-transform active:scale-95 cursor-pointer"
          >
            <span>지갑으로 돌아가기</span>
            <span className="text-xs bg-stone-700 px-2 py-0.5 rounded-full font-mono">
              {secondsLeft}초
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
