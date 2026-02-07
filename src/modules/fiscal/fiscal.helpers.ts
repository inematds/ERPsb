export const REGIMES_TRIBUTARIOS = ['MEI', 'SIMPLES_NACIONAL', 'LUCRO_PRESUMIDO', 'LUCRO_REAL'] as const;
export type RegimeTributario = (typeof REGIMES_TRIBUTARIOS)[number];

export interface RegimeInfo {
  label: string;
  description: string;
}

export const REGIMES_INFO: Record<RegimeTributario, RegimeInfo> = {
  MEI: {
    label: 'MEI - Microempreendedor Individual',
    description: 'Faturamento ate R$ 81.000/ano. Isento da maioria dos impostos. Emite NFe com CSOSN 102.',
  },
  SIMPLES_NACIONAL: {
    label: 'Simples Nacional',
    description: 'Faturamento ate R$ 4,8 milhoes/ano. Impostos unificados em guia unica (DAS). Aliquota por faixa.',
  },
  LUCRO_PRESUMIDO: {
    label: 'Lucro Presumido',
    description: 'Faturamento ate R$ 78 milhoes/ano. Base de calculo presumida pela Receita. ICMS, PIS, COFINS separados.',
  },
  LUCRO_REAL: {
    label: 'Lucro Real',
    description: 'Obrigatorio acima de R$ 78 milhoes/ano. Impostos calculados sobre lucro real. Mais obrigacoes acessorias.',
  },
};

export interface RegimeDefaults {
  cstPadrao: string;
  csosn: string | null;
  cfopVendaInterna: string;
  cfopVendaInterestadual: string;
  cfopServico: string;
  pisCofinsCst: string;
}

export function getRegimeDefaults(regime: RegimeTributario): RegimeDefaults {
  switch (regime) {
    case 'MEI':
      return {
        cstPadrao: '41',
        csosn: '102',
        cfopVendaInterna: '5102',
        cfopVendaInterestadual: '6102',
        cfopServico: '5933',
        pisCofinsCst: '99',
      };
    case 'SIMPLES_NACIONAL':
      return {
        cstPadrao: '41',
        csosn: '101',
        cfopVendaInterna: '5102',
        cfopVendaInterestadual: '6102',
        cfopServico: '5933',
        pisCofinsCst: '99',
      };
    case 'LUCRO_PRESUMIDO':
      return {
        cstPadrao: '00',
        csosn: null,
        cfopVendaInterna: '5102',
        cfopVendaInterestadual: '6102',
        cfopServico: '5933',
        pisCofinsCst: '01',
      };
    case 'LUCRO_REAL':
      return {
        cstPadrao: '00',
        csosn: null,
        cfopVendaInterna: '5102',
        cfopVendaInterestadual: '6102',
        cfopServico: '5933',
        pisCofinsCst: '01',
      };
  }
}

export interface CfopInfo {
  code: string;
  description: string;
}

export const CFOP_TABLE: CfopInfo[] = [
  { code: '5102', description: 'Venda de mercadoria (dentro do estado)' },
  { code: '5405', description: 'Venda de mercadoria com ST (dentro do estado)' },
  { code: '5933', description: 'Prestacao de servico (dentro do estado)' },
  { code: '5949', description: 'Outra saida nao especificada (dentro do estado)' },
  { code: '6102', description: 'Venda de mercadoria (interestadual)' },
  { code: '6405', description: 'Venda de mercadoria com ST (interestadual)' },
  { code: '6933', description: 'Prestacao de servico (interestadual)' },
  { code: '6949', description: 'Outra saida nao especificada (interestadual)' },
];

export interface CstInfo {
  code: string;
  description: string;
}

export const CST_ICMS_TABLE: CstInfo[] = [
  { code: '00', description: 'Tributada integralmente' },
  { code: '10', description: 'Tributada com cobranca de ICMS por ST' },
  { code: '20', description: 'Com reducao de base de calculo' },
  { code: '40', description: 'Isenta' },
  { code: '41', description: 'Nao tributada' },
  { code: '60', description: 'ICMS cobrado anteriormente por ST' },
];

export const CSOSN_TABLE: CstInfo[] = [
  { code: '101', description: 'Tributada com permissao de credito' },
  { code: '102', description: 'Tributada sem permissao de credito' },
  { code: '103', description: 'Isencao do ICMS para faixa de receita bruta' },
  { code: '300', description: 'Imune' },
  { code: '400', description: 'Nao tributada pelo Simples Nacional' },
  { code: '500', description: 'ICMS cobrado anteriormente por ST' },
  { code: '900', description: 'Outros' },
];
