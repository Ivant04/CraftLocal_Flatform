// screens/ProfileScreen.js
import React, { useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppContext } from '../context/AppContext';

const menuItems = [
  { icon: 'calendar', label: 'Lịch trình của tôi', screen: 'Itinerary', color: '#8b5cf6' },
  { icon: 'heart', label: 'Địa điểm yêu thích', screen: 'FavoriteDestination', color: '#ef4444' },
  { icon: 'notifications', label: 'Thông báo', screen: 'Notification', color: '#f59e0b' },
  { icon: 'settings', label: 'Cài đặt', screen: null, color: '#6b7280' },
  { icon: 'help-circle', label: 'Liên hệ hỗ trợ', screen: 'ContactSupport', color: '#0891b2' },
];

export default function ProfileScreen({ navigation }) {
  const { state, dispatch } = useContext(AppContext);

  const handleLogout = () => {
    Alert.alert('Đăng xuất', 'Bạn có chắc muốn đăng xuất?', [
      { text: 'Hủy', style: 'cancel' },
      { text: 'Đăng xuất', style: 'destructive', onPress: () => { dispatch({ type: 'LOGOUT' }); navigation.reset({ index: 0, routes: [{ name: 'Login' }] }); } },
    ]);
  };

  return (
    <SafeAreaView style={s.wrap}>
      <ScrollView contentContainerStyle={s.scroll}>
        <View style={s.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}><Ionicons name="arrow-back" size={24} color="#111827" /></TouchableOpacity>
          <Text style={s.headerTitle}>Ngũ Hành Sơn</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Avatar */}
        <View style={s.avatarSection}>
          <TouchableOpacity style={s.avatarCircle} onPress={() => navigation.navigate('UploadAvatar')}>
            <Ionicons name="person" size={44} color="#0891b2" />
          </TouchableOpacity>
          <Text style={s.name}>{state.user?.name || 'Khách'}</Text>
          <Text style={s.email}>{state.user?.email || ''}</Text>
          <Text style={s.phone}>{state.user?.phone || ''}</Text>
          <TouchableOpacity style={s.editBtn} onPress={() => navigation.navigate('EditProfile')}>
            <Ionicons name="create" size={16} color="#fff" />
            <Text style={s.editBtnTxt}>Chỉnh sửa hồ sơ</Text>
          </TouchableOpacity>
        </View>

        {/* Menu */}
        <View style={s.menu}>
          {menuItems.map((item, i) => (
            <TouchableOpacity key={i} style={s.menuItem} onPress={() => item.screen && navigation.navigate(item.screen)}>
              <View style={[s.menuIcon, { backgroundColor: item.color + '15' }]}><Ionicons name={item.icon} size={20} color={item.color} /></View>
              <Text style={s.menuLabel}>{item.label}</Text>
              <Ionicons name="chevron-forward" size={18} color="#d1d5db" />
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={s.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#ef4444" />
          <Text style={s.logoutTxt}>Đăng xuất</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: '#f0fdfa' },
  scroll: { paddingBottom: 30 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 50, paddingBottom: 10 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#111827' },
  avatarSection: { alignItems: 'center', paddingVertical: 24 },
  avatarCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#ecfeff', justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: '#0891b2', marginBottom: 14, shadowColor: '#0891b2', shadowOpacity: 0.2, shadowRadius: 10, elevation: 4 },
  name: { fontSize: 22, fontWeight: '800', color: '#111827' },
  email: { fontSize: 14, color: '#6b7280', marginTop: 2 },
  phone: { fontSize: 14, color: '#6b7280', marginTop: 2 },
  editBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#0891b2', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 999, marginTop: 14 },
  editBtnTxt: { fontSize: 14, fontWeight: '700', color: '#fff' },
  menu: { backgroundColor: '#fff', marginHorizontal: 20, borderRadius: 20, padding: 8, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 12, gap: 14 },
  menuIcon: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  menuLabel: { flex: 1, fontSize: 15, fontWeight: '600', color: '#374151' },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginHorizontal: 20, marginTop: 20, paddingVertical: 14, borderRadius: 16, borderWidth: 2, borderColor: '#fecaca', backgroundColor: '#fff1f2' },
  logoutTxt: { fontSize: 15, fontWeight: '700', color: '#ef4444' },
});
