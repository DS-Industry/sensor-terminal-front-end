import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      host: true, 
      port: 5173, 
      strictPort: true, 
    },
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: ['./src/test/setup.ts'],
      css: true,
    },
    define: {
      'import.meta.env.VITE_S3_ENDPOINT': JSON.stringify(
        env.VITE_S3_ENDPOINT || env.ENDPOINT_FILE || 'storage.yandexcloud.net'
      ),
      'import.meta.env.VITE_S3_BUCKET_NAME': JSON.stringify(
        env.VITE_S3_BUCKET_NAME || env.BUCKET_NAME || 'onvi-business'
      ),
      'import.meta.env.VITE_AWS_ACCESS_KEY_ID': JSON.stringify(
        env.VITE_AWS_ACCESS_KEY_ID || env.AWS_ACCESS_KEY_ID || ''
      ),
      'import.meta.env.VITE_AWS_SECRET_ACCESS_KEY': JSON.stringify(
        env.VITE_AWS_SECRET_ACCESS_KEY || env.AWS_SECRET_ACCESS_KEY || ''
      ),
      'import.meta.env.VITE_S3_URL': JSON.stringify(
        env.VITE_S3_URL || env.STORAGE_URL || 'https://onvi-business.storage.yandexcloud.net/'
      ),
    },
  };
});
