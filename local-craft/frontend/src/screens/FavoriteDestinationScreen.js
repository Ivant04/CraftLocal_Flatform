// screens/FavoriteDestinationScreen.js
import React, { useContext } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppContext } from '../context/AppContext';

export default function FavoriteDestinationScreen({ navigation }) {
  const { state, dispatch } = useContext(AppContext);

  const removeFav = (id) => dispatch({ type: 'REMOVE_FAVORITE', payload: id });

  return (
    <SafeAreaView style={s.wrap}>
      <View style={s.header}>
        <Text style={s.headerTitle}>Địa điểm yêu thích</Text>
        <Text style={s.count}>{state.favorites.length} địa điểm</Text>
      </View>

      <FlatList data={state.favorites} keyExtractor={i => i.id} contentContainerStyle={s.list}
        ListEmptyComponent={
          <View style={s.empty}>
            <Ionicons name="heart-outline" size={60} color="#fca5a5" />
            <Text style={s.emptyTxt}>Chưa có yêu thích</Text>
            <Text style={s.emptySub}>Hãy khám phá và lưu điểm đến yêu thích!</Text>
            <TouchableOpacity style={s.emptyBtn} onPress={() => navigation.navigate('Home')}>
              <Text style={s.emptyBtnTxt}>Khám phá ngay</Text>
            </TouchableOpacity>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity style={s.card} onPress={() => navigation.navigate('DestinationDetail', { destination: item })}>
            <Image source={{ uri: item.image }} style={s.img} />
            <View style={s.info}>
              <Text style={s.title}>{item.title}</Text>
              <View style={s.locRow}><Ionicons name="location" size={13} color="#0891b2" /><Text style={s.loc}>{item.location}</Text></View>
              <View style={s.bottom}>
                <View style={s.rRow}><Ionicons name="star" size={13} color="#f59e0b" /><Text style={s.rTxt}>{item.rating}</Text></View>
                <TouchableOpacity onPress={() => removeFav(item.id)}><Ionicons name="heart" size={22} color="#ef4444" /></TouchableOpacity>
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
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#111827' },
  count: { fontSize: 14, fontWeight: '700', color: '#0891b2' },
  list: { padding: 20, paddingTop: 10 },
  card: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 18, overflow: 'hidden', marginBottom: 14, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  img: { width: 110, height: 110 },
  info: { flex: 1, padding: 14, justifyContent: 'center' },
  title: { fontSize: 16, fontWeight: '700', color: '#111827' },
  locRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  loc: { fontSize: 12, color: '#6b7280', flex: 1 },
  bottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  rRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  rTxt: { fontSize: 12, fontWeight: '600', color: '#374151' },
  empty: { alignItems: 'center', paddingTop: 80 },
  emptyTxt: { fontSize: 18, fontWeight: '700', color: '#d1d5db', marginTop: 16 },
  emptySub: { fontSize: 14, color: '#d1d5db', marginTop: 4 },
  emptyBtn: { backgroundColor: '#0891b2', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 999, marginTop: 20 },
  emptyBtnTxt: { fontSize: 14, fontWeight: '700', color: '#fff' },
});
