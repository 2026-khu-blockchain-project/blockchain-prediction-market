import { BarChart3, PlusCircle } from 'lucide-react';
import { useReadContract, useReadContracts } from 'wagmi';
import { ContractConfigError } from '../components/ContractConfigError';
import { LoadingCard } from '../components/LoadingCard';
import { MarketCard } from '../components/MarketCard';
import { ButtonLink, EmptyState, PageShell, SectionHeader, StatCard } from '../components/ui';
import {
  isMarketAddressConfigured,
  predictionMarketAbi,
  predictionMarketAddress,
} from '../contracts/predictionMarket';
import { toMarket, type MarketTuple } from '../lib/market';

export function MarketsPage() {
  if (!isMarketAddressConfigured || !predictionMarketAddress) {
    return <ContractConfigError />;
  }

  return <MarketsContent contractAddress={predictionMarketAddress} />;
}

function MarketsContent({
  contractAddress,
}: {
  contractAddress: NonNullable<typeof predictionMarketAddress>;
}) {
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

  const markets =
    (marketsQuery.data as MarketTuple[] | undefined)?.map((marketResult, index) =>
      toMarket(BigInt(index), marketResult),
    ) ?? [];
  const isLoading = marketCountQuery.isPending || marketsQuery.isPending;
  const openMarketCount = markets.filter((market) => !market.resolved).length;

  return (
    <PageShell>
      <SectionHeader
        eyebrow="Markets"
        title="예측시장"
        description="진행 중인 시장을 확인하고 원하는 결과에 ETH로 베팅할 수 있습니다. 모든 정보는 연결된 스마트 컨트랙트에서 직접 조회합니다."
        action={
          <div className="grid min-w-72 grid-cols-2 gap-3">
            <StatCard label="전체 시장" value={marketCount.toString()} />
            <StatCard label="진행 중" value={openMarketCount.toString()} />
          </div>
        }
      />

      {isLoading && (
        <div className="mt-8">
          <LoadingCard />
        </div>
      )}

      {!isLoading && marketCount === 0n && (
        <div className="mt-8">
          <EmptyState
            icon={<BarChart3 className="h-7 w-7" aria-hidden="true" />}
            title="아직 생성된 시장이 없습니다."
            description="관리자 계정에서 새로운 예측시장을 생성하면 이곳에 온체인 시장 카드가 표시됩니다."
            action={
              <ButtonLink to="/admin" variant="secondary">
                <PlusCircle className="h-4 w-4" aria-hidden="true" />
                관리자 화면으로 이동
              </ButtonLink>
            }
          />
        </div>
      )}

      <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {markets.map((market) => (
          <MarketCard key={market.numericId} market={market} />
        ))}
      </div>
    </PageShell>
  );
}
