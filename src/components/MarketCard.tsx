import { ArrowRight, Landmark } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  formatEth,
  getMarketStatusLabel,
  getPoolPercent,
  getTotalPool,
  type Market,
} from '../lib/market';
import { cn, StatusBadge } from './ui';

export function MarketCard({ market }: { market: Market }) {
  const totalPool = getTotalPool(market);
  const outcomeAPercent = getPoolPercent(market.poolA, totalPool);
  const outcomeBPercent = getPoolPercent(market.poolB, totalPool);

  return (
    <article className="group flex min-h-[25rem] flex-col overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm shadow-slate-950/[0.03] transition duration-200 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-xl hover:shadow-slate-950/[0.07]">
      <div className="flex items-start justify-between gap-3 border-b border-slate-100 p-5">
        <StatusBadge tone="neutral">{market.category || '카테고리 없음'}</StatusBadge>
        <StatusBadge tone={market.resolved ? 'resolved' : 'open'}>
          {getMarketStatusLabel(market)}
        </StatusBadge>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-600">
          <Landmark className="h-5 w-5" aria-hidden="true" />
        </div>
        <h2 className="mt-4 text-xl font-black leading-7 tracking-tight text-slate-950">
          {market.title}
        </h2>
        <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">
          {market.description || '설명이 등록되지 않은 예측시장입니다.'}
        </p>

        <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">총 예치금</p>
          <p className="mt-1 text-2xl font-black text-slate-950">{formatEth(totalPool)}</p>
        </div>

        <div className="mt-5 space-y-4">
          <OutcomeBar label={market.outcomeA} percent={outcomeAPercent} tone="emerald" />
          <OutcomeBar label={market.outcomeB} percent={outcomeBPercent} tone="blue" />
        </div>

        <Link
          className="mt-auto inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-bold text-white transition duration-150 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:ring-offset-2"
          to={`/markets/${market.numericId}`}
        >
          시장 보기
          <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}

function OutcomeBar({
  label,
  percent,
  tone,
}: {
  label: string;
  percent: number;
  tone: 'emerald' | 'blue';
}) {
  return (
    <div>
      <div className="flex items-center justify-between gap-4 text-sm">
        <span className="truncate font-bold text-slate-700">{label}</span>
        <span className="font-black text-slate-950">{percent.toFixed(1)}%</span>
      </div>
      <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-slate-100">
        <div
          className={cn('h-full rounded-full', tone === 'emerald' ? 'bg-emerald-500' : 'bg-blue-500')}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
