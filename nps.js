// --- Pesquisas NPS pos-evento -------------------------------------------
// Motor generico: cada pesquisa e uma lista de perguntas (SURVEYS abaixo),
// renderizada/validada/enviada pelo mesmo codigo, para nao duplicar HTML/JS
// entre as pesquisas (Participantes, Participantes VC Day, Painelistas e
// Moderadores, Patrocinadores e Apoiadores). Depende de app.js (sb,
// escapeHtml, getLang, fetchPanels, panelName, renderLangToggle).
//
// Bilingue (PT/EN), exceto o dashboard (nps-dashboard.html), que fica
// sempre em portugues (uso interno da equipe, como a moderacao). Toda
// pergunta de escolha guarda um "value" canonico (independente de idioma)
// nas respostas, para que o dashboard agregue corretamente mesmo que
// metade das pessoas responda em ingles.

const NPS_EVENT_SLUG = "experience-2026";

const NPS_STRINGS = {
  pt: {
    postEventSurvey: "Pesquisa pós-evento",
    estimatedTime: "Tempo estimado",
    loading: "Carregando pesquisa…",
    optional: "(opcional)",
    writeHere: "Escreva aqui…",
    requiredError: "Essa pergunta é obrigatória.",
    submit: "Enviar respostas",
    submitting: "Enviando…",
    submitError: "Não foi possível enviar suas respostas. Tente novamente em instantes.",
    successTitle: "Respostas enviadas!",
  },
  en: {
    postEventSurvey: "Post-event survey",
    estimatedTime: "Estimated time",
    loading: "Loading survey…",
    optional: "(optional)",
    writeHere: "Write here…",
    requiredError: "This question is required.",
    submit: "Submit answers",
    submitting: "Submitting…",
    submitError: "We couldn't submit your answers. Please try again shortly.",
    successTitle: "Answers submitted!",
  },
};

function ns(key) {
  return NPS_STRINGS[getLang() === "en" ? "en" : "pt"][key];
}

/** Resolve um campo bilingue {pt, en} (perguntas, opcoes, ancoras) no idioma atual. */
function tr(field) {
  if (field && typeof field === "object" && !Array.isArray(field)) {
    return getLang() === "en" && field.en ? field.en : field.pt;
  }
  return field;
}

/** Opcao de escolha unica/multipla: "value" e o identificador canonico (gravado no banco), pt/en so mudam o rotulo exibido. */
function opt(value, pt, en) {
  return { value, pt, en };
}

const FREQ_OPTIONS = [
  opt("nenhuma", "Nenhuma", "None"),
  opt("1-2", "1 a 2", "1 to 2"),
  opt("3-5", "3 a 5", "3 to 5"),
  opt("6-10", "6 a 10", "6 to 10"),
  opt("mais-de-10", "Mais de 10", "More than 10"),
];

const DEAL_PROGRESS_OPTIONS = [
  opt("sim-andamento", "Sim, já há conversa em andamento", "Yes, there's already a conversation underway"),
  opt("talvez", "Talvez, é cedo para dizer", "Maybe, it's too early to tell"),
  opt("nao", "Não", "No"),
];

const ATTEND_2027_OPTIONS = [
  opt("sim-certeza", "Sim, com certeza", "Yes, definitely"),
  opt("provavelmente-sim", "Provavelmente sim", "Probably yes"),
  opt("nao-sei", "Ainda não sei", "Not sure yet"),
  opt("provavelmente-nao", "Provavelmente não", "Probably not"),
];

// --- Opcoes especificas das pesquisas do LP Day (Gestores, Investidores/LPs, Carlos) ---

/** Mesma escala de frequencia de FREQ_OPTIONS, mas concordancia no masculino ("contatos", nao "conversas"). */
const FREQ_OPTIONS_M = [
  opt("nenhum", "Nenhum", "None"),
  opt("1-2", "1 a 2", "1 to 2"),
  opt("3-5", "3 a 5", "3 to 5"),
  opt("6-10", "6 a 10", "6 to 10"),
  opt("mais-de-10", "Mais de 10", "More than 10"),
];

const DEAL_PROGRESS_OPTIONS_LPDAY = [
  opt("sim-andamento", "Sim, já há conversa em andamento", "Yes, conversations are already underway"),
  opt("talvez", "Talvez, ainda é cedo para avaliar", "Maybe, it is still too early to assess"),
  opt("nao", "Não", "No"),
];

/** Escala curta usada para "quantas gestoras/empresas avancaram para diligencia" - termina em "5+", nao "mais de 10". */
const DILIGENCE_PROGRESS_OPTIONS = [
  opt("nenhuma", "Nenhuma", "None"),
  opt("1-2", "1 a 2", "1 to 2"),
  opt("3-5", "3 a 5", "3 to 5"),
  opt("5-mais", "5+", "5+"),
];

const MATRIX_CONTINUITY_OPTIONS = [
  opt("sim", "Sim", "Yes"),
  opt("talvez", "Talvez", "Maybe"),
  opt("nao", "Não", "No"),
];

/** Lista de acoes do programa inBrazil, repetida identica nas 3 pesquisas do LP Day. */
const INBRAZIL_ACTIVITIES_OPTIONS = [
  opt("missao-ny-lavca", "Missão NY LAVCA – Out/2026", "NY LAVCA Mission – Oct/2026"),
  opt("missao-europa-giin", "Missão Europa GIIN – Out/26", "Europe GIIN Mission – Oct/26"),
  opt("global-fundraising-bootcamp", "Global Fundraising Bootcamp SP – Dez/26", "Global Fundraising Bootcamp SP – Dec/26"),
  opt("missao-mexico", "Missão Mexico – Fev/27", "Mexico Mission – Feb/27"),
  opt("missao-ca", "Missão CA – Mar/27", "CA Mission – Mar/27"),
  opt("forum-investimentos-sustentaveis", "Fórum de Investimentos Sustentáveis SP – TRI 1 2027", "Sustainable Investments Forum SP – Q1 2027"),
  opt("abvcap-experience-2027", "ABVCAP Experience – Jun/2027", "ABVCAP Experience – Jun/2027"),
];

/** As 15 reunioes da pesquisa personalizada do Carlos / responsAbility Investments - nomes proprios, iguais em pt/en. */
const CARLOS_MEETING_ROWS = [
  { value: "volpe-capital", label: "Volpe Capital" },
  { value: "just-climate", label: "Just Climate" },
  { value: "crescera", label: "Crescera" },
  { value: "blue-like-an-orange", label: "Blue Like an Orange" },
  { value: "aqua-capital", label: "Aqua Capital" },
  { value: "kptl", label: "KPTL" },
  { value: "valetec", label: "Valetec" },
  { value: "deg", label: "DEG" },
  { value: "gridx", label: "Gridx" },
  { value: "vox-capital", label: "Vox Capital" },
  { value: "newave", label: "Newave" },
  { value: "quartzo-capital", label: "Quartzo Capital" },
  { value: "gef", label: "GEF" },
  { value: "mov", label: "MOV" },
  { value: "impact-fund", label: "Impact Fund" },
];

