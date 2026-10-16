export type BillValue = 1000 | 5000 | 10000 | 50000;
export type CoinValue = 10 | 100 | 500;
export type CurrencyValue = BillValue | CoinValue;

export interface PlacedItem {
  id: string;
  type: 'bill' | 'coin';
  value: CurrencyValue;
  x: number; // percentage offset inside tray
  y: number;
  rotation: number; // slight realistic random angle
}

export interface Scenario {
  id: string;
  title: string;
  amount: number;
  description: string;
}

export type AppScreen = 
  | 'PAYMENT_IDLE'     // Screen 1: Empty tray, ready to pay
  | 'PAYMENT_PLACED'   // Screen 2: Money placed on tray
  | 'PAYMENT_SUCCESS'  // Screen 3: Open wallet with falling gold coins/bills
  | 'CHANGE_RETURNING' // Screen 4: Change flying back to wallet with motion blur
  | 'TRANSACTION_DONE'; // Completed, ready for next round
