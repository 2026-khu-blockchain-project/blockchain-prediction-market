import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { waitForTransactionReceipt } from '@wagmi/core';
import { Loader2, Waves } from 'lucide-react';
import { parseUnits } from 'viem';
import {
  useAccount,
  useConfig,
  useReadContract,
  useWriteContract,
} from 'wagmi';
import { mockUsdcAbi } from '../contracts/mockUsdc';
import {
  isPoolMarketConfigured,
  poolBinaryMarketAbi,
  poolMarketAddress,
  usdcAddress,
} from '../contracts/poolBinaryMarket';
import { isDemoOnly } from '../config/env';
import { usePoolMarketDemo } from '../hooks/usePoolMarketDemo';
import { USDC_DECIMALS, formatUsdc } from '../lib/market';
import { readContract } from 'wagmi/actions';
import {
  AlertMessage,
  buttonStyles,
  cn,
  fieldStyles,
  PageShell,
  SectionHeader,
  StatusBadge,
  SurfaceCard,
} from '../components/ui';

const POOL_QUESTION =
  '바이에른 뮌헨이 2026 UEFA 챔피언스리그에서 우승할까? (풀 배팅 · 최대 10명)';

function PoolBar({ yes, no }: { yes: bigint; no: bigint }) {
  const total = yes + no;
  const yesPct = total === 0n ? 50 : Number((yes * 100n) / total);
  const noPct = 100 - yesPct;

  return (
    <div className="mt-4">
      <div className="flex h-4 overflow-hidden rounded-full bg-slate-100">
        <div className="bg-emerald-500 transition-all" style={{ width: `${yesPct}%` }} />
        <div className="bg-blue-500 transition-all" style={{ width: `${noPct}%` }} />
      </div>
      <div className="mt-2 flex justify-between text-xs font-bold text-slate-600">
        <span>YES {yesPct.toFixed(1)}%</span>
        <span>NO {noPct.toFixed(1)}%</span>
      </div>
    </div>
  );
}

export function PoolMarketPage() {
  const [mode, setMode] = useState<'chain' | 'demo'>(
    isDemoOnly ? 'demo' : isPoolMarketConfigured ? 'chain' : 'demo',
  );
  const activeMode = isDemoOnly ? 'demo' : mode;

  return (
    <PageShell>
      <SectionHeader
        eyebrow="Pool Market"
        title="풀 배팅 마켓"
        description="YES/NO 한쪽만 배팅 · Pot 비율로 확률·배당 결정 (패리뮤추얼). proj PoolBinaryMarket과 동일 구조입니다."
        action={
          <Link className={buttonStyles('secondary')} to="/markets">
            CTF 시장 목록
          </Link>
        }
      />

      {!isDemoOnly && (
        <div className="mt-6 inline-flex rounded-full bg-slate-100 p-1">
          <button
            className={cn(
              'rounded-full px-4 py-2 text-sm font-bold transition',
              activeMode === 'chain' ? 'bg-slate-950 text-white' : 'text-slate-600',
            )}
            disabled={!isPoolMarketConfigured}
            type="button"
            onClick={() => setMode('chain')}
          >
            지갑 연결
          </button>
          <button
            className={cn(
              'rounded-full px-4 py-2 text-sm font-bold transition',
              activeMode === 'demo' ? 'bg-slate-950 text-white' : 'text-slate-600',
            )}
            type="button"
            onClick={() => setMode('demo')}
          >
            연습 모드
          </button>
        </div>
      )}

      {activeMode === 'demo' ? <PoolDemoPanel /> : <PoolChainPanel />}
    </PageShell>
  );
}

