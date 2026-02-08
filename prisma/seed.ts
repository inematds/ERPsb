import { PrismaClient } from '@prisma/client';

// Use DIRECT_URL to bypass pgbouncer for bulk operations
const prisma = new PrismaClient({
  datasourceUrl: process.env.DIRECT_URL || process.env.DATABASE_URL,
});

// ==================== HELPERS ====================

function brl(value: number): number {
  return Math.round(value * 100);
}

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickN<T>(arr: T[], n: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}

function randomDateInMonth(year: number, month: number, maxDay?: number): Date {
  const daysInMonth = maxDay ?? new Date(year, month + 1, 0).getDate();
  const day = randInt(1, daysInMonth);
  const hour = randInt(8, 19);
  const minute = randInt(0, 59);
  return new Date(year, month, day, hour, minute, 0);
}

function cpf(): string {
  const n = () => randInt(0, 9);
  return `${n()}${n()}${n()}.${n()}${n()}${n()}.${n()}${n()}${n()}-${n()}${n()}`;
}

function cnpj(): string {
  const n = () => randInt(0, 9);
  return `${n()}${n()}.${n()}${n()}${n()}.${n()}${n()}${n()}/0001-${n()}${n()}`;
}

// ==================== DATA DEFINITIONS ====================

const CLIENTES = [
  { name: 'Maria da Silva Santos', phone: '(47) 99234-5678', document: cpf(), email: 'maria.silva@email.com' },
  { name: 'João Pedro Oliveira', phone: '(47) 99345-6789', document: cpf(), email: null },
  { name: 'Ana Carolina Souza', phone: '(47) 99456-7890', document: null, email: 'ana.souza@gmail.com' },
  { name: 'Carlos Eduardo Lima', phone: '(47) 99567-8901', document: cpf(), email: null },
  { name: 'Fernanda Rodrigues Costa', phone: '(47) 99678-9012', document: null, email: null },
  { name: 'Roberto Almeida Jr.', phone: '(48) 99123-4567', document: cpf(), email: 'roberto.almeida@hotmail.com' },
  { name: 'Patricia Ferreira Mendes', phone: '(48) 99234-5678', document: null, email: null },
  { name: 'Lucas Gabriel Pereira', phone: '(48) 99345-6789', document: cpf(), email: 'lucas.pereira@email.com' },
  { name: 'Camila Aparecida Gomes', phone: '(47) 99789-0123', document: null, email: null },
  { name: 'Marcos Vinicius Ribeiro', phone: '(47) 99890-1234', document: cpf(), email: null },
  { name: 'Juliana Cristina Martins', phone: '(47) 99901-2345', document: null, email: 'juliana.martins@outlook.com' },
  { name: 'Anderson Luis Barbosa', phone: '(48) 99456-7890', document: cpf(), email: null },
  { name: 'Beatriz Helena Cardoso', phone: '(48) 99567-8901', document: null, email: null },
  { name: 'Diego Nascimento', phone: '(47) 99012-3456', document: null, email: 'diego.nasc@gmail.com' },
  { name: 'Simone Aparecida Araújo', phone: '(47) 99111-2233', document: cpf(), email: null },
  { name: 'Thiago Henrique Campos', phone: '(48) 99678-9012', document: null, email: null },
  { name: 'Renata de Oliveira Dias', phone: '(47) 99222-3344', document: cpf(), email: 'renata.dias@email.com' },
  { name: 'Felipe Augusto Moreira', phone: '(47) 99333-4455', document: null, email: null },
  { name: 'Adriana Souza Freitas', phone: '(48) 99789-0123', document: cpf(), email: null },
  { name: 'Rafael Santos Correia', phone: '(47) 99444-5566', document: null, email: 'rafael.correia@gmail.com' },
];

