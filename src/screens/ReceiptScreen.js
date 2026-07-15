import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Share } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAccount } from '../context/AccountContext';
import { colors, spacing } from '../theme';

function Row({ label, value, strong }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={[styles.rowValue, strong && styles.rowValueStrong]} selectable>
        {value}
      </Text>
    </View>
  );
}

export default function ReceiptScreen({ navigation, route }) {
  const { txn } = route.params;
  const { formatMoney } = useAccount();
  const dateStr = new Date(txn.date).toLocaleString();

  const onShare = async () => {
    try {
      await Share.share({
        message:
          `Transaction Receipt\n` +
          `Transaction ID: ${txn.id}\n` +
          `Reference: ${txn.reference}\n` +
          `To: ${txn.counterparty}\n` +
          `Amount: ${formatMoney(txn.amount)}\n` +
          `Status: ${txn.status}\n` +
          `Date: ${dateStr}`,
      });
    } catch (e) {}
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.successCircle}>
        <Ionicons name="checkmark" size={44} color={colors.white} />
      </View>
      <Text style={styles.successTitle}>Transaction Successful</Text>
      <Text style={styles.amount}>{formatMoney(txn.amount)}</Text>

      <View style={styles.card}>
        <Row label="Transaction ID" value={txn.id} strong />
        <Row label="Reference No." value={txn.reference} />
        <Row label="Title" value={txn.title} />
        <Row label="Recipient" value={txn.counterparty} />
        <Row label="Status" value={txn.status} />
        <Row label="Date & Time" value={dateStr} />
        <Row label="Balance After" value={formatMoney(txn.balanceAfter)} />
      </View>

      <TouchableOpacity style={styles.shareBtn} onPress={onShare}>
        <Ionicons name="share-social" size={16} color={colors.white} />
        <Text style={styles.shareBtnText}>Share Receipt</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.homeBtn}
        onPress={() => navigation.popToTop()}
      >
        <Text style={styles.homeBtnText}>Back to Home</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.lg, alignItems: 'center', backgroundColor: colors.screenBg },
  successCircle: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: colors.accentGreen,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.lg,
  },
  successTitle: { fontSize: 18, fontWeight: '800', color: colors.textDark, marginTop: spacing.md },
  amount: { fontSize: 26, fontWeight: '800', color: colors.primary, marginTop: 4, marginBottom: spacing.lg },
  card: {
    width: '100%',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.tileBorder,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E8E8EC',
  },
  rowLabel: { color: colors.textMuted, fontSize: 13, flex: 1 },
  rowValue: { color: colors.textDark, fontSize: 13, fontWeight: '600', flex: 1.4, textAlign: 'right' },
  rowValueStrong: { color: colors.primary, fontWeight: '800' },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 13,
    paddingHorizontal: spacing.xl,
    marginTop: spacing.xl,
  },
  shareBtnText: { color: colors.white, fontWeight: '700', marginLeft: 8 },
  homeBtn: { marginTop: spacing.md, paddingVertical: 12 },
  homeBtnText: { color: colors.primary, fontWeight: '700' },
});
