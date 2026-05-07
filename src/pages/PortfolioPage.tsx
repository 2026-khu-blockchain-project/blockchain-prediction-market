import { useEffect, useMemo } from 'react';
import { ArrowRight, Briefcase, CircleDollarSign, Gift, Loader2, Wallet } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  useAccount,
  useReadContract,
  useReadContracts,
  useWaitForTransactionReceipt,
  useWriteContract,
} from 'wagmi';
import { ContractConfigError } from '../components/ContractConfigError';
import { LoadingCard } from '../components/LoadingCard';
import {
  isMarketAddressConfigured,
  predictionMarketAbi,
  predictionMarketAddress,
} from '../contracts/predictionMarket';
import {
  formatEth,
  getMarketStatusLabel,
  getWinningOutcomeName,
  toMarket,
  type Market,
  type MarketTuple,
  type OutcomeId,
} from '../lib/market';
import {
  AlertMessage,
  buttonStyles,
  ButtonLink,
  cn,
  EmptyState,
  PageShell,
  SectionHeader,
  StatCard,
  StatusBadge,
  SurfaceCard,
} from '../components/ui';

type Position = {
  market: Market;
  outcome: OutcomeId;
  outcomeName: string;
  amount: bigint;
  hasClaimed: boolean;
};

export function PortfolioPage() {
  if (!isMarketAddressConfigured || !predictionMarketAddress) {
    return <ContractConfigError />;
  }

  return <PortfolioContent contractAddress={predictionMarketAddress} />;
}

