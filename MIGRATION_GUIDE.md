# Guia de Migração: SQLite → Supabase

## ✅ Migração Concluída

Seu sistema foi migrado com sucesso do SQLite local para o Supabase! Aqui está o que foi alterado:

## 🔄 Mudanças Realizadas

### 1. **Dependências Atualizadas**
- ✅ Adicionado `@supabase/supabase-js`
- ✅ Removido `sqlite3` (não mais necessário)
- ✅ Scripts do servidor local removidos

### 2. **Banco de Dados**
- ✅ Schema criado no Supabase com todas as tabelas
- ✅ Migrações SQL criadas em `supabase/migrations/`
- ✅ Dados de exemplo em `supabase/seeds/`
- ✅ Row Level Security (RLS) configurado

### 3. **Código Atualizado**
- ✅ `src/lib/supabase.ts` - Configuração do cliente Supabase
- ✅ `src/lib/api.ts` - APIs reescritas para usar Supabase
- ✅ `src/hooks/useInventory.ts` - Hook atualizado para Supabase
- ✅ Servidor Node.js local removido

## 🚀 Próximos Passos

### 1. **Configurar o Supabase**

1. Acesse [https://supabase.com](https://supabase.com)
2. Crie um novo projeto ou use um existente
3. Vá em **Settings > API**
4. Copie a **URL do projeto** e a **chave anônima (anon key)**

### 2. **Configurar Variáveis de Ambiente**

Crie um arquivo `.env.local` na raiz do projeto:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anonima
```

### 3. **Executar as Migrações**

No painel do Supabase, vá em **SQL Editor** e execute:

1. **Primeiro**: `supabase/migrations/20241201000001_create_inventory_tables.sql`
2. **Opcional**: `supabase/seeds/seed_inventory.sql` (para dados de exemplo)

### 4. **Instalar Dependências e Executar**

```bash
npm install
npm run dev
```

## 📊 Estrutura do Banco de Dados

### Tabelas Criadas:
- **products** - Produtos do inventário
- **customers** - Clientes
- **companies** - Empresas (para manutenção)
- **customer_products** - Relacionamento cliente-produto
- **accessories** - Acessórios
- **customer_accessories** - Relacionamento cliente-acessório
- **maintenance_items** - Itens em manutenção

### Recursos Implementados:
- ✅ UUIDs como chaves primárias
- ✅ Timestamps automáticos (created_at, updated_at)
- ✅ JSONB para arrays de números de série
- ✅ Triggers para updated_at
- ✅ Índices para performance
- ✅ Row Level Security (RLS)
- ✅ Políticas de acesso público (ajustáveis)

## 🔧 Funcionalidades Mantidas

Todas as funcionalidades originais foram preservadas:

- ✅ Gestão de produtos com números de série
- ✅ Gestão de clientes e empresas
- ✅ Associação de produtos a clientes
- ✅ Sistema de manutenção
- ✅ Gestão de acessórios
- ✅ Dashboard e relatórios
- ✅ Controle granular por serial

## 🆕 Melhorias com Supabase

- **Escalabilidade**: Banco de dados em nuvem
- **Backup Automático**: Dados seguros na nuvem
- **Performance**: Otimizações do PostgreSQL
- **Segurança**: Row Level Security
- **APIs**: REST e GraphQL automáticas
- **Real-time**: Suporte a atualizações em tempo real (futuro)

## 🐛 Solução de Problemas

### Erro de Conexão
- Verifique se as variáveis de ambiente estão corretas
- Confirme se o projeto Supabase está ativo

### Erro de Permissão
- Verifique se as políticas RLS estão configuradas
- Confirme se a chave anônima está correta

### Dados Não Aparecem
- Execute as migrações no Supabase
- Verifique se as tabelas foram criadas corretamente

## 📞 Suporte

Se encontrar problemas:
1. Verifique o console do navegador para erros
2. Confirme se o Supabase está configurado corretamente
3. Execute as migrações se ainda não fez

---

**🎉 Parabéns! Sua migração para o Supabase foi concluída com sucesso!**
