# 📊 Expense Tracker Bot / Bot Assistente Financeiro

[![en](https://img.shields.io/badge/lang-en-red.svg)](#english) 
[![pt-br](https://img.shields.io/badge/lang-pt--br-green.svg)](#português)

---

## 🇺🇸 English

An intelligent financial assistant built to automate expense tracking. By simply sending receipt photos or text inputs via Telegram, the bot uses AI to process the information and automatically logs the categorized expenses into a Google Spreadsheet.

### ✨ Features
* **Telegram Integration:** Easy and accessible user interface directly through the Telegram app.
* **AI Processing:** Automatically extracts and categorizes data using the Gemini API.
* **Google Sheets Automation:** Seamlessly connects with Google Sheets via Service Accounts to organize expenses.
* **Cloud Deployment:** Configured for 24/7 execution on Render.

### 🛠️ Tech Stack
* **Backend:** Node.js 
* **Integrations:** Google Sheets API (Google Cloud Service Account)
* **Bot Framework:** Telegram Bot API
* **AI:** Google Gemini API
* **Hosting:** Render

### 🚀 Deployment Guide

#### Step 1 — Google Service Account
1. Go to https://console.cloud.google.com
2. Enable the **Google Sheets API**.
3. Go to **IAM & Admin → Service Accounts → Create Service Account**.
4. Give it a name (e.g., "finance-bot") and click **Create**.
5. In the **Keys** tab → **Add Key → Create new key → JSON** — download the file.
6. Open your Google Spreadsheet.
7. Click **Share** and add the Service Account email with **Editor** permissions.

#### Step 2 — GitHub
1. Go to https://github.com/new
2. Name the repository (e.g., `expense-tracker-bot`), set it to **Private**.
3. Click **Create repository**.
4. Click **uploading an existing file**.
5. Drag and drop the files.
6. Click **Commit changes**.

#### Step 3 — Render
1. Go to https://render.com → **New → Web Service**.
2. Connect the GitHub repository.
3. Configure:
   - **Environment:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `node index.js`
   - **Plan:** Free
4. In **Environment Variables**, add: `TELEGRAM_TOKEN`, `GEMINI_API_KEY`, `ID_PLANILHA`, `GOOGLE_CREDS`.

---

## 🇧🇷 Português

<a name="português"></a>
Um assistente financeiro inteligente criado para automatizar o controle de despesas. Ao enviar fotos de recibos ou mensagens de texto pelo Telegram, o bot utiliza Inteligência Artificial para processar as informações e registrar automaticamente os gastos categorizados em uma planilha do Google.

### ✨ Funcionalidades
* **Integração com Telegram:** Interface de usuário fácil e acessível diretamente pelo aplicativo.
* **Processamento com IA:** Extrai e categoriza automaticamente os dados usando a API do Gemini.
* **Automação com Google Sheets:** Conexão robusta via Service Account para organizar as despesas.
* **Deploy na Nuvem:** Configurado para rodar 24/7 no Render.

### 🛠️ Tecnologias Utilizadas
* **Backend:** Node.js
* **Integrações:** Google Sheets API (Conta de Serviço do Google Cloud)
* **Bot Framework:** Telegram Bot API
* **IA:** Google Gemini API
* **Hospedagem:** Render

### 🚀 Guia de Deploy (Instalação)

#### Passo 1 — Google Service Account
1. Acesse https://console.cloud.google.com
2. Ative a API **Google Sheets API**.
3. Vá em **IAM & Admin → Service Accounts → Create Service Account**.
4. Dê um nome (ex: "bot-financeiro") e clique em **Criar**.
5. Na aba **Keys → Add Key → Create new key → JSON** — baixe o arquivo.
6. Abra sua planilha do Google Sheets.
7. Clique em **Compartilhar** e adicione o e-mail da Service Account com permissão de **Editor**.

#### Passo 2 — GitHub
1. Acesse https://github.com/new
2. Nome: `expense-tracker-bot`, deixe **Private** (Privado).
3. Clique em **Create repository**.
4. Clique em **uploading an existing file**.
5. Arraste seus arquivos.
6. Clique em **Commit changes**.

#### Passo 3 — Render
1. Acesse https://render.com → **New → Web Service**.
2. Conecte o repositório do GitHub.
3. Configure:
   - **Environment:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `node index.js`
   - **Plan:** Free
4. Em **Environment Variables**, adicione as chaves: `TELEGRAM_TOKEN`, `GEMINI_API_KEY`, `ID_PLANILHA`, `GOOGLE_CREDS`.

#### Passo 4 — Remover webhook antigo
Cole no navegador: `https://api.telegram.org/bot<SEU_TOKEN>/deleteWebhook`

---
*Desenvolvido por [Guilherme](https://github.com/guilherme12121)*