/** Os 18 "Painel N: ..." do Congresso, como opcoes canonicas (value = panel.id) para a pergunta de multipla escolha. */
async function npsPanelOptions() {
  const panels = await fetchPanels();
  return panels.filter((p) => p.id.startsWith("painel-")).map((p) => opt(p.id, p.name, p.name_en || p.name));
}

/** Os 5 paineis do VC Day (16/09) - ids nao seguem o padrao "painel-N" do Congresso, entao busca por data e inclui todos. */
async function npsVcdayPanelOptions() {
  const panels = await fetchPanels("2026-09-16", "2026-09-16");
  return panels.map((p) => opt(p.id, p.name, p.name_en || p.name));
}

const SURVEYS = {
  participantes: {
    title: { pt: "Pesquisa · Participantes", en: "Survey · Attendees" },
    audience: { pt: "Para todos os inscritos presentes", en: "For all registered attendees who were present" },
    estimate: { pt: "2 a 3 minutos", en: "2 to 3 minutes" },
    thankYou: { pt: "Obrigado pela participação! Suas respostas vão ajudar a moldar a próxima edição.", en: "Thank you for taking part! Your answers will help shape the next edition." },
    questions: [
      { id: "nome", type: "short", text: { pt: "Nome", en: "Name" }, optional: true, hint: { pt: "Deixe seu nome e e-mail (opcional) para ter acesso a um cupom de desconto na próxima edição.", en: "Leave your name and email (optional) to get access to a discount coupon on the next edition." } },
      { id: "email", type: "short", inputType: "email", text: { pt: "E-mail", en: "Email" }, placeholder: { pt: "seu@email.com", en: "you@email.com" }, hint: { pt: "Obrigatório se você preencher o nome acima.", en: "Required if you fill in your name above." }, showIf: { q: "nome", filled: true }, requiredIf: { q: "nome" }, numberLabel: "1.1" },
      { id: "consentimento", type: "consent", text: { pt: "Autorização de uso de dados (LGPD)", en: "Data usage consent (LGPD)" }, consentLabel: { pt: "Autorizo a ABVCAP a utilizar meu nome e e-mail para envio do cupom de desconto e comunicações sobre a próxima edição, conforme a Lei Geral de Proteção de Dados (LGPD).", en: "I authorize ABVCAP to use my name and email to send the discount coupon and related communications about the next edition, in accordance with Brazil's General Data Protection Law (LGPD)." }, showIf: { q: "nome", filled: true }, requiredIf: { q: "nome" }, numberLabel: "1.2" },
      { id: "q1", type: "nps", primary: true, text: { pt: "De 0 a 10, qual a probabilidade de você recomendar o Congresso ABVCAP a um colega?", en: "On a scale of 0 to 10, how likely are you to recommend the ABVCAP Congress to a colleague?" }, anchors: { pt: ["Nada provável", "Extremamente provável"], en: ["Not at all likely", "Extremely likely"] } },
      { id: "q2", type: "scale", text: { pt: "Como você avalia o Congresso de forma geral?", en: "How would you rate the Congress overall?" }, anchors: { pt: ["Muito ruim", "Excelente"], en: ["Very poor", "Excellent"] } },
      { id: "q3", type: "scale", text: { pt: "Como você avalia a qualidade do conteúdo dos painéis?", en: "How would you rate the quality of the panel content?" }, anchors: { pt: ["Muito ruim", "Excelente"], en: ["Very poor", "Excellent"] } },
      { id: "q4", type: "multi", text: { pt: "Quais painéis foram os mais relevantes para você?", en: "Which panels were most relevant to you?" }, hint: { pt: "Escolha até 3.", en: "Choose up to 3." }, maxSelect: 3, optionsSource: "panels" },
      { id: "q5", type: "single", text: { pt: "Quantas conversas profissionalmente relevantes você teve durante o evento?", en: "How many professionally relevant conversations did you have during the event?" }, options: FREQ_OPTIONS },
      { id: "q6", type: "single", text: { pt: "Alguma dessas conversas deve evoluir para negócio, parceria ou investimento?", en: "Do you expect any of these conversations to turn into business, a partnership, or an investment?" }, options: DEAL_PROGRESS_OPTIONS },
      { id: "q7", type: "scale", text: { pt: "Como você avalia a estrutura do evento — local, sinalização, alimentação e credenciamento?", en: "How would you rate the event's logistics — venue, signage, catering, and check-in?" }, anchors: { pt: ["Muito ruim", "Excelente"], en: ["Very poor", "Excellent"] } },
      { id: "q8", type: "single", text: { pt: "Você pretende participar da edição de 2027?", en: "Do you plan to attend the 2027 edition?" }, options: ATTEND_2027_OPTIONS },
      { id: "q9", type: "text", text: { pt: "O que mais funcionou e o que faríamos diferente?", en: "What worked best, and what would you do differently?" }, optional: true },
    ],
  },
  "participantes-vcday": {
    title: { pt: "Pesquisa · Participantes VC Day", en: "Survey · VC Day Attendees" },
    audience: { pt: "Para todos os inscritos presentes", en: "For all registered attendees who were present" },
    estimate: { pt: "2 a 3 minutos", en: "2 to 3 minutes" },
    thankYou: { pt: "Obrigado pela participação! Suas respostas vão ajudar a moldar a próxima edição.", en: "Thank you for taking part! Your answers will help shape the next edition." },
    questions: [
      { id: "nome", type: "short", text: { pt: "Nome", en: "Name" }, optional: true, hint: { pt: "Deixe seu nome e e-mail (opcional) para ter acesso a um cupom de desconto na próxima edição.", en: "Leave your name and email (optional) to get access to a discount coupon on the next edition." } },
      { id: "email", type: "short", inputType: "email", text: { pt: "E-mail", en: "Email" }, placeholder: { pt: "seu@email.com", en: "you@email.com" }, hint: { pt: "Obrigatório se você preencher o nome acima.", en: "Required if you fill in your name above." }, showIf: { q: "nome", filled: true }, requiredIf: { q: "nome" }, numberLabel: "1.1" },
      { id: "consentimento", type: "consent", text: { pt: "Autorização de uso de dados (LGPD)", en: "Data usage consent (LGPD)" }, consentLabel: { pt: "Autorizo a ABVCAP a utilizar meu nome e e-mail para envio do cupom de desconto e comunicações sobre a próxima edição, conforme a Lei Geral de Proteção de Dados (LGPD).", en: "I authorize ABVCAP to use my name and email to send the discount coupon and related communications about the next edition, in accordance with Brazil's General Data Protection Law (LGPD)." }, showIf: { q: "nome", filled: true }, requiredIf: { q: "nome" }, numberLabel: "1.2" },
      { id: "q1", type: "nps", primary: true, text: { pt: "De 0 a 10, qual a probabilidade de você recomendar o VC Day a um colega?", en: "On a scale of 0 to 10, how likely are you to recommend VC Day to a colleague?" }, anchors: { pt: ["Nada provável", "Extremamente provável"], en: ["Not at all likely", "Extremely likely"] } },
      { id: "q2", type: "scale", text: { pt: "Como você avalia o VC Day de forma geral?", en: "How would you rate VC Day overall?" }, anchors: { pt: ["Muito ruim", "Excelente"], en: ["Very poor", "Excellent"] } },
      { id: "q3", type: "scale", text: { pt: "Como você avalia a qualidade do conteúdo dos painéis?", en: "How would you rate the quality of the panel content?" }, anchors: { pt: ["Muito ruim", "Excelente"], en: ["Very poor", "Excellent"] } },
      { id: "q4", type: "multi", text: { pt: "Quais painéis foram os mais relevantes para você?", en: "Which panels were most relevant to you?" }, hint: { pt: "Escolha até 3.", en: "Choose up to 3." }, maxSelect: 3, optionsSource: "vcday-panels" },
      { id: "q5", type: "single", text: { pt: "Quantas conversas profissionalmente relevantes você teve durante o evento?", en: "How many professionally relevant conversations did you have during the event?" }, options: FREQ_OPTIONS },
      { id: "q6", type: "single", text: { pt: "Alguma dessas conversas deve evoluir para negócio, parceria ou investimento?", en: "Do you expect any of these conversations to turn into business, a partnership, or an investment?" }, options: DEAL_PROGRESS_OPTIONS },
      { id: "q7", type: "scale", text: { pt: "Como você avalia a estrutura do evento — local, sinalização, alimentação e credenciamento?", en: "How would you rate the event's logistics — venue, signage, catering, and check-in?" }, anchors: { pt: ["Muito ruim", "Excelente"], en: ["Very poor", "Excellent"] } },
      { id: "q8", type: "single", text: { pt: "Você pretende participar da edição de 2027?", en: "Do you plan to attend the 2027 edition?" }, options: ATTEND_2027_OPTIONS },
      { id: "q9", type: "text", text: { pt: "O que mais funcionou e o que faríamos diferente?", en: "What worked best, and what would you do differently?" }, optional: true },
    ],
  },
  "painelistas-moderadores": {
    title: { pt: "Pesquisa · Painelistas e moderadores", en: "Survey · Panelists and moderators" },
    audience: { pt: "Para quem participou das sessões como painelista ou moderador", en: "For those who took part in the sessions as a panelist or moderator" },
    estimate: { pt: "3 minutos", en: "3 minutes" },
    thankYou: { pt: "Obrigado pela contribuição! Seu retorno é essencial para melhorar a próxima edição.", en: "Thank you for your contribution! Your feedback is essential for improving the next edition." },
    questions: [
      { id: "q1", type: "single", text: { pt: "Qual foi sua participação no ABVCAP Experience 2026?", en: "What was your role at ABVCAP Experience 2026?" }, options: [opt("painelista", "Painelista", "Panelist"), opt("moderador", "Moderador", "Moderator")] },
      { id: "q2", type: "nps", primary: true, text: { pt: "De 0 a 10, qual a probabilidade de você participar novamente em 2027?", en: "On a scale of 0 to 10, how likely are you to take part again in 2027?" }, anchors: { pt: ["Nada provável", "Extremamente provável"], en: ["Not at all likely", "Extremely likely"] } },
      { id: "q3", type: "scale", text: { pt: "Como você avalia a experiência de participar do ABVCAP Experience 2026?", en: "How would you rate your experience taking part in ABVCAP Experience 2026?" }, anchors: { pt: ["Muito ruim", "Excelente"], en: ["Very poor", "Excellent"] } },
      { id: "q4", type: "scale", text: { pt: "Como você avalia o processo de alinhamento prévio — convite, calls e comunicação da equipe?", en: "How would you rate the prior coordination process — invitation, calls, and communication from the team?" }, anchors: { pt: ["Muito ruim", "Excelente"], en: ["Very poor", "Excellent"] } },
      { id: "q5", type: "single", text: { pt: "O material de briefing do painel foi útil para sua preparação?", en: "Was the panel briefing material useful for your preparation?" }, options: [opt("muito-util", "Muito útil", "Very useful"), opt("util", "Útil", "Useful"), opt("pouco-util", "Pouco útil", "Not very useful"), opt("nao-recebi", "Não recebi ou não utilizei", "I didn't receive it or didn't use it")] },
      { id: "q6", type: "single", text: { pt: "Como você avalia o formato e a duração do painel de que participou?", en: "How would you rate the format and length of the panel you took part in?" }, options: [opt("adequados", "Adequados", "Adequate"), opt("tempo-curto", "O tempo foi curto para o número de participantes", "The time was too short for the number of participants"), opt("tempo-longo", "O tempo foi longo demais", "The time was too long"), opt("recorte-especifico", "O recorte do tema poderia ser mais específico", "The topic scope could have been more specific")] },
      { id: "q7", type: "scale", text: { pt: "Como você avalia o apoio da equipe no dia do evento?", en: "How would you rate the team's support on the day of the event?" }, anchors: { pt: ["Muito ruim", "Excelente"], en: ["Very poor", "Excellent"] } },
      { id: "q8", type: "text", text: { pt: "Somente para moderadores: o que ajudaria a conduzir melhor da próxima vez?", en: "For moderators only: what would help you moderate better next time?" }, optional: true, showIf: { q: "q1", equals: "moderador" } },
      { id: "q9", type: "text", text: { pt: "Algum comentário ou sugestão para 2027?", en: "Any comments or suggestions for 2027?" }, optional: true },
    ],
  },
  patrocinadores: {
    title: { pt: "Pesquisa · Patrocinadores e apoiadores", en: "Survey · Sponsors and supporters" },
    audience: { pt: "Para as empresas que patrocinaram as frentes do Experience", en: "For the companies that sponsored the Experience's events" },
    estimate: { pt: "3 a 4 minutos", en: "3 to 4 minutes" },
    thankYou: { pt: "Obrigado pelo apoio e pelo retorno! Vamos usar isso para preparar 2027.", en: "Thank you for your support and feedback! We'll use this to prepare for 2027." },
    questions: [
      { id: "q1", type: "multi", text: { pt: "Qual frente sua empresa patrocinou?", en: "Which event did your company sponsor?" }, options: [opt("congresso", "Congresso", "Congress"), opt("vc-day", "VC Day", "VC Day"), opt("lp-day", "LP Day", "LP Day"), opt("women-connection", "Women Connection", "Women Connection")] },
      { id: "q2", type: "nps", primary: true, text: { pt: "De 0 a 10, qual a probabilidade de sua empresa patrocinar o Experience em 2027?", en: "On a scale of 0 to 10, how likely is your company to sponsor the Experience in 2027?" }, anchors: { pt: ["Nada provável", "Extremamente provável"], en: ["Not at all likely", "Extremely likely"] } },
      { id: "q3", type: "scale", text: { pt: "Como você avalia o retorno obtido frente ao investimento?", en: "How would you rate the return on your investment?" }, anchors: { pt: ["Muito ruim", "Excelente"], en: ["Very poor", "Excellent"] } },
      { id: "q4", type: "scale", text: { pt: "Como você avalia a visibilidade da marca durante o evento?", en: "How would you rate your brand's visibility during the event?" }, anchors: { pt: ["Muito ruim", "Excelente"], en: ["Very poor", "Excellent"] } },
      { id: "q5", type: "single", text: { pt: "A cota contratada entregou o que foi prometido?", en: "Did the sponsorship package deliver what was promised?" }, options: [opt("sim-integralmente", "Sim, integralmente", "Yes, fully"), opt("sim-maior-parte", "Sim, na maior parte", "Yes, mostly"), opt("parcialmente", "Parcialmente", "Partially"), opt("nao", "Não", "No")] },
      { id: "q6", type: "single", text: { pt: "Quantos contatos qualificados sua empresa gerou no evento?", en: "How many qualified contacts did your company generate at the event?" }, options: [opt("nenhum", "Nenhum", "None"), opt("1-5", "1 a 5", "1 to 5"), opt("6-15", "6 a 15", "6 to 15"), opt("16-30", "16 a 30", "16 to 30"), opt("mais-de-30", "Mais de 30", "More than 30")] },
      { id: "q7", type: "single", text: { pt: "Algum contato deve evoluir para negócio?", en: "Do you expect any of these contacts to turn into business?" }, options: DEAL_PROGRESS_OPTIONS },
      { id: "q8", type: "scale", text: { pt: "Como você avalia o relacionamento com a equipe da ABVCAP ao longo do processo?", en: "How would you rate your relationship with the ABVCAP team throughout the process?" }, anchors: { pt: ["Muito ruim", "Excelente"], en: ["Very poor", "Excellent"] } },
      { id: "q9", type: "text", text: { pt: "Que contrapartida faria diferença em 2027 e hoje não existe?", en: "What benefit would make a difference in 2027 that doesn't exist today?" }, optional: true },
      { id: "q10", type: "text", text: { pt: "Algum comentário ou sugestão?", en: "Any comments or suggestions?" }, optional: true },
    ],
  },
  "gestores-lpday": {
    title: { pt: "Pesquisa · Gestores (LP Day)", en: "Survey · Fund Managers (LP Day)" },
    audience: { pt: "Para gestores participantes das agendas de matchmaking", en: "For fund managers who took part in the matchmaking agendas" },
    estimate: { pt: "3 a 4 minutos", en: "3 to 4 minutes" },
    thankYou: { pt: "Obrigado pela participação! Suas respostas vão ajudar a melhorar as próximas edições.", en: "Thank you for taking part! Your answers will help improve future editions." },
    questions: [
      { id: "q1", type: "short", text: { pt: "Nome", en: "Name" }, optional: false },
      { id: "q2", type: "short", text: { pt: "Gestora", en: "Fund manager" }, optional: false },
      { id: "q3", type: "short", text: { pt: "Cargo", en: "Position" }, optional: false },
      { id: "q3b", type: "short", text: { pt: "Qual o CNPJ?", en: "What is the company's tax ID (CNPJ)?" }, placeholder: { pt: "00.000.000/0000-00", en: "00.000.000/0000-00" }, optional: true },
      { id: "q4", type: "single", text: { pt: "Quantas conversas profissionalmente relevantes você teve durante o evento?", en: "How many professionally relevant conversations did you have during the event?" }, options: FREQ_OPTIONS },
      { id: "q5", type: "single", text: { pt: "Quantos desses contatos eram novos para você ou para sua gestora?", en: "How many of these contacts were new to you or your fund manager?" }, options: FREQ_OPTIONS_M },
      { id: "q6", type: "multi", text: { pt: "Quais foram os principais tipos de contatos realizados?", en: "What were the main types of contacts made?" }, options: [
        opt("investidores-institucionais", "Investidores institucionais", "Institutional investors"),
        opt("family-offices", "Family offices", "Family offices"),
        opt("fundos-de-fundos", "Fundos de fundos", "Funds of funds"),
        opt("gestores", "Gestores", "Fund managers"),
        opt("empresas-corporates", "Empresas / corporates", "Companies / corporates"),
        opt("instituicoes-desenvolvimento", "Instituições de desenvolvimento", "Development finance institutions"),
        opt("outros", "Outros", "Other"),
      ] },
      { id: "q7", type: "single", text: { pt: "Alguma dessas conversas deve evoluir para investimento, parceria ou outra oportunidade concreta?", en: "Do you expect any of these conversations to turn into an investment, partnership, or other concrete opportunity?" }, options: DEAL_PROGRESS_OPTIONS_LPDAY },
      { id: "q8", type: "single", text: { pt: "Quantos contatos seguem em negociação ou acompanhamento após o evento?", en: "How many contacts remain under negotiation or follow-up after the event?" }, options: FREQ_OPTIONS_M },
      { id: "q9", type: "single", text: { pt: "Há algum contato que tenha avançado para análise mais aprofundada ou processo de diligência?", en: "Has any contact progressed to a more in-depth analysis or due diligence process?" }, options: [
        opt("sim", "Sim", "Yes"),
        opt("ainda-nao-potencial", "Ainda não, mas há potencial", "Not yet, but there is potential"),
        opt("nao", "Não", "No"),
      ] },
      { id: "q10", type: "text", text: { pt: "Qual a expectativa de negócios ou investimentos para os próximos 12 meses decorrentes dos contatos realizados no evento?", en: "What is your expectation for business or investments over the next 12 months resulting from the contacts made at the event?" }, hint: { pt: "Informar valor aproximado em US$ milhões, quando aplicável.", en: "Indicate an approximate value in US$ million, when applicable." }, optional: false },
      { id: "q11", type: "single", text: { pt: "Qual foi o papel da ABVCAP / programa inBrazil na geração ou no avanço dessas oportunidades?", en: "What role did ABVCAP / the inBrazil program play in generating or advancing these opportunities?" }, options: [
        opt("fundamental", "Fundamental", "Fundamental"),
        opt("relevante", "Relevante", "Relevant"),
        opt("parcial", "Parcial", "Partial"),
        opt("pequeno", "Pequeno", "Small"),
        opt("nenhum", "Nenhum", "None"),
      ] },
      { id: "q12", type: "single", text: { pt: "Após a participação no evento, sua gestora identificou necessidade de ajustar sua estratégia de captação ou atuação internacional?", en: "After taking part in the event, did your fund manager identify a need to adjust its fundraising strategy or international activity?" }, options: [opt("sim", "Sim", "Yes"), opt("nao", "Não", "No")] },
      { id: "q13", type: "text", text: { pt: "Se respondeu SIM, qual aspecto da estratégia pretende ajustar?", en: "If you answered YES, which aspect of the strategy do you plan to adjust?" }, optional: false, showIf: { q: "q12", equals: "sim" }, numberLabel: "13.1" },
      { id: "q14", type: "scale", text: { pt: "Como você avalia a qualidade dos investidores e das reuniões de matchmaking?", en: "How would you rate the quality of the investors and the matchmaking meetings?" }, anchors: { pt: ["Muito ruim", "Excelente"], en: ["Very poor", "Excellent"] } },
      { id: "q15", type: "scale", text: { pt: "Como você avalia a organização da ação e o apoio da equipe da ABVCAP?", en: "How would you rate the organization of the activity and the support from the ABVCAP team?" }, anchors: { pt: ["Muito ruim", "Excelente"], en: ["Very poor", "Excellent"] } },
      { id: "q16", type: "text", text: { pt: "O que mais funcionou e o que poderia ser melhorado?", en: "What worked best and what could be improved?" }, optional: true },
      { id: "q17", type: "multi", text: { pt: "Quais ações você pretende ou tem interesse em participar no âmbito do programa inBrazil?", en: "Which activities do you intend to or are interested in taking part in under the inBrazil program?" }, options: INBRAZIL_ACTIVITIES_OPTIONS, optional: true },
    ],
  },
  "investidores-lpday": {
    title: { pt: "Pesquisa · Investidores (LPs)", en: "Survey · Investors (LPs)" },
    audience: { pt: "Para investidores participantes das agendas e atividades do Experience", en: "For investors who took part in the Experience's agendas and activities" },
    estimate: { pt: "3 a 4 minutos", en: "3 to 4 minutes" },
    thankYou: { pt: "Obrigado pela participação! Suas respostas vão ajudar a melhorar as próximas edições.", en: "Thank you for taking part! Your answers will help improve future editions." },
    questions: [
      { id: "q1", type: "short", text: { pt: "Nome", en: "Name" }, optional: true },
      { id: "q2", type: "short", text: { pt: "Instituição", en: "Institution" }, optional: true },
      { id: "q3", type: "short", text: { pt: "País", en: "Country" }, optional: true },
      { id: "q4", type: "short", text: { pt: "Cargo", en: "Position" }, optional: true },
      { id: "q5", type: "single", text: { pt: "Qual o perfil da sua instituição?", en: "What is your institution's profile?" }, options: [
        opt("fundo-pensao", "Fundo de pensão", "Pension fund"),
        opt("endowment-foundation", "Endowment / foundation", "Endowment / foundation"),
        opt("family-office", "Family office", "Family office"),
        opt("fundo-de-fundos", "Fundo de fundos", "Fund of funds"),
        opt("asset-manager", "Asset manager", "Asset manager"),
        opt("instituicao-financeira-banco", "Instituição financeira / banco", "Financial institution / bank"),
        opt("instituicao-desenvolvimento", "Instituição de desenvolvimento", "Development finance institution"),
        opt("corporate-investor", "Corporate investor", "Corporate investor"),
        opt("outro", "Outro", "Other"),
      ] },
      { id: "q6", type: "single", text: { pt: "Quantas gestoras brasileiras você conheceu durante o evento?", en: "How many Brazilian fund managers did you meet during the event?" }, options: FREQ_OPTIONS },
      { id: "q7", type: "single", text: { pt: "Quantas dessas gestoras você ainda não conhecia anteriormente?", en: "How many of these fund managers had you not previously known?" }, options: FREQ_OPTIONS },
      { id: "q8", type: "single", text: { pt: "Alguma das gestoras ou oportunidades apresentadas deverá evoluir para uma conversa mais aprofundada?", en: "Are any of the fund managers or opportunities presented expected to lead to a more in-depth conversation?" }, options: DEAL_PROGRESS_OPTIONS_LPDAY },
      { id: "q9", type: "single", text: { pt: "Quantas gestoras ou empresas avançaram para análise mais aprofundada ou processo de diligência?", en: "How many fund managers or companies progressed to a more in-depth analysis or due diligence process?" }, options: DILIGENCE_PROGRESS_OPTIONS },
      { id: "q10", type: "multi", text: { pt: "Quais próximos passos você prevê a partir dessas conexões?", en: "What next steps do you anticipate from these connections?" }, options: [
        opt("acompanhamento-futuro", "Acompanhamento para oportunidades futuras", "Follow-up for future opportunities"),
        opt("discussao-investimento", "Discussão de potencial investimento", "Discussion of potential investment"),
        opt("nenhum-momento", "Nenhum neste momento", "None at this time"),
        opt("outro", "Outro", "Other"),
      ] },
      { id: "q11", type: "single", text: { pt: "Sua instituição possui atualmente interesse em ampliar sua exposição a alternativos no Brasil?", en: "Is your institution currently interested in increasing its exposure to alternative investments in Brazil?" }, options: [
        opt("sim-curto-prazo", "Sim, no curto prazo", "Yes, in the short term"),
        opt("sim-medio-prazo", "Sim, no médio prazo", "Yes, in the medium term"),
        opt("avaliando-sem-definicao", "Estamos avaliando oportunidades, mas sem definição", "We are evaluating opportunities but without a defined timeline"),
        opt("nao-momento", "Não neste momento", "Not at this time"),
      ] },
      { id: "q12", type: "multi", text: { pt: "Quais estratégias despertaram maior interesse?", en: "Which strategies generated the greatest interest?" }, options: [
        opt("venture-capital", "Venture Capital", "Venture Capital"),
        opt("growth-equity", "Growth Equity", "Growth Equity"),
        opt("buyout", "Buyout", "Buyout"),
        opt("infrastructure", "Infrastructure", "Infrastructure"),
        opt("private-credit", "Private Credit", "Private Credit"),
        opt("impact", "Impact", "Impact"),
        opt("special-situations", "Special Situations", "Special Situations"),
        opt("outras", "Outras", "Other"),
      ] },
      { id: "q13", type: "text", text: { pt: "Caso aplicável, qual faixa de compromisso ou investimento sua instituição costuma considerar?", en: "If applicable, what commitment or investment range does your institution typically consider?" }, hint: { pt: "Informar faixa aproximada em US$.", en: "Indicate an approximate range in US$." }, optional: true },
      { id: "q14", type: "scale", text: { pt: "De 0 a 10, em que medida o evento ampliou seu conhecimento sobre o mercado brasileiro de Private Equity e Venture Capital?", en: "From 0 to 10, to what extent did the event expand your knowledge of the Brazilian Private Equity and Venture Capital market?" }, anchors: { pt: ["Nada", "Totalmente"], en: ["Not at all", "Completely"] } },
      { id: "q15", type: "scale", text: { pt: "De 0 a 10, em que medida o evento contribuiu para identificar novas oportunidades de investimento no mercado de capital privado no Brasil?", en: "From 0 to 10, to what extent did the event contribute to identifying new investment opportunities in Brazil's private capital market?" }, anchors: { pt: ["Nada", "Totalmente"], en: ["Not at all", "Completely"] } },
      { id: "q16", type: "scale", text: { pt: "Como você avalia a qualidade das gestoras e oportunidades apresentadas?", en: "How do you rate the quality of the fund managers and opportunities presented?" }, anchors: { pt: ["Muito ruim", "Excelente"], en: ["Very poor", "Excellent"] } },
      { id: "q17", type: "scale", text: { pt: "Como você avalia o matchmaking e o apoio da equipe da ABVCAP?", en: "How do you rate the matchmaking and support provided by the ABVCAP team?" }, anchors: { pt: ["Muito ruim", "Excelente"], en: ["Very poor", "Excellent"] } },
      { id: "q18", type: "text", text: { pt: "O que poderia facilitar uma maior alocação de capital no mercado brasileiro?", en: "What could facilitate a greater allocation of capital to the Brazilian market?" }, optional: true },
      { id: "q19", type: "text", text: { pt: "Algum comentário ou sugestão para as próximas edições?", en: "Any comments or suggestions for future editions?" }, optional: true },
      { id: "q20", type: "multi", text: { pt: "Quais ações você pretende ou tem interesse em participar?", en: "Which activities are you interested in participating in?" }, options: INBRAZIL_ACTIVITIES_OPTIONS },
    ],
  },
  "carlos-responsability": {
    title: { pt: "Pesquisa · Carlos — responsAbility Investments", en: "Survey · Carlos — responsAbility Investments" },
    audience: { pt: "Para Carlos / responsAbility Investments", en: "For Carlos / responsAbility Investments" },
    estimate: { pt: "6 a 8 minutos", en: "6 to 8 minutes" },
    thankYou: { pt: "Obrigado pelo retorno detalhado! Isso vai ajudar a ABVCAP a dar continuidade às conexões geradas.", en: "Thank you for the detailed feedback! This will help ABVCAP follow up on the connections generated." },
    questions: [
      { id: "q1", type: "scale", text: { pt: "Em que medida os objetivos da sua participação foram atingidos?", en: "To what extent were the objectives of your participation achieved?" }, anchors: { pt: ["Nada", "Totalmente"], en: ["Not at all", "Completely"] } },
      { id: "q2", type: "single", text: { pt: "Quantas gestoras brasileiras você conheceu ou com quem teve conversas relevantes durante o evento?", en: "How many Brazilian fund managers did you meet or have relevant conversations with during the event?" }, options: FREQ_OPTIONS },
      { id: "q3", type: "single", text: { pt: "Quantos novos relacionamentos foram gerados a partir da participação viabilizada pelo Convênio?", en: "How many new relationships were generated from the participation made possible by the Convênio?" }, options: FREQ_OPTIONS_M },
      { id: "q4", type: "short", inputType: "number", optional: false, text: { pt: "Das reuniões realizadas, quantos contatos eram novos para você ou para a responsAbility Investments?", en: "Of the meetings held, how many contacts were new to you or to responsAbility Investments?" } },
      { id: "q5", type: "short", inputType: "number", optional: false, text: { pt: "Quantos desses contatos seguem em negociação ou acompanhamento após o evento?", en: "How many of these contacts remain under negotiation or follow-up after the event?" } },
      { id: "q6", type: "short", inputType: "number", optional: false, text: { pt: "Quantos fundos ou empresas avançaram para análise mais aprofundada ou processo de diligência?", en: "How many funds or companies progressed to a more in-depth analysis or due diligence process?" } },
      { id: "q7", type: "single", text: { pt: "Há uma estimativa de investimentos ou negócios potencialmente relacionados às conexões realizadas?", en: "Is there an estimate of investments or business potentially related to the connections made?" }, options: [
        opt("sim", "Sim", "Yes"),
        opt("ainda-nao-possivel", "Ainda não é possível estimar", "Not yet possible to estimate"),
        opt("nao", "Não", "No"),
      ] },
      { id: "q8", type: "text", text: { pt: "Qual a expectativa de geração de negócios ou investimentos nos próximos 12 meses em decorrência da participação?", en: "What is your expectation for generating business or investments over the next 12 months as a result of this participation?" }, hint: { pt: "Informar valor aproximado em US$, quando aplicável.", en: "Indicate an approximate value in US$, when applicable." }, optional: true },
      { id: "q9", type: "matrix", text: { pt: "Para cada reunião abaixo, indique uma nota de 0 a 10 para a relevância da conversa, se haverá continuidade e um breve feedback.", en: "For each meeting below, indicate a score from 0 to 10 for how relevant the conversation was, whether there will be follow-up, and brief feedback." }, rows: CARLOS_MEETING_ROWS, continuityOptions: MATRIX_CONTINUITY_OPTIONS, scoreLabel: { pt: "Nota (0–10) para a relevância da conversa", en: "Score (0–10) for how relevant the conversation was" }, continuityLabel: { pt: "Vai ter continuidade?", en: "Will there be follow-up?" }, feedbackLabel: { pt: "Feedback / próximo passo", en: "Feedback / next step" } },
      { id: "q10", type: "text", text: { pt: "Quais reuniões você considera prioritárias para acompanhamento pela ABVCAP?", en: "Which meetings do you consider a priority for ABVCAP to follow up on?" }, optional: true },
      { id: "q11", type: "scale", text: { pt: "Em que medida o apoio viabilizado pelo Convênio contribuiu para sua participação e para os resultados obtidos?", en: "To what extent did the support made possible by the Convênio contribute to your participation and to the results obtained?" }, anchors: { pt: ["Nada", "Totalmente"], en: ["Not at all", "Completely"] } },
      { id: "q12", type: "scale", text: { pt: "Como você avalia o conteúdo do evento?", en: "How would you rate the event's content?" }, anchors: { pt: ["Muito ruim", "Excelente"], en: ["Very poor", "Excellent"] } },
      { id: "q13", type: "scale", text: { pt: "Como você avalia a infraestrutura e a organização do evento?", en: "How would you rate the event's infrastructure and organization?" }, anchors: { pt: ["Muito ruim", "Excelente"], en: ["Very poor", "Excellent"] } },
      { id: "q14", type: "scale", text: { pt: "Como você avalia a qualidade das reuniões organizadas?", en: "How would you rate the quality of the meetings organized?" }, anchors: { pt: ["Muito ruim", "Excelente"], en: ["Very poor", "Excellent"] } },
      { id: "q15", type: "text", text: { pt: "Algum comentário adicional sobre a participação, as reuniões ou os próximos passos?", en: "Any additional comments about the participation, the meetings, or next steps?" }, optional: true },
      { id: "q16", type: "multi", text: { pt: "Quais ações você pretende ou tem interesse em participar?", en: "Which activities do you intend to or are interested in taking part in?" }, options: INBRAZIL_ACTIVITIES_OPTIONS },
    ],
  },
};

