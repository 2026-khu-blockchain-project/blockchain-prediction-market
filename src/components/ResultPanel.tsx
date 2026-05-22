import { useEffect } from 'react';
import { CheckCircle2, Gift, Loader2, Trophy, Wallet } from 'lucide-react';
import { useAccount, useReadContract, useWaitForTransactionReceipt, useWriteContract } from 'wagmi';
import { polyPredictAbi, polyPredictAddress } from '../contracts/polyPredict';
import { formatUsdc, type OutcomeId } from '../lib/market';
import { AlertMessage, buttonStyles, cn, InfoRow, StatusBadge, SurfaceCard } from './ui';

type ResultPanelProps = {
  marketId: bigint;
  winningOutcome: OutcomeId;
  winningOutcomeName: string;
  onTransactionSettled: () => void;
};

export function ResultPanel({
  marketId,
  winningOutcome,
  winningOutcomeName,
  onTransactionSettled,
}: ResultPanelProps) {
  const { address, isConnected } = useAccount();
  const { data: hash, error, isPending, writeContract } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const shareBalancesQuery = useReadContract({
    address: polyPredictAddress,
    abi: polyPredictAbi,
    functionName: 'getShareBalances',
    args: address ? [marketId, address] : undefined,
    query: { enabled: isConnected && Boolean(address) && Boolean(polyPredictAddress) },
  });

  const isBusy = isPending || isConfirming;
  const balances = shareBalancesQuery.data as readonly [bigint, bigint] | undefined;
  const yesBalance = balances?.[0] ?? 0n;
  const noBalance = balances?.[1] ?? 0n;
  const userWinningBet = winningOutcome === 0 ? yesBalance : noBalance;
  const canClaim = isConnected && userWinningBet > 0n && !isBusy;
  const claimMessage = getClaimMessage({ isConnected, hasClaimed: userWinningBet === 0n, userWinningBet });

  useEffect(() => {
    if (isSuccess) {
      void shareBalancesQuery.refetch();
      onTransactionSettled();
    }
  }, [isSuccess]);

  function handleClaim() {
    if (!canClaim || !polyPredictAddress) {
      return;
    }

    writeContract({
      address: polyPredictAddress,
      abi: polyPredictAbi,
      functionName: 'claimWinnings',
      args: [marketId],
    });
  }

  return (
    <SurfaceCard className="overflow-hidden">
      <div className="border-b border-slate-100 bg-gradient-to-br from-amber-50 via-white to-emerald-50 p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
                <Trophy className="h-5 w-5" aria-hidden="true" />
              </div>
              <StatusBadge tone="resolved">결과 확정</StatusBadge>
            </div>
            <h2 className="mt-4 text-2xl font-black text-slate-950">보상 청구</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              승리한 YES/NO 토큰을 USDC로 교환할 수 있습니다.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-5 p-6">
        <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-5">
          <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">승리 결과</p>
          <p className="mt-2 text-3xl font-black text-emerald-950">{winningOutcomeName}</p>
        </div>

        {isConnected ? (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <InfoRow label="내 승리 포지션" value={formatUsdc(userWinningBet)} />
            <InfoRow
              label="청구 상태"
              value={userWinningBet === 0n ? '청구 완료 또는 없음' : '청구 가능'}
            />
          </div>
        ) : (
          <AlertMessage tone="info">
            <span className="inline-flex items-center gap-2">
              <Wallet className="h-4 w-4" aria-hidden="true" />
              보상 청구 가능 여부를 확인하려면 지갑을 연결해주세요.
            </span>
          </AlertMessage>
        )}

        {isConnected && <AlertMessage tone={claimMessage.tone}>{claimMessage.text}</AlertMessage>}
        {error && (
          <AlertMessage tone="error">
            보상 청구에 실패했습니다. 승리 토큰 보유 여부와 네트워크를 확인해주세요.
          </AlertMessage>
        )}
        {isSuccess && (
          <AlertMessage tone="success">
            <span className="inline-flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
              보상 청구가 완료되었습니다.
            </span>
          </AlertMessage>
        )}

        <button
          className={cn(buttonStyles('primary'), 'w-full')}
          disabled={!canClaim}
          type="button"
          onClick={handleClaim}
        >
          {isBusy ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <Gift className="h-4 w-4" aria-hidden="true" />
          )}
          {isBusy ? '보상 청구 중...' : '보상 청구하기'}
        </button>
      </div>
    </SurfaceCard>
  );
}

function getClaimMessage({
  isConnected,
  hasClaimed,
  userWinningBet,
}: {
  isConnected: boolean;
  hasClaimed: boolean;
  userWinningBet: bigint;
}): { tone: 'success' | 'error' | 'warning' | 'info'; text: string } {
  if (!isConnected) {
    return {
      tone: 'info',
      text: '지갑을 연결하면 청구 가능 여부가 표시됩니다.',
    };
  }

  if (hasClaimed) {
    return {
      tone: 'info',
      text: '청구할 승리 포지션이 없습니다.',
    };
  }

  if (userWinningBet > 0n) {
    return {
      tone: 'success',
      text: '승리 토큰이 있어 USDC 보상 청구가 가능합니다.',
    };
  }

  return {
    tone: 'warning',
    text: '승리 결과에 해당하는 토큰이 없어 보상을 청구할 수 없습니다.',
  };
}
