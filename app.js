const SUPABASE_URL = "https://kcgwyzvwxmmygfdsetgd.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_DVhc89tNRiL1b20VJlMioQ_t0A47vAa";

const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Identifica a edicao do evento para as avaliacoes, permitindo reaproveitar
// vcday_evaluations em futuros eventos sem misturar os resultados. Trocar a
// cada novo evento.
const EVENT_SLUG = "congresso-2026";

// Janela de datas (America/Sao_Paulo, YYYY-MM-DD) do evento atual. So os
// paineis com event_date dentro dessa janela aparecem no hub/telao - assim
// eventos antigos ficam guardados no banco sem poluir a listagem do evento
// em andamento. Trocar a cada novo evento.
const CURRENT_EVENT_START_DATE = "2026-09-22";
const CURRENT_EVENT_END_DATE = "2026-09-23";

// Historico de eventos ja rodados neste site (nao vem de uma tabela - e so
// para a moderacao poder trocar de evento e revisar perguntas/avaliacoes
// antigas). Adicionar uma linha aqui a cada evento novo, mantendo as
// anteriores.
const KNOWN_EVENTS = [
  { label: "Congresso ABVCAP 2026 (22-23/09)", slug: "congresso-2026", start: "2026-09-22", end: "2026-09-23" },
  { label: "VC Day 2026 (16/09)", slug: "vcday-2026", start: "2026-09-16", end: "2026-09-16" },
];

const TZ = "America/Sao_Paulo";

function nowInSaoPaulo() {
  return new Date(new Date().toLocaleString("en-US", { timeZone: TZ }));
}

function todayDateStringSaoPaulo() {
  const d = nowInSaoPaulo();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function timeToMinutes(t) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

function nowMinutesSaoPaulo() {
  const d = nowInSaoPaulo();
  return d.getHours() * 60 + d.getMinutes();
}

async function fetchPanels(startDate = CURRENT_EVENT_START_DATE, endDate = CURRENT_EVENT_END_DATE) {
  const { data, error } = await sb
    .from("vcday_panels")
    .select("*")
    .gte("event_date", startDate)
    .lte("event_date", endDate)
    .order("event_date", { ascending: true })
    .order("sort_order", { ascending: true });
  if (error) {
    console.error(error);
    return [];
  }
  return data;
}

async function fetchPanel(id) {
  const { data, error } = await sb
    .from("vcday_panels")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) {
    console.error(error);
    return null;
  }
  return data;
}

// Paineis costumam atrasar (~20min em media) em relacao ao horario previsto.
// So marcamos como "encerrado" depois dessa margem, para nao bloquear
// perguntas de um painel que ainda esta rolando.
const PANEL_GRACE_MINUTES = 15;

function panelPhase(panel, nowMin) {
  // Permite forcar um status manualmente (treinamento, demonstracao) sem
  // depender do horario real. Null/vazio = comportamento normal por horario.
  if (panel.status_override) return panel.status_override;

  const today = todayDateStringSaoPaulo();
  if (today < panel.event_date) return "soon";
  if (today > panel.event_date) return "done";

  const start = timeToMinutes(panel.starts_at);
  const end = timeToMinutes(panel.ends_at) + PANEL_GRACE_MINUTES;
  if (nowMin >= start && nowMin < end) return "live";
  if (nowMin < start) return "soon";
  return "done";
}

const MONTH_ABBR_EN = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** Formata uma data YYYY-MM-DD no idioma atual: "DD/MM" em pt, "Mon D" em en (evita ambiguidade DD/MM x MM/DD). */
function formatDateForLang(dateStr) {
  const [, m, d] = dateStr.split("-");
  if (getLang() === "en") {
    return `${MONTH_ABBR_EN[Number(m) - 1]} ${Number(d)}`;
  }
  return `${d}/${m}`;
}

function formatEventDate(panel) {
  return formatDateForLang(panel.event_date);
}

function formatRange(panel) {
  return `${formatEventDate(panel)} · ${panel.starts_at.slice(0, 5)}–${panel.ends_at.slice(0, 5)}`;
}

/** Datas distintas (event_date) presentes numa lista de paineis, em ordem. */
function uniqueEventDates(panels) {
  return [...new Set(panels.map((p) => p.event_date))].sort();
}

function qs(name) {
  return new URLSearchParams(window.location.search).get(name);
}

