import { formatUnits } from 'viem';

export const USDC_DECIMALS = 6;

export type PolyPredictMarketTuple = readonly [
  string,
  string,
  string,
  string,
  string,
  bigint,
  number,
  number,
  bigint,
];

export type PolyPredictMarketRaw = {
  question: string;
  description: string;
  category: string;
  outcomeYes: string;
  outcomeNo: string;
  deadline: bigint;
  state: number;
  outcome: number;
  totalCollateral: bigint;
};

/** @deprecated Use PolyPredictMarketTuple */
export type MarketTuple = PolyPredictMarketTuple;

export function normalizeMarketResult(
  result: PolyPredictMarketTuple | PolyPredictMarketRaw,
): PolyPredictMarketRaw {
  if (Array.isArray(result)) {
    return {
      question: result[0],
      description: result[1],
      category: result[2],
      outcomeYes: result[3],
      outcomeNo: result[4],
      deadline: result[5],
      state: Number(result[6]),
      outcome: Number(result[7]),
      totalCollateral: result[8],
    };
  }

  const raw = result as PolyPredictMarketRaw;

  return {
    question: raw.question,
    description: raw.description,
    category: raw.category,
    outcomeYes: raw.outcomeYes,
    outcomeNo: raw.outcomeNo,
    deadline: raw.deadline,
    state: Number(raw.state),
    outcome: Number(raw.outcome),
    totalCollateral: raw.totalCollateral,
  };
}

export type OutcomeId = 0 | 1;

export type Market = {
  id: bigint;
  numericId: number;
  title: string;
  description: string;
  category: string;
  outcomeA: string;
  outcomeB: string;
  poolA: bigint;
  poolB: bigint;
  resolved: boolean;
  winningOutcome: OutcomeId;
  deadline: bigint;
};

export function toMarket(
  id: bigint,
  result: PolyPredictMarketTuple | PolyPredictMarketRaw,
): Market {
  const raw = normalizeMarketResult(result);
  const totalCollateral = raw.totalCollateral;
  const resolved = raw.state === 2;
  const contractOutcome = raw.outcome;

  return {
    id,
    numericId: Number(id),
    title: raw.question,
    description: raw.description,
    category: raw.category,
    outcomeA: raw.outcomeYes,
    outcomeB: raw.outcomeNo,
    poolA: totalCollateral,
    poolB: totalCollateral,
    resolved,
    winningOutcome: contractOutcome === 2 ? 1 : 0,
    deadline: raw.deadline,
  };
}

export function getTotalPool(market: Pick<Market, 'poolA' | 'poolB'>) {
  return market.poolA + market.poolB;
}

export function getPoolPercent(pool: bigint, total: bigint) {
  if (total === 0n) {
    return 0;
  }

  return Number((pool * 10000n) / total) / 100;
}

export function getOutcomeName(market: Market, outcome: OutcomeId) {
  return outcome === 0 ? market.outcomeA : market.outcomeB;
}

export function getOutcomePool(market: Market, outcome: OutcomeId) {
  return outcome === 0 ? market.poolA : market.poolB;
}

export function getMarketStatusLabel(market: Pick<Market, 'resolved'>) {
  return market.resolved ? '결과 확정' : '진행 중';
}

export function getWinningOutcomeName(market: Market) {
  if (!market.resolved) {
    return '결과 대기';
  }

  return getOutcomeName(market, market.winningOutcome);
}

export function formatUsdc(value: bigint | undefined) {
  if (value === undefined) {
    return '0 USDC';
  }

  const [whole, fraction = ''] = formatUnits(value, USDC_DECIMALS).split('.');
  const shortFraction = fraction.slice(0, 4).replace(/0+$/, '');

  return `${shortFraction ? `${whole}.${shortFraction}` : whole} USDC`;
}

/** @deprecated Use formatUsdc */
export function formatEth(value: bigint) {
  return formatUsdc(value);
}

export function uiOutcomeToContractOutcome(outcome: OutcomeId): 1 | 2 {
  return outcome === 0 ? 1 : 2;
}
