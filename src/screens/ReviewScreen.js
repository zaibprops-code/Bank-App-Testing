import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  BackHandler,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAccount } from '../context/AccountContext';
import { branding } from '../config/branding';
import { ProcessingBars } from '../components/ProcessingOverlay';
import { colors, spacing } from '../theme';

const ONES = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
  'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
const TENS = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

function twoWords(n) {
  if (n < 20) return ONES[n];
  return (TENS[Math.floor(n / 10)] + (n % 10 ? ' ' + ONES[n % 10] : '')).trim();
}
function threeWords(n) {
  let s = '';
  if (n >= 100) {
    s += ONES[Math.floor(n / 100)] + ' Hundred';
    n %= 100;
    if (n) s += ' ';
  }
  if (n) s += twoWords(n);
  return s;
}
// Pakistani numbering: crore / lakh / thousand.
function numToWords(num) {
  num = Math.floor(Number(num) || 0);
  if (num === 0) return 'Zero';
  let s = '';
  const crore = Math.floor(num / 10000000); num %= 10000000;
  const lakh = Math.floor(num / 100000); num %= 100000;
  const thousand = Math.floor(num / 1000); num %= 1000;
  if (crore) s += numToWords(crore) + ' Crore ';
  if (lakh) s += twoWords(lakh) + ' Lakh ';
  if (thousand) s += threeWords(thousand) + ' Thousand ';
  if (num) s += threeWords(num);
  return s.trim();
}

function pkr(n) {
  const v = Number(n) || 0;
  const whole = v % 1 === 0;
  return 'PKR ' + v.toLocaleString('en-PK', {
    minimumFractionDigits: whole ? 0 : 2,
    maximumFractionDigits: whole ? 0 : 2,
  });
}

