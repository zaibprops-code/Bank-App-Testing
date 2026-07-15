import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Share,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAccount } from '../context/AccountContext';
import { branding } from '../config/branding';
import { colors, spacing } from '../theme';

const BEN_KEY = '@bankapp_beneficiaries';
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// 0298 0010 0178 4314 0013 -> 0298xxx0013
function maskAccount(n) {
  const s = String(n || '').replace(/\s+/g, '');
  if (s.length <= 8) return s;
  return `${s.slice(0, 4)}xxx${s.slice(-4)}`;
}

function formatAmount(amount) {
  const v = Number(amount);
  const whole = v % 1 === 0;
  return (
    'PKR ' +
    v.toLocaleString('en-PK', {
      minimumFractionDigits: whole ? 0 : 2,
      maximumFractionDigits: whole ? 0 : 2,
    })
  );
}

function formatDateTime(iso) {
  const d = new Date(iso);
  let h = d.getHours();
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()} | ${h}:${mm} ${ampm}`;
}

function Party({ label, name, account, logo, fallbackInitial }) {
  return (
    <View style={styles.party}>
      {logo ? (
        <Image source={logo} style={styles.partyLogo} resizeMode="contain" />
      ) : (
        <View style={styles.partyLogoFallback}>
          <Text style={styles.partyLogoInitial}>{fallbackInitial}</Text>
        </View>
      )}
      <View style={{ flex: 1 }}>
        <Text style={styles.partyLabel}>{label}</Text>
        <Text style={styles.partyName} numberOfLines={1}>{name}</Text>
        {!!account && <Text style={styles.partyAccount}>{account}</Text>}
      </View>
    </View>
  );
}

export default function ReceiptScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const { txn, bank, accountNumber, accountTitle } = route.params || {};
  const acct = useAccount();
  const [added, setAdded] = useState(false);

  const brand = branding.bankName || 'Bank';
  const toName = accountTitle || txn.counterparty;
  const toAccount = accountNumber ? maskAccount(accountNumber) : '';
  const amountStr = formatAmount(txn.amount);
  const dateStr = formatDateTime(txn.date);

  const receiptText =
    `${brand} — Transaction Successful\n` +
    `Amount: ${amountStr}\n` +
    `Date: ${dateStr}\n` +
    `From: ${acct.accountTitle} (${maskAccount(acct.accountNumber)})\n` +
    `To: ${toName}${toAccount ? ` (${toAccount})` : ''}\n` +
    `Transaction ID: ${txn.id}\n` +
    `Reference: ${txn.reference}`;

  const shareReceipt = async () => {
    try {
      await Share.share({ message: receiptText });
    } catch (e) {}
  };

  const onAddBeneficiary = async () => {
    if (added) return;
    try {
      const raw = await AsyncStorage.getItem(BEN_KEY);
      const list = raw ? JSON.parse(raw) : [];
      list.push({
        name: toName,
        account: accountNumber || '',
        bank: bank?.name || '',
        addedAt: new Date().toISOString(),
      });
      await AsyncStorage.setItem(BEN_KEY, JSON.stringify(list));
      setAdded(true);
      Alert.alert('Beneficiary added', `${toName} has been added to your beneficiaries.`);
    } catch (e) {
      Alert.alert('Error', 'Could not add beneficiary. Please try again.');
    }
  };

  const makeAnotherPayment = () => {
    navigation.reset({ index: 1, routes: [{ name: 'Home' }, { name: 'NewTransfer' }] });
  };

  const goHome = () => navigation.reset({ index: 0, routes: [{ name: 'Home' }] });

  return (
    <View style={styles.root}>
      {/* Minimal gradient header with home / power */}
      <LinearGradient
        colors={[colors.gradientStart, colors.gradientEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <View style={{ height: insets.top }} />
        <View style={styles.header}>
          <View style={{ flex: 1 }} />
          <TouchableOpacity onPress={goHome} style={styles.hBtn}>
            <Ionicons name="home" size={22} color={colors.white} />
          </TouchableOpacity>
          <TouchableOpacity onPress={goHome} style={styles.hBtn}>
            <Ionicons name="power" size={22} color={colors.white} />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.body}>
        <View style={styles.checkWrap}>
          <View style={styles.successCircle}>
            <Ionicons name="checkmark" size={40} color={colors.white} />
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.successTitle}>Transaction Successful</Text>

          {/* Amount with faint brand watermark */}
          <View style={styles.amountBox}>
            <View style={styles.watermark} pointerEvents="none">
              {Array.from({ length: 4 }).map((_, i) => (
                <Text key={i} style={styles.watermarkText} numberOfLines={1}>
                  {`${brand}   ${brand}   ${brand}   ${brand}`}
                </Text>
              ))}
            </View>
            <Text style={styles.amountText}>{amountStr}</Text>
          </View>

          <Text style={styles.dateText}>{dateStr}</Text>

          <View style={styles.divider} />

          <Party
            label="From Account"
            name={acct.accountTitle}
            account={maskAccount(acct.accountNumber)}
            logo={branding.logo}
            fallbackInitial={(acct.accountTitle || 'A').charAt(0)}
          />

          <View style={{ height: spacing.md }} />

          <Party
            label="To Account:"
            name={toName}
            account={toAccount}
            logo={bank?.logo}
            fallbackInitial={(toName || 'B').charAt(0)}
          />

          <View style={styles.actionsRow}>
            <TouchableOpacity style={styles.action} onPress={shareReceipt} activeOpacity={0.7}>
              <Ionicons name="share-social-outline" size={22} color={colors.primary} />
              <Text style={styles.actionText}>Share Receipt</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.action} onPress={shareReceipt} activeOpacity={0.7}>
              <Ionicons name="download-outline" size={22} color={colors.primary} />
              <Text style={styles.actionText}>Save Receipt</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity style={styles.benBtn} onPress={onAddBeneficiary} activeOpacity={0.8}>
          <Text style={styles.benText}>{added ? 'Added To Beneficiary' : 'Add To Beneficiary'}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.payBtn} onPress={makeAnotherPayment} activeOpacity={0.85}>
          <Text style={styles.payText}>Make Another Payment</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.screenBg },

  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.sm, height: 52 },
  hBtn: { padding: 6 },

  body: { padding: spacing.lg, paddingTop: spacing.xl },

  checkWrap: { alignItems: 'center', marginBottom: -36, zIndex: 2 },
  successCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.accentGreen,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: colors.screenBg,
  },

  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    paddingTop: 48,
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  successTitle: { fontSize: 18, fontWeight: '800', color: colors.accentGreen, textAlign: 'center' },

  amountBox: {
    marginTop: spacing.md,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  watermark: { ...StyleSheet.absoluteFillObject, justifyContent: 'space-around', opacity: 0.12 },
  watermarkText: { fontSize: 12, fontWeight: '700', color: colors.textMuted, fontStyle: 'italic' },
  amountText: { fontSize: 30, fontWeight: '800', color: colors.accentGreen, letterSpacing: 0.5 },

  dateText: { textAlign: 'center', color: colors.textDark, fontSize: 13.5, marginTop: spacing.md, fontWeight: '600' },

  divider: {
    borderBottomWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#C9C9CE',
    borderRadius: 1,
    marginVertical: spacing.lg,
  },

  party: { flexDirection: 'row', alignItems: 'center' },
  partyLogo: { width: 44, height: 44, marginRight: 14 },
  partyLogoFallback: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 14,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  partyLogoInitial: { color: colors.white, fontWeight: '800', fontSize: 16 },
  partyLabel: { fontSize: 12.5, color: colors.textMuted, marginBottom: 2 },
  partyName: { fontSize: 15.5, fontWeight: '800', color: colors.textDark },
  partyAccount: { fontSize: 13, color: colors.textMuted, marginTop: 1 },

  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: spacing.xl,
    paddingTop: spacing.md,
  },
  action: { alignItems: 'center', paddingHorizontal: spacing.lg },
  actionText: { color: colors.primary, fontSize: 12.5, fontWeight: '600', marginTop: 6 },

  benBtn: {
    backgroundColor: colors.white,
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: spacing.lg,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  benText: { color: colors.primary, fontWeight: '800', fontSize: 15 },

  payBtn: {
    backgroundColor: colors.buttonPurple,
    borderRadius: 10,
    paddingVertical: 17,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  payText: { color: colors.white, fontWeight: '800', fontSize: 16 },
});
