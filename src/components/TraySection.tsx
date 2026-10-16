import React, { useRef, useState, useEffect } from 'react';
import woodenTrayImg from '../assets/images/wooden_tray.jpg';
import { PlacedItem, CurrencyValue } from '../types';
import { BillVisual } from './BillVisual';
import { CoinVisual } from './CoinVisual';
import { RotateCcw, CheckCircle, ArrowDown } from 'lucide-react';

interface TraySectionProps {
  requiredAmount: number;
  placedItems: PlacedItem[];
  onDropItem: (type: 'bill' | 'coin', value: CurrencyValue) => void;
  onRemovePlacedItem: (id: string) => void;
  onClearTray: () => void;
  onPay: () => void;
  onUpdateRequiredAmount: (newAmount: number) => void;
  trayRef: React.RefObject<HTMLDivElement | null>;
  isOverTray?: boolean;
}

export const TraySection: React.FC<TraySectionProps> = ({
  requiredAmount,
  placedItems,
  onDropItem,
  onRemovePlacedItem,
  onClearTray,
  onPay,
  onUpdateRequiredAmount,
  trayRef,
  isOverTray = false,
}) => {
  const [inputVal, setInputVal] = useState(requiredAmount > 0 ? requiredAmount.toString() : '');

  const totalPlaced = placedItems.reduce((sum, item) => sum + item.value, 0);
  const isSufficient = totalPlaced >= requiredAmount && requiredAmount > 0;
  const difference = totalPlaced - requiredAmount;

  // Sync input value if external requiredAmount changes
  useEffect(() => {
    if (requiredAmount > 0) {
      setInputVal(requiredAmount.toString());
    } else {
      setInputVal('');
    }
  }, [requiredAmount]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/g, '');
    setInputVal(raw);
    const parsed = parseInt(raw, 10);
    if (!isNaN(parsed) && parsed > 0) {
      onUpdateRequiredAmount(parsed);
    } else {
      onUpdateRequiredAmount(0);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    try {
      const dataStr = e.dataTransfer.getData('application/json') || e.dataTransfer.getData('text/plain');
      if (dataStr) {
        const parsed = JSON.parse(dataStr);
        if (parsed.value) {
          onDropItem(parsed.type, parsed.value);
        }
      }
    } catch (err) {
      console.warn('Drop parse error:', err);
    }
  };

  return (
    <div className="w-full mt-2 flex flex-col sm:flex-row items-center sm:items-stretch justify-between gap-3">
      {/* Left Payment Status Display */}
      <div className="w-full sm:w-1/2 flex flex-col items-center sm:items-start text-center sm:text-left py-1 shrink-0">
        <span className="text-2xl sm:text-3xl font-bold text-stone-900 tracking-wider">
          결제하실 금액:
        </span>

        {/* Clean, prominent yellow-bordered input box with faint placeholder */}
        <div className="my-2 flex items-center">
          <div className="rounded-2xl px-3 py-1 bg-[#fffdf0] border-4 border-[#eab308] shadow-sm flex items-center gap-1.5 focus-within:ring-2 focus-within:ring-amber-400">
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={inputVal}
              onChange={handleInputChange}
              placeholder="금액 입력"
              className="w-28 sm:w-32 text-center font-bold text-2xl sm:text-3xl text-stone-950 bg-transparent border-none focus:outline-hidden placeholder:text-stone-300 placeholder:font-normal"
            />
            <span className="text-2xl sm:text-3xl font-bold text-stone-900 shrink-0">
              원
            </span>
          </div>
        </div>

        {/* Amount placed on tray */}
        <div className="w-full max-w-[240px] bg-stone-100/90 border border-stone-300 rounded-xl p-2.5 my-1 shadow-xs">
          <div className="flex justify-between items-center text-sm font-medium text-stone-600 mb-1">
            <span>올려놓은 금액</span>
            <span className="font-bold text-base text-stone-900">
              {totalPlaced.toLocaleString()}원
            </span>
          </div>

          {/* Difference indicator */}
          {requiredAmount === 0 ? (
            <div className="text-xs text-stone-500 font-medium mt-1">
              금액을 입력해주세요
            </div>
          ) : totalPlaced === 0 ? (
            <div className="text-xs text-amber-800 flex items-center justify-center sm:justify-start gap-1 font-medium mt-1">
              <ArrowDown className="w-3.5 h-3.5 animate-bounce" />
              <span>지폐나 동전을 쟁반에 놓아주세요</span>
            </div>
          ) : isSufficient ? (
            <div className="text-xs font-bold text-emerald-800 flex items-center justify-between mt-1 bg-emerald-50 px-2 py-0.5 rounded">
              <span>거스름돈 예상:</span>
              <span className="text-sm text-emerald-700">+{difference.toLocaleString()}원</span>
            </div>
          ) : (
            <div className="text-xs font-bold text-rose-700 flex items-center justify-between mt-1 bg-rose-50 px-2 py-0.5 rounded">
              <span>부족한 금액:</span>
              <span className="text-sm">{(requiredAmount - totalPlaced).toLocaleString()}원</span>
            </div>
          )}
        </div>

        {/* Action Buttons: Pay Now & Clear */}
        <div className="flex items-center gap-2 w-full max-w-[240px] mt-1.5">
          {placedItems.length > 0 && (
            <button
              onClick={onClearTray}
              type="button"
              className="p-3 bg-stone-200 hover:bg-stone-300 active:bg-stone-400 text-stone-700 font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center cursor-pointer"
              title="쟁반 비우기"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          )}

          <button
            onClick={onPay}
            disabled={!isSufficient || requiredAmount <= 0}
            className={`flex-1 py-3 px-3 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md ${
              isSufficient && requiredAmount > 0
                ? 'bg-emerald-700 hover:bg-emerald-800 active:scale-98 text-white animate-pay-pulse ring-4 ring-emerald-500/30'
                : 'bg-stone-300 text-stone-500 cursor-not-allowed opacity-75'
            }`}
          >
            <CheckCircle className="w-5 h-5" />
            <span>결제하기</span>
          </button>
        </div>
      </div>

      {/* Right: The Wooden Tray ("쟁반") as Drop Zone */}
      <div className="w-full sm:w-1/2 flex flex-col items-center justify-center">
        <div
          ref={trayRef}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className={`relative w-full max-w-[280px] sm:max-w-[300px] aspect-[1.15/1] rounded-2xl overflow-hidden shadow-2xl transition-all border-4 select-none ${
            isOverTray
              ? 'border-emerald-500 ring-4 ring-emerald-400/40 scale-[1.02]'
              : 'border-[#8c5a2c]/60'
          }`}
          style={{
            backgroundImage: `url(${woodenTrayImg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          {/* Bevel rim effect */}
          <div className="absolute inset-0 shadow-[inset_0_4px_16px_rgba(0,0,0,0.5)] pointer-events-none rounded-xl" />

          {/* Tray guide overlay if empty */}
          {placedItems.length === 0 && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-[#4a2e16] pointer-events-none p-3">
              <div className="w-10 h-10 rounded-full bg-[#f4ece1]/80 shadow-md flex items-center justify-center mb-1.5 animate-bounce">
                <ArrowDown className="w-5 h-5 text-[#7c4d21]" />
              </div>
              <span className="font-bold text-base text-[#3d2410] drop-shadow-xs">
                나무 쟁반
              </span>
              <span className="text-xs text-[#573517] font-medium">
                돈을 여기로 끌어다 놓으세요
              </span>
            </div>
          )}

          {/* Placed Currency Items inside the Tray */}
          <div className="absolute inset-3 overflow-hidden pointer-events-auto">
            {placedItems.map((item, index) => {
              const isBill = item.type === 'bill';
              return (
                <div
                  key={item.id}
                  onClick={() => onRemovePlacedItem(item.id)}
                  className="absolute cursor-pointer transition-transform hover:scale-105 active:scale-95 group"
                  style={{
                    left: `${item.x}%`,
                    top: `${item.y}%`,
                    transform: `translate(-50%, -50%) rotate(${item.rotation}deg)`,
                    zIndex: 10 + index,
                  }}
                  title="누르면 지갑으로 다시 들어갑니다"
                >
                  {isBill ? (
                    <div className="w-32 sm:w-36 drop-shadow-lg">
                      <BillVisual value={item.value as 1000 | 5000 | 10000 | 50000} />
                      <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-stone-900/80 text-white rounded-full text-[10px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        ✕
                      </div>
                    </div>
                  ) : (
                    <div className="drop-shadow-lg relative">
                      <CoinVisual value={item.value as 10 | 100 | 500} size={48} />
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-stone-900/80 text-white rounded-full text-[9px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        ✕
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Gentle helper note at tray bottom */}
          {placedItems.length > 0 && (
            <div className="absolute bottom-1.5 inset-x-0 text-center pointer-events-none">
              <span className="text-[10px] font-bold text-[#3d2410] bg-[#faebd7]/90 px-2 py-0.5 rounded-full shadow-xs">
                누르면 지갑으로 돌아갑니다
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