const FORNECEDORES = [
  { name: 'Distribuidora Têxtil Sul Ltda', phone: '(47) 3333-1234', document: cnpj(), email: 'vendas@textilsul.com.br' },
  { name: 'Atacadão Moda & Cia', phone: '(11) 4444-5678', document: cnpj(), email: 'pedidos@modaecia.com.br' },
  { name: 'Import Calçados Brasil', phone: '(11) 4555-6789', document: cnpj(), email: 'contato@importcalcados.com.br' },
  { name: 'Acessórios & Bijuterias Nacional', phone: '(21) 3666-7890', document: cnpj(), email: 'comercial@acessoriosnacional.com.br' },
  { name: 'Confecções Estrela do Norte', phone: '(47) 3777-8901', document: cnpj(), email: 'vendas@estreladonorte.com.br' },
  { name: 'Mega Atacado Vestuário', phone: '(11) 4888-9012', document: cnpj(), email: 'compras@megaatacado.com.br' },
  { name: 'Central Embalagens SC', phone: '(48) 3999-0123', document: cnpj(), email: 'vendas@centralembalagens.com.br' },
  { name: 'Papelaria e Escritório Express', phone: '(47) 3111-2234', document: cnpj(), email: 'contato@escritorioexpress.com.br' },
];

const PRODUTOS = [
  { name: 'Blusa Feminina Básica', sellPrice: brl(49.90), costPrice: brl(22), unit: 'un', stockMin: 5 },
  { name: 'Calça Jeans Feminina Slim', sellPrice: brl(129.90), costPrice: brl(58), unit: 'un', stockMin: 3 },
  { name: 'Vestido Casual Midi', sellPrice: brl(89.90), costPrice: brl(38), unit: 'un', stockMin: 3 },
  { name: 'Saia Midi Estampada', sellPrice: brl(69.90), costPrice: brl(30), unit: 'un', stockMin: 3 },
  { name: 'Shorts Jeans Feminino', sellPrice: brl(79.90), costPrice: brl(35), unit: 'un', stockMin: 4 },
  { name: 'Cropped Feminino', sellPrice: brl(39.90), costPrice: brl(16), unit: 'un', stockMin: 5 },
  { name: 'Camiseta Masculina Lisa', sellPrice: brl(39.90), costPrice: brl(15), unit: 'un', stockMin: 8 },
  { name: 'Calça Jeans Masculina Reta', sellPrice: brl(119.90), costPrice: brl(52), unit: 'un', stockMin: 3 },
  { name: 'Bermuda Masculina Sarja', sellPrice: brl(89.90), costPrice: brl(38), unit: 'un', stockMin: 4 },
  { name: 'Camisa Polo Masculina', sellPrice: brl(69.90), costPrice: brl(28), unit: 'un', stockMin: 4 },
  { name: 'Moletom Masculino com Capuz', sellPrice: brl(119.90), costPrice: brl(50), unit: 'un', stockMin: 3 },
  { name: 'Tênis Casual Feminino', sellPrice: brl(159.90), costPrice: brl(72), unit: 'par', stockMin: 2 },
  { name: 'Sandália Rasteira Feminina', sellPrice: brl(69.90), costPrice: brl(28), unit: 'par', stockMin: 3 },
  { name: 'Sapato Social Masculino', sellPrice: brl(189.90), costPrice: brl(85), unit: 'par', stockMin: 2 },
  { name: 'Tênis Esportivo Unissex', sellPrice: brl(199.90), costPrice: brl(92), unit: 'par', stockMin: 2 },
  { name: 'Chinelo Slide Unissex', sellPrice: brl(49.90), costPrice: brl(18), unit: 'par', stockMin: 5 },
  { name: 'Bolsa Feminina Média', sellPrice: brl(129.90), costPrice: brl(55), unit: 'un', stockMin: 2 },
  { name: 'Carteira Masculina Couro', sellPrice: brl(79.90), costPrice: brl(32), unit: 'un', stockMin: 3 },
  { name: 'Cinto Masculino Couro', sellPrice: brl(59.90), costPrice: brl(22), unit: 'un', stockMin: 3 },
  { name: 'Relógio Casual Unissex', sellPrice: brl(149.90), costPrice: brl(65), unit: 'un', stockMin: 2 },
  { name: 'Óculos de Sol Unissex', sellPrice: brl(89.90), costPrice: brl(35), unit: 'un', stockMin: 3 },
  { name: 'Mochila Escolar', sellPrice: brl(109.90), costPrice: brl(45), unit: 'un', stockMin: 3 },
  { name: 'Chapéu Bucket Hat', sellPrice: brl(49.90), costPrice: brl(18), unit: 'un', stockMin: 4 },
  { name: 'Kit Meias (3 pares)', sellPrice: brl(29.90), costPrice: brl(10), unit: 'kit', stockMin: 8 },
  { name: 'Pulseira/Bracelete', sellPrice: brl(34.90), costPrice: brl(12), unit: 'un', stockMin: 5 },
];

