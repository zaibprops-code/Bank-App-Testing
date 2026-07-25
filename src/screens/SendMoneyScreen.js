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
import { useAccount } from '../context/AccountContext';
import { colors, spacing } from '../theme';

export default function SendMoneyScreen({ navigation, route }) {
  const presetTitle = route?.params?.presetTitle;
  const { balance, formatMoney } = useAccount();
  const [recipientName, setRecipientName] = useState('');
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');

  const onSend = () => {
    const value = Number(amount);
    const name = recipientName.trim();
    const account = recipient.trim();
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
    // number as the sub-line, and both are recorded on the transaction.
    navigation.navigate('Review', {
      bank: { name: 'Send Money' },
      accountNumber: account,
      accountTitle: name,
      amount,
      counterparty: `${name} (${account})`,
      title: presetTitle || (note ? note : 'Send Money'),
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
