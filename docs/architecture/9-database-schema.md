# 9. Database Schema

### 9.1 Prisma Schema

```prisma
generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["multiSchema", "postgresqlExtensions"]
}

datasource db {
  provider   = "postgresql"
  url        = env("DATABASE_URL")
  directUrl  = env("DIRECT_URL")
  extensions = [pgcrypto]
}

// ==================== AUTH ====================

model User {
  id           String       @id @default(cuid())
  email        String       @unique
  name         String
  image        String?
  provider     String       @default("google") // google | credentials
  passwordHash String?
  tenants      UserTenant[]
  auditLogs    AuditLog[]
  createdAt    DateTime     @default(now())
  updatedAt    DateTime     @updatedAt

  @@map("users")
}

model UserTenant {
  id        String   @id @default(cuid())
  userId    String
  tenantId  String
  role      String   @default("OWNER") // OWNER | ADMIN | USER
  isActive  Boolean  @default(false)
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  tenant    Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())

  @@unique([userId, tenantId])
  @@map("user_tenants")
}

// ==================== TENANT ====================

model Tenant {
  id                   String              @id @default(cuid())
  name                 String
  document             String?
  type                 String              @default("INFORMAL") // MEI | ME | EPP | INFORMAL
  plan                 String              @default("FREE") // FREE | STARTER | GROWTH | PRO
  businessType         String?
  monthlyRevenue       String?
  onboardingCompleted  Boolean             @default(false)
  address              Json?
  phone                String?
  email                String?
  logo                 String?
  users                UserTenant[]
  clientes             Cliente[]
  fornecedores         Fornecedor[]
  produtos             Produto[]
  formasPagamento      FormaPagamento[]
  contasPagar          ContaPagar[]
  contasReceber        ContaReceber[]
  vendas               Venda[]
  orcamentos           Orcamento[]
  pixCharges           PixCharge[]
  notasFiscais         NotaFiscal[]
  configFiscal         ConfigFiscal?
  movimentacoesEstoque MovimentacaoEstoque[]
  whatsappMessages     WhatsAppMessage[]
  auditLogs            AuditLog[]
  reminderConfig       ReminderConfig?
  createdAt            DateTime            @default(now())
  updatedAt            DateTime            @updatedAt

  @@map("tenants")
}

// ==================== CADASTROS ====================

model Cliente {
  id             String         @id @default(cuid())
  tenantId       String
  name           String
  phone          String
  email          String?
  document       String?
  address        Json?
  notes          String?
  tenant         Tenant         @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  contasReceber  ContaReceber[]
  vendas         Venda[]
  orcamentos     Orcamento[]
  whatsappMessages WhatsAppMessage[]
  createdAt      DateTime       @default(now())
  updatedAt      DateTime       @updatedAt

  @@index([tenantId, name])
  @@index([tenantId, phone])
  @@index([tenantId, document])
  @@map("clientes")
}

model Fornecedor {
  id           String       @id @default(cuid())
  tenantId     String
  name         String
  phone        String?
  email        String?
  document     String?
  address      Json?
  notes        String?
  tenant       Tenant       @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  contasPagar  ContaPagar[]
  createdAt    DateTime     @default(now())
  updatedAt    DateTime     @updatedAt

  @@index([tenantId, name])
  @@map("fornecedores")
}

model Produto {
  id                   String              @id @default(cuid())
  tenantId             String
  type                 String              @default("PRODUTO") // PRODUTO | SERVICO
  name                 String
  sellPrice            Int                 // centavos
  costPrice            Int?                // centavos
  unit                 String              @default("un")
  barcode              String?
  ncm                  String?
  description          String?
  stockMin             Int?
  trackStock           Boolean             @default(true)
  active               Boolean             @default(true)
  tenant               Tenant              @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  movimentacoesEstoque MovimentacaoEstoque[]
  createdAt            DateTime            @default(now())
  updatedAt            DateTime            @updatedAt

  @@index([tenantId, name])
  @@index([tenantId, barcode])
  @@map("produtos")
}

model FormaPagamento {
  id           String   @id @default(cuid())
  tenantId     String
  name         String
  type         String   // PIX | DINHEIRO | DEBITO | CREDITO | BOLETO | OUTRO
  active       Boolean  @default(true)
  isDefault    Boolean  @default(false)
  installments Int      @default(1)
  fee          Int      @default(0) // centesimos (250 = 2.50%)
  tenant       Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  createdAt    DateTime @default(now())

  @@index([tenantId])
  @@map("formas_pagamento")
}

// ==================== FINANCEIRO ====================

model ContaPagar {
  id             String      @id @default(cuid())
  tenantId       String
  description    String
  amount         Int         // centavos
  dueDate        DateTime
  paidDate       DateTime?
  status         String      @default("PENDENTE") // PENDENTE | PAGO | VENCIDO | CANCELADO
  category       String
  supplierId     String?
  notes          String?
  recurrent      Boolean     @default(false)
  recurrenceType String?     // MENSAL | SEMANAL | QUINZENAL
  tenant         Tenant      @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  supplier       Fornecedor? @relation(fields: [supplierId], references: [id])
  createdAt      DateTime    @default(now())
  updatedAt      DateTime    @updatedAt

  @@index([tenantId, status])
  @@index([tenantId, dueDate])
  @@index([tenantId, category])
  @@map("contas_pagar")
}

model ContaReceber {
  id           String      @id @default(cuid())
  tenantId     String
  description  String
  amount       Int         // centavos
  dueDate      DateTime
  receivedDate DateTime?
  status       String      @default("PENDENTE") // PENDENTE | RECEBIDO | VENCIDO | CANCELADO
  category     String      @default("Vendas")
  clientId     String?
  saleId       String?
  notes        String?
  tenant       Tenant      @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  client       Cliente?    @relation(fields: [clientId], references: [id])
  sale         Venda?      @relation(fields: [saleId], references: [id])
  pixCharges   PixCharge[]
  createdAt    DateTime    @default(now())
  updatedAt    DateTime    @updatedAt

  @@index([tenantId, status])
  @@index([tenantId, dueDate])
  @@map("contas_receber")
}

// ==================== VENDAS ====================

model Venda {
  id              String         @id @default(cuid())
  tenantId        String
  clientId        String?
  items           Json           // VendaItem[]
  subtotal        Int            // centavos
  discount        Int            @default(0) // centavos
  total           Int            // centavos
  paymentMethodId String
  status          String         @default("RASCUNHO") // RASCUNHO | CONFIRMADA | CANCELADA
  notes           String?
  tenant          Tenant         @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  client          Cliente?       @relation(fields: [clientId], references: [id])
  contasReceber   ContaReceber[]
  notasFiscais    NotaFiscal[]
  orcamentoOrigem Orcamento?     @relation("OrcamentoVenda")
  createdAt       DateTime       @default(now())
  updatedAt       DateTime       @updatedAt

  @@index([tenantId, status])
  @@index([tenantId, createdAt])
  @@map("vendas")
}

model Orcamento {
  id         String   @id @default(cuid())
  tenantId   String
  clientId   String?
  items      Json     // VendaItem[]
  subtotal   Int      // centavos
  discount   Int      @default(0)
  total      Int      // centavos
  validUntil DateTime
  status     String   @default("PENDENTE") // PENDENTE | APROVADO | RECUSADO | CONVERTIDO | EXPIRADO
  notes      String?
  saleId     String?  @unique
  tenant     Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  client     Cliente? @relation(fields: [clientId], references: [id])
  sale       Venda?   @relation("OrcamentoVenda", fields: [saleId], references: [id])
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  @@index([tenantId, status])
  @@map("orcamentos")
}

// ==================== PIX ====================

model PixCharge {
  id              String       @id @default(cuid())
  tenantId        String
  contaReceberId  String
  externalId      String       // Mercado Pago ID
  amount          Int          // centavos
  qrCode          String       // base64
  qrCodeText      String       // copia-e-cola
  paymentLink     String
  status          String       @default("PENDING") // PENDING | PAID | EXPIRED | CANCELLED
  expiresAt       DateTime
  paidAt          DateTime?
  tenant          Tenant       @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  contaReceber    ContaReceber @relation(fields: [contaReceberId], references: [id])
  createdAt       DateTime     @default(now())

  @@index([tenantId])
  @@index([externalId])
  @@map("pix_charges")
}

// ==================== FISCAL ====================

model NotaFiscal {
  id           String    @id @default(cuid())
  tenantId     String
  type         String    // NFE | NFSE | NFCE
  saleId       String
  numero       Int?
  serie        String?
  chaveAcesso  String?
  xmlUrl       String?
  pdfUrl       String?
  status       String    @default("PROCESSANDO") // PROCESSANDO | AUTORIZADA | REJEITADA | CANCELADA
  focusNfeId   String?
  errorMessage String?
  emitidaEm    DateTime?
  tenant       Tenant    @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  sale         Venda     @relation(fields: [saleId], references: [id])
  createdAt    DateTime  @default(now())

  @@index([tenantId, type])
  @@index([tenantId, status])
  @@index([focusNfeId])
  @@map("notas_fiscais")
}

model ConfigFiscal {
  id                  String    @id @default(cuid())
  tenantId            String    @unique
  regimeTributario    String    @default("SIMPLES_NACIONAL")
  inscricaoEstadual   String?
  inscricaoMunicipal  String?
  certificateFileUrl  String?
  certificatePassword String?   // encrypted
  certificateExpiry   DateTime?
  ambiente            String    @default("HOMOLOGACAO") // HOMOLOGACAO | PRODUCAO
  serieNFe            Int       @default(1)
  serieNFSe           Int       @default(1)
  serieNFCe           Int       @default(1)
  ultimoNumeroNFe     Int       @default(0)
  ultimoNumeroNFSe    Int       @default(0)
  ultimoNumeroNFCe    Int       @default(0)
  tenant              Tenant    @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  createdAt           DateTime  @default(now())
  updatedAt           DateTime  @updatedAt

  @@map("config_fiscal")
}

// ==================== ESTOQUE ====================

model MovimentacaoEstoque {
  id          String   @id @default(cuid())
  tenantId    String
  productId   String
  type        String   // ENTRADA | SAIDA | AJUSTE
  quantity    Int
  reason      String   // COMPRA | VENDA | AJUSTE_MANUAL
  referenceId String?
  notes       String?
  tenant      Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  product     Produto  @relation(fields: [productId], references: [id])
  createdAt   DateTime @default(now())

  @@index([tenantId, productId])
  @@map("movimentacoes_estoque")
}

// ==================== WHATSAPP ====================

model WhatsAppMessage {
  id           String   @id @default(cuid())
  tenantId     String
  clientId     String?
  phone        String
  type         String   // COBRANCA | NFE | LEMBRETE | ORCAMENTO
  templateId   String
  status       String   @default("QUEUED") // QUEUED | SENT | DELIVERED | READ | FAILED
  externalId   String?
  errorMessage String?
  sentAt       DateTime?
  tenant       Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  client       Cliente? @relation(fields: [clientId], references: [id])
  createdAt    DateTime @default(now())

  @@index([tenantId, type])
  @@map("whatsapp_messages")
}

model ReminderConfig {
  id              String  @id @default(cuid())
  tenantId        String  @unique
  enabled         Boolean @default(true)
  daysBefore      Int     @default(3)
  onDueDate       Boolean @default(true)
  daysAfter       Int     @default(1)
  tenant          Tenant  @relation(fields: [tenantId], references: [id], onDelete: Cascade)

  @@map("reminder_configs")
}

// ==================== AUDIT ====================

model AuditLog {
  id        String   @id @default(cuid())
  tenantId  String
  userId    String
  action    String
  entity    String
  entityId  String?
  changes   Json?
  ipAddress String?
  userAgent String?
  tenant    Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  user      User     @relation(fields: [userId], references: [id])
  createdAt DateTime @default(now())

  @@index([tenantId, entity])
  @@index([tenantId, createdAt])
  @@map("audit_logs")
}
```

