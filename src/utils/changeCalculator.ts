import { BillValue, CoinValue } from '../types';

export interface ChangeItem {
  id: string;
  type: 'bill' | 'coin';
  value: BillValue | CoinValue;
  label: string;
}

export interface ChangeResult {
  total: number;
  bills: { value: BillValue; count: number }[];
  coins: { value: CoinValue; count: number }[];
  itemsList: ChangeItem[];
  summaryText: string;
}

export function calculateChange(totalPlaced: number, requiredPrice: number): ChangeResult {
  const changeTotal = Math.max(0, totalPlaced - requiredPrice);
  let remaining = changeTotal;

  const billDenoms: BillValue[] = [50000, 10000, 5000, 1000];
  const coinDenoms: CoinValue[] = [500, 100, 10];

  const bills: { value: BillValue; count: number }[] = [];
  const coins: { value: CoinValue; count: number }[] = [];
  const itemsList: ChangeItem[] = [];

  for (const b of billDenoms) {
    const count = Math.floor(remaining / b);
    if (count > 0) {
      bills.push({ value: b, count });
      remaining %= b;
      for (let i = 0; i < count; i++) {
        itemsList.push({
          id: `change-bill-${b}-${i}-${Date.now()}`,
          type: 'bill',
          value: b,
          label: `${b.toLocaleString()}원 지폐`,
        });
      }
    }
  }

  for (const c of coinDenoms) {
    const count = Math.floor(remaining / c);
    if (count > 0) {
      coins.push({ value: c, count });
      remaining %= c;
      for (let i = 0; i < count; i++) {
        itemsList.push({
          id: `change-coin-${c}-${i}-${Date.now()}`,
          type: 'coin',
          value: c,
          label: `${c}원 동전`,
        });
      }
    }
  }

  const parts: string[] = [];
  bills.forEach((b) => parts.push(`${b.value.toLocaleString()}원 ${b.count}장`));
  coins.forEach((c) => parts.push(`${c.value}원 ${c.count}개`));

  const summaryText = parts.length > 0 ? parts.join(', ') : '거스름돈 없음';

  return {
    total: changeTotal,
    bills,
    coins,
    itemsList,
    summaryText,
  };
}
