import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Alert } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { branding } from '../../config/branding';
import { colors, spacing } from '../../theme';

const HELPLINE = '+92 21 111 331 331';
const EMAIL = 'support@digitalbank.example';
const WEBSITE = 'https://www.digitalbank.example';
const WHATSAPP = '+922111331331';

export default function ContactUsScreen() {
  const open = async (url, fallbackMsg) => {
    try {
      const ok = await Linking.canOpenURL(url);
      if (ok) await Linking.openURL(url);
      else Alert.alert('Unavailable', fallbackMsg);
    } catch (e) {
      Alert.alert('Unavailable', fallbackMsg);
    }
  };

  const CONTACTS = [
    {
      icon: <Ionicons name="call" size={22} color={colors.white} />,
      bg: colors.accentGreen,
      title: 'Helpline (24/7)',
      value: HELPLINE,
      onPress: () => open(`tel:${HELPLINE.replace(/\s/g, '')}`, 'Calling is not supported on this device.'),
    },
    {
      icon: <MaterialCommunityIcons name="whatsapp" size={22} color={colors.white} />,
      bg: '#25D366',
      title: 'WhatsApp',
      value: WHATSAPP,
      onPress: () => open(`whatsapp://send?phone=${WHATSAPP.replace(/[^0-9]/g, '')}`, 'WhatsApp is not installed on this device.'),
    },
    {
      icon: <Ionicons name="mail" size={22} color={colors.white} />,
      bg: colors.primary,
      title: 'Email',
      value: EMAIL,
      onPress: () => open(`mailto:${EMAIL}`, 'No email app is set up on this device.'),
    },
    {
      icon: <Ionicons name="globe-outline" size={22} color={colors.white} />,
      bg: colors.buttonPurple,
      title: 'Website',
      value: WEBSITE.replace('https://', ''),
      onPress: () => open(WEBSITE, 'Could not open the website.'),
    },
  ];

  return (
    <ScrollView style={styles.root} contentContainerStyle={{ padding: spacing.lg }}>
      <Text style={styles.header}>We're here to help</Text>
      <Text style={styles.sub}>Reach {branding.bankName} through any of the channels below.</Text>

      {CONTACTS.map((c, i) => (
        <TouchableOpacity key={i} style={styles.card} activeOpacity={0.75} onPress={c.onPress}>
          <View style={[styles.iconWrap, { backgroundColor: c.bg }]}>{c.icon}</View>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>{c.title}</Text>
            <Text style={styles.value}>{c.value}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
        </TouchableOpacity>
      ))}

      <View style={styles.addressCard}>
        <MaterialCommunityIcons name="office-building-marker-outline" size={22} color={colors.primary} />
        <Text style={styles.address}>
          Head Office: I.I. Chundrigar Road, Karachi, Pakistan
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.screenBg },
  header: { fontSize: 18, fontWeight: '800', color: colors.textDark },
  sub: { fontSize: 13.5, color: colors.textMuted, marginTop: 4, marginBottom: spacing.lg },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  iconWrap: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginRight: spacing.md },
  title: { fontSize: 14.5, fontWeight: '800', color: colors.textDark },
  value: { fontSize: 13, color: colors.textMuted, marginTop: 2 },

  addressCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7F3FA',
    borderRadius: 12,
    padding: spacing.lg,
    marginTop: spacing.sm,
  },
  address: { flex: 1, fontSize: 13.5, color: colors.textDark, marginLeft: spacing.md, lineHeight: 20 },
});