function timeAgo(iso) {
  const diff = Math.max(0, Date.now() - new Date(iso).getTime());
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "agora";
  if (mins === 1) return "há 1 min";
  if (mins < 60) return `há ${mins} min`;
  const hrs = Math.floor(mins / 60);
  return `há ${hrs}h${mins % 60 ? (mins % 60) + "m" : ""}`;
}

function escapeHtml(s) {
  return (s || "").replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[c])
  );
}

/** Picks the panel to default to: the one live now, else the next upcoming, else the last one. */
function pickDefaultPanel(panels) {
  if (!panels.length) return null;
  const nowMin = nowMinutesSaoPaulo();
  const live = panels.find((p) => panelPhase(p, nowMin) === "live");
  if (live) return live;
  const upcoming = panels.find((p) => panelPhase(p, nowMin) === "soon");
  if (upcoming) return upcoming;
  return panels[panels.length - 1];
}

// --- Bilingue (PT/EN) -------------------------------------------------
// Escopo: paginas voltadas ao publico (hub, pergunta, telao, avaliacao).
// A moderacao fica so em portugues por enquanto (uso interno da equipe).
// Idioma persiste por navegador (localStorage); trocar recarrega a pagina
// para evitar estados parcialmente traduzidos.

function getLang() {
  return localStorage.getItem("vcday_lang") === "en" ? "en" : "pt";
}

function setLang(lang) {
  localStorage.setItem("vcday_lang", lang);
  location.reload();
}

