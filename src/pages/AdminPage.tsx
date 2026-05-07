import { AdminPanel } from '../components/AdminPanel';
import { ContractConfigError } from '../components/ContractConfigError';
import { PageShell, SectionHeader, StatusBadge } from '../components/ui';
import {
  isMarketAddressConfigured,
  predictionMarketAddress,
} from '../contracts/predictionMarket';

export function AdminPage() {
  if (!isMarketAddressConfigured || !predictionMarketAddress) {
    return <ContractConfigError />;
  }

  return (
    <PageShell className="max-w-6xl">
      <SectionHeader
        eyebrow="관리자"
        title="관리자 화면"
        description="관리자 계정은 새로운 예측시장을 생성하고, 시장이 종료되면 승리 결과를 확정할 수 있습니다."
        action={<StatusBadge tone="admin">owner 전용</StatusBadge>}
      />
      <div className="mt-8">
      <AdminPanel contractAddress={predictionMarketAddress} />
      </div>
    </PageShell>
  );
}
