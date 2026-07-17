import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { account as accountConfig } from '../config/branding';

const AccountContext = createContext(null);

const STORAGE_KEY = '@bankapp_state_v2';

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

// ---- Account identity (name -> account number + IBAN) --------------------
//
// Pakistan IBANs are 24 characters: PK + 2 check digits + a 4-letter bank code
// (MEZN for Meezan) + "00" + a 4-digit branch code + a 10-digit customer number.
// The customer's account number is therefore the 14 digits (branch + number).
// We generate a fresh, unique 14-digit account number and derive a VALID IBAN
// from it (ISO 13616 mod-97 check digits), so every setup/name-save is unique.

function randomDigits(n) {
  let s = '';
  for (let i = 0; i < n; i++) s += Math.floor(Math.random() * 10);
  return s;
}

function ibanFromAccount(account14) {
  const bban = 'MEZN00' + account14; // 20 chars: bank + 00 + 14-digit account
  const rearranged = bban + 'PK00'; // move country code + placeholder to the end
  let numeric = '';
  for (const ch of rearranged) {
    numeric += /[0-9]/.test(ch) ? ch : String(ch.charCodeAt(0) - 55); // A=10 … Z=35
  }
  let rem = 0;
  for (const d of numeric) rem = (rem * 10 + Number(d)) % 97;
  const check = String(98 - rem).padStart(2, '0');
  return 'PK' + check + bban; // 24 chars
}

const group = (str, size) => str.replace(new RegExp(`(.{${size}})(?=.)`, 'g'), '$1 ');

// Unique account number + IBAN for a freshly set-up / renamed account.
export function generateIdentity() {
  const account14 = randomDigits(14);
  return {
    accountNumber: group(account14, 4), // e.g. "0101 2345 6789 01"
    iban: group(ibanFromAccount(account14), 4), // e.g. "PK10 MEZN 0001 0112 3456 7890"
  };
}

// Names are always stored (and shown) in capital letters.
function normalizeName(name) {
  return String(name || '').trim().replace(/\s+/g, ' ').toUpperCase();
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
// Identity/account details come from src/config/branding.js
const initialState = {
  accountTitle: accountConfig.title,
  accountLabel: accountConfig.accountLabel,
  accountNumber: accountConfig.accountNumber,
  iban: accountConfig.iban,
  branch: accountConfig.branch,
  balance: accountConfig.openingBalance,
  setupComplete: false, // becomes true once the user enters their name on first launch
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

  // Build the profile fields for a (re)named account: the capitalised name plus
  // a fresh, unique account number and IBAN.
  function buildProfile(name) {
    const clean = normalizeName(name);
    if (!clean) throw new Error('Please enter your name.');
    const id = generateIdentity();
    return { accountTitle: clean, accountNumber: id.accountNumber, iban: id.iban };
  }

  // First-run setup: the user enters their name and gets an account.
  function setupProfile(name) {
    const p = buildProfile(name);
    setState((prev) => ({ ...prev, ...p, setupComplete: true }));
    return p.accountTitle;
  }

  // Update the account holder's name. Each save also regenerates a unique
  // account number and IBAN. Persisted with the rest of the state, so the name
  // flows through the whole app (home greeting, receipts, profile, etc.).
  function updateAccountTitle(name) {
    const p = buildProfile(name);
    setState((prev) => ({ ...prev, ...p }));
    return p.accountTitle;
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
    setupProfile,
    updateAccountTitle,
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
