// screens/AIMenuScreen.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const features = [
  { id: '1', title: 'Trò chuyện AI', sub: 'Hỏi đáp về du lịch Ngũ Hành Sơn', icon: 'chatbubbles', color: '#0891b2', bg: '#ecfeff', screen: 'AIChatbot' },
  { id: '2', title: 'Tạo lịch trình AI', sub: 'AI tự động lên kế hoạch du lịch', icon: 'calendar', color: '#8b5cf6', bg: '#f5f3ff', screen: 'AIItinerary' },
  { id: '3', title: 'Gợi ý điểm đến', sub: 'Khám phá điểm đến phù hợp với bạn', icon: 'compass', color: '#f59e0b', bg: '#fffbeb', screen: 'DestinationList' },
  { id: '4', title: 'Hướng dẫn viên AI', sub: 'Tìm hiểu lịch sử, văn hóa địa phương', icon: 'school', color: '#10b981', bg: '#ecfdf5', screen: 'AIChatbot' },
];

export default function AIMenuScreen({ navigation }) {
  return (
    <SafeAreaView style={s.wrap}>
      <ScrollView contentContainerStyle={s.scroll}>
        <View style={s.header}>
          <View style={s.aiCircle}><Ionicons name="sparkles" size={36} color="#fff" /></View>
          <Text style={s.title}>Trợ lý AI</Text>
          <Text style={s.sub}>Khám phá Ngũ Hành Sơn cùng trí tuệ nhân tạo</Text>
        </View>

        <View style={s.grid}>
          {features.map(f => (
            <TouchableOpacity key={f.id} style={s.card} onPress={() => navigation.navigate(f.screen)}>
              <View style={[s.iconCircle, { backgroundColor: f.bg }]}><Ionicons name={f.icon} size={28} color={f.color} /></View>
              <Text style={s.cardTitle}>{f.title}</Text>
              <Text style={s.cardSub}>{f.sub}</Text>
              <View style={[s.arrow, { backgroundColor: f.bg }]}><Ionicons name="arrow-forward" size={16} color={f.color} /></View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={s.tipCard}>
          <Ionicons name="bulb" size={24} color="#f59e0b" />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={s.tipTitle}>Mẹo sử dụng</Text>
            <Text style={s.tipTxt}>Hãy mô tả chi tiết sở thích để AI gợi ý chính xác hơn!</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: '#f0fdfa' },
  scroll: { padding: 20, paddingTop: 50 },
  header: { alignItems: 'center', marginBottom: 30 },
  aiCircle: { width: 72, height: 72, borderRadius: 36, backgroundColor: '#0891b2', justifyContent: 'center', alignItems: 'center', marginBottom: 14, shadowColor: '#0891b2', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 6 },
  title: { fontSize: 26, fontWeight: '800', color: '#111827' },
  sub: { fontSize: 14, color: '#6b7280', marginTop: 4, textAlign: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 14 },
  card: { width: '47%', backgroundColor: '#fff', borderRadius: 20, padding: 18, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 3 },
  iconCircle: { width: 52, height: 52, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: '#111827', marginBottom: 4 },
  cardSub: { fontSize: 12, color: '#6b7280', lineHeight: 17 },
  arrow: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center', alignSelf: 'flex-end', marginTop: 10 },
  tipCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fffbeb', borderRadius: 16, padding: 16, marginTop: 24 },
  tipTitle: { fontSize: 14, fontWeight: '700', color: '#92400e' },
  tipTxt: { fontSize: 12, color: '#92400e', marginTop: 2, lineHeight: 18 },
});
