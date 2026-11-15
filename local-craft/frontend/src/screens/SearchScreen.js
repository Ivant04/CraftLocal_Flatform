// screens/SearchScreen.js
import React, { useContext, useState } from 'react';
import { View, Text, TextInput, FlatList, Image, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DestinationContext } from '../context/DestinationContext';

const recentSearches = ['Chùa Linh Ứng', 'Bãi biển Non Nước', 'Động Huyền Không'];

export default function SearchScreen({ navigation }) {
  const { destinations } = useContext(DestinationContext);
  const [query, setQuery] = useState('');
  const results = query ? destinations.filter(d => d.title.toLowerCase().includes(query.toLowerCase()) || d.location.toLowerCase().includes(query.toLowerCase())) : [];

  return (
    <SafeAreaView style={s.wrap}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Ionicons name="arrow-back" size={24} color="#111827" /></TouchableOpacity>
        <View style={s.searchBar}>
          <Ionicons name="search" size={20} color="#9ca3af" />
          <TextInput style={s.searchInput} placeholder="Tìm kiếm điểm đến..." placeholderTextColor="#9ca3af" value={query} onChangeText={setQuery} autoFocus />
          {query ? <TouchableOpacity onPress={() => setQuery('')}><Ionicons name="close-circle" size={20} color="#9ca3af" /></TouchableOpacity> : null}
        </View>
      </View>

      {!query ? (
        <View style={s.recent}>
          <Text style={s.recentTitle}>Tìm kiếm gần đây</Text>
          {recentSearches.map((r, i) => (
            <TouchableOpacity key={i} style={s.recentItem} onPress={() => setQuery(r)}>
              <Ionicons name="time-outline" size={18} color="#9ca3af" />
              <Text style={s.recentTxt}>{r}</Text>
            </TouchableOpacity>
          ))}
          <Text style={[s.recentTitle, { marginTop: 24 }]}>Gợi ý cho bạn</Text>
          {['Thiên nhiên', 'Tâm linh', 'Lịch sử'].map((t, i) => (
            <TouchableOpacity key={i} style={s.sugBadge}><Text style={s.sugTxt}>{t}</Text></TouchableOpacity>
          ))}
        </View>
      ) : (
        <FlatList data={results} keyExtractor={i => i.id} contentContainerStyle={s.list}
          ListEmptyComponent={<View style={s.empty}><Ionicons name="search" size={48} color="#d1d5db" /><Text style={s.emptyTxt}>Không tìm thấy kết quả</Text></View>}
          renderItem={({ item }) => (
            <TouchableOpacity style={s.card} onPress={() => navigation.navigate('DestinationDetail', { destination: item })}>
              <Image source={{ uri: item.image }} style={s.img} />
              <View style={s.info}>
                <Text style={s.title}>{item.title}</Text>
                <Text style={s.loc}>{item.location}</Text>
                <View style={s.rRow}><Ionicons name="star" size={12} color="#f59e0b" /><Text style={s.rTxt}>{item.rating}</Text></View>
              </View>
            </TouchableOpacity>
          )} />
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: '#f0fdfa' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 50, paddingBottom: 14, gap: 12 },
  searchBar: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 14, paddingHorizontal: 14, height: 48, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, elevation: 2, gap: 8 },
  searchInput: { flex: 1, fontSize: 15, color: '#111827' },
  recent: { paddingHorizontal: 20, paddingTop: 10 },
  recentTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 12 },
  recentItem: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  recentTxt: { fontSize: 15, color: '#374151' },
  sugBadge: { alignSelf: 'flex-start', backgroundColor: '#ecfeff', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 999, marginBottom: 8, marginRight: 8 },
  sugTxt: { fontSize: 13, fontWeight: '600', color: '#0891b2' },
  list: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 20 },
  card: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden', marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  img: { width: 90, height: 90 },
  info: { flex: 1, padding: 12, justifyContent: 'center' },
  title: { fontSize: 15, fontWeight: '700', color: '#111827' },
  loc: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  rRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
  rTxt: { fontSize: 12, fontWeight: '600', color: '#374151' },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyTxt: { fontSize: 16, color: '#9ca3af', marginTop: 12 },
});
