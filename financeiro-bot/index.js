// ============================================================
//  CONTROLE FINANCEIRO — Node.js + Polling + Anti-hibernação
// ============================================================

const TelegramBot    = require("node-telegram-bot-api");
const { GoogleAuth } = require("google-auth-library");
const { google }     = require("googleapis");
const fetch          = require("node-fetch");
const http           = require("http");

const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const ID_PLANILHA    = process.env.ID_PLANILHA;
const GOOGLE_CREDS   = process.env.GOOGLE_CREDS;

if (!TELEGRAM_TOKEN || !GEMINI_API_KEY || !ID_PLANILHA || !GOOGLE_CREDS) {
  console.error("❌ Variáveis de ambiente faltando.");
  process.exit(1);
}

// ── Servidor HTTP — mantém o Render acordado ─────────────────
const PORT = process.env.PORT || 3000;
const server = http.createServer((req, res) => {
  res.writeHead(200);
  res.end("OK");
});
server.listen(PORT, () => console.log(`🌐 Servidor HTTP na porta ${PORT}`));

// ── Auto-ping a cada 10 minutos para não hibernar ────────────
// O Render gratuito hiberna após 15min sem requisição HTTP.
// Este ping interno mantém o servidor ativo.
const RENDER_URL = process.env.RENDER_EXTERNAL_URL || `http://localhost:${PORT}`;
setInterval(() => {
  fetch(RENDER_URL).catch(() => {});
}, 10 * 60 * 1000);

// ── Autenticação Google Sheets ───────────────────────────────
const credentials = JSON.parse(GOOGLE_CREDS);
const auth = new GoogleAuth({
  credentials,
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});
const sheets = google.sheets({ version: "v4", auth });

// ── Bot Telegram com polling ─────────────────────────────────
const bot = new TelegramBot(TELEGRAM_TOKEN, { polling: true });
console.log("✅ Bot iniciado.");

