// screens/ErrorScreen.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function ErrorScreen({ route, navigation }) {
  const message = route?.params?.message || 'Đã xảy ra lỗi không mong muốn.';
  const onRetry = route?.params?.onRetry;

  return (
    <SafeAreaView style={s.wrap}>
      <View style={s.container}>
        <View style={s.iconCircle}>
          <Ionicons name="warning" size={48} color="#ef4444" />
        </View>
        <Text style={s.title}>Ôi không!</Text>
        <Text style={s.message}>{message}</Text>

        <TouchableOpacity style={s.retryBtn} onPress={() => { if (onRetry) onRetry(); else navigation.goBack(); }}>
          <Ionicons name="refresh" size={20} color="#fff" />
          <Text style={s.retryTxt}>Thử lại</Text>
        </TouchableOpacity>

        <TouchableOpacity style={s.homeBtn} onPress={() => navigation.navigate('MainTabs')}>
          <Ionicons name="home-outline" size={20} color="#0891b2" />
          <Text style={s.homeTxt}>Về trang chủ</Text>
        </TouchableOpacity>

        <TouchableOpacity style={s.supportBtn} onPress={() => navigation.navigate('ContactSupport')}>
          <Text style={s.supportTxt}>Liên hệ hỗ trợ</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: '#fff1f2' },
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 30 },
  iconCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#fecaca', justifyContent: 'center', alignItems: 'center', marginBottom: 24 },
  title: { fontSize: 28, fontWeight: '800', color: '#991b1b', marginBottom: 8 },
  message: { fontSize: 15, color: '#6b7280', textAlign: 'center', lineHeight: 22, marginBottom: 32 },
  retryBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#ef4444', borderRadius: 16, paddingVertical: 14, paddingHorizontal: 40, marginBottom: 12, shadowColor: '#ef4444', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.25, shadowRadius: 10, elevation: 5 },
  retryTxt: { fontSize: 16, fontWeight: '700', color: '#fff' },
  homeBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 2, borderColor: '#0891b2', borderRadius: 16, paddingVertical: 14, paddingHorizontal: 40, marginBottom: 20 },
  homeTxt: { fontSize: 16, fontWeight: '700', color: '#0891b2' },
  supportTxt: { fontSize: 14, fontWeight: '600', color: '#6b7280' },
  supportBtn: {},
});
