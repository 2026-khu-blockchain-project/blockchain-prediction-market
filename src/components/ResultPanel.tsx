import { useEffect } from 'react';
import { CheckCircle2, Gift, Loader2, Trophy, Wallet } from 'lucide-react';
import { useAccount, useReadContract, useWaitForTransactionReceipt, useWriteContract } from 'wagmi';
import {
  predictionMarketAbi,
  predictionMarketAddress,
} from '../contracts/predictionMarket';
import { formatEth, type OutcomeId } from '../lib/market';
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

  const userWinningBetQuery = useReadContract({
    address: predictionMarketAddress,
    abi: predictionMarketAbi,
    functionName: 'getUserBet',
    args: address ? [marketId, address, winningOutcome] : undefined,
    query: { enabled: isConnected && Boolean(address) && Boolean(predictionMarketAddress) },
  });

  const claimedQuery = useReadContract({
    address: predictionMarketAddress,
    abi: predictionMarketAbi,
    functionName: 'claimed',
    args: address ? [marketId, address] : undefined,
    query: { enabled: isConnected && Boolean(address) && Boolean(predictionMarketAddress) },
  });

  const isBusy = isPending || isConfirming;
  const userWinningBet = userWinningBetQuery.data ?? 0n;
  const hasClaimed = claimedQuery.data ?? false;
  const canClaim = isConnected && userWinningBet > 0n && !hasClaimed && !isBusy;
  const claimMessage = getClaimMessage({ isConnected, hasClaimed, userWinningBet });

  useEffect(() => {
    if (isSuccess) {
      void userWinningBetQuery.refetch();
      void claimedQuery.refetch();
      onTransactionSettled();
    }
  }, [isSuccess]);

  function handleClaim() {
    if (!canClaim || !predictionMarketAddress) {
      return;
    }

    writeContract({
      address: predictionMarketAddress,
      abi: predictionMarketAbi,
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
              승리 결과에 베팅한 지갑은 스마트 컨트랙트에서 보상을 청구할 수 있습니다.
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
            <InfoRow label="내 승리 베팅" value={formatEth(userWinningBet)} />
            <InfoRow label="청구 상태" value={hasClaimed ? '청구 완료' : '확인됨'} />
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
            보상 청구에 실패했습니다. 이미 청구했거나 청구 가능한 보상이 없을 수 있습니다.
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
      text: '이미 이 시장의 보상을 청구했습니다.',
    };
  }

  if (userWinningBet > 0n) {
    return {
      tone: 'success',
      text: '승리 결과에 베팅한 금액이 있어 보상 청구가 가능합니다.',
    };
  }

  return {
    tone: 'warning',
    text: '승리 결과에 베팅한 금액이 없어 보상을 청구할 수 없습니다.',
  };
}