const MAPA_CATEGORIAS = {
  "salario":        { cat: "Salário",      tipo: "Entrada" },
  "renda":          { cat: "Salário",      tipo: "Entrada" },
  "freelance":      { cat: "Salário",      tipo: "Entrada" },
  "entrada":        { cat: "Salário",      tipo: "Entrada" },
  "mercado":        { cat: "Mercado",      tipo: "Saída" },
  "supermercado":   { cat: "Mercado",      tipo: "Saída" },
  "hortifruti":     { cat: "Mercado",      tipo: "Saída" },
  "feira":          { cat: "Mercado",      tipo: "Saída" },
  "padaria":        { cat: "Mercado",      tipo: "Saída" },
  "panificadora":   { cat: "Mercado",      tipo: "Saída" },
  "mercearia":      { cat: "Mercado",      tipo: "Saída" },
  "acougue":        { cat: "Mercado",      tipo: "Saída" },
  "carrefour":      { cat: "Mercado",      tipo: "Saída" },
  "assai":          { cat: "Mercado",      tipo: "Saída" },
  "extra":          { cat: "Mercado",      tipo: "Saída" },
  "atacadao":       { cat: "Mercado",      tipo: "Saída" },
  "farmacia":       { cat: "Farmácia",     tipo: "Saída" },
  "drogaria":       { cat: "Farmácia",     tipo: "Saída" },
  "drogasil":       { cat: "Farmácia",     tipo: "Saída" },
  "droga raia":     { cat: "Farmácia",     tipo: "Saída" },
  "ultrafarma":     { cat: "Farmácia",     tipo: "Saída" },
  "pague menos":    { cat: "Farmácia",     tipo: "Saída" },
  "remedio":        { cat: "Farmácia",     tipo: "Saída" },
  "consulta":       { cat: "Farmácia",     tipo: "Saída" },
  "medico":         { cat: "Farmácia",     tipo: "Saída" },
  "clinica":        { cat: "Farmácia",     tipo: "Saída" },
  "hospital":       { cat: "Farmácia",     tipo: "Saída" },
  "exame":          { cat: "Farmácia",     tipo: "Saída" },
  "saude":          { cat: "Farmácia",     tipo: "Saída" },
  "unimed":         { cat: "Farmácia",     tipo: "Saída" },
  "academia":       { cat: "Farmácia",     tipo: "Saída" },
  "smartfit":       { cat: "Farmácia",     tipo: "Saída" },
  "transporte":     { cat: "Transporte",   tipo: "Saída" },
  "combustivel":    { cat: "Transporte",   tipo: "Saída" },
  "gasolina":       { cat: "Transporte",   tipo: "Saída" },
  "posto":          { cat: "Transporte",   tipo: "Saída" },
  "uber":           { cat: "Transporte",   tipo: "Saída" },
  "cabify":         { cat: "Transporte",   tipo: "Saída" },
  "taxi":           { cat: "Transporte",   tipo: "Saída" },
  "onibus":         { cat: "Transporte",   tipo: "Saída" },
  "metro":          { cat: "Transporte",   tipo: "Saída" },
  "pedagio":        { cat: "Transporte",   tipo: "Saída" },
  "estacionamento": { cat: "Transporte",   tipo: "Saída" },
  "mecanica":       { cat: "Transporte",   tipo: "Saída" },
  "oficina":        { cat: "Transporte",   tipo: "Saída" },
  "ipva":           { cat: "Transporte",   tipo: "Saída" },
  "pneu":           { cat: "Transporte",   tipo: "Saída" },
  "99":             { cat: "Transporte",   tipo: "Saída" },
  "restaurante":    { cat: "Restaurante",  tipo: "Saída" },
  "lanchonete":     { cat: "Restaurante",  tipo: "Saída" },
  "hamburger":      { cat: "Restaurante",  tipo: "Saída" },
  "pizza":          { cat: "Restaurante",  tipo: "Saída" },
  "sushi":          { cat: "Restaurante",  tipo: "Saída" },
  "churrasco":      { cat: "Restaurante",  tipo: "Saída" },
  "cafe":           { cat: "Restaurante",  tipo: "Saída" },
  "ifood":          { cat: "Restaurante",  tipo: "Saída" },
  "rappi":          { cat: "Restaurante",  tipo: "Saída" },
  "delivery":       { cat: "Restaurante",  tipo: "Saída" },
  "mcdonald":       { cat: "Restaurante",  tipo: "Saída" },
  "burger king":    { cat: "Restaurante",  tipo: "Saída" },
  "subway":         { cat: "Restaurante",  tipo: "Saída" },
  "outback":        { cat: "Restaurante",  tipo: "Saída" },
  "almoco":         { cat: "Restaurante",  tipo: "Saída" },
  "jantar":         { cat: "Restaurante",  tipo: "Saída" },
  "lanche":         { cat: "Restaurante",  tipo: "Saída" },
  "comida":         { cat: "Restaurante",  tipo: "Saída" },
  "lazer":          { cat: "Lazer",        tipo: "Saída" },
  "cinema":         { cat: "Lazer",        tipo: "Saída" },
  "teatro":         { cat: "Lazer",        tipo: "Saída" },
  "show":           { cat: "Lazer",        tipo: "Saída" },
  "ingresso":       { cat: "Lazer",        tipo: "Saída" },
  "balada":         { cat: "Lazer",        tipo: "Saída" },
  "festa":          { cat: "Lazer",        tipo: "Saída" },
  "viagem":         { cat: "Lazer",        tipo: "Saída" },
  "hotel":          { cat: "Lazer",        tipo: "Saída" },
  "airbnb":         { cat: "Lazer",        tipo: "Saída" },
  "passagem":       { cat: "Lazer",        tipo: "Saída" },
  "steam":          { cat: "Lazer",        tipo: "Saída" },
  "roupa":          { cat: "Lazer",        tipo: "Saída" },
  "calcado":        { cat: "Lazer",        tipo: "Saída" },
  "tenis":          { cat: "Lazer",        tipo: "Saída" },
  "renner":         { cat: "Lazer",        tipo: "Saída" },
  "riachuelo":      { cat: "Lazer",        tipo: "Saída" },
  "zara":           { cat: "Lazer",        tipo: "Saída" },
  "cea":            { cat: "Lazer",        tipo: "Saída" },
  "jogo":           { cat: "Lazer",        tipo: "Saída" },
  "assinatura":     { cat: "Assinatura",   tipo: "Saída" },
  "netflix":        { cat: "Assinatura",   tipo: "Saída" },
  "spotify":        { cat: "Assinatura",   tipo: "Saída" },
  "amazon prime":   { cat: "Assinatura",   tipo: "Saída" },
  "disney":         { cat: "Assinatura",   tipo: "Saída" },
  "hbo":            { cat: "Assinatura",   tipo: "Saída" },
  "youtube":        { cat: "Assinatura",   tipo: "Saída" },
  "globoplay":      { cat: "Assinatura",   tipo: "Saída" },
  "apple":          { cat: "Assinatura",   tipo: "Saída" },
  "icloud":         { cat: "Assinatura",   tipo: "Saída" },
  "internet":       { cat: "Assinatura",   tipo: "Saída" },
  "telefone":       { cat: "Assinatura",   tipo: "Saída" },
  "celular":        { cat: "Assinatura",   tipo: "Saída" },
  "tim":            { cat: "Assinatura",   tipo: "Saída" },
  "claro":          { cat: "Assinatura",   tipo: "Saída" },
  "vivo":           { cat: "Assinatura",   tipo: "Saída" },
  "energia":        { cat: "Assinatura",   tipo: "Saída" },
  "agua":           { cat: "Assinatura",   tipo: "Saída" },
  "gas":            { cat: "Assinatura",   tipo: "Saída" },
  "aluguel":        { cat: "Assinatura",   tipo: "Saída" },
  "condominio":     { cat: "Assinatura",   tipo: "Saída" },
  "iptu":           { cat: "Assinatura",   tipo: "Saída" },
  "mensalidade":    { cat: "Assinatura",   tipo: "Saída" },
  "seguro":         { cat: "Assinatura",   tipo: "Saída" },
  "invest":         { cat: "Investimento", tipo: "Saída" },
  "poupanca":       { cat: "Investimento", tipo: "Saída" },
  "cdb":            { cat: "Investimento", tipo: "Saída" },
  "tesouro":        { cat: "Investimento", tipo: "Saída" },
  "acoes":          { cat: "Investimento", tipo: "Saída" },
  "cripto":         { cat: "Investimento", tipo: "Saída" },
  "bitcoin":        { cat: "Investimento", tipo: "Saída" },
  "shopee":         { cat: "Outros",       tipo: "Saída" },
  "mercado livre":  { cat: "Outros",       tipo: "Saída" },
  "americanas":     { cat: "Outros",       tipo: "Saída" },
  "magalu":         { cat: "Outros",       tipo: "Saída" },
  "casas bahia":    { cat: "Outros",       tipo: "Saída" },
  "aliexpress":     { cat: "Outros",       tipo: "Saída" },
  "shein":          { cat: "Outros",       tipo: "Saída" },
  "kabum":          { cat: "Outros",       tipo: "Saída" },
  "loja":           { cat: "Outros",       tipo: "Saída" },
  "variavel":       { cat: "Outros",       tipo: "Saída" },
  "outros":         { cat: "Outros",       tipo: "Saída" },
};

