import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAccount } from '../context/AccountContext';
import { branding } from '../config/branding';
import { colors, spacing } from '../theme';

// Shown once, on first launch, before the app is set up. The user enters their
// name (always stored in capitals) and a unique account number + IBAN are
// generated for them.
export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const { setupProfile } = useAccount();
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);

  const onContinue = () => {
    if (!name.trim()) {
      Alert.alert('Name required', 'Please enter your name to continue.');
      return;
    }
    try {
      setSaving(true);
      setupProfile(name); // capitalises the name and creates the account
    } catch (e) {
      setSaving(false);
      Alert.alert('Error', e.message || 'Could not set up your account.');
    }
  };

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <LinearGradient
        colors={[colors.gradientStart, colors.gradientEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: insets.top + spacing.xl }]}
      >
        <View style={styles.logoCircle}>
          <Image source={branding.logo} style={styles.logo} resizeMode="contain" />
        </View>
        <Text style={styles.welcome}>Welcome to {branding.bankName}</Text>
        <Text style={styles.welcomeSub}>Let's set up your account</Text>
      </LinearGradient>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
          <View style={styles.card}>
            <Text style={styles.title}>What's your name?</Text>
            <Text style={styles.subtitle}>
              This name will appear on your account and receipts.
            </Text>

            <Text style={styles.fieldLabel}>Full Name</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={(t) => setName(t.toUpperCase())}
              placeholder="ENTER YOUR NAME"
              placeholderTextColor={colors.textMuted}
              autoCapitalize="characters"
              autoCorrect={false}
              returnKeyType="done"
              onSubmitEditing={onContinue}
            />

            <View style={styles.note}>
              <Ionicons name="shield-checkmark" size={16} color={colors.primary} />
              <Text style={styles.noteText}>
                A unique account number and IBAN will be generated for you automatically.
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.btn, (!name.trim() || saving) && styles.btnDisabled]}
              onPress={onContinue}
              activeOpacity={0.85}
              disabled={!name.trim() || saving}
            >
              <Text style={styles.btnText}>{saving ? 'Creating account…' : 'Get Started'}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.screenBg },

  header: {
    alignItems: 'center',
    paddingBottom: spacing.xl + spacing.md,
    paddingHorizontal: spacing.lg,
  },
  logoCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    elevation: 4,
  },
  logo: { width: 74, height: 74 },
  welcome: { color: colors.white, fontSize: 20, fontWeight: '800', textAlign: 'center' },
  welcomeSub: { color: '#EADFF4', fontSize: 14, marginTop: 4 },

  body: { padding: spacing.lg },
  card: {
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: spacing.lg,
    marginTop: -spacing.xl,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
  title: { fontSize: 18, fontWeight: '800', color: colors.textDark },
  subtitle: { fontSize: 13.5, color: colors.textMuted, marginTop: 4, marginBottom: spacing.lg },

  fieldLabel: { fontSize: 13, color: colors.textMuted, marginBottom: 6, fontWeight: '600' },
  input: {
    borderWidth: 1,
    borderColor: '#D8D8DE',
    borderRadius: 10,
    paddingHorizontal: spacing.md,
    paddingVertical: Platform.OS === 'ios' ? 14 : 11,
    fontSize: 16,
    fontWeight: '700',
    color: colors.textDark,
    letterSpacing: 0.5,
    backgroundColor: '#FCFCFD',
  },

  note: { flexDirection: 'row', alignItems: 'flex-start', marginTop: spacing.md },
  noteText: { flex: 1, marginLeft: 8, color: colors.textMuted, fontSize: 12.5, lineHeight: 18 },

  btn: {
    marginTop: spacing.xl,
    backgroundColor: colors.buttonPurple,
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: 'center',
  },
  btnDisabled: { backgroundColor: '#D9D9DE' },
  btnText: { color: colors.white, fontWeight: '800', fontSize: 16 },
});
