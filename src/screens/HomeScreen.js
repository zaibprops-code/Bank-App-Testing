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

// Feature tiles, laid out to match the reference screenshot.
const FEATURES = [
  { key: 'send', label: 'Send Money', icon: (c) => <MaterialCommunityIcons name="cash-multiple" size={24} color={c} /> },
  { key: 'topup', label: 'Mobile Topup', icon: (c) => <MaterialCommunityIcons name="cellphone" size={24} color={c} /> },
  { key: 'raast', label: 'Raast Payment', icon: (c) => <MaterialCommunityIcons name="flash" size={24} color={c} /> },
  { key: 'bills', label: 'Bill Payments', icon: (c) => <Ionicons name="receipt-outline" size={23} color={c} /> },
  { key: 'card', label: 'Card Management', icon: (c) => <MaterialCommunityIcons name="credit-card-outline" size={24} color={c} /> },
  { key: 'qr', label: 'QR Payments', icon: (c) => <MaterialCommunityIcons name="qrcode-scan" size={23} color={c} /> },
  { key: 'zakat', label: 'Zakat & Sadqaat', icon: (c) => <FontAwesome5 name="hand-holding-heart" size={20} color={c} /> },
  { key: 'funds', label: 'Mutual Funds', icon: (c) => <MaterialCommunityIcons name="chart-bar" size={24} color={c} /> },
  { key: 'payoneer', label: 'Payoneer', icon: (c) => <MaterialCommunityIcons name="circle-multiple-outline" size={24} color={c} /> },
  { key: 'feedback', label: 'Feedback', icon: (c) => <MaterialCommunityIcons name="message-reply-text-outline" size={23} color={c} /> },
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
    if (item.key === 'send') navigation.navigate('SendMoney');
    else navigation.navigate('SendMoney', { presetTitle: item.label });
  };

  return (
    <View style={styles.root}>
      {/* Purple status-bar area */}
      <View style={{ height: insets.top, backgroundColor: colors.primary }} />

      {/* Top app bar: menu • logo + bank name • power */}
      <View style={styles.appBar}>
        <TouchableOpacity style={styles.appBarBtn}>
          <Ionicons name="menu" size={26} color={colors.white} />
        </TouchableOpacity>
        <View style={styles.appBarCenter}>
          <Image source={branding.logo} style={styles.appBarLogo} resizeMode="contain" />
          <Text style={styles.appBarTitle} numberOfLines={1}>
            {branding.bankName}
          </Text>
        </View>
        <TouchableOpacity style={styles.appBarBtn}>
          <MaterialIcons name="power-settings-new" size={24} color={colors.white} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xl }}
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
              <Ionicons name="refresh" size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.showBalanceBtn}
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
          <TouchableOpacity style={styles.actionBtn} onPress={onShare}>
            <Ionicons name="share-social" size={16} color={colors.white} />
            <Text style={styles.actionText}>Share</Text>
          </TouchableOpacity>
          <View style={{ width: TILE_GAP }} />
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => navigation.navigate('Transactions')}
          >
            <MaterialCommunityIcons name="file-document-outline" size={16} color={colors.white} />
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
              <Text style={styles.tileLabel}>{item.label}</Text>
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
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    height: 52,
  },
  appBarBtn: { padding: 6 },
  appBarCenter: { flex: 1, flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.sm },
  appBarLogo: { width: 30, height: 30, borderRadius: 15, marginRight: spacing.sm },
  appBarTitle: { color: colors.white, fontSize: 18, fontWeight: '700' },

  card: {
    backgroundColor: colors.cardBg,
    borderRadius: 10,
    padding: spacing.lg,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  cardHeaderRow: { flexDirection: 'row', alignItems: 'flex-start' },
  name: { fontSize: 15, fontWeight: '800', color: colors.textDark, marginBottom: 4 },
  detailLine: { fontSize: 12.5, color: colors.textMuted, marginTop: 2 },
  detailValue: { color: colors.textDark, fontWeight: '600' },
  refreshBtn: { padding: 4 },
  divider: { height: 1, backgroundColor: '#EEE', marginVertical: spacing.md },
  showBalanceBtn: { alignItems: 'center', paddingVertical: spacing.sm },
  showBalanceText: {
    color: colors.accentGreen,
    fontWeight: '800',
    fontSize: 18,
    letterSpacing: 0.5,
  },

  actionRow: { flexDirection: 'row', marginTop: spacing.lg },
  actionBtn: {
    flex: 1,
    backgroundColor: colors.primaryLight,
    borderRadius: 8,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionText: { color: colors.white, fontWeight: '700', marginLeft: 8, fontSize: 14 },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: spacing.lg,
  },
  tile: {
    width: TILE_WIDTH,
    backgroundColor: colors.cardBg,
    borderRadius: 10,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    marginBottom: TILE_GAP,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.tileBorder,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
  },
  tileIcon: { width: 34, alignItems: 'center', marginRight: spacing.sm },
  tileLabel: { flex: 1, fontSize: 13, fontWeight: '600', color: colors.textDark },
});
