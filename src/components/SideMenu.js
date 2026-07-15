import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  ScrollView,
  Pressable,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, spacing } from '../theme';

const { width } = Dimensions.get('window');
const PANEL_WIDTH = Math.min(width * 0.82, 330);
const APP_VERSION = 'v 1.1.50 (272)';

// Each row maps to a real screen registered in the navigator.
const ITEMS = [
  { label: 'My Profile', route: 'Profile', icon: (p) => <Ionicons name="person-outline" size={22} color={p} /> },
  { label: 'My Accounts', route: 'Accounts', icon: (p) => <Ionicons name="card-outline" size={22} color={p} /> },
  { label: 'Settings', route: 'Settings', icon: (p) => <Ionicons name="settings-outline" size={22} color={p} /> },
  { label: 'Notifications', route: 'Notifications', icon: (p) => <Ionicons name="notifications-outline" size={22} color={p} /> },
  { label: 'Qibla', route: 'Qibla', icon: (p) => <MaterialCommunityIcons name="compass-outline" size={23} color={p} /> },
  { label: 'FAQs', route: 'Faqs', icon: (p) => <Ionicons name="help-circle-outline" size={23} color={p} /> },
  { label: 'Deals and Discounts', route: 'Deals', icon: (p) => <Ionicons name="pricetags-outline" size={22} color={p} /> },
  { label: 'Terms and Conditions', route: 'Terms', icon: (p) => <Ionicons name="document-text-outline" size={22} color={p} /> },
  { label: 'Schedule of Charges', route: 'Charges', icon: (p) => <Ionicons name="reader-outline" size={22} color={p} /> },
];

export default function SideMenu({ visible, onClose, onNavigate }) {
  const insets = useSafeAreaInsets();
  const slide = useRef(new Animated.Value(-PANEL_WIDTH)).current;
  const fade = useRef(new Animated.Value(0)).current;
  const [mounted, setMounted] = useState(visible);

  useEffect(() => {
    if (visible) {
      setMounted(true);
      Animated.parallel([
        Animated.timing(slide, { toValue: 0, duration: 240, useNativeDriver: true }),
        Animated.timing(fade, { toValue: 1, duration: 240, useNativeDriver: true }),
      ]).start();
    } else if (mounted) {
      Animated.parallel([
        Animated.timing(slide, { toValue: -PANEL_WIDTH, duration: 220, useNativeDriver: true }),
        Animated.timing(fade, { toValue: 0, duration: 220, useNativeDriver: true }),
      ]).start(({ finished }) => finished && setMounted(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  if (!mounted) return null;

  const go = (route) => {
    onClose();
    // Let the close animation begin, then navigate.
    requestAnimationFrame(() => onNavigate(route));
  };

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      <Animated.View style={[styles.backdrop, { opacity: fade }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      </Animated.View>

      <Animated.View
        style={[
          styles.panel,
          { width: PANEL_WIDTH, paddingTop: insets.top + spacing.md, transform: [{ translateX: slide }] },
        ]}
      >
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: spacing.md }}>
          {ITEMS.map((item) => (
            <TouchableOpacity
              key={item.route}
              style={styles.row}
              activeOpacity={0.6}
              onPress={() => go(item.route)}
            >
              <View style={styles.rowIcon}>{item.icon(colors.primary)}</View>
              <Text style={styles.rowLabel}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.sm }]}>
          <Text style={styles.version}>{APP_VERSION}</Text>
          <View style={styles.footerRow}>
            <TouchableOpacity style={styles.footerBtn} activeOpacity={0.6} onPress={() => go('LocateUs')}>
              <Ionicons name="location-outline" size={22} color={colors.primary} />
              <Text style={styles.footerLabel}>Locate Us</Text>
            </TouchableOpacity>
            <View style={styles.footerDivider} />
            <TouchableOpacity style={styles.footerBtn} activeOpacity={0.6} onPress={() => go('ContactUs')}>
              <Ionicons name="call-outline" size={22} color={colors.primary} />
              <Text style={styles.footerLabel}>Contact Us</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.45)' },
  panel: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: colors.white,
    elevation: 16,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 2, height: 0 },
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ECECEF',
  },
  rowIcon: { width: 34 },
  rowLabel: { fontSize: 15.5, color: colors.textDark, fontWeight: '500' },

  footer: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#E4E4E8', paddingTop: spacing.md },
  version: { textAlign: 'center', color: colors.textMuted, fontSize: 12, marginBottom: spacing.sm },
  footerRow: { flexDirection: 'row', alignItems: 'center' },
  footerBtn: { flex: 1, alignItems: 'center', paddingVertical: spacing.sm },
  footerLabel: { fontSize: 12.5, color: colors.textDark, marginTop: 4, fontWeight: '600' },
  footerDivider: { width: StyleSheet.hairlineWidth, height: 34, backgroundColor: '#E4E4E8' },
});
