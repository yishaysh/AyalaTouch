import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    define: {
      // Define process.env.API_KEY specifically so it gets replaced by the string value at build time
      'process.env.API_KEY': JSON.stringify(env.API_KEY),
      // Define process.env as an empty object to prevent "process is not defined" crashes
      'process.env': {}
    },
  };
});