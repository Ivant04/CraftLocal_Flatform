import { env } from './env';

let payos: any;

try {
  const PayOSModule = require('@payos/node');
  const PayOSClass = PayOSModule.PayOS || PayOSModule.default || PayOSModule;

  if (typeof PayOSClass === 'function') {
    try {
      payos = new PayOSClass({
        clientId: env.PAYOS_CLIENT_ID || process.env.PAYOS_CLIENT_ID || '',
        apiKey: env.PAYOS_API_KEY || process.env.PAYOS_API_KEY || '',
        checksumKey: env.PAYOS_CHECKSUM_KEY || process.env.PAYOS_CHECKSUM_KEY || '',
      });
    } catch {
      // Fallback cho PayOS SDK phiên bản cũ (truyền 3 tham số chuỗi)
      payos = new PayOSClass(
        env.PAYOS_CLIENT_ID || process.env.PAYOS_CLIENT_ID || '',
        env.PAYOS_API_KEY || process.env.PAYOS_API_KEY || '',
        env.PAYOS_CHECKSUM_KEY || process.env.PAYOS_CHECKSUM_KEY || ''
      );
    }
  } else {
    throw new Error('SDK @payos/node không cung cấp class khởi tạo hợp lệ');
  }
} catch (err: any) {
  // Fallback an toàn nếu chưa cấu hình hoặc khởi tạo thất bại
  console.warn('[PayOS Config] Lưu ý khởi tạo PayOS:', err?.message || err);
  payos = {
    paymentRequests: {
      create: async () => {
        throw new Error(err?.message || '@payos/node chưa được cài đặt hoặc cấu hình chưa đúng');
      },
      get: async () => null,
      cancel: async () => null,
    },
    webhooks: {
      verify: () => {
        throw new Error(err?.message || '@payos/node chưa được cài đặt hoặc cấu hình chưa đúng');
      },
    },
  };
}

export default payos;
