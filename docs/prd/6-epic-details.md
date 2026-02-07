# 6. Epic Details

### Epic 1: Fundacao e Autenticacao

**Goal expandido:** Este epic estabelece toda a base tecnica do ERPsb: projeto Next.js 15 com TypeScript, banco PostgreSQL com Prisma ORM, CI/CD via GitHub Actions + Vercel, autenticacao Google OAuth via NextAuth.js v5, sistema multi-tenant com RLS, e onboarding wizard. Ao final, um usuario pode se cadastrar, fazer login, criar sua empresa via wizard de 5 perguntas, e ver o dashboard vazio pronto para uso. Inclui setup de monitoring (Sentry), analytics (PostHog) e logging desde o inicio.

#### Story 1.1: Setup do Projeto e Infraestrutura Base

**Como** desenvolvedor,
**Quero** ter o projeto Next.js 15 configurado com TypeScript, Tailwind, shadcn/ui, PostgreSQL, Prisma e CI/CD,
**Para que** a equipe possa iniciar o desenvolvimento com a stack completa e pipeline de deploy funcionando.

**Acceptance Criteria:**
1. Projeto Next.js 15 (App Router) criado com TypeScript 5 strict mode, Tailwind CSS 4 e shadcn/ui configurados
2. Prisma ORM configurado e conectado ao PostgreSQL (Supabase) com schema inicial (modelo Tenant e User)
3. ESLint + Prettier configurados com regras para TypeScript e React
4. Estrutura de pastas DDD criada: `src/core/`, `src/modules/`, `src/integrations/`, `src/lib/`, `src/app/`
5. GitHub Actions configurado: lint + type-check + testes unitarios em cada PR
6. Deploy automatico via Vercel em push para main (preview deploys em PRs)
7. Sentry configurado para captura de erros (client e server)
8. Variáveis de ambiente configuradas (.env.example documentado)
9. pnpm como gerenciador de pacotes com lockfile commitado
10. Health check endpoint (`/api/health`) retornando status do servidor e conexao com banco

#### Story 1.2: Autenticacao Google OAuth e Sessao

**Como** usuario,
**Quero** fazer login com minha conta Google,
**Para que** eu possa acessar o sistema sem precisar criar uma senha nova.

**Acceptance Criteria:**
1. NextAuth.js v5 configurado com Google OAuth provider
2. Tela de login responsiva (mobile-first) com botao "Entrar com Google" como CTA principal
3. Opcao secundaria de cadastro/login via email + senha
4. Sessao JWT com expiracao de 24h e refresh token de 30 dias
5. Middleware de autenticacao protegendo todas as rotas exceto login e landing
6. Model User no Prisma com campos: id, email, name, image, provider, createdAt, updatedAt
7. Redirect apos login para onboarding (se primeiro acesso) ou dashboard (se ja tem empresa)
8. Logout funcional com limpeza de sessao

#### Story 1.3: Multi-Tenant com Row-Level Security

**Como** usuario com multiplas empresas,
**Quero** que meus dados de cada empresa sejam completamente isolados,
**Para que** eu possa alternar entre empresas sem risco de vazamento de dados.

**Acceptance Criteria:**
1. Model Tenant no Prisma com campos: id, name, document (CNPJ/CPF, opcional), type (MEI/ME/informal), plan (free/starter/growth/pro), createdAt
2. Model UserTenant (relacao N:N) com campos: userId, tenantId, role (owner/admin/user)
3. Row-Level Security (RLS) habilitado no PostgreSQL com policies por tenant_id para todas as tabelas de dados
4. Middleware que injeta tenant_id no contexto de cada request com base na sessao do usuario
5. Endpoint para criar novo tenant (empresa)
6. Endpoint para listar tenants do usuario e alternar o tenant ativo
7. Todas as queries Prisma filtradas automaticamente por tenant_id via middleware/extension
8. Teste de isolamento: dados de tenant A nunca acessiveis por tenant B

#### Story 1.4: Onboarding Wizard

