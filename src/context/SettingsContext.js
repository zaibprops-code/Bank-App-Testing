import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// App-wide user preferences, persisted to the device so they survive restarts.
const KEY = '@bankapp_settings_v1';

const defaults = {
  showBalanceOnHome: false, // reveal the balance on the Home card by default
  biometricLock: false, // require fingerprint / Face ID on app open
  transactionAlerts: true, // show transaction notifications
};

const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(defaults);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(KEY);
        if (raw) setSettings({ ...defaults, ...JSON.parse(raw) });
      } catch (e) {
        // ignore corrupt storage, fall back to defaults
      } finally {
        setLoaded(true);
      }
    })();
  }, []);

  const update = (patch) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      AsyncStorage.setItem(KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  };

  return (
    <SettingsContext.Provider value={{ ...settings, loaded, update }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used inside SettingsProvider');
  return ctx;
}
