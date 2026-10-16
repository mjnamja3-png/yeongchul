import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChangeResult, ChangeItem } from '../utils/changeCalculator';
import { BillVisual } from './BillVisual';
import { CoinVisual } from './CoinVisual';
import { playBillRustleSound, playCoinClinkSound } from '../utils/soundEffects';
import { Sparkles, CheckCircle2 } from 'lucide-react';

interface Screen4ReturningProps {
  changeResult: ChangeResult;
  onFinished: () => void;
}

export const Screen4Returning: React.FC<Screen4ReturningProps> = ({
  changeResult,
  onFinished,
}) => {
  const [completedItems, setCompletedItems] = useState<Set<string>>(new Set());
  const [isAllDone, setIsAllDone] = useState(false);

  // Targets corresponding to where items belong on the wallet grid:
  // 1000: Top-left bill slot
  // 5000: Top-right bill slot
  // 10000: Bottom-left bill slot
  // 50000: Bottom-right bill slot
  // 10, 100, 500: Middle coin slots
  const getDestination = (item: ChangeItem) => {
    switch (item.value) {
      case 1000:
        return { x: -75, y: -290 };
      case 5000:
        return { x: 75, y: -290 };
      case 10000:
        return { x: -75, y: -200 };
      case 50000:
        return { x: 75, y: -200 };
      case 10:
        return { x: -90, y: -110 };
      case 100:
        return { x: 0, y: -110 };
      case 500:
        return { x: 90, y: -110 };
      default:
        return { x: 0, y: -200 };
    }
  };

  useEffect(() => {
    // Stagger arrival of each change item
    const items = changeResult.itemsList;
    if (items.length === 0) {
      setIsAllDone(true);
      const timer = setTimeout(onFinished, 1200);
      return () => clearTimeout(timer);
    }

    const timers: NodeJS.Timeout[] = [];

    items.forEach((item, index) => {
      // Stagger delay ~250ms per item
      const delay = 400 + index * 280;

      const timer = setTimeout(() => {
        // Play sound when this item reaches its destination
        if (item.type === 'bill') {
          playBillRustleSound();
        } else {
          playCoinClinkSound(item.value);
        }

        setCompletedItems((prev) => new Set([...prev, item.id]));

        // If last item
        if (index === items.length - 1) {
          setTimeout(() => {
            setIsAllDone(true);
            setTimeout(onFinished, 1400);
          }, 350);
        }
      }, delay + 650);

      timers.push(timer);
    });

    return () => {
      timers.forEach(clearTimeout);
    };
  }, [changeResult, onFinished]);

  return (
    <div className="absolute inset-0 z-50 pointer-events-none flex flex-col items-center justify-center overflow-hidden">
      {/* Dim backdrop overlay */}
      <div className="absolute inset-0 bg-stone-900/15 backdrop-blur-[1px]" />

      {/* Floating Change Banner at top */}
      <div className="absolute top-16 inset-x-4 flex justify-center z-50">
        <div className="bg-stone-900/95 text-white py-3 px-6 rounded-2xl shadow-2xl border border-amber-400/50 flex items-center gap-3">
          {isAllDone ? (
            <CheckCircle2 className="w-6 h-6 text-emerald-400 animate-bounce" />
          ) : (
            <Sparkles className="w-6 h-6 text-amber-300 animate-spin" />
          )}
          <div>
            <div className="font-bold text-lg text-amber-300">
              거스름돈 {changeResult.total.toLocaleString()}원 반환 중
            </div>
            <div className="text-xs text-stone-300 font-medium">
              {isAllDone
                ? '지갑에 안전하게 넣었습니다!'
                : '지갑 속 제자리로 날아들어갑니다 (흐리게 날라오는 효과)'}
            </div>
          </div>
        </div>
      </div>

      {/* Origin: The Tray (bottom area) -> Destination: Wallet slots (top area) */}
      <div className="relative w-full max-w-md h-full flex items-center justify-center">
        {changeResult.itemsList.map((item, index) => {
          const dest = getDestination(item);
          const isBill = item.type === 'bill';
          const isDone = completedItems.has(item.id);

          return (
            <motion.div
              key={item.id}
              initial={{
                x: 0 + (index % 3 - 1) * 20,
                y: 190 + Math.floor(index / 3) * 15,
                scale: 0.85,
                opacity: 0,
                filter: 'blur(6px)',
              }}
              animate={{
                x: [
                  0 + (index % 3 - 1) * 20,
                  dest.x * 0.4,
                  dest.x,
                ],
                y: [
                  190 + Math.floor(index / 3) * 15,
                  dest.y * 0.6,
                  dest.y,
                ],
                scale: [0.85, 1.08, 1.0],
                opacity: [0, 1, isDone ? 0.3 : 1],
                filter: [
                  'blur(7px)', // High motion blur during launch
                  'blur(4px)', // Mid-flight blur
                  'blur(0px)', // Crystal clear upon landing
                ],
              }}
              transition={{
                duration: 0.85,
                delay: 0.3 + index * 0.28,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="absolute z-40 select-none"
            >
              {isBill ? (
                <div className="w-36 drop-shadow-2xl">
                  <BillVisual value={item.value as 1000 | 5000 | 10000 | 50000} />
                </div>
              ) : (
                <div className="drop-shadow-2xl">
                  <CoinVisual value={item.value as 10 | 100 | 500} size={54} />
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
