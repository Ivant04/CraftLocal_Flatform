import dotenv from 'dotenv';
dotenv.config();

const sanitizeFrontendUrl = (url: string) =>
  url.replace(/craftlocal-frontend\.onrender\.com/g, 'craftlocal-frontend-vq6q.onrender.com');

export const env = {
  PORT: parseInt(process.env.PORT || '5000', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  MONGO_URI: process.env.MONGO_URI || process.env.MONGODB_URI || '',
  JWT_SECRET: process.env.JWT_SECRET || 'default_secret',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  CLIENT_URL: sanitizeFrontendUrl(process.env.CLIENT_URL || 'http://localhost:5173'),
  API_URL: process.env.API_URL || 'http://localhost:5000',
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || '',
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || '',
  GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY || '',
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || '',
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || '',
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || '',
  MAIL_HOST: process.env.MAIL_HOST || 'smtp.gmail.com',
  MAIL_PORT: parseInt(process.env.MAIL_PORT || '587', 10),
  MAIL_USER: process.env.MAIL_USER || '',
  MAIL_PASS: process.env.MAIL_PASS || '',
  PAYMENT_RETURN_URL: sanitizeFrontendUrl(process.env.PAYMENT_RETURN_URL || 'http://localhost:5173/payment-result'),
  PAYOS_CLIENT_ID: process.env.PAYOS_CLIENT_ID || '',
  PAYOS_API_KEY: process.env.PAYOS_API_KEY || '',
  PAYOS_CHECKSUM_KEY: process.env.PAYOS_CHECKSUM_KEY || '',
  PAYOS_RETURN_URL: sanitizeFrontendUrl(process.env.PAYOS_RETURN_URL || 'http://localhost:5173/payment/payos-return'),
  PAYOS_CANCEL_URL: sanitizeFrontendUrl(process.env.PAYOS_CANCEL_URL || 'http://localhost:5173/payment/payos-cancel'),
  CHAT_API_KEY: process.env.CHAT_API_KEY || '',
  CHAT_API_BASE_URL: process.env.CHAT_API_BASE_URL || 'https://api.openai.com/v1',
  CHAT_MODEL: process.env.CHAT_MODEL || 'gpt-4o-mini',
  ELEVENLABS_API_KEY: process.env.ELEVENLABS_API_KEY || '',
  ELEVENLABS_VOICE_ID: process.env.ELEVENLABS_VOICE_ID || 'Gsu64Edc28AUbKHbhJFn',
};
