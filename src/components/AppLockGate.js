import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import { Ionicons } from '@expo/vector-icons';
import { useSettings } from '../context/SettingsContext';
import { branding } from '../config/branding';
import { colors, spacing } from '../theme';

// When Biometric App Lock is enabled in Settings, the app content is hidden
// behind this gate until the user authenticates.
export default function AppLockGate({ children }) {
  const { biometricLock, loaded } = useSettings();
  const [unlocked, setUnlocked] = useState(false);
  const [checking, setChecking] = useState(false);

  const authenticate = useCallback(async () => {
    try {
      setChecking(true);
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      if (!hasHardware || !enrolled) {
        // Nothing to authenticate against — don't lock the user out.
        setUnlocked(true);
        return;
      }
      const res = await LocalAuthentication.authenticateAsync({
        promptMessage: `Unlock ${branding.bankName}`,
        fallbackLabel: 'Use passcode',
      });
      if (res.success) setUnlocked(true);
    } catch (e) {
      // leave locked; the user can retry
    } finally {
      setChecking(false);
    }
  }, []);

  useEffect(() => {
    if (!loaded) return;
    if (!biometricLock) {
      setUnlocked(true);
    } else if (!unlocked) {
      authenticate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded, biometricLock]);

  if (!loaded) {
    return (
      <View style={styles.splash}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  if (biometricLock && !unlocked) {
    return (
      <View style={styles.lock}>
        <View style={styles.iconCircle}>
          <Ionicons name="lock-closed" size={40} color={colors.white} />
        </View>
        <Text style={styles.title}>{branding.bankName}</Text>
        <Text style={styles.sub}>App is locked</Text>
        <TouchableOpacity style={styles.btn} onPress={authenticate} activeOpacity={0.85} disabled={checking}>
          <Ionicons name="finger-print" size={20} color={colors.white} />
          <Text style={styles.btnText}>{checking ? 'Authenticating…' : 'Unlock'}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return children;
}

const styles = StyleSheet.create({
  splash: { flex: 1, backgroundColor: colors.screenBg, alignItems: 'center', justifyContent: 'center' },
  lock: { flex: 1, backgroundColor: colors.screenBg, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  title: { fontSize: 22, fontWeight: '800', color: colors.textDark },
  sub: { fontSize: 14, color: colors.textMuted, marginTop: 4, marginBottom: spacing.xl },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.buttonPurple,
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: spacing.xl,
  },
  btnText: { color: colors.white, fontWeight: '800', fontSize: 15, marginLeft: 8 },
});
