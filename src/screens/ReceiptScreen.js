import React, { useRef, useState } from 'react';
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
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import * as MediaLibrary from 'expo-media-library';
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

// Flat-design success tick: a green circle with a bold white checkmark and a
// soft diagonal "long shadow" cast down-right from the check. Shared by the
// on-screen receipt and the off-screen capture so the two never drift.
function SuccessTick() {
  const SHADOW_STEPS = 16;
  const CHECK_SIZE = 46;
  return (
    <LinearGradient
      colors={['#4EC667', '#25A244']}
      start={{ x: 0.2, y: 0 }}
      end={{ x: 0.85, y: 1 }}
      style={styles.tickCircle}
    >
      {/* Long shadow — stacked, faint dark checks stepping toward bottom-right.
          Each layer fills the circle and centres its check, so overflow:hidden
          on the circle trims the tail into the classic long-shadow wedge. */}
      {Array.from({ length: SHADOW_STEPS }).map((_, i) => (
        <View key={i} style={[StyleSheet.absoluteFill, styles.tickCenter]} pointerEvents="none">
          <Ionicons
            name="checkmark"
            size={CHECK_SIZE}
            color="rgba(0,0,0,0.05)"
            style={{ transform: [{ translateX: (i + 1) * 2 }, { translateY: (i + 1) * 2 }] }}
          />
        </View>
      ))}

      <Ionicons name="checkmark" size={CHECK_SIZE} color={colors.white} />
    </LinearGradient>
  );
}

