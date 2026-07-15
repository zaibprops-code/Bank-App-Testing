import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AccountContext = createContext(null);

const STORAGE_KEY = '@bankapp_state_v1';

// ---- Logic helpers -------------------------------------------------------

// Generates a unique transaction ID on EVERY transaction.
// Format example: TXN-20260715-8F3K9Q2A
export function generateTxnId() {
  const now = new Date();
  const datePart =
    now.getFullYear().toString() +
    String(now.getMonth() + 1).padStart(2, '0') +
    String(now.getDate()).padStart(2, '0');
  const rand = Math.random().toString(36).substring(2, 10).toUpperCase();
  return `TXN-${datePart}-${rand}`;
}

// A separate bank-style reference number, also unique per transaction.
export function generateReference() {
  return Math.floor(100000000000 + Math.random() * 899999999999).toString();
}

export function formatMoney(amount) {
  return (
    'PKR ' +
    Number(amount).toLocaleString('en-PK', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  );
}

// The default / seed state used the first time the app runs.
const initialState = {
  accountTitle: 'UZAIR WAHID',
  accountNumber: '0102 0105 1234 5678',
  iban: 'PK36 MEZN 0001 0201 0512 3456',
  balance: 125430.75,
  transactions: [
    {
      id: 'TXN-20260714-SEED0001',
      reference: '482910375561',
      type: 'credit',
      title: 'Salary Credit',
      counterparty: 'ACME PVT LTD',
      amount: 85000,
      balanceAfter: 125430.75,
      date: '2026-07-14T09:12:00.000Z',
      status: 'Completed',
    },
    {
      id: 'TXN-20260713-SEED0002',
      reference: '193847562019',
      type: 'debit',
      title: 'Mobile Topup',
      counterparty: 'Jazz 0300-1234567',
      amount: 500,
      balanceAfter: 40430.75,
      date: '2026-07-13T18:45:00.000Z',
      status: 'Completed',
    },
  ],
};

export function AccountProvider({ children }) {
  const [state, setState] = useState(initialState);
  const [loaded, setLoaded] = useState(false);

  // Load saved state from the phone on startup.
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) setState(JSON.parse(raw));
      } catch (e) {
        // ignore corrupt storage, fall back to seed
      } finally {
        setLoaded(true);
      }
    })();
  }, []);

  // Persist to the phone whenever state changes.
  useEffect(() => {
    if (loaded)
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)).catch(() => {});
  }, [state, loaded]);

  // Core money-movement logic. Returns the created transaction (with its
  // freshly generated unique id) or throws an Error the UI can display.
  function sendMoney({ counterparty, amount, title = 'Send Money' }) {
    const value = Number(amount);
    if (!counterparty || counterparty.trim().length === 0) {
      throw new Error('Please enter a recipient account/number.');
    }
    if (!value || value <= 0) {
      throw new Error('Please enter a valid amount.');
    }
    if (value > state.balance) {
      throw new Error('Insufficient balance for this transaction.');
    }

    const balanceAfter = Number((state.balance - value).toFixed(2));
    const txn = {
      id: generateTxnId(), // <-- unique on every transaction
      reference: generateReference(), // <-- unique reference too
      type: 'debit',
      title,
      counterparty: counterparty.trim(),
      amount: value,
      balanceAfter,
      date: new Date().toISOString(),
      status: 'Completed',
    };

    setState((prev) => ({
      ...prev,
      balance: balanceAfter,
      transactions: [txn, ...prev.transactions],
    }));

    return txn;
  }

  // Generic credit (used by the demo "Add money" action).
  function receiveMoney({ counterparty, amount, title = 'Credit' }) {
    const value = Number(amount);
    if (!value || value <= 0) throw new Error('Please enter a valid amount.');
    const balanceAfter = Number((state.balance + value).toFixed(2));
    const txn = {
      id: generateTxnId(),
      reference: generateReference(),
      type: 'credit',
      title,
      counterparty: (counterparty || 'Deposit').trim(),
      amount: value,
      balanceAfter,
      date: new Date().toISOString(),
      status: 'Completed',
    };
    setState((prev) => ({
      ...prev,
      balance: balanceAfter,
      transactions: [txn, ...prev.transactions],
    }));
    return txn;
  }

  const value = {
    ...state,
    loaded,
    sendMoney,
    receiveMoney,
    formatMoney,
  };

  return (
    <AccountContext.Provider value={value}>{children}</AccountContext.Provider>
  );
}

export function useAccount() {
  const ctx = useContext(AccountContext);
  if (!ctx) throw new Error('useAccount must be used inside AccountProvider');
  return ctx;
}
