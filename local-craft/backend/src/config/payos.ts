import { env } from './env';

let payos: any;

try {
    const PayOS = require('@payos/node');
    payos = new PayOS(
        env.PAYOS_CLIENT_ID || '',
        env.PAYOS_API_KEY || '',
        env.PAYOS_CHECKSUM_KEY || ''
    );
} catch {
    // Fallback an toàn nếu chưa cài @payos/node để server không bị sập
    payos = {
        paymentRequests: {
            create: async () => {
                throw new Error('@payos/node chưa được cài đặt');
            },
            get: async () => null,
            cancel: async () => null,
        },
        webhooks: {
            verify: () => {
                throw new Error('@payos/node chưa được cài đặt');
            },
        },
    };
}

export default payos;