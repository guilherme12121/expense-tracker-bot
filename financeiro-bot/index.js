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

// ── Servidor HTTP ────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
const server = http.createServer((req, res) => {
  res.writeHead(200);
  res.end("OK");
});
server.listen(PORT, () => console.log(`🌐 Servidor HTTP na porta ${PORT}`));

// ── Auto-ping a cada 10 minutos ──────────────────────────────
const RENDER_URL = process.env.RENDER_EXTERNAL_URL || `http://localhost:${PORT}`;
setInterval(() => { fetch(RENDER_URL).catch(() => {}); }, 10 * 60 * 1000);

// ── Autenticação Google Sheets ───────────────────────────────
const credentials = JSON.parse(GOOGLE_CREDS);
const auth = new GoogleAuth({
  credentials,
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});
const sheets = google.sheets({ version: "v4", auth });

// ── Bot Telegram ─────────────────────────────────────────────
const bot = new TelegramBot(TELEGRAM_TOKEN, { polling: true });
console.log("✅ Bot iniciado.");

// ── Mapa de categorias expandido ────────────────────────────
const MAPA_CATEGORIAS = {
  // ENTRADAS
  "salario":          { cat: "Salário",        tipo: "Entrada" },
  "renda":            { cat: "Salário",        tipo: "Entrada" },
  "freelance":        { cat: "Salário",        tipo: "Entrada" },
  "entrada":          { cat: "Salário",        tipo: "Entrada" },
  "pix recebido":     { cat: "Salário",        tipo: "Entrada" },
  "transferencia recebida": { cat: "Salário",  tipo: "Entrada" },
  // MERCADO
  "mercado":          { cat: "Mercado",        tipo: "Saída" },
  "supermercado":     { cat: "Mercado",        tipo: "Saída" },
  "hortifruti":       { cat: "Mercado",        tipo: "Saída" },
  "feira":            { cat: "Mercado",        tipo: "Saída" },
  "padaria":          { cat: "Mercado",        tipo: "Saída" },
  "panificadora":     { cat: "Mercado",        tipo: "Saída" },
  "mercearia":        { cat: "Mercado",        tipo: "Saída" },
  "acougue":          { cat: "Mercado",        tipo: "Saída" },
  "peixaria":         { cat: "Mercado",        tipo: "Saída" },
  "carrefour":        { cat: "Mercado",        tipo: "Saída" },
  "assai":            { cat: "Mercado",        tipo: "Saída" },
  "extra":            { cat: "Mercado",        tipo: "Saída" },
  "atacadao":         { cat: "Mercado",        tipo: "Saída" },
  "hiperideal":       { cat: "Mercado",        tipo: "Saída" },
  "walmart":          { cat: "Mercado",        tipo: "Saída" },
  "bistek":           { cat: "Mercado",        tipo: "Saída" },
  "prezunic":         { cat: "Mercado",        tipo: "Saída" },
  "guanabara":        { cat: "Mercado",        tipo: "Saída" },
  // FARMÁCIA / SAÚDE
  "farmacia":         { cat: "Farmácia",       tipo: "Saída" },
  "drogaria":         { cat: "Farmácia",       tipo: "Saída" },
  "drogasil":         { cat: "Farmácia",       tipo: "Saída" },
  "droga raia":       { cat: "Farmácia",       tipo: "Saída" },
  "ultrafarma":       { cat: "Farmácia",       tipo: "Saída" },
  "pague menos":      { cat: "Farmácia",       tipo: "Saída" },
  "pacheco":          { cat: "Farmácia",       tipo: "Saída" },
  "remedio":          { cat: "Farmácia",       tipo: "Saída" },
  "consulta":         { cat: "Farmácia",       tipo: "Saída" },
  "medico":           { cat: "Farmácia",       tipo: "Saída" },
  "clinica":          { cat: "Farmácia",       tipo: "Saída" },
  "hospital":         { cat: "Farmácia",       tipo: "Saída" },
  "exame":            { cat: "Farmácia",       tipo: "Saída" },
  "saude":            { cat: "Farmácia",       tipo: "Saída" },
  "unimed":           { cat: "Farmácia",       tipo: "Saída" },
  "hapvida":          { cat: "Farmácia",       tipo: "Saída" },
  "amil":             { cat: "Farmácia",       tipo: "Saída" },
  "academia":         { cat: "Farmácia",       tipo: "Saída" },
  "smartfit":         { cat: "Farmácia",       tipo: "Saída" },
  "plano de saude":   { cat: "Farmácia",       tipo: "Saída" },
  // TRANSPORTE
  "transporte":       { cat: "Transporte",     tipo: "Saída" },
  "combustivel":      { cat: "Transporte",     tipo: "Saída" },
  "gasolina":         { cat: "Transporte",     tipo: "Saída" },
  "alcool":           { cat: "Transporte",     tipo: "Saída" },
  "etanol":           { cat: "Transporte",     tipo: "Saída" },
  "diesel":           { cat: "Transporte",     tipo: "Saída" },
  "posto":            { cat: "Transporte",     tipo: "Saída" },
  "uber":             { cat: "Transporte",     tipo: "Saída" },
  "99":               { cat: "Transporte",     tipo: "Saída" },
  "cabify":           { cat: "Transporte",     tipo: "Saída" },
  "taxi":             { cat: "Transporte",     tipo: "Saída" },
  "onibus":           { cat: "Transporte",     tipo: "Saída" },
  "metro":            { cat: "Transporte",     tipo: "Saída" },
  "trem":             { cat: "Transporte",     tipo: "Saída" },
  "pedagio":          { cat: "Transporte",     tipo: "Saída" },
  "estacionamento":   { cat: "Transporte",     tipo: "Saída" },
  "mecanica":         { cat: "Transporte",     tipo: "Saída" },
  "oficina":          { cat: "Transporte",     tipo: "Saída" },
  "ipva":             { cat: "Transporte",     tipo: "Saída" },
  "pneu":             { cat: "Transporte",     tipo: "Saída" },
  "seguro auto":      { cat: "Transporte",     tipo: "Saída" },
  // RESTAURANTE
  "restaurante":      { cat: "Restaurante",    tipo: "Saída" },
  "lanchonete":       { cat: "Restaurante",    tipo: "Saída" },
  "hamburger":        { cat: "Restaurante",    tipo: "Saída" },
  "hamburguer":       { cat: "Restaurante",    tipo: "Saída" },
  "pizza":            { cat: "Restaurante",    tipo: "Saída" },
  "pizzaria":         { cat: "Restaurante",    tipo: "Saída" },
  "sushi":            { cat: "Restaurante",    tipo: "Saída" },
  "churrasco":        { cat: "Restaurante",    tipo: "Saída" },
  "churrascaria":     { cat: "Restaurante",    tipo: "Saída" },
  "cafe":             { cat: "Restaurante",    tipo: "Saída" },
  "cafeteria":        { cat: "Restaurante",    tipo: "Saída" },
  "ifood":            { cat: "Restaurante",    tipo: "Saída" },
  "rappi":            { cat: "Restaurante",    tipo: "Saída" },
  "delivery":         { cat: "Restaurante",    tipo: "Saída" },
  "mcdonald":         { cat: "Restaurante",    tipo: "Saída" },
  "mcdonalds":        { cat: "Restaurante",    tipo: "Saída" },
  "burger king":      { cat: "Restaurante",    tipo: "Saída" },
  "subway":           { cat: "Restaurante",    tipo: "Saída" },
  "outback":          { cat: "Restaurante",    tipo: "Saída" },
  "coco bambu":       { cat: "Restaurante",    tipo: "Saída" },
  "popeyes":          { cat: "Restaurante",    tipo: "Saída" },
  "kfc":              { cat: "Restaurante",    tipo: "Saída" },
  "giraffas":         { cat: "Restaurante",    tipo: "Saída" },
  "acaiteria":        { cat: "Restaurante",    tipo: "Saída" },
  "sorveteria":       { cat: "Restaurante",    tipo: "Saída" },
  "pastelaria":       { cat: "Restaurante",    tipo: "Saída" },
  "almoco":           { cat: "Restaurante",    tipo: "Saída" },
  "jantar":           { cat: "Restaurante",    tipo: "Saída" },
  "lanche":           { cat: "Restaurante",    tipo: "Saída" },
  "comida":           { cat: "Restaurante",    tipo: "Saída" },
  "99food":           { cat: "Restaurante",    tipo: "Saída" },
  "99 food":          { cat: "Restaurante",    tipo: "Saída" },
  // LAZER / ENTRETENIMENTO
  "lazer":            { cat: "Lazer",          tipo: "Saída" },
  "cinema":           { cat: "Lazer",          tipo: "Saída" },
  "teatro":           { cat: "Lazer",          tipo: "Saída" },
  "show":             { cat: "Lazer",          tipo: "Saída" },
  "evento":           { cat: "Lazer",          tipo: "Saída" },
  "ingresso":         { cat: "Lazer",          tipo: "Saída" },
  "balada":           { cat: "Lazer",          tipo: "Saída" },
  "festa":            { cat: "Lazer",          tipo: "Saída" },
  "parque":           { cat: "Lazer",          tipo: "Saída" },
  "viagem":           { cat: "Lazer",          tipo: "Saída" },
  "hotel":            { cat: "Lazer",          tipo: "Saída" },
  "pousada":          { cat: "Lazer",          tipo: "Saída" },
  "airbnb":           { cat: "Lazer",          tipo: "Saída" },
  "passagem":         { cat: "Lazer",          tipo: "Saída" },
  "voo":              { cat: "Lazer",          tipo: "Saída" },
  "steam":            { cat: "Lazer",          tipo: "Saída" },
  "playstation":      { cat: "Lazer",          tipo: "Saída" },
  "xbox":             { cat: "Lazer",          tipo: "Saída" },
  "nintendo":         { cat: "Lazer",          tipo: "Saída" },
  "jogo":             { cat: "Lazer",          tipo: "Saída" },
  "diversao":         { cat: "Lazer",          tipo: "Saída" },
  // PESSOAL / DESEJOS (roupas, acessórios, compras online)
  "pessoal":          { cat: "Pessoal",        tipo: "Saída" },
  "desejo":           { cat: "Pessoal",        tipo: "Saída" },
  "roupa":            { cat: "Pessoal",        tipo: "Saída" },
  "vestuario":        { cat: "Pessoal",        tipo: "Saída" },
  "calcado":          { cat: "Pessoal",        tipo: "Saída" },
  "tenis":            { cat: "Pessoal",        tipo: "Saída" },
  "sapato":           { cat: "Pessoal",        tipo: "Saída" },
  "bolsa":            { cat: "Pessoal",        tipo: "Saída" },
  "acessorio":        { cat: "Pessoal",        tipo: "Saída" },
  "perfume":          { cat: "Pessoal",        tipo: "Saída" },
  "maquiagem":        { cat: "Pessoal",        tipo: "Saída" },
  "cosmetico":        { cat: "Pessoal",        tipo: "Saída" },
  "boticario":        { cat: "Pessoal",        tipo: "Saída" },
  "natura":           { cat: "Pessoal",        tipo: "Saída" },
  "avon":             { cat: "Pessoal",        tipo: "Saída" },
  "renner":           { cat: "Pessoal",        tipo: "Saída" },
  "riachuelo":        { cat: "Pessoal",        tipo: "Saída" },
  "zara":             { cat: "Pessoal",        tipo: "Saída" },
  "cea":              { cat: "Pessoal",        tipo: "Saída" },
  "hm":               { cat: "Pessoal",        tipo: "Saída" },
  "forever":          { cat: "Pessoal",        tipo: "Saída" },
  "shopee":           { cat: "Pessoal",        tipo: "Saída" },
  "mercado livre":    { cat: "Pessoal",        tipo: "Saída" },
  "mercadolivre":     { cat: "Pessoal",        tipo: "Saída" },
  "amazon":           { cat: "Pessoal",        tipo: "Saída" },
  "aliexpress":       { cat: "Pessoal",        tipo: "Saída" },
  "shein":            { cat: "Pessoal",        tipo: "Saída" },
  "americanas":       { cat: "Pessoal",        tipo: "Saída" },
  "magalu":           { cat: "Pessoal",        tipo: "Saída" },
  "magazine":         { cat: "Pessoal",        tipo: "Saída" },
  "casas bahia":      { cat: "Pessoal",        tipo: "Saída" },
  "kabum":            { cat: "Pessoal",        tipo: "Saída" },
  "terabyte":         { cat: "Pessoal",        tipo: "Saída" },
  "petz":             { cat: "Pessoal",        tipo: "Saída" },
  "cobasi":           { cat: "Pessoal",        tipo: "Saída" },
  "leroy":            { cat: "Pessoal",        tipo: "Saída" },
  "tok stok":         { cat: "Pessoal",        tipo: "Saída" },
  "eletro":           { cat: "Pessoal",        tipo: "Saída" },
  "loja":             { cat: "Pessoal",        tipo: "Saída" },
  // ASSINATURA / CONTAS
  "assinatura":       { cat: "Assinatura",     tipo: "Saída" },
  "netflix":          { cat: "Assinatura",     tipo: "Saída" },
  "spotify":          { cat: "Assinatura",     tipo: "Saída" },
  "amazon prime":     { cat: "Assinatura",     tipo: "Saída" },
  "prime video":      { cat: "Assinatura",     tipo: "Saída" },
  "disney":           { cat: "Assinatura",     tipo: "Saída" },
  "hbo":              { cat: "Assinatura",     tipo: "Saída" },
  "youtube":          { cat: "Assinatura",     tipo: "Saída" },
  "globoplay":        { cat: "Assinatura",     tipo: "Saída" },
  "apple":            { cat: "Assinatura",     tipo: "Saída" },
  "icloud":           { cat: "Assinatura",     tipo: "Saída" },
  "google one":       { cat: "Assinatura",     tipo: "Saída" },
  "microsoft":        { cat: "Assinatura",     tipo: "Saída" },
  "office":           { cat: "Assinatura",     tipo: "Saída" },
  "adobe":            { cat: "Assinatura",     tipo: "Saída" },
  "internet":         { cat: "Assinatura",     tipo: "Saída" },
  "telefone":         { cat: "Assinatura",     tipo: "Saída" },
  "celular":          { cat: "Assinatura",     tipo: "Saída" },
  "tim":              { cat: "Assinatura",     tipo: "Saída" },
  "claro":            { cat: "Assinatura",     tipo: "Saída" },
  "vivo":             { cat: "Assinatura",     tipo: "Saída" },
  "oi":               { cat: "Assinatura",     tipo: "Saída" },
  "energia":          { cat: "Assinatura",     tipo: "Saída" },
  "luz":              { cat: "Assinatura",     tipo: "Saída" },
  "agua":             { cat: "Assinatura",     tipo: "Saída" },
  "gas":              { cat: "Assinatura",     tipo: "Saída" },
  "aluguel":          { cat: "Assinatura",     tipo: "Saída" },
  "condominio":       { cat: "Assinatura",     tipo: "Saída" },
  "iptu":             { cat: "Assinatura",     tipo: "Saída" },
  "mensalidade":      { cat: "Assinatura",     tipo: "Saída" },
  "seguro":           { cat: "Assinatura",     tipo: "Saída" },
  "antivirus":        { cat: "Assinatura",     tipo: "Saída" },
  // INVESTIMENTO
  "invest":           { cat: "Investimento",   tipo: "Saída" },
  "investimento":     { cat: "Investimento",   tipo: "Saída" },
  "poupanca":         { cat: "Investimento",   tipo: "Saída" },
  "cdb":              { cat: "Investimento",   tipo: "Saída" },
  "tesouro":          { cat: "Investimento",   tipo: "Saída" },
  "acoes":            { cat: "Investimento",   tipo: "Saída" },
  "fundo":            { cat: "Investimento",   tipo: "Saída" },
  "cripto":           { cat: "Investimento",   tipo: "Saída" },
  "bitcoin":          { cat: "Investimento",   tipo: "Saída" },
  "nuinvest":         { cat: "Investimento",   tipo: "Saída" },
  "xp":               { cat: "Investimento",   tipo: "Saída" },
  "btg":              { cat: "Investimento",   tipo: "Saída" },
  // OUTROS
  "variavel":         { cat: "Outros",         tipo: "Saída" },
  "outros":           { cat: "Outros",         tipo: "Saída" },
};

