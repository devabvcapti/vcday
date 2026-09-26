// --- Pesquisas NPS pos-evento -------------------------------------------
// Motor generico: cada pesquisa e uma lista de perguntas (SURVEYS abaixo),
// renderizada/validada/enviada pelo mesmo codigo, para nao duplicar HTML/JS
// entre as 4 pesquisas (Participantes, Painelistas e Moderadores,
// Patrocinadores e Apoiadores, Women Connection). Depende de app.js (sb,
// escapeHtml, fetchPanels, panelName).

const NPS_EVENT_SLUG = "experience-2026";

/** Nomes dos 18 "Painel N: ..." do Congresso, para a pergunta de multipla escolha. */
async function npsPanelOptions() {
  const panels = await fetchPanels();
  return panels.filter((p) => p.id.startsWith("painel-")).map((p) => panelName(p));
}

const SURVEYS = {
  participantes: {
    title: "Pesquisa · Participantes",
    audience: "Para todos os inscritos presentes",
    estimate: "2 a 3 minutos",
    thankYou: "Obrigado pela participação! Suas respostas vão ajudar a moldar a próxima edição.",
    questions: [
      { id: "q1", type: "nps", primary: true, text: "De 0 a 10, qual a probabilidade de você recomendar o Congresso ABVCAP a um colega?", anchors: ["Nada provável", "Extremamente provável"] },
      { id: "q2", type: "scale", text: "Como você avalia o Congresso de forma geral?", anchors: ["Muito ruim", "Excelente"] },
      { id: "q3", type: "scale", text: "Como você avalia a qualidade do conteúdo dos painéis?", anchors: ["Muito ruim", "Excelente"] },
      { id: "q4", type: "multi", text: "Quais painéis foram os mais relevantes para você?", hint: "Escolha até 3.", maxSelect: 3, optionsSource: "panels" },
      { id: "q5", type: "single", text: "Quantas conversas profissionalmente relevantes você teve durante o evento?", options: ["Nenhuma", "1 a 2", "3 a 5", "6 a 10", "Mais de 10"] },
      { id: "q6", type: "single", text: "Alguma dessas conversas deve evoluir para negócio, parceria ou investimento?", options: ["Sim, já há conversa em andamento", "Talvez, é cedo para dizer", "Não"] },
      { id: "q7", type: "scale", text: "Como você avalia a estrutura do evento — local, sinalização, alimentação e credenciamento?", anchors: ["Muito ruim", "Excelente"] },
      { id: "q8", type: "single", text: "Você pretende participar da edição de 2027?", options: ["Sim, com certeza", "Provavelmente sim", "Ainda não sei", "Provavelmente não"] },
      { id: "q9", type: "text", text: "O que mais funcionou e o que faríamos diferente?", optional: true },
    ],
  },
  "painelistas-moderadores": {
    title: "Pesquisa · Painelistas e moderadores",
    audience: "Para quem participou das sessões como painelista ou moderador",
    estimate: "3 minutos",
    intro: "Sugerimos um único formulário — a primeira pergunta direciona o restante.",
    thankYou: "Obrigado pela contribuição! Seu retorno é essencial para melhorar a próxima edição.",
    questions: [
      { id: "q1", type: "single", text: "Qual foi sua participação no Congresso?", options: ["Painelista", "Moderador"] },
      { id: "q2", type: "nps", primary: true, text: "De 0 a 10, qual a probabilidade de você participar novamente em 2027?", anchors: ["Nada provável", "Extremamente provável"] },
      { id: "q3", type: "scale", text: "Como você avalia a experiência de participar do Congresso?", anchors: ["Muito ruim", "Excelente"] },
      { id: "q4", type: "scale", text: "Como você avalia o processo de alinhamento prévio — convite, calls e comunicação da equipe?", anchors: ["Muito ruim", "Excelente"] },
      { id: "q5", type: "single", text: "O material de briefing do painel foi útil para sua preparação?", options: ["Muito útil", "Útil", "Pouco útil", "Não recebi ou não utilizei"] },
      { id: "q6", type: "single", text: "Como você avalia o formato e a duração do painel de que participou?", options: ["Adequados", "O tempo foi curto para o número de participantes", "O tempo foi longo demais", "O recorte do tema poderia ser mais específico"] },
      { id: "q7", type: "scale", text: "Como você avalia o apoio da equipe no dia do evento?", anchors: ["Muito ruim", "Excelente"] },
      { id: "q8", type: "text", text: "Somente para moderadores: o que ajudaria a conduzir melhor da próxima vez?", optional: true, showIf: { q: "q1", equals: "Moderador" } },
      { id: "q9", type: "text", text: "Algum comentário ou sugestão para 2027?", optional: true },
    ],
  },
  patrocinadores: {
    title: "Pesquisa · Patrocinadores e apoiadores",
    audience: "Para as empresas que patrocinaram as frentes do Experience",
    estimate: "3 a 4 minutos",
    intro: "Esta pesquisa complementa o contato direto da equipe de patrocínios — não o substitui.",
    thankYou: "Obrigado pelo apoio e pelo retorno! Vamos usar isso para preparar 2027.",
    questions: [
      { id: "q1", type: "multi", text: "Qual frente sua empresa patrocinou?", options: ["Congresso", "VC Day", "LP Day", "Women Connection"] },
      { id: "q2", type: "nps", primary: true, text: "De 0 a 10, qual a probabilidade de sua empresa patrocinar o Experience em 2027?", anchors: ["Nada provável", "Extremamente provável"] },
      { id: "q3", type: "scale", text: "Como você avalia o retorno obtido frente ao investimento?", anchors: ["Muito ruim", "Excelente"] },
      { id: "q4", type: "scale", text: "Como você avalia a visibilidade da marca durante o evento?", anchors: ["Muito ruim", "Excelente"] },
      { id: "q5", type: "single", text: "A cota contratada entregou o que foi prometido?", options: ["Sim, integralmente", "Sim, na maior parte", "Parcialmente", "Não"] },
      { id: "q6", type: "single", text: "Quantos contatos qualificados sua empresa gerou no evento?", options: ["Nenhum", "1 a 5", "6 a 15", "16 a 30", "Mais de 30"] },
      { id: "q7", type: "single", text: "Algum contato deve evoluir para negócio?", options: ["Sim, já há conversa em andamento", "Talvez, é cedo para dizer", "Não"] },
      { id: "q8", type: "scale", text: "Como você avalia o relacionamento com a equipe da ABVCAP ao longo do processo?", anchors: ["Muito ruim", "Excelente"] },
      { id: "q9", type: "text", text: "Que contrapartida faria diferença em 2027 e hoje não existe?", optional: true },
      { id: "q10", type: "text", text: "Algum comentário ou sugestão?", optional: true },
    ],
  },
  "women-connection": {
    title: "Pesquisa · Women Connection",
    audience: "Para todas as convidadas presentes",
    estimate: "2 minutos",
    intro: "Evento de networking puro, sem painéis ou conteúdo programado — as perguntas focam nos encontros.",
    thankYou: "Obrigada pela participação! Seu retorno ajuda a tornar o próximo encontro ainda melhor.",
    questions: [
      { id: "q1", type: "nps", primary: true, text: "De 0 a 10, qual a probabilidade de você recomendar o Women Connection a uma colega?", anchors: ["Nada provável", "Extremamente provável"] },
      { id: "q2", type: "scale", text: "Como você avalia o encontro de forma geral?", anchors: ["Muito ruim", "Excelente"] },
      { id: "q3", type: "single", text: "Quantas conversas profissionalmente relevantes você teve?", options: ["Nenhuma", "1 a 2", "3 a 5", "6 a 10", "Mais de 10"] },
      { id: "q4", type: "single", text: "Quantas pessoas que você não conhecia antes você conheceu?", options: ["Nenhuma", "1 a 2", "3 a 5", "6 a 10", "Mais de 10"] },
      { id: "q5", type: "single", text: "Alguma dessas conversas deve evoluir para negócio, parceria ou oportunidade profissional?", options: ["Sim, já há conversa em andamento", "Talvez, é cedo para dizer", "Não"] },
      { id: "q6", type: "single", text: "O formato do encontro favoreceu as conexões?", options: ["Sim, plenamente", "Sim, em parte", "Não muito — faltou dinâmica que estimulasse a circulação", "Não"] },
      { id: "q7", type: "single", text: "Como você avalia a duração e o tamanho do grupo?", options: ["Ambos adequados", "O tempo foi curto", "O grupo poderia ser maior", "O grupo poderia ser menor"] },
      { id: "q8", type: "single", text: "Você pretende participar em 2027?", options: ["Sim, com certeza", "Provavelmente sim", "Ainda não sei", "Provavelmente não"] },
      { id: "q9", type: "text", text: "O que tornaria o encontro mais produtivo para você?", optional: true },
    ],
  },
};

