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
2. Name the repository (e.g., `financeiro-bot`), set it to **Private**.
3. Click **Create repository**.
4. Click **uploading an existing file**.
5. Drag and drop the 3 files: `index.js`, `package.json`, `README.md`.
6. Click **Commit changes**.

#### Step 3 — Render
1. Go to https://render.com → **New → Web Service**.
2. Connect the GitHub repository.
3. Configure:
   - **Environment:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `node index.js`
   - **Plan:** Free
4. In **Environment Variables**, add:

| Variable | Value |
|----------|-------|
| `TELEGRAM_TOKEN` | Token from BotFather |
| `GEMINI_API_KEY` | Your Gemini API Key |
| `ID_PLANILHA` | Google Sheets ID |
| `GOOGLE_CREDS` | Full JSON content from the Service Account |

5. Click **Create Web Service**.

#### Step 4 — Remove old Apps Script Webhook
Paste in your browser:
```text
[https://api.telegram.org/bot](https://api.telegram.org/bot)<YOUR_TOKEN>/deleteWebhook
