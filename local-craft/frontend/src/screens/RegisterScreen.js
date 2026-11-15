// screens/RegisterScreen.js
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, Alert, ScrollView, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function RegisterScreen({ navigation }) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [agree, setAgree] = useState(false);

  const handleRegister = () => {
    if (!fullName || !email || !password || !confirmPassword) return Alert.alert('Thông báo', 'Vui lòng nhập đầy đủ.');
    if (password !== confirmPassword) return Alert.alert('Thông báo', 'Mật khẩu không khớp.');
    if (!agree) return Alert.alert('Thông báo', 'Vui lòng đồng ý điều khoản.');
    Alert.alert('Thành công', 'Đăng ký thành công!', [{ text: 'OK', onPress: () => navigation.navigate('Login') }]);
  };

  return (
    <SafeAreaView style={s.wrap}>
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
        <View style={s.headerBg}>
          <View style={s.headerRow}>
            <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={s.headerTitle}>Tạo tài khoản</Text>
            <View style={{ width: 40 }} />
          </View>
          <View style={s.headerContent}>
            <Text style={s.heroTitle}>Bắt đầu hành trình</Text>
            <Text style={s.heroSub}>Đăng ký để khám phá Ngũ Hành Sơn{'\n'}cùng trợ lý AI thông minh</Text>
          </View>
        </View>

        <View style={s.card}>
          {[
            { label: 'Họ và tên', icon: 'person-outline', val: fullName, set: setFullName, ph: 'Nguyễn Văn A' },
            { label: 'Email', icon: 'mail-outline', val: email, set: setEmail, ph: 'ten@email.com', kb: 'email-address' },
            { label: 'Số điện thoại', icon: 'call-outline', val: phone, set: setPhone, ph: '+84 xxx xxx xxx', kb: 'phone-pad' },
          ].map((f, i) => (
            <View key={i} style={s.field}>
              <Text style={s.label}>{f.label}</Text>
              <View style={s.inputWrap}>
                <Ionicons name={f.icon} size={20} color="#9ca3af" style={s.iIcon} />
                <TextInput style={s.input} placeholder={f.ph} placeholderTextColor="#9ca3af" value={f.val} onChangeText={f.set} keyboardType={f.kb || 'default'} autoCapitalize="none" />
              </View>
            </View>
          ))}

          <View style={s.field}>
            <Text style={s.label}>Mật khẩu</Text>
            <View style={s.inputWrap}>
              <Ionicons name="lock-closed-outline" size={20} color="#9ca3af" style={s.iIcon} />
              <TextInput style={[s.input, { paddingRight: 44 }]} placeholder="Tối thiểu 6 ký tự" placeholderTextColor="#9ca3af" secureTextEntry={!showPw} value={password} onChangeText={setPassword} autoCapitalize="none" />
              <TouchableOpacity style={s.eyeBtn} onPress={() => setShowPw(!showPw)}>
                <Ionicons name={showPw ? 'eye-outline' : 'eye-off-outline'} size={20} color="#9ca3af" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={s.field}>
            <Text style={s.label}>Xác nhận mật khẩu</Text>
            <View style={s.inputWrap}>
              <Ionicons name="shield-checkmark-outline" size={20} color="#9ca3af" style={s.iIcon} />
              <TextInput style={s.input} placeholder="Nhập lại mật khẩu" placeholderTextColor="#9ca3af" secureTextEntry={!showPw} value={confirmPassword} onChangeText={setConfirmPassword} autoCapitalize="none" />
            </View>
          </View>

          <TouchableOpacity style={s.termsRow} onPress={() => setAgree(!agree)}>
            <View style={[s.cb, agree && s.cbOn]}>{agree && <Ionicons name="checkmark" size={13} color="#fff" />}</View>
            <Text style={s.termsText}>Tôi đồng ý với <Text style={s.termsLink}>Điều khoản</Text> và <Text style={s.termsLink}>Chính sách bảo mật</Text></Text>
          </TouchableOpacity>

          <TouchableOpacity style={s.regBtn} onPress={handleRegister}><Text style={s.regBtnTxt}>Đăng ký</Text></TouchableOpacity>

          <View style={s.divider}><View style={s.divLine} /><Text style={s.divTxt}>Hoặc</Text><View style={s.divLine} /></View>

          <TouchableOpacity style={s.gBtn}>
            <Ionicons name="logo-google" size={20} color="#ea4335" />
            <Text style={s.gTxt}>Đăng ký với Google</Text>
          </TouchableOpacity>
        </View>

        <View style={s.footer}>
          <Text style={s.footerTxt}>Đã có tài khoản? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}><Text style={s.loginTxt}>Đăng nhập</Text></TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: '#f0fdf4' },
  scroll: { flexGrow: 1 },
  headerBg: { backgroundColor: '#047857', paddingTop: 50, paddingBottom: 30, borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 20 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 16, fontWeight: '700', color: '#fff' },
  headerContent: { paddingHorizontal: 24 },
  heroTitle: { fontSize: 28, fontWeight: '800', color: '#fff', marginBottom: 8 },
  heroSub: { fontSize: 14, color: 'rgba(255,255,255,0.85)', lineHeight: 21 },
  card: { marginHorizontal: 20, marginTop: -10, backgroundColor: '#fff', borderRadius: 24, padding: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 16, elevation: 5, marginBottom: 20 },
  field: { marginBottom: 14 },
  label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 6 },
  inputWrap: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#d1d5db', borderRadius: 14, backgroundColor: '#fff' },
  iIcon: { paddingLeft: 14 },
  input: { flex: 1, paddingVertical: 13, paddingHorizontal: 10, fontSize: 15, color: '#111827' },
  eyeBtn: { position: 'absolute', right: 14, padding: 4 },
  termsRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 20, marginTop: 4 },
  cb: { width: 18, height: 18, borderRadius: 4, borderWidth: 1, borderColor: '#d1d5db', alignItems: 'center', justifyContent: 'center', marginRight: 10, marginTop: 2 },
  cbOn: { backgroundColor: '#047857', borderColor: '#047857' },
  termsText: { flex: 1, fontSize: 13, color: '#6b7280', lineHeight: 19 },
  termsLink: { color: '#047857', fontWeight: '600' },
  regBtn: { backgroundColor: '#047857', borderRadius: 14, paddingVertical: 15, alignItems: 'center', shadowColor: '#047857', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.25, shadowRadius: 10, elevation: 5 },
  regBtnTxt: { fontSize: 16, fontWeight: '700', color: '#fff' },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 18 },
  divLine: { flex: 1, height: 1, backgroundColor: '#e5e7eb' },
  divTxt: { paddingHorizontal: 10, fontSize: 13, color: '#6b7280' },
  gBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderWidth: 1, borderColor: '#d1d5db', borderRadius: 14, paddingVertical: 13, backgroundColor: '#fff' },
  gTxt: { fontSize: 14, fontWeight: '600', color: '#374151' },
  footer: { flexDirection: 'row', justifyContent: 'center', paddingBottom: 30 },
  footerTxt: { fontSize: 14, color: '#6b7280' },
  loginTxt: { fontSize: 14, fontWeight: '700', color: '#047857' },
});
