# Configuração do Supabase

## Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto com as seguintes variáveis:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## Como obter as credenciais:

1. Acesse [https://supabase.com](https://supabase.com)
2. Crie um novo projeto ou acesse um existente
3. Vá em **Settings > API**
4. Copie a **URL do projeto** e a **chave anônima (anon key)**
5. Substitua os valores no arquivo `.env.local`

## Executar as migrações:

1. No painel do Supabase, vá em **SQL Editor**
2. Execute o arquivo `supabase/migrations/20241201000001_create_inventory_tables.sql`
3. (Opcional) Execute o arquivo `supabase/seeds/seed_inventory.sql` para dados de exemplo

## Estrutura do Banco:

- **products**: Produtos do inventário
- **customers**: Clientes
- **companies**: Empresas (para manutenção)
- **customer_products**: Relacionamento cliente-produto
- **accessories**: Acessórios
- **customer_accessories**: Relacionamento cliente-acessório
- **maintenance_items**: Itens em manutenção
