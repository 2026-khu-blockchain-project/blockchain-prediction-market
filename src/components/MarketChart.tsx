import { TrendingUp } from 'lucide-react';
import { cn, SurfaceCard } from './ui';

type MarketChartProps = {
  candidateAChance: number;
  candidateBChance: number;
  outcomeAName: string;
  outcomeBName: string;
};

export function MarketChart({
  candidateAChance,
  candidateBChance,
  outcomeAName,
  outcomeBName,
}: MarketChartProps) {
  return (
    <SurfaceCard className="overflow-hidden">
      <div className="flex flex-col gap-4 border-b border-slate-100 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
              <TrendingUp className="h-4 w-4" aria-hidden="true" />
            </div>
            <h2 className="text-lg font-black text-slate-950">확률 분포</h2>
          </div>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            현재 온체인 예치금 비율을 기준으로 계산한 시장 분포입니다.
          </p>
        </div>
      </div>

      <div className="p-6">
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-950 p-1">
          <div className="flex h-14 overflow-hidden rounded-[1.25rem] bg-slate-900">
            <div
              className="flex items-center justify-start bg-emerald-400 px-4 text-sm font-black text-emerald-950 transition-all duration-300"
              style={{ width: `${candidateAChance}%` }}
            >
              {candidateAChance >= 18 && `${candidateAChance.toFixed(1)}%`}
            </div>
            <div
              className="flex items-center justify-end bg-blue-400 px-4 text-sm font-black text-blue-950 transition-all duration-300"
              style={{ width: `${candidateBChance}%` }}
            >
              {candidateBChance >= 18 && `${candidateBChance.toFixed(1)}%`}
            </div>
          </div>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2">
          <LegendCard label={outcomeAName} percent={candidateAChance} tone="emerald" />
          <LegendCard label={outcomeBName} percent={candidateBChance} tone="blue" />
        </div>
      </div>
    </SurfaceCard>
  );
}

function LegendCard({
  label,
  percent,
  tone,
}: {
  label: string;
  percent: number;
  tone: 'emerald' | 'blue';
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-2">
          <span
            className={cn(
              'h-2.5 w-2.5 shrink-0 rounded-full',
              tone === 'emerald' ? 'bg-emerald-500' : 'bg-blue-500',
            )}
          />
          <p className="truncate text-sm font-bold text-slate-700">{label}</p>
        </div>
        <p className="text-lg font-black text-slate-950">{percent.toFixed(1)}%</p>
      </div>
    </div>
  );
}
