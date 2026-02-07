# 2. Requirements

### 2.1 Functional Requirements

**Autenticacao e Multi-Tenant**

- **FR1:** O sistema deve permitir cadastro e login via Google OAuth (login social) como metodo primario de autenticacao
- **FR2:** O sistema deve permitir cadastro via email/senha como metodo alternativo
- **FR3:** O sistema deve suportar multi-empresa (multi-tenant) com isolamento total de dados via Row-Level Security (RLS) no PostgreSQL
- **FR4:** O usuario deve poder criar e alternar entre multiplas empresas/negocios na mesma conta
- **FR5:** O sistema deve suportar "Modo Informal" - funcionamento sem CNPJ para nanoempreendedores (ate R$ 40,5k/ano)

**Onboarding**

- **FR6:** O onboarding deve consistir em um wizard de no maximo 5 perguntas que configura o sistema automaticamente (tipo de negocio, faturamento medio, regime tributario, se tem CNPJ, como cobra hoje)
- **FR7:** O sistema deve estar pronto para uso (primeira venda possivel) em menos de 5 minutos apos o cadastro
- **FR8:** O onboarding deve oferecer importacao de contatos do celular (com consentimento LGPD)

**Cadastros Progressivos**

- **FR9:** O cadastro de Clientes deve iniciar com campos minimos obrigatorios (nome e telefone) e expandir progressivamente conforme necessidade (CPF/CNPJ, endereco, email, etc.)
- **FR10:** O cadastro de Fornecedores deve seguir o mesmo padrao progressivo do cadastro de Clientes
- **FR11:** O cadastro de Produtos/Servicos deve iniciar com campos minimos (nome e valor de venda) e expandir progressivamente (codigo de barras, NCM, unidade de medida, custo, estoque)
- **FR12:** O cadastro de Formas de Pagamento deve vir pre-configurado (PIX, Dinheiro, Cartao Debito, Cartao Credito, Boleto) com opcao de personalizar
- **FR13:** O sistema deve permitir busca rapida em todos os cadastros com autocomplete

**Financeiro (Dashboard Semaforo)**

- **FR14:** O sistema deve exibir dashboard financeiro com indicadores visuais tipo semaforo: Verde (caixa saudavel), Amarelo (atencao - caixa apertado), Vermelho (caixa critico)
- **FR15:** O sistema deve manter registro de contas a pagar com data de vencimento, valor, fornecedor, categoria e status (pendente/pago/vencido)
- **FR16:** O sistema deve manter registro de contas a receber com data de vencimento, valor, cliente, origem (venda) e status (pendente/recebido/vencido)
- **FR17:** O sistema deve calcular e exibir fluxo de caixa diario com saldo real atualizado em tempo real
- **FR18:** O sistema deve gerar alertas proativos quando detectar risco de caixa negativo nos proximos 7, 15 e 30 dias
- **FR19:** O sistema deve permitir separacao de movimentacoes pessoa fisica vs pessoa juridica (conta pessoal vs empresa)
- **FR20:** O sistema deve responder a pergunta "Quanto posso retirar esse mes?" com base no saldo, contas a pagar futuras e media de recebimentos
- **FR21:** O sistema deve permitir categorizacao de receitas e despesas (categorias pre-definidas + personalizaveis)
- **FR22:** Toda venda registrada deve gerar automaticamente um lancamento em contas a receber

**Vendas (1 Toque)**

- **FR23:** O sistema deve permitir criar uma venda direta em no maximo 30 segundos (selecionar produto/servico + cliente + forma de pagamento + confirmar)
- **FR24:** O sistema deve permitir criar orcamentos com itens, quantidades, valores e desconto
- **FR25:** O sistema deve permitir converter orcamento em venda com 1 clique
- **FR26:** Toda venda confirmada deve gerar automaticamente lancamento financeiro (conta a receber) e baixa de estoque (se produto)
- **FR27:** O sistema deve gerar link de pagamento PIX automaticamente ao confirmar venda
- **FR28:** O sistema deve permitir venda sem cliente identificado (venda balcao/consumidor final)
- **FR29:** O sistema deve manter historico completo de vendas com filtros por periodo, cliente, produto e status

**PIX Nativo**

- **FR30:** O sistema deve gerar cobranca PIX (QR code + copia-e-cola + link compartilhavel) em 1 clique a partir de qualquer venda ou conta a receber
- **FR31:** O sistema deve receber notificacao de pagamento PIX via webhook e baixar automaticamente a conta a receber correspondente (conciliacao automatica)
- **FR32:** O sistema deve notificar o usuario em tempo real quando um pagamento PIX for recebido
- **FR33:** O sistema deve permitir compartilhar link de pagamento PIX via WhatsApp, SMS ou qualquer app de mensagem

**Fiscal (Compliance Automatico)**

- **FR34:** O sistema deve emitir NFe (Nota Fiscal Eletronica de produto) via integracao com API fiscal (Focus NFe)
- **FR35:** O sistema deve emitir NFSe Nacional (Nota Fiscal de Servico eletronica) via integracao com API fiscal
- **FR36:** O sistema deve emitir NFCe (Nota Fiscal de Consumidor eletronica) para vendas a consumidor final
- **FR37:** O sistema deve incluir campos CBS/IBS conforme reforma tributaria 2026 em todos os documentos fiscais
- **FR38:** O sistema deve vincular automaticamente: Venda -> NFe/NFSe -> Lancamento financeiro (fluxo completo sem intervencao manual)
- **FR39:** O sistema deve determinar automaticamente o regime tributario e aliquotas com base nos dados da empresa (Simples Nacional, MEI, etc.)
- **FR40:** O sistema deve permitir emissao de documento fiscal sem exigir conhecimento contabil do usuario - preenchendo automaticamente CFOP, CST, NCM quando possivel
- **FR41:** O sistema deve armazenar XML das notas fiscais emitidas e permitir download