function PoolDemoPanel() {
  const demo = usePoolMarketDemo();
  const [betAmt, setBetAmt] = useState('50');
  const yesPct = Number(demo.impliedYesBps) / 100;

  return (
    <div className="mt-8 space-y-6">
      <SurfaceCard className="p-6">
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge tone="admin">연습</StatusBadge>
          <StatusBadge tone={demo.resolved ? 'resolved' : 'open'}>
            {demo.resolved ? '정산 완료' : '진행 중'}
          </StatusBadge>
        </div>
        <h2 className="mt-4 text-2xl font-black text-slate-950">{POOL_QUESTION}</h2>
        <PoolBar yes={demo.totalYes} no={demo.totalNo} />
        <dl className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 text-sm">
          <Stat label="Pot YES / NO" value={`${demo.formatUsdc(demo.totalYes)} / ${demo.formatUsdc(demo.totalNo)}`} />
          <Stat label="내재 확률 (YES)" value={`${yesPct.toFixed(1)}%`} />
          <Stat
            label="인원 비율 (YES)"
            value={`${(Number(demo.impliedYesByParticipantsBps) / 100).toFixed(1)}% (${demo.sideParticipants.yesOnly} vs ${demo.sideParticipants.noOnly})`}
          />
        </dl>
      </SurfaceCard>

      <SurfaceCard className="p-6">
        <h3 className="font-black text-slate-950">슬롯 #{demo.activeIdx + 1} (최대 {demo.MAX_USERS}명)</h3>
        <div className="mt-4 flex flex-wrap gap-2">
          {Array.from({ length: demo.MAX_USERS }, (_, i) => (
            <button
              key={i}
              className={cn(
                buttonStyles('secondary'),
                demo.activeIdx === i && 'ring-2 ring-emerald-400',
              )}
              type="button"
              onClick={() => demo.setActiveIdx(i)}
            >
              유저 {i + 1}
            </button>
          ))}
          <button
            className={cn(buttonStyles('secondary'), demo.role === 'owner' ? 'ring-2 ring-amber-300' : '')}
            type="button"
            onClick={() => demo.setRole('owner')}
          >
            관리자
          </button>
          <button className={buttonStyles('secondary')} type="button" onClick={() => demo.setRole('user')}>
            일반
          </button>
        </div>

        <label className="mt-4 block">
          <span className="text-sm font-bold text-slate-700">배팅 금액 (USDC)</span>
          <input
            className={cn(fieldStyles, 'mt-2')}
            value={betAmt}
            onChange={(e) => setBetAmt(e.target.value)}
          />
        </label>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            className={cn(buttonStyles('primary'), 'bg-emerald-600')}
            disabled={demo.busy || demo.resolved}
            type="button"
            onClick={() => void demo.placeBet(true, betAmt)}
          >
            YES 배팅
          </button>
          <button
            className={cn(buttonStyles('primary'), 'bg-blue-600')}
            disabled={demo.busy || demo.resolved}
            type="button"
            onClick={() => void demo.placeBet(false, betAmt)}
          >
            NO 배팅
          </button>
          <button
            className={buttonStyles('secondary')}
            disabled={demo.busy || demo.role !== 'owner'}
            type="button"
            onClick={() => void demo.resolveDemo(true)}
          >
            YES 승리 정산
          </button>
          <button
            className={buttonStyles('secondary')}
            disabled={demo.busy || demo.role !== 'owner'}
            type="button"
            onClick={() => void demo.resolveDemo(false)}
          >
            NO 승리 정산
          </button>
          <button
            className={buttonStyles('secondary')}
            disabled={demo.busy || !demo.resolved}
            type="button"
            onClick={() => void demo.claimForActive()}
          >
            보상 청구
          </button>
          <button className={buttonStyles('secondary')} type="button" onClick={demo.reset}>
            초기화
          </button>
        </div>
      </SurfaceCard>

      {demo.error && <AlertMessage tone="error">{demo.error}</AlertMessage>}
    </div>
  );
}

