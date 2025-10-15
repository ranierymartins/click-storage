# 🚀 Guia Completo de Integração com Supabase

## 📋 **Checklist de Integração**

### ✅ **1. Configurar Projeto no Supabase**

1. **Acesse**: [https://supabase.com](https://supabase.com)
2. **Login/Cadastro**: Faça login ou crie uma conta
3. **Novo Projeto**: Clique em "New Project"
4. **Configurações**:
   - **Name**: `click-storage`
   - **Database Password**: Crie uma senha forte (salve ela!)
   - **Region**: South America - São Paulo (ou mais próxima)
5. **Aguarde**: A criação pode levar alguns minutos

### ✅ **2. Obter Credenciais**

Após o projeto estar pronto:
1. **Vá em**: Settings → API
2. **Copie**:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: Chave longa que começa com `eyJ...`

### ✅ **3. Configurar Variáveis de Ambiente**

**Crie o arquivo `.env.local` na raiz do projeto:**

```env
VITE_SUPABASE_URL=https://seu-projeto-id.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anonima-aqui
```

**Exemplo real:**
```env
VITE_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTY5ODc2MDAwMCwiZXhwIjoyMDE0MzM2MDAwfQ.exemplo-de-chave-muito-longa
```

### ✅ **4. Executar Migrações no Supabase**

1. **No painel Supabase**: Vá em **SQL Editor**
2. **New Query**: Clique em "New Query"
3. **Copie o conteúdo** do arquivo: `supabase/migrations/20241201000001_create_inventory_tables.sql`
4. **Cole no editor** e clique em **Run**
5. **Aguarde** a execução (deve mostrar "Success")

### ✅ **5. (Opcional) Inserir Dados de Exemplo**

1. **Novo Query** no SQL Editor
2. **Copie o conteúdo** do arquivo: `supabase/seeds/seed_inventory.sql`
3. **Cole e execute** para ter dados de exemplo

### ✅ **6. Instalar Dependências**

**No terminal, na pasta do projeto:**
```bash
npm install
```

**Se npm não funcionar, tente:**
```bash
# Windows
where node
where npm

# Ou use o caminho completo
"C:\Program Files\nodejs\npm.cmd" install
```

### ✅ **7. Executar a Aplicação**

```bash
npm run dev
```

**A aplicação deve abrir em**: `http://localhost:5173`

## 🔍 **Verificação da Integração**

### ✅ **Teste Básico:**
1. Abra a aplicação
2. Vá para a aba "Estoque"
3. Tente adicionar um produto
4. Se funcionar, a integração está OK!

### ✅ **Verificar no Supabase:**
1. **Table Editor** → **products**
2. Deve aparecer o produto que você criou
3. **Table Editor** → **customers** (se criou clientes)

## 🐛 **Solução de Problemas**

### ❌ **Erro: "Invalid API key"**
- Verifique se copiou a chave correta
- Confirme se o arquivo `.env.local` está na raiz
- Reinicie o servidor (`npm run dev`)

### ❌ **Erro: "Failed to fetch"**
- Verifique se a URL do Supabase está correta
- Confirme se o projeto está ativo no Supabase
- Verifique sua conexão com internet

### ❌ **Erro: "Table doesn't exist"**
- Execute as migrações no SQL Editor
- Verifique se as tabelas foram criadas em **Table Editor**

### ❌ **npm não encontrado**
- Instale o Node.js: [https://nodejs.org](https://nodejs.org)
- Reinicie o terminal após instalar
- Ou use o caminho completo do npm

## 📊 **Estrutura das Tabelas Criadas**

Após executar as migrações, você terá:

- ✅ **products** - Produtos do inventário
- ✅ **customers** - Clientes
- ✅ **companies** - Empresas
- ✅ **customer_products** - Associações cliente-produto
- ✅ **accessories** - Acessórios
- ✅ **customer_accessories** - Associações cliente-acessório
- ✅ **maintenance_items** - Itens em manutenção

## 🎯 **Próximos Passos**

Após a integração funcionar:

1. **Teste todas as funcionalidades**:
   - Adicionar/editar produtos
   - Gerenciar clientes
   - Associar produtos a clientes
   - Sistema de manutenção

2. **Personalize conforme necessário**:
   - Ajuste as políticas de segurança no Supabase
   - Configure backups automáticos
   - Adicione mais campos se necessário

3. **Deploy (opcional)**:
   - Vercel, Netlify, ou similar
   - Configure as variáveis de ambiente no serviço

## 📞 **Suporte**

Se encontrar problemas:
1. Verifique o console do navegador (F12)
2. Confirme se todas as etapas foram seguidas
3. Verifique se o Supabase está funcionando

---

**🎉 Após seguir todos os passos, sua aplicação estará integrada ao Supabase!**