export default function ReviewScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const acct = useAccount();
  const { bank = {}, accountNumber = '', accountTitle = '', amount = '0', purpose } = route?.params || {};

  const [processing, setProcessing] = useState(false);
  const timerRef = useRef(null);

  // Block hardware back while the payment is processing.
  useEffect(() => {
    if (!processing) return undefined;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => true);
    return () => sub.remove();
  }, [processing]);

  useEffect(() => () => timerRef.current && clearTimeout(timerRef.current), []);

  const amountDisplay = pkr(amount);
  const words = `${numToWords(amount)} Rupees Only`;

  const onSendNow = () => {
    if (processing) return;
    try {
      const txn = acct.sendMoney({
        counterparty: route?.params?.counterparty || `${accountTitle} (${accountNumber})`,
        amount,
        title: route?.params?.title || `Transfer to ${bank.name || 'Bank'}`,
      });
      setProcessing(true);
      // Irregular 3–15s processing wait, then open the receipt.
      const ms = 3000 + Math.floor(Math.random() * 12001);
      timerRef.current = setTimeout(() => {
        navigation.replace('Receipt', { txn, bank, accountNumber, accountTitle, purpose });
      }, ms);
    } catch (e) {
      Alert.alert('Transaction failed', e.message);
    }
  };

  const goHome = () => navigation.reset({ index: 0, routes: [{ name: 'Home' }] });

  return (
    <View style={styles.root}>
      <StatusBar style="light" />

      {/* Header */}
      <LinearGradient
        colors={[colors.gradientStart, colors.gradientEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <View style={{ height: insets.top }} />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.hBtn} disabled={processing}>
            <Ionicons name="arrow-back" size={24} color={colors.white} />
          </TouchableOpacity>
          <Text style={styles.title}>Review</Text>
          <View style={{ flex: 1 }} />
          <TouchableOpacity onPress={goHome} style={styles.hBtn}>
            <Ionicons name="home" size={22} color={colors.white} />
          </TouchableOpacity>
          <TouchableOpacity onPress={goHome} style={styles.hBtn}>
            <Ionicons name="power" size={22} color={colors.white} />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={{ padding: spacing.lg }}>
        {/* Sender */}
        <View style={styles.card}>
          <Image source={branding.logo} style={styles.avatar} resizeMode="contain" />
          <View style={{ flex: 1 }}>
            <Text style={styles.partyName}>{acct.accountTitle}</Text>
            <Text style={styles.partySub}>{String(acct.accountNumber || '').replace(/\s/g, '')}</Text>
            <Text style={styles.partySub}>
              Balance: <Text style={styles.green}>{acct.formatMoney(acct.balance)}</Text>
            </Text>
          </View>
        </View>

        <Text style={styles.transferLabel}>Transfer to</Text>

        {/* Recipient */}
        <View style={styles.card}>
          {bank.logo ? <Image source={bank.logo} style={styles.avatar} resizeMode="contain" /> : null}
          <View style={{ flex: 1 }}>
            <Text style={styles.partyName}>{accountTitle}</Text>
            <Text style={styles.partySub}>{accountNumber}</Text>
            <Text style={styles.partySub}>Last: None</Text>
          </View>
        </View>

        {/* Amount + words */}
        <View style={styles.amountWrap}>
          <View style={styles.amountRow}>
            <Text style={styles.amount}>{amountDisplay}</Text>
          </View>
          <Text style={styles.words}>{words}</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.feeRow}>
          <Text style={styles.feeLabel}>Transaction Fee + FED</Text>
          <Text style={styles.feeValue}>PKR 0.00</Text>
        </View>
        <View style={styles.feeRow}>
          <Text style={styles.totalLabel}>Total Amount</Text>
          <Text style={styles.totalValue}>{amountDisplay}</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.secured}>
          <Ionicons name="shield-checkmark" size={18} color={colors.primary} />
          <Text style={styles.securedText}>Secured Payment</Text>
        </View>
      </ScrollView>

      {/* Send Now */}
      <TouchableOpacity
        style={[styles.sendBtn, { marginBottom: insets.bottom + spacing.md }, processing && styles.sendBtnDisabled]}
        onPress={onSendNow}
        activeOpacity={0.85}
        disabled={processing}
      >
        <Text style={styles.sendText}>{processing ? 'Processing…' : 'Send Now'}</Text>
      </TouchableOpacity>

      {/* Processing overlay — the bars sit in the exact centre of the screen. */}
      {processing && (
        <View style={styles.processingOverlay}>
          <ProcessingBars />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.screenBg },

  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.sm, height: 52 },
  hBtn: { padding: 6 },
  title: { color: colors.white, fontSize: 19, fontWeight: '700', marginLeft: 2 },

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

  transferLabel: { fontSize: 13, color: colors.textMuted, marginBottom: spacing.sm, fontWeight: '600' },

  amountWrap: { alignItems: 'center', marginTop: spacing.lg, marginBottom: spacing.md },
  amountRow: { justifyContent: 'center', alignItems: 'center', minHeight: 44 },
  amount: { fontSize: 34, fontWeight: '800', color: colors.textDark, letterSpacing: 0.5 },
  words: { fontSize: 13, color: colors.textMuted, marginTop: 6 },

  processingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    // Transparent — the Review content stays visible behind the animation.
    backgroundColor: 'transparent',
    zIndex: 50,
    elevation: 50,
  },

  divider: { height: StyleSheet.hairlineWidth, backgroundColor: '#C9C9CE', marginVertical: spacing.md },

  feeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6 },
  feeLabel: { fontSize: 13.5, color: colors.textMuted },
  feeValue: { fontSize: 13.5, color: colors.textMuted },
  totalLabel: { fontSize: 16, color: colors.textDark, fontWeight: '800' },
  totalValue: { fontSize: 16, color: colors.textDark, fontWeight: '800' },

  secured: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: spacing.sm },
  securedText: { marginLeft: 8, color: colors.textDark, fontSize: 14, fontWeight: '600' },

  sendBtn: {
    backgroundColor: colors.accentGreen,
    marginHorizontal: spacing.lg,
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: 'center',
    elevation: 2,
  },
  sendBtnDisabled: { opacity: 0.7 },
  sendText: { color: colors.white, fontWeight: '800', fontSize: 17 },
});
