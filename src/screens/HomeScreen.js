import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Share,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  MaterialCommunityIcons,
  Ionicons,
  FontAwesome5,
  MaterialIcons,
} from '@expo/vector-icons';
import { useAccount } from '../context/AccountContext';
import { branding } from '../config/branding';
import { colors, spacing } from '../theme';

const { width } = Dimensions.get('window');
const TILE_GAP = 12;
const TILE_WIDTH = (width - spacing.lg * 2 - TILE_GAP) / 2;
const ICON = 30;
const GREEN = colors.accentGreen;

// Two-tone (purple + green) composite marks matching the reference tiles.
const CardIcon = (c) => (
  <View style={{ width: ICON, height: ICON, alignItems: 'center', justifyContent: 'center' }}>
    <MaterialCommunityIcons name="credit-card-outline" size={ICON} color={c} />
    <View style={{ position: 'absolute', left: ICON * 0.24, top: ICON * 0.44, width: ICON * 0.18, height: ICON * 0.13, borderRadius: 2, backgroundColor: GREEN }} />
  </View>
);

const QrIcon = (c) => (
  <View style={{ width: ICON, height: ICON, alignItems: 'center', justifyContent: 'center' }}>
    <MaterialCommunityIcons name="qrcode-scan" size={ICON - 2} color={c} />
    <MaterialCommunityIcons name="qrcode" size={(ICON - 2) * 0.4} color={GREEN} style={{ position: 'absolute', right: ICON * 0.06, bottom: ICON * 0.06 }} />
  </View>
);

const ZakatIcon = (c) => (
  <View style={{ width: ICON, height: ICON, alignItems: 'center', justifyContent: 'flex-end' }}>
    <FontAwesome5 name="hand-holding" size={ICON - 4} color={c} />
    <View style={{ position: 'absolute', top: 0, left: ICON * 0.28, width: ICON * 0.44, height: ICON * 0.44, borderRadius: ICON, backgroundColor: GREEN, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontSize: 8, fontWeight: '800', color: colors.white }}>Rs</Text>
    </View>
  </View>
);

const FundsIcon = (c) => (
  <View style={{ width: ICON, height: ICON, justifyContent: 'flex-end' }}>
    <View style={{ flexDirection: 'row', alignItems: 'flex-end', height: ICON * 0.78, borderLeftWidth: 2, borderBottomWidth: 2, borderColor: c, paddingLeft: 3 }}>
      {[[0.35, GREEN], [0.62, c], [0.48, GREEN], [0.85, c]].map(([h, col], i) => (
        <View key={i} style={{ width: 4, height: ICON * 0.78 * h, backgroundColor: col, marginRight: 3, borderTopLeftRadius: 1, borderTopRightRadius: 1 }} />
      ))}
    </View>
  </View>
);

const PayOrderIcon = (c) => (
  <View style={{ width: ICON, height: ICON * 0.7, borderWidth: 1.6, borderColor: c, borderRadius: 3, paddingHorizontal: 3, paddingTop: 2 }}>
    <Text style={{ fontSize: 7, fontWeight: '800', color: c }}>Rs</Text>
    <View style={{ height: 1.6, backgroundColor: c, width: '78%', marginTop: 3 }} />
    <View style={{ height: 1.6, backgroundColor: c, width: '55%', marginTop: 2 }} />
  </View>
);

// Feature tiles laid out to match the reference layout.
const FEATURES = [
  {
    key: 'send',
    label: 'Send Money',
    // Money-transfer curved arrows wrapped around the "Rs" currency mark.
    icon: (c) => (
      <View style={{ width: ICON + 8, height: ICON + 8, alignItems: 'center', justifyContent: 'center' }}>
        <MaterialCommunityIcons name="sync" size={ICON + 8} color={c} />
        <Text style={{ position: 'absolute', fontSize: 11, fontWeight: '800', color: c }}>Rs</Text>
      </View>
    ),
  },
  {
    key: 'topup',
    label: 'Mobile Topup',
    // Phone with a circular recharge/topup arrow.
    icon: (c) => (
      <View style={{ width: ICON, height: ICON, alignItems: 'center', justifyContent: 'center' }}>
        <MaterialCommunityIcons name="cellphone" size={ICON} color={c} />
        <MaterialCommunityIcons name="sync" size={ICON * 0.5} color={c} style={{ position: 'absolute' }} />
      </View>
    ),
  },
  { key: 'raast', label: 'Raast Payment', icon: () => <Image source={require('../../assets/raast.png')} style={{ width: ICON + 12, height: ICON + 12 }} resizeMode="contain" /> },
  {
    key: 'bills',
    label: 'Bill Payments',
    // Bill/voucher (bookmark) with the "Rs" currency mark.
    icon: (c) => (
      <View style={{ width: ICON, height: ICON, alignItems: 'center', justifyContent: 'center' }}>
        <MaterialCommunityIcons name="bookmark-outline" size={ICON} color={c} />
        <Text style={{ position: 'absolute', top: ICON * 0.2, fontSize: 9, fontWeight: '800', color: c }}>Rs</Text>
      </View>
    ),
  },
  { key: 'card', label: 'Card Management', icon: CardIcon },
  { key: 'qr', label: 'QR Payments', icon: QrIcon },
  { key: 'zakat', label: 'Zakat & Sadqaat', icon: ZakatIcon },
  { key: 'funds', label: 'Al Meezan Mutual Funds', icon: FundsIcon },
  { key: 'payoneer', label: 'Payoneer', icon: () => <Image source={require('../../assets/payoneer.png')} style={{ width: ICON + 4, height: ICON + 4 }} resizeMode="contain" /> },
  { key: 'payorder', label: 'Request Pay Order', icon: PayOrderIcon },
  { key: 'feedback', label: 'Feedback', icon: (c) => <MaterialCommunityIcons name="message-reply-text-outline" size={ICON - 2} color={c} /> },
];