// Monthly revenue targets in centavos
const MONTHLY_REVENUE: Record<string, number> = {
  '2025-01': brl(35000),
  '2025-02': brl(32000),
  '2025-03': brl(38000),
  '2025-04': brl(42000),
  '2025-05': brl(55000),
  '2025-06': brl(48000),
  '2025-07': brl(40000),
  '2025-08': brl(50000),
  '2025-09': brl(45000),
  '2025-10': brl(52000),
  '2025-11': brl(65000),
  '2025-12': brl(78000),
  '2026-01': brl(38000),
  '2026-02': brl(34000),
};

const FIXED_EXPENSES = [
  { description: 'Aluguel - Loja', amount: brl(3500), category: 'Aluguel' },
  { description: 'Salários - Funcionários', amount: brl(4500), category: 'Pessoal' },
  { description: 'Internet/Telefone', amount: brl(200), category: 'Utilidades' },
  { description: 'Contador - Honorários', amount: brl(500), category: 'Contabilidade' },
  { description: 'Energia Elétrica', amount: brl(380), category: 'Utilidades' },
  { description: 'Água e Esgoto', amount: brl(120), category: 'Utilidades' },
  { description: 'Sistema/Software', amount: brl(150), category: 'Tecnologia' },
];

const PAYMENT_WEIGHTS = [
  { type: 'PIX', weight: 40 },
  { type: 'CREDITO', weight: 25 },
  { type: 'DEBITO', weight: 20 },
  { type: 'DINHEIRO', weight: 15 },
];

function weightedPick(weights: { type: string; weight: number }[]): string {
  const total = weights.reduce((sum, w) => sum + w.weight, 0);
  let r = Math.random() * total;
  for (const w of weights) {
    r -= w.weight;
    if (r <= 0) return w.type;
  }
  return weights[0].type;
}

// ==================== MAIN SEED ====================