**WhatsApp Business**

- **FR42:** O sistema deve permitir enviar cobranca PIX (link + valor) via WhatsApp para o cliente com 1 clique
- **FR43:** O sistema deve enviar notificacao automatica via WhatsApp quando NFe/NFSe for emitida para o cliente
- **FR44:** O sistema deve enviar lembrete automatico de vencimento via WhatsApp (configuravel: 3 dias antes, no dia, 1 dia depois)
- **FR45:** O sistema deve permitir enviar orcamento formatado via WhatsApp para o cliente

**Estoque Simplificado**

- **FR46:** O sistema deve registrar entrada de estoque vinculada a compra/fornecedor
- **FR47:** O sistema deve registrar saida automatica de estoque vinculada a venda
- **FR48:** O sistema deve exibir saldo atual de cada produto em tempo real
- **FR49:** O sistema deve alertar quando produto atingir estoque minimo (configuravel por produto)
- **FR50:** O estoque nao deve incluir controle de lotes, series, localizacao ou inventario complexo no MVP

**PWA Mobile-First**

- **FR51:** O sistema deve funcionar como PWA instalavel no celular (manifest.json, service worker, icone na home screen)
- **FR52:** Todas as operacoes essenciais (vender, cobrar, consultar saldo, emitir nota) devem ser executaveis 100% pelo celular
- **FR53:** O sistema deve utilizar camera do celular para digitalizar notas de fornecedor (captura de imagem para anexo)
- **FR54:** O sistema deve funcionar em modo offline basico (consultar cadastros e saldos) com sincronizacao posterior

**Configuracoes e Perfil**

- **FR55:** O sistema deve permitir configurar dados da empresa (razao social, CNPJ/CPF, endereco, regime tributario, logo)
- **FR56:** O sistema deve permitir configurar certificado digital para emissao de NFe (upload A1)
- **FR57:** O sistema deve permitir configurar preferencias de notificacao (WhatsApp, email, push)
- **FR58:** O sistema deve implementar controle de limites por plano (faturamento, quantidade de vendas, funcionalidades disponiveis)

### 2.2 Non-Functional Requirements

**Performance**

- **NFR1:** First Contentful Paint (FCP) deve ser inferior a 1.5 segundos em conexao 4G
- **NFR2:** Time to Interactive (TTI) deve ser inferior a 3 segundos em conexao 4G
- **NFR3:** API responses devem ter latencia media inferior a 200ms para operacoes CRUD
- **NFR4:** Geracao de QR code PIX deve completar em menos de 1 segundo
- **NFR5:** Dashboard financeiro deve carregar em menos de 2 segundos com ate 12 meses de dados

**Seguranca e LGPD**

- **NFR6:** Todos os dados devem ser criptografados em transito (TLS 1.3) e em repouso
- **NFR7:** Multi-tenant deve usar Row-Level Security (RLS) no PostgreSQL garantindo isolamento total entre tenants
- **NFR8:** O sistema deve manter audit logs de todas as operacoes criticas (login, alteracao de dados financeiros, emissao fiscal, exclusao de registros)
- **NFR9:** O sistema deve estar em conformidade com LGPD: consentimento explicito para dados pessoais, direito ao esquecimento, portabilidade de dados
- **NFR10:** Senhas devem ser armazenadas com hash bcrypt (custo >= 12)
- **NFR11:** API deve implementar rate limiting para prevenir abuso (100 req/min por tenant)
- **NFR12:** Tokens de sessao devem expirar em 24 horas com refresh token de 30 dias

**Disponibilidade e Confiabilidade**

- **NFR13:** O sistema deve ter disponibilidade de 99.5% (downtime maximo ~3.6h/mes)
- **NFR14:** Backup automatico do banco de dados a cada 6 horas com retencao de 30 dias
- **NFR15:** Integracoes externas (Focus NFe, Mercado Pago, WhatsApp) devem usar circuit breaker pattern com retry automatico e fila de fallback
- **NFR16:** O sistema deve funcionar em modo degradado quando integracoes externas estiverem indisponiveis (gravar operacao pendente e processar quando disponivel)

**Escalabilidade**

- **NFR17:** A arquitetura deve suportar ate 10.000 tenants ativos simultaneos sem degradacao significativa
- **NFR18:** O banco de dados deve ser particionavel por tenant_id quando necessario para performance
- **NFR19:** Jobs assincronos (NFe, WhatsApp, webhooks) devem usar fila (BullMQ + Redis) com concorrencia configuravel

**Compatibilidade**

- **NFR20:** O sistema deve funcionar nos navegadores Chrome, Safari, Firefox e Edge (ultimas 2 versoes)
- **NFR21:** O PWA deve funcionar em Android 8+ e iOS 14+
- **NFR22:** A interface deve ser responsiva: mobile-first com suporte a tablet e desktop
- **NFR23:** O sistema deve funcionar adequadamente em telas a partir de 320px de largura

**Observabilidade**

- **NFR24:** O sistema deve integrar monitoramento de erros (Sentry) com alertas para erros criticos
- **NFR25:** O sistema deve integrar analytics de uso (PostHog) para metricas de produto (DAU/MAU, Time to Value, funnel de onboarding)
- **NFR26:** Logs estruturados em JSON para todas as operacoes de negocio (vendas, fiscal, pagamentos)

**Custos**

- **NFR27:** A infraestrutura deve priorizar tiers gratuitos e pay-as-you-go: Vercel free tier, Supabase free tier, para manter custos abaixo de US$ 50/mes ate 500 usuarios ativos

---