**Como** novo usuario,
**Quero** configurar minha empresa respondendo 5 perguntas simples,
**Para que** o sistema esteja pronto para uso em menos de 5 minutos.

**Acceptance Criteria:**
1. Wizard de 5 steps com UI conversacional (1 pergunta por tela, progresso visual):
   - Step 1: "Qual o nome do seu negocio?" (texto livre)
   - Step 2: "Que tipo de negocio voce tem?" (opcoes: Servicos, Comercio, Alimentacao, Beleza, Outro)
   - Step 3: "Quanto voce fatura por mes, mais ou menos?" (faixas: Ate R$5k, R$5-20k, R$20-100k, Acima R$100k)
   - Step 4: "Voce tem CNPJ?" (Sim - informar CNPJ / Nao - modo informal)
   - Step 5: "Como voce cobra seus clientes hoje?" (multipla escolha: PIX, Dinheiro, Cartao, Boleto)
2. Sistema configura automaticamente: tipo de tenant, plano sugerido, formas de pagamento, categorias financeiras
3. Ao concluir, redireciona para dashboard com mensagem de boas-vindas e dicas contextuais
4. Possibilidade de pular o wizard e configurar depois
5. Dados do wizard salvos no tenant e editaveis em Configuracoes
6. Mobile-first: botoes grandes, transicoes suaves, funciona bem em telas de 320px

#### Story 1.5: Layout Base e Navegacao Mobile-First

**Como** usuario,
**Quero** uma interface clara com navegacao facil pelo celular,
**Para que** eu consiga acessar todas as funcoes sem me perder.

**Acceptance Criteria:**
1. Layout base com bottom navigation (5 tabs): Home, Financeiro, Vender, Fiscal, Menu
2. Header com nome da empresa ativa, sino de notificacoes e avatar do usuario
3. FAB (Floating Action Button) "+" para acoes rapidas: Nova Venda, Nova Cobranca, Nova Despesa
4. Dashboard Home vazio com placeholders e CTAs para primeiras acoes ("Cadastre seu primeiro cliente", "Faca sua primeira venda")
5. Tela de Configuracoes acessivel via Menu com dados da empresa, perfil do usuario e opcao de alternar empresa
6. Responsivo: layout adapta de mobile (bottom nav) para desktop (sidebar nav) em breakpoint 1024px
7. Tema com cores do semaforo integrado ao Tailwind config
8. Loading states (skeleton) e empty states para todas as telas principais

---

### Epic 2: Cadastros Progressivos

**Goal expandido:** Este epic implementa os quatro cadastros essenciais do ERP (Clientes, Fornecedores, Produtos/Servicos, Formas de Pagamento) com o modelo progressivo que diferencia o ERPsb: comeca com campos minimos e expande conforme necessidade. Inclui busca rapida com autocomplete e importacao de contatos do celular. Ao final, o usuario tem toda a base de dados necessaria para iniciar vendas.

#### Story 2.1: Cadastro de Clientes Progressivo

**Como** usuario,
**Quero** cadastrar clientes rapidamente com apenas nome e telefone,
**Para que** eu possa comecar a vender sem perder tempo preenchendo formularios longos.

**Acceptance Criteria:**
1. Model Cliente no Prisma: id, tenantId, name (obrigatorio), phone (obrigatorio), email, document (CPF/CNPJ), address (JSON), notes, createdAt, updatedAt
2. Formulario de criacao com apenas 2 campos visíveis inicialmente (nome e telefone)
3. Botao "Mais detalhes" expande progressivamente: email, CPF/CNPJ, endereco completo, observacoes
4. Lista de clientes com busca por nome/telefone/documento com autocomplete
5. Tela de detalhe do cliente com informacoes e futuro historico de vendas (placeholder)
6. Edicao inline dos campos do cliente
7. Validacao de CPF/CNPJ quando preenchido
8. Paginacao ou scroll infinito na lista
9. RLS aplicado - clientes isolados por tenant