const NOMES_MESES = [
  "Janeiro","Fevereiro","Março","Abril","Maio","Junho",
  "Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"
];

function getNomeMes(offset = 0) {
  const d = new Date();
  d.setHours(d.getHours() - 3);
  d.setMonth(d.getMonth() + offset);
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
  if (!valorStr) return null;
  const limpo = valorStr
    .replace(/[^\d.,]/g, "")
    .replace(/\.(?=\d{3}(?:[,]|$))/g, "")
    .replace(",", ".");
  const v = parseFloat(limpo);
  return isNaN(v) || v <= 0 ? null : v;
}

// ── Detecta parcelamento: "2x de 65,76" → {parcelas, valorParcela} ──
function detectarParcela(texto) {
  const match = texto.match(/(\d+)\s*[xX]\s*(?:de\s*)?([\d.,]+)/);
  if (!match) return null;
  const parcelas = parseInt(match[1]);
  const valor    = parseValor(match[2]);
  if (!valor || parcelas < 2) return null;
  return { parcelas, valorParcela: valor, valorTotal: parseFloat((valor * parcelas).toFixed(2)) };
}

// ── Google Sheets ─────────────────────────────────────────────
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

// FIX 3: busca a próxima linha realmente vazia verificando todas as colunas
async function proximaLinhaVazia(nomeMes) {
  const res  = await sheets.spreadsheets.values.get({
    spreadsheetId: ID_PLANILHA,
    range: `${nomeMes}!A2:F500`,
  });
  const rows = res.data.values || [];
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    // Considera vazia se todas as colunas relevantes (A-E) estiverem vazias
    const vazia = !row || row.slice(0, 5).every(c => !c || String(c).trim() === "");
    if (vazia) return i + 2;
  }
  // Se não achou linha vazia dentro do range, retorna a próxima após o fim
  return rows.length + 2;
}