function PoolChainPanel() {
  const { address, isConnected } = useAccount();
  const config = useConfig();
  const [betAmt, setBetAmt] = useState('50');
  const [approveAmt, setApproveAmt] = useState('500');
  const [side, setSide] = useState<'yes' | 'no'>('yes');
  const { writeContractAsync, isPending, error } = useWriteContract();

  const enabled = Boolean(poolMarketAddress && usdcAddress);

  const totalYes = useReadContract({
    address: poolMarketAddress,
    abi: poolBinaryMarketAbi,
    functionName: 'totalYes',
    query: { enabled },
  });
  const totalNo = useReadContract({
    address: poolMarketAddress,
    abi: poolBinaryMarketAbi,
    functionName: 'totalNo',
    query: { enabled },
  });
  const impliedBps = useReadContract({
    address: poolMarketAddress,
    abi: poolBinaryMarketAbi,
    functionName: 'impliedYesBps',
    query: { enabled },
  });
  const resolved = useReadContract({
    address: poolMarketAddress,
    abi: poolBinaryMarketAbi,
    functionName: 'resolved',
    query: { enabled },
  });
  const myYes = useReadContract({
    address: poolMarketAddress,
    abi: poolBinaryMarketAbi,
    functionName: 'yesOf',
    args: address ? [address] : undefined,
    query: { enabled: enabled && Boolean(address) },
  });
  const myNo = useReadContract({
    address: poolMarketAddress,
    abi: poolBinaryMarketAbi,
    functionName: 'noOf',
    args: address ? [address] : undefined,
    query: { enabled: enabled && Boolean(address) },
  });
  const owner = useReadContract({
    address: poolMarketAddress,
    abi: poolBinaryMarketAbi,
    functionName: 'owner',
    query: { enabled },
  });

  const ty = (totalYes.data as bigint | undefined) ?? 0n;
  const tn = (totalNo.data as bigint | undefined) ?? 0n;
  const isOwner =
    address && owner.data
      ? address.toLowerCase() === String(owner.data).toLowerCase()
      : false;

  const yesPct = useMemo(() => {
    const bps = (impliedBps.data as bigint | undefined) ?? 5000n;
    return Number(bps) / 100;
  }, [impliedBps.data]);

  async function runApproveAndBet() {
    if (!poolMarketAddress || !usdcAddress) return;
    const amount = parseUnits(betAmt || '0', USDC_DECIMALS);
    const approveAmount = parseUnits(approveAmt || '0', USDC_DECIMALS);

    const current = (await readContract(config, {
      address: usdcAddress,
      abi: mockUsdcAbi,
      functionName: 'allowance',
      args: [address!, poolMarketAddress],
    })) as bigint;

    if (current < amount) {
      const ah = await writeContractAsync({
        address: usdcAddress,
        abi: mockUsdcAbi,
        functionName: 'approve',
        args: [poolMarketAddress, approveAmount > amount ? approveAmount : amount],
      });
      await waitForTransactionReceipt(config, { hash: ah });
    }

    const bh = await writeContractAsync({
      address: poolMarketAddress,
      abi: poolBinaryMarketAbi,
      functionName: 'placeBet',
      args: [side === 'yes', amount],
    });
    await waitForTransactionReceipt(config, { hash: bh });
    void totalYes.refetch();
    void totalNo.refetch();
    void myYes.refetch();
    void myNo.refetch();
  }

  async function runResolve(yesWins: boolean) {
    if (!poolMarketAddress) return;
    const h = await writeContractAsync({
      address: poolMarketAddress,
      abi: poolBinaryMarketAbi,
      functionName: 'resolve',
      args: [yesWins ? 1 : 2],
    });
    await waitForTransactionReceipt(config, { hash: h });
    void resolved.refetch();
  }

  async function runClaim() {
    if (!poolMarketAddress) return;
    const h = await writeContractAsync({
      address: poolMarketAddress,
      abi: poolBinaryMarketAbi,
      functionName: 'claim',
    });
    await waitForTransactionReceipt(config, { hash: h });
    void myYes.refetch();
    void myNo.refetch();
  }

  if (!isPoolMarketConfigured) {
    return (
      <div className="mt-8">
        <AlertMessage tone="warning">
          VITE_POOL_MARKET_ADDRESS를 설정하고 deploy:local을 실행하세요.
        </AlertMessage>
      </div>
    );
  }

  return (
    <div className="mt-8 space-y-6">
      <SurfaceCard className="p-6">
        <div className="flex items-center gap-2">
          <Waves className="h-5 w-5 text-blue-600" />
          <StatusBadge tone={resolved.data ? 'resolved' : 'open'}>
            {resolved.data ? '정산 완료' : '진행 중'}
          </StatusBadge>
        </div>
        <h2 className="mt-4 text-2xl font-black text-slate-950">{POOL_QUESTION}</h2>
        <PoolBar yes={ty} no={tn} />
        <dl className="mt-6 grid gap-3 sm:grid-cols-2 text-sm">
          <Stat label="Pot YES / NO" value={`${formatUsdc(ty)} / ${formatUsdc(tn)}`} />
          <Stat label="내재 확률 YES" value={`${yesPct.toFixed(1)}%`} />
          <Stat label="내 YES" value={formatUsdc((myYes.data as bigint) ?? 0n)} />
          <Stat label="내 NO" value={formatUsdc((myNo.data as bigint) ?? 0n)} />
        </dl>
      </SurfaceCard>

      {!isConnected && (
        <AlertMessage tone="info">상단에서 지갑을 연결한 뒤 배팅할 수 있습니다.</AlertMessage>
      )}

      <SurfaceCard className="p-6">
        <div className="flex gap-2">
          <button
            className={cn(buttonStyles('secondary'), side === 'yes' && 'ring-2 ring-emerald-400')}
            type="button"
            onClick={() => setSide('yes')}
          >
            YES
          </button>
          <button
            className={cn(buttonStyles('secondary'), side === 'no' && 'ring-2 ring-blue-400')}
            type="button"
            onClick={() => setSide('no')}
          >
            NO
          </button>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="text-sm font-bold">승인 한도 (USDC)</span>
            <input className={cn(fieldStyles, 'mt-2')} value={approveAmt} onChange={(e) => setApproveAmt(e.target.value)} />
          </label>
          <label className="block">
            <span className="text-sm font-bold">배팅 (USDC)</span>
            <input className={cn(fieldStyles, 'mt-2')} value={betAmt} onChange={(e) => setBetAmt(e.target.value)} />
          </label>
        </div>
        <button
          className={cn(buttonStyles('primary'), 'mt-4 w-full md:w-auto')}
          disabled={!isConnected || isPending || Boolean(resolved.data)}
          type="button"
          onClick={() => void runApproveAndBet()}
        >
          {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          USDC 승인 후 {side.toUpperCase()} 배팅
        </button>

        {isOwner && (
          <div className="mt-4 flex flex-wrap gap-2">
            <button className={buttonStyles('secondary')} disabled={isPending} type="button" onClick={() => void runResolve(true)}>
              YES 승리 확정
            </button>
            <button className={buttonStyles('secondary')} disabled={isPending} type="button" onClick={() => void runResolve(false)}>
              NO 승리 확정
            </button>
          </div>
        )}

        <button
          className={cn(buttonStyles('secondary'), 'mt-4')}
          disabled={!isConnected || isPending || !resolved.data}
          type="button"
          onClick={() => void runClaim()}
        >
          보상 청구
        </button>
      </SurfaceCard>

      {error && <AlertMessage tone="error">트랜잭션 실패. USDC·네트워크·한도(1000 USDC)를 확인하세요.</AlertMessage>}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
      <dt className="text-xs font-bold text-slate-500">{label}</dt>
      <dd className="mt-1 font-black text-slate-950">{value}</dd>
    </div>
  );
}
