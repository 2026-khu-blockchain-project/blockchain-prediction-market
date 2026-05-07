import { formatEther } from 'viem';

export type MarketTuple = readonly [
  string,
  string,
  string,
  string,
  string,
  bigint,
  bigint,
  boolean,
  number,
];

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
};

export function toMarket(id: bigint, result: MarketTuple): Market {
  return {
    id,
    numericId: Number(id),
    title: result[0],
    description: result[1],
    category: result[2],
    outcomeA: result[3],
    outcomeB: result[4],
    poolA: result[5],
    poolB: result[6],
    resolved: result[7],
    winningOutcome: Number(result[8]) === 1 ? 1 : 0,
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

export function formatEth(value: bigint) {
  const [whole, fraction = ''] = formatEther(value).split('.');
  const shortFraction = fraction.slice(0, 4).replace(/0+$/, '');

  return `${shortFraction ? `${whole}.${shortFraction}` : whole} ETH`;
}