function scaleAnchorsHtml(anchors) {
  if (!anchors) return "";
  const [lo, hi] = tr(anchors);
  return `<div class="scale-anchors"><span>0 · ${escapeHtml(lo)}</span><span>10 · ${escapeHtml(hi)}</span></div>`;
}

/** Uma linha da pergunta "matriz" (nota 0-10 + continuidade + feedback para um item, ex.: uma reuniao especifica). */
function renderMatrixRowHtml(q, row) {
  const scaleButtons = Array.from({ length: 11 }, (_, n) => `<button type="button" class="scale-btn" data-value="${n}">${n}</button>`).join("");
  const continuityOptions = q.continuityOptions
    .map((o) => `<label class="choice-option"><input type="radio" name="matrix-continuity-${q.id}-${row.value}" value="${escapeHtml(o.value)}" /><span>${escapeHtml(tr(o))}</span></label>`)
    .join("");
  return `
    <div class="matrix-row" data-row="${row.value}">
      <div class="matrix-row-title">${escapeHtml(row.label)}</div>
      <div class="matrix-field">
        <div class="matrix-field-label">${escapeHtml(tr(q.scoreLabel))}</div>
        <div class="scale-row" data-qid="matrix-score-${q.id}-${row.value}">${scaleButtons}</div>
      </div>
      <div class="matrix-field">
        <div class="matrix-field-label">${escapeHtml(tr(q.continuityLabel))}</div>
        <div class="choice-group choice-group-inline" data-type="single">${continuityOptions}</div>
      </div>
      <div class="matrix-field">
        <div class="matrix-field-label">${escapeHtml(tr(q.feedbackLabel))}</div>
        <textarea data-qid="matrix-feedback-${q.id}-${row.value}" rows="2" maxlength="400" placeholder="${escapeHtml(ns("writeHere"))}"></textarea>
      </div>
    </div>
  `;
}

