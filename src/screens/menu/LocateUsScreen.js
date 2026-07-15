import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Linking, Platform, Alert } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, spacing } from '../../theme';

// A few sample branches / ATMs with real coordinates so directions work.
const BRANCHES = [
  { id: '1', name: 'Main Branch — I.I. Chundrigar', address: 'I.I. Chundrigar Road, Karachi', phone: '+922138310000', lat: 24.8497, lon: 67.0099, atm: true },
  { id: '2', name: 'Clifton Branch', address: 'Block 5, Clifton, Karachi', phone: '+922135870000', lat: 24.8138, lon: 67.0300, atm: true },
  { id: '3', name: 'Gulberg Branch', address: 'Main Boulevard, Gulberg, Lahore', phone: '+924235710000', lat: 31.5169, lon: 74.3484, atm: true },
  { id: '4', name: 'Blue Area Branch', address: 'Jinnah Avenue, Blue Area, Islamabad', phone: '+925122270000', lat: 33.7086, lon: 73.0551, atm: false },
];

export default function LocateUsScreen() {
  const openDirections = (b) => {
    const label = encodeURIComponent(b.name);
    const latLng = `${b.lat},${b.lon}`;
    const url = Platform.select({
      ios: `maps://?q=${label}&ll=${latLng}`,
      android: `geo:${latLng}?q=${latLng}(${label})`,
    });
    const web = `https://www.google.com/maps/search/?api=1&query=${latLng}`;
    Linking.canOpenURL(url)
      .then((ok) => Linking.openURL(ok ? url : web))
      .catch(() => Linking.openURL(web));
  };

  const call = (phone) => {
    const url = `tel:${phone}`;
    Linking.canOpenURL(url)
      .then((ok) => (ok ? Linking.openURL(url) : Alert.alert('Unavailable', 'Calling is not supported on this device.')))
      .catch(() => {});
  };

  return (
    <FlatList
      style={styles.root}
      data={BRANCHES}
      keyExtractor={(b) => b.id}
      contentContainerStyle={{ padding: spacing.lg }}
      ListHeaderComponent={<Text style={styles.header}>Branches & ATMs</Text>}
      renderItem={({ item }) => (
        <View style={styles.card}>
          <View style={styles.cardTop}>
            <MaterialCommunityIcons name="bank-outline" size={24} color={colors.primary} />
            <View style={{ flex: 1, marginLeft: spacing.sm }}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.address}>{item.address}</Text>
            </View>
            {item.atm && (
              <View style={styles.atmTag}>
                <Text style={styles.atmText}>ATM</Text>
              </View>
            )}
          </View>

          <View style={styles.actions}>
            <TouchableOpacity style={styles.actionBtn} onPress={() => openDirections(item)} activeOpacity={0.8}>
              <Ionicons name="navigate-outline" size={16} color={colors.white} />
              <Text style={styles.actionText}>Directions</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionBtn, styles.callBtn]} onPress={() => call(item.phone)} activeOpacity={0.8}>
              <Ionicons name="call-outline" size={16} color={colors.primary} />
              <Text style={[styles.actionText, { color: colors.primary }]}>Call</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.screenBg },
  header: { fontSize: 15, fontWeight: '800', color: colors.textDark, marginBottom: spacing.md },
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.md,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start' },
  name: { fontSize: 15, fontWeight: '800', color: colors.textDark },
  address: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
  atmTag: { backgroundColor: '#E6F6EC', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12 },
  atmText: { color: colors.accentGreen, fontSize: 11, fontWeight: '800' },

  actions: { flexDirection: 'row', marginTop: spacing.md },
  actionBtn: {
    flex: 1,
    backgroundColor: colors.buttonPurple,
    borderRadius: 8,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  callBtn: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.primary, marginRight: 0 },
  actionText: { color: colors.white, fontWeight: '700', fontSize: 13, marginLeft: 6 },
});
