# DB Sistemas - Painel de Monitoramento

Este é um projeto de painel de controle para monitorar o status (Online/Offline) de múltiplos sistemas ou sites. Ele usa **Supabase** como backend para autenticação, banco de dados e funções agendadas (Edge Functions).

## Funcionalidades

* **Autenticação:** Sistema de Login e Cadastro de usuários.
* **CRUD de Sites:** Usuários podem Adicionar, Editar e Excluir os sites que cadastram.
* **Segurança:** Cada usuário só pode ver e gerenciar os *seus próprios* sites, graças ao Row Level Security (RLS) do Supabase.
* **Monitoramento Real:** Um status "Online/Offline" real, verificado automaticamente a cada 10 minutos por uma Supabase Edge Function.
* **Dashboard:** Estatísticas em tempo real de quantos sistemas estão online ou offline.

## Configuração do Backend (Supabase)

Para este projeto funcionar, você precisa configurar o backend no Supabase.

### 1. SQL Setup (Tabela e RLS)

Vá para o **SQL Editor** no seu painel Supabase e rode o script `setup.sql` (fornecido neste projeto). Ele irá:
1.  Criar a tabela `sites` com as colunas corretas (incluindo `user_id`).
2.  Ativar o Row Level Security (RLS) na tabela.
3.  Criar as políticas de segurança que garantem que usuários só acessem seus próprios dados.

### 2. Autenticação

1.  Vá para a seção **Authentication** no Supabase.
2.  Em **Providers**, habilite o provedor **Email**.
3.  (Opcional, mas recomendado) Desative a opção "Confirm email" para testes. Para produção, configure um serviço SMTP para envio de emails de confirmação.

### 3. Edge Function (Monitoramento)

1.  Instale o Supabase CLI: `npm install -g supabase`
2.  Faça login: `supabase login`
3.  Vincule seu projeto: `supabase link --project-ref SEU_PROJECT_ID`
4.  Crie a função: `supabase functions new check-status`
5.  Copie o código de `supabase/functions/check-status/index.ts` (fornecido neste projeto) para o arquivo que você acabou de criar.
6.  Faça o deploy da função: `supabase functions deploy check-status`
7.  No painel do Supabase, vá para **Database** > **Functions**.
8.  Agende a função `check-status` para rodar na frequência desejada (ex: `*/10 * * * *` para rodar a cada 10 minutos).

## Variáveis de Ambiente (Frontend)

Copie suas chaves do Supabase (URL e `anon` key) do painel **Project Settings** > **API** para o arquivo `config.js`.

```javascript
// config.js
const SUPABASE_URL = 'https://SEU_PROJETO.supabase.co';
const SUPABASE_KEY = 'SUA_CHAVE_ANON_PUBLICA';