#### Story 2.2: Cadastro de Fornecedores Progressivo

**Como** usuario,
**Quero** cadastrar fornecedores de forma rapida,
**Para que** eu possa registrar minhas compras e contas a pagar associadas.

**Acceptance Criteria:**
1. Model Fornecedor no Prisma: id, tenantId, name (obrigatorio), phone, email, document (CNPJ/CPF), address (JSON), notes, createdAt, updatedAt
2. Formulario progressivo identico ao de Clientes (nome obrigatorio, demais expandiveis)
3. Lista com busca por nome/telefone/documento
4. Tela de detalhe do fornecedor
5. Edicao inline dos campos
6. RLS aplicado - fornecedores isolados por tenant

#### Story 2.3: Cadastro de Produtos e Servicos Progressivo

**Como** usuario,
**Quero** cadastrar meus produtos e servicos com apenas nome e preco,
**Para que** eu possa comecar a vender imediatamente.

**Acceptance Criteria:**
1. Model Produto no Prisma: id, tenantId, type (produto/servico), name (obrigatorio), sellPrice (obrigatorio, em centavos), costPrice (centavos, opcional), unit (un/kg/hr/srv), barcode, ncm, description, stockMin, trackStock (boolean), active (boolean), createdAt, updatedAt
2. Formulario com campos minimos: nome, tipo (produto/servico), preco de venda
3. Expansao progressiva: preco de custo, unidade de medida, codigo de barras, NCM, descricao, estoque minimo
4. Toggle "Controlar estoque" (default: true para produtos, false para servicos)
5. Lista com busca por nome/codigo de barras
6. Tela de detalhe com informacoes e futuro historico de vendas (placeholder)
7. Validacao: preco deve ser positivo, NCM formato valido quando preenchido
8. RLS aplicado

#### Story 2.4: Formas de Pagamento e Importacao de Contatos

**Como** usuario,
**Quero** ter formas de pagamento pre-configuradas e poder importar contatos do celular,
**Para que** eu nao precise configurar tudo do zero.

**Acceptance Criteria:**
1. Model FormaPagamento no Prisma: id, tenantId, name, type (pix/dinheiro/debito/credito/boleto/outro), active, isDefault, installments (max parcelas), fee (taxa percentual), createdAt
2. Formas de pagamento pre-criadas no onboarding com base na resposta do wizard (step 5)
3. Tela de gerenciamento: ativar/desativar, editar nome, definir taxa, definir parcelas maximas
4. API de importacao de contatos: recebe lista de contatos (nome + telefone) e cria clientes em batch (com de-duplicacao por telefone)
5. Botao "Importar Contatos" na tela de clientes que acessa Contacts API do navegador (com permissao LGPD)
6. Feedback visual da importacao: X contatos importados, Y duplicados ignorados

---

### Epic 3: Financeiro e Dashboard Semaforo

**Goal expandido:** Este epic implementa o modulo financeiro - o coracao do ERPsb. Inclui contas a pagar e receber com categorizacao, fluxo de caixa diario com saldo real, o dashboard semaforo (verde/amarelo/vermelho) que traduz numeros em linguagem visual, alertas proativos de caixa, e a funcionalidade "Quanto posso retirar?". Ao final, o usuario tem visibilidade completa da saude financeira do seu negocio.

#### Story 3.1: Contas a Pagar

**Como** usuario,
**Quero** registrar minhas contas a pagar com vencimento e categoria,
**Para que** eu nunca esqueca de pagar uma conta e saiba exatamente quanto devo.

