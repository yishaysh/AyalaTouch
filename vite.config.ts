import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    publicDir: 'public', // Explicitly serve static assets from 'public' folder
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    define: {
      'process.env.API_KEY': JSON.stringify(env.API_KEY),
      'process.env': {}
    },
    css: {
      postcss: './postcss.config.js',
    },
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
    }
  };
});