function scaleAnchorsHtml(anchors) {
  if (!anchors) return "";
  return `<div class="scale-anchors"><span>0 · ${escapeHtml(anchors[0])}</span><span>10 · ${escapeHtml(anchors[1])}</span></div>`;
}

function renderQuestionHtml(q, index, dynamicOptions) {
  const optionalTag = q.optional ? `<span class="q-optional"> (opcional)</span>` : "";
  const hint = q.hint ? `<div class="hint">${escapeHtml(q.hint)}</div>` : "";
  let body = "";

  if (q.type === "nps" || q.type === "scale") {
    const buttons = Array.from({ length: 11 }, (_, n) => `<button type="button" class="scale-btn" data-value="${n}">${n}</button>`).join("");
    body = `<div class="scale-row" data-qid="${q.id}">${buttons}</div>${scaleAnchorsHtml(q.anchors)}`;
  } else if (q.type === "single" || q.type === "multi") {
    const inputType = q.type === "single" ? "radio" : "checkbox";
    const opts = dynamicOptions || q.options;
    body = `<div class="choice-group" data-qid="${q.id}" data-type="${q.type}"${q.maxSelect ? ` data-max="${q.maxSelect}"` : ""}>${opts
      .map((opt) => `<label class="choice-option"><input type="${inputType}" name="${q.id}" value="${escapeHtml(opt)}" /><span>${escapeHtml(opt)}</span></label>`)
      .join("")}</div>`;
  } else if (q.type === "text") {
    body = `<textarea data-qid="${q.id}" rows="3" maxlength="600" placeholder="Escreva aqui…"></textarea>`;
  }

  return `
    <div class="nps-question" id="question-${q.id}" data-qid="${q.id}">
      <div class="q-text">${index}. ${escapeHtml(q.text)}${optionalTag}</div>
      ${hint}
      ${body}
      <div class="nps-error">Essa pergunta é obrigatória.</div>
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

/** Perguntas com showIf so aparecem quando a pergunta controladora tem a resposta esperada. */
function wireConditionalQuestions(root, survey) {
  survey.questions.forEach((q) => {
    if (!q.showIf) return;
    const target = root.querySelector(`#question-${q.id}`);
    const controllerGroup = root.querySelector(`[data-qid="${q.showIf.q}"]`);
    if (!controllerGroup) return;
    function evaluate() {
      const checked = controllerGroup.querySelectorAll("input:checked");
      const matches = Array.from(checked).some((i) => i.value === q.showIf.equals);
      target.style.display = matches ? "" : "none";
    }
    controllerGroup.addEventListener("change", evaluate);
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
    submitBtn.textContent = "Enviando…";

    const { error } = await sb.from("vcday_nps_responses").insert({
      survey_slug: surveyKey,
      event_slug: NPS_EVENT_SLUG,
      nps_score: npsScore,
      answers,
    });

    submitBtn.disabled = false;
    submitBtn.textContent = "Enviar respostas";

    if (error) {
      console.error(error);
      alert("Não foi possível enviar suas respostas. Tente novamente em instantes.");
      return;
    }

    form.style.display = "none";
    root.querySelector("#nps-success").style.display = "block";
  });
}

