// screens/HomeScreen.js
import React, { useContext } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, TextInput, ScrollView, SafeAreaView, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppContext } from '../context/AppContext';
import { DestinationContext } from '../context/DestinationContext';

const categories = [
  { id: '1', name: 'Tất cả', icon: 'apps' },
  { id: '2', name: 'Thiên nhiên', icon: 'leaf' },
  { id: '3', name: 'Tâm linh', icon: 'flower' },
  { id: '4', name: 'Bãi biển', icon: 'water' },
  { id: '5', name: 'Văn hóa', icon: 'color-palette' },
];

export default function HomeScreen({ navigation }) {
  const { state } = useContext(AppContext);
  const { destinations } = useContext(DestinationContext);

  const renderDest = ({ item }) => (
    <TouchableOpacity style={s.card} onPress={() => navigation.navigate('DestinationDetail', { destination: item })}>
      <Image source={{ uri: item.image }} style={s.cardImg} />
      <View style={s.cardOverlay}>
        <View style={s.ratingBadge}>
          <Ionicons name="star" size={12} color="#f59e0b" />
          <Text style={s.ratingTxt}>{item.rating}</Text>
        </View>
      </View>
      <View style={s.cardInfo}>
        <Text style={s.cardTitle} numberOfLines={1}>{item.title}</Text>
        <View style={s.cardLocRow}>
          <Ionicons name="location" size={14} color="#0891b2" />
          <Text style={s.cardLoc} numberOfLines={1}>{item.location}</Text>
        </View>
        <View style={s.cardBottom}>
          <Text style={s.cardPrice}>{item.price}</Text>
          <Text style={s.cardTime}>{item.openTime}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={s.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f0fdfa" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scrollContent}>
        {/* Top Bar */}
        <View style={s.topBar}>
          <View>
            <Text style={s.greeting}>{state.user ? `Xin chào, ${state.user.name} 👋` : 'Xin chào! 👋'}</Text>
            <Text style={s.greetSub}>Khám phá Ngũ Hành Sơn hôm nay</Text>
          </View>
          <TouchableOpacity style={s.notifBtn} onPress={() => navigation.navigate('Notification')}>
            <Ionicons name="notifications-outline" size={24} color="#0e7490" />
            {state.notifications.filter(n => !n.read).length > 0 && <View style={s.notifDot} />}
          </TouchableOpacity>
        </View>

        {/* Search */}
        <TouchableOpacity style={s.searchBar} onPress={() => navigation.navigate('Search')}>
          <Ionicons name="search" size={20} color="#9ca3af" />
          <Text style={s.searchPlaceholder}>Tìm kiếm điểm đến...</Text>
          <View style={s.filterBtn}>
            <Ionicons name="options" size={18} color="#0891b2" />
          </View>
        </TouchableOpacity>

        {/* Categories */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.catRow}>
          {categories.map((cat, i) => (
            <TouchableOpacity key={cat.id} style={[s.catBadge, i === 0 && s.catActive]}>
              <Ionicons name={cat.icon} size={18} color={i === 0 ? '#fff' : '#0891b2'} />
              <Text style={[s.catTxt, i === 0 && s.catTxtActive]}>{cat.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Featured */}
        <View style={s.secHeader}>
          <Text style={s.secTitle}>Điểm đến nổi bật</Text>
          <TouchableOpacity onPress={() => navigation.navigate('DestinationList')}>
            <Text style={s.seeAll}>Xem tất cả</Text>
          </TouchableOpacity>
        </View>

        <FlatList data={destinations.slice(0, 3)} renderItem={renderDest} keyExtractor={item => item.id} horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.hList} />

        {/* Popular */}
        <View style={s.secHeader}>
          <Text style={s.secTitle}>Phổ biến gần đây</Text>
          <TouchableOpacity onPress={() => navigation.navigate('DestinationList')}>
            <Text style={s.seeAll}>{destinations.length} địa điểm</Text>
          </TouchableOpacity>
        </View>

        {destinations.slice(3).map(item => (
          <TouchableOpacity key={item.id} style={s.listCard} onPress={() => navigation.navigate('DestinationDetail', { destination: item })}>
            <Image source={{ uri: item.image }} style={s.listImg} />
            <View style={s.listInfo}>
              <Text style={s.listTitle} numberOfLines={1}>{item.title}</Text>
              <View style={s.listLocRow}>
                <Ionicons name="location" size={12} color="#0891b2" />
                <Text style={s.listLoc} numberOfLines={1}>{item.location}</Text>
              </View>
              <View style={s.listBottom}>
                <View style={s.listRating}>
                  <Ionicons name="star" size={12} color="#f59e0b" />
                  <Text style={s.listRatingTxt}>{item.rating}</Text>
                </View>
                <Text style={s.listPrice}>{item.price}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}

        {/* AI Banner */}
        <TouchableOpacity style={s.aiBanner} onPress={() => navigation.navigate('AIMenu')}>
          <View style={s.aiIcon}><Ionicons name="sparkles" size={28} color="#fff" /></View>
          <View style={{ flex: 1 }}>
            <Text style={s.aiTitle}>Trợ lý AI thông minh</Text>
            <Text style={s.aiSub}>Lên lịch trình, hỏi đáp, khám phá cùng AI</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#fff" />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0fdfa' },
  scrollContent: { paddingBottom: 20 },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8 },
  greeting: { fontSize: 20, fontWeight: '800', color: '#111827' },
  greetSub: { fontSize: 13, color: '#6b7280', marginTop: 2 },
  notifBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
  notifDot: { position: 'absolute', top: 10, right: 10, width: 8, height: 8, borderRadius: 4, backgroundColor: '#ef4444' },
  searchBar: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 20, marginTop: 16, height: 52, borderRadius: 16, backgroundColor: '#fff', paddingHorizontal: 16, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
  searchPlaceholder: { flex: 1, marginLeft: 10, fontSize: 14, color: '#9ca3af' },
  filterBtn: { width: 36, height: 36, borderRadius: 12, backgroundColor: '#ecfeff', justifyContent: 'center', alignItems: 'center' },
  catRow: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 8 },
  catBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 999, backgroundColor: '#ecfeff', marginRight: 10 },
  catActive: { backgroundColor: '#0891b2', shadowColor: '#0891b2', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  catTxt: { fontSize: 13, fontWeight: '600', color: '#0891b2' },
  catTxtActive: { color: '#fff' },
  secHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginTop: 24, marginBottom: 14 },
  secTitle: { fontSize: 18, fontWeight: '800', color: '#111827' },
  seeAll: { fontSize: 14, fontWeight: '700', color: '#0891b2' },
  hList: { paddingLeft: 20 },
  card: { width: 220, marginRight: 16, backgroundColor: '#fff', borderRadius: 20, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 4 },
  cardImg: { width: '100%', height: 140 },
  cardOverlay: { position: 'absolute', top: 10, right: 10 },
  ratingBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(255,255,255,0.9)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999 },
  ratingTxt: { fontSize: 12, fontWeight: '700', color: '#111827' },
  cardInfo: { padding: 14 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: '#111827' },
  cardLocRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  cardLoc: { fontSize: 12, color: '#6b7280', flex: 1 },
  cardBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  cardPrice: { fontSize: 13, fontWeight: '700', color: '#0891b2' },
  cardTime: { fontSize: 11, color: '#9ca3af' },
  listCard: { flexDirection: 'row', marginHorizontal: 20, marginBottom: 14, backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  listImg: { width: 100, height: 100 },
  listInfo: { flex: 1, padding: 12, justifyContent: 'center' },
  listTitle: { fontSize: 15, fontWeight: '700', color: '#111827' },
  listLocRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  listLoc: { fontSize: 12, color: '#6b7280', flex: 1 },
  listBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  listRating: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  listRatingTxt: { fontSize: 12, fontWeight: '600', color: '#111827' },
  listPrice: { fontSize: 13, fontWeight: '700', color: '#0891b2' },
  aiBanner: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 20, marginTop: 24, backgroundColor: '#0e7490', borderRadius: 20, padding: 18, shadowColor: '#0e7490', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 6 },
  aiIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  aiTitle: { fontSize: 16, fontWeight: '700', color: '#fff' },
  aiSub: { fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
});
