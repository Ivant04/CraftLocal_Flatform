// screens/AIItineraryScreen.js
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch } from 'react-redux';
import { setAIItinerary } from '../redux/itinerarySlice';

export default function AIItineraryScreen({ navigation }) {
  const [duration, setDuration] = useState('1 ngày');
  const [interests, setInterests] = useState('');
  const [budget, setBudget] = useState('');
  const dispatch = useDispatch();

  const durations = ['Nửa ngày', '1 ngày', '2 ngày', '3 ngày'];
  const interestTags = ['Thiên nhiên', 'Tâm linh', 'Bãi biển', 'Ẩm thực', 'Chụp ảnh', 'Lịch sử'];
  const [selectedTags, setSelectedTags] = useState([]);

  const toggleTag = (t) => setSelectedTags(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);

  const generateItinerary = () => {
    const result = {
      title: `Lịch trình ${duration} - Ngũ Hành Sơn`,
      duration, interests: selectedTags.join(', '), budget,
      stops: [
        { id: 's1', name: 'Ngũ Hành Sơn', time: '07:00 - 10:00', note: 'Leo núi, khám phá hang động' },
        { id: 's2', name: 'Động Huyền Không', time: '10:00 - 11:30', note: 'Tham quan hang động huyền bí' },
        { id: 's3', name: 'Chùa Tam Thai', time: '11:30 - 12:30', note: 'Viếng chùa, cầu bình an' },
        { id: 's4', name: 'Ăn trưa đặc sản', time: '12:30 - 14:00', note: 'Thưởng thức mì Quảng, bánh tráng cuốn' },
        { id: 's5', name: 'Bãi biển Non Nước', time: '14:00 - 17:00', note: 'Tắm biển, chụp ảnh hoàng hôn' },
      ],
    };
    dispatch(setAIItinerary(result));
    navigation.navigate('AIItineraryResult');
  };

  return (
    <SafeAreaView style={s.wrap}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Ionicons name="arrow-back" size={24} color="#111827" /></TouchableOpacity>
        <Text style={s.headerTitle}>Tạo lịch trình AI</Text>
        <View style={{ width: 24 }} />
      </View>
      <ScrollView contentContainerStyle={s.scroll}>
        <View style={s.section}>
          <Text style={s.secTitle}><Ionicons name="time" size={18} color="#8b5cf6" /> Thời gian</Text>
          <View style={s.tagRow}>
            {durations.map(d => (
              <TouchableOpacity key={d} style={[s.tag, duration === d && s.tagOn]} onPress={() => setDuration(d)}>
                <Text style={[s.tagTxt, duration === d && s.tagTxtOn]}>{d}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={s.section}>
          <Text style={s.secTitle}><Ionicons name="heart" size={18} color="#ef4444" /> Sở thích</Text>
          <View style={s.tagRow}>
            {interestTags.map(t => (
              <TouchableOpacity key={t} style={[s.tag, selectedTags.includes(t) && s.tagOn2]} onPress={() => toggleTag(t)}>
                <Text style={[s.tagTxt, selectedTags.includes(t) && s.tagTxtOn]}>{t}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={s.section}>
          <Text style={s.secTitle}><Ionicons name="wallet" size={18} color="#10b981" /> Ngân sách (tùy chọn)</Text>
          <View style={s.inputWrap}>
            <TextInput style={s.input} placeholder="vd: 500.000 VNĐ" placeholderTextColor="#9ca3af" value={budget} onChangeText={setBudget} keyboardType="numeric" />
          </View>
        </View>

        <View style={s.section}>
          <Text style={s.secTitle}><Ionicons name="create" size={18} color="#f59e0b" /> Ghi chú thêm</Text>
          <View style={s.inputWrap}>
            <TextInput style={[s.input, { height: 80, textAlignVertical: 'top' }]} placeholder="Yêu cầu đặc biệt..." placeholderTextColor="#9ca3af" value={interests} onChangeText={setInterests} multiline />
          </View>
        </View>

        <TouchableOpacity style={s.genBtn} onPress={generateItinerary}>
          <Ionicons name="sparkles" size={20} color="#fff" />
          <Text style={s.genBtnTxt}>Tạo lịch trình</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: '#f0fdfa' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 50, paddingBottom: 14 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#111827' },
  scroll: { padding: 20, paddingBottom: 40 },
  section: { marginBottom: 24 },
  secTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 12 },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  tag: { paddingHorizontal: 18, paddingVertical: 10, borderRadius: 999, backgroundColor: '#ecfeff', borderWidth: 1, borderColor: '#cffafe' },
  tagOn: { backgroundColor: '#8b5cf6', borderColor: '#8b5cf6' },
  tagOn2: { backgroundColor: '#0891b2', borderColor: '#0891b2' },
  tagTxt: { fontSize: 14, fontWeight: '600', color: '#0891b2' },
  tagTxtOn: { color: '#fff' },
  inputWrap: { backgroundColor: '#fff', borderRadius: 14, borderWidth: 1, borderColor: '#e5e7eb' },
  input: { paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, color: '#111827' },
  genBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: '#8b5cf6', borderRadius: 16, paddingVertical: 16, marginTop: 10, shadowColor: '#8b5cf6', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 6 },
  genBtnTxt: { fontSize: 16, fontWeight: '700', color: '#fff' },
});
