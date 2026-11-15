// screens/ItineraryDetailScreen.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch } from 'react-redux';
import { removeItinerary } from '../redux/itinerarySlice';

export default function ItineraryDetailScreen({ route, navigation }) {
  const { itinerary } = route.params;
  const dispatch = useDispatch();

  const handleDelete = () => {
    Alert.alert('Xác nhận', 'Bạn có muốn xóa lịch trình này?', [
      { text: 'Hủy', style: 'cancel' },
      { text: 'Xóa', style: 'destructive', onPress: () => { dispatch(removeItinerary(itinerary.id)); navigation.goBack(); } },
    ]);
  };

  return (
    <SafeAreaView style={s.wrap}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Ionicons name="arrow-back" size={24} color="#111827" /></TouchableOpacity>
        <Text style={s.headerTitle}>Chi tiết</Text>
        <TouchableOpacity onPress={handleDelete}><Ionicons name="trash-outline" size={22} color="#ef4444" /></TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={s.scroll}>
        <View style={s.titleCard}>
          <Ionicons name="calendar" size={28} color="#8b5cf6" />
          <Text style={s.itTitle}>{itinerary.title}</Text>
          <View style={s.metaRow}>
            <View style={s.meta}><Ionicons name="time" size={14} color="#6b7280" /><Text style={s.metaTxt}>{itinerary.duration}</Text></View>
            <View style={s.meta}><Ionicons name="flag" size={14} color="#6b7280" /><Text style={s.metaTxt}>{itinerary.stops.length} điểm dừng</Text></View>
          </View>
          {itinerary.description ? <Text style={s.desc}>{itinerary.description}</Text> : null}
        </View>

        <Text style={s.secTitle}>Các điểm dừng</Text>
        {itinerary.stops.map((stop, i) => (
          <View key={stop.id} style={s.stopCard}>
            <View style={s.timeline}>
              <View style={[s.dot, { backgroundColor: i === 0 ? '#8b5cf6' : '#0891b2' }]} />
              {i < itinerary.stops.length - 1 && <View style={s.line} />}
            </View>
            <View style={s.stopInfo}>
              <Text style={s.stopTime}>{stop.time}</Text>
              <Text style={s.stopName}>{stop.name}</Text>
              <Text style={s.stopNote}>{stop.note}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: '#f0fdfa' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 50, paddingBottom: 14 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#111827' },
  scroll: { padding: 20, paddingBottom: 40 },
  titleCard: { backgroundColor: '#fff', borderRadius: 20, padding: 24, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 3, marginBottom: 24 },
  itTitle: { fontSize: 20, fontWeight: '800', color: '#111827', marginTop: 10, textAlign: 'center' },
  metaRow: { flexDirection: 'row', gap: 20, marginTop: 10 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaTxt: { fontSize: 13, color: '#6b7280' },
  desc: { fontSize: 14, color: '#6b7280', marginTop: 12, textAlign: 'center', lineHeight: 20 },
  secTitle: { fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 16 },
  stopCard: { flexDirection: 'row', marginBottom: 4 },
  timeline: { width: 30, alignItems: 'center' },
  dot: { width: 14, height: 14, borderRadius: 7, marginTop: 4 },
  line: { width: 2, flex: 1, backgroundColor: '#a7f3d0', marginVertical: 4 },
  stopInfo: { flex: 1, backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12, marginLeft: 8, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, elevation: 1 },
  stopTime: { fontSize: 12, fontWeight: '700', color: '#8b5cf6', marginBottom: 4 },
  stopName: { fontSize: 16, fontWeight: '700', color: '#111827' },
  stopNote: { fontSize: 13, color: '#6b7280', marginTop: 4 },
});