async function gravarLinha(nomeMes, linha, valores) {
  await sheets.spreadsheets.values.update({
    spreadsheetId: ID_PLANILHA,
    range: `${nomeMes}!A${linha}:F${linha}`,
    valueInputOption: "USER_ENTERED",
    requestBody: { values: [valores] }
  });
}

// ── Gemini ────────────────────────────────────────────────────
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
        "Categorias aceitas: Salario, Mercado, Farmacia, Transporte, Restaurante, Lazer, Pessoal, Assinatura, Invest, Outros\n" +
        "Pessoal = roupas, acessórios, beleza, compras online (Shopee, Amazon, Mercado Livre, AliExpress, Shein)\n" +
        "Valor: use PONTO como decimal (ex: 2.84). Nunca use virgula no valor.\n" +
        "Sem R$, sem texto extra, sem explicação, sem quebra de linha.\n\n" +
        "Exemplos:\nPessoal|Shopee|2.84\nTransporte|Uber|22.50\nMercado|Hiperideal|12.78\nRestaurante|iFood|29.37\n\n" +
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
  console.log("Gemini retornou:", texto);
  return texto.includes("|") ? texto.replace(/\|/g, ",") : texto;
}

// ── Handler de mensagens ──────────────────────────────────────
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
          "ℹ️ Formato:\nCategoria, Item, Valor\n\n" +
          "Parcelado: Categoria, Item, NxValor\n" +
          "Ex: Pessoal, Renner, 3x65.76\n\n" +
          "Categorias: Mercado, Farmácia, Transporte, Restaurante,\n" +
          "Lazer, Pessoal, Assinatura, Investimento, Salário, Outros\n\n" +
          "Ou envie foto do comprovante."
        );
        return;
      }
    }

    if (!textoFinal) return;
    textoFinal = textoFinal.replace(/\r?\n/g, " ").replace(/\s{2,}/g, " ").trim();
    console.log("Processando:", textoFinal);

    // ── Detecta parcelamento ─────────────────────────────────
    const parcelamento = detectarParcela(textoFinal);
    if (parcelamento) {
      // Remove o trecho "Nx valor" para extrair categoria e item
      const semParcela = textoFinal
        .replace(/,?\s*\d+\s*[xX]\s*(?:de\s*)?[\d.,]+/g, "")
        .replace(/,\s*,/g, ",")
        .trim()
        .replace(/,\s*$/, "");

      const partesBase = semParcela.split(",");
      if (partesBase.length >= 2) {
        const inputCat = partesBase[0].trim();
        const item     = partesBase[1].trim();
        const { cat: categoria, tipo } = resolverCategoria(inputCat);
        const dataStr  = getDataAtual();

        // FIX 1: lança cada parcela no mês correspondente
        for (let i = 0; i < parcelamento.parcelas; i++) {
          const nomeMes = getNomeMes(i);
          await garantirAba(nomeMes);
          const linha = await proximaLinhaVazia(nomeMes);
          const obs   = `Parcela ${i+1}/${parcelamento.parcelas}`;
          await gravarLinha(nomeMes, linha, [dataStr, categoria, item, parcelamento.valorParcela, tipo, obs]);
        }

        const mesesStr = Array.from({ length: parcelamento.parcelas }, (_, i) => getNomeMes(i)).join(", ");
        await bot.sendMessage(chatId,
          `💸 Parcelamento lançado!\n\n` +
          `📁 ${categoria} › ${item}\n` +
          `💵 R$ ${parcelamento.valorParcela.toFixed(2).replace(".",",")} × ${parcelamento.parcelas}x\n` +
          `💳 Total: R$ ${parcelamento.valorTotal.toFixed(2).replace(".",",")}\n` +
          `📅 Lançado em: ${mesesStr}`
        );
        return;
      }
    }

    // ── Parse normal ─────────────────────────────────────────
    const partes = textoFinal.split(",");
    if (partes.length < 3) {
      await bot.sendMessage(chatId,
        `⚠️ Formato inválido: "${textoFinal}"\n\nUse: Categoria, Item, Valor\nEx: Mercado, Padaria, 35.90\nParcelado: Pessoal, Renner, 3x65.76`
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
    const nomeMes = getNomeMes(0);
    const dataStr = getDataAtual();

    await garantirAba(nomeMes);
    const linha = await proximaLinhaVazia(nomeMes);
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