function renderQuestionHtml(q, index, dynamicOptions) {
  const optionalTag = q.optional ? `<span class="q-optional"> ${escapeHtml(ns("optional"))}</span>` : "";
  const hint = q.hint ? `<div class="hint">${escapeHtml(tr(q.hint))}</div>` : "";
  let body = "";

  if (q.type === "nps" || q.type === "scale") {
    const buttons = Array.from({ length: 11 }, (_, n) => `<button type="button" class="scale-btn" data-value="${n}">${n}</button>`).join("");
    body = `<div class="scale-row" data-qid="${q.id}">${buttons}</div>${scaleAnchorsHtml(q.anchors)}`;
  } else if (q.type === "single" || q.type === "multi") {
    const inputType = q.type === "single" ? "radio" : "checkbox";
    const opts = dynamicOptions || q.options;
    body = `<div class="choice-group" data-qid="${q.id}" data-type="${q.type}"${q.maxSelect ? ` data-max="${q.maxSelect}"` : ""}>${opts
      .map((o) => `<label class="choice-option"><input type="${inputType}" name="${q.id}" value="${escapeHtml(o.value)}" /><span>${escapeHtml(tr(o))}</span></label>`)
      .join("")}</div>`;
  } else if (q.type === "text") {
    body = `<textarea data-qid="${q.id}" rows="3" maxlength="600" placeholder="${escapeHtml(ns("writeHere"))}"></textarea>`;
  } else if (q.type === "short") {
    const inputType = q.inputType === "email" ? "email" : q.inputType === "number" ? "number" : "text";
    body = `<input type="${inputType}" data-qid="${q.id}" maxlength="200" placeholder="${q.placeholder ? escapeHtml(tr(q.placeholder)) : ""}" />`;
  } else if (q.type === "consent") {
    body = `<label class="choice-option"><input type="checkbox" data-qid="${q.id}" /><span>${escapeHtml(tr(q.consentLabel))}</span></label>`;
  } else if (q.type === "matrix") {
    body = q.rows.map((row) => renderMatrixRowHtml(q, row)).join("");
  }

  return `
    <div class="nps-question" id="question-${q.id}" data-qid="${q.id}">
      <div class="q-text">${index}. ${escapeHtml(tr(q.text))}${optionalTag}</div>
      ${hint}
      ${body}
      <div class="nps-error">${escapeHtml(ns("requiredError"))}</div>
    </div>
  `;
}

