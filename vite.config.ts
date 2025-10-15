import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Configuração do Vite
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
  },
  envPrefix: 'VITE_',
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
});
