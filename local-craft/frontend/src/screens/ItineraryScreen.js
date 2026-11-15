// screens/ItineraryScreen.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';

export default function ItineraryScreen({ navigation }) {
  const itineraries = useSelector(state => state.itinerary.itineraries);

  return (
    <SafeAreaView style={s.wrap}>
      <View style={s.header}>
        <Text style={s.headerTitle}>Lịch trình của tôi</Text>
        <TouchableOpacity style={s.addBtn} onPress={() => navigation.navigate('AIItinerary')}>
          <Ionicons name="add" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      <FlatList data={itineraries} keyExtractor={i => i.id} contentContainerStyle={s.list}
        ListEmptyComponent={<View style={s.empty}><Ionicons name="calendar-outline" size={60} color="#d1d5db" /><Text style={s.emptyTxt}>Chưa có lịch trình nào</Text><Text style={s.emptySub}>Tạo lịch trình mới với AI!</Text></View>}
        renderItem={({ item }) => (
          <TouchableOpacity style={s.card} onPress={() => navigation.navigate('ItineraryDetail', { itinerary: item })}>
            <View style={s.cardIcon}><Ionicons name="calendar" size={24} color="#8b5cf6" /></View>
            <View style={s.cardInfo}>
              <Text style={s.cardTitle}>{item.title}</Text>
              <Text style={s.cardSub}>{item.duration} • {item.stops.length} điểm dừng</Text>
              <Text style={s.cardDate}>{item.createdAt}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#d1d5db" />
          </TouchableOpacity>
        )} />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: '#f0fdfa' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 50, paddingBottom: 14 },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#111827' },
  addBtn: { width: 42, height: 42, borderRadius: 14, backgroundColor: '#8b5cf6', justifyContent: 'center', alignItems: 'center', shadowColor: '#8b5cf6', shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  list: { padding: 20, paddingTop: 10 },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 18, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 2, gap: 14 },
  cardIcon: { width: 50, height: 50, borderRadius: 16, backgroundColor: '#f5f3ff', justifyContent: 'center', alignItems: 'center' },
  cardInfo: { flex: 1 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: '#111827' },
  cardSub: { fontSize: 13, color: '#6b7280', marginTop: 2 },
  cardDate: { fontSize: 12, color: '#9ca3af', marginTop: 4 },
  empty: { alignItems: 'center', paddingTop: 80 },
  emptyTxt: { fontSize: 18, fontWeight: '700', color: '#9ca3af', marginTop: 16 },
  emptySub: { fontSize: 14, color: '#d1d5db', marginTop: 4 },
});
