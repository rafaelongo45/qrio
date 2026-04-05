# Prompt de Desenvolvimento — QR Code SaaS (MVP)

Cole o prompt abaixo na sua sessão do Claude Code no VS Code:

---

## PROMPT

```
Vamos construir um SaaS de Gerador de QR Code chamado (escolha o nome que preferir, ex: "QRapido", "QRFácil", "PixelQR" — me sugira 3 opções criativas antes de começar).

## Visão do Produto
Um gerador de QR Code focado no mercado brasileiro, com interface em português, cobrança em Real via Pix, e otimizado para SEO. O público-alvo são pequenos empresários, MEIs, freelancers, restaurantes, barbearias e lojas.

## Stack Técnica
- **Front-end:** React (Vite) com TypeScript, Tailwind CSS
- **Back-end:** Node.js com Fastify (ou Express)
- **Banco de dados:** Supabase (PostgreSQL + Auth + Storage)
- **Geração de QR:** biblioteca `qrcode` (npm)
- **Pagamento:** Stripe (preparar integração, sem ativar agora)
- **Deploy:** preparar para Vercel (front) + Railway (back)

## Estrutura do Projeto
Monorepo com:
```
/client  → React app (Vite + TS + Tailwind)
/server  → API Node.js (Fastify + TS)
/shared  → tipos compartilhados
```

## Funcionalidades do MVP — Fase 1 (o que construir AGORA)

### 1. Gerador de QR Code Estático (público, sem login)
Tipos de QR suportados:
- URL (link para site)
- Texto livre
- WhatsApp (abre conversa com número pré-definido)
- Wi-Fi (conecta automaticamente à rede)
- Pix (copia e cola ou chave Pix)
- E-mail
- Telefone

Para cada tipo:
- Formulário específico com os campos necessários
- Preview em tempo real do QR Code conforme o usuário digita
- Customização visual: cor do QR, cor de fundo, formato dos módulos (quadrado, arredondado, dots)
- Download em PNG (grátis) e SVG (grátis)

### 2. Interface / Design
- Landing page que É o próprio gerador (a pessoa já cai gerando QR)
- Design moderno, limpo, mas com personalidade — NÃO genérico
- 100% responsivo (mobile-first, muita gente vai acessar pelo celular)
- Tabs ou seletor para escolher o tipo de QR
- Preview do QR Code ao lado (desktop) ou abaixo (mobile) do formulário
- Seção abaixo do gerador explicando os planos (Free vs Pro vs Business)
- Footer com links úteis para SEO
- Dark mode toggle

### 3. Arquitetura do Back-end (preparar para o futuro)
Mesmo que o MVP inicial rode 100% no client-side, já estruturar:
- API REST com rotas para:
  - `POST /api/qr/generate` — gera QR (pra quando quisermos server-side)
  - `POST /api/auth/register` e `POST /api/auth/login`
  - `GET /api/qr/my-codes` — lista QR codes do usuário
  - `POST /api/qr/dynamic` — cria QR dinâmico (futuro)
  - `GET /api/r/:code` — redirect de QR dinâmico (futuro)
- Modelagem do banco (Supabase/PostgreSQL):
  - tabela `users` (via Supabase Auth)
  - tabela `qr_codes` (id, user_id, type, data, style_config, is_dynamic, short_code, redirect_url, created_at)
  - tabela `scans` (id, qr_code_id, scanned_at, ip, user_agent, country, city)
  - tabela `subscriptions` (id, user_id, plan, status, started_at, expires_at)

### 4. SEO desde o dia 1
- Cada tipo de QR deve ter sua própria rota/página:
  - `/gerador-qr-code` (página principal)
  - `/gerador-qr-code-pix`
  - `/gerador-qr-code-whatsapp`
  - `/gerador-qr-code-wifi`
  - `/gerador-qr-code-url`
  - etc.
- Cada página com meta tags, título e descrição únicos
- Estrutura de headings (H1, H2, H3) semântica
- Schema.org markup (SoftwareApplication)
- Sitemap.xml e robots.txt

## O que NÃO construir agora
- Sistema de login/cadastro (só a estrutura da API)
- QR dinâmico funcional (só a rota preparada)
- Painel/dashboard do usuário
- Integração real de pagamento
- Blog

## Instruções de Desenvolvimento
1. Comece me sugerindo 3 nomes criativos para o produto
2. Depois de eu escolher, crie a estrutura completa do monorepo
3. Implemente o front-end primeiro: landing page + gerador funcional de QR estático
4. Depois implemente o back-end: API + modelagem do banco
5. Me mostre o resultado a cada etapa antes de avançar

## Padrões de Código
- TypeScript strict em tudo
- Componentes React funcionais com hooks
- Tailwind para estilização (sem CSS separado)
- Variáveis de ambiente via .env
- ESLint + Prettier configurados
- Commits semânticos (feat:, fix:, chore:)

## Tom do Design
Quero algo que passe profissionalismo mas seja acessível. Pense em: cores vibrantes mas não infantis, tipografia moderna e legível, micro-animações sutis (hover, transições), e um feeling de "essa ferramenta é séria mas fácil de usar". O público é o dono de restaurante de 45 anos E o freelancer de 25 — precisa funcionar pros dois.
```

---

**Dica de uso:** Depois que o Claude Code gerar a estrutura inicial, você pode ir pedindo ajustes incrementais tipo "melhora o design da seção de pricing", "adiciona animação no preview do QR", "implementa a página de QR Code Pix", etc.