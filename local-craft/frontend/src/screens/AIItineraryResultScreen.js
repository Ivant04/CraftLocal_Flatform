// screens/AIItineraryResultScreen.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSelector, useDispatch } from 'react-redux';
import { addItinerary, clearAIItinerary } from '../redux/itinerarySlice';

export default function AIItineraryResultScreen({ navigation }) {
  const itinerary = useSelector(state => state.itinerary.aiGeneratedItinerary);
  const dispatch = useDispatch();

  const saveItinerary = () => {
    if (itinerary) {
      dispatch(addItinerary({ ...itinerary, createdAt: new Date().toISOString().split('T')[0] }));
      dispatch(clearAIItinerary());
      Alert.alert('Thành công', 'Lịch trình đã được lưu!', [
        { text: 'OK', onPress: () => navigation.navigate('Itinerary') },
      ]);
    }
  };

  if (!itinerary) {
    return (
      <SafeAreaView style={s.wrap}>
        <View style={s.empty}><Text style={s.emptyTxt}>Chưa có lịch trình. Hãy tạo mới!</Text></View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.wrap}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Ionicons name="arrow-back" size={24} color="#111827" /></TouchableOpacity>
        <Text style={s.headerTitle}>Kết quả AI</Text>
        <View style={{ width: 24 }} />
      </View>
      <ScrollView contentContainerStyle={s.scroll}>
        <View style={s.titleCard}>
          <View style={s.aiIcon}><Ionicons name="sparkles" size={24} color="#fff" /></View>
          <Text style={s.itTitle}>{itinerary.title}</Text>
          <Text style={s.itDuration}>{itinerary.duration}</Text>
        </View>

        <Text style={s.secTitle}>Lịch trình chi tiết</Text>
        {itinerary.stops.map((stop, i) => (
          <View key={stop.id} style={s.stopCard}>
            <View style={s.timeline}>
              <View style={s.dot} />
              {i < itinerary.stops.length - 1 && <View style={s.line} />}
            </View>
            <View style={s.stopInfo}>
              <Text style={s.stopTime}>{stop.time}</Text>
              <Text style={s.stopName}>{stop.name}</Text>
              <Text style={s.stopNote}>{stop.note}</Text>
            </View>
          </View>
        ))}

        <View style={s.actions}>
          <TouchableOpacity style={s.saveBtn} onPress={saveItinerary}>
            <Ionicons name="bookmark" size={20} color="#fff" />
            <Text style={s.saveBtnTxt}>Lưu lịch trình</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.redoBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="refresh" size={20} color="#8b5cf6" />
            <Text style={s.redoBtnTxt}>Tạo lại</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: '#f0fdfa' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 50, paddingBottom: 14 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#111827' },
  scroll: { padding: 20, paddingBottom: 40 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyTxt: { fontSize: 16, color: '#9ca3af' },
  titleCard: { alignItems: 'center', backgroundColor: '#8b5cf6', borderRadius: 24, padding: 28, marginBottom: 24, shadowColor: '#8b5cf6', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 14, elevation: 6 },
  aiIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  itTitle: { fontSize: 20, fontWeight: '800', color: '#fff', textAlign: 'center' },
  itDuration: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
  secTitle: { fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 16 },
  stopCard: { flexDirection: 'row', marginBottom: 4 },
  timeline: { width: 30, alignItems: 'center' },
  dot: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#0891b2', marginTop: 4 },
  line: { width: 2, flex: 1, backgroundColor: '#a7f3d0', marginVertical: 4 },
  stopInfo: { flex: 1, backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12, marginLeft: 8, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, elevation: 1 },
  stopTime: { fontSize: 12, fontWeight: '700', color: '#0891b2', marginBottom: 4 },
  stopName: { fontSize: 16, fontWeight: '700', color: '#111827' },
  stopNote: { fontSize: 13, color: '#6b7280', marginTop: 4 },
  actions: { marginTop: 20, gap: 12 },
  saveBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: '#8b5cf6', borderRadius: 16, paddingVertical: 16, shadowColor: '#8b5cf6', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 5 },
  saveBtnTxt: { fontSize: 16, fontWeight: '700', color: '#fff' },
  redoBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, borderWidth: 2, borderColor: '#8b5cf6', borderRadius: 16, paddingVertical: 14 },
  redoBtnTxt: { fontSize: 16, fontWeight: '700', color: '#8b5cf6' },
});
