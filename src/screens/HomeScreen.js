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

// Feature tiles laid out to match the reference layout.
const FEATURES = [
  { key: 'send', label: 'Send Money', icon: (c) => <MaterialCommunityIcons name="bank-transfer" size={ICON + 4} color={c} /> },
  { key: 'topup', label: 'Mobile Topup', icon: (c) => <MaterialCommunityIcons name="cellphone-arrow-down" size={ICON} color={c} /> },
  { key: 'raast', label: 'Raast Payment', icon: (c) => <MaterialCommunityIcons name="flash" size={ICON} color={c} /> },
  { key: 'bills', label: 'Bill Payments', icon: (c) => <Ionicons name="receipt-outline" size={ICON - 2} color={c} /> },
  { key: 'card', label: 'Card Management', icon: (c) => <MaterialCommunityIcons name="credit-card-outline" size={ICON} color={c} /> },
  { key: 'qr', label: 'QR Payments', icon: (c) => <MaterialCommunityIcons name="qrcode-scan" size={ICON - 2} color={c} /> },
  { key: 'zakat', label: 'Zakat & Sadqaat', icon: (c) => <FontAwesome5 name="hand-holding-usd" size={ICON - 4} color={c} /> },
  { key: 'funds', label: 'Mutual Funds', icon: (c) => <MaterialCommunityIcons name="chart-bar" size={ICON} color={c} /> },
  { key: 'payoneer', label: 'Payoneer', icon: (c) => <MaterialCommunityIcons name="circle-multiple-outline" size={ICON} color={c} /> },
  { key: 'payorder', label: 'Request Pay Order', icon: (c) => <MaterialCommunityIcons name="file-document-outline" size={ICON} color={c} /> },
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
    if (item.key === 'send') navigation.navigate('SendMoney');
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
