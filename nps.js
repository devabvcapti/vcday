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
      { id: "email", type: "short", inputType: "email", text: { pt: "E-mail", en: "Email" }, placeholder: { pt: "seu@email.com", en: "you@email.com" }, hint: { pt: "Obrigatório se você preencher o nome acima.", en: "Required if you fill in your name above." }, showIf: { q: "nome", filled: true }, requiredIf: { q: "nome" } },
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
      { id: "email", type: "short", inputType: "email", text: { pt: "E-mail", en: "Email" }, placeholder: { pt: "seu@email.com", en: "you@email.com" }, hint: { pt: "Obrigatório se você preencher o nome acima.", en: "Required if you fill in your name above." }, showIf: { q: "nome", filled: true }, requiredIf: { q: "nome" } },
      { id: "q1", type: "nps", primary: true, text: { pt: "De 0 a 10, qual a probabilidade de você recomendar o VC Day ABVCAP a um colega?", en: "On a scale of 0 to 10, how likely are you to recommend the ABVCAP VC Day to a colleague?" }, anchors: { pt: ["Nada provável", "Extremamente provável"], en: ["Not at all likely", "Extremely likely"] } },
      { id: "q2", type: "scale", text: { pt: "Como você avalia o Congresso de forma geral?", en: "How would you rate the Congress overall?" }, anchors: { pt: ["Muito ruim", "Excelente"], en: ["Very poor", "Excellent"] } },
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
      { id: "q1", type: "single", text: { pt: "Qual foi sua participação no Congresso?", en: "What was your role at the Congress?" }, options: [opt("painelista", "Painelista", "Panelist"), opt("moderador", "Moderador", "Moderator")] },
      { id: "q2", type: "nps", primary: true, text: { pt: "De 0 a 10, qual a probabilidade de você participar novamente em 2027?", en: "On a scale of 0 to 10, how likely are you to take part again in 2027?" }, anchors: { pt: ["Nada provável", "Extremamente provável"], en: ["Not at all likely", "Extremely likely"] } },
      { id: "q3", type: "scale", text: { pt: "Como você avalia a experiência de participar do Congresso?", en: "How would you rate your experience taking part in the Congress?" }, anchors: { pt: ["Muito ruim", "Excelente"], en: ["Very poor", "Excellent"] } },
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
      { id: "q1", type: "multi", text: { pt: "Qual frente sua empresa patrocinou?", en: "Which event did your company sponsor?" }, options: [opt("congresso", "Congresso", "Congress"), opt("vc-day", "VC Day", "VC Day"), opt("lp-day", "LP Day", "LP Day")] },
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
};

function scaleAnchorsHtml(anchors) {
  if (!anchors) return "";
  const [lo, hi] = tr(anchors);
  return `<div class="scale-anchors"><span>0 · ${escapeHtml(lo)}</span><span>10 · ${escapeHtml(hi)}</span></div>`;
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
    const inputType = q.inputType === "email" ? "email" : "text";
    body = `<input type="${inputType}" data-qid="${q.id}" maxlength="200" placeholder="${q.placeholder ? escapeHtml(tr(q.placeholder)) : ""}" />`;
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
      if (value) answers[q.id] = value;
    } else if (q.type === "short") {
      const value = root.querySelector(`input[data-qid="${q.id}"]`).value.trim();
      const isRequired = q.optional === false || (q.requiredIf && !!answers[q.requiredIf.q]);
      if (!value) {
        if (isRequired) { qEl.classList.add("has-error"); valid = false; }
        return;
      }
      answers[q.id] = value;
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

  const questionsHtml = survey.questions
    .map((q, i) => renderQuestionHtml(q, i + 1, q.optionsSource === "panels" ? panelOptions : q.optionsSource === "vcday-panels" ? vcdayPanelOptions : null))
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
