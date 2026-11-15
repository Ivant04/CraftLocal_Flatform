// screens/AIChatbotScreen.js
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, FlatList, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const initialMsgs = [
  { id: '1', text: 'Xin chào! Tôi là trợ lý AI du lịch Ngũ Hành Sơn. Bạn muốn biết gì về khu vực này?', sender: 'ai' },
];

const aiResponses = {
  default: 'Cảm ơn bạn! Tôi có thể giúp bạn tìm hiểu về các điểm tham quan, ẩm thực, lịch sử và văn hóa tại Ngũ Hành Sơn. Hãy hỏi cụ thể hơn nhé!',
  chùa: 'Ngũ Hành Sơn có nhiều ngôi chùa nổi tiếng: Chùa Linh Ứng với tượng Phật Quan Thế Âm cao 67m, Chùa Tam Thai được vua Minh Mạng sắc phong, Chùa Non Nước cổ kính...',
  biển: 'Bãi biển Non Nước được Forbes bình chọn là 1 trong 6 bãi biển đẹp nhất hành tinh. Nước xanh trong, cát trắng mịn, rất lý tưởng để tắm biển và lướt sóng!',
  động: 'Động Huyền Không là hang động đẹp nhất tại Ngũ Hành Sơn. Ánh sáng tự nhiên xuyên qua trần hang tạo nên khung cảnh huyền ảo, thích hợp để tham quan và chụp ảnh.',
};

export default function AIChatbotScreen({ navigation }) {
  const [messages, setMessages] = useState(initialMsgs);
  const [input, setInput] = useState('');

  const sendMessage = () => {
    if (!input.trim()) return;
    const userMsg = { id: Date.now().toString(), text: input, sender: 'user' };
    const lc = input.toLowerCase();
    let response = aiResponses.default;
    if (lc.includes('chùa') || lc.includes('linh ứng')) response = aiResponses['chùa'];
    else if (lc.includes('biển') || lc.includes('non nước')) response = aiResponses['biển'];
    else if (lc.includes('động') || lc.includes('huyền không')) response = aiResponses['động'];
    const aiMsg = { id: (Date.now() + 1).toString(), text: response, sender: 'ai' };
    setMessages(prev => [...prev, userMsg, aiMsg]);
    setInput('');
  };

  const renderMsg = ({ item }) => (
    <View style={[s.msgRow, item.sender === 'user' && s.msgRowUser]}>
      {item.sender === 'ai' && <View style={s.aiAvatar}><Ionicons name="sparkles" size={16} color="#fff" /></View>}
      <View style={[s.bubble, item.sender === 'user' ? s.bubbleUser : s.bubbleAI]}>
        <Text style={[s.msgTxt, item.sender === 'user' && s.msgTxtUser]}>{item.text}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={s.wrap}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Ionicons name="arrow-back" size={24} color="#111827" /></TouchableOpacity>
        <View style={s.headerCenter}>
          <View style={s.headerDot} />
          <Text style={s.headerTitle}>Trợ lý AI</Text>
        </View>
        <TouchableOpacity><Ionicons name="ellipsis-vertical" size={20} color="#6b7280" /></TouchableOpacity>
      </View>

      <FlatList data={messages} renderItem={renderMsg} keyExtractor={i => i.id} contentContainerStyle={s.list} />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={s.inputBar}>
          <TextInput style={s.input} placeholder="Nhập câu hỏi..." placeholderTextColor="#9ca3af" value={input} onChangeText={setInput} multiline />
          <TouchableOpacity style={s.sendBtn} onPress={sendMessage}>
            <Ionicons name="send" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: '#f0fdfa' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 50, paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  headerCenter: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#10b981' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#111827' },
  list: { padding: 20, paddingBottom: 10 },
  msgRow: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 14, gap: 8 },
  msgRowUser: { flexDirection: 'row-reverse' },
  aiAvatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#0891b2', justifyContent: 'center', alignItems: 'center' },
  bubble: { maxWidth: '78%', borderRadius: 18, padding: 14 },
  bubbleAI: { backgroundColor: '#fff', borderBottomLeftRadius: 4, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, elevation: 1 },
  bubbleUser: { backgroundColor: '#0891b2', borderBottomRightRadius: 4 },
  msgTxt: { fontSize: 14, color: '#374151', lineHeight: 21 },
  msgTxtUser: { color: '#fff' },
  inputBar: { flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: 16, paddingVertical: 12, borderTopWidth: 1, borderTopColor: '#e5e7eb', backgroundColor: '#fff', gap: 10 },
  input: { flex: 1, backgroundColor: '#f3f4f6', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, fontSize: 15, color: '#111827', maxHeight: 80 },
  sendBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#0891b2', justifyContent: 'center', alignItems: 'center' },
});