const I18N = {
  pt: {
    eventDates: "22 e 23 de setembro",
    hubTitle: "Pergunte aos painelistas",
    hubSubtitle: "Selecione o painel em andamento (ou o próximo) e envie sua pergunta. A equipe de moderação fará a seleção das perguntas que serão enviadas aos painelistas.",
    loadingPanels: "Carregando painéis…",
    noPanelsYet: "Nenhum painel cadastrado ainda.",
    day: "Dia",
    tagLive: "Agora",
    tagSoon: "Em breve",
    tagDone: "Encerrado",
    evaluateShort: "Avaliar →",
    evaluateEvent: "Avaliar o evento →",
    speakersLabel: "Speakers",
    footerHome: "← Ver todos os painéis",
    loadingPanel: "Carregando painel…",
    panelNotProvided: "Painel não informado",
    scanQr: "Escaneie o QR code exibido na tela do painel",
    panelNotFound: "Painel não encontrado",
    yourQuestion: "Sua pergunta",
    questionPlaceholder: "Escreva sua pergunta para o painelista…",
    yourNameCompany: "Seu nome e empresa",
    optional: "(opcional)",
    namePlaceholder: "Ex.: Maria Silva, Fundo XP",
    sendQuestion: "Enviar pergunta",
    sending: "Enviando…",
    questionSentTitle: "Pergunta enviada!",
    questionSentText: "A pergunta foi enviada para a moderação do painel. Caso seja selecionada, será lida ao painelista.",
    sendAnother: "Enviar outra pergunta",
    evaluateThisPanel: "Avaliar este painel →",
    panelClosedText: "Este painel já foi encerrado e não está mais recebendo perguntas.",
    closedSuffix: "· Encerrado",
    sendError: "Não foi possível enviar. Tente novamente.",
    liveQuestionsEyebrow: "Perguntas ao vivo",
    sendYourQuestionAt: "Envie sua pergunta em",
    waitingApproved: "Aguardando perguntas aprovadas…",
    noPanelsRegistered: "Nenhum painel cadastrado",
    loading: "Carregando…",
    evaluateEventTitle: "Avalie o evento",
    evaluateEventSubtitle: "Sua opinião ajuda a ABVCAP a melhorar as próximas edições do Congresso ABVCAP 2026.",
    evaluateEventSuccessText: "Sua opinião foi registrada e vai ajudar a melhorar o próximo Congresso ABVCAP 2026.",
    evaluatePanelSubtitle: "Como foi este painel? Sua opinião ajuda a ABVCAP a melhorar os próximos.",
    evaluatePanelSuccessText: "Sua opinião sobre este painel foi registrada.",
    thankYouEvaluation: "Obrigado pela avaliação!",
    evaluateWholeEvent: "Avaliar o evento inteiro →",
    ratingForEvent: "Nota geral para o evento",
    ratingForPanel: "Nota para este painel",
    tapAStar: "Toque em uma estrela para avaliar",
    ratingN: "Nota",
    pickRatingFirst: "Escolha uma nota antes de enviar",
    likedQuestion: "O que você mais gostou?",
    likedPlaceholder: "Conteúdo, painelistas, organização…",
    improveQuestion: "O que podemos melhorar?",
    improvePlaceholder: "Sugestões para a próxima vez…",
    yourName: "Seu nome",
    yourNamePlaceholder: "Ex.: Maria Silva",
    sendEvaluation: "Enviar avaliação",
  },
  en: {
    eventDates: "September 22–23",
    hubTitle: "Ask the panelists",
    hubSubtitle: "Select the panel that's happening now (or next) and send your question. The moderation team will select the questions sent to the panelists.",
    loadingPanels: "Loading panels…",
    noPanelsYet: "No panels registered yet.",
    day: "Day",
    tagLive: "Now",
    tagSoon: "Soon",
    tagDone: "Closed",
    evaluateShort: "Rate →",
    evaluateEvent: "Rate the event →",
    speakersLabel: "Speakers",
    footerHome: "← See all panels",
    loadingPanel: "Loading panel…",
    panelNotProvided: "Panel not specified",
    scanQr: "Scan the QR code shown on the panel screen",
    panelNotFound: "Panel not found",
    yourQuestion: "Your question",
    questionPlaceholder: "Write your question for the panelist…",
    yourNameCompany: "Your name and company",
    optional: "(optional)",
    namePlaceholder: "E.g.: Maria Silva, Fundo XP",
    sendQuestion: "Send question",
    sending: "Sending…",
    questionSentTitle: "Question sent!",
    questionSentText: "Your question was sent to the panel's moderation. If selected, it will be read to the panelist.",
    sendAnother: "Send another question",
    evaluateThisPanel: "Rate this panel →",
    panelClosedText: "This panel has already ended and is no longer accepting questions.",
    closedSuffix: "· Closed",
    sendError: "Could not send. Please try again.",
    liveQuestionsEyebrow: "Live Q&A",
    sendYourQuestionAt: "Send your question at",
    waitingApproved: "Waiting for approved questions…",
    noPanelsRegistered: "No panels registered",
    loading: "Loading…",
    evaluateEventTitle: "Rate the event",
    evaluateEventSubtitle: "Your feedback helps ABVCAP improve future editions of Congresso ABVCAP 2026.",
    evaluateEventSuccessText: "Your feedback was recorded and will help improve the next Congresso ABVCAP 2026.",
    evaluatePanelSubtitle: "How was this panel? Your feedback helps ABVCAP improve future ones.",
    evaluatePanelSuccessText: "Your feedback on this panel was recorded.",
    thankYouEvaluation: "Thanks for your feedback!",
    evaluateWholeEvent: "Rate the whole event →",
    ratingForEvent: "Overall rating for the event",
    ratingForPanel: "Rating for this panel",
    tapAStar: "Tap a star to rate",
    ratingN: "Rating",
    pickRatingFirst: "Choose a rating before sending",
    likedQuestion: "What did you like most?",
    likedPlaceholder: "Content, panelists, organization…",
    improveQuestion: "What can we improve?",
    improvePlaceholder: "Suggestions for next time…",
    yourName: "Your name",
    yourNamePlaceholder: "E.g.: Maria Silva",
    sendEvaluation: "Send rating",
  },
};

function t(key) {
  const lang = getLang();
  return (I18N[lang] && I18N[lang][key]) || I18N.pt[key] || key;
}

/** Nome do painel no idioma atual, com fallback para o portugues se nao houver traducao. */
function panelName(panel) {
  return getLang() === "en" && panel.name_en ? panel.name_en : panel.name;
}

/** Lista de speakers (nomes nao sao traduzidos, so o "e" que os une em ingles). */
function formatSpeakers(panel) {
  if (!panel.speakers) return "";
  return getLang() === "en" ? panel.speakers.replace(/ e /g, " and ") : panel.speakers;
}

function renderLangToggle() {
  const el = document.getElementById("lang-toggle");
  if (!el) return;
  const lang = getLang();
  el.innerHTML = `
    <button type="button" class="lang-flag${lang === "pt" ? " active" : ""}" data-lang="pt" aria-label="Português" title="Português">🇧🇷</button>
    <button type="button" class="lang-flag${lang === "en" ? " active" : ""}" data-lang="en" aria-label="English" title="English">🇺🇸</button>
  `;
  el.querySelectorAll(".lang-flag").forEach((btn) => {
    btn.addEventListener("click", () => setLang(btn.dataset.lang));
  });
}
