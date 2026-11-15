// screens/NotificationScreen.js
import React, { useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppContext } from '../context/AppContext';

export default function NotificationScreen({ navigation }) {
  const { state, dispatch } = useContext(AppContext);

  const markAllRead = () => dispatch({ type: 'MARK_ALL_READ' });

  return (
    <SafeAreaView style={s.wrap}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Ionicons name="arrow-back" size={24} color="#111827" /></TouchableOpacity>
        <Text style={s.headerTitle}>Thông báo</Text>
        <TouchableOpacity onPress={markAllRead}><Text style={s.markAll}>Đọc tất cả</Text></TouchableOpacity>
      </View>

      <FlatList data={state.notifications} keyExtractor={i => i.id} contentContainerStyle={s.list}
        ListEmptyComponent={<View style={s.empty}><Ionicons name="notifications-off-outline" size={60} color="#d1d5db" /><Text style={s.emptyTxt}>Không có thông báo</Text></View>}
        renderItem={({ item }) => (
          <TouchableOpacity style={[s.card, !item.read && s.cardUnread]} onPress={() => dispatch({ type: 'MARK_READ', payload: item.id })}>
            <View style={[s.iconCircle, !item.read && s.iconUnread]}>
              <Ionicons name={!item.read ? 'notifications' : 'notifications-outline'} size={20} color={!item.read ? '#fff' : '#9ca3af'} />
            </View>
            <View style={s.info}>
              <Text style={[s.title, !item.read && s.titleUnread]}>{item.title}</Text>
              <Text style={s.body} numberOfLines={2}>{item.body}</Text>
              <Text style={s.time}>{item.time}</Text>
            </View>
            {!item.read && <View style={s.dot} />}
          </TouchableOpacity>
        )} />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: '#f0fdfa' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 50, paddingBottom: 14 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#111827' },
  markAll: { fontSize: 13, fontWeight: '700', color: '#0891b2' },
  list: { padding: 20, paddingTop: 10 },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 16, padding: 14, marginBottom: 10, gap: 12, shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 6, elevation: 1 },
  cardUnread: { backgroundColor: '#ecfeff', borderWidth: 1, borderColor: '#cffafe' },
  iconCircle: { width: 42, height: 42, borderRadius: 14, backgroundColor: '#f3f4f6', justifyContent: 'center', alignItems: 'center' },
  iconUnread: { backgroundColor: '#0891b2' },
  info: { flex: 1 },
  title: { fontSize: 14, fontWeight: '600', color: '#374151' },
  titleUnread: { fontWeight: '700', color: '#111827' },
  body: { fontSize: 13, color: '#6b7280', marginTop: 2, lineHeight: 18 },
  time: { fontSize: 11, color: '#9ca3af', marginTop: 4 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#0891b2' },
  empty: { alignItems: 'center', paddingTop: 80 },
  emptyTxt: { fontSize: 16, color: '#9ca3af', marginTop: 12 },
});
