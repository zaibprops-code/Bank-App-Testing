import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing } from '../theme';

// Bank list for the "New Transfer" picker.
//
// Each bank can carry a real logo via `logo: require('../../assets/banks/<file>.png')`.
// Until an official logo file is added, a tinted initials avatar is shown as a
// placeholder. Drop transparent PNGs into assets/banks/ and set `logo` to wire
// them in (the trademarked bank logos are not redrawn here).
const OWN_BANK = { key: 'meezan', name: 'Meezan Bank', logo: require('../../assets/banks/meezan.png') };

const OTHER_BANKS = [
  { key: 'jazzcash', name: 'Jazz Cash Wallet', logo: require('../../assets/banks/jazzcash.png') },
  { key: 'easypaisa', name: 'EasyPaisa-Telenor Bank', logo: require('../../assets/banks/easypaisa.png') },
  { key: 'hblkonnect', name: 'HBL KONNECT', logo: require('../../assets/banks/hbl.png') },
  { key: 'ubl', name: 'UBL', logo: require('../../assets/banks/ubl.png') },
  { key: 'alfalah', name: 'Bank Alfalah', logo: require('../../assets/banks/alfalah.png') },
  { key: 'allied', name: 'Allied Bank', logo: require('../../assets/banks/allied.png') },
];

function BankLogo({ bank }) {
  if (bank.logo) {
    return <Image source={bank.logo} style={styles.logoImg} resizeMode="contain" />;
  }
  return (
    <View style={[styles.logoCircle, { backgroundColor: bank.tint || colors.primary }]}>
      <Text style={styles.logoInitials}>{bank.initials}</Text>
    </View>
  );
}

export default function NewTransferScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');

  const q = query.trim().toLowerCase();
  const match = (b) => b.name.toLowerCase().includes(q);
  const own = match(OWN_BANK) ? [OWN_BANK] : [];
  const others = OTHER_BANKS.filter(match);

  const pick = (bank) => navigation.navigate('SendMoney', { presetTitle: bank.name });

  const renderRow = (b) => (
    <TouchableOpacity key={b.key} style={styles.card} activeOpacity={0.7} onPress={() => pick(b)}>
      <BankLogo bank={b} />
      <Text style={styles.bankName}>{b.name}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.root}>
      {/* Gradient header with title, home/power actions and search */}
      <LinearGradient
        colors={[colors.gradientStart, colors.gradientEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <View style={{ height: insets.top }} />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.hBtn}>
            <Ionicons name="chevron-back" size={26} color={colors.white} />
          </TouchableOpacity>
          <Text style={styles.title}>New Transfer</Text>
          <View style={{ flex: 1 }} />
          <TouchableOpacity onPress={() => navigation.navigate('Home')} style={styles.hBtn}>
            <Ionicons name="home" size={22} color={colors.white} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Home')} style={styles.hBtn}>
            <Ionicons name="power" size={22} color={colors.white} />
          </TouchableOpacity>
        </View>

        <View style={styles.searchWrap}>
          <Ionicons name="search" size={20} color={colors.primary} style={{ marginRight: 8 }} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search"
            placeholderTextColor={colors.textMuted}
            style={styles.searchInput}
          />
        </View>
      </LinearGradient>

      <ScrollView style={styles.body} contentContainerStyle={{ padding: spacing.lg }}>
        {own.map(renderRow)}

        {others.length > 0 && <Text style={styles.section}>Other Banks</Text>}
        {others.map(renderRow)}

        {own.length === 0 && others.length === 0 && (
          <Text style={styles.empty}>No banks found</Text>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#EFEFF3' },

  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.sm, height: 52 },
  hBtn: { padding: 6 },
  title: { color: colors.white, fontSize: 19, fontWeight: '700', marginLeft: 2 },

  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 44,
  },
  searchInput: { flex: 1, fontSize: 15, color: colors.textDark, paddingVertical: 0 },

  body: { flex: 1 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 14,
    marginBottom: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  logoImg: { width: 40, height: 40, marginRight: 14, borderRadius: 6 },
  logoCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  logoInitials: { color: colors.white, fontWeight: '800', fontSize: 13 },
  bankName: { flex: 1, fontSize: 15.5, fontWeight: '600', color: colors.textDark },

  section: { fontSize: 13, color: colors.textMuted, marginBottom: 10, marginTop: 4, fontWeight: '600' },
  empty: { textAlign: 'center', color: colors.textMuted, marginTop: 40 },
});
