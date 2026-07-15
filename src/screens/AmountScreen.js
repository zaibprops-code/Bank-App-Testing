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
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAccount } from '../context/AccountContext';
import { branding } from '../config/branding';
import { colors, spacing } from '../theme';

const PURPOSES = ['Others', 'Family Support', 'Salary', 'Bill Payment', 'Business', 'Education'];

export default function AmountScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const acct = useAccount();
  const { bank = {}, accountNumber = '', accountTitle = '' } = route?.params || {};

  const [amount, setAmount] = useState('');
  const [purpose, setPurpose] = useState('Others');
  const [purposeOpen, setPurposeOpen] = useState(false);

  const onNext = () => {
    try {
      const txn = acct.sendMoney({
        counterparty: `${accountTitle} (${accountNumber})`,
        amount,
        title: `Transfer to ${bank.name || 'Bank'}`,
      });
      navigation.replace('Receipt', { txn, bank, accountNumber, accountTitle, purpose });
    } catch (e) {
      Alert.alert('Transaction failed', e.message);
    }
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
          <Text style={styles.title}>Amount</Text>
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
          {/* Sender */}
          <View style={styles.card}>
            <Image source={branding.logo} style={styles.avatar} resizeMode="contain" />
            <View style={{ flex: 1 }}>
              <Text style={styles.partyName}>{acct.accountTitle}</Text>
              <Text style={styles.partySub}>{acct.accountNumber}</Text>
              <Text style={styles.partySub}>
                Balance: <Text style={styles.green}>{acct.formatMoney(acct.balance)}</Text>
              </Text>
            </View>
          </View>

          <Text style={styles.sectionLabel}>Transfer to</Text>

          {/* Recipient */}
          <View style={styles.card}>
            {bank.logo ? (
              <Image source={bank.logo} style={styles.avatar} resizeMode="contain" />
            ) : null}
            <View style={{ flex: 1 }}>
              <Text style={styles.partyName}>{accountTitle}</Text>
              <Text style={styles.partySub}>{accountNumber}</Text>
              <Text style={styles.partySub}>Last: None</Text>
            </View>
          </View>

          {/* Amount */}
          <Text style={styles.fieldLabel}>Enter Amount</Text>
          <View style={styles.amountRow}>
            <Text style={styles.pkr}>PKR</Text>
            <TextInput
              style={styles.amountInput}
              value={amount}
              onChangeText={setAmount}
              keyboardType="number-pad"
              placeholder="0"
              placeholderTextColor={colors.textMuted}
            />
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaText}>
              Acc Bal: <Text style={styles.green}>{acct.formatMoney(acct.balance)}</Text>
            </Text>
            <Text style={styles.metaText}>Transfer Limit: PKR 999,980</Text>
          </View>

          {/* Purpose */}
          <Text style={styles.fieldLabel}>Purpose of Transfer</Text>
          <TouchableOpacity
            style={styles.dropdown}
            onPress={() => setPurposeOpen((o) => !o)}
            activeOpacity={0.8}
          >
            <Text style={styles.dropdownText}>{purpose}</Text>
            <Ionicons
              name={purposeOpen ? 'chevron-up' : 'chevron-down'}
              size={18}
              color={colors.textMuted}
            />
          </TouchableOpacity>
          {purposeOpen && (
            <View style={styles.dropdownList}>
              {PURPOSES.map((p) => (
                <TouchableOpacity
                  key={p}
                  style={styles.dropdownItem}
                  onPress={() => {
                    setPurpose(p);
                    setPurposeOpen(false);
                  }}
                >
                  <Text style={styles.dropdownItemText}>{p}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <TouchableOpacity style={styles.nextBtn} onPress={onNext} activeOpacity={0.85}>
            <Text style={styles.nextText}>Next</Text>
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

  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 10,
    padding: 14,
    marginBottom: spacing.md,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  avatar: { width: 40, height: 40, marginRight: 14 },
  partyName: { fontSize: 15, fontWeight: '800', color: colors.textDark },
  partySub: { fontSize: 12.5, color: colors.textMuted, marginTop: 2 },
  green: { color: colors.accentGreen, fontWeight: '700' },

  sectionLabel: { fontSize: 13, color: colors.textMuted, marginBottom: 8, fontWeight: '600' },

  fieldLabel: { fontSize: 14, color: colors.textDark, marginBottom: 8, marginTop: spacing.sm, fontWeight: '600' },

  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D8D8DE',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 50,
    backgroundColor: colors.white,
  },
  pkr: { fontSize: 15, fontWeight: '700', color: colors.textMuted, marginRight: 8 },
  amountInput: { flex: 1, fontSize: 16, color: colors.textDark, paddingVertical: 0 },

  metaRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  metaText: { fontSize: 11.5, color: colors.textMuted },

  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#D8D8DE',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 48,
    backgroundColor: colors.white,
  },
  dropdownText: { fontSize: 15, color: colors.textDark },
  dropdownList: {
    borderWidth: 1,
    borderColor: '#D8D8DE',
    borderRadius: 8,
    marginTop: 4,
    backgroundColor: colors.white,
    overflow: 'hidden',
  },
  dropdownItem: { paddingVertical: 12, paddingHorizontal: 12, borderBottomWidth: 1, borderBottomColor: colors.divider },
  dropdownItemText: { fontSize: 15, color: colors.textDark },

  nextBtn: {
    marginTop: spacing.xl,
    backgroundColor: colors.buttonPurple,
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
  },
  nextText: { color: colors.white, fontWeight: '800', fontSize: 16 },
});
