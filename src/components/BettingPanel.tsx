import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, CheckCircle2, Info, Loader2, ShieldCheck } from 'lucide-react';
import { parseUnits } from 'viem';
import { waitForTransactionReceipt } from '@wagmi/core';
import { useAccount, useConfig, useReadContract, useWriteContract } from 'wagmi';
import { mockUsdcAbi } from '../contracts/mockUsdc';
import { polyPredictAbi, polyPredictAddress, usdcAddress } from '../contracts/polyPredict';
import { formatUsdc, USDC_DECIMALS, type OutcomeId } from '../lib/market';
import { AlertMessage, buttonStyles, cn, fieldStyles, InfoRow, StatusBadge, SurfaceCard } from './ui';

type BettingPanelProps = {
  disabled: boolean;
  marketId: bigint;
  selectedOutcome?: OutcomeId;
  selectedOutcomeName?: string;
  selectedOutcomePool: bigint;
  totalPool: bigint;
  onTransactionSettled: () => void;
};

export function BettingPanel({
  disabled,
  marketId,
  selectedOutcome,
  selectedOutcomeName,
  selectedOutcomePool,
  totalPool,
  onTransactionSettled,
}: BettingPanelProps) {
  const { address, isConnected } = useAccount();
  const [amount, setAmount] = useState('');
  const [formError, setFormError] = useState('');
  const [step, setStep] = useState<'idle' | 'approve' | 'mint'>('idle');
  const [lastSuccess, setLastSuccess] = useState(false);

  const config = useConfig();
  const { error, isPending, writeContractAsync } = useWriteContract();

  const parsedAmount = useMemo(() => {
    if (!amount.trim()) {
      return 0n;
    }

    try {
      return parseUnits(amount, USDC_DECIMALS);
    } catch {
      return null;
    }
  }, [amount]);

  const allowanceQuery = useReadContract({
    address: usdcAddress,
    abi: mockUsdcAbi,
    functionName: 'allowance',
    args:
      address && polyPredictAddress ? [address, polyPredictAddress] : undefined,
    query: {
      enabled: isConnected && Boolean(address) && Boolean(usdcAddress) && Boolean(polyPredictAddress),
    },
  });

  const isBusy = isPending || step !== 'idle';
  const hasSelectedOutcome = selectedOutcome !== undefined;
  const isAmountValid = parsedAmount !== null && parsedAmount > 0n;
  const canSubmit =
    isConnected &&
    !disabled &&
    !isBusy &&
    hasSelectedOutcome &&
    isAmountValid &&
    Boolean(polyPredictAddress) &&
    Boolean(usdcAddress);
  const selectedProbability =
    hasSelectedOutcome && totalPool > 0n
      ? Number((selectedOutcomePool * 10000n) / totalPool) / 100
      : 50;
  const estimatedReturn = isAmountValid ? parsedAmount : 0n;

  const helperText = useMemo(() => {
    if (!isConnected) {
      return '베팅하려면 먼저 지갑을 연결해주세요.';
    }

    if (disabled) {
      return '이미 결과가 확정된 시장에는 추가로 참여할 수 없습니다.';
    }

    if (!hasSelectedOutcome) {
      return '먼저 관심 있는 결과를 선택해주세요.';
    }

    if (!amount.trim()) {
      return '예치할 USDC 금액을 입력해주세요.';
    }

    if (!isAmountValid) {
      return '0보다 큰 USDC 금액을 입력해주세요.';
    }

    return 'USDC를 예치하면 YES·NO 포지션이 동시에 발행됩니다. 승리 시 해당 토큰으로 USDC를 청구합니다.';
  }, [amount, disabled, hasSelectedOutcome, isAmountValid, isConnected]);

  useEffect(() => {
    if (lastSuccess) {
      setAmount('');
      setFormError('');
      setStep('idle');
      setLastSuccess(false);
      onTransactionSettled();
    }
  }, [lastSuccess, onTransactionSettled]);

  async function handleSubmit() {
    setFormError('');

    if (!hasSelectedOutcome) {
      setFormError('먼저 관심 있는 결과를 선택해주세요.');
      return;
    }

    if (parsedAmount === null) {
      setFormError('USDC 금액 형식이 올바르지 않습니다.');
      return;
    }

    if (!canSubmit || !polyPredictAddress || !usdcAddress) {
      return;
    }

    try {
      const allowance = allowanceQuery.data ?? 0n;

      if (allowance < parsedAmount) {
        setStep('approve');
        const approveHash = await writeContractAsync({
          address: usdcAddress,
          abi: mockUsdcAbi,
          functionName: 'approve',
          args: [polyPredictAddress, parsedAmount],
        });
        await waitForTransactionReceipt(config, { hash: approveHash });
      }

      setStep('mint');
      const mintHash = await writeContractAsync({
        address: polyPredictAddress,
        abi: polyPredictAbi,
        functionName: 'mintShares',
        args: [marketId, parsedAmount],
      });
      await waitForTransactionReceipt(config, { hash: mintHash });
      setLastSuccess(true);
      void allowanceQuery.refetch();
    } catch {
      setStep('idle');
    }
  }

  return (
    <SurfaceCard className="overflow-hidden">
      <div className="border-b border-slate-100 bg-slate-950 p-6 text-white">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-bold text-emerald-300">거래 패널 · CTF</p>
            <h2 className="mt-1 text-2xl font-black">포지션 발행</h2>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-emerald-300">
            <ShieldCheck className="h-5 w-5" aria-hidden="true" />
          </div>
        </div>
        <p className="mt-3 text-sm leading-6 text-slate-300">
          USDC 승인 후 YES·NO 조건부 토큰이 발행됩니다.
        </p>
      </div>

      <div className="space-y-5 p-6">
        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                선택한 결과
              </p>
              <p className="mt-2 text-xl font-black text-slate-950">
                {selectedOutcomeName ?? '선택 전'}
              </p>
            </div>
            <StatusBadge tone={hasSelectedOutcome ? 'success' : 'neutral'}>
              {hasSelectedOutcome ? `${selectedProbability.toFixed(1)}%` : '대기'}
            </StatusBadge>
          </div>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between gap-3">
            <label className="block text-sm font-bold text-slate-700" htmlFor="bet-amount">
              예치 금액
            </label>
            <span className="text-xs font-bold text-slate-400">USDC</span>
          </div>
          <div className="relative">
            <input
              id="bet-amount"
              aria-invalid={amount.trim() ? !isAmountValid : undefined}
              className={cn(fieldStyles, 'pr-16 text-base')}
              inputMode="decimal"
              min="0"
              placeholder="10"
              step="any"
              type="number"
              value={amount}
              onChange={(event) => {
                setAmount(event.target.value);
                setFormError('');
              }}
            />
            <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm font-black text-slate-500">
              USDC
            </span>
          </div>
          <p className="mt-3 flex items-start gap-2 text-xs font-semibold leading-5 text-slate-500">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            {helperText}
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <InfoRow
            label="시장 담보"
            value={hasSelectedOutcome ? `${selectedProbability.toFixed(1)}%` : '-'}
          />
          <PanelRow label="승리 시 1:1 수령" value={formatUsdc(estimatedReturn)} />
          <PanelRow label="전송 금액" value={isAmountValid ? formatUsdc(parsedAmount) : '0 USDC'} />
        </div>

        {!hasSelectedOutcome && (
          <AlertMessage tone="warning">먼저 관심 있는 결과를 선택해주세요.</AlertMessage>
        )}
        {formError && <AlertMessage tone="error">{formError}</AlertMessage>}
        {error && (
          <AlertMessage tone="error">
            트랜잭션 요청에 실패했습니다. USDC 승인·잔액·네트워크(Polygon Amoy)를 확인해주세요.
          </AlertMessage>
        )}
        {lastSuccess && (
          <AlertMessage tone="success">
            <span className="inline-flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
              포지션 발행이 완료되었습니다.
            </span>
          </AlertMessage>
        )}

        <button
          className={cn(buttonStyles('primary'), 'w-full bg-emerald-600 hover:bg-emerald-700')}
          disabled={!canSubmit}
          type="button"
          onClick={() => void handleSubmit()}
        >
          {isBusy ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          )}
          {isBusy
            ? step === 'approve'
              ? 'USDC 승인 중...'
              : '포지션 발행 중...'
            : 'USDC로 포지션 발행'}
        </button>
      </div>
    </SurfaceCard>
  );
}

function PanelRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-slate-200 px-4 py-3 last:border-b-0">
      <span className="text-sm font-semibold text-slate-500">{label}</span>
      <span className="text-right text-sm font-bold text-slate-950">{value}</span>
    </div>
  );
}
