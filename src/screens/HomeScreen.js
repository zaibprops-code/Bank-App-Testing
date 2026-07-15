import React, { useState } from 'react';
import {
  View,
  Text,
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
import { colors, spacing } from '../theme';

const { width } = Dimensions.get('window');
const TILE_GAP = 12;
const TILE_WIDTH = (width - spacing.lg * 2 - TILE_GAP) / 2;

// The grid items, matching the screenshot.
const FEATURES = [
  { key: 'send', label: 'Send Money', icon: (c) => <MaterialCommunityIcons name="cash-fast" size={26} color={c} /> },
  { key: 'topup', label: 'Mobile Topup', icon: (c) => <MaterialCommunityIcons name="cellphone" size={26} color={c} /> },
  { key: 'raast', label: 'Raast Payment', icon: (c) => <MaterialCommunityIcons name="flash" size={26} color={c} /> },
  { key: 'bills', label: 'Bill Payments', icon: (c) => <Ionicons name="receipt-outline" size={25} color={c} /> },
  { key: 'card', label: 'Card Management', icon: (c) => <MaterialCommunityIcons name="credit-card-outline" size={26} color={c} /> },
  { key: 'qr', label: 'QR Payments', icon: (c) => <MaterialCommunityIcons name="qrcode-scan" size={25} color={c} /> },
  { key: 'zakat', label: 'Zakat & Sadqaat', icon: (c) => <FontAwesome5 name="hand-holding-heart" size={22} color={c} /> },
  { key: 'funds', label: 'Al Meezan Mutual Funds', icon: (c) => <MaterialCommunityIcons name="chart-bar" size={26} color={c} /> },
  { key: 'payoneer', label: 'Payoneer', icon: (c) => <MaterialCommunityIcons name="circle-multiple-outline" size={26} color={c} /> },
  { key: 'payorder', label: 'Request Pay Order', icon: (c) => <MaterialIcons name="request-quote" size={26} color={c} /> },
];

export default function HomeScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { accountTitle, accountNumber, balance, formatMoney } = useAccount();
  const [showBalance, setShowBalance] = useState(false);

  const onShare = async () => {
    try {
      await Share.share({
        message: `Account Title: ${accountTitle}\nAccount Number: ${accountNumber}`,
      });
    } catch (e) {}
  };

  const onTilePress = (item) => {
    if (item.key === 'send') {
      navigation.navigate('SendMoney');
    } else {
      // Other tiles are placeholders in this demo.
      navigation.navigate('SendMoney', { presetTitle: item.label });
    }
  };

  return (
    <View style={styles.root}>
      {/* Purple status-bar area */}
      <View style={{ height: insets.top, backgroundColor: colors.primary }} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: spacing.xl }}
        showsVerticalScrollIndicator={false}
      >
        {/* Purple header behind the card */}
        <View style={styles.headerBg}>
          {/* White account card */}
          <View style={styles.card}>
            <View style={styles.cardTopRow}>
              <Text style={styles.name} numberOfLines={1}>
                {accountTitle}
              </Text>
              <View style={styles.cardTopIcons}>
                <TouchableOpacity style={styles.iconBtn}>
                  <Ionicons name="refresh" size={20} color={colors.primary} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.iconBtn}>
                  <Ionicons name="star" size={20} color={colors.yellow} />
                </TouchableOpacity>
              </View>
            </View>

            {/* SHOW BALANCE toggle */}
            <TouchableOpacity
              style={styles.showBalanceBtn}
              onPress={() => setShowBalance((s) => !s)}
              activeOpacity={0.7}
            >
              <Text style={styles.showBalanceText}>
                {showBalance ? formatMoney(balance) : 'SHOW BALANCE'}
              </Text>
            </TouchableOpacity>

            {/* Share / Transactions buttons */}
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

            {/* Carousel dots */}
            <View style={styles.dotsRow}>
              <View style={[styles.dot, styles.dotActive]} />
              <View style={styles.dot} />
            </View>
          </View>
        </View>

        {/* Feature tile grid */}
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
  headerBg: {
    backgroundColor: colors.primary,
    paddingBottom: spacing.lg,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
  },
  card: {
    backgroundColor: colors.cardBg,
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    borderRadius: 12,
    padding: spacing.lg,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  name: { fontSize: 15, fontWeight: '700', color: colors.textDark, flex: 1 },
  cardTopIcons: { flexDirection: 'row', alignItems: 'center' },
  iconBtn: { paddingHorizontal: 6 },
  showBalanceBtn: { alignItems: 'center', paddingVertical: spacing.lg },
  showBalanceText: {
    color: colors.accentGreen,
    fontWeight: '800',
    fontSize: 18,
    letterSpacing: 0.5,
  },
  actionRow: { flexDirection: 'row' },
  actionBtn: {
    flex: 1,
    backgroundColor: colors.primaryLight,
    borderRadius: 8,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionText: {
    color: colors.white,
    fontWeight: '700',
    marginLeft: 6,
    fontSize: 13,
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.md,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#D5C6E4',
    marginHorizontal: 3,
  },
  dotActive: { backgroundColor: colors.primary, width: 7, height: 7, borderRadius: 3.5 },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
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
  tileLabel: { flex: 1, fontSize: 12.5, fontWeight: '600', color: colors.textDark },
});