**Acceptance Criteria:**
1. Model ContaPagar no Prisma: id, tenantId, description, amount (centavos), dueDate, paidDate, status (pendente/pago/vencido/cancelado), category, supplierId (FK opcional), notes, recurrent (boolean), recurrenceType (mensal/semanal), createdAt, updatedAt
2. Formulario de criacao: descricao, valor, vencimento, fornecedor (autocomplete), categoria (select com opcoes pre-definidas + customizavel)
3. Categorias pre-definidas: Aluguel, Funcionarios, Fornecedores, Impostos, Marketing, Servicos, Outros
4. Lista de contas a pagar com filtros: status (todas/pendentes/vencidas/pagas), periodo, categoria
5. Acao "Marcar como pago" com 1 toque (registra data de pagamento = hoje)
6. Indicador visual: vencidas em vermelho, vencendo em 3 dias em amarelo, futuras em cinza
7. Opcao de conta recorrente (cria automaticamente a proxima ao pagar)
8. RLS aplicado

#### Story 3.2: Contas a Receber

**Como** usuario,
**Quero** registrar o que tenho a receber com datas e clientes,
**Para que** eu saiba quanto dinheiro vai entrar e possa cobrar em dia.

**Acceptance Criteria:**
1. Model ContaReceber no Prisma: id, tenantId, description, amount (centavos), dueDate, receivedDate, status (pendente/recebido/vencido/cancelado), category, clientId (FK opcional), saleId (FK opcional), pixChargeId (opcional), notes, createdAt, updatedAt
2. Formulario de criacao: descricao, valor, vencimento, cliente (autocomplete), categoria
3. Categorias: Vendas, Servicos, Outros
4. Lista com filtros: status, periodo, cliente
5. Acao "Marcar como recebido" com 1 toque
6. Indicador visual: vencidas em vermelho, vencendo em 3 dias em amarelo
7. Botao "Cobrar via PIX" (placeholder para Epic 4) e "Lembrar via WhatsApp" (placeholder para Epic 6)
8. RLS aplicado

#### Story 3.3: Fluxo de Caixa e Dashboard Semaforo

**Como** usuario,
**Quero** ver meu fluxo de caixa diario com um semaforo visual,
**Para que** eu saiba instantaneamente se meu negocio esta saudavel.

**Acceptance Criteria:**
1. Dashboard principal exibe: saldo atual (receitas recebidas - despesas pagas), receitas do dia/semana/mes, despesas do dia/semana/mes
2. Semaforo visual baseado em regras:
   - Verde: saldo cobre 30+ dias de despesas medias
   - Amarelo: saldo cobre 7-30 dias de despesas medias
   - Vermelho: saldo cobre menos de 7 dias ou esta negativo
3. Grafico de fluxo de caixa dos ultimos 30 dias (linha com area: receitas em verde, despesas em vermelho)
4. Lista resumida: proximas 5 contas a pagar e proximas 5 contas a receber
5. Valor total pendente a pagar e total pendente a receber exibidos com destaque
6. Dados atualizados em tempo real quando usuario acessa o dashboard
7. Responsivo: funciona bem em tela de 320px ate desktop

#### Story 3.4: Alertas Proativos e "Quanto Posso Retirar?"

**Como** usuario,
**Quero** receber alertas quando meu caixa estiver em risco e saber quanto posso retirar,
**Para que** eu tome decisoes financeiras melhores.

**Acceptance Criteria:**
1. Sistema de alertas que calcula diariamente:
   - Contas a vencer nos proximos 7 dias vs saldo atual
   - Se despesas futuras (30 dias) superam recebimentos previstos
   - Se ha contas vencidas nao pagas
2. Alertas exibidos como cards no topo do dashboard com icones de alerta
3. Notificacao push (se PWA instalado) para alertas criticos (caixa negativo iminente)
4. Funcionalidade "Quanto posso retirar?":
   - Calcula: saldo atual - contas a pagar proximos 30 dias - reserva de seguranca (10% do faturamento medio)
   - Exibe resultado com explicacao simples: "Voce pode retirar ate R$ X. Depois disso, seu caixa fica apertado."
5. Card de resumo financeiro no dashboard com linguagem humana: "Esse mes voce recebeu R$ X e gastou R$ Y"

---

### Epic 4: Vendas e PIX Nativo

