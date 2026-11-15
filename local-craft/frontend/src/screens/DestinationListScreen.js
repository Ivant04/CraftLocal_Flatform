// screens/DestinationListScreen.js
import React, { useContext, useState } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DestinationContext } from '../context/DestinationContext';

const cats = ['Tất cả', 'Thiên nhiên', 'Tâm linh', 'Bãi biển', 'Văn hóa'];

export default function DestinationListScreen({ navigation }) {
  const { destinations } = useContext(DestinationContext);
  const [activeCat, setActiveCat] = useState('Tất cả');
  const filtered = activeCat === 'Tất cả' ? destinations : destinations.filter(d => d.category === activeCat);

  return (
    <SafeAreaView style={s.wrap}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Ionicons name="arrow-back" size={24} color="#111827" /></TouchableOpacity>
        <Text style={s.headerTitle}>Tất cả điểm đến</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Map')}><Ionicons name="map" size={24} color="#0891b2" /></TouchableOpacity>
      </View>
      <View style={s.catWrap}>
        {cats.map(c => (
          <TouchableOpacity key={c} style={[s.cat, activeCat === c && s.catOn]} onPress={() => setActiveCat(c)}>
            <Text style={[s.catTxt, activeCat === c && s.catTxtOn]}>{c}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <FlatList data={filtered} keyExtractor={i => i.id} contentContainerStyle={s.list}
        renderItem={({ item }) => (
          <TouchableOpacity style={s.card} onPress={() => navigation.navigate('DestinationDetail', { destination: item })}>
            <Image source={{ uri: item.image }} style={s.img} />
            <View style={s.info}>
              <Text style={s.title}>{item.title}</Text>
              <View style={s.locRow}><Ionicons name="location" size={13} color="#0891b2" /><Text style={s.loc}>{item.location}</Text></View>
              <View style={s.bottom}>
                <View style={s.rRow}><Ionicons name="star" size={13} color="#f59e0b" /><Text style={s.rTxt}>{item.rating} ({item.reviews})</Text></View>
                <Text style={s.price}>{item.price}</Text>
              </View>
            </View>
          </TouchableOpacity>
        )} />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: '#f0fdfa' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 50, paddingBottom: 14 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#111827' },
  catWrap: { flexDirection: 'row', paddingHorizontal: 16, paddingBottom: 10, gap: 8 },
  cat: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, backgroundColor: '#ecfeff' },
  catOn: { backgroundColor: '#0891b2' },
  catTxt: { fontSize: 13, fontWeight: '600', color: '#0891b2' },
  catTxtOn: { color: '#fff' },
  list: { paddingHorizontal: 20, paddingBottom: 20 },
  card: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 18, overflow: 'hidden', marginBottom: 14, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  img: { width: 110, height: 110 },
  info: { flex: 1, padding: 14, justifyContent: 'center' },
  title: { fontSize: 16, fontWeight: '700', color: '#111827' },
  locRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  loc: { fontSize: 12, color: '#6b7280', flex: 1 },
  bottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  rRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  rTxt: { fontSize: 12, fontWeight: '600', color: '#374151' },
  price: { fontSize: 14, fontWeight: '700', color: '#0891b2' },
});
