// screens/LoginScreen.js
// Màn hình đăng nhập - Smart Travel Ngũ Hành Sơn

import React, { useState, useContext } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  SafeAreaView, Alert, ScrollView, StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppContext } from '../context/AppContext';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);

  const { dispatch } = useContext(AppContext);

  const handleLogin = () => {
    if (email && password) {
      dispatch({
        type: 'LOGIN',
        payload: {
          name: email.split('@')[0],
          email: email,
          phone: '+84 123 456 789',
          avatar: null,
        },
      });
      navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] });
    } else {
      Alert.alert('Thông báo', 'Vui lòng nhập đầy đủ thông tin đăng nhập.');
    }
  };

  return (
    <SafeAreaView style={styles.wrapper}>
      <StatusBar barStyle="dark-content" backgroundColor="#E6F4FE" />
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.container}>
          {/* Logo & Brand */}
          <View style={styles.header}>
            <View style={styles.logoCircle}>
              <Ionicons name="compass" size={40} color="#0891b2" />
            </View>
            <Text style={styles.brandText}>Smart Travel</Text>
            <Text style={styles.brandSub}>Ngũ Hành Sơn</Text>
          </View>

          <Text style={styles.welcomeText}>
            Khám phá vẻ đẹp Ngũ Hành Sơn{'\n'}cùng trợ lý du lịch thông minh
          </Text>

          {/* Form Card */}
          <View style={styles.card}>
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Email / Số điện thoại</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="mail-outline" size={20} color="#9ca3af" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="vd: ten@email.com"
                  placeholderTextColor="#9ca3af"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <View style={styles.passwordLabelRow}>
                <Text style={styles.label}>Mật khẩu</Text>
                <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
                  <Text style={styles.forgotText}>Quên mật khẩu?</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.inputWrapper}>
                <Ionicons name="lock-closed-outline" size={20} color="#9ca3af" style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { paddingRight: 44 }]}
                  placeholder="••••••••"
                  placeholderTextColor="#9ca3af"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity style={styles.eyeButton} onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons name={showPassword ? 'eye-outline' : 'eye-off-outline'} size={20} color="#9ca3af" />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity style={styles.rememberRow} onPress={() => setRemember(!remember)} activeOpacity={0.8}>
              <View style={[styles.checkbox, remember && styles.checkboxActive]}>
                {remember && <Ionicons name="checkmark" size={13} color="#fff" />}
              </View>
              <Text style={styles.rememberText}>Ghi nhớ đăng nhập</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.loginButton} onPress={handleLogin} activeOpacity={0.85}>
              <Text style={styles.loginButtonText}>Đăng nhập</Text>
            </TouchableOpacity>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>Hoặc</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity style={styles.googleButton} activeOpacity={0.8}>
              <Ionicons name="logo-google" size={20} color="#ea4335" />
              <Text style={styles.googleText}>Đăng nhập với Google</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Chưa có tài khoản? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.signUpText}>Đăng ký ngay</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: '#E6F4FE' },
  scrollContent: { flexGrow: 1 },
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 40 },
  header: { alignItems: 'center', marginBottom: 16 },
  logoCircle: {
    width: 80, height: 80, borderRadius: 40, backgroundColor: '#fff',
    justifyContent: 'center', alignItems: 'center', marginBottom: 12,
    shadowColor: '#0891b2', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 12, elevation: 6,
    borderWidth: 2, borderColor: '#cffafe',
  },
  brandText: { fontSize: 26, fontWeight: '800', color: '#0e7490' },
  brandSub: { fontSize: 14, fontWeight: '600', color: '#06b6d4', marginTop: 2 },
  welcomeText: { fontSize: 13, color: '#6b7280', textAlign: 'center', marginBottom: 28, lineHeight: 20 },
  card: {
    width: '100%', maxWidth: 430, backgroundColor: '#ffffff', borderRadius: 24, padding: 24,
    borderWidth: 1, borderColor: '#f0f9ff',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 14, elevation: 4,
  },
  fieldGroup: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 },
  passwordLabelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  forgotText: { fontSize: 12, fontWeight: '600', color: '#0891b2' },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#d1d5db', borderRadius: 14, backgroundColor: '#ffffff',
  },
  inputIcon: { paddingLeft: 14 },
  input: { flex: 1, paddingVertical: 14, paddingHorizontal: 10, fontSize: 15, color: '#111827' },
  eyeButton: { position: 'absolute', right: 14, padding: 4 },
  rememberRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  checkbox: {
    width: 17, height: 17, borderRadius: 4, borderWidth: 1, borderColor: '#d1d5db',
    alignItems: 'center', justifyContent: 'center', marginRight: 8,
  },
  checkboxActive: { backgroundColor: '#0891b2', borderColor: '#0891b2' },
  rememberText: { fontSize: 14, color: '#4b5563' },
  loginButton: {
    backgroundColor: '#0891b2', borderRadius: 14, paddingVertical: 15, alignItems: 'center', justifyContent: 'center',
    shadowColor: '#0891b2', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.25, shadowRadius: 10, elevation: 5,
  },
  loginButtonText: { fontSize: 16, fontWeight: '700', color: '#ffffff' },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 20 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#e5e7eb' },
  dividerText: { paddingHorizontal: 10, fontSize: 13, color: '#6b7280' },
  googleButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    borderWidth: 1, borderColor: '#d1d5db', borderRadius: 14, paddingVertical: 13, backgroundColor: '#ffffff',
  },
  googleText: { fontSize: 14, fontWeight: '600', color: '#374151' },
  footer: { flexDirection: 'row', marginTop: 24, alignItems: 'center' },
  footerText: { fontSize: 14, color: '#6b7280' },
  signUpText: { fontSize: 14, fontWeight: '700', color: '#0e7490' },
});
