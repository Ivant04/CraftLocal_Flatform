// screens/UploadAvatarScreen.js
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function UploadAvatarScreen({ navigation }) {
  const [selected, setSelected] = useState(null);
  const avatars = ['person', 'happy', 'glasses', 'fitness', 'airplane', 'leaf'];
  const colors = ['#0891b2', '#8b5cf6', '#ef4444', '#f59e0b', '#10b981', '#6366f1'];

  return (
    <SafeAreaView style={s.wrap}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Ionicons name="arrow-back" size={24} color="#111827" /></TouchableOpacity>
        <Text style={s.headerTitle}>Chọn ảnh đại diện</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={s.content}>
        <View style={s.previewCircle}>
          <Ionicons name={selected || 'person'} size={60} color={colors[avatars.indexOf(selected)] || '#0891b2'} />
        </View>

        <Text style={s.secTitle}>Chọn biểu tượng</Text>
        <View style={s.grid}>
          {avatars.map((a, i) => (
            <TouchableOpacity key={a} style={[s.avatarBtn, selected === a && s.avatarBtnOn]} onPress={() => setSelected(a)}>
              <Ionicons name={a} size={32} color={colors[i]} />
            </TouchableOpacity>
          ))}
        </View>

        <Text style={s.orTxt}>hoặc</Text>

        <TouchableOpacity style={s.uploadBtn} onPress={() => Alert.alert('Thông báo', 'Tính năng tải ảnh đang phát triển')}>
          <Ionicons name="cloud-upload" size={22} color="#0891b2" />
          <Text style={s.uploadBtnTxt}>Tải ảnh từ thiết bị</Text>
        </TouchableOpacity>

        <TouchableOpacity style={s.saveBtn} onPress={() => { Alert.alert('Thành công', 'Ảnh đại diện đã được cập nhật!'); navigation.goBack(); }}>
          <Text style={s.saveBtnTxt}>Lưu ảnh đại diện</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: '#f0fdfa' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 50, paddingBottom: 14 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#111827' },
  content: { flex: 1, alignItems: 'center', padding: 20 },
  previewCircle: { width: 120, height: 120, borderRadius: 60, backgroundColor: '#ecfeff', justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: '#0891b2', marginBottom: 30 },
  secTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 16, alignSelf: 'flex-start' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 14, justifyContent: 'center', marginBottom: 24 },
  avatarBtn: { width: 70, height: 70, borderRadius: 20, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, elevation: 2, borderWidth: 2, borderColor: 'transparent' },
  avatarBtnOn: { borderColor: '#0891b2', backgroundColor: '#ecfeff' },
  orTxt: { fontSize: 14, color: '#9ca3af', marginBottom: 16 },
  uploadBtn: { flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 2, borderColor: '#0891b2', borderStyle: 'dashed', borderRadius: 16, paddingVertical: 16, paddingHorizontal: 30, marginBottom: 24 },
  uploadBtnTxt: { fontSize: 15, fontWeight: '600', color: '#0891b2' },
  saveBtn: { width: '100%', backgroundColor: '#0891b2', borderRadius: 16, paddingVertical: 16, alignItems: 'center', shadowColor: '#0891b2', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.25, shadowRadius: 10, elevation: 5 },
  saveBtnTxt: { fontSize: 16, fontWeight: '700', color: '#fff' },
});
