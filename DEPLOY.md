# Deploy no Vercel - Click Storage

## 🚀 Configuração para Deploy

### 1. Preparação do Repositório

Certifique-se de que os seguintes arquivos estão no repositório:
- ✅ `env.example` (arquivo de exemplo)
- ✅ `vercel.json` (configuração simplificada)
- ✅ `.gitignore` (ignora arquivos de ambiente)

### 2. Configuração no Vercel

1. **Acesse o Vercel Dashboard**: [vercel.com/dashboard](https://vercel.com/dashboard)

2. **Importe o projeto**:
   - Clique em "New Project"
   - Conecte seu repositório GitHub
   - Selecione o repositório `click-storage`

3. **Configure as variáveis de ambiente**:
   - Vá em "Settings" → "Environment Variables"
   - Adicione as seguintes variáveis:

   ```
   VITE_REMOTE_SYNC = true
   VITE_SUPABASE_URL = https://rycggxatgnecazzbdykg.supabase.co
   VITE_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ5Y2dneGF0Z25lY2F6emJkeWtnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA0Mzc3NTQsImV4cCI6MjA3NjAxMzc1NH0.K_eZQb9_67Glv4I287d5qoYqjo1HHbIsBq8ou6EobyE
   ```

4. **Deploy**:
   - Clique em "Deploy"
   - Aguarde o build completar

### 3. Verificação Pós-Deploy

Após o deploy, verifique:
- ✅ Site carrega sem erros
- ✅ Conexão com Supabase funciona
- ✅ Dados são salvos/carregados corretamente

### 4. Troubleshooting

**Erro de Rollup/Build**:
- ✅ Configuração simplificada do Vite
- ✅ Arquivos de teste removidos
- ✅ Build testado localmente

**Erro de variáveis de ambiente**:
- Verifique se todas as variáveis estão configuradas no Vercel
- Certifique-se de que os nomes estão corretos (com prefixo `VITE_`)

**Erro de conexão Supabase**:
- Verifique se a URL e chave estão corretas
- Teste a conexão localmente primeiro

### 5. Comandos Úteis

```bash
# Testar build localmente
npm run build

# Verificar se o build funciona
npm run preview

# Verificar variáveis de ambiente
npm run dev
```

## 📝 Notas Importantes

- O arquivo `teste.env` NÃO deve ser enviado para o repositório
- Use apenas as variáveis de ambiente configuradas no Vercel
- O arquivo `env.example` serve como referência para outros desenvolvedores
- Configuração do Vite simplificada para evitar erros de build
