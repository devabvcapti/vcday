# VC Day · Perguntas ao vivo

Site estático (HTML/CSS/JS puro, sem build) para o Q&A ao vivo do VC Day (16/set/2026). Backend: Supabase (projeto `abvcap-congress-2025`, tabelas `vcday_*`, isoladas do restante do banco).

## Páginas

- `index.html` — hub com a lista de painéis do dia (link "Perguntas" → `vcday.../` )
- `pergunta.html?p=<panel_id>` — formulário público de envio de pergunta (QR code aponta aqui)
- `telao.html?p=<panel_id>` — tela de exibição para o telão/projeção ao lado do palco
- `moderacao.html?p=<panel_id>` — painel de moderação (protegido por senha)

## Deploy na Hostinger

Site 100% estático — qualquer hospedagem que sirva arquivos HTML funciona:

1. Na hPanel da Hostinger, use "Git" (Avançado → Git) e aponte para este repositório (`devabvcapti/vcday`), branch `main`, diretório de deploy `public_html` (ou o subdomínio escolhido).
2. Não há build step — não configure comando de build; é só copiar os arquivos.
3. Depois do deploy, confirme que `pergunta.html`, `telao.html` e `moderacao.html` abrem normalmente e que `app.js`/`styles.css` carregam (sem 404) — o site é multi-página simples, sem framework.

## Painéis já cadastrados no Supabase

1. 12:45–13:25 · Cenário Macro: Eleições e mercado de alternativos no Brasil (`cenario-macro`)
2. 13:25–14:05 · Alocadores: perspectivas de alocação em VC — IA como propulsor (`alocadores`)
3. 14:05–14:45 · Fundos Estrangeiros: estratégia América Latina x EUA (`fundos-estrangeiros`)
4. 15:15–15:55 · Fundos Locais: estratégias de investimento na era da IA (`fundos-locais`)
5. 15:55–16:35 · Startups: como a IA está mudando a economia de criação de empresas (`startups-ia`)

## Senha de moderação

Definida na tabela `vcday_app_settings` (chave `moderator_passcode`) do projeto Supabase `abvcap-congress-2025`. Troque lá se quiser alterá-la — a página de moderação não guarda a senha em nenhum outro lugar.
