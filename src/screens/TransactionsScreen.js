import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Share,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAccount } from '../context/AccountContext';
import { colors, spacing } from '../theme';

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const MAGENTA = '#8C2E84'; // date-group headers

// "01 Jul 2026"
function dayLabel(d) {
  return `${String(d.getDate()).padStart(2, '0')} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

// "Wednesday, 15 Jul 2026"
function groupLabel(d) {
  return `${WEEKDAYS[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

// Plain amount with thousands separators and 2 decimals (no "PKR").
function amt(n) {
  return Number(n).toLocaleString('en-PK', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// Bank-style description that reads like a real statement line.
function describe(item) {
  const stan = String(item.reference || '').replace(/\D/g, '').slice(-6);
  const base =
    item.type === 'credit'
      ? `Money Received from ${item.counterparty}`
      : `Money Transferred to ${item.counterparty}`;
  return stan ? `${base}  STAN(${stan})` : base;
}

// Compute the [from, to] window for a range mode.
function rangeFor(mode) {
  const now = new Date();
  if (mode === 'month') {
    return [new Date(now.getFullYear(), now.getMonth(), 1), new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)];
  }
  const months = mode === '3m' ? 3 : mode === '6m' ? 6 : 12;
  const from = new Date(now);
  from.setMonth(from.getMonth() - months);
  return [from, now];
}

function Chip({ label, active, onPress }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={[styles.chip, active && styles.chipActive]}
    >
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

function IconAction({ icon, label, active, onPress }) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={styles.iconAction}>
      <Ionicons name={icon} size={20} color={active ? MAGENTA : colors.primary} />
      <Text style={[styles.iconActionLabel, active && { color: MAGENTA }]}>{label}</Text>
    </TouchableOpacity>
  );
}

export default function TransactionsScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { transactions, balance, formatMoney } = useAccount();

  const [query, setQuery] = useState('');
  const [hideBalance, setHideBalance] = useState(false);
  const [rangeMode, setRangeMode] = useState('month'); // 'month' | '3m' | '6m' | '1y'
  const [sortDesc, setSortDesc] = useState(true);
  const [typeFilter, setTypeFilter] = useState('all'); // 'all' | 'credit' | 'debit'

  const [from, to] = useMemo(() => rangeFor(rangeMode), [rangeMode]);
  const rangeText = `${dayLabel(from)} - ${dayLabel(to)}`;

  // Filter -> sort -> group.
  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = (transactions || []).filter((t) => {
      const d = new Date(t.date);
      if (d < from || d > to) return false;
      if (typeFilter !== 'all' && t.type !== typeFilter) return false;
      if (q) {
        const hay = `${describe(t)} ${t.counterparty} ${t.title} ${amt(t.amount)}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });

    filtered.sort((a, b) =>
      sortDesc ? new Date(b.date) - new Date(a.date) : new Date(a.date) - new Date(b.date)
    );

    const out = [];
    const idx = {};
    for (const t of filtered) {
      const d = new Date(t.date);
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      if (idx[key] === undefined) {
        idx[key] = out.length;
        out.push({ key, label: groupLabel(d), items: [] });
      }
      out[idx[key]].items.push(t);
    }
    return out;
  }, [transactions, query, from, to, sortDesc, typeFilter]);

  const isEmpty = groups.length === 0;

  const cycleFilter = () =>
    setTypeFilter((f) => (f === 'all' ? 'credit' : f === 'credit' ? 'debit' : 'all'));

  const onDownload = async () => {
    const lines = [];
    for (const g of groups) {
      lines.push('', g.label);
      for (const t of g.items) {
        const sign = t.type === 'credit' ? '+' : '-';
        lines.push(`  ${describe(t)}`);
        lines.push(`    ${sign} ${amt(t.amount)}   Balance ${formatMoney(t.balanceAfter)}`);
      }
    }
    const text = `Meezan Bank — Statement\n${rangeText}\n${lines.join('\n')}`;
    try {
      await Share.share({ message: text });
    } catch (e) {}
  };

  const goHome = () => navigation.reset({ index: 0, routes: [{ name: 'Home' }] });

  return (
    <View style={styles.root}>
      <StatusBar style="light" />

      {/* Purple header: title row + search */}
      <LinearGradient
        colors={[colors.gradientStart, colors.gradientEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <View style={{ height: insets.top }} />
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.hBtn}>
            <Ionicons name="arrow-back" size={24} color={colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>View Transactions</Text>
          <View style={{ flex: 1 }} />
          <TouchableOpacity onPress={goHome} style={styles.hBtn}>
            <Ionicons name="home" size={22} color={colors.white} />
          </TouchableOpacity>
          <TouchableOpacity onPress={goHome} style={styles.hBtn}>
            <Ionicons name="power" size={22} color={colors.white} />
          </TouchableOpacity>
        </View>

        <View style={styles.searchWrap}>
          <Ionicons name="search" size={18} color={colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search"
            placeholderTextColor={colors.textMuted}
            value={query}
            onChangeText={setQuery}
            returnKeyType="search"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <Ionicons name="close-circle" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>

      {/* Fixed controls: balance card (overlapping the header), range + chips */}
      <View style={styles.controls}>
        <View style={styles.balanceCard}>
          {hideBalance ? (
            <TouchableOpacity onPress={() => setHideBalance(false)} activeOpacity={0.7} style={styles.showWrap}>
              <Text style={styles.showText}>SHOW BALANCE</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.balanceRow}>
              <Text style={styles.balanceAmt}>{formatMoney(balance)}</Text>
              <TouchableOpacity onPress={() => setHideBalance(true)} activeOpacity={0.7}>
                <Text style={styles.hideText}>HIDE</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={styles.rangeRow}>
          <TouchableOpacity
            style={styles.datePill}
            activeOpacity={0.8}
            onPress={() => setRangeMode('month')}
          >
            <Ionicons name="calendar-outline" size={16} color={colors.primary} />
            <Text style={styles.dateText} numberOfLines={1}>{rangeText}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.downloadBtn} activeOpacity={0.7} onPress={onDownload}>
            <Ionicons name="download-outline" size={18} color={colors.primary} />
            <Text style={styles.downloadText}>Download</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.chipsRow}>
          <Chip label="3 Months" active={rangeMode === '3m'} onPress={() => setRangeMode('3m')} />
          <Chip label="6 Months" active={rangeMode === '6m'} onPress={() => setRangeMode('6m')} />
          <Chip label="1 Year" active={rangeMode === '1y'} onPress={() => setRangeMode('1y')} />
          <View style={{ flex: 1 }} />
          <IconAction icon="swap-vertical" label="Sort" onPress={() => setSortDesc((s) => !s)} active={!sortDesc} />
          <IconAction icon="options-outline" label="Filters" onPress={cycleFilter} active={typeFilter !== 'all'} />
        </View>
      </View>

      {/* Scrollable, date-grouped transaction list */}
      <ScrollView
        style={styles.list}
        contentContainerStyle={{ padding: spacing.lg, paddingBottom: insets.bottom + spacing.xl }}
        showsVerticalScrollIndicator={false}
      >
        {isEmpty ? (
          <Text style={styles.empty}>No transactions in this period.</Text>
        ) : (
          groups.map((g) => (
            <View key={g.key} style={{ marginBottom: spacing.sm }}>
              <Text style={styles.groupHeader}>{g.label}</Text>
              {g.items.map((item) => {
                const isCredit = item.type === 'credit';
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.txnCard}
                    activeOpacity={0.7}
                    onPress={() => navigation.navigate('Receipt', { txn: item })}
                  >
                    <View style={{ flex: 1, paddingRight: spacing.md }}>
                      <Text style={styles.txnDesc} numberOfLines={3}>{describe(item)}</Text>
                      <Text style={styles.txnBalance}>
                        Balance <Text style={styles.txnBalanceVal}>{formatMoney(item.balanceAfter)}</Text>
                      </Text>
                    </View>
                    <Text style={[styles.txnAmt, { color: isCredit ? colors.accentGreen : colors.danger }]}>
                      {isCredit ? '+ ' : '- '}
                      {amt(item.amount)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.screenBg },

  header: { paddingHorizontal: spacing.lg, paddingBottom: 44 },
  headerRow: { flexDirection: 'row', alignItems: 'center', height: 48 },
  headerTitle: { color: colors.white, fontSize: 18, fontWeight: '700', marginLeft: spacing.sm },
  hBtn: { padding: 6, marginLeft: spacing.xs },

  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 10,
    paddingHorizontal: spacing.md,
    height: 44,
    marginTop: spacing.sm,
  },
  searchInput: { flex: 1, marginLeft: spacing.sm, color: colors.textDark, fontSize: 14, padding: 0 },

  // Sits just below the header and overlaps up into the purple.
  controls: { paddingHorizontal: spacing.lg, backgroundColor: colors.screenBg },
  balanceCard: {
    marginTop: -32,
    backgroundColor: colors.white,
    borderRadius: 12,
    paddingVertical: 18,
    paddingHorizontal: spacing.lg,
    minHeight: 60,
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  balanceRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  balanceAmt: { color: colors.accentGreen, fontSize: 21, fontWeight: '800' },
  hideText: { color: colors.textMuted, fontSize: 13, fontWeight: '700', letterSpacing: 0.5 },
  showWrap: { alignItems: 'center', justifyContent: 'center' },
  showText: { color: colors.accentGreen, fontSize: 15, fontWeight: '800', letterSpacing: 0.5 },

  rangeRow: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.md },
  datePill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 10,
    paddingHorizontal: spacing.md,
    height: 40,
    marginRight: spacing.sm,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
  },
  dateText: { marginLeft: spacing.sm, color: colors.textDark, fontSize: 13, fontWeight: '600' },
  downloadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 10,
    paddingHorizontal: spacing.md,
    height: 40,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
  },
  downloadText: { marginLeft: 6, color: colors.primary, fontSize: 13, fontWeight: '700' },

  chipsRow: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.md },
  chip: {
    backgroundColor: colors.white,
    borderRadius: 16,
    paddingHorizontal: spacing.md,
    paddingVertical: 7,
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: colors.tileBorder,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: 12, color: colors.textDark, fontWeight: '600' },
  chipTextActive: { color: colors.white },
  iconAction: { alignItems: 'center', marginLeft: spacing.md, width: 46 },
  iconActionLabel: { fontSize: 11, color: colors.textMuted, marginTop: 2, fontWeight: '600' },

  list: { flex: 1 },
  groupHeader: { color: MAGENTA, fontSize: 14, fontWeight: '800', marginTop: spacing.md, marginBottom: spacing.sm },
  txnCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
  },
  txnDesc: { fontSize: 14.5, color: colors.textDark, lineHeight: 20, fontWeight: '500' },
  txnBalance: { fontSize: 12.5, color: colors.primary, fontWeight: '700', marginTop: spacing.sm },
  txnBalanceVal: { color: colors.textDark, fontWeight: '600' },
  txnAmt: { fontSize: 15, fontWeight: '800' },

  empty: { textAlign: 'center', color: colors.textMuted, marginTop: 60, fontSize: 14 },
});
