import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { branding } from '../../config/branding';
import { colors, spacing } from '../../theme';

const SECTIONS = [
  {
    title: '1. Acceptance of Terms',
    body: 'By downloading, accessing, or using this application, you agree to be bound by these Terms and Conditions. If you do not agree, please discontinue use of the app.',
  },
  {
    title: '2. Use of the Service',
    body: 'The app is provided to help you manage your account, view transactions, and make transfers. You agree to use the service only for lawful purposes and in accordance with these terms.',
  },
  {
    title: '3. Account Security',
    body: 'You are responsible for keeping your login credentials, device, and biometric access secure. Notify us immediately if you suspect unauthorised access to your account.',
  },
  {
    title: '4. Transactions',
    body: 'You are responsible for verifying recipient details before confirming any transfer. Completed transfers may not be reversible. Standard charges may apply as listed in the Schedule of Charges.',
  },
  {
    title: '5. Fees and Charges',
    body: 'Applicable fees for services such as inter-bank transfers are shown in the Schedule of Charges section and may be updated from time to time.',
  },
  {
    title: '6. Limitation of Liability',
    body: 'This is a demonstration application. To the maximum extent permitted by law, we are not liable for any indirect or consequential loss arising from use of the app.',
  },
  {
    title: '7. Changes to Terms',
    body: 'We may update these Terms and Conditions periodically. Continued use of the app after changes are posted constitutes acceptance of the revised terms.',
  },
  {
    title: '8. Contact',
    body: 'For any questions about these terms, please reach us through the Contact Us section of the app.',
  },
];

export default function TermsScreen() {
  return (
    <ScrollView style={styles.root} contentContainerStyle={{ padding: spacing.lg }}>
      <Text style={styles.title}>Terms & Conditions</Text>
      <Text style={styles.updated}>{branding.bankName} · Last updated: July 2026</Text>
      {SECTIONS.map((s, i) => (
        <View key={i} style={styles.block}>
          <Text style={styles.heading}>{s.title}</Text>
          <Text style={styles.body}>{s.body}</Text>
        </View>
      ))}
      <Text style={styles.footer}>© 2026 {branding.bankName}. All rights reserved.</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.screenBg },
  title: { fontSize: 20, fontWeight: '800', color: colors.textDark },
  updated: { fontSize: 12.5, color: colors.textMuted, marginTop: 4, marginBottom: spacing.lg },
  block: { marginBottom: spacing.lg },
  heading: { fontSize: 15, fontWeight: '800', color: colors.primary, marginBottom: 6 },
  body: { fontSize: 13.5, color: colors.textDark, lineHeight: 21 },
  footer: { fontSize: 12, color: colors.textMuted, textAlign: 'center', marginTop: spacing.md, marginBottom: spacing.xl },
});
