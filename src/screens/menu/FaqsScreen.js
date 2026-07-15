import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, LayoutAnimation, Platform, UIManager } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing } from '../../theme';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const FAQS = [
  {
    q: 'How do I send money to another bank?',
    a: 'Tap “Send Money” on the Home screen, choose the recipient bank, enter the account number and amount, then confirm. You will get a receipt you can share or save.',
  },
  {
    q: 'What is an IBFT / 1LINK transfer?',
    a: 'IBFT (Inter-Bank Funds Transfer) lets you move money instantly between accounts at different banks through the 1LINK network.',
  },
  {
    q: 'How do I add a favorite payee?',
    a: 'On the transaction receipt screen, tap “Favorite Payee”. The payee is saved so you can pay them faster next time.',
  },
  {
    q: 'How can I see my balance?',
    a: 'Tap “SHOW BALANCE” on the Home card. You can also turn on “Show balance on Home” in Settings to reveal it automatically.',
  },
  {
    q: 'Is my app secure?',
    a: 'Yes. You can enable Biometric App Lock in Settings to require your fingerprint or Face ID every time the app opens.',
  },
  {
    q: 'How do I find the Qibla direction?',
    a: 'Open Qibla from the side menu. Allow location access, hold your phone flat, and rotate until the Kaaba marker aligns with the top pointer.',
  },
  {
    q: 'What are the charges for transfers?',
    a: 'Open “Schedule of Charges” from the side menu to see the fees for each service.',
  },
];

function Item({ q, a }) {
  const [open, setOpen] = useState(false);
  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpen((o) => !o);
  };
  return (
    <View style={styles.item}>
      <TouchableOpacity style={styles.qRow} onPress={toggle} activeOpacity={0.7}>
        <Text style={styles.q}>{q}</Text>
        <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={20} color={colors.primary} />
      </TouchableOpacity>
      {open && <Text style={styles.a}>{a}</Text>}
    </View>
  );
}

export default function FaqsScreen() {
  return (
    <ScrollView style={styles.root} contentContainerStyle={{ padding: spacing.lg }}>
      <Text style={styles.header}>Frequently Asked Questions</Text>
      {FAQS.map((f, i) => (
        <Item key={i} q={f.q} a={f.a} />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.screenBg },
  header: { fontSize: 15, fontWeight: '800', color: colors.textDark, marginBottom: spacing.md },
  item: {
    backgroundColor: colors.white,
    borderRadius: 10,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginBottom: spacing.md,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
  },
  qRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  q: { flex: 1, fontSize: 14.5, fontWeight: '700', color: colors.textDark, marginRight: spacing.sm },
  a: { fontSize: 13.5, color: colors.textMuted, marginTop: spacing.sm, lineHeight: 20 },
});
