import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, CheckCircle2, Info, Loader2, ShieldCheck } from 'lucide-react';
import { parseEther } from 'viem';
import { useAccount, useWaitForTransactionReceipt, useWriteContract } from 'wagmi';
import {
  predictionMarketAbi,
  predictionMarketAddress,
} from '../contracts/predictionMarket';
import { formatEth, type OutcomeId } from '../lib/market';
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
  const { isConnected } = useAccount();
  const [amount, setAmount] = useState('');
  const [formError, setFormError] = useState('');

  const { data: hash, error, isPending, writeContract } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const parsedAmount = useMemo(() => {
    if (!amount.trim()) {
      return 0n;
    }

    try {
      return parseEther(amount);
    } catch {
      return null;
    }
  }, [amount]);

  const isBusy = isPending || isConfirming;
  const hasSelectedOutcome = selectedOutcome !== undefined;
  const isAmountValid = parsedAmount !== null && parsedAmount > 0n;
  const canSubmit = isConnected && !disabled && !isBusy && hasSelectedOutcome && isAmountValid;
  const selectedProbability =
    hasSelectedOutcome && totalPool > 0n
      ? Number((selectedOutcomePool * 10000n) / totalPool) / 100
      : 0;
  const estimatedReturn =
    hasSelectedOutcome && parsedAmount !== null && parsedAmount > 0n
      ? (parsedAmount * (totalPool + parsedAmount)) / (selectedOutcomePool + parsedAmount)
      : 0n;

  const helperText = useMemo(() => {
    if (!isConnected) {
      return '베팅하려면 먼저 지갑을 연결해주세요.';
    }

    if (disabled) {
      return '이미 결과가 확정된 시장에는 추가로 베팅할 수 없습니다.';
    }

    if (!hasSelectedOutcome) {
      return '먼저 베팅할 결과를 선택해주세요.';
    }

    if (!amount.trim()) {
      return '베팅할 ETH 금액을 입력해주세요.';
    }

    if (!isAmountValid) {
      return '0보다 큰 ETH 금액을 입력해주세요.';
    }

    return '입력한 ETH가 선택한 결과에 베팅됩니다.';
  }, [amount, disabled, hasSelectedOutcome, isAmountValid, isConnected]);

  useEffect(() => {
    if (isSuccess) {
      setAmount('');
      setFormError('');
      onTransactionSettled();
    }
  }, [isSuccess, onTransactionSettled]);

  function handleSubmit() {
    setFormError('');

    if (!hasSelectedOutcome) {
      setFormError('먼저 베팅할 결과를 선택해주세요.');
      return;
    }

    if (parsedAmount === null) {
      setFormError('ETH 금액 형식이 올바르지 않습니다.');
      return;
    }

    if (!canSubmit || !predictionMarketAddress) {
      return;
    }

    writeContract({
      address: predictionMarketAddress,
      abi: predictionMarketAbi,
      functionName: 'placeBet',
      args: [marketId, selectedOutcome],
      value: parsedAmount,
    });
  }

  return (
    <SurfaceCard className="overflow-hidden">
      <div className="border-b border-slate-100 bg-slate-950 p-6 text-white">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-bold text-emerald-300">거래 패널</p>
            <h2 className="mt-1 text-2xl font-black">베팅하기</h2>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-emerald-300">
            <ShieldCheck className="h-5 w-5" aria-hidden="true" />
          </div>
        </div>
        <p className="mt-3 text-sm leading-6 text-slate-300">
          지갑 승인 후 선택한 결과에 ETH가 예치됩니다.
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
              베팅 금액
            </label>
            <span className="text-xs font-bold text-slate-400">ETH</span>
          </div>
          <div className="relative">
            <input
              id="bet-amount"
              aria-invalid={amount.trim() ? !isAmountValid : undefined}
              className={cn(fieldStyles, 'pr-16 text-base')}
              inputMode="decimal"
              min="0"
              placeholder="0.05"
              step="any"
              type="number"
              value={amount}
              onChange={(event) => {
                setAmount(event.target.value);
                setFormError('');
              }}
            />
            <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm font-black text-slate-500">
              ETH
            </span>
          </div>
          <p className="mt-3 flex items-start gap-2 text-xs font-semibold leading-5 text-slate-500">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            {helperText}
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <InfoRow
            label="현재 비율"
            value={hasSelectedOutcome ? `${selectedProbability.toFixed(1)}%` : '-'}
          />
          <PanelRow label="예상 수령량" value={formatEth(estimatedReturn)} />
          <PanelRow label="전송 금액" value={isAmountValid ? formatEth(parsedAmount) : '0 ETH'} />
        </div>

        {!hasSelectedOutcome && (
          <AlertMessage tone="warning">먼저 베팅할 결과를 선택해주세요.</AlertMessage>
        )}
        {formError && <AlertMessage tone="error">{formError}</AlertMessage>}
        {error && (
          <AlertMessage tone="error">
            트랜잭션 요청에 실패했습니다. 지갑 승인 여부와 네트워크 상태를 확인해주세요.
          </AlertMessage>
        )}
        {isSuccess && (
          <AlertMessage tone="success">
            <span className="inline-flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
              베팅이 완료되었습니다.
            </span>
          </AlertMessage>
        )}

        <button
          className={cn(buttonStyles('primary'), 'w-full bg-emerald-600 hover:bg-emerald-700')}
          disabled={!canSubmit}
          type="button"
          onClick={handleSubmit}
        >
          {isBusy ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          )}
          {isBusy ? '트랜잭션 처리 중...' : '베팅하기'}
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
