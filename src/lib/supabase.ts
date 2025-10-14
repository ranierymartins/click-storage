import { Database } from './database.types';

// Tipos para facilitar o uso (apenas tipos - sem cliente Supabase em runtime)
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type Inserts<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert'];
export type Updates<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'];

// Tipos específicos das tabelas
export type Product = Tables<'products'>;
export type Customer = Tables<'customers'>;
export type CustomerProduct = Tables<'customer_products'>;

// Tipos para inserção
export type ProductInsert = Inserts<'products'>;
export type CustomerInsert = Inserts<'customers'>;
export type CustomerProductInsert = Inserts<'customer_products'>;

// Nota: O cliente Supabase foi removido para permitir uso local via `api`.