function wireScaleButtons(root) {
  root.querySelectorAll(".scale-row").forEach((row) => {
    row.querySelectorAll(".scale-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        row.querySelectorAll(".scale-btn").forEach((b) => b.classList.remove("selected"));
        btn.classList.add("selected");
        row.dataset.value = btn.dataset.value;
        row.closest(".nps-question").classList.remove("has-error");
      });
    });
  });
}

function wireMultiMax(root) {
  root.querySelectorAll('.choice-group[data-type="multi"][data-max]').forEach((group) => {
    const max = Number(group.dataset.max);
    const inputs = Array.from(group.querySelectorAll('input[type="checkbox"]'));
    inputs.forEach((input) => {
      input.addEventListener("change", () => {
        const checked = inputs.filter((i) => i.checked);
        inputs.forEach((i) => {
          i.disabled = checked.length >= max && !i.checked;
        });
        group.closest(".nps-question").classList.remove("has-error");
      });
    });
  });
}

function wireChoiceErrorClear(root) {
  root.querySelectorAll('.choice-group[data-type="single"] input').forEach((input) => {
    input.addEventListener("change", () => input.closest(".nps-question").classList.remove("has-error"));
  });
}

function wireShortErrorClear(root) {
  root.querySelectorAll("input[data-qid]").forEach((input) => {
    input.addEventListener("input", () => input.closest(".nps-question").classList.remove("has-error"));
  });
}

