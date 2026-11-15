import axiosClient from './axiosClient';

export interface GenerateStopAudioParams {
  title: string;
  location?: string;
  type?: string;
  notes?: string;
  voice?: 'nova' | 'alloy' | 'echo' | 'fable' | 'onyx' | 'shimmer';
  language?: 'vi' | 'en';
}

export interface AudioGuideResponse {
  narrativeText: string;
  audioUrl: string;
  durationSeconds: number;
  voice: string;
  source: string;
}

export const audioGuideApi = {
  // Generate narrative script only
  generateNarrative: async (params: { title: string; location?: string; type?: string; notes?: string }) => {
    const res = await axiosClient.post('/audio-guide/narrative', params);
    return res.data;
  },

  // Synthesize text into MP3 uploaded to Cloudinary
  synthesizeAudio: async (text: string, voice = 'nova') => {
    const res = await axiosClient.post('/audio-guide/synthesize', { text, voice });
    return res.data;
  },

  // One-shot: Generate narrative + MP3 URL
  generateStopAudio: async (params: GenerateStopAudioParams): Promise<{ success: boolean; data: AudioGuideResponse }> => {
    const res = await axiosClient.post('/audio-guide/generate-stop-audio', params);
    return res.data;
  },

  // Get direct stream URL if needed
  getStreamUrl: (text: string, voice = 'nova') => {
    const base = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    return `${base}/audio-guide/stream?text=${encodeURIComponent(text)}&voice=${voice}`;
  },
};

export default audioGuideApi;
