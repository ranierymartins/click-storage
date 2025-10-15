import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

// Configurações do Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

// Cliente Supabase
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Função para verificar se a sincronização remota está habilitada
export const isRemoteSyncEnabled = () => {
  return import.meta.env.VITE_REMOTE_SYNC === 'true';
};

// Função para obter configurações do Supabase
export const getSupabaseConfig = () => {
  return {
    url: supabaseUrl,
    anonKey: supabaseAnonKey,
    isRemoteSyncEnabled: isRemoteSyncEnabled()
  };
};