**Goal expandido:** Este epic implementa o modulo de vendas (venda rapida em 1 toque, orcamentos, conversao automatica para financeiro) e a integracao PIX via Mercado Pago (geracao de cobranca, QR code, webhook de pagamento, conciliacao automatica). Ao final, o usuario pode vender, cobrar via PIX e ter tudo refletido automaticamente no financeiro.

#### Story 4.1: Venda Rapida (1 Toque)

**Como** usuario,
**Quero** registrar uma venda em menos de 30 segundos,
**Para que** eu nao perca tempo entre atender clientes.

**Acceptance Criteria:**
1. Model Venda no Prisma: id, tenantId, clientId (opcional), items (JSON array: productId, name, quantity, unitPrice, total), subtotal, discount, total, paymentMethod, status (rascunho/confirmada/cancelada), notes, createdAt, updatedAt
2. Tela de nova venda otimizada:
   - Busca rapida de produto (por nome ou codigo)
   - Adicionar quantidade com +/- ou teclado numerico
   - Cliente opcional (busca por nome/telefone)
   - Forma de pagamento (selecao rapida com icones)
   - Botao "Confirmar Venda" grande e visivel
3. Ao confirmar venda: cria automaticamente conta a receber no financeiro
4. Se produto tem estoque controlado: baixa automatica do estoque
5. Tela de confirmacao com resumo e opcoes: "Gerar PIX", "Emitir Nota" (placeholders), "Nova Venda"
6. Historico de vendas com filtros (periodo, cliente, status)
7. Meta de UX: venda completa em 30 segundos ou menos (3-4 toques)

#### Story 4.2: Orcamentos com Conversao

**Como** usuario,
**Quero** criar orcamentos e converte-los em vendas com 1 clique,
**Para que** eu possa negociar com clientes sem perder o registro.

**Acceptance Criteria:**
1. Model Orcamento no Prisma: id, tenantId, clientId, items (JSON array), subtotal, discount, total, validUntil, status (pendente/aprovado/recusado/convertido/expirado), notes, saleId (FK quando convertido), createdAt, updatedAt
2. Formulario de orcamento: mesma UX de venda mas com data de validade
3. Lista de orcamentos com filtros (status, periodo, cliente)
4. Botao "Converter em Venda" que cria venda a partir dos dados do orcamento
5. Orcamento convertido muda status para "convertido" com link para a venda
6. Orcamentos vencidos mudam automaticamente para status "expirado"
7. Opcao de duplicar orcamento existente

#### Story 4.3: Integracao PIX - Mercado Pago (Cobranca e QR Code)

**Como** usuario,
**Quero** gerar cobranca PIX em 1 clique com QR code,
**Para que** meu cliente possa pagar instantaneamente pelo celular.

**Acceptance Criteria:**
1. Integracao com API Mercado Pago configurada (credenciais em env vars)
2. Model PixCharge no Prisma: id, tenantId, contaReceberId (FK), externalId (Mercado Pago), amount, qrCode (base64), qrCodeText (copia-e-cola), paymentLink, status (pending/paid/expired/cancelled), expiresAt, paidAt, createdAt
3. Botao "Cobrar via PIX" disponivel em: tela de venda, conta a receber, acao rapida FAB
4. Ao clicar: chama API Mercado Pago, gera cobranca PIX, exibe QR code na tela
5. Tela de cobranca PIX com: QR code grande, botao "Copiar codigo PIX", botao "Compartilhar" (WhatsApp/SMS/outros)
6. Cobranca com expiracao configuravel (default: 24h)
7. Status da cobranca atualizado em tempo real na tela

#### Story 4.4: Webhook PIX e Conciliacao Automatica

**Como** usuario,
**Quero** que o sistema detecte automaticamente quando um PIX for pago,
**Para que** eu nao precise baixar manualmente cada recebimento.

