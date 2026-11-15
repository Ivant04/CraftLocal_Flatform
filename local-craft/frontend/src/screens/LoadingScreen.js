// screens/LoadingScreen.js
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function LoadingScreen({ route, navigation }) {
  const spin = useRef(new Animated.Value(0)).current;
  const fade = useRef(new Animated.Value(0.3)).current;
  const message = route?.params?.message || 'Đang tải dữ liệu...';

  useEffect(() => {
    Animated.loop(
      Animated.timing(spin, { toValue: 1, duration: 1500, useNativeDriver: true })
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(fade, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(fade, { toValue: 0.3, duration: 800, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const spinInterpolate = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  return (
    <SafeAreaView style={s.wrap}>
      <View style={s.container}>
        <View style={s.logoCircle}>
          <Ionicons name="compass" size={44} color="#0891b2" />
        </View>

        <Animated.View style={[s.spinner, { transform: [{ rotate: spinInterpolate }] }]}>
          <View style={s.spinnerDot} />
        </Animated.View>

        <Animated.Text style={[s.loadingTxt, { opacity: fade }]}>{message}</Animated.Text>

        <View style={s.dotsRow}>
          {[0, 1, 2].map(i => (
            <Animated.View key={i} style={[s.dot, { opacity: fade }]} />
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: '#f0fdfa' },
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  logoCircle: { width: 90, height: 90, borderRadius: 45, backgroundColor: '#ecfeff', justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: '#cffafe', marginBottom: 30 },
  spinner: { width: 120, height: 120, borderRadius: 60, borderWidth: 3, borderColor: '#e0f2fe', borderTopColor: '#0891b2', position: 'absolute' },
  spinnerDot: { position: 'absolute', top: -6, left: '50%', marginLeft: -6, width: 12, height: 12, borderRadius: 6, backgroundColor: '#0891b2' },
  loadingTxt: { fontSize: 16, fontWeight: '600', color: '#0e7490', marginTop: 60 },
  dotsRow: { flexDirection: 'row', gap: 8, marginTop: 16 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#0891b2' },
});
