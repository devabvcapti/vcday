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

async function fetchPanels() {
  const { data, error } = await sb
    .from("vcday_panels")
    .select("*")
    .gte("event_date", CURRENT_EVENT_START_DATE)
    .lte("event_date", CURRENT_EVENT_END_DATE)
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

function formatEventDate(panel) {
  const [, m, d] = panel.event_date.split("-");
  return `${d}/${m}`;
}

function formatRange(panel) {
  return `${formatEventDate(panel)} · ${panel.starts_at.slice(0, 5)}–${panel.ends_at.slice(0, 5)}`;
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
