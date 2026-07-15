import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing } from '../theme';

// Account / IBAN entry step shown after a bank is picked in New Transfer.
export default function BankTransferScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const bank = route?.params?.bank || { name: 'Bank' };
  const [mode, setMode] = useState('account'); // 'account' | 'iban'
  const [value, setValue] = useState('');

  const isAccount = mode === 'account';
  const bankUpper = (bank.name || 'BANK').toUpperCase();
  const hint = isAccount
    ? `ENTER 11 OR 14 OR 20 DIGITS ${bankUpper} ACCOUNT NUMBER :\nBBBBAAAAAAAAAAAAAAAA`
    : `ENTER THE 24-CHARACTER ${bankUpper} IBAN :\nPK00 BANK 0000 0000 0000 0000`;

  const canFetch = value.trim().length > 0;
  const onFetch = () => {
    if (!canFetch) return;
    navigation.navigate('SendMoney', { presetTitle: bank.name });
  };

  const switchMode = (m) => {
    setMode(m);
    setValue('');
  };

  return (
    <View style={styles.root}>
      {/* Gradient header */}
      <LinearGradient
        colors={[colors.gradientStart, colors.gradientEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <View style={{ height: insets.top }} />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.hBtn}>
            <Ionicons name="arrow-back" size={24} color={colors.white} />
          </TouchableOpacity>
          <Text style={styles.title}>Send Money</Text>
          <View style={{ flex: 1 }} />
          <TouchableOpacity onPress={() => navigation.navigate('Home')} style={styles.hBtn}>
            <Ionicons name="home" size={22} color={colors.white} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Home')} style={styles.hBtn}>
            <Ionicons name="power" size={22} color={colors.white} />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.body}
          contentContainerStyle={{ padding: spacing.lg }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Selected bank */}
          <View style={styles.bankCard}>
            {bank.logo ? (
              <Image source={bank.logo} style={styles.bankLogo} resizeMode="contain" />
            ) : null}
            <Text style={styles.bankName}>{bank.name}</Text>
          </View>

          {/* Account Number / IBAN toggle */}
          <View style={styles.segment}>
            <TouchableOpacity
              style={[styles.segBtn, isAccount && styles.segBtnActive]}
              onPress={() => switchMode('account')}
              activeOpacity={0.8}
            >
              <Text style={[styles.segText, isAccount && styles.segTextActive]}>Account Number</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.segBtn, !isAccount && styles.segBtnActive]}
              onPress={() => switchMode('iban')}
              activeOpacity={0.8}
            >
              <Text style={[styles.segText, !isAccount && styles.segTextActive]}>IBAN</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.fieldLabel}>{isAccount ? 'Account Number' : 'IBAN'}</Text>

          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              value={value}
              onChangeText={setValue}
              keyboardType={isAccount ? 'number-pad' : 'default'}
              autoCapitalize="characters"
              autoCorrect={false}
            />
            <TouchableOpacity style={styles.helpBtn} activeOpacity={0.7}>
              <Text style={styles.helpText}>?</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.hint}>{hint}</Text>

          <TouchableOpacity
            style={[styles.fetchBtn, !canFetch && styles.fetchBtnDisabled]}
            onPress={onFetch}
            activeOpacity={canFetch ? 0.85 : 1}
          >
            <Text style={[styles.fetchText, !canFetch && styles.fetchTextDisabled]}>
              Fetch Account Details
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.screenBg },

  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.sm, height: 52 },
  hBtn: { padding: 6 },
  title: { color: colors.white, fontSize: 19, fontWeight: '700', marginLeft: 2 },

  body: { flex: 1 },

  bankCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 10,
    paddingVertical: 16,
    paddingHorizontal: 14,
    marginBottom: spacing.lg,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  bankLogo: { width: 38, height: 38, marginRight: 14 },
  bankName: { flex: 1, fontSize: 16, fontWeight: '700', color: colors.textDark },

  segment: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: 8,
    padding: 4,
    marginBottom: spacing.lg,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  segBtn: { flex: 1, paddingVertical: 12, borderRadius: 6, alignItems: 'center' },
  segBtnActive: { backgroundColor: colors.buttonPurple },
  segText: { fontSize: 14, fontWeight: '700', color: colors.textDark },
  segTextActive: { color: colors.white },

  fieldLabel: { fontSize: 14, color: colors.textDark, marginBottom: 8, fontWeight: '600' },

  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.buttonPurple,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 50,
    backgroundColor: colors.white,
  },
  input: { flex: 1, fontSize: 16, color: colors.textDark, paddingVertical: 0 },
  helpBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: colors.textMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  helpText: { color: colors.textMuted, fontWeight: '700', fontSize: 14 },

  hint: { fontSize: 12, color: colors.textMuted, marginTop: 10, lineHeight: 17 },

  fetchBtn: {
    marginTop: spacing.xl,
    backgroundColor: colors.buttonPurple,
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
  },
  fetchBtnDisabled: { backgroundColor: '#D9D9DE' },
  fetchText: { color: colors.white, fontWeight: '800', fontSize: 16 },
  fetchTextDisabled: { color: '#8A8F9A' },
});
