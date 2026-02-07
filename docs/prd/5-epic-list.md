# 5. Epic List

> Epics sequenciados para entrega incremental de valor. Cada epic e um incremento deployavel e testavel.

### Epic 1: Fundacao e Autenticacao
**Goal:** Estabelecer a infraestrutura base do projeto (Next.js, PostgreSQL, CI/CD), implementar autenticacao com Google OAuth, multi-tenant com RLS, e entregar o onboarding wizard - resultando em um sistema onde o usuario pode se cadastrar, criar sua empresa e estar pronto para usar o sistema.

### Epic 2: Cadastros Progressivos
**Goal:** Implementar os cadastros essenciais (Clientes, Fornecedores, Produtos/Servicos, Formas de Pagamento) com modelo progressivo (campos minimos que expandem) e busca rapida, permitindo que o usuario popule sua base de dados de forma simples e natural.

### Epic 3: Financeiro e Dashboard Semaforo
**Goal:** Implementar o coracao do sistema - contas a pagar/receber, fluxo de caixa diario, dashboard com semaforo visual (verde/amarelo/vermelho), alertas proativos de caixa e a funcionalidade "Quanto posso retirar?" - entregando ao usuario visibilidade real sobre a saude financeira do negocio.

### Epic 4: Vendas e PIX Nativo
**Goal:** Implementar vendas rapidas (1 toque), orcamentos com conversao em venda, integracao PIX via Mercado Pago (geracao de cobranca, QR code, conciliacao automatica via webhook), e a vinculacao automatica Venda -> Financeiro - permitindo ao usuario vender e cobrar de forma integrada.

### Epic 5: Fiscal (NFe/NFSe/NFCe)
**Goal:** Implementar emissao de documentos fiscais (NFe, NFSe Nacional, NFCe) via Focus NFe com campos CBS/IBS preparados, vinculacao automatica Venda -> NFe -> Financeiro, e determinacao automatica de regime tributario - eliminando complexidade fiscal para o usuario.

### Epic 6: WhatsApp, Estoque e PWA
**Goal:** Implementar integracao WhatsApp Business (envio de cobranca, notificacao de NFe, lembrete de vencimento), estoque simplificado (entrada/saida/saldo com alertas), e PWA completo (instalavel, offline basico) - completando o MVP com todos os modulos e integracoes essenciais.

---