function PortfolioContent({
  contractAddress,
}: {
  contractAddress: NonNullable<typeof predictionMarketAddress>;
}) {
  const { address, isConnected } = useAccount();
  const { data: hash, error, isPending, writeContract } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const marketCountQuery = useReadContract({
    address: contractAddress,
    abi: predictionMarketAbi,
    functionName: 'marketCount',
    query: { enabled: isConnected },
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
    query: { enabled: isConnected && marketIds.length > 0 },
  });

  const betsQuery = useReadContracts({
    allowFailure: false,
    contracts: marketIds.flatMap((marketId) => [
      {
        address: contractAddress,
        abi: predictionMarketAbi,
        functionName: 'getUserBet',
        args: [marketId, address!, 0],
      },
      {
        address: contractAddress,
        abi: predictionMarketAbi,
        functionName: 'getUserBet',
        args: [marketId, address!, 1],
      },
    ]),
    query: { enabled: isConnected && Boolean(address) && marketIds.length > 0 },
  });

  const claimedQuery = useReadContracts({
    allowFailure: false,
    contracts: marketIds.map((marketId) => ({
      address: contractAddress,
      abi: predictionMarketAbi,
      functionName: 'claimed',
      args: [marketId, address!],
    })),
    query: { enabled: isConnected && Boolean(address) && marketIds.length > 0 },
  });

  const markets =
    (marketsQuery.data as MarketTuple[] | undefined)?.map((marketResult, index) =>
      toMarket(BigInt(index), marketResult),
    ) ?? [];
  const betAmounts = (betsQuery.data as bigint[] | undefined) ?? [];
  const claimedByMarket = (claimedQuery.data as boolean[] | undefined) ?? [];

  const positions = useMemo(() => {
    return markets.flatMap((market, index) => {
      const betA = betAmounts[index * 2] ?? 0n;
      const betB = betAmounts[index * 2 + 1] ?? 0n;
      const hasClaimed = claimedByMarket[index] ?? false;
      const userPositions: Position[] = [];

      if (betA > 0n) {
        userPositions.push({
          market,
          outcome: 0,
          outcomeName: market.outcomeA,
          amount: betA,
          hasClaimed,
        });
      }

      if (betB > 0n) {
        userPositions.push({
          market,
          outcome: 1,
          outcomeName: market.outcomeB,
          amount: betB,
          hasClaimed,
        });
      }

      return userPositions;
    });
  }, [betAmounts, claimedByMarket, markets]);

  const shortAddress = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : '';
  const isLoading =
    isConnected &&
    (marketCountQuery.isPending ||
      marketsQuery.isPending ||
      betsQuery.isPending ||
      claimedQuery.isPending);
  const isBusy = isPending || isConfirming;

  useEffect(() => {
    if (isSuccess) {
      void marketsQuery.refetch();
      void betsQuery.refetch();
      void claimedQuery.refetch();
    }
  }, [isSuccess]);

  function handleClaim(marketId: bigint) {
    writeContract({
      address: contractAddress,
      abi: predictionMarketAbi,
      functionName: 'claimWinnings',
      args: [marketId],
    });
  }

  return (
    <PageShell>
      <SectionHeader
        eyebrow="내 포지션"
        title="내 포지션"
        description="연결된 지갑 기준으로 참여한 예측시장 포지션을 조회합니다. 베팅 금액, 시장 상태, 결과 확정 여부와 보상 청구 가능 여부를 한 곳에서 확인할 수 있습니다."
        action={
          <SurfaceCard className="px-4 py-3">
            <p className="flex items-center gap-2 text-sm font-black text-slate-950">
              <Wallet className="h-4 w-4 text-emerald-600" aria-hidden="true" />
              {isConnected ? shortAddress : '지갑 미연결'}
            </p>
            <p className="mt-1 text-xs font-semibold text-slate-500">
              {isConnected ? '연결된 지갑' : '상단 버튼으로 지갑을 연결해주세요.'}
            </p>
          </SurfaceCard>
        }
      />

      {!isConnected && (
        <div className="mt-8">
          <EmptyState
            icon={<Wallet className="h-7 w-7" aria-hidden="true" />}
            title="지갑 연결이 필요합니다."
            description="내 포지션은 연결된 지갑 주소를 기준으로 온체인 베팅 내역을 조회합니다."
          />
        </div>
      )}

      {isLoading && (
        <div className="mt-8">
          <LoadingCard label="연결된 지갑의 포지션을 조회하는 중입니다..." />
        </div>
      )}

      {isConnected && !isLoading && positions.length === 0 && (
        <div className="mt-8">
          <EmptyState
            icon={<Briefcase className="h-7 w-7" aria-hidden="true" />}
            title="아직 참여한 예측시장이 없습니다."
            description="진행 중인 시장을 둘러보고 원하는 결과에 베팅하면 이곳에서 포지션을 확인할 수 있습니다."
            action={<ButtonLink to="/markets">시장 보러가기</ButtonLink>}
          />
        </div>
      )}

      {error && (
        <div className="mt-8">
          <AlertMessage tone="error">
          보상 청구 트랜잭션 요청에 실패했습니다. 청구 가능 여부와 지갑 네트워크를 확인해주세요.
          </AlertMessage>
        </div>
      )}
      {isSuccess && (
        <div className="mt-8">
          <AlertMessage tone="success">보상 청구가 완료되었습니다.</AlertMessage>
        </div>
      )}

      <div className="mt-8 grid gap-5 lg:grid-cols-2">
        {positions.map((position) => {
          const isWinningPosition =
            position.market.resolved && position.market.winningOutcome === position.outcome;
          const canClaim = isWinningPosition && !position.hasClaimed;
          const claimStatus = getClaimStatus(position);

          return (
            <SurfaceCard
              className="overflow-hidden transition duration-200 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-xl hover:shadow-slate-950/[0.06]"
              key={`${position.market.numericId}-${position.outcome}`}
            >
              <div className="border-b border-slate-100 p-6">
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge tone={position.market.resolved ? 'resolved' : 'open'}>
                    {getMarketStatusLabel(position.market)}
                  </StatusBadge>
                  <StatusBadge tone="neutral">선택: {position.outcomeName}</StatusBadge>
                </div>
                <h2 className="mt-4 text-xl font-black leading-7 text-slate-950">
                  {position.market.title}
                </h2>
              </div>

              <div className="space-y-5 p-6">
                <div className="grid grid-cols-2 gap-3">
                  <StatCard
                    icon={<CircleDollarSign className="h-4 w-4" aria-hidden="true" />}
                    label="베팅 금액"
                    value={formatEth(position.amount)}
                  />
                  <StatCard label="시장 상태" value={getMarketStatusLabel(position.market)} />
                  <StatCard
                  label="결과 확정 여부"
                  value={position.market.resolved ? '확정됨' : '대기 중'}
                />
                  <StatCard
                  label="승리 결과"
                  value={
                    position.market.resolved ? getWinningOutcomeName(position.market) : '대기 중'
                  }
                />
                </div>

                <AlertMessage tone={claimStatus.tone}>{claimStatus.text}</AlertMessage>

                {canClaim ? (
                  <button
                    className={cn(buttonStyles('primary'), 'w-full bg-emerald-600 hover:bg-emerald-700')}
                    disabled={isBusy}
                    type="button"
                    onClick={() => handleClaim(position.market.id)}
                  >
                    {isBusy ? (
                      <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                    ) : (
                      <Gift className="h-4 w-4" aria-hidden="true" />
                    )}
                    {isBusy ? '보상 청구 중...' : '보상 청구하기'}
                  </button>
                ) : (
                  <Link
                    className={cn(buttonStyles('secondary'), 'w-full')}
                    to={`/markets/${position.market.numericId}`}
                  >
                    시장 보기
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                )}
              </div>
            </SurfaceCard>
          );
        })}
      </div>
    </PageShell>
  );
}

function getClaimStatus(position: Position) {
  if (!position.market.resolved) {
    return {
      tone: 'info' as const,
      text: '결과 확정 후 보상 청구 가능 여부가 표시됩니다.',
    };
  }

  if (position.market.winningOutcome !== position.outcome) {
    return {
      tone: 'warning' as const,
      text: '선택한 결과가 승리하지 않아 보상 청구 대상이 아닙니다.',
    };
  }

  if (position.hasClaimed) {
    return {
      tone: 'info' as const,
      text: '이미 보상을 청구했습니다.',
    };
  }

  return {
    tone: 'success' as const,
    text: '승리 포지션입니다. 보상 청구가 가능합니다.',
  };
}
