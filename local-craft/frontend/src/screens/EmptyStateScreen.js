// screens/EmptyStateScreen.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function EmptyStateScreen({ route, navigation }) {
  const icon = route?.params?.icon || 'file-tray-outline';
  const title = route?.params?.title || 'Không có dữ liệu';
  const message = route?.params?.message || 'Chưa có nội dung nào ở đây.';
  const actionLabel = route?.params?.actionLabel || 'Khám phá ngay';
  const actionScreen = route?.params?.actionScreen || 'Home';

  return (
    <SafeAreaView style={s.wrap}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
      </View>

      <View style={s.container}>
        <View style={s.illustrationBg}>
          <View style={s.iconCircle}>
            <Ionicons name={icon} size={56} color="#0891b2" />
          </View>
          <View style={s.decorCircle1} />
          <View style={s.decorCircle2} />
        </View>

        <Text style={s.title}>{title}</Text>
        <Text style={s.message}>{message}</Text>

        <TouchableOpacity style={s.actionBtn} onPress={() => navigation.navigate(actionScreen)}>
          <Text style={s.actionTxt}>{actionLabel}</Text>
          <Ionicons name="arrow-forward" size={18} color="#fff" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: '#f0fdfa' },
  header: { paddingHorizontal: 20, paddingTop: 50 },
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 30, paddingBottom: 60 },
  illustrationBg: { width: 160, height: 160, justifyContent: 'center', alignItems: 'center', marginBottom: 30, position: 'relative' },
  iconCircle: { width: 110, height: 110, borderRadius: 55, backgroundColor: '#ecfeff', justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: '#cffafe', zIndex: 1 },
  decorCircle1: { position: 'absolute', top: 10, right: 10, width: 40, height: 40, borderRadius: 20, backgroundColor: '#a7f3d0', opacity: 0.4 },
  decorCircle2: { position: 'absolute', bottom: 10, left: 15, width: 30, height: 30, borderRadius: 15, backgroundColor: '#bae6fd', opacity: 0.5 },
  title: { fontSize: 22, fontWeight: '800', color: '#111827', marginBottom: 8 },
  message: { fontSize: 15, color: '#6b7280', textAlign: 'center', lineHeight: 22, marginBottom: 30 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#0891b2', borderRadius: 16, paddingVertical: 14, paddingHorizontal: 30, shadowColor: '#0891b2', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.25, shadowRadius: 10, elevation: 5 },
  actionTxt: { fontSize: 16, fontWeight: '700', color: '#fff' },
});
