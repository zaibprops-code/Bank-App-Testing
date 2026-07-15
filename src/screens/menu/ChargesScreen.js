import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing } from '../../theme';

const GROUPS = [
  {
    title: 'Funds Transfer',
    rows: [
      ['IBFT / 1LINK (up to Rs 25,000)', 'Free'],
      ['IBFT / 1LINK (above Rs 25,000)', 'Rs 15.00'],
      ['Raast Payment', 'Free'],
      ['Own account transfer', 'Free'],
    ],
  },
  {
    title: 'Cards',
    rows: [
      ['Debit card issuance', 'Rs 500.00'],
      ['Debit card annual fee', 'Rs 1,200.00'],
      ['ATM withdrawal (other bank)', 'Rs 23.44'],
    ],
  },
  {
    title: 'Cheques & Pay Orders',
    rows: [
      ['Pay order issuance', 'Rs 250.00'],
      ['Cheque book (25 leaves)', 'Rs 300.00'],
      ['Stop payment', 'Rs 200.00'],
    ],
  },
  {
    title: 'Statements & Certificates',
    rows: [
      ['Account statement (email)', 'Free'],
      ['Duplicate statement', 'Rs 100.00'],
      ['Account maintenance certificate', 'Rs 200.00'],
    ],
  },
];

export default function ChargesScreen() {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return GROUPS;
    return GROUPS.map((g) => ({
      ...g,
      rows: g.rows.filter(([name]) => name.toLowerCase().includes(q)),
    })).filter((g) => g.rows.length > 0);
  }, [query]);

  return (
    <View style={styles.root}>
      <View style={styles.searchBox}>
        <Ionicons name="search" size={18} color={colors.textMuted} />
        <TextInput
          style={styles.search}
          value={query}
          onChangeText={setQuery}
          placeholder="Search a charge…"
          placeholderTextColor={colors.textMuted}
        />
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingTop: spacing.sm }}>
        {filtered.length === 0 && <Text style={styles.empty}>No charges match “{query}”.</Text>}
        {filtered.map((g) => (
          <View key={g.title} style={styles.card}>
            <Text style={styles.groupTitle}>{g.title}</Text>
            {g.rows.map(([name, charge], i) => (
              <View key={i} style={[styles.row, i === g.rows.length - 1 && { borderBottomWidth: 0 }]}>
                <Text style={styles.name}>{name}</Text>
                <Text style={[styles.charge, charge === 'Free' && styles.free]}>{charge}</Text>
              </View>
            ))}
          </View>
        ))}
        <Text style={styles.note}>Charges are indicative for this demo app and may differ from actual bank tariffs.</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.screenBg },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    margin: spacing.lg,
    marginBottom: 0,
    borderRadius: 10,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: '#E4E4E8',
  },
  search: { flex: 1, paddingVertical: 10, marginLeft: 8, fontSize: 14.5, color: colors.textDark },

  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    marginBottom: spacing.lg,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  groupTitle: { fontSize: 14, fontWeight: '800', color: colors.primary, marginVertical: spacing.sm },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#EEE' },
  name: { flex: 1, fontSize: 13.5, color: colors.textDark, marginRight: spacing.md },
  charge: { fontSize: 13.5, fontWeight: '800', color: colors.textDark },
  free: { color: colors.accentGreen },
  empty: { textAlign: 'center', color: colors.textMuted, marginTop: spacing.xl },
  note: { fontSize: 11.5, color: colors.textMuted, textAlign: 'center', marginBottom: spacing.xl },
});
