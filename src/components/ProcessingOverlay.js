import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing, BackHandler } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme';

// Exact colour sequence requested for the 6 processing strips.
const BAR_COLORS = [
  colors.primary,     // purple
  colors.yellow,      // yellow
  colors.accentGreen, // green
  colors.yellow,      // yellow
  colors.accentGreen, // green
  colors.primary,     // purple
];

// A single strip that bobs up and down on a loop.
function Bar({ color, delay }) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    let stopped = false;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(v, { toValue: 1, duration: 320, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(v, { toValue: 0, duration: 320, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    );
    // Stagger each strip so together they ripple up and down like a wave.
    const t = setTimeout(() => { if (!stopped) loop.start(); }, delay);
    return () => { stopped = true; clearTimeout(t); loop.stop(); };
  }, []);
  const translateY = v.interpolate({ inputRange: [0, 1], outputRange: [9, -9] });
  return <Animated.View style={[styles.bar, { backgroundColor: color, transform: [{ translateY }] }]} />;
}

function ProcessingBars() {
  return (
    <View style={styles.bars}>
      {BAR_COLORS.map((c, i) => (
        <Bar key={i} color={c} delay={i * 90} />
      ))}
    </View>
  );
}

// Full-screen processing state shown after a transfer is confirmed. It runs for
// an irregular 3–15 seconds (so the receipt appears after a realistic, variable
// wait) and then calls onDone. Back is blocked while it is visible.
export default function ProcessingOverlay({ visible, amountText, onDone }) {
  const doneRef = useRef(onDone);
  doneRef.current = onDone;

  useEffect(() => {
    if (!visible) return undefined;
    const ms = 3000 + Math.floor(Math.random() * 12001); // 3000–15000 ms, irregular
    const timer = setTimeout(() => doneRef.current && doneRef.current(), ms);
    const sub = BackHandler.addEventListener('hardwareBackPress', () => true);
    return () => {
      clearTimeout(timer);
      sub.remove();
    };
  }, [visible]);

  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <Text style={styles.heading}>Processing Payment</Text>

      <View style={styles.amountBox}>
        <Text style={styles.amount}>{amountText}</Text>
        {/* Strips ripple over the amount, exactly like the reference. */}
        <View style={styles.barsOverlay} pointerEvents="none">
          <ProcessingBars />
        </View>
      </View>

      <View style={styles.secured}>
        <Ionicons name="shield-checkmark" size={16} color={colors.primary} />
        <Text style={styles.securedText}>Secured Payment</Text>
      </View>
      <Text style={styles.note}>Please wait, your transaction is being processed…</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.98)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    zIndex: 100,
    elevation: 100,
  },
  heading: { fontSize: 15, fontWeight: '700', color: colors.textMuted, marginBottom: 30 },

  amountBox: { minHeight: 60, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 10 },
  amount: { fontSize: 36, fontWeight: '800', color: colors.textDark, letterSpacing: 1 },
  barsOverlay: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
  bars: { flexDirection: 'row', alignItems: 'center' },
  bar: { width: 9, height: 34, borderRadius: 4, marginHorizontal: 3.5 },

  secured: { flexDirection: 'row', alignItems: 'center', marginTop: 34 },
  securedText: { marginLeft: 6, color: colors.primary, fontWeight: '700', fontSize: 13 },
  note: { marginTop: 12, color: colors.textMuted, fontSize: 12.5, textAlign: 'center' },
});
