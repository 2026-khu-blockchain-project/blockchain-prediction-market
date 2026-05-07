import { type FormEvent, useEffect, useMemo, useState } from 'react';
import {
  BadgeCheck,
  Landmark,
  Loader2,
  PlusCircle,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  Wallet,
} from 'lucide-react';
import {
  useAccount,
  useReadContract,
  useReadContracts,
  useWaitForTransactionReceipt,
  useWriteContract,
} from 'wagmi';
import {
  predictionMarketAbi,
  predictionMarketAddress,
} from '../contracts/predictionMarket';
import {
  formatEth,
  getMarketStatusLabel,
  getTotalPool,
  getWinningOutcomeName,
  toMarket,
  type Market,
  type MarketTuple,
  type OutcomeId,
} from '../lib/market';
import {
  AlertMessage,
  buttonStyles,
  cn,
  EmptyState,
  fieldStyles,
  StatCard,
  StatusBadge,
  SurfaceCard,
} from './ui';

type MarketForm = {
  title: string;
  description: string;
  category: string;
  outcomeA: string;
  outcomeB: string;
};

const emptyForm: MarketForm = {
  title: '',
  description: '',
  category: '',
  outcomeA: '',
  outcomeB: '',
};

export function AdminPanel({
  contractAddress,
}: {
  contractAddress: NonNullable<typeof predictionMarketAddress>;
}) {
  const { address, isConnected } = useAccount();
  const [form, setForm] = useState<MarketForm>(emptyForm);
  const [resolveSelection, setResolveSelection] = useState<Record<number, OutcomeId>>({});
  const [formError, setFormError] = useState('');

  const ownerQuery = useReadContract({
    address: contractAddress,
    abi: predictionMarketAbi,
    functionName: 'owner',
  });
  const marketCountQuery = useReadContract({
    address: contractAddress,
    abi: predictionMarketAbi,
    functionName: 'marketCount',
  });

  const marketCount = marketCountQuery.data ?? 0n;
  const marketIds = Array.from({ length: Number(marketCount) }, (_, index) => BigInt(index));
  const marketsQuery = useReadContracts({
    allowFailure: false,
    contracts: marketIds.map((marketId) => ({
      address: contractAddress,
      abi: predictionMarketAbi,
      functionName: 'getMarket',
      args: [marketId],
    })),
    query: { enabled: marketIds.length > 0 },
  });

  const markets = useMemo(
    () =>
      ((marketsQuery.data as MarketTuple[] | undefined) ?? []).map((marketResult, index) =>
        toMarket(BigInt(index), marketResult),
      ),
    [marketsQuery.data],
  );

  const createWrite = useWriteContract();
  const resolveWrite = useWriteContract();
  const createReceipt = useWaitForTransactionReceipt({ hash: createWrite.data });
  const resolveReceipt = useWaitForTransactionReceipt({ hash: resolveWrite.data });

  const createBusy = createWrite.isPending || createReceipt.isLoading;
  const resolveBusy = resolveWrite.isPending || resolveReceipt.isLoading;
  const owner = ownerQuery.data?.toLowerCase();
  const currentAddress = address?.toLowerCase();
  const isOwner = Boolean(owner && currentAddress && owner === currentAddress);
  const unresolvedMarkets = markets.filter((market) => !market.resolved);
  const shortOwner = ownerQuery.data
    ? `${ownerQuery.data.slice(0, 6)}...${ownerQuery.data.slice(-4)}`
    : '-';

  function refetchMarkets() {
    void ownerQuery.refetch();
    void marketCountQuery.refetch();
    void marketsQuery.refetch();
  }

  useEffect(() => {
    if (createReceipt.isSuccess) {
      setForm(emptyForm);
      refetchMarkets();
    }
  }, [createReceipt.isSuccess]);

  useEffect(() => {
    if (resolveReceipt.isSuccess) {
      refetchMarkets();
    }
  }, [resolveReceipt.isSuccess]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError('');

    const title = form.title.trim();
    const outcomeA = form.outcomeA.trim();
    const outcomeB = form.outcomeB.trim();

    if (!title || !outcomeA || !outcomeB) {
      setFormError('제목, 후보 A, 후보 B는 필수 입력값입니다.');
      return;
    }

    createWrite.writeContract({
      address: contractAddress,
      abi: predictionMarketAbi,
      functionName: 'createMarket',
      args: [
        title,
        form.description.trim(),
        form.category.trim(),
        outcomeA,
        outcomeB,
      ],
    });
  }

  function handleResolveMarket(market: Market) {
    const selectedOutcome = resolveSelection[market.numericId] ?? 0;

    resolveWrite.writeContract({
      address: contractAddress,
      abi: predictionMarketAbi,
      functionName: 'resolveMarket',
      args: [market.id, selectedOutcome],
    });
  }

  if (!isConnected) {
    return (
      <EmptyState
        icon={<Wallet className="h-7 w-7" aria-hidden="true" />}
        title="지갑 연결이 필요합니다."
        description="관리자 기능을 사용하려면 컨트랙트 owner 지갑을 연결해주세요."
      />
    );
  }

  if (ownerQuery.isPending) {
    return (
      <SurfaceCard className="p-6">
        <div className="flex items-center gap-3 text-sm font-bold text-slate-600">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          관리자 계정을 확인하는 중입니다...
        </div>
      </SurfaceCard>
    );
  }

  if (!isOwner) {
    return (
      <SurfaceCard className="overflow-hidden border-rose-200">
        <div className="bg-rose-50 p-6">
          <div className="flex gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-rose-600 shadow-sm">
              <ShieldAlert className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-950">
                현재 연결된 지갑은 관리자 계정이 아닙니다.
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                시장 생성과 결과 확정은 컨트랙트 owner 계정만 실행할 수 있습니다.
              </p>
              <p className="mt-4 text-xs font-bold text-rose-700">owner: {shortOwner}</p>
            </div>
          </div>
        </div>
      </SurfaceCard>
    );
  }

  return (
    <div className="space-y-6">
      <SurfaceCard className="overflow-hidden">
        <div className="bg-slate-950 p-6 text-white">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <StatusBadge tone="admin">관리자 인증됨</StatusBadge>
              <h2 className="mt-4 text-2xl font-black">운영 콘솔</h2>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                온체인 시장 생성과 결과 확정을 이 화면에서 관리합니다.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 md:w-96">
              <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-300">owner</p>
                <p className="mt-2 text-sm font-black text-white">{shortOwner}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-300">시장 수</p>
                <p className="mt-2 text-sm font-black text-white">{marketCount.toString()}개</p>
              </div>
            </div>
          </div>
        </div>
      </SurfaceCard>

      <SurfaceCard className="overflow-hidden">
        <div className="border-b border-slate-100 p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
              <PlusCircle className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-950">새 예측시장 생성</h2>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                입력한 내용은 스마트 컨트랙트의 createMarket()을 통해 등록됩니다.
              </p>
            </div>
          </div>
        </div>

        <form className="grid gap-5 p-6 md:grid-cols-2" onSubmit={handleSubmit}>
          <TextInput
            label="제목"
            required
            value={form.title}
            onChange={(value) => setForm((prev) => ({ ...prev, title: value }))}
          />
          <TextInput
            label="카테고리"
            value={form.category}
            onChange={(value) => setForm((prev) => ({ ...prev, category: value }))}
          />
          <TextArea
            className="md:col-span-2"
            label="설명"
            value={form.description}
            onChange={(value) => setForm((prev) => ({ ...prev, description: value }))}
          />
          <TextInput
            label="후보 A"
            required
            value={form.outcomeA}
            onChange={(value) => setForm((prev) => ({ ...prev, outcomeA: value }))}
          />
          <TextInput
            label="후보 B"
            required
            value={form.outcomeB}
            onChange={(value) => setForm((prev) => ({ ...prev, outcomeB: value }))}
          />

          <div className="space-y-3 md:col-span-2">
            {formError && <AlertMessage tone="error">{formError}</AlertMessage>}
            {createWrite.error && (
              <AlertMessage tone="error">
                시장 생성 트랜잭션 요청에 실패했습니다. 지갑 승인과 네트워크를 확인해주세요.
              </AlertMessage>
            )}
            {createReceipt.isSuccess && (
              <AlertMessage tone="success">
                <span className="inline-flex items-center gap-2">
                  <BadgeCheck className="h-4 w-4" aria-hidden="true" />
                  시장 생성이 완료되었습니다.
                </span>
              </AlertMessage>
            )}
          </div>

          <div className="md:col-span-2">
            <button
              className={cn(buttonStyles('primary'), 'w-full md:w-fit')}
              disabled={createBusy}
              type="submit"
            >
              {createBusy ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <BadgeCheck className="h-4 w-4" aria-hidden="true" />
              )}
              {createBusy ? '시장 생성 중...' : '시장 생성하기'}
            </button>
          </div>
        </form>
      </SurfaceCard>

      <SurfaceCard className="overflow-hidden">
        <div className="flex flex-col gap-4 border-b border-slate-100 p-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
              <ShieldCheck className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-950">시장 결과 확정</h2>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                진행 중인 시장의 승리 결과를 선택해 resolveMarket()으로 확정합니다.
              </p>
            </div>
          </div>
          <button className={buttonStyles('secondary')} type="button" onClick={refetchMarkets}>
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            새로고침
          </button>
        </div>

        <div className="space-y-4 p-6">
          {resolveWrite.error && (
            <AlertMessage tone="error">
              결과 확정 트랜잭션 요청에 실패했습니다. 지갑 승인과 네트워크를 확인해주세요.
            </AlertMessage>
          )}
          {resolveReceipt.isSuccess && (
            <AlertMessage tone="success">결과 확정이 완료되었습니다.</AlertMessage>
          )}

          {marketCount === 0n && (
            <EmptyState
              icon={<Landmark className="h-7 w-7" aria-hidden="true" />}
              title="아직 생성된 시장이 없습니다."
              description="새 예측시장을 생성하면 이 영역에서 결과 확정 작업을 진행할 수 있습니다."
            />
          )}

          {marketCount > 0n && unresolvedMarkets.length === 0 && (
            <AlertMessage tone="info">
              진행 중인 시장이 없습니다. 결과가 확정된 시장은 다시 확정할 수 없습니다.
            </AlertMessage>
          )}

          <div className="grid gap-4">
            {markets.map((market) => (
              <article
                className="rounded-3xl border border-slate-200 bg-slate-50/70 p-5"
                key={market.numericId}
              >
                <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-center">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge tone="neutral">#{market.numericId}</StatusBadge>
                      <StatusBadge tone="neutral">{market.category || '카테고리 없음'}</StatusBadge>
                      <StatusBadge tone={market.resolved ? 'resolved' : 'open'}>
                        {getMarketStatusLabel(market)}
                      </StatusBadge>
                    </div>
                    <h3 className="mt-4 text-lg font-black text-slate-950">{market.title}</h3>
                    <div className="mt-4 grid gap-3 sm:grid-cols-3">
                      <StatCard label="총 예치금" value={formatEth(getTotalPool(market))} />
                      <StatCard label="후보 A" value={market.outcomeA} />
                      <StatCard label="후보 B" value={market.outcomeB} />
                    </div>
                  </div>

                  {market.resolved ? (
                    <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm font-bold text-blue-800">
                      승리 결과: {getWinningOutcomeName(market)}
                    </div>
                  ) : (
                    <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4">
                      <label className="block">
                        <span className="text-sm font-bold text-slate-700">승리 결과</span>
                        <select
                          className={cn(fieldStyles, 'mt-2')}
                          value={resolveSelection[market.numericId] ?? 0}
                          onChange={(event) =>
                            setResolveSelection((prev) => ({
                              ...prev,
                              [market.numericId]: Number(event.target.value) as OutcomeId,
                            }))
                          }
                        >
                          <option value={0}>{market.outcomeA}</option>
                          <option value={1}>{market.outcomeB}</option>
                        </select>
                      </label>
                      <button
                        className={cn(buttonStyles('primary'), 'w-full')}
                        disabled={resolveBusy}
                        type="button"
                        onClick={() => handleResolveMarket(market)}
                      >
                        {resolveBusy ? (
                          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                        ) : (
                          <BadgeCheck className="h-4 w-4" aria-hidden="true" />
                        )}
                        {resolveBusy ? '결과 확정 중...' : '결과 확정하기'}
                      </button>
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        </div>
      </SurfaceCard>
    </div>
  );
}

function TextInput({
  label,
  required = false,
  value,
  onChange,
}: {
  label: string;
  required?: boolean;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="text-sm font-bold text-slate-700">
        {label}
        {required && <span className="text-rose-600"> *</span>}
      </span>
      <input
        className={cn(fieldStyles, 'mt-2')}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

function TextArea({
  className,
  label,
  value,
  onChange,
}: {
  className?: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className={cn('block', className)}>
      <span className="text-sm font-bold text-slate-700">{label}</span>
      <textarea
        className={cn(fieldStyles, 'mt-2 min-h-28 resize-y')}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}
