import dns from 'dns';
import mongoose from 'mongoose';
import { env } from './env';

/**
 * Ensures SRV/TXT DNS lookups for `mongodb+srv://` succeed when the local
 * router DNS rejects or drops SRV queries (e.g. `querySrv ECONNREFUSED`).
 */
export const configureMongoDns = async (uri: string): Promise<void> => {
  if (!uri.startsWith('mongodb+srv://')) return;
  try {
    const hostname = new URL(uri.replace('mongodb+srv://', 'https://')).hostname;
    await dns.promises.resolveSrv(`_mongodb._tcp.${hostname}`);
  } catch {
    dns.setServers(['8.8.8.8', '1.1.1.1']);
  }
};

export const connectDB = async (): Promise<void> => {
  if (!env.MONGO_URI) {
    console.error('❌ MongoDB connection error: MONGO_URI is not defined in .env');
    process.exit(1);
  }

  try {
    await configureMongoDns(env.MONGO_URI);
    const conn = await mongoose.connect(env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (env.MONGO_URI.startsWith('mongodb+srv://') && /query(Srv|Txt)/i.test(message)) {
      try {
        dns.setServers(['8.8.8.8', '1.1.1.1']);
        const conn = await mongoose.connect(env.MONGO_URI, {
          serverSelectionTimeoutMS: 10000,
        });
        console.log(`✅ MongoDB connected (public DNS fallback): ${conn.connection.host}`);
        return;
      } catch (retryError) {
        console.error('❌ MongoDB connection error:', retryError);
        process.exit(1);
      }
    }
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};
