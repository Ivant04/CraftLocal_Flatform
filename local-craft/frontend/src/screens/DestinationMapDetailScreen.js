// screens/DestinationMapDetailScreen.js
import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function DestinationMapDetailScreen({ route, navigation }) {
  const { destination } = route.params;

  const openMaps = () => {
    const url = `https://www.google.com/maps/search/?api=1&query=${destination.latitude},${destination.longitude}`;
    Linking.openURL(url).catch(() => {});
  };

  return (
    <SafeAreaView style={s.wrap}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Ionicons name="arrow-back" size={24} color="#111827" /></TouchableOpacity>
        <Text style={s.headerTitle}>Bản đồ chi tiết</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Map placeholder */}
      <View style={s.mapArea}>
        <View style={s.mapBg}>
          <Ionicons name="location" size={50} color="#0891b2" />
          <Text style={s.mapLabel}>{destination.title}</Text>
          <Text style={s.mapCoord}>{destination.latitude?.toFixed(4)}, {destination.longitude?.toFixed(4)}</Text>
        </View>
      </View>

      <ScrollView style={s.content}>
        <View style={s.card}>
          <Image source={{ uri: destination.image }} style={s.cardImg} />
          <View style={s.cardInfo}>
            <Text style={s.cardTitle}>{destination.title}</Text>
            <View style={s.locRow}><Ionicons name="location" size={14} color="#0891b2" /><Text style={s.locTxt}>{destination.location}</Text></View>
            <View style={s.infoRow}>
              <View style={s.infoBadge}><Ionicons name="time" size={14} color="#0891b2" /><Text style={s.infoTxt}>{destination.openTime}</Text></View>
              <View style={s.infoBadge}><Ionicons name="ticket" size={14} color="#10b981" /><Text style={s.infoTxt}>{destination.price}</Text></View>
            </View>
          </View>
        </View>

        <TouchableOpacity style={s.directBtn} onPress={openMaps}>
          <Ionicons name="navigate" size={22} color="#fff" />
          <Text style={s.directBtnTxt}>Mở Google Maps</Text>
        </TouchableOpacity>

        <TouchableOpacity style={s.detailBtn} onPress={() => navigation.navigate('DestinationDetail', { destination })}>
          <Ionicons name="information-circle-outline" size={22} color="#0891b2" />
          <Text style={s.detailBtnTxt}>Xem chi tiết đầy đủ</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: '#f0fdfa' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 50, paddingBottom: 14 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#111827' },
  mapArea: { height: 250 },
  mapBg: { flex: 1, backgroundColor: '#d1fae5', justifyContent: 'center', alignItems: 'center' },
  mapLabel: { fontSize: 18, fontWeight: '700', color: '#047857', marginTop: 8 },
  mapCoord: { fontSize: 12, color: '#6b7280', marginTop: 4 },
  content: { flex: 1, padding: 20 },
  card: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 18, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 10, elevation: 3, marginBottom: 20 },
  cardImg: { width: 100, height: 120 },
  cardInfo: { flex: 1, padding: 14 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#111827' },
  locRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  locTxt: { fontSize: 12, color: '#6b7280', flex: 1 },
  infoRow: { flexDirection: 'row', gap: 10, marginTop: 8 },
  infoBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#f0fdfa', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  infoTxt: { fontSize: 11, fontWeight: '600', color: '#374151' },
  directBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: '#0891b2', borderRadius: 16, paddingVertical: 16, marginBottom: 12, shadowColor: '#0891b2', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 5 },
  directBtnTxt: { fontSize: 16, fontWeight: '700', color: '#fff' },
  detailBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, borderWidth: 2, borderColor: '#0891b2', borderRadius: 16, paddingVertical: 16 },
  detailBtnTxt: { fontSize: 16, fontWeight: '700', color: '#0891b2' },
});
