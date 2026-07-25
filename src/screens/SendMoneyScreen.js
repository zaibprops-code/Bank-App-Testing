import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAccount } from '../context/AccountContext';
import { colors, spacing } from '../theme';

export default function SendMoneyScreen({ navigation, route }) {
  const params = route?.params || {};
  const presetTitle = params.presetTitle;
  const scanned = Boolean(params.scanned);
  const { balance, formatMoney } = useAccount();
  // Pre-fill from a scanned QR when those params are present.
  const [recipientName, setRecipientName] = useState(params.prefillName || '');
  const [recipient, setRecipient] = useState(params.prefillAccount || '');
  const [tillId, setTillId] = useState(params.prefillTillId || '');
  const [amount, setAmount] = useState(params.prefillAmount || '');
  const [note, setNote] = useState('');

  const onSend = () => {
    const value = Number(amount);
    const name = recipientName.trim();
    const account = recipient.trim();
    const till = tillId.trim();
    if (!name) {
      Alert.alert('Recipient name required', "Please enter the recipient's name.");
      return;
    }
    if (!account) {
      Alert.alert('Recipient required', 'Please enter a recipient account or mobile number.');
      return;
    }
    if (!value || value <= 0) {
      Alert.alert('Enter amount', 'Please enter a valid amount.');
      return;
    }
    if (value > balance) {
      Alert.alert('Insufficient balance', 'This amount exceeds your available balance.');
      return;
    }
    // Confirm on the Review screen; the transfer is sent from there. The
    // recipient's name is shown as the payee title, with the account/mobile
    // number as the sub-line, and both are recorded on the transaction. A till /
    // merchant ID (typically from a scanned QR) is preserved in the title.
    const baseTitle = note.trim() || presetTitle || 'Send Money';
    navigation.navigate('Review', {
      bank: { name: 'Send Money' },
      accountNumber: account,
      accountTitle: name,
      amount,
      counterparty: `${name} (${account})`,
      title: till ? `${baseTitle} · Till ${till}` : baseTitle,
    });
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.screenBg }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Available Balance</Text>
          <Text style={styles.balanceValue}>{formatMoney(balance)}</Text>
        </View>

        {presetTitle ? (
          <View style={styles.presetPill}>
            <Text style={styles.presetPillText}>{presetTitle}</Text>
          </View>
        ) : null}

        {scanned ? (
          <View style={styles.scanBanner}>
            <MaterialCommunityIcons name="qrcode-scan" size={18} color={colors.accentGreen} />
            <Text style={styles.scanBannerText}>
              Details filled from the scanned QR. Review and confirm below.
            </Text>
          </View>
        ) : null}

        <Text style={styles.label}>Recipient Name</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Ahmed Khan"
          placeholderTextColor={colors.textMuted}
          value={recipientName}
          onChangeText={setRecipientName}
          keyboardType="default"
          autoCapitalize="words"
        />

        <Text style={styles.label}>Recipient Account / Mobile Number</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. 0102 0105 8765 4321"
          placeholderTextColor={colors.textMuted}
          value={recipient}
          onChangeText={setRecipient}
          keyboardType="default"
        />

        <Text style={styles.label}>Till ID / Merchant ID (optional)</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. 100234 (auto-filled when scanning a QR)"
          placeholderTextColor={colors.textMuted}
          value={tillId}
          onChangeText={setTillId}
          keyboardType="default"
        />

        <Text style={styles.label}>Amount (PKR)</Text>
        <TextInput
          style={styles.input}
          placeholder="0.00"
          placeholderTextColor={colors.textMuted}
          value={amount}
          onChangeText={setAmount}
          keyboardType="numeric"
        />

        <Text style={styles.label}>Note (optional)</Text>
        <TextInput
          style={styles.input}
          placeholder="What's this for?"
          placeholderTextColor={colors.textMuted}
          value={note}
          onChangeText={setNote}
        />

        <TouchableOpacity style={styles.sendBtn} onPress={onSend} activeOpacity={0.85}>
          <Text style={styles.sendBtnText}>Confirm & Send</Text>
        </TouchableOpacity>

        <Text style={styles.hint}>
          A unique Transaction ID and reference number are generated for every
          transaction. Your balance updates instantly and the transaction is
          saved to your history.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.lg },
  balanceCard: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  balanceLabel: { color: '#E4D7F0', fontSize: 13 },
  balanceValue: { color: colors.white, fontSize: 24, fontWeight: '800', marginTop: 4 },
  presetPill: {
    alignSelf: 'flex-start',
    backgroundColor: '#EADFF4',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginBottom: spacing.md,
  },
  presetPillText: { color: colors.primary, fontWeight: '700', fontSize: 12 },
  scanBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E7F6ED',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: spacing.sm,
  },
  scanBannerText: { flex: 1, marginLeft: 8, color: '#1B7A3D', fontSize: 12.5, fontWeight: '600', lineHeight: 17 },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textDark,
    marginBottom: 6,
    marginTop: spacing.md,
  },
  input: {
    backgroundColor: colors.white,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.tileBorder,
    paddingHorizontal: spacing.lg,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.textDark,
  },
  sendBtn: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  sendBtnText: { color: colors.white, fontWeight: '800', fontSize: 16 },
  hint: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: spacing.lg,
    lineHeight: 18,
  },
});