const NOMES_MESES = [
  "Janeiro","Fevereiro","Março","Abril","Maio","Junho",
  "Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"
];

function getNomeMesAtual() {
  const d = new Date();
  d.setHours(d.getHours() - 3);
  return NOMES_MESES[d.getMonth()];
}

function getDataAtual() {
  const d = new Date();
  d.setHours(d.getHours() - 3);
  return `${String(d.getDate()).padStart(2,"0")}/${String(d.getMonth()+1).padStart(2,"0")}/${d.getFullYear()}`;
}

function semAcentos(str) {
  return str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function resolverCategoria(inputCat) {
  const norm = semAcentos(inputCat);
  for (const chave in MAPA_CATEGORIAS) {
    if (norm.includes(chave)) return MAPA_CATEGORIAS[chave];
  }
  return { cat: "Outros", tipo: "Saída" };
}

function parseValor(valorStr) {
  const limpo = valorStr
    .replace(/[^\d.,]/g, "")
    .replace(/\.(?=\d{3}(?:[,]|$))/g, "")
    .replace(",", ".");
  const v = parseFloat(limpo);
  return isNaN(v) || v <= 0 ? null : v;
}

// ── Detecta parcelamento: "2x de 65,76" → retorna parcela ────
// Suporta: "2x65", "2x 65", "2x de 65", "2x de 65,76"
function detectarParcela(texto) {
  const match = texto.match(/(\d+)\s*[xX]\s*(?:de\s*)?([\d.,]+)/);
  if (!match) return null;
  const parcelas = parseInt(match[1]);
  const valor    = parseValor(match[2]);
  if (!valor || parcelas < 2) return null;
  return { parcelas, valorParcela: valor, valorTotal: valor * parcelas };
}

// ── Google Sheets ────────────────────────────────────────────
async function garantirAba(nomeMes) {
  const meta   = await sheets.spreadsheets.get({ spreadsheetId: ID_PLANILHA });
  const existe = meta.data.sheets.some(s => s.properties.title === nomeMes);
  if (!existe) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: ID_PLANILHA,
      requestBody: { requests: [{ addSheet: { properties: { title: nomeMes } } }] }
    });
    await sheets.spreadsheets.values.update({
      spreadsheetId: ID_PLANILHA,
      range: `${nomeMes}!A1:F1`,
      valueInputOption: "RAW",
      requestBody: { values: [["Data","Categoria","Item","Valor","Tipo","Obs"]] }
    });
  }
}

