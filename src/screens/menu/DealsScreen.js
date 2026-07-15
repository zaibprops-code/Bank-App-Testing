import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, spacing } from '../../theme';

const DEALS = [
  { id: '1', cat: 'Food', merchant: 'Cheezious', offer: '15% off on all deals', code: 'BANK15', color: '#E8543F' },
  { id: '2', cat: 'Food', merchant: 'KFC', offer: 'Free drink with any meal', code: 'KFCFREE', color: '#C1121F' },
  { id: '3', cat: 'Shopping', merchant: 'Outfitters', offer: 'Flat 20% off', code: 'OUT20', color: '#3A6EA5' },
  { id: '4', cat: 'Shopping', merchant: 'Khaadi', offer: 'Buy 2 get 1 free', code: 'KHAADI3', color: '#6A4C93' },
  { id: '5', cat: 'Travel', merchant: 'Careem', offer: 'Rs 200 off your next 3 rides', code: 'RIDE200', color: '#0B7A3B' },
  { id: '6', cat: 'Travel', merchant: 'Airblue', offer: '10% off domestic flights', code: 'FLY10', color: '#1B4965' },
  { id: '7', cat: 'Health', merchant: 'Dvago', offer: '12% off on medicines', code: 'CARE12', color: '#2A9D8F' },
];

const CATS = ['All', 'Food', 'Shopping', 'Travel', 'Health'];

export default function DealsScreen() {
  const [cat, setCat] = useState('All');
  const data = useMemo(() => (cat === 'All' ? DEALS : DEALS.filter((d) => d.cat === cat)), [cat]);

  return (
    <View style={styles.root}>
      <View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          {CATS.map((c) => {
            const active = c === cat;
            return (
              <TouchableOpacity key={c} style={[styles.chip, active && styles.chipActive]} onPress={() => setCat(c)} activeOpacity={0.8}>
                <Text style={[styles.chipText, active && styles.chipTextActive]}>{c}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <FlatList
        data={data}
        keyExtractor={(d) => d.id}
        contentContainerStyle={{ padding: spacing.lg, paddingTop: spacing.sm }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={[styles.logo, { backgroundColor: item.color }]}>
              <Text style={styles.logoText}>{item.merchant.charAt(0)}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.merchant}>{item.merchant}</Text>
              <Text style={styles.offer}>{item.offer}</Text>
              <View style={styles.codeRow}>
                <MaterialCommunityIcons name="ticket-percent-outline" size={15} color={colors.primary} />
                <Text style={styles.code}>Code: {item.code}</Text>
              </View>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.screenBg },
  chips: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  chip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: colors.white, marginRight: spacing.sm, borderWidth: 1, borderColor: '#E4E4E8' },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: 13, color: colors.textDark, fontWeight: '600' },
  chipTextActive: { color: colors.white },

  card: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  logo: { width: 48, height: 48, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginRight: spacing.md },
  logoText: { color: colors.white, fontSize: 22, fontWeight: '800' },
  merchant: { fontSize: 15, fontWeight: '800', color: colors.textDark },
  offer: { fontSize: 13.5, color: colors.textDark, marginTop: 2 },
  codeRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  code: { fontSize: 12.5, color: colors.primary, fontWeight: '700', marginLeft: 4 },
});