async function renderSurvey(surveyKey, rootId) {
  const survey = SURVEYS[surveyKey];
  const root = document.getElementById(rootId);

  document.title = `${survey.title} · ABVCAP Experience 2026`;
  const titleEl = document.getElementById("nps-title");
  if (titleEl) titleEl.textContent = survey.title;
  const audienceEl = document.getElementById("nps-audience");
  if (audienceEl) audienceEl.textContent = `${survey.audience} · Tempo estimado: ${survey.estimate}`;
  const introEl = document.getElementById("nps-intro");
  if (introEl && survey.intro) {
    introEl.textContent = survey.intro;
    introEl.style.display = "block";
  }

  root.innerHTML = `<div class="card" style="padding: 18px; color: var(--ink-faint);">Carregando pesquisa…</div>`;

  const needsPanels = survey.questions.some((q) => q.optionsSource === "panels");
  const panelOptions = needsPanels ? await npsPanelOptions() : null;

  const questionsHtml = survey.questions
    .map((q, i) => renderQuestionHtml(q, i + 1, q.optionsSource === "panels" ? panelOptions : null))
    .join("");

  root.innerHTML = `
    <form id="nps-form">
      ${questionsHtml}
      <input type="text" name="website" class="honeypot" tabindex="-1" autocomplete="off" />
      <button type="submit" class="btn btn-accent btn-block" id="nps-submit">Enviar respostas</button>
    </form>
    <div id="nps-success" class="card" style="display:none; padding: 28px; text-align: center;">
      <h3 style="margin-bottom: 10px;">Respostas enviadas!</h3>
      <p style="color: var(--ink-soft); margin: 0;">${escapeHtml(survey.thankYou)}</p>
    </div>
  `;

  wireScaleButtons(root);
  wireMultiMax(root);
  wireChoiceErrorClear(root);
  wireConditionalQuestions(root, survey);
  wireSubmit(root, survey, surveyKey);
}
