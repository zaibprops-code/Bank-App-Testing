import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useAccount } from '../../context/AccountContext';
import { colors, spacing } from '../../theme';

const PROFILE_KEY = '@bankapp_profile_v1';

function initialsOf(name) {
  return String(name || '')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w.charAt(0).toUpperCase())
    .join('');
}

export default function ProfileScreen() {
  const { accountTitle, accountLabel, accountNumber, iban, branch, updateAccountTitle } = useAccount();
  const [name, setName] = useState(accountTitle);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [saving, setSaving] = useState(false);

  // Keep the field in sync when the stored name loads / changes.
  useEffect(() => {
    setName(accountTitle);
  }, [accountTitle]);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(PROFILE_KEY);
        if (raw) {
          const p = JSON.parse(raw);
          setEmail(p.email || '');
          setPhone(p.phone || '');
        }
      } catch (e) {}
    })();
  }, []);

  const onSave = async () => {
    if (!name.trim()) {
      Alert.alert('Name required', 'Please enter your name.');
      return;
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      Alert.alert('Invalid email', 'Please enter a valid email address.');
      return;
    }
    if (phone && !/^[0-9+\-\s]{7,15}$/.test(phone)) {
      Alert.alert('Invalid phone', 'Please enter a valid phone number.');
      return;
    }
    try {
      setSaving(true);
      updateAccountTitle(name);
      await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify({ email, phone }));
      Alert.alert('Profile updated', 'Your profile has been saved.');
    } catch (e) {
      Alert.alert('Error', 'Could not save your profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const Row = ({ label, value }) => (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );

  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
        <View style={styles.avatarWrap}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initialsOf(name) || 'U'}</Text>
          </View>
          <Text style={styles.name}>{name.trim() || accountTitle}</Text>
          <Text style={styles.sub}>{accountLabel}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          <Text style={styles.fieldLabel}>Full Name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Enter your name"
            autoCapitalize="words"
            placeholderTextColor={colors.textMuted}
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Account Details</Text>
          <Row label="Account Number" value={accountNumber} />
          <Row label="IBAN" value={iban} />
          <Row label="Branch" value={branch} />
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Contact Information</Text>
          <Text style={styles.fieldLabel}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            placeholderTextColor={colors.textMuted}
          />
          <Text style={styles.fieldLabel}>Phone</Text>
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            placeholder="03xx xxxxxxx"
            keyboardType="phone-pad"
            placeholderTextColor={colors.textMuted}
          />
        </View>

        <TouchableOpacity style={styles.saveBtn} onPress={onSave} activeOpacity={0.85} disabled={saving}>
          <Ionicons name="save-outline" size={18} color={colors.white} />
          <Text style={styles.saveText}>{saving ? 'Saving…' : 'Save Changes'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.screenBg },
  body: { padding: spacing.lg, paddingBottom: spacing.xl },

  avatarWrap: { alignItems: 'center', marginBottom: spacing.lg },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  avatarText: { color: colors.white, fontSize: 30, fontWeight: '800' },
  name: { fontSize: 17, fontWeight: '800', color: colors.textDark },
  sub: { fontSize: 13, color: colors.textMuted, marginTop: 2 },

  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  sectionTitle: { fontSize: 14, fontWeight: '800', color: colors.primary, marginBottom: spacing.md },

  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#EEE' },
  infoLabel: { fontSize: 13.5, color: colors.textMuted },
  infoValue: { fontSize: 13.5, color: colors.textDark, fontWeight: '700', flexShrink: 1, textAlign: 'right', marginLeft: spacing.md },

  fieldLabel: { fontSize: 13, color: colors.textMuted, marginBottom: 6, marginTop: spacing.sm },
  input: {
    borderWidth: 1,
    borderColor: '#E1E1E6',
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
    fontSize: 15,
    color: colors.textDark,
    backgroundColor: '#FCFCFD',
  },

  saveBtn: {
    backgroundColor: colors.buttonPurple,
    borderRadius: 10,
    paddingVertical: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveText: { color: colors.white, fontWeight: '800', fontSize: 15, marginLeft: 8 },
});
