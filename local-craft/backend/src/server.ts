import { env } from './config/env';
import { connectDB } from './config/db';
import app from './app';

const start = async () => {
  try {
    await connectDB();
    app.listen(env.PORT, () => {
      console.log(`\n🏺 CraftLocal Server running on http://localhost:${env.PORT}`);
      console.log(`📋 API Health: http://localhost:${env.PORT}/api/health`);
      console.log(`🌍 Environment: ${env.NODE_ENV}\n`);
    });
  } catch (error) {
    console.error('❌ Server startup failed:', error);
    process.exit(1);
  }
};

start();
