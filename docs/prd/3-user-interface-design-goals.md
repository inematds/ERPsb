# 3. User Interface Design Goals

### 3.1 Overall UX Vision

A experiencia do ERPsb deve ser radicalmente simples - mais proxima de um app de mensagens do que de um ERP tradicional. O usuario-alvo (MEI que controla tudo pelo celular) nunca usou um sistema de gestao e se intimida com interfaces cheias de menus, tabelas e formularios longos. A UX deve transmitir: "Isso e facil. Eu consigo usar isso."

Principios visuais:
- **Minimalismo funcional** - cada tela tem 1 objetivo claro
- **Linguagem humana** - semaforo em vez de numeros, perguntas em vez de relatorios
- **Acao em 1-2 toques** - operacoes frequentes acessiveis sem navegacao profunda
- **Feedback instantaneo** - toda acao gera resposta visual/sonora imediata
- **Educacao contextual** - dicas e tooltips ensinam gestao sem ser invasivo

### 3.2 Key Interaction Paradigms

- **Mobile-first touch** - botoes grandes (min 44px), gestos de swipe, pull-to-refresh
- **Bottom navigation** - menu principal no rodape (polegar alcanca facilmente)
- **Progressive disclosure** - mostrar apenas o essencial, expandir sob demanda
- **Quick actions FAB** - botao flutuante "+" para acoes rapidas (nova venda, nova cobranca, nova despesa)
- **Cards e chips** - informacao agrupada em cartoes visuais com status por cor
- **Formularios conversacionais** - campos aparecem um a um em fluxos criticos (onboarding, primeira venda)
- **Busca universal** - campo de busca acessivel em qualquer tela para encontrar clientes, produtos, vendas

### 3.3 Core Screens and Views

1. **Tela de Login/Cadastro** - Login social (Google) como CTA principal, email como alternativa
2. **Onboarding Wizard** - 5 telas com perguntas simples, uma por vez, com progresso visual
3. **Dashboard Principal (Home)** - Semaforo financeiro, saldo do dia, alertas, acoes rapidas (vender, cobrar, ver vendas)
4. **Modulo Financeiro** - Contas a pagar/receber em lista com filtros, fluxo de caixa grafico, botao "Quanto posso retirar?"
5. **Nova Venda (Quick Sale)** - Tela otimizada para venda rapida: selecionar itens, cliente (opcional), forma de pagamento, confirmar
6. **Orcamentos** - Lista de orcamentos com status, detalhes, botao "Converter em Venda" e "Enviar WhatsApp"
7. **Cobranca PIX** - QR code grande, botao copiar, botao compartilhar WhatsApp, status em tempo real
8. **Emissao Fiscal** - Formulario simplificado (sistema preenche automaticamente), preview da nota, botao emitir
9. **Cadastro de Clientes** - Lista com busca, cartao do cliente com historico resumido, formulario progressivo
10. **Cadastro de Produtos** - Lista com busca, cartao do produto com preco e estoque, formulario progressivo
11. **Estoque** - Lista de produtos com saldo, alertas de minimo, historico de movimentacoes
12. **Configuracoes** - Dados da empresa, certificado digital, notificacoes, plano/assinatura
13. **Notificacoes** - Centro de notificacoes (pagamentos recebidos, vencimentos, alertas de caixa)

### 3.4 Accessibility: WCAG AA

O sistema deve atender WCAG 2.1 nivel AA:
- Contraste minimo de 4.5:1 para texto normal
- Suporte a leitores de tela (ARIA labels)
- Navegacao por teclado em todas as funcionalidades
- Textos alternativos para elementos visuais
- Tamanho minimo de fonte 16px no mobile

### 3.5 Branding

- **Estilo visual:** Limpo, moderno, amigavel - inspirado em apps de fintech brasileiras (Nubank, PicPay)
- **Cores primarias:** A definir - preferencialmente tons que transmitam confianca e simplicidade (azul/verde)
- **Tipografia:** Sans-serif moderna (Inter ou similar) para legibilidade em telas pequenas
- **Tom de voz:** Informal, acolhedor, educativo - "Voce vendeu R$ 350 hoje! Seu caixa esta saudavel."
- **Icones:** Rounded, filled, estilo consistente (Lucide Icons via shadcn/ui)
- **Semaforo:** Verde (#22C55E), Amarelo (#EAB308), Vermelho (#EF4444) - cores do dashboard financeiro

### 3.6 Target Device and Platforms: Web Responsive (Mobile-First)

- **Primario:** Smartphones Android (320px-428px) - 70%+ dos usuarios
- **Secundario:** Smartphones iOS (375px-430px)
- **Terciario:** Tablets (768px-1024px) e Desktop (1024px+)
- **PWA:** Instalavel como app nativo no Android e iOS
- **Orientacao:** Portrait como padrao, landscape suportado em tablets/desktop

---