/** Perguntas com showIf so aparecem quando a pergunta controladora tem a resposta esperada:
 *  { equals: valor canonico } para perguntas de escolha, ou { filled: true } para pergunta
 *  de texto/short controladora nao-vazia (ex.: campo email so aparece apos o nome ser preenchido). */
function wireConditionalQuestions(root, survey) {
  survey.questions.forEach((q) => {
    if (!q.showIf) return;
    const target = root.querySelector(`#question-${q.id}`);
    // Para { filled: true } o controlador precisa ser o <input> em si (nao o div
    // wrapper "#question-X", que tambem carrega data-qid e seria encontrado primeiro).
    const controllerGroup = q.showIf.filled
      ? root.querySelector(`input[data-qid="${q.showIf.q}"]`)
      : root.querySelector(`[data-qid="${q.showIf.q}"]`);
    if (!controllerGroup) return;
    function evaluate() {
      const matches = q.showIf.filled
        ? controllerGroup.value.trim().length > 0
        : Array.from(controllerGroup.querySelectorAll("input:checked")).some((i) => i.value === q.showIf.equals);
      target.style.display = matches ? "" : "none";
    }
    controllerGroup.addEventListener("change", evaluate);
    controllerGroup.addEventListener("input", evaluate);
    evaluate();
  });
}