export default function HomeScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const {
    accountTitle,
    accountLabel,
    accountNumber,
    iban,
    branch,
    balance,
    formatMoney,
  } = useAccount();
  const [showBalance, setShowBalance] = useState(false);

  const onShare = async () => {
    try {
      await Share.share({
        message: `${accountTitle}\n${accountLabel}: ${accountNumber}\nIBAN: ${iban}\nBranch: ${branch}`,
      });
    } catch (e) {}
  };

  const onTilePress = (item) => {
    if (item.key === 'send') navigation.navigate('NewTransfer');
    else navigation.navigate('SendMoney', { presetTitle: item.label });
  };

  return (
    <View style={styles.root}>
      {/* Gradient header (status bar + app bar) */}
      <LinearGradient
        colors={[colors.gradientStart, colors.gradientEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <View style={{ height: insets.top }} />
        <View style={styles.appBar}>
          <TouchableOpacity style={styles.appBarBtn}>
            <Ionicons name="menu" size={28} color={colors.white} />
          </TouchableOpacity>
          <View style={styles.logoCircle}>
            <Image source={branding.logo} style={styles.appBarLogo} resizeMode="contain" />
          </View>
          <Text style={styles.appBarTitle} numberOfLines={1}>
            {branding.bankName}
          </Text>
          <View style={{ flex: 1 }} />
          <TouchableOpacity style={styles.appBarBtn}>
            <MaterialIcons name="power-settings-new" size={26} color={colors.white} />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ padding: spacing.md, paddingBottom: spacing.xl }}
        showsVerticalScrollIndicator={false}
      >
        {/* Account card */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.name} numberOfLines={1}>{accountTitle}</Text>
              <Text style={styles.detailLine}>
                {accountLabel}: <Text style={styles.detailValue}>{accountNumber}</Text>
              </Text>
              <Text style={styles.detailLine}>
                IBAN: <Text style={styles.detailValue}>{iban}</Text>
              </Text>
              <Text style={styles.detailLine}>
                Branch: <Text style={styles.detailValue}>{branch}</Text>
              </Text>
            </View>
            <TouchableOpacity style={styles.refreshBtn}>
              <Ionicons name="refresh" size={20} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          {/* SHOW BALANCE bordered box */}
          <TouchableOpacity
            style={styles.showBalanceBox}
            onPress={() => setShowBalance((s) => !s)}
            activeOpacity={0.7}
          >
            <Text style={styles.showBalanceText}>
              {showBalance ? formatMoney(balance) : 'SHOW BALANCE'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Share / Transactions */}
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.actionBtn} onPress={onShare} activeOpacity={0.85}>
            <Ionicons name="share-social" size={17} color={colors.white} />
            <Text style={styles.actionText}>Share</Text>
          </TouchableOpacity>
          <View style={{ width: TILE_GAP }} />
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => navigation.navigate('Transactions')}
            activeOpacity={0.85}
          >
            <MaterialCommunityIcons name="file-document-outline" size={17} color={colors.white} />
            <Text style={styles.actionText}>Transactions</Text>
          </TouchableOpacity>
        </View>

        {/* Feature tiles */}
        <View style={styles.grid}>
          {FEATURES.map((item) => (
            <TouchableOpacity
              key={item.key}
              style={styles.tile}
              activeOpacity={0.7}
              onPress={() => onTilePress(item)}
            >
              <View style={styles.tileIcon}>{item.icon(colors.primary)}</View>
              <Text style={styles.tileLabel} numberOfLines={2}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.screenBg },
  scroll: { flex: 1 },

  appBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    height: 56,
  },
  appBarBtn: { padding: 4 },
  logoCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.sm,
    marginRight: spacing.sm,
  },
  appBarLogo: { width: 34, height: 34, borderRadius: 17 },
  appBarTitle: { color: colors.white, fontSize: 19, fontWeight: '700' },

  card: {
    backgroundColor: colors.cardBg,
    borderRadius: 10,
    padding: spacing.lg,
    marginTop: spacing.xs,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  cardHeaderRow: { flexDirection: 'row', alignItems: 'flex-start' },
  name: { fontSize: 15, fontWeight: '800', color: colors.textDark, marginBottom: 5 },
  detailLine: { fontSize: 12.5, color: colors.textMuted, marginTop: 3 },
  detailValue: { color: colors.textDark, fontWeight: '600' },
  refreshBtn: { padding: 4 },
  showBalanceBox: {
    marginTop: spacing.lg,
    borderWidth: 1,
    borderColor: '#E4E4E8',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    backgroundColor: '#FCFCFD',
  },
  showBalanceText: {
    color: colors.accentGreen,
    fontWeight: '800',
    fontSize: 20,
    letterSpacing: 0.5,
  },

  actionRow: { flexDirection: 'row', marginTop: spacing.md },
  actionBtn: {
    flex: 1,
    backgroundColor: colors.buttonPurple,
    borderRadius: 8,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionText: { color: colors.white, fontWeight: '700', marginLeft: 8, fontSize: 15 },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: spacing.md,
  },
  tile: {
    width: TILE_WIDTH,
    minHeight: 88,
    backgroundColor: colors.cardBg,
    borderRadius: 10,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    marginBottom: TILE_GAP,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.tileBorder,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  tileIcon: { width: 44, alignItems: 'center', marginRight: spacing.sm },
  tileLabel: { flex: 1, fontSize: 14.5, fontWeight: '600', color: colors.textDark, lineHeight: 19 },
});