**Acceptance Criteria:**
1. Endpoint webhook (`/api/webhooks/mercadopago`) para receber notificacoes de pagamento
2. Webhook valida assinatura do Mercado Pago (seguranca)
3. Ao receber pagamento confirmado: atualiza PixCharge.status para "paid", atualiza ContaReceber.status para "recebido" com data de recebimento
4. Notificacao em tempo real para o usuario: "Pagamento de R$ X recebido de [Cliente]!"
5. Notificacao push (PWA) e badge no icone de notificacoes
6. Tratamento de falhas: retry automatico se processamento falhar (via BullMQ)
7. Log de todas as notificacoes recebidas para auditoria
8. Endpoint de consulta manual de status (fallback caso webhook falhe)

---

### Epic 5: Fiscal (NFe/NFSe/NFCe)

**Goal expandido:** Este epic implementa a emissao de documentos fiscais eletronicos via Focus NFe: NFe (produto), NFSe Nacional (servico) e NFCe (consumidor final). Inclui preenchimento automatico de campos fiscais (CFOP, CST, NCM), campos CBS/IBS preparados para reforma tributaria 2026, determinacao automatica de regime tributario, vinculacao automatica Venda -> NFe -> Financeiro, e armazenamento de XMLs. O objetivo e que o usuario emita nota fiscal sem conhecimento contabil.

#### Story 5.1: Configuracao Fiscal e Certificado Digital

**Como** usuario,
**Quero** configurar meu certificado digital e dados fiscais,
**Para que** eu possa emitir notas fiscais pelo sistema.

**Acceptance Criteria:**
1. Model ConfigFiscal no Prisma: id, tenantId, regimeTributario (MEI/SimplesNacional/LucroPresumido/LucroReal), inscricaoEstadual, inscricaoMunicipal, certificateFileUrl (Supabase Storage), certificatePassword (criptografado), certificateExpiry, ambiente (homologacao/producao), serieNFe, serieNFSe, serieNFCe, ultimoNumeroNFe, ultimoNumeroNFSe, ultimoNumeroNFCe
2. Tela de configuracao fiscal com:
   - Selecao de regime tributario (com explicacao simples de cada)
   - Upload de certificado digital A1 (.pfx) com armazenamento seguro
   - Campos de inscricao estadual e municipal
   - Toggle ambiente: homologacao (testes) / producao
3. Validacao do certificado: verifica se e A1, se nao esta expirado, exibe data de vencimento
4. Alerta quando certificado esta a 30 dias de expirar
5. Sistema determina automaticamente configuracoes fiscais com base no regime tributario

#### Story 5.2: Emissao de NFe (Produto)

**Como** usuario,
**Quero** emitir NFe de produto a partir de uma venda,
**Para que** eu entregue o documento fiscal ao cliente sem precisar entender de tributacao.

**Acceptance Criteria:**
1. Model NotaFiscal no Prisma: id, tenantId, type (NFe/NFSe/NFCe), saleId (FK), numero, serie, chaveAcesso, xmlUrl (Supabase Storage), pdfUrl, status (processando/autorizada/rejeitada/cancelada), focusNfeId, errorMessage, emitidaEm, createdAt
2. Integracao com Focus NFe API para emissao de NFe
3. Botao "Emitir NFe" disponivel na tela de detalhes da venda (pos-confirmacao)
4. Sistema preenche automaticamente: CFOP, CST, NCM (do cadastro do produto), aliquotas com base no regime tributario
5. Preview da nota antes de emitir com campos editaveis para correcoes
6. Emissao assincrona via BullMQ (nao bloqueia a tela do usuario)
7. Status atualizado em tempo real: processando -> autorizada/rejeitada
8. XML armazenado no Supabase Storage, link para download
9. Vinculacao automatica: ao autorizar NFe, atualiza venda com numero da nota
10. Campos CBS/IBS presentes no schema (preenchimento conforme regulamentacao vigente)

#### Story 5.3: Emissao de NFSe Nacional (Servico)

**Como** prestador de servicos,
**Quero** emitir NFSe Nacional pelo sistema,
**Para que** eu cumpra a obrigacao fiscal sem complexidade.

