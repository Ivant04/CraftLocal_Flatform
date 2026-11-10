import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    fs: {
      // Supplied config files named `env` also contain server credentials.
      deny: ['.env', '.env.*', '*.{crt,pem}', '**/.git/**', '**/env']
    }
  }
});
