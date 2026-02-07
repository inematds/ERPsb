import { prisma } from '@/lib/prisma';
import { createNFe, getNFeStatus, cancelNFe, createNFSe, getNFSeStatus, cancelNFSe, mapFocusStatus } from '@/integrations/fiscal-api/focusnfe.client';
import { getRegimeDefaults } from './fiscal.helpers';
import { incrementNumero } from './config-fiscal.service';
import type { ListNotasFiscaisQuery } from './nota-fiscal.schema';
import type { RegimeTributario } from './fiscal.helpers';

interface VendaItem {
  productId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export async function emitirNFe(tenantId: string, saleId: string) {
  const venda = await prisma.venda.findUnique({
    where: { id: saleId },
    include: {
      client: true,
      paymentMethod: true,
    },
  });

  if (!venda) throw new Error('Venda nao encontrada');
  if (venda.tenantId !== tenantId) throw new Error('Venda nao pertence ao tenant');
  if (venda.status !== 'CONFIRMADA') throw new Error('Venda precisa estar confirmada');

  const existingNota = await prisma.notaFiscal.findFirst({
    where: { saleId, type: 'NFE', status: { in: ['PROCESSANDO', 'AUTORIZADA'] } },
  });
  if (existingNota) throw new Error('Ja existe uma NFe para esta venda');

  const config = await prisma.configFiscal.findUnique({ where: { tenantId } });
  if (!config) throw new Error('Configuracao fiscal nao encontrada. Configure em Fiscal > Configuracao.');
  if (!config.regimeTributario) throw new Error('Regime tributario nao configurado');

  const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
  if (!tenant) throw new Error('Tenant nao encontrado');

  const numero = await incrementNumero(tenantId, 'NFe');
  const ref = `nfe-${tenantId.slice(0, 8)}-${numero}`;

  const nfePayload = buildNFePayload(venda, config, tenant, numero);

  const notaFiscal = await prisma.notaFiscal.create({
    data: {
      tenantId,
      type: 'NFE',
      saleId,
      numero,
      serie: config.serieNFe,
      status: 'PROCESSANDO',
      focusNfeId: ref,
      dadosNota: nfePayload as Record<string, unknown>,
    },
  });

  try {
    const result = await createNFe(ref, nfePayload as Record<string, unknown>, config.ambiente);
    const newStatus = mapFocusStatus(result.status);

    const updateData: Record<string, unknown> = {
      status: newStatus,
    };

    if (result.chave_nfe) updateData.chaveAcesso = result.chave_nfe;
    if (result.caminho_danfe) updateData.pdfUrl = result.caminho_danfe;
    if (result.mensagem_sefaz && newStatus === 'REJEITADA') updateData.errorMessage = result.mensagem_sefaz;
    if (newStatus === 'AUTORIZADA') updateData.emitidaEm = new Date();

    if (result.caminho_xml_nota_fiscal) {
      updateData.xmlContent = `<!-- XML disponivel em: ${result.caminho_xml_nota_fiscal} -->`;
    }

    const updated = await prisma.notaFiscal.update({
      where: { id: notaFiscal.id },
      data: updateData,
    });

    return updated;
  } catch (err) {
    await prisma.notaFiscal.update({
      where: { id: notaFiscal.id },
      data: {
        status: 'REJEITADA',
        errorMessage: err instanceof Error ? err.message : 'Erro ao emitir NFe',
      },
    });
    throw err;
  }
}

export async function emitirNFSe(tenantId: string, saleId: string) {
  const venda = await prisma.venda.findUnique({
    where: { id: saleId },
    include: { client: true, paymentMethod: true },
  });

  if (!venda) throw new Error('Venda nao encontrada');
  if (venda.tenantId !== tenantId) throw new Error('Venda nao pertence ao tenant');
  if (venda.status !== 'CONFIRMADA') throw new Error('Venda precisa estar confirmada');

  const existingNota = await prisma.notaFiscal.findFirst({
    where: { saleId, type: 'NFSE', status: { in: ['PROCESSANDO', 'AUTORIZADA'] } },
  });
  if (existingNota) throw new Error('Ja existe uma NFSe para esta venda');

  const config = await prisma.configFiscal.findUnique({ where: { tenantId } });
  if (!config) throw new Error('Configuracao fiscal nao encontrada. Configure em Fiscal > Configuracao.');

  const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
  if (!tenant) throw new Error('Tenant nao encontrado');

  const numero = await incrementNumero(tenantId, 'NFSe');
  const ref = `nfse-${tenantId.slice(0, 8)}-${numero}`;

  const nfsePayload = buildNFSePayload(venda, config, tenant, numero);

  const notaFiscal = await prisma.notaFiscal.create({
    data: {
      tenantId,
      type: 'NFSE',
      saleId,
      numero,
      serie: config.serieNFSe,
      status: 'PROCESSANDO',
      focusNfeId: ref,
      dadosNota: nfsePayload as Record<string, unknown>,
    },
  });

  try {
    const result = await createNFSe(ref, nfsePayload as Record<string, unknown>, config.ambiente);
    const newStatus = mapFocusStatus(result.status);

    const updateData: Record<string, unknown> = { status: newStatus };
    if (result.caminho_danfe) updateData.pdfUrl = result.caminho_danfe;
    if (result.mensagem_sefaz && newStatus === 'REJEITADA') updateData.errorMessage = result.mensagem_sefaz;
    if (newStatus === 'AUTORIZADA') updateData.emitidaEm = new Date();
    if (result.caminho_xml_nota_fiscal) {
      updateData.xmlContent = `<!-- XML disponivel em: ${result.caminho_xml_nota_fiscal} -->`;
    }

    return prisma.notaFiscal.update({ where: { id: notaFiscal.id }, data: updateData });
  } catch (err) {
    await prisma.notaFiscal.update({
      where: { id: notaFiscal.id },
      data: { status: 'REJEITADA', errorMessage: err instanceof Error ? err.message : 'Erro ao emitir NFSe' },
    });
    throw err;
  }
}

export async function getNotaFiscal(id: string) {
  return prisma.notaFiscal.findUnique({
    where: { id },
    include: {
      sale: {
        select: {
          id: true,
          number: true,
          total: true,
          client: { select: { id: true, name: true } },
        },
      },
    },
  });
}

export async function listNotasFiscais(tenantId: string, query: ListNotasFiscaisQuery) {
  const where: Record<string, unknown> = { tenantId };
  if (query.type) where.type = query.type;
  if (query.status) where.status = query.status;
  if (query.saleId) where.saleId = query.saleId;

  const [data, total] = await Promise.all([
    prisma.notaFiscal.findMany({
      where,
      include: {
        sale: {
          select: {
            id: true,
            number: true,
            total: true,
            client: { select: { id: true, name: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize,
    }),
    prisma.notaFiscal.count({ where }),
  ]);

  return { data, total, page: query.page, pageSize: query.pageSize };
}

export async function checkNotaStatus(id: string) {
  const nota = await prisma.notaFiscal.findUnique({ where: { id } });
  if (!nota) throw new Error('Nota fiscal nao encontrada');
  if (!nota.focusNfeId) throw new Error('Nota sem referencia Focus NFe');
  if (nota.status !== 'PROCESSANDO') return nota;

  const config = await prisma.configFiscal.findUnique({ where: { tenantId: nota.tenantId } });
  const ambiente = config?.ambiente ?? 'homologacao';

  const statusFn = nota.type === 'NFSE' ? getNFSeStatus : getNFeStatus;
  const result = await statusFn(nota.focusNfeId, ambiente);
  const newStatus = mapFocusStatus(result.status);

  const updateData: Record<string, unknown> = { status: newStatus };

  if (result.chave_nfe) updateData.chaveAcesso = result.chave_nfe;
  if (result.caminho_danfe) updateData.pdfUrl = result.caminho_danfe;
  if (result.mensagem_sefaz && newStatus === 'REJEITADA') updateData.errorMessage = result.mensagem_sefaz;
  if (newStatus === 'AUTORIZADA') updateData.emitidaEm = new Date();
  if (result.caminho_xml_nota_fiscal) {
    updateData.xmlContent = `<!-- XML disponivel em: ${result.caminho_xml_nota_fiscal} -->`;
  }

  return prisma.notaFiscal.update({ where: { id }, data: updateData });
}

export async function cancelarNota(id: string, motivo: string) {
  const nota = await prisma.notaFiscal.findUnique({ where: { id } });
  if (!nota) throw new Error('Nota fiscal nao encontrada');
  if (nota.status !== 'AUTORIZADA') throw new Error('Apenas notas autorizadas podem ser canceladas');
  if (!nota.focusNfeId) throw new Error('Nota sem referencia Focus NFe');

  const config = await prisma.configFiscal.findUnique({ where: { tenantId: nota.tenantId } });
  const ambiente = config?.ambiente ?? 'homologacao';

  const cancelFn = nota.type === 'NFSE' ? cancelNFSe : cancelNFe;
  await cancelFn(nota.focusNfeId, motivo, ambiente);

  return prisma.notaFiscal.update({
    where: { id },
    data: {
      status: 'CANCELADA',
      canceladaEm: new Date(),
      motivoCancelamento: motivo,
    },
  });
}

function buildNFePayload(
  venda: {
    items: unknown;
    total: number;
    subtotal: number;
    discount: number;
    client: { name: string; document?: string | null } | null;
  },
  config: { regimeTributario: string | null; serieNFe: number; inscricaoEstadual: string | null },
  tenant: { name: string; document: string | null; address: unknown; phone: string | null; email: string | null },
  numero: number,
) {
  const items = venda.items as VendaItem[];
  const regime = (config.regimeTributario ?? 'SIMPLES_NACIONAL') as RegimeTributario;
  const defaults = getRegimeDefaults(regime);

  const nfeItems = items.map((item, idx) => ({
    numero_item: String(idx + 1),
    codigo_produto: item.productId,
    descricao: item.name,
    quantidade_comercial: String(item.quantity),
    quantidade_tributavel: String(item.quantity),
    valor_unitario_comercial: (item.unitPrice / 100).toFixed(2),
    valor_unitario_tributavel: (item.unitPrice / 100).toFixed(2),
    valor_bruto: (item.total / 100).toFixed(2),
    unidade_comercial: 'UN',
    unidade_tributavel: 'UN',
    cfop: defaults.cfopVendaInterna,
    icms_situacao_tributaria: defaults.csosn ?? defaults.cstPadrao,
    icms_origem: '0',
    pis_situacao_tributaria: defaults.pisCofinsCst,
    cofins_situacao_tributaria: defaults.pisCofinsCst,
  }));

  return {
    natureza_operacao: 'VENDA DE MERCADORIA',
    forma_pagamento: '0',
    tipo_documento: '1',
    finalidade_emissao: '1',
    consumidor_final: venda.client?.document ? '0' : '1',
    presenca_comprador: '1',
    numero_nfe: String(numero),
    serie_nfe: String(config.serieNFe),
    cnpj_emitente: tenant.document ?? '',
    nome_emitente: tenant.name,
    inscricao_estadual_emitente: config.inscricaoEstadual ?? '',
    regime_tributario: regime === 'SIMPLES_NACIONAL' || regime === 'MEI' ? '1' : '3',
    nome_destinatario: venda.client?.name ?? 'CONSUMIDOR FINAL',
    cpf_destinatario: venda.client?.document ?? undefined,
    indicador_inscricao_estadual_destinatario: '9',
    items: nfeItems,
    valor_produtos: (venda.subtotal / 100).toFixed(2),
    valor_desconto: (venda.discount / 100).toFixed(2),
    valor_total: (venda.total / 100).toFixed(2),
    modalidade_frete: '9',
    informacoes_adicionais_contribuinte: 'Documento emitido por ME ou EPP optante pelo Simples Nacional',
  };
}

function buildNFSePayload(
  venda: {
    items: unknown;
    total: number;
    subtotal: number;
    discount: number;
    client: { name: string; document?: string | null; email?: string | null } | null;
  },
  config: { regimeTributario: string | null; serieNFSe: number; inscricaoMunicipal: string | null },
  tenant: { name: string; document: string | null; phone: string | null; email: string | null },
  numero: number,
) {
  const items = venda.items as VendaItem[];
  const totalServicos = items.reduce((sum, item) => sum + item.total, 0);

  return {
    data_emissao: new Date().toISOString(),
    natureza_operacao: '1',
    optante_simples_nacional: config.regimeTributario === 'SIMPLES_NACIONAL' || config.regimeTributario === 'MEI',
    prestador: {
      cnpj: tenant.document ?? '',
      inscricao_municipal: config.inscricaoMunicipal ?? '',
      razao_social: tenant.name,
      email: tenant.email ?? '',
      telefone: tenant.phone ?? '',
    },
    tomador: {
      cpf: venda.client?.document ?? undefined,
      razao_social: venda.client?.name ?? 'CONSUMIDOR FINAL',
      email: venda.client?.email ?? '',
    },
    servico: {
      aliquota: '2.00',
      discriminacao: items.map((item) => `${item.name} (${item.quantity}x)`).join('; '),
      iss_retido: false,
      codigo_tributario_municipio: '0105',
      valor_servicos: (totalServicos / 100).toFixed(2),
      valor_deducoes: (venda.discount / 100).toFixed(2),
      valor_liquido: (venda.total / 100).toFixed(2),
    },
    numero_nfse: String(numero),
    serie_nfse: String(config.serieNFSe),
  };
}