**Acceptance Criteria:**
1. Integracao com Focus NFe API para emissao de NFSe Nacional
2. Botao "Emitir NFSe" disponivel quando venda contem servicos
3. Sistema determina automaticamente: codigo de servico, ISS, aliquota com base no municipio e regime
4. Campos NFSe Nacional preenchidos automaticamente a partir dos dados da venda e empresa
5. Preview antes de emitir
6. Emissao assincrona via BullMQ
7. XML armazenado, link para download
8. Campos CBS/IBS preparados

#### Story 5.4: Emissao de NFCe (Consumidor) e Fluxo Fiscal Completo

**Como** usuario que vende para consumidor final,
**Quero** emitir NFCe automaticamente,
**Para que** cada venda no balcao tenha documento fiscal.

**Acceptance Criteria:**
1. Integracao com Focus NFe API para emissao de NFCe
2. Opcao de emissao automatica de NFCe em vendas sem cliente identificado (consumidor final)
3. Emissao assincrona, XML armazenado
4. Fluxo fiscal completo validado end-to-end: Venda -> NFe/NFSe/NFCe -> Conta a Receber (vinculacao automatica)
5. Tela "Notas Fiscais" com lista de todas as notas emitidas, filtros por tipo/status/periodo
6. Acoes na lista: visualizar PDF, baixar XML, reenviar para cliente (email/WhatsApp placeholder)
7. Tratamento de rejeicao: exibir motivo claro da Sefaz e sugerir correcao
8. Cancelamento de nota (dentro do prazo legal) com motivo obrigatorio

---

### Epic 6: WhatsApp, Estoque e PWA

**Goal expandido:** Este epic completa o MVP com as ultimas tres funcionalidades essenciais: integracao WhatsApp Business (envio de cobranca, notificacao de NFe, lembrete de vencimento), estoque simplificado (entrada por compra, saida por venda, saldo e alertas) e PWA completo (manifest, service worker, offline basico, instalacao). Ao final, o ERPsb MVP esta completo e pronto para beta com usuarios reais.

#### Story 6.1: Integracao WhatsApp Business - Envio de Mensagens

**Como** usuario,
**Quero** enviar cobrancas e notificacoes pelo WhatsApp com 1 clique,
**Para que** meus clientes recebam pelo canal que mais usam.

**Acceptance Criteria:**
1. Integracao com WhatsApp Business API (provedor configuravel via env vars)
2. Model WhatsAppMessage no Prisma: id, tenantId, clientId, phone, type (cobranca/nfe/lembrete/orcamento), templateId, status (queued/sent/delivered/read/failed), externalId, sentAt, createdAt
3. Templates de mensagem pre-definidos:
   - Cobranca PIX: "Ola [nome]! Segue sua cobranca de R$ [valor]: [link PIX]. Obrigado!"
   - NFe emitida: "Ola [nome]! Sua nota fiscal [numero] foi emitida. Acesse: [link PDF]"
   - Lembrete de vencimento: "Ola [nome]! Lembrete: sua conta de R$ [valor] vence em [data]. Link para pagar: [link PIX]"
   - Orcamento: "Ola [nome]! Segue seu orcamento de R$ [valor]. Detalhes: [link]"
4. Botao "Enviar WhatsApp" disponivel em: cobranca PIX, nota fiscal, orcamento, conta a receber
5. Envio assincrono via BullMQ (fila de mensagens WhatsApp)
6. Status de entrega atualizado via webhook do provedor
7. Log de todas as mensagens enviadas com status

#### Story 6.2: Lembretes Automaticos de Vencimento

**Como** usuario,
**Quero** que o sistema envie lembretes automaticos de cobranca,
**Para que** meus clientes paguem em dia sem eu precisar cobrar manualmente.

