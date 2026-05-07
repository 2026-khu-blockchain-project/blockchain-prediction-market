import { useMemo, useState } from 'react';
import { ArrowLeft, CheckCircle2, Coins, Landmark, MousePointer2 } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { useReadContract } from 'wagmi';
import { BettingPanel } from '../components/BettingPanel';
import { ContractConfigError } from '../components/ContractConfigError';
import { LoadingCard } from '../components/LoadingCard';
import { MarketChart } from '../components/MarketChart';
import { ResultPanel } from '../components/ResultPanel';
import {
  AlertMessage,
  buttonStyles,
  cn,
  EmptyState,
  InfoRow,
  PageShell,
  StatCard,
  StatusBadge,
  SurfaceCard,
} from '../components/ui';
import {
  isMarketAddressConfigured,
  predictionMarketAbi,
  predictionMarketAddress,
} from '../contracts/predictionMarket';
import {
  formatEth,
  getMarketStatusLabel,
  getOutcomeName,
  getOutcomePool,
  getPoolPercent,
  getTotalPool,
  getWinningOutcomeName,
  toMarket,
  type Market,
  type MarketTuple,
  type OutcomeId,
} from '../lib/market';

export function MarketDetailPage() {
  if (!isMarketAddressConfigured || !predictionMarketAddress) {
    return <ContractConfigError />;
  }

  return <MarketDetailContent contractAddress={predictionMarketAddress} />;
}

function MarketDetailContent({
  contractAddress,
}: {
  contractAddress: NonNullable<typeof predictionMarketAddress>;
}) {
  const params = useParams();
  const parsedMarketId = parseMarketId(params.marketId);
  const [selectedOutcome, setSelectedOutcome] = useState<OutcomeId | undefined>();

  const marketQuery = useReadContract({
    address: contractAddress,
    abi: predictionMarketAbi,
    functionName: 'getMarket',
    args: parsedMarketId !== undefined ? [parsedMarketId] : undefined,
    query: { enabled: parsedMarketId !== undefined },
  });

  const market = useMemo(() => {
    if (parsedMarketId === undefined || !marketQuery.data) {
      return undefined;
    }

    return toMarket(parsedMarketId, marketQuery.data as MarketTuple);
  }, [marketQuery.data, parsedMarketId]);

  if (parsedMarketId === undefined || marketQuery.isError) {
    return <NotFoundMarket />;
  }

  if (marketQuery.isPending || !market) {
    return (
      <PageShell>
        <LoadingCard />
      </PageShell>
    );
  }

  return (
    <PageShell>
      <MarketDetailLayout
        market={market}
        onRefetch={() => void marketQuery.refetch()}
        selectedOutcome={selectedOutcome}
        setSelectedOutcome={setSelectedOutcome}
      />
    </PageShell>
  );
}

