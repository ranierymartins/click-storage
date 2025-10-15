import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// Configuração do Vite
export default defineConfig(({ mode }) => {
  // Carrega variáveis de ambiente do arquivo teste.env
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [react()],
    server: {
      port: 3000,
    },
    envDir: './',
    envPrefix: 'VITE_',
  };
});
