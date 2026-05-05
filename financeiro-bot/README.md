# Bot Financeiro — Deploy no Render

## Passo 1 — Google Service Account
1. Acesse https://console.cloud.google.com
2. Ative a API **Google Sheets API**
3. Vá em **IAM & Admin → Service Accounts → Create Service Account**
4. Dê um nome (ex: "bot-financeiro") e clique em Criar
5. Na aba **Keys → Add Key → Create new key → JSON** — baixe o arquivo
6. Abra sua planilha do Google Sheets
7. Clique em **Compartilhar** e adicione o e-mail da Service Account com permissão de **Editor**

## Passo 2 — GitHub
1. Acesse https://github.com/new
2. Nome: `financeiro-bot`, deixe **Private**
3. Clique em **Create repository**
4. Clique em **uploading an existing file**
5. Arraste os 3 arquivos: `index.js`, `package.json`, `README.md`
6. Clique em **Commit changes**

## Passo 3 — Render
1. Acesse https://render.com → **New → Web Service**
2. Conecte o repositório `financeiro-bot`
3. Configure:
   - **Environment:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `node index.js`
   - **Plan:** Free
4. Em **Environment Variables**, adicione:

| Variável | Valor |
|----------|-------|
| `TELEGRAM_TOKEN` | Token do BotFather |
| `GEMINI_API_KEY` | Sua chave Gemini |
| `ID_PLANILHA` | ID da planilha Google Sheets |
| `GOOGLE_CREDS` | Conteúdo JSON completo da Service Account |

5. Clique em **Create Web Service**

## Passo 4 — Remover webhook antigo do Apps Script
Cole no navegador:
```
https://api.telegram.org/bot<SEU_TOKEN>/deleteWebhook
```

## Pronto!
O bot roda 24/7 processando todas as mensagens sem perder nenhuma.
