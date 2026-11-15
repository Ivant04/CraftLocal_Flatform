// screens/ContactSupportScreen.js
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Alert, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const contactMethods = [
  { icon: 'call', label: 'Hotline', value: '1900 xxxx', color: '#10b981', action: () => Linking.openURL('tel:1900xxxx') },
  { icon: 'mail', label: 'Email', value: 'support@smarttravel.vn', color: '#0891b2', action: () => Linking.openURL('mailto:support@smarttravel.vn') },
  { icon: 'logo-facebook', label: 'Facebook', value: 'Smart Travel NHS', color: '#3b82f6', action: () => {} },
];

export default function ContactSupportScreen({ navigation }) {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (!subject || !message) return Alert.alert('Thông báo', 'Vui lòng nhập đầy đủ thông tin.');
    Alert.alert('Đã gửi', 'Yêu cầu hỗ trợ của bạn đã được gửi thành công!', [{ text: 'OK', onPress: () => navigation.goBack() }]);
  };

  return (
    <SafeAreaView style={s.wrap}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Ionicons name="arrow-back" size={24} color="#111827" /></TouchableOpacity>
        <Text style={s.headerTitle}>Liên hệ hỗ trợ</Text>
        <View style={{ width: 24 }} />
      </View>
      <ScrollView contentContainerStyle={s.scroll}>
        <View style={s.contactRow}>
          {contactMethods.map((c, i) => (
            <TouchableOpacity key={i} style={s.contactCard} onPress={c.action}>
              <View style={[s.contactIcon, { backgroundColor: c.color + '15' }]}><Ionicons name={c.icon} size={24} color={c.color} /></View>
              <Text style={s.contactLabel}>{c.label}</Text>
              <Text style={s.contactValue}>{c.value}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={s.secTitle}>Gửi yêu cầu hỗ trợ</Text>
        <View style={s.card}>
          <View style={s.field}>
            <Text style={s.label}>Tiêu đề</Text>
            <TextInput style={s.input} placeholder="Nhập tiêu đề..." placeholderTextColor="#9ca3af" value={subject} onChangeText={setSubject} />
          </View>
          <View style={s.field}>
            <Text style={s.label}>Nội dung</Text>
            <TextInput style={[s.input, { height: 120, textAlignVertical: 'top' }]} placeholder="Mô tả vấn đề của bạn..." placeholderTextColor="#9ca3af" value={message} onChangeText={setMessage} multiline />
          </View>
          <TouchableOpacity style={s.sendBtn} onPress={handleSend}>
            <Ionicons name="send" size={18} color="#fff" />
            <Text style={s.sendBtnTxt}>Gửi yêu cầu</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: '#f0fdfa' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 50, paddingBottom: 14 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#111827' },
  scroll: { padding: 20 },
  contactRow: { flexDirection: 'row', gap: 12, marginBottom: 28 },
  contactCard: { flex: 1, backgroundColor: '#fff', borderRadius: 18, padding: 16, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
  contactIcon: { width: 48, height: 48, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  contactLabel: { fontSize: 12, fontWeight: '700', color: '#111827' },
  contactValue: { fontSize: 10, color: '#6b7280', marginTop: 2, textAlign: 'center' },
  secTitle: { fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 14 },
  card: { backgroundColor: '#fff', borderRadius: 20, padding: 20, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
  field: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 6 },
  input: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, color: '#111827', backgroundColor: '#fff' },
  sendBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#0891b2', borderRadius: 14, paddingVertical: 15, marginTop: 4, shadowColor: '#0891b2', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.25, shadowRadius: 10, elevation: 5 },
  sendBtnTxt: { fontSize: 16, fontWeight: '700', color: '#fff' },
});