function collectAnswers(root, survey) {
  const answers = {};
  let valid = true;
  let npsScore = null;

  survey.questions.forEach((q) => {
    const qEl = root.querySelector(`#question-${q.id}`);
    if (qEl.style.display === "none") return; // pergunta condicional oculta

    if (q.type === "nps" || q.type === "scale") {
      const row = root.querySelector(`.scale-row[data-qid="${q.id}"]`);
      if (row.dataset.value === undefined) {
        if (!q.optional) { qEl.classList.add("has-error"); valid = false; }
        return;
      }
      const value = Number(row.dataset.value);
      answers[q.id] = value;
      if (q.primary) npsScore = value;
    } else if (q.type === "single") {
      const checked = root.querySelector(`input[name="${q.id}"]:checked`);
      if (!checked) {
        if (!q.optional) { qEl.classList.add("has-error"); valid = false; }
        return;
      }
      answers[q.id] = checked.value;
    } else if (q.type === "multi") {
      const checked = Array.from(root.querySelectorAll(`input[name="${q.id}"]:checked`)).map((i) => i.value);
      if (!checked.length) {
        if (!q.optional) { qEl.classList.add("has-error"); valid = false; }
        return;
      }
      answers[q.id] = checked;
    } else if (q.type === "text") {
      const value = root.querySelector(`textarea[data-qid="${q.id}"]`).value.trim();
      if (!value) {
        if (q.optional === false) { qEl.classList.add("has-error"); valid = false; }
        return;
      }
      answers[q.id] = value;
    } else if (q.type === "short") {
      const value = root.querySelector(`input[data-qid="${q.id}"]`).value.trim();
      const isRequired = q.optional === false || (q.requiredIf && !!answers[q.requiredIf.q]);
      if (!value) {
        if (isRequired) { qEl.classList.add("has-error"); valid = false; }
        return;
      }
      answers[q.id] = value;
    } else if (q.type === "consent") {
      const checked = root.querySelector(`input[data-qid="${q.id}"]`).checked;
      const isRequired = q.optional === false || (q.requiredIf && !!answers[q.requiredIf.q]);
      if (!checked) {
        if (isRequired) { qEl.classList.add("has-error"); valid = false; }
        return;
      }
      answers[q.id] = true;
    } else if (q.type === "matrix") {
      // Sempre opcional por linha - nem toda reuniao listada necessariamente aconteceu.
      const matrixAnswers = {};
      q.rows.forEach((row) => {
        const scoreRow = root.querySelector(`.scale-row[data-qid="matrix-score-${q.id}-${row.value}"]`);
        const continuityChecked = root.querySelector(`input[name="matrix-continuity-${q.id}-${row.value}"]:checked`);
        const feedbackEl = root.querySelector(`textarea[data-qid="matrix-feedback-${q.id}-${row.value}"]`);
        const score = scoreRow && scoreRow.dataset.value !== undefined ? Number(scoreRow.dataset.value) : null;
        const continuity = continuityChecked ? continuityChecked.value : null;
        const feedback = feedbackEl ? feedbackEl.value.trim() : "";
        if (score !== null || continuity || feedback) {
          matrixAnswers[row.value] = {};
          if (score !== null) matrixAnswers[row.value].score = score;
          if (continuity) matrixAnswers[row.value].continuity = continuity;
          if (feedback) matrixAnswers[row.value].feedback = feedback;
        }
      });
      if (Object.keys(matrixAnswers).length) answers[q.id] = matrixAnswers;
    }
  });

  return { answers, valid, npsScore };
}