**Acceptance Criteria:**
1. Configuracao de lembretes por tenant: ativar/desativar, dias antes (default: 3), no dia (default: sim), dias depois (default: 1)
2. Job agendado (BullMQ cron) que verifica diariamente contas a receber proximas do vencimento
3. Envia mensagem WhatsApp automatica conforme configuracao do tenant
4. Nao reenvia se ja foi enviado para aquela conta naquele dia
5. Inclui link de pagamento PIX na mensagem (se cobranca PIX existir)
6. Registro de envio no historico de mensagens
7. Tenant pode desativar lembretes automaticos nas configuracoes

#### Story 6.3: Estoque Simplificado

**Como** usuario,
**Quero** controlar meu estoque de forma simples,
**Para que** eu saiba o que tenho disponivel e nao venda o que nao tenho.

**Acceptance Criteria:**
1. Model MovimentacaoEstoque no Prisma: id, tenantId, productId, type (entrada/saida/ajuste), quantity, reason (compra/venda/ajuste_manual), referenceId (saleId ou purchaseId), notes, createdAt
2. Saldo de estoque calculado como soma de movimentacoes (entradas - saidas) por produto
3. Tela de estoque: lista de produtos com saldo atual, alerta visual quando abaixo do minimo
4. Formulario de entrada manual: produto, quantidade, fornecedor (opcional), observacao
5. Saida automatica vinculada a vendas (Story 4.1 ja cria a baixa)
6. Ajuste manual de estoque com motivo obrigatorio
7. Historico de movimentacoes por produto com filtros
8. Alerta quando produto atinge estoque minimo (notificacao no dashboard + badge)
9. Produtos com estoque zero nao sao bloqueados na venda (aviso, nao bloqueio)

#### Story 6.4: PWA Completo e Offline Basico

**Como** usuario,
**Quero** instalar o ERPsb no meu celular como se fosse um app,
**Para que** eu acesse rapidamente e possa consultar dados mesmo sem internet.

**Acceptance Criteria:**
1. manifest.json configurado: nome, icones (512px, 192px, maskable), theme_color, background_color, display: standalone, start_url
2. Service worker via next-pwa com estrategias de cache:
   - Cache-first para assets estaticos (JS, CSS, imagens, fontes)
   - Stale-while-revalidate para dados de API (cadastros, saldos)
   - Network-first para operacoes criticas (vendas, fiscal, financeiro)
3. Banner de instalacao nativo (beforeinstallprompt) com CTA customizado
4. Offline basico: consultar cadastros (clientes, produtos) e ver ultimo saldo do dashboard
5. Indicador visual quando offline: banner no topo "Voce esta offline. Dados podem estar desatualizados."
6. Operacoes feitas offline sao enfileiradas e sincronizadas quando internet volta (write-behind para vendas e lancamentos)
7. Splash screen com logo ao abrir PWA instalado
8. Push notifications configuradas para alertas financeiros e recebimentos PIX

#### Story 6.5: Polish Final e Preparacao para Beta

**Como** Product Owner,
**Quero** que o sistema esteja polido e estavel para beta com usuarios reais,
**Para que** tenhamos feedback confiavel para evoluir o produto.

**Acceptance Criteria:**
1. Revisao e correcao de todos os empty states com mensagens amigaveis e CTAs
2. Loading states (skeleton screens) em todas as telas de lista e dashboard
3. Tratamento de erros amigavel em toda a aplicacao (nao exibir stack traces)
4. Mensagens de sucesso/erro com toast notifications consistentes
5. PostHog analytics configurado: tracking de eventos-chave (signup, onboarding_complete, first_sale, first_pix, first_nfe)
6. Metatags SEO basicas e Open Graph para compartilhamento
7. Testes E2E (Playwright) cobrindo fluxos criticos:
   - Cadastro + onboarding completo
   - Cadastrar cliente + produto + realizar venda
   - Gerar cobranca PIX
   - Registrar conta a pagar + marcar como paga
   - Visualizar dashboard semaforo
8. Performance audit via Lighthouse: score > 90 em Performance e > 90 em PWA
9. Revisao de seguranca: confirmar RLS funcional, audit logs ativos, LGPD consentimento no cadastro

---