// Uniform dashed divider. RN's borderStyle:'dashed' renders inconsistently
// across platforms, so we draw the dashes as individual segments and clip the
// overflow, guaranteeing an even, full-width dashed line everywhere.
function DashedLine() {
  return (
    <View style={styles.dashRow} pointerEvents="none">
      {Array.from({ length: 60 }).map((_, i) => (
        <View key={i} style={styles.dash} />
      ))}
    </View>
  );
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

// The printed receipt body — everything the receipt shows apart from the
// interactive action buttons. Shared by the on-screen card and the off-screen
// capture view that becomes the shareable/save-able image, so the two can
// never drift apart.
function ReceiptDetails({
  brand,
  amountStr,
  dateStr,
  fromName,
  fromAccount,
  fromLogo,
  toName,
  toAccount,
  toLogo,
  stan,
  txnType,
}) {
  return (
    <>
      <Text style={styles.successTitle}>Transaction Successful</Text>

      {/* Amount on a light-grey box with a faint, tilted brand watermark */}
      <View style={styles.amountBox}>
        <View style={styles.watermark} pointerEvents="none">
          {Array.from({ length: 9 }).map((_, i) => (
            <Text key={i} style={styles.watermarkText} numberOfLines={1}>
              {`${brand}    ${brand}    ${brand}    ${brand}    ${brand}    ${brand}`}
            </Text>
          ))}
        </View>
        <Text style={styles.amountText}>{amountStr}</Text>
      </View>

      <Text style={styles.dateText}>{dateStr}</Text>

      <DashedLine />

      {/* Sender / recipient block — inset from the card edges so it reads as a
          neat, centred group under the amount instead of hugging the left edge. */}
      <View style={styles.partyBlock}>
        <Party
          label="From Account:"
          name={fromName}
          account={fromAccount}
          logo={fromLogo}
          fallbackInitial={(fromName || 'A').charAt(0)}
        />

        <View style={{ height: spacing.lg }} />

        <Party
          label="To Account:"
          name={toName}
          account={toAccount}
          logo={toLogo}
          fallbackInitial={(toName || 'B').charAt(0)}
        />
      </View>

      <DashedLine />

      {/* Reference / transaction meta */}
      <View style={styles.metaRow}>
        <Text style={styles.metaLabel}>Reference Number (STAN): </Text>
        <Text style={styles.metaValue}>{stan}</Text>
      </View>
      <View style={styles.metaRow}>
        <Text style={styles.metaLabel}>Transaction Type: </Text>
        <Text style={styles.metaValue}>{txnType}</Text>
      </View>
    </>
  );
}

export default function ReceiptScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const { txn, bank, accountNumber, accountTitle } = route.params || {};
  const acct = useAccount();
  const [added, setAdded] = useState(false);
  const shotRef = useRef(null);

  const brand = branding.bankName || 'Bank';
  const toName = accountTitle || txn.counterparty;
  const toAccount = accountNumber ? maskAccount(accountNumber) : '';
  const amountStr = formatAmount(txn.amount);
  const dateStr = formatDateTime(txn.date);

  // Bank-style System Trace Audit Number (6 digits) derived from the unique
  // reference so it stays stable for this transaction.
  const stan = String(txn.reference || '').replace(/\D/g, '').slice(-6).padStart(6, '0');
  const txnType = '1LINK IBFT';

  const receiptText =
    `${brand} — Transaction Successful\n` +
    `Amount: ${amountStr}\n` +
    `Date: ${dateStr}\n` +
    `From: ${acct.accountTitle} (${maskAccount(acct.accountNumber)})\n` +
    `To: ${toName}${toAccount ? ` (${toAccount})` : ''}\n` +
    `Reference Number (STAN): ${stan}\n` +
    `Transaction Type: ${txnType}\n` +
    `Transaction ID: ${txn.id}\n` +
    `Reference: ${txn.reference}`;

  // Render the off-screen receipt view to a PNG file and return its uri.
  const captureReceipt = () =>
    captureRef(shotRef, { format: 'png', quality: 1, result: 'tmpfile' });

  // Share the receipt as an image so it can be sent as a proper picture on
  // WhatsApp, etc. Falls back to plain text if image sharing is unavailable.
  const shareReceipt = async () => {
    try {
      const uri = await captureReceipt();
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: 'image/png',
          dialogTitle: 'Share Receipt',
          UTI: 'public.png',
        });
        return;
      }
    } catch (e) {
      // fall through to the text fallback below
    }
    try {
      await Share.share({ message: receiptText });
    } catch (e) {}
  };

  // Save the receipt image to the phone's gallery.
  const saveReceipt = async () => {
    try {
      const uri = await captureReceipt();
      const perm = await MediaLibrary.requestPermissionsAsync();
      if (!perm.granted) {
        Alert.alert(
          'Permission needed',
          'Please allow photo access to save the receipt to your gallery.'
        );
        return;
      }
      await MediaLibrary.saveToLibraryAsync(uri);
      Alert.alert('Receipt saved', 'The receipt image has been saved to your gallery.');
    } catch (e) {
      Alert.alert('Error', 'Could not save the receipt. Please try again.');
    }
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
      Alert.alert('Favorite Payee added', `${toName} has been added to your favorite payees.`);
    } catch (e) {
      Alert.alert('Error', 'Could not add favorite payee. Please try again.');
    }
  };

  const makeAnotherPayment = () => {
    navigation.reset({ index: 1, routes: [{ name: 'Home' }, { name: 'NewTransfer' }] });
  };

  const goHome = () => navigation.reset({ index: 0, routes: [{ name: 'Home' }] });

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      {/* Purple status-bar strip sized to the exact status-bar height */}
      <View style={{ height: insets.top, backgroundColor: colors.primary }} />
      {/* Light header with home / power icons pinned to the top-right */}
      <View style={styles.header}>
        <View style={{ flex: 1 }} />
        <TouchableOpacity onPress={goHome} style={styles.hBtn}>
          <Ionicons name="home" size={24} color={colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity onPress={goHome} style={styles.hBtn}>
          <Ionicons name="power" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.body}>
        <View style={styles.checkWrap}>
          <SuccessTick />
        </View>

        <View style={styles.card}>
          <ReceiptDetails
            brand={brand}
            amountStr={amountStr}
            dateStr={dateStr}
            fromName={acct.accountTitle}
            fromAccount={maskAccount(acct.accountNumber)}
            fromLogo={branding.logo}
            toName={toName}
            toAccount={toAccount}
            toLogo={bank?.logo}
            stan={stan}
            txnType={txnType}
          />

          <View style={styles.actionsRow}>
            <TouchableOpacity style={styles.action} onPress={onAddBeneficiary} activeOpacity={0.7}>
              <Ionicons name={added ? 'star' : 'star-outline'} size={22} color={added ? colors.yellow : colors.primary} />
              <Text style={styles.actionText}>Favorite Payee</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.action} onPress={shareReceipt} activeOpacity={0.7}>
              <Ionicons name="share-social-outline" size={22} color={colors.primary} />
              <Text style={styles.actionText}>Share Receipt</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.action} onPress={saveReceipt} activeOpacity={0.7}>
              <Ionicons name="download-outline" size={22} color={colors.primary} />
              <Text style={styles.actionText}>Save Receipt</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Make Another Payment — floating gradient bar, kept clear of the
          phone's navigation bar / gesture area. */}
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={makeAnotherPayment}
        style={[styles.payWrap, { marginBottom: insets.bottom + spacing.lg }]}
      >
        <LinearGradient
          colors={[colors.gradientStart, colors.gradientEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.payBtn}
        >
          <Text style={styles.payText}>Make Another Payment</Text>
        </LinearGradient>
      </TouchableOpacity>

      {/* Off-screen clean receipt rendered to an image for Share / Save.
          Kept out of the visible flow so the shared picture never includes the
          action buttons or the "Make Another Payment" bar. */}
      <View style={styles.captureOffscreen} pointerEvents="none">
        <View ref={shotRef} collapsable={false} style={styles.captureCard}>
          <View style={styles.captureCheckWrap}>
            <SuccessTick />
          </View>
          <View style={styles.card}>
            <ReceiptDetails
              brand={brand}
              amountStr={amountStr}
              dateStr={dateStr}
              fromName={acct.accountTitle}
              fromAccount={maskAccount(acct.accountNumber)}
              fromLogo={branding.logo}
              toName={toName}
              toAccount={toAccount}
              toLogo={bank?.logo}
              stan={stan}
              txnType={txnType}
            />
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.screenBg },
  scroll: { flex: 1 },

  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.md, height: 44 },
  hBtn: { padding: 6, marginLeft: spacing.sm },

  body: { padding: spacing.lg, paddingTop: spacing.xl, paddingBottom: spacing.xl },

  // Off-screen container for the image capture: laid out (so it renders) but
  // pushed far off the visible area.
  captureOffscreen: { position: 'absolute', left: -10000, top: 0 },
  captureCard: {
    width: 380,
    backgroundColor: colors.screenBg,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl + 36,
    paddingBottom: spacing.lg,
  },
  captureCheckWrap: { alignItems: 'center', marginBottom: -36, zIndex: 2 },

  checkWrap: { alignItems: 'center', marginBottom: -36, zIndex: 2 },
  tickCircle: {
    width: 84,
    height: 84,
    borderRadius: 42,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  tickCenter: { alignItems: 'center', justifyContent: 'center' },

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
    minHeight: 92,
    borderRadius: 16,
    backgroundColor: '#F2F2F5',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    paddingVertical: spacing.lg,
  },
  watermark: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-around',
    opacity: 0.14,
    transform: [{ rotate: '-20deg' }, { scale: 1.5 }],
  },
  watermarkText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  amountText: { fontSize: 30, fontWeight: '800', color: colors.accentGreen, letterSpacing: 0.5 },

  dateText: { textAlign: 'center', color: colors.textDark, fontSize: 13.5, marginTop: spacing.md, fontWeight: '600' },

  // Manually drawn dashed divider (see DashedLine). overflow:'hidden' clips
  // the trailing dashes so the line ends flush with the card padding.
  dashRow: {
    flexDirection: 'row',
    overflow: 'hidden',
    marginVertical: spacing.lg,
  },
  dash: {
    width: 8,
    height: 1.5,
    borderRadius: 1,
    backgroundColor: '#C9C9CE',
    marginRight: 6,
  },

  partyBlock: { paddingHorizontal: spacing.md },
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

  metaRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', marginBottom: 4 },
  metaLabel: { fontSize: 13, color: colors.textMuted },
  metaValue: { fontSize: 13, color: colors.textDark, fontWeight: '700' },

  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.xl,
    paddingTop: spacing.md,
  },
  action: { flex: 1, alignItems: 'center', paddingHorizontal: spacing.xs },
  actionText: { color: colors.primary, fontSize: 12.5, fontWeight: '600', marginTop: 6, textAlign: 'center' },

  payWrap: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.sm,
    borderRadius: 14,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  payBtn: {
    paddingVertical: 17,
    alignItems: 'center',
  },
  payText: { color: colors.white, fontWeight: '800', fontSize: 16 },
});
