// screens/MapScreen.js
import React, { useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, FlatList, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DestinationContext } from '../context/DestinationContext';

export default function MapScreen({ navigation }) {
  const { destinations } = useContext(DestinationContext);

  return (
    <SafeAreaView style={s.wrap}>
      {/* Map Placeholder */}
      <View style={s.mapArea}>
        <View style={s.mapBg}>
          <Ionicons name="map" size={80} color="#a7f3d0" />
          <Text style={s.mapTxt}>Bản đồ Ngũ Hành Sơn</Text>
          <Text style={s.mapSub}>{destinations.length} địa điểm trên bản đồ</Text>
          {/* Simulated pins */}
          {destinations.map((d, i) => (
            <TouchableOpacity key={d.id} style={[s.pin, { top: 60 + (i * 35) % 180, left: 40 + (i * 55) % 260 }]}
              onPress={() => navigation.navigate('DestinationMapDetail', { destination: d })}>
              <Ionicons name="location" size={28} color="#0891b2" />
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Bottom sheet */}
      <View style={s.sheet}>
        <View style={s.sheetHandle} />
        <Text style={s.sheetTitle}>Địa điểm gần đây</Text>
        <FlatList data={destinations} horizontal showsHorizontalScrollIndicator={false} keyExtractor={i => i.id}
          contentContainerStyle={s.hList}
          renderItem={({ item }) => (
            <TouchableOpacity style={s.card} onPress={() => navigation.navigate('DestinationMapDetail', { destination: item })}>
              <Image source={{ uri: item.image }} style={s.cardImg} />
              <Text style={s.cardTitle} numberOfLines={1}>{item.title}</Text>
              <View style={s.cardRow}>
                <Ionicons name="star" size={12} color="#f59e0b" />
                <Text style={s.cardRating}>{item.rating}</Text>
              </View>
            </TouchableOpacity>
          )} />
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: '#e0f2fe' },
  mapArea: { flex: 1 },
  mapBg: { flex: 1, backgroundColor: '#d1fae5', justifyContent: 'center', alignItems: 'center', position: 'relative' },
  mapTxt: { fontSize: 20, fontWeight: '700', color: '#047857', marginTop: 10 },
  mapSub: { fontSize: 13, color: '#6b7280' },
  pin: { position: 'absolute' },
  sheet: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingTop: 12, paddingBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 8 },
  sheetHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: '#d1d5db', alignSelf: 'center', marginBottom: 14 },
  sheetTitle: { fontSize: 16, fontWeight: '700', color: '#111827', paddingHorizontal: 20, marginBottom: 12 },
  hList: { paddingHorizontal: 20 },
  card: { width: 140, marginRight: 12, backgroundColor: '#f0fdfa', borderRadius: 16, overflow: 'hidden' },
  cardImg: { width: '100%', height: 90 },
  cardTitle: { fontSize: 13, fontWeight: '700', color: '#111827', padding: 8, paddingBottom: 2 },
  cardRow: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingBottom: 8 },
  cardRating: { fontSize: 12, fontWeight: '600', color: '#374151' },
});
