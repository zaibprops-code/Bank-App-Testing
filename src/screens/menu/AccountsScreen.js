import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAccount } from '../../context/AccountContext';
import { branding } from '../../config/branding';
import { colors, spacing } from '../../theme';

export default function AccountsScreen({ navigation }) {
  const { accountTitle, accountLabel, accountNumber, iban, branch, balance, formatMoney } = useAccount();
  const [reveal, setReveal] = useState(false);

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.body}>
      <View style={styles.card}>
        <View style={styles.cardTop}>
          <MaterialCommunityIcons name="bank" size={26} color={colors.primary} />
          <View style={{ flex: 1, marginLeft: spacing.sm }}>
            <Text style={styles.bank}>{branding.bankName}</Text>
            <Text style={styles.type}>{accountLabel}</Text>
          </View>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Active</Text>
          </View>
        </View>

        <Text style={styles.title}>{accountTitle}</Text>
        <Text style={styles.number}>{accountNumber}</Text>
        <Text style={styles.iban}>{iban}</Text>

        <TouchableOpacity style={styles.balanceBox} activeOpacity={0.7} onPress={() => setReveal((r) => !r)}>
          <View>
            <Text style={styles.balanceLabel}>Available Balance</Text>
            <Text style={styles.balanceValue}>{reveal ? formatMoney(balance) : '•••••••'}</Text>
          </View>
          <Ionicons name={reveal ? 'eye-off-outline' : 'eye-outline'} size={22} color={colors.primary} />
        </TouchableOpacity>

        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>Branch</Text>
          <Text style={styles.metaValue}>{branch}</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.txnBtn} activeOpacity={0.85} onPress={() => navigation.navigate('Transactions')}>
        <MaterialCommunityIcons name="file-document-outline" size={18} color={colors.white} />
        <Text style={styles.txnText}>View Transactions</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.screenBg },
  body: { padding: spacing.lg },
  card: {
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: spacing.lg,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  cardTop: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md },
  bank: { fontSize: 15, fontWeight: '800', color: colors.textDark },
  type: { fontSize: 12.5, color: colors.textMuted, marginTop: 1 },
  badge: { backgroundColor: '#E6F6EC', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeText: { color: colors.accentGreen, fontSize: 11.5, fontWeight: '800' },

  title: { fontSize: 15, fontWeight: '700', color: colors.textDark, marginTop: 4 },
  number: { fontSize: 14, color: colors.textDark, marginTop: 6, letterSpacing: 1 },
  iban: { fontSize: 12.5, color: colors.textMuted, marginTop: 2 },

  balanceBox: {
    marginTop: spacing.lg,
    backgroundColor: '#F7F3FA',
    borderRadius: 10,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  balanceLabel: { fontSize: 12.5, color: colors.textMuted },
  balanceValue: { fontSize: 22, fontWeight: '800', color: colors.accentGreen, marginTop: 4 },

  metaRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.lg },
  metaLabel: { fontSize: 13, color: colors.textMuted },
  metaValue: { fontSize: 13, color: colors.textDark, fontWeight: '700' },

  txnBtn: {
    marginTop: spacing.lg,
    backgroundColor: colors.buttonPurple,
    borderRadius: 10,
    paddingVertical: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  txnText: { color: colors.white, fontWeight: '800', fontSize: 15, marginLeft: 8 },
});
