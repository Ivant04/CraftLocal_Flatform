// screens/DestinationDetailScreen.js
import React, { useContext } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppContext } from '../context/AppContext';

export default function DestinationDetailScreen({ route, navigation }) {
  const { destination } = route.params;
  const { state, dispatch } = useContext(AppContext);
  const isFav = state.favorites.some(f => f.id === destination.id);

  const toggleFav = () => {
    if (isFav) dispatch({ type: 'REMOVE_FAVORITE', payload: destination.id });
    else dispatch({ type: 'ADD_FAVORITE', payload: destination });
  };

  return (
    <SafeAreaView style={s.wrap}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={s.imgWrap}>
          <Image source={{ uri: destination.image }} style={s.img} />
          <View style={s.imgOverlay} />
          <View style={s.imgTopRow}>
            <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={22} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={s.favBtn} onPress={toggleFav}>
              <Ionicons name={isFav ? 'heart' : 'heart-outline'} size={22} color={isFav ? '#ef4444' : '#fff'} />
            </TouchableOpacity>
          </View>
          <View style={s.imgBadge}>
            <Text style={s.imgBadgeTxt}>{destination.category}</Text>
          </View>
        </View>

        <View style={s.content}>
          <Text style={s.title}>{destination.title}</Text>
          <View style={s.locRow}>
            <Ionicons name="location" size={16} color="#0891b2" />
            <Text style={s.loc}>{destination.location}</Text>
          </View>

          <View style={s.statRow}>
            <View style={s.stat}><Ionicons name="star" size={18} color="#f59e0b" /><Text style={s.statVal}>{destination.rating}</Text><Text style={s.statLabel}>{destination.reviews} đánh giá</Text></View>
            <View style={s.statDivider} />
            <View style={s.stat}><Ionicons name="time" size={18} color="#0891b2" /><Text style={s.statVal}>{destination.openTime}</Text><Text style={s.statLabel}>Giờ mở cửa</Text></View>
            <View style={s.statDivider} />
            <View style={s.stat}><Ionicons name="ticket" size={18} color="#10b981" /><Text style={s.statVal}>{destination.price}</Text><Text style={s.statLabel}>Giá vé</Text></View>
          </View>

          <Text style={s.secTitle}>Giới thiệu</Text>
          <Text style={s.desc}>{destination.description}</Text>

          <Text style={s.secTitle}>Tiện ích</Text>
          <View style={s.amenRow}>
            {[{ icon: 'car', label: 'Bãi đỗ xe' }, { icon: 'wifi', label: 'WiFi' }, { icon: 'restaurant', label: 'Ẩm thực' }, { icon: 'camera', label: 'Check-in' }].map((a, i) => (
              <View key={i} style={s.amen}><View style={s.amenIcon}><Ionicons name={a.icon} size={20} color="#0891b2" /></View><Text style={s.amenTxt}>{a.label}</Text></View>
            ))}
          </View>
        </View>
      </ScrollView>

      <View style={s.bottomBar}>
        <TouchableOpacity style={s.mapBtn} onPress={() => navigation.navigate('DestinationMapDetail', { destination })}>
          <Ionicons name="navigate" size={20} color="#0891b2" />
          <Text style={s.mapBtnTxt}>Chỉ đường</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.shareBtn} onPress={() => Alert.alert('Chia sẻ', 'Tính năng đang phát triển')}>
          <Ionicons name="share-social" size={20} color="#fff" />
          <Text style={s.shareBtnTxt}>Chia sẻ</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: '#fff' },
  imgWrap: { position: 'relative' },
  img: { width: '100%', height: 300 },
  imgOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.15)' },
  imgTopRow: { position: 'absolute', top: 50, left: 20, right: 20, flexDirection: 'row', justifyContent: 'space-between' },
  backBtn: { width: 42, height: 42, borderRadius: 21, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center' },
  favBtn: { width: 42, height: 42, borderRadius: 21, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center' },
  imgBadge: { position: 'absolute', bottom: 16, left: 20, backgroundColor: '#0891b2', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 999 },
  imgBadgeTxt: { fontSize: 12, fontWeight: '700', color: '#fff' },
  content: { padding: 20 },
  title: { fontSize: 24, fontWeight: '800', color: '#111827', marginBottom: 6 },
  locRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 20 },
  loc: { fontSize: 14, color: '#6b7280' },
  statRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f0fdfa', borderRadius: 16, padding: 16, marginBottom: 24 },
  stat: { flex: 1, alignItems: 'center' },
  statVal: { fontSize: 14, fontWeight: '700', color: '#111827', marginTop: 4 },
  statLabel: { fontSize: 11, color: '#6b7280', marginTop: 2 },
  statDivider: { width: 1, height: 40, backgroundColor: '#d1fae5' },
  secTitle: { fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 10 },
  desc: { fontSize: 14, color: '#4b5563', lineHeight: 22, marginBottom: 20 },
  amenRow: { flexDirection: 'row', gap: 14, marginBottom: 20, flexWrap: 'wrap' },
  amen: { alignItems: 'center', width: 72 },
  amenIcon: { width: 48, height: 48, borderRadius: 16, backgroundColor: '#ecfeff', justifyContent: 'center', alignItems: 'center', marginBottom: 6 },
  amenTxt: { fontSize: 11, color: '#6b7280', fontWeight: '600' },
  bottomBar: { flexDirection: 'row', padding: 16, gap: 12, borderTopWidth: 1, borderTopColor: '#f3f4f6' },
  mapBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderWidth: 2, borderColor: '#0891b2', borderRadius: 14, paddingVertical: 14 },
  mapBtnTxt: { fontSize: 15, fontWeight: '700', color: '#0891b2' },
  shareBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#0891b2', borderRadius: 14, paddingVertical: 14 },
  shareBtnTxt: { fontSize: 15, fontWeight: '700', color: '#fff' },
});
