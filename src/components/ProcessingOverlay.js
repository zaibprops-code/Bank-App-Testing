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

// Timing for the one-by-one expansion. Each strip snaps taller then back very
// fast (PULSE up + PULSE down), and the strips fire strictly in sequence: the
// whole row cycles once every PERIOD ms, with each strip offset by PERIOD / N
// so exactly one is expanding at a time (a distinct pop, not a flowing wave).
const PULSE = 80;
const PERIOD = PULSE * 2 * BAR_COLORS.length; // 960ms for 6 strips

// A single strip that expands up and down from its centre, then rests until its
// turn comes round again.
function Bar({ color, delay }) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    let stopped = false;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(v, { toValue: 1, duration: PULSE, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        Animated.timing(v, { toValue: 0, duration: PULSE, easing: Easing.in(Easing.quad), useNativeDriver: true }),
        // Hold flat until every other strip has had its turn this cycle.
        Animated.delay(PERIOD - PULSE * 2),
      ])
    );
    const t = setTimeout(() => { if (!stopped) loop.start(); }, delay);
    return () => { stopped = true; clearTimeout(t); loop.stop(); };
  }, []);
  // Rests as a small stub and grows symmetrically from the centre (default
  // transform origin), so the strip expands both up and down from short to tall.
  const scaleY = v.interpolate({ inputRange: [0, 1], outputRange: [1, 6] });
  return <Animated.View style={[styles.bar, { backgroundColor: color, transform: [{ scaleY }] }]} />;
}

export function ProcessingBars() {
  return (
    <View style={styles.bars}>
      {BAR_COLORS.map((c, i) => (
        <Bar key={i} color={c} delay={i * (PERIOD / BAR_COLORS.length)} />
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
  bar: { width: 12, height: 7, borderRadius: 0, marginHorizontal: 0.75 },

  secured: { flexDirection: 'row', alignItems: 'center', marginTop: 34 },
  securedText: { marginLeft: 6, color: colors.primary, fontWeight: '700', fontSize: 13 },
  note: { marginTop: 12, color: colors.textMuted, fontSize: 12.5, textAlign: 'center' },
});
