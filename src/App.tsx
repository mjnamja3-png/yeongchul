/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { BillValue, CoinValue, CurrencyValue, PlacedItem, AppScreen } from './types';
import { BillVisual } from './components/BillVisual';
import { CoinVisual } from './components/CoinVisual';
import { TraySection } from './components/TraySection';
import { WalletHeader } from './components/WalletHeader';
import { Screen3Success } from './components/Screen3Success';
import { Screen4Returning } from './components/Screen4Returning';
import { calculateChange, ChangeResult } from './utils/changeCalculator';
import { playBillRustleSound, playCoinClinkSound, playPaymentSuccessSound } from './utils/soundEffects';

interface ActiveTouchDrag {
  type: 'bill' | 'coin';
  value: CurrencyValue;
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
}

export default function App() {
  const [requiredAmount, setRequiredAmount] = useState<number>(0);
  const [screen, setScreen] = useState<AppScreen>('PAYMENT_IDLE');
  const [placedItems, setPlacedItems] = useState<PlacedItem[]>([]);
  const [changeResult, setChangeResult] = useState<ChangeResult | null>(null);
  const [isOverTray, setIsOverTray] = useState(false);
  const [touchDrag, setTouchDrag] = useState<ActiveTouchDrag | null>(null);

  const trayRef = useRef<HTMLDivElement>(null);

  // Bill denominations configuration
  const bills: BillValue[] = [1000, 5000, 10000, 50000];
  const coins: CoinValue[] = [10, 100, 500];

  // Sound and placement handler
  const handleAddItemToTray = useCallback((type: 'bill' | 'coin', value: CurrencyValue) => {
    const randomX = 35 + Math.random() * 30; // 35% ~ 65%
    const randomY = 35 + Math.random() * 30; // 35% ~ 65%
    const randomRot = (Math.random() - 0.5) * 24; // -12deg ~ +12deg

    const newItem: PlacedItem = {
      id: `item-${Date.now()}-${Math.random()}`,
      type,
      value,
      x: randomX,
      y: randomY,
      rotation: randomRot,
    };

    setPlacedItems((prev) => [...prev, newItem]);
    setScreen('PAYMENT_PLACED');

    if (type === 'bill') {
      playBillRustleSound();
    } else {
      playCoinClinkSound(value as CoinValue);
    }
  }, []);

  const handleRemovePlacedItem = (id: string) => {
    setPlacedItems((prev) => {
      const target = prev.find((i) => i.id === id);
      if (target) {
        if (target.type === 'bill') {
          playBillRustleSound();
        } else {
          playCoinClinkSound(target.value as CoinValue);
        }
      }
      return prev.filter((item) => item.id !== id);
    });
  };

  const handleClearTray = () => {
    playBillRustleSound();
    setPlacedItems([]);
    setScreen('PAYMENT_IDLE');
  };

  // Payment trigger (Move to Screen 3)
  const handlePay = () => {
    const totalPlaced = placedItems.reduce((acc, i) => acc + i.value, 0);
    if (totalPlaced < requiredAmount || requiredAmount <= 0) return;

    playPaymentSuccessSound();
    const result = calculateChange(totalPlaced, requiredAmount);
    setChangeResult(result);
    setScreen('PAYMENT_SUCCESS');
  };

  // Transition from Screen 3 to Screen 4
  const handleAdvanceToScreen4 = () => {
    setScreen('CHANGE_RETURNING');
  };

  // Transition from Screen 4 back to idle wallet
  const handleFinishScreen4 = () => {
    setPlacedItems([]);
    setScreen('PAYMENT_IDLE');
  };

  const handleResetAll = () => {
    setPlacedItems([]);
    setScreen('PAYMENT_IDLE');
  };

  // HTML5 Desktop Drag Start
  const handleDragStart = (e: React.DragEvent, type: 'bill' | 'coin', value: CurrencyValue) => {
    e.dataTransfer.setData(
      'application/json',
      JSON.stringify({ type, value })
    );
    e.dataTransfer.effectAllowed = 'copy';
  };

  // Mobile Touch / Pointer Dragging implementation
  const handlePointerDown = (type: 'bill' | 'coin', value: CurrencyValue, e: React.PointerEvent) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;

    setTouchDrag({
      type,
      value,
      startX: e.clientX,
      startY: e.clientY,
      currentX: e.clientX,
      currentY: e.clientY,
    });
  };

  useEffect(() => {
    if (!touchDrag) return;

    const onPointerMove = (e: PointerEvent) => {
      setTouchDrag((prev) => prev ? { ...prev, currentX: e.clientX, currentY: e.clientY } : null);

      if (trayRef.current) {
        const rect = trayRef.current.getBoundingClientRect();
        const inside = (
          e.clientX >= rect.left &&
          e.clientX <= rect.right &&
          e.clientY >= rect.top &&
          e.clientY <= rect.bottom
        );
        setIsOverTray(inside);
      }
    };

    const onPointerUp = (e: PointerEvent) => {
      if (touchDrag) {
        const dist = Math.hypot(e.clientX - touchDrag.startX, e.clientY - touchDrag.startY);

        if (trayRef.current) {
          const rect = trayRef.current.getBoundingClientRect();
          const inside = (
            e.clientX >= rect.left &&
            e.clientX <= rect.right &&
            e.clientY >= rect.top &&
            e.clientY <= rect.bottom
          );

          if (inside) {
            handleAddItemToTray(touchDrag.type, touchDrag.value);
          } else if (dist < 10) {
            handleAddItemToTray(touchDrag.type, touchDrag.value);
          }
        } else if (dist < 10) {
          handleAddItemToTray(touchDrag.type, touchDrag.value);
        }
      }

      setTouchDrag(null);
      setIsOverTray(false);
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerUp);

    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerUp);
    };
  }, [touchDrag, handleAddItemToTray]);

  return (
    <div className="min-h-screen bg-[#fcfaf7] flex flex-col items-center justify-start text-stone-900 select-none pb-8">
      {/* Container simulating a mobile or tablet kiosk interface with authentic aesthetics */}
      <div className="w-full max-w-lg min-h-screen bg-white shadow-xl flex flex-col relative border-x border-stone-200">
        
        {/* Clean Header: "영철씨의 지갑" */}
        <WalletHeader onResetAll={handleResetAll} />

        {/* Conditional Screen View: Screen 3 (Payment Success Animation) */}
        {screen === 'PAYMENT_SUCCESS' && changeResult && (
          <Screen3Success
            changeResult={changeResult}
            onAdvance={handleAdvanceToScreen4}
          />
        )}

        {/* Main Wallet Screen (Screen 1 & 2 & 4) */}
        {screen !== 'PAYMENT_SUCCESS' && (
          <main className="flex-1 px-4 py-2 flex flex-col justify-between relative">
            {/* Screen 4 Change Returning Flying Animation Overlay */}
            {screen === 'CHANGE_RETURNING' && changeResult && (
              <Screen4Returning
                changeResult={changeResult}
                onFinished={handleFinishScreen4}
              />
            )}

            {/* TOP GRID: Korean Currency Bills (1,000원, 5,000원, 10,000원, 50,000원) */}
            <section className="w-full my-1">
              <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
                {bills.map((val) => (
                  <div
                    key={val}
                    draggable
                    onDragStart={(e) => handleDragStart(e, 'bill', val)}
                    onPointerDown={(e) => handlePointerDown('bill', val, e)}
                    className="cursor-grab active:cursor-grabbing transform transition-transform hover:-translate-y-0.5 active:scale-97 group touch-none"
                    title={`${val.toLocaleString()}원`}
                  >
                    <BillVisual value={val} />
                    <div className="text-center mt-1">
                      <span className="text-sm font-bold text-stone-800">
                        {val.toLocaleString()}원
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* MIDDLE ROW: Korean Coins (10원, 100원, 500원) */}
            <section className="w-full my-2 py-1">
              <div className="flex items-center justify-around px-2">
                {coins.map((val) => (
                  <div
                    key={val}
                    draggable
                    onDragStart={(e) => handleDragStart(e, 'coin', val)}
                    onPointerDown={(e) => handlePointerDown('coin', val, e)}
                    className="cursor-grab active:cursor-grabbing flex flex-col items-center justify-center p-1 transform transition-transform hover:scale-110 active:scale-95 group touch-none"
                    title={`${val}원`}
                  >
                    <CoinVisual value={val} size={val === 10 ? 64 : val === 100 ? 76 : 88} />
                    <span className="text-sm font-bold text-stone-800 mt-1">
                      {val}원
                    </span>
                  </div>
                ))}
              </div>
            </section>

            {/* BOTTOM AREA: Wooden Tray ("쟁반") & Direct Yellow-box Status Display */}
            <section className="w-full mt-auto">
              <TraySection
                requiredAmount={requiredAmount}
                placedItems={placedItems}
                onDropItem={handleAddItemToTray}
                onRemovePlacedItem={handleRemovePlacedItem}
                onClearTray={handleClearTray}
                onPay={handlePay}
                onUpdateRequiredAmount={setRequiredAmount}
                trayRef={trayRef}
                isOverTray={isOverTray}
              />
            </section>
          </main>
        )}

        {/* Mobile Touch Ghost Element (Follows finger during drag) */}
        {touchDrag && (
          <div
            className="fixed pointer-events-none z-50 transform -translate-x-1/2 -translate-y-1/2 opacity-90 drop-shadow-2xl scale-105"
            style={{
              left: `${touchDrag.currentX}px`,
              top: `${touchDrag.currentY}px`,
            }}
          >
            {touchDrag.type === 'bill' ? (
              <div className="w-36">
                <BillVisual value={touchDrag.value as BillValue} isFloating />
              </div>
            ) : (
              <CoinVisual value={touchDrag.value as CoinValue} size={64} isFloating />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