function wireSubmit(root, survey, surveyKey) {
  const form = root.querySelector("#nps-form");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (form.website.value) return; // honeypot

    root.querySelectorAll(".nps-question.has-error").forEach((q) => q.classList.remove("has-error"));
    const { answers, valid, npsScore } = collectAnswers(root, survey);

    if (!valid) {
      const firstError = root.querySelector(".has-error");
      if (firstError) firstError.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    const submitBtn = root.querySelector("#nps-submit");
    submitBtn.disabled = true;
    submitBtn.textContent = ns("submitting");

    const { error } = await sb.from("vcday_nps_responses").insert({
      survey_slug: surveyKey,
      event_slug: NPS_EVENT_SLUG,
      nps_score: npsScore,
      answers,
    });

    submitBtn.disabled = false;
    submitBtn.textContent = ns("submit");

    if (error) {
      console.error(error);
      alert(ns("submitError"));
      return;
    }

    form.style.display = "none";
    root.querySelector("#nps-success").style.display = "block";
  });
}

async function renderSurvey(surveyKey, rootId) {
  const survey = SURVEYS[surveyKey];
  const root = document.getElementById(rootId);

  document.title = `${tr(survey.title)} · ABVCAP Experience 2026`;
  const eyebrowEl = document.getElementById("nps-eyebrow");
  if (eyebrowEl) eyebrowEl.textContent = `ABVCAP Experience 2026 · ${ns("postEventSurvey")}`;
  const titleEl = document.getElementById("nps-title");
  if (titleEl) titleEl.textContent = tr(survey.title);
  const audienceEl = document.getElementById("nps-audience");
  if (audienceEl) audienceEl.textContent = `${tr(survey.audience)} · ${ns("estimatedTime")}: ${tr(survey.estimate)}`;
  const introEl = document.getElementById("nps-intro");
  if (introEl) {
    if (survey.intro) {
      introEl.textContent = tr(survey.intro);
      introEl.style.display = "block";
    } else {
      introEl.style.display = "none";
    }
  }

  root.innerHTML = `<div class="card" style="padding: 18px; color: var(--ink-faint);">${escapeHtml(ns("loading"))}</div>`;

  const needsPanels = survey.questions.some((q) => q.optionsSource === "panels");
  const needsVcdayPanels = survey.questions.some((q) => q.optionsSource === "vcday-panels");
  const panelOptions = needsPanels ? await npsPanelOptions() : null;
  const vcdayPanelOptions = needsVcdayPanels ? await npsVcdayPanelOptions() : null;

  // Perguntas com numberLabel (ex.: "1.1") usam esse rotulo fixo em vez do
  // contador sequencial, e nao consomem um numero - assim nome/email/consentimento
  // aparecem como 1 / 1.1 / 1.2 e a proxima pergunta continua em 2, nao em 4.
  let questionCounter = 0;
  const questionsHtml = survey.questions
    .map((q) => {
      const displayIndex = q.numberLabel || String(++questionCounter);
      return renderQuestionHtml(q, displayIndex, q.optionsSource === "panels" ? panelOptions : q.optionsSource === "vcday-panels" ? vcdayPanelOptions : null);
    })
    .join("");

  root.innerHTML = `
    <form id="nps-form">
      ${questionsHtml}
      <input type="text" name="website" class="honeypot" tabindex="-1" autocomplete="off" />
      <button type="submit" class="btn btn-accent btn-block" id="nps-submit">${escapeHtml(ns("submit"))}</button>
    </form>
    <div id="nps-success" class="card" style="display:none; padding: 28px; text-align: center;">
      <h3 style="margin-bottom: 10px;">${escapeHtml(ns("successTitle"))}</h3>
      <p style="color: var(--ink-soft); margin: 0;">${escapeHtml(tr(survey.thankYou))}</p>
    </div>
  `;

  wireScaleButtons(root);
  wireMultiMax(root);
  wireChoiceErrorClear(root);
  wireShortErrorClear(root);
  wireConditionalQuestions(root, survey);
  wireSubmit(root, survey, surveyKey);
}
