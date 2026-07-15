import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Easing, ActivityIndicator } from 'react-native';
import * as Location from 'expo-location';
import { MaterialCommunityIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { colors, spacing } from '../../theme';

// Coordinates of the Kaaba, Makkah.
const KAABA = { lat: 21.4225, lon: 39.8262 };
const toRad = (d) => (d * Math.PI) / 180;
const toDeg = (r) => (r * 180) / Math.PI;

// Great-circle initial bearing from a point to the Kaaba (degrees from North).
function qiblaBearing(lat, lon) {
  const phi1 = toRad(lat);
  const phi2 = toRad(KAABA.lat);
  const dLon = toRad(KAABA.lon - lon);
  const y = Math.sin(dLon);
  const x = Math.cos(phi1) * Math.tan(phi2) - Math.sin(phi1) * Math.cos(dLon);
  return (toDeg(Math.atan2(y, x)) + 360) % 360;
}

export default function QiblaScreen() {
  const [status, setStatus] = useState('loading'); // loading | ready | denied | error
  const [qibla, setQibla] = useState(0);
  const [heading, setHeading] = useState(0);
  const [usedFallback, setUsedFallback] = useState(false);
  const rotation = useRef(new Animated.Value(0)).current;
  const subRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { status: perm } = await Location.requestForegroundPermissionsAsync();
        let lat;
        let lon;
        if (perm === 'granted') {
          const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Low });
          lat = pos.coords.latitude;
          lon = pos.coords.longitude;
        } else {
          // Fallback to Karachi so the finder still works without location.
          lat = 24.8607;
          lon = 67.0011;
          if (!cancelled) setUsedFallback(true);
        }
        if (cancelled) return;
        setQibla(qiblaBearing(lat, lon));

        subRef.current = await Location.watchHeadingAsync((h) => {
          const deg = h.trueHeading >= 0 ? h.trueHeading : h.magHeading;
          setHeading(deg);
        });
        setStatus('ready');
      } catch (e) {
        if (!cancelled) setStatus('error');
      }
    })();

    return () => {
      cancelled = true;
      if (subRef.current) subRef.current.remove();
    };
  }, []);

  // Rotate the dial so North sits opposite the device heading.
  useEffect(() => {
    Animated.timing(rotation, {
      toValue: -heading,
      duration: 120,
      easing: Easing.linear,
      useNativeDriver: true,
    }).start();
  }, [heading, rotation]);

  const spin = rotation.interpolate({
    inputRange: [-360, 360],
    outputRange: ['-360deg', '360deg'],
  });

  // Angle of the Qibla marker on the (rotating) dial.
  const qiblaMarker = { transform: [{ rotate: `${qibla}deg` }] };

  // How far the device must turn (right = clockwise) to face the Qibla.
  const diff = Math.round(((qibla - heading) % 360 + 360) % 360);
  const aligned = diff <= 5 || diff >= 355;

  if (status === 'loading') {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} size="large" />
        <Text style={styles.hint}>Finding your location…</Text>
      </View>
    );
  }

  if (status === 'error') {
    return (
      <View style={styles.center}>
        <Ionicons name="warning-outline" size={48} color={colors.danger} />
        <Text style={styles.hint}>Could not read the compass on this device.</Text>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <Text style={styles.title}>Qibla Direction</Text>
      <Text style={styles.subtitle}>
        {aligned ? 'You are facing the Qibla 🕋' : `Turn ${diff}° ${diff <= 180 ? 'right' : 'left'} to face the Qibla`}
      </Text>

      <View style={styles.compassWrap}>
        {/* Fixed top pointer */}
        <View style={styles.pointer}>
          <MaterialCommunityIcons name="triangle" size={22} color={aligned ? colors.accentGreen : colors.primary} />
        </View>

        <Animated.View style={[styles.dial, { transform: [{ rotate: spin }] }]}>
          <Text style={[styles.cardinal, styles.north]}>N</Text>
          <Text style={[styles.cardinal, styles.east]}>E</Text>
          <Text style={[styles.cardinal, styles.south]}>S</Text>
          <Text style={[styles.cardinal, styles.west]}>W</Text>

          {/* Kaaba marker fixed at the Qibla bearing on the dial */}
          <View style={[styles.qiblaMarkerWrap, qiblaMarker]}>
            <View style={[styles.kaaba, aligned && styles.kaabaAligned]}>
              <FontAwesome5 name="kaaba" size={20} color={colors.white} />
            </View>
          </View>
        </Animated.View>

        <View style={styles.hub} />
      </View>

      <View style={styles.readout}>
        <Text style={styles.readLabel}>Qibla bearing</Text>
        <Text style={styles.readValue}>{Math.round(qibla)}° from North</Text>
      </View>

      {usedFallback && (
        <Text style={styles.fallback}>
          Location permission was not granted — using Karachi as an approximate position. Allow location for accuracy.
        </Text>
      )}
      <Text style={styles.tip}>Hold your phone flat and rotate until the 🕋 aligns with the top marker.</Text>
    </View>
  );
}

const SIZE = 260;
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.screenBg, alignItems: 'center', paddingTop: spacing.xl },
  center: { flex: 1, backgroundColor: colors.screenBg, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  hint: { color: colors.textMuted, marginTop: spacing.md, textAlign: 'center', fontSize: 14 },

  title: { fontSize: 20, fontWeight: '800', color: colors.textDark },
  subtitle: { fontSize: 14, color: colors.primary, fontWeight: '700', marginTop: 6, textAlign: 'center', paddingHorizontal: spacing.lg },

  compassWrap: { width: SIZE, height: SIZE, alignItems: 'center', justifyContent: 'center', marginTop: spacing.xl },
  pointer: { position: 'absolute', top: -20, zIndex: 5 },
  dial: {
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: '#E4E4E8',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
  cardinal: { position: 'absolute', fontSize: 16, fontWeight: '800', color: colors.textMuted },
  north: { top: 12, color: colors.danger },
  south: { bottom: 12 },
  east: { right: 14 },
  west: { left: 14 },

  qiblaMarkerWrap: { position: 'absolute', width: SIZE, height: SIZE, alignItems: 'center' },
  kaaba: {
    marginTop: 14,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  kaabaAligned: { backgroundColor: colors.accentGreen },
  hub: { position: 'absolute', width: 14, height: 14, borderRadius: 7, backgroundColor: colors.primary },

  readout: { alignItems: 'center', marginTop: spacing.xl },
  readLabel: { fontSize: 12.5, color: colors.textMuted },
  readValue: { fontSize: 18, fontWeight: '800', color: colors.textDark, marginTop: 2 },

  fallback: { fontSize: 12, color: colors.danger, textAlign: 'center', marginTop: spacing.lg, paddingHorizontal: spacing.xl },
  tip: { fontSize: 12.5, color: colors.textMuted, textAlign: 'center', marginTop: spacing.md, paddingHorizontal: spacing.xl },
});