async function main() {
  console.log('Seeding database...');

  // Clean existing data
  console.log('Cleaning existing data...');
  await prisma.$transaction([
    prisma.movimentacaoEstoque.deleteMany(),
    prisma.pixCharge.deleteMany(),
    prisma.contaReceber.deleteMany(),
    prisma.contaPagar.deleteMany(),
    prisma.notaFiscal.deleteMany(),
    prisma.venda.deleteMany(),
    prisma.orcamento.deleteMany(),
    prisma.whatsAppMessage.deleteMany(),
    prisma.notification.deleteMany(),
    prisma.configFiscal.deleteMany(),
    prisma.lembreteConfig.deleteMany(),
    prisma.formaPagamento.deleteMany(),
    prisma.produto.deleteMany(),
    prisma.cliente.deleteMany(),
    prisma.fornecedor.deleteMany(),
    prisma.webhookLog.deleteMany(),
    prisma.userTenant.deleteMany(),
    prisma.account.deleteMany(),
    prisma.tenant.deleteMany(),
    prisma.user.deleteMany(),
  ]);

  // ==================== USER & TENANT ====================
  console.log('Creating user and tenant...');

  const user = await prisma.user.create({
    data: {
      email: 'admin@erpsb.com.br',
      name: 'Administrador',
      provider: 'credentials',
      emailVerified: new Date('2025-01-01'),
    },
  });

  const tenant = await prisma.tenant.create({
    data: {
      name: 'Loja Modelo Comércio',
      document: '12.345.678/0001-90',
      type: 'MEI',
      plan: 'STARTER',
      businessType: 'Comércio Varejista de Roupas e Acessórios',
      monthlyRevenue: '30000-80000',
      onboardingCompleted: true,
      phone: '(47) 3322-1100',
      email: 'contato@lojamodelo.com.br',
      address: {
        street: 'Rua XV de Novembro',
        number: '1234',
        complement: 'Loja 01',
        neighborhood: 'Centro',
        city: 'Blumenau',
        state: 'SC',
        zipCode: '89010-000',
      },
    },
  });

  await prisma.userTenant.create({
    data: {
      userId: user.id,
      tenantId: tenant.id,
      role: 'OWNER',
      isActive: true,
    },
  });

  const tenantId = tenant.id;

  // ==================== PAYMENT METHODS ====================
  console.log('Creating payment methods...');

  const [pmPix, pmDinheiro, pmDebito, pmCredito] = await Promise.all([
    prisma.formaPagamento.create({
      data: { tenantId, name: 'PIX', type: 'PIX', isDefault: true, fee: 0 },
    }),
    prisma.formaPagamento.create({
      data: { tenantId, name: 'Dinheiro', type: 'DINHEIRO', fee: 0 },
    }),
    prisma.formaPagamento.create({
      data: { tenantId, name: 'Cartão Débito', type: 'DEBITO', fee: 0 },
    }),
    prisma.formaPagamento.create({
      data: { tenantId, name: 'Cartão Crédito', type: 'CREDITO', fee: 200, installments: 3 },
    }),
  ]);

  const pmMap: Record<string, string> = {
    PIX: pmPix.id,
    DINHEIRO: pmDinheiro.id,
    DEBITO: pmDebito.id,
    CREDITO: pmCredito.id,
  };

  // ==================== CLIENTS ====================
  console.log('Creating clients...');

  const clients = await Promise.all(
    CLIENTES.map((c) =>
      prisma.cliente.create({
        data: { tenantId, name: c.name, phone: c.phone, email: c.email, document: c.document },
      }),
    ),
  );

  // ==================== SUPPLIERS ====================
  console.log('Creating suppliers...');

  const suppliers = await Promise.all(
    FORNECEDORES.map((f) =>
      prisma.fornecedor.create({
        data: { tenantId, name: f.name, phone: f.phone, email: f.email, document: f.document },
      }),
    ),
  );

  // ==================== PRODUCTS ====================
  console.log('Creating products...');

  const products = await Promise.all(
    PRODUTOS.map((p) =>
      prisma.produto.create({
        data: {
          tenantId,
          name: p.name,
          sellPrice: p.sellPrice,
          costPrice: p.costPrice,
          unit: p.unit,
          trackStock: true,
          stockMin: p.stockMin,
          type: 'PRODUTO',
        },
      }),
    ),
  );

  const stockTracker: Record<string, number> = {};
  products.forEach((p) => (stockTracker[p.id] = 0));

  // ==================== GENERATE SALES ====================
  console.log('Creating sales...');

  let saleNumber = 1;
  const pendingContasReceber: Array<{
    tenantId: string;
    description: string;
    amount: number;
    dueDate: Date;
    receivedDate: Date | null;
    status: string;
    category: string;
    clientId: string | null;
    saleId: string;
    createdAt: Date;
    updatedAt: Date;
  }> = [];
  const pendingStockOut: Array<{
    tenantId: string;
    productId: string;
    type: string;
    quantity: number;
    reason: string;
    referenceId: string;
    createdAt: Date;
  }> = [];

  const months = Object.keys(MONTHLY_REVENUE);

  for (const monthKey of months) {
    const [yearStr, monthStr] = monthKey.split('-');
    const year = parseInt(yearStr);
    const month = parseInt(monthStr) - 1;
    const targetRevenue = MONTHLY_REVENUE[monthKey];
    const isPartialMonth = monthKey === '2026-02';
    const maxDay = isPartialMonth ? 8 : undefined;

    // Generate sales until we reach the target revenue (within ±10%)
    let monthlyTotal = 0;
    let monthSales = 0;
    const salesBatch: Array<{
      tenantId: string;
      number: number;
      clientId: string | null;
      items: unknown;
      subtotal: number;
      discount: number;
      total: number;
      paymentMethodId: string;
      status: string;
      createdAt: Date;
      updatedAt: Date;
    }> = [];

    // Keep generating sales until we're within 5% of target
    const minTarget = isPartialMonth ? targetRevenue * 0.2 : targetRevenue * 0.9;
    const maxTarget = isPartialMonth ? targetRevenue * 0.4 : targetRevenue * 1.1;

    while (monthlyTotal < minTarget) {
      const saleDate = randomDateInMonth(year, month, maxDay);

      // Pick 1-4 products, with higher quantity to reach revenue targets
      const numItems = randInt(1, 4);
      const saleProducts = pickN(products, numItems);

      const items: Array<{
        productId: string;
        productName: string;
        quantity: number;
        unitPrice: number;
        total: number;
      }> = [];

      let subtotal = 0;

      for (const prod of saleProducts) {
        // Higher quantities: 1-5 (weighted towards 1-3)
        const qty = Math.random() < 0.7 ? randInt(1, 3) : randInt(3, 5);
        const lineTotal = prod.sellPrice * qty;
        subtotal += lineTotal;

        items.push({
          productId: prod.id,
          productName: prod.name,
          quantity: qty,
          unitPrice: prod.sellPrice,
          total: lineTotal,
        });
      }

      // If approaching max, scale down
      if (monthlyTotal + subtotal > maxTarget && monthSales > 10) {
        break;
      }

      // Occasional discount (20% of sales)
      let discount = 0;
      if (Math.random() < 0.2) {
        discount = Math.round(subtotal * (randInt(5, 15) / 100));
      }

      const total = subtotal - discount;
      monthlyTotal += total;

      const hasClient = Math.random() < 0.7;
      const clientId = hasClient ? pick(clients).id : null;
      const payType = weightedPick(PAYMENT_WEIGHTS);

      salesBatch.push({
        tenantId,
        number: saleNumber++,
        clientId,
        items: items as unknown as never,
        subtotal,
        discount,
        total,
        paymentMethodId: pmMap[payType],
        status: 'CONFIRMADA',
        createdAt: saleDate,
        updatedAt: saleDate,
      });

      // Track stock decrements (will create movements after sale IDs are obtained)
      for (const item of items) {
        stockTracker[item.productId] -= item.quantity;
      }

      monthSales++;
    }

    // Insert sales in batches of 10 (need individual creates for saleId)
    for (let i = 0; i < salesBatch.length; i += 10) {
      const batch = salesBatch.slice(i, i + 10);
      const createdSales = await Promise.all(
        batch.map((s) => prisma.venda.create({ data: s })),
      );

      for (let j = 0; j < createdSales.length; j++) {
        const sale = createdSales[j];
        const saleData = batch[j];
        const saleItems = saleData.items as Array<{
          productId: string;
          quantity: number;
        }>;

        pendingContasReceber.push({
          tenantId,
          description: `Venda #${sale.number}`,
          amount: saleData.total,
          dueDate: saleData.createdAt,
          receivedDate: saleData.createdAt,
          status: 'RECEBIDO',
          category: 'Vendas',
          clientId: saleData.clientId,
          saleId: sale.id,
          createdAt: saleData.createdAt,
          updatedAt: saleData.createdAt,
        });

        for (const item of saleItems) {
          pendingStockOut.push({
            tenantId,
            productId: item.productId,
            type: 'SAIDA',
            quantity: item.quantity,
            reason: 'venda',
            referenceId: sale.id,
            createdAt: saleData.createdAt,
          });
        }
      }
    }

    console.log(
      `  ${monthKey}: ${monthSales} vendas, R$ ${(monthlyTotal / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
    );
  }

  // ==================== STOCK ENTRIES (purchases) ====================
  console.log('Creating stock entries...');

  const stockEntries: Array<{
    tenantId: string;
    productId: string;
    type: string;
    quantity: number;
    reason: string;
    referenceId: string | null;
    createdAt: Date;
  }> = [];

  // Calculate total sold per product to size restocking properly
  const totalSoldPerProduct: Record<string, number> = {};
  for (const prod of products) {
    totalSoldPerProduct[prod.id] = Math.abs(stockTracker[prod.id]);
  }

  // Initial stock (Jan 2, 2025) - enough for ~4 months
  const initialStockDate = new Date(2025, 0, 2, 9, 0);
  for (const prod of products) {
    const totalSold = totalSoldPerProduct[prod.id];
    const avgMonthlySales = Math.ceil(totalSold / 14);
    const initialQty = Math.max(avgMonthlySales * 4, 20);

    stockEntries.push({
      tenantId,
      productId: prod.id,
      type: 'ENTRADA',
      quantity: initialQty,
      reason: 'compra',
      referenceId: null,
      createdAt: initialStockDate,
    });
    stockTracker[prod.id] += initialQty;
  }

  // Periodic restocking every ~2 months, sized to cover next period's sales
  const restockDates = [
    new Date(2025, 2, 15, 10, 0),
    new Date(2025, 4, 10, 10, 0),
    new Date(2025, 6, 20, 10, 0),
    new Date(2025, 8, 12, 10, 0),
    new Date(2025, 10, 5, 10, 0),
    new Date(2026, 0, 10, 10, 0),
  ];

  for (const restockDate of restockDates) {
    for (const prod of products) {
      const totalSold = totalSoldPerProduct[prod.id];
      const avgMonthlySales = Math.ceil(totalSold / 14);
      // Restock ~2.5 months worth, with some randomness
      const qty = Math.max(Math.round(avgMonthlySales * 2.5 * (0.8 + Math.random() * 0.4)), 5);

      stockEntries.push({
        tenantId,
        productId: prod.id,
        type: 'ENTRADA',
        quantity: qty,
        reason: 'compra',
        referenceId: null,
        createdAt: restockDate,
      });
      stockTracker[prod.id] += qty;
    }
  }

  // Combine all stock movements and bulk insert
  const allStockMovements = [...stockEntries, ...pendingStockOut].sort(
    (a, b) => a.createdAt.getTime() - b.createdAt.getTime(),
  );

  // Batch insert stock movements in chunks of 50
  for (let i = 0; i < allStockMovements.length; i += 50) {
    const chunk = allStockMovements.slice(i, i + 50);
    await prisma.movimentacaoEstoque.createMany({ data: chunk });
  }

  console.log(`  ${allStockMovements.length} stock movements created`);

  // Print low stock items
  for (const prod of products) {
    const stock = stockTracker[prod.id];
    const def = PRODUTOS.find((p) => p.name === prod.name);
    if (def && stock <= (def.stockMin ?? 0)) {
      console.log(`  LOW STOCK: ${prod.name}: ${stock} (min: ${def.stockMin})`);
    }
  }

  // ==================== CONTAS A RECEBER (bulk) ====================
  console.log('Creating contas a receber...');

  for (let i = 0; i < pendingContasReceber.length; i += 50) {
    const chunk = pendingContasReceber.slice(i, i + 50);
    await prisma.contaReceber.createMany({ data: chunk });
  }

  console.log(`  ${pendingContasReceber.length} contas a receber created`);

  // ==================== CONTAS A PAGAR ====================
  console.log('Creating contas a pagar...');

  const today = new Date(2026, 1, 8);
  const contasPagar: Array<{
    tenantId: string;
    description: string;
    amount: number;
    dueDate: Date;
    paidDate: Date | null;
    status: string;
    category: string;
    supplierId: string | null;
    recurrent: boolean;
    recurrenceType: string | null;
    createdAt: Date;
    updatedAt: Date;
  }> = [];

  for (const monthKey of months) {
    const [yearStr, monthStr] = monthKey.split('-');
    const year = parseInt(yearStr);
    const month = parseInt(monthStr) - 1;
    const targetRevenue = MONTHLY_REVENUE[monthKey];

    // Fixed expenses
    for (const expense of FIXED_EXPENSES) {
      const dueDay =
        expense.category === 'Aluguel' ? 5 : expense.category === 'Pessoal' ? 7 : randInt(10, 25);
      const dueDate = new Date(year, month, Math.min(dueDay, 28));

      let amount = expense.amount;
      if (expense.category === 'Utilidades') {
        amount = Math.round(amount * (0.85 + Math.random() * 0.3));
      }

      const isPast = dueDate < today;

      contasPagar.push({
        tenantId,
        description: expense.description,
        amount,
        dueDate,
        paidDate: isPast ? new Date(dueDate.getTime() + randInt(0, 3) * 86400000) : null,
        status: isPast ? 'PAGO' : 'PENDENTE',
        category: expense.category,
        supplierId: null,
        recurrent: true,
        recurrenceType: 'MENSAL',
        createdAt: new Date(year, month, 1, 8, 0),
        updatedAt: isPast ? dueDate : new Date(year, month, 1, 8, 0),
      });
    }

    // Supplier purchases (~40% of revenue)
    const supplierSpend = targetRevenue * 0.4;
    const numPurchases = randInt(2, 4);
    let remaining = supplierSpend;

    for (let i = 0; i < numPurchases; i++) {
      const isLast = i === numPurchases - 1;
      const amount = isLast
        ? Math.round(remaining)
        : Math.round(remaining * (0.2 + Math.random() * 0.4));
      remaining -= amount;

      const supplier = pick(suppliers);
      const dueDate = new Date(year, month, randInt(5, 25));
      const isPast = dueDate < today;

      contasPagar.push({
        tenantId,
        description: `Compra mercadoria - ${supplier.name.split(' ').slice(0, 2).join(' ')}`,
        amount,
        dueDate,
        paidDate: isPast ? new Date(dueDate.getTime() + randInt(0, 5) * 86400000) : null,
        status: isPast ? 'PAGO' : 'PENDENTE',
        category: 'Fornecedores',
        supplierId: supplier.id,
        recurrent: false,
        recurrenceType: null,
        createdAt: new Date(year, month, randInt(1, 5), 10, 0),
        updatedAt: isPast ? dueDate : new Date(year, month, randInt(1, 5), 10, 0),
      });
    }

    // Taxes (~8%)
    const taxAmount = Math.round(targetRevenue * 0.08);
    const taxDueDate = new Date(year, month + 1, 20);
    const taxPast = taxDueDate < today;
    const taxOverdue = !taxPast && monthKey === '2026-01';

    contasPagar.push({
      tenantId,
      description: `DAS - Simples Nacional ${monthStr}/${yearStr}`,
      amount: taxAmount,
      dueDate: taxDueDate,
      paidDate: taxPast ? new Date(taxDueDate.getTime() - randInt(1, 5) * 86400000) : null,
      status: taxPast ? 'PAGO' : taxOverdue ? 'VENCIDO' : 'PENDENTE',
      category: 'Impostos',
      supplierId: null,
      recurrent: false,
      recurrenceType: null,
      createdAt: new Date(year, month, 28, 10, 0),
      updatedAt: taxPast ? taxDueDate : new Date(year, month, 28, 10, 0),
    });

    // Occasional marketing
    if (Math.random() < 0.4 || month === 10 || month === 11) {
      const marketingDate = new Date(year, month, randInt(1, 20));
      const marketingPast = marketingDate < today;

      contasPagar.push({
        tenantId,
        description: pick([
          'Google Ads - Campanha mensal',
          'Instagram Ads - Promoção',
          'Panfletos e material gráfico',
          'Decoração vitrine',
          'Facebook Ads - Divulgação',
        ]),
        amount: brl(randInt(200, 800)),
        dueDate: marketingDate,
        paidDate: marketingPast ? marketingDate : null,
        status: marketingPast ? 'PAGO' : 'PENDENTE',
        category: 'Marketing',
        supplierId: null,
        recurrent: false,
        recurrenceType: null,
        createdAt: marketingDate,
        updatedAt: marketingDate,
      });
    }
  }

  // Add specific overdue bills
  contasPagar.push({
    tenantId,
    description: 'Manutenção Ar Condicionado',
    amount: brl(450),
    dueDate: new Date(2026, 0, 28),
    paidDate: null,
    status: 'VENCIDO',
    category: 'Manutenção',
    supplierId: null,
    recurrent: false,
    recurrenceType: null,
    createdAt: new Date(2026, 0, 20),
    updatedAt: new Date(2026, 0, 20),
  });

  contasPagar.push({
    tenantId,
    description: 'Compra mercadoria - Distribuidora Têxtil Sul',
    amount: brl(3200),
    dueDate: new Date(2026, 0, 30),
    paidDate: null,
    status: 'VENCIDO',
    category: 'Fornecedores',
    supplierId: suppliers[0].id,
    recurrent: false,
    recurrenceType: null,
    createdAt: new Date(2026, 0, 15),
    updatedAt: new Date(2026, 0, 15),
  });

  // Bulk insert contas a pagar
  for (let i = 0; i < contasPagar.length; i += 50) {
    const chunk = contasPagar.slice(i, i + 50);
    await prisma.contaPagar.createMany({ data: chunk });
  }

  console.log(`  ${contasPagar.length} contas a pagar created`);

  // ==================== SUMMARY ====================
  console.log('\n--- Seed Summary ---');
  console.log(`Users: 1`);
  console.log(`Tenants: 1`);
  console.log(`Payment methods: 4`);
  console.log(`Clients: ${clients.length}`);
  console.log(`Suppliers: ${suppliers.length}`);
  console.log(`Products: ${products.length}`);
  console.log(`Sales: ${saleNumber - 1}`);
  console.log(`Contas a receber: ${pendingContasReceber.length}`);
  console.log(`Contas a pagar: ${contasPagar.length}`);
  console.log(`Stock movements: ${allStockMovements.length}`);
  console.log('\nSeed completed!');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
