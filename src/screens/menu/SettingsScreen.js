import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as LocalAuthentication from 'expo-local-authentication';
import { Ionicons } from '@expo/vector-icons';
import { useSettings } from '../../context/SettingsContext';
import { colors, spacing } from '../../theme';

const BEN_KEY = '@bankapp_beneficiaries';

export default function SettingsScreen() {
  const settings = useSettings();
  const [busy, setBusy] = useState(false);

  const toggleBiometric = async (value) => {
    if (!value) {
      settings.update({ biometricLock: false });
      return;
    }
    try {
      setBusy(true);
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      if (!hasHardware || !enrolled) {
        Alert.alert(
          'Not available',
          'No fingerprint or face unlock is set up on this device. Add one in your phone settings first.'
        );
        return;
      }
      const res = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Confirm to enable App Lock',
      });
      if (res.success) {
        settings.update({ biometricLock: true });
        Alert.alert('App Lock enabled', 'You will be asked to authenticate when opening the app.');
      }
    } catch (e) {
      Alert.alert('Error', 'Could not enable App Lock. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const clearFavorites = () => {
    Alert.alert('Clear favorite payees', 'Remove all saved favorite payees? This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear',
        style: 'destructive',
        onPress: async () => {
          try {
            await AsyncStorage.removeItem(BEN_KEY);
            Alert.alert('Done', 'All favorite payees have been removed.');
          } catch (e) {
            Alert.alert('Error', 'Could not clear favorite payees.');
          }
        },
      },
    ]);
  };

  const ToggleRow = ({ icon, title, subtitle, value, onValueChange, disabled }) => (
    <View style={styles.row}>
      <View style={styles.rowIcon}>
        <Ionicons name={icon} size={20} color={colors.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.rowTitle}>{title}</Text>
        {!!subtitle && <Text style={styles.rowSub}>{subtitle}</Text>}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        trackColor={{ true: colors.primaryLight, false: '#CFCFD4' }}
        thumbColor={colors.white}
      />
    </View>
  );

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.body}>
      <Text style={styles.section}>Preferences</Text>
      <View style={styles.card}>
        <ToggleRow
          icon="eye-outline"
          title="Show balance on Home"
          subtitle="Reveal your balance without tapping"
          value={settings.showBalanceOnHome}
          onValueChange={(v) => settings.update({ showBalanceOnHome: v })}
        />
        <ToggleRow
          icon="notifications-outline"
          title="Transaction alerts"
          subtitle="Get notified about account activity"
          value={settings.transactionAlerts}
          onValueChange={(v) => settings.update({ transactionAlerts: v })}
        />
      </View>

      <Text style={styles.section}>Security</Text>
      <View style={styles.card}>
        <ToggleRow
          icon="finger-print-outline"
          title="Biometric App Lock"
          subtitle="Require fingerprint / Face ID to open"
          value={settings.biometricLock}
          onValueChange={toggleBiometric}
          disabled={busy}
        />
      </View>

      <Text style={styles.section}>Data</Text>
      <View style={styles.card}>
        <TouchableOpacity style={styles.actionRow} activeOpacity={0.7} onPress={clearFavorites}>
          <View style={styles.rowIcon}>
            <Ionicons name="trash-outline" size={20} color={colors.danger} />
          </View>
          <Text style={[styles.rowTitle, { color: colors.danger }]}>Clear favorite payees</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.version}>App version v 1.1.50 (272)</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.screenBg },
  body: { padding: spacing.lg, paddingBottom: spacing.xl },
  section: { fontSize: 13, fontWeight: '800', color: colors.textMuted, marginBottom: spacing.sm, marginTop: spacing.md, textTransform: 'uppercase', letterSpacing: 0.5 },
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    paddingHorizontal: spacing.lg,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#EEE' },
  actionRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14 },
  rowIcon: { width: 34 },
  rowTitle: { fontSize: 15, fontWeight: '600', color: colors.textDark },
  rowSub: { fontSize: 12.5, color: colors.textMuted, marginTop: 2 },
  version: { textAlign: 'center', color: colors.textMuted, fontSize: 12, marginTop: spacing.xl },
});
