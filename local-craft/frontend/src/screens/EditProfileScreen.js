// screens/EditProfileScreen.js
import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppContext } from '../context/AppContext';

export default function EditProfileScreen({ navigation }) {
  const { state, dispatch } = useContext(AppContext);
  const [name, setName] = useState(state.user?.name || '');
  const [email, setEmail] = useState(state.user?.email || '');
  const [phone, setPhone] = useState(state.user?.phone || '');

  const handleSave = () => {
    dispatch({ type: 'UPDATE_USER', payload: { name, email, phone } });
    Alert.alert('Thành công', 'Hồ sơ đã được cập nhật!', [{ text: 'OK', onPress: () => navigation.goBack() }]);
  };

  return (
    <SafeAreaView style={s.wrap}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Ionicons name="arrow-back" size={24} color="#111827" /></TouchableOpacity>
        <Text style={s.headerTitle}>Chỉnh sửa hồ sơ</Text>
        <View style={{ width: 24 }} />
      </View>
      <ScrollView contentContainerStyle={s.scroll}>
        <TouchableOpacity style={s.avatarCircle} onPress={() => navigation.navigate('UploadAvatar')}>
          <Ionicons name="person" size={40} color="#0891b2" />
          <View style={s.camBadge}><Ionicons name="camera" size={16} color="#fff" /></View>
        </TouchableOpacity>

        {[
          { label: 'Họ và tên', icon: 'person-outline', val: name, set: setName },
          { label: 'Email', icon: 'mail-outline', val: email, set: setEmail, kb: 'email-address' },
          { label: 'Số điện thoại', icon: 'call-outline', val: phone, set: setPhone, kb: 'phone-pad' },
        ].map((f, i) => (
          <View key={i} style={s.field}>
            <Text style={s.label}>{f.label}</Text>
            <View style={s.inputWrap}>
              <Ionicons name={f.icon} size={20} color="#9ca3af" style={s.iIcon} />
              <TextInput style={s.input} value={f.val} onChangeText={f.set} keyboardType={f.kb || 'default'} autoCapitalize="none" />
            </View>
          </View>
        ))}

        <TouchableOpacity style={s.saveBtn} onPress={handleSave}>
          <Text style={s.saveBtnTxt}>Lưu thay đổi</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: '#f0fdfa' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 50, paddingBottom: 14 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#111827' },
  scroll: { padding: 20, alignItems: 'center' },
  avatarCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#ecfeff', justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: '#0891b2', marginBottom: 30, position: 'relative' },
  camBadge: { position: 'absolute', bottom: 0, right: 0, width: 32, height: 32, borderRadius: 16, backgroundColor: '#0891b2', justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: '#f0fdfa' },
  field: { width: '100%', marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 6 },
  inputWrap: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#d1d5db', borderRadius: 14, backgroundColor: '#fff' },
  iIcon: { paddingLeft: 14 },
  input: { flex: 1, paddingVertical: 14, paddingHorizontal: 10, fontSize: 15, color: '#111827' },
  saveBtn: { width: '100%', backgroundColor: '#0891b2', borderRadius: 16, paddingVertical: 16, alignItems: 'center', marginTop: 10, shadowColor: '#0891b2', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.25, shadowRadius: 10, elevation: 5 },
  saveBtnTxt: { fontSize: 16, fontWeight: '700', color: '#fff' },
});
