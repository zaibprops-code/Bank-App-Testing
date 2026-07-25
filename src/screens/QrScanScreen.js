import React, { useCallback, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { colors, spacing } from '../theme';
import { parsePaymentQR, hasUsableFields } from '../utils/qr';

// Scans a merchant / bank payment QR with the live camera, decodes it, and
// hands the recipient details to the Send Money screen for confirmation.
export default function QrScanScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [permission, requestPermission] = useCameraPermissions();
  const [torch, setTorch] = useState(false);
  // Guards against the camera firing onBarcodeScanned repeatedly for one code.
  const handledRef = useRef(false);
  const [handled, setHandled] = useState(false);

  const goManual = useCallback(() => {
    navigation.replace('SendMoney', { presetTitle: 'QR Payments' });
  }, [navigation]);

  const onBarcode = useCallback(
    ({ data }) => {
      if (handledRef.current) return;
      const parsed = parsePaymentQR(data);
      if (!hasUsableFields(parsed)) {
        // Not a payment QR we understand — briefly ignore and let the user
        // reposition rather than bouncing them out of the scanner.
        return;
      }
      handledRef.current = true;
      setHandled(true);
      navigation.replace('SendMoney', {
        presetTitle: 'QR Payments',
        scanned: true,
        prefillName: parsed.name,
        prefillAccount: parsed.account,
        prefillTillId: parsed.tillId,
        prefillAmount: /^\d+(\.\d+)?$/.test(parsed.amount) ? parsed.amount : '',
        prefillCity: parsed.city,
      });
    },
    [navigation]
  );

  const Header = (
    <LinearGradient
      colors={[colors.gradientStart, colors.gradientEnd]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
    >
      <View style={{ height: insets.top }} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.hBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.title}>Scan QR to Pay</Text>
        <View style={{ flex: 1 }} />
        <TouchableOpacity onPress={() => setTorch((t) => !t)} style={styles.hBtn}>
          <Ionicons name={torch ? 'flash' : 'flash-off'} size={22} color={colors.white} />
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );

  // Permissions still loading.
  if (!permission) {
    return (
      <View style={styles.root}>
        <StatusBar style="light" />
        {Header}
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      </View>
    );
  }

  // Permission not yet granted (web has no camera barcode support in Expo Go).
  if (!permission.granted) {
    return (
      <View style={styles.root}>
        <StatusBar style="light" />
        {Header}
        <View style={styles.center}>
          <MaterialCommunityIcons name="qrcode-scan" size={72} color={colors.primary} />
          <Text style={styles.permTitle}>Camera access needed</Text>
          <Text style={styles.permText}>
            Allow camera access to scan a merchant or bank QR code and auto-fill
            the recipient's name, account and till ID.
          </Text>
          <TouchableOpacity style={styles.primaryBtn} onPress={requestPermission} activeOpacity={0.85}>
            <Text style={styles.primaryBtnText}>Allow Camera</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.linkBtn} onPress={goManual} activeOpacity={0.7}>
            <Text style={styles.linkBtnText}>Enter details manually</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      {Header}

      <View style={styles.cameraWrap}>
        <CameraView
          style={StyleSheet.absoluteFill}
          facing="back"
          enableTorch={torch}
          barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
          onBarcodeScanned={handled ? undefined : onBarcode}
        />

        {/* Scan frame overlay */}
        <View style={styles.overlay} pointerEvents="none">
          <View style={styles.frame}>
            <View style={[styles.corner, styles.tl]} />
            <View style={[styles.corner, styles.tr]} />
            <View style={[styles.corner, styles.bl]} />
            <View style={[styles.corner, styles.br]} />
          </View>
          <Text style={styles.hint}>
            Align the QR code within the frame
          </Text>
        </View>

        {handled && (
          <View style={styles.processing}>
            <ActivityIndicator color={colors.white} size="large" />
            <Text style={styles.processingText}>Reading QR…</Text>
          </View>
        )}
      </View>

      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.md }]}>
        <View style={styles.footerRow}>
          <MaterialCommunityIcons name="shield-check" size={18} color={colors.accentGreen} />
          <Text style={styles.footerText}>
            We only read payment details from the QR. Nothing is sent until you confirm.
          </Text>
        </View>
        <TouchableOpacity style={styles.linkBtn} onPress={goManual} activeOpacity={0.7}>
          <Text style={styles.linkBtnText}>Enter details manually instead</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const FRAME = 240;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl, backgroundColor: colors.screenBg },

  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.sm, height: 52 },
  hBtn: { padding: 6 },
  title: { color: colors.white, fontSize: 19, fontWeight: '700', marginLeft: 2 },

  cameraWrap: { flex: 1, overflow: 'hidden', backgroundColor: '#000' },
  overlay: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
  frame: { width: FRAME, height: FRAME },
  corner: {
    position: 'absolute',
    width: 34,
    height: 34,
    borderColor: colors.white,
  },
  tl: { top: 0, left: 0, borderTopWidth: 4, borderLeftWidth: 4, borderTopLeftRadius: 12 },
  tr: { top: 0, right: 0, borderTopWidth: 4, borderRightWidth: 4, borderTopRightRadius: 12 },
  bl: { bottom: 0, left: 0, borderBottomWidth: 4, borderLeftWidth: 4, borderBottomLeftRadius: 12 },
  br: { bottom: 0, right: 0, borderBottomWidth: 4, borderRightWidth: 4, borderBottomRightRadius: 12 },
  hint: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
    marginTop: spacing.xl,
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowRadius: 4,
  },

  processing: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  processingText: { color: colors.white, marginTop: spacing.md, fontSize: 15, fontWeight: '600' },

  footer: { backgroundColor: colors.white, paddingHorizontal: spacing.lg, paddingTop: spacing.md },
  footerRow: { flexDirection: 'row', alignItems: 'center' },
  footerText: { flex: 1, marginLeft: 8, color: colors.textMuted, fontSize: 12, lineHeight: 17 },

  permTitle: { fontSize: 18, fontWeight: '800', color: colors.textDark, marginTop: spacing.lg },
  permText: { fontSize: 14, color: colors.textMuted, textAlign: 'center', marginTop: spacing.sm, lineHeight: 20 },

  primaryBtn: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    marginTop: spacing.xl,
    alignSelf: 'stretch',
  },
  primaryBtnText: { color: colors.white, fontWeight: '800', fontSize: 16 },
  linkBtn: { paddingVertical: 12, alignItems: 'center', marginTop: spacing.xs },
  linkBtnText: { color: colors.primary, fontWeight: '700', fontSize: 14 },
});
