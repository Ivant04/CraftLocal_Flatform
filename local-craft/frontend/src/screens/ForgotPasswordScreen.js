// screens/ForgotPasswordScreen.js
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, Alert, ScrollView, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState('');

  const handleReset = () => {
    if (!email) return Alert.alert('Thông báo', 'Vui lòng nhập email.');
    Alert.alert('Đã gửi', 'Hướng dẫn khôi phục mật khẩu đã được gửi đến email của bạn.', [
      { text: 'OK', onPress: () => navigation.navigate('Login') },
    ]);
  };

  return (
    <SafeAreaView style={s.wrap}>
      <StatusBar barStyle="dark-content" backgroundColor="#E6F4FE" />
      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
        <View style={s.topBar}>
          <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#0e7490" />
          </TouchableOpacity>
          <Text style={s.topTitle}>Quên mật khẩu</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={s.container}>
          <View style={s.iconCircle}>
            <Ionicons name="key" size={44} color="#0891b2" />
          </View>
          <Text style={s.title}>Khôi phục truy cập</Text>
          <Text style={s.subtitle}>Nhập email để nhận hướng dẫn khôi phục mật khẩu. Chúng tôi sẽ gửi một liên kết an toàn tới hộp thư của bạn.</Text>

          <View style={s.card}>
            <View style={s.field}>
              <Text style={s.label}>Địa chỉ email</Text>
              <View style={s.inputWrap}>
                <Ionicons name="mail-outline" size={20} color="#9ca3af" style={s.iIcon} />
                <TextInput style={s.input} placeholder="vd: ten@email.com" placeholderTextColor="#9ca3af" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
              </View>
            </View>

            <TouchableOpacity style={s.sendBtn} onPress={handleReset}>
              <Text style={s.sendBtnTxt}>Gửi hướng dẫn</Text>
              <Ionicons name="arrow-forward" size={18} color="#fff" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={s.backLink} onPress={() => navigation.navigate('Login')}>
            <Ionicons name="arrow-back-circle-outline" size={18} color="#0891b2" />
            <Text style={s.backLinkTxt}>Quay lại đăng nhập</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: '#E6F4FE' },
  scroll: { flexGrow: 1 },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 50 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  topTitle: { fontSize: 16, fontWeight: '700', color: '#0e7490' },
  container: { flex: 1, alignItems: 'center', paddingHorizontal: 24, paddingTop: 40 },
  iconCircle: { width: 90, height: 90, borderRadius: 45, backgroundColor: '#cffafe', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 26, fontWeight: '800', color: '#111827', marginBottom: 12 },
  subtitle: { fontSize: 14, color: '#6b7280', textAlign: 'center', lineHeight: 21, marginBottom: 30, paddingHorizontal: 10 },
  card: { width: '100%', backgroundColor: '#fff', borderRadius: 24, padding: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 14, elevation: 4 },
  field: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 },
  inputWrap: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#d1d5db', borderRadius: 14, backgroundColor: '#fff' },
  iIcon: { paddingLeft: 14 },
  input: { flex: 1, paddingVertical: 14, paddingHorizontal: 10, fontSize: 15, color: '#111827' },
  sendBtn: { backgroundColor: '#0891b2', borderRadius: 14, paddingVertical: 15, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8, shadowColor: '#0891b2', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.25, shadowRadius: 10, elevation: 5 },
  sendBtnTxt: { fontSize: 16, fontWeight: '700', color: '#fff' },
  backLink: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 28 },
  backLinkTxt: { fontSize: 14, color: '#0891b2', fontWeight: '600' },
});