async function proximaLinhaVazia(nomeMes) {
  const res  = await sheets.spreadsheets.values.get({
    spreadsheetId: ID_PLANILHA,
    range: `${nomeMes}!A2:A500`,
  });
  const rows = res.data.values || [];
  const idx  = rows.findIndex(r => !r[0] || r[0].trim() === "");
  return idx === -1 ? -1 : idx + 2;
}

async function gravarLinha(nomeMes, linha, valores) {
  await sheets.spreadsheets.values.update({
    spreadsheetId: ID_PLANILHA,
    range: `${nomeMes}!A${linha}:F${linha}`,
    valueInputOption: "USER_ENTERED",
    requestBody: { values: [valores] }
  });
}

// ── Gemini ───────────────────────────────────────────────────
async function processarImagemComGemini(fileId) {
  const fileRes  = await fetch(
    `https://api.telegram.org/bot${TELEGRAM_TOKEN}/getFile?file_id=${fileId}`,
    { timeout: 10000 }
  );
  const fileJson = await fileRes.json();
  if (!fileJson.ok) throw new Error("Arquivo não encontrado no Telegram.");

  const imgUrl = `https://api.telegram.org/file/bot${TELEGRAM_TOKEN}/${fileJson.result.file_path}`;
  const imgRes = await fetch(imgUrl, { timeout: 15000 });
  if (!imgRes.ok) throw new Error(`Erro ao baixar imagem: ${imgRes.status}`);

  const imgBuf = await imgRes.buffer();
  const base64 = imgBuf.toString("base64");

  const body = {
    contents: [{ parts: [
      { text:
        "Você é um extrator de comprovantes financeiros.\n" +
        "Leia esta imagem e responda APENAS com uma linha neste formato exato:\n" +
        "CATEGORIA|ESTABELECIMENTO|VALOR\n\n" +
        "Use PIPE (|) como separador.\n" +
        "Categorias aceitas: Salario, Mercado, Farmacia, Transporte, Restaurante, Lazer, Assinatura, Invest, Outros\n" +
        "Valor: use PONTO como decimal (ex: 2.84). Nunca use virgula no valor.\n" +
        "Sem R$, sem texto extra, sem explicação, sem quebra de linha.\n\n" +
        "Exemplos de resposta correta:\n" +
        "Outros|Shopee|2.84\n" +
        "Transporte|Uber|22.50\n" +
        "Mercado|Hiperideal|12.78\n" +
        "Restaurante|iFood|29.37\n\n" +
        "Se for notificação de banco, extraia o estabelecimento e o valor da mensagem."
      },
      { inline_data: { mime_type: "image/jpeg", data: base64 } }
    ]}],
    generationConfig: {
      temperature: 0,
      maxOutputTokens: 100,
      thinkingConfig: { thinkingBudget: 0 }
    }
  };

  const res  = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
    { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body), timeout: 30000 }
  );
  const json = await res.json();
  if (json.error) throw new Error("Gemini: " + json.error.message);
  if (!json.candidates?.[0]?.content) throw new Error("Gemini retornou vazio.");

  const texto = json.candidates[0].content.parts[0].text.trim();
  console.log("Gemini imagem retornou:", texto);

  // Converte pipe para vírgula se necessário
  return texto.includes("|") ? texto.replace(/\|/g, ",") : texto;
}