### 9.2 Row-Level Security (RLS)

RLS policies aplicadas via migration SQL (nao gerenciadas pelo Prisma):

```sql
-- Habilitar RLS em todas as tabelas de dados
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE fornecedores ENABLE ROW LEVEL SECURITY;
ALTER TABLE produtos ENABLE ROW LEVEL SECURITY;
ALTER TABLE formas_pagamento ENABLE ROW LEVEL SECURITY;
ALTER TABLE contas_pagar ENABLE ROW LEVEL SECURITY;
ALTER TABLE contas_receber ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendas ENABLE ROW LEVEL SECURITY;
ALTER TABLE orcamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE pix_charges ENABLE ROW LEVEL SECURITY;
ALTER TABLE notas_fiscais ENABLE ROW LEVEL SECURITY;
ALTER TABLE config_fiscal ENABLE ROW LEVEL SECURITY;
ALTER TABLE movimentacoes_estoque ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminder_configs ENABLE ROW LEVEL SECURITY;

-- Policy padrao: tenant_id must match current setting
-- Set via: SET app.current_tenant_id = 'tenant_cuid';
CREATE POLICY tenant_isolation ON clientes
  USING (tenant_id = current_setting('app.current_tenant_id', true));
-- (repetir para todas as tabelas acima)
```

**Prisma Client Extension** para auto-inject tenant_id:

```typescript
// src/lib/prisma.ts
const prismaWithTenant = prisma.$extends({
  query: {
    $allModels: {
      async $allOperations({ args, query, model }) {
        // Skip models without tenantId (User, UserTenant)
        if (['User', 'UserTenant'].includes(model)) return query(args);

        const tenantId = getTenantIdFromContext();
        if (!tenantId) throw new Error('Tenant context required');

        // Inject tenantId in where clauses and create data
        // ... implementation details
        return query(args);
      },
    },
  },
});
```

---