function MarketDetailLayout({
  market,
  selectedOutcome,
  setSelectedOutcome,
  onRefetch,
}: {
  market: Market;
  selectedOutcome?: OutcomeId;
  setSelectedOutcome: (outcome: OutcomeId) => void;
  onRefetch: () => void;
}) {
  const totalPool = getTotalPool(market);
  const outcomeAPercent = getPoolPercent(market.poolA, totalPool);
  const outcomeBPercent = getPoolPercent(market.poolB, totalPool);
  const selectedOutcomeName =
    selectedOutcome === undefined ? undefined : getOutcomeName(market, selectedOutcome);
  const selectedOutcomePool =
    selectedOutcome === undefined ? 0n : getOutcomePool(market, selectedOutcome);

  const outcomes = [
    {
      id: 0 as const,
      name: market.outcomeA,
      pool: market.poolA,
      percent: outcomeAPercent,
    },
    {
      id: 1 as const,
      name: market.outcomeB,
      pool: market.poolB,
      percent: outcomeBPercent,
    },
  ];

  return (
    <div className="space-y-6">
      <Link
        className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 transition hover:text-slate-950"
        to="/markets"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        시장 목록으로 돌아가기
      </Link>

      <div className="gap-6 space-y-6 lg:grid lg:grid-cols-[minmax(0,1fr)_390px] lg:items-start lg:space-y-0">
      <div className="min-w-0 space-y-6">
        <SurfaceCard className="overflow-hidden">
          <div className="border-b border-slate-100 bg-gradient-to-br from-white via-white to-slate-50 p-6 md:p-8">
            <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
              <div className="min-w-0">
                <div className="mb-4 flex flex-wrap items-center gap-2">
                  <StatusBadge tone="neutral">{market.category || '카테고리 없음'}</StatusBadge>
                  <StatusBadge tone={market.resolved ? 'resolved' : 'open'}>
                    {getMarketStatusLabel(market)}
                  </StatusBadge>
                  <StatusBadge tone="neutral">시장 #{market.numericId}</StatusBadge>
                </div>
                <h1 className="max-w-4xl text-3xl font-black leading-tight tracking-tight text-slate-950 md:text-5xl">
                  {market.title}
                </h1>
                <p className="mt-4 max-w-3xl text-base leading-8 text-slate-600">
                  {market.description || '설명이 등록되지 않은 예측시장입니다.'}
                </p>
              </div>

              <div className="grid shrink-0 grid-cols-2 gap-3 md:w-80">
                <StatCard
                  icon={<Coins className="h-4 w-4" aria-hidden="true" />}
                  label="총 예치금"
                  value={formatEth(totalPool)}
                />
                <StatCard
                  icon={<Landmark className="h-4 w-4" aria-hidden="true" />}
                  label="상태"
                  value={getMarketStatusLabel(market)}
                />
              </div>
            </div>
          </div>

          <div className="grid gap-0 md:grid-cols-3">
            <InfoRow label="후보 A" value={market.outcomeA} />
            <InfoRow label="후보 B" value={market.outcomeB} />
            <InfoRow label="승리 결과" value={getWinningOutcomeName(market)} />
          </div>
        </SurfaceCard>

        <MarketChart
          candidateAChance={outcomeAPercent}
          candidateBChance={outcomeBPercent}
          outcomeAName={market.outcomeA}
          outcomeBName={market.outcomeB}
        />

        <SurfaceCard className="overflow-hidden">
          <div className="flex flex-col gap-3 border-b border-slate-100 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-black text-slate-950">결과 선택</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                참여할 결과를 선택하면 오른쪽 거래 패널에서 베팅을 진행할 수 있습니다.
              </p>
            </div>
            {selectedOutcomeName && (
              <StatusBadge tone="success">
                <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                {selectedOutcomeName} 선택됨
              </StatusBadge>
            )}
          </div>

          {market.resolved && (
            <div className="px-6 pt-6">
              <AlertMessage tone="info">
                결과가 확정된 시장입니다. 추가 베팅 대신 보상 청구 가능 여부를 확인해주세요.
              </AlertMessage>
            </div>
          )}

          <div className="grid gap-4 p-6 md:grid-cols-2">
            {outcomes.map((outcome) => (
              <OutcomeCard
                active={selectedOutcome === outcome.id}
                disabled={market.resolved}
                key={outcome.id}
                name={outcome.name}
                percent={outcome.percent}
                pool={formatEth(outcome.pool)}
                onSelect={() => setSelectedOutcome(outcome.id)}
              />
            ))}
          </div>
        </SurfaceCard>
      </div>

      <div className="self-start lg:sticky lg:top-24">
        {market.resolved ? (
          <ResultPanel
            marketId={market.id}
            winningOutcome={market.winningOutcome}
            winningOutcomeName={getWinningOutcomeName(market)}
            onTransactionSettled={onRefetch}
          />
        ) : (
          <BettingPanel
            disabled={market.resolved}
            marketId={market.id}
            selectedOutcome={selectedOutcome}
            selectedOutcomeName={selectedOutcomeName}
            selectedOutcomePool={selectedOutcomePool}
            totalPool={totalPool}
            onTransactionSettled={onRefetch}
          />
        )}
      </div>
      </div>
    </div>
  );
}

function OutcomeCard({
  active,
  disabled,
  name,
  percent,
  pool,
  onSelect,
}: {
  active: boolean;
  disabled: boolean;
  name: string;
  percent: number;
  pool: string;
  onSelect: () => void;
}) {
  return (
    <button
      className={cn(
        'group rounded-3xl border p-5 text-left shadow-sm transition duration-200 focus:outline-none focus:ring-4 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:opacity-70',
        active
          ? 'border-emerald-300 bg-emerald-50 shadow-emerald-950/[0.04]'
          : 'border-slate-200 bg-white hover:-translate-y-1 hover:border-emerald-200 hover:shadow-xl hover:shadow-slate-950/[0.06]',
      )}
      disabled={disabled}
      type="button"
      onClick={onSelect}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-600 transition group-hover:bg-emerald-100 group-hover:text-emerald-700">
            <MousePointer2 className="h-5 w-5" aria-hidden="true" />
          </div>
          <h3 className="mt-4 truncate text-xl font-black text-slate-950">{name}</h3>
          <p className="mt-1 text-sm font-semibold text-slate-500">예치금 {pool}</p>
        </div>
        <span className="rounded-2xl bg-slate-950 px-3 py-1.5 text-sm font-black text-white">
          {percent.toFixed(1)}%
        </span>
      </div>

      <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-100">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-300',
            active ? 'bg-emerald-500' : 'bg-blue-500',
          )}
          style={{ width: `${percent}%` }}
        />
      </div>

      <span className={cn('mt-5 flex w-full', buttonStyles(active ? 'primary' : 'secondary'))}>
        {disabled ? '베팅 종료' : active ? '선택됨' : '베팅하기'}
      </span>
    </button>
  );
}

function NotFoundMarket() {
  return (
    <PageShell className="max-w-3xl">
      <EmptyState
        icon={<Landmark className="h-7 w-7" aria-hidden="true" />}
        title="존재하지 않는 시장입니다."
        description="요청한 시장을 찾을 수 없습니다. 시장 목록에서 현재 등록된 예측시장을 확인해주세요."
        action={
          <Link className={buttonStyles('primary')} to="/markets">
            시장 둘러보기
          </Link>
        }
      />
    </PageShell>
  );
}

function parseMarketId(rawMarketId?: string) {
  if (!rawMarketId || !/^\d+$/.test(rawMarketId)) {
    return undefined;
  }

  return BigInt(rawMarketId);
}