// ── Handler de mensagens ─────────────────────────────────────
bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  try {
    let textoFinal = "";
    const ehImagem = msg.photo || msg.document;

    if (ehImagem) {
      await bot.sendMessage(chatId, "⏳ Lendo imagem...");
      const fileId = msg.photo
        ? msg.photo[msg.photo.length - 1].file_id
        : msg.document.file_id;
      textoFinal = await processarImagemComGemini(fileId);
    } else if (msg.text) {
      textoFinal = msg.text.trim();
      if (textoFinal.startsWith("/")) {
        await bot.sendMessage(chatId,
          "ℹ️ Formato:\nCategoria, Item, Valor\n\nEx: Mercado, Padaria, 35.90\n" +
          "Parcelado: Loja, Renner, 2x de 65.76\n\n" +
          "Ou envie foto do comprovante."
        );
        return;
      }
    }

    if (!textoFinal) return;
    textoFinal = textoFinal.replace(/\r?\n/g, " ").replace(/\s{2,}/g, " ").trim();
    console.log("Processando:", textoFinal);

    // ── Detecta parcelamento no texto ───────────────────────
    const parcelamento = detectarParcela(textoFinal);
    if (parcelamento) {
      // Extrai categoria e item (antes do Nx)
      const semParcela = textoFinal.replace(/\d+\s*[xX]\s*(?:de\s*)?[\d.,]+/, "").replace(/,\s*,/g, ",").trim().replace(/,\s*$/, "");
      const partesBase = semParcela.split(",");
      if (partesBase.length >= 2) {
        const inputCat  = partesBase[0].trim();
        const item      = partesBase[1].trim();
        const { cat: categoria, tipo } = resolverCategoria(inputCat);
        const nomeMes   = getNomeMesAtual();
        const dataStr   = getDataAtual();
        const obs       = `${parcelamento.parcelas}x de R$ ${parcelamento.valorParcela.toFixed(2).replace(".",",")}`;

        await garantirAba(nomeMes);
        const linha = await proximaLinhaVazia(nomeMes);
        if (linha === -1) {
          await bot.sendMessage(chatId, `❌ Planilha de ${nomeMes} cheia!`);
          return;
        }
        await gravarLinha(nomeMes, linha, [dataStr, categoria, item, parcelamento.valorParcela, tipo, obs]);
        await bot.sendMessage(chatId,
          `💸 Lançado!\n\n` +
          `📁 ${categoria} › ${item}\n` +
          `💵 R$ ${parcelamento.valorParcela.toFixed(2).replace(".",",")} (parcela 1/${parcelamento.parcelas})\n` +
          `💳 Total: R$ ${parcelamento.valorTotal.toFixed(2).replace(".",",")}\n` +
          `📅 ${dataStr} (${nomeMes})`
        );
        return;
      }
    }

    // ── Parse normal ─────────────────────────────────────────
    const partes = textoFinal.split(",");
    if (partes.length < 3) {
      await bot.sendMessage(chatId,
        `⚠️ Formato inválido: "${textoFinal}"\n\nUse: Categoria, Item, Valor\nEx: Mercado, Padaria, 35.90\nParcelado: Loja, Renner, 2x de 65.76`
      );
      return;
    }

    const inputCat = partes[0].trim();
    const item     = partes[1].trim();
    const valorStr = partes.slice(2).join(",").trim();
    const valor    = parseValor(valorStr);

    if (!valor) {
      await bot.sendMessage(chatId, `❌ Valor inválido: "${valorStr}"\nEx: 35.90 · 35,90 · 1.234,56`);
      return;
    }

    const { cat: categoria, tipo } = resolverCategoria(inputCat);
    const nomeMes = getNomeMesAtual();
    const dataStr = getDataAtual();

    await garantirAba(nomeMes);
    const linha = await proximaLinhaVazia(nomeMes);
    if (linha === -1) {
      await bot.sendMessage(chatId, `❌ Planilha de ${nomeMes} cheia! Adicione mais linhas.`);
      return;
    }

    await gravarLinha(nomeMes, linha, [dataStr, categoria, item, valor, tipo, ""]);
    await bot.sendMessage(chatId,
      `${tipo === "Entrada" ? "💰" : "💸"} Lançado!\n\n` +
      `📁 ${categoria} › ${item}\n` +
      `💵 R$ ${valor.toFixed(2).replace(".", ",")}\n` +
      `📅 ${dataStr} (${nomeMes})`
    );

  } catch (err) {
    console.error("ERRO:", err.message);
    try { await bot.sendMessage(chatId, "🚨 Erro: " + err.message); } catch(e) {}
  }
});

bot.on("polling_error", (err) => console.error("Polling error:", err.message));
