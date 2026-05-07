import { BadgeCheck, Coins, Gift, Landmark, Wallet } from 'lucide-react';
import { PageShell, SectionHeader, StatusBadge, SurfaceCard } from '../components/ui';

const steps = [
  {
    number: '01',
    title: '지갑 연결',
    description: '상단의 지갑 연결 버튼을 눌러 사용할 지갑과 네트워크를 선택합니다.',
    icon: Wallet,
  },
  {
    number: '02',
    title: '예측시장 선택',
    description: '시장 목록에서 참여하고 싶은 예측시장을 확인하고 상세 화면으로 이동합니다.',
    icon: Landmark,
  },
  {
    number: '03',
    title: '후보 A/B 중 하나에 베팅',
    description: '원하는 후보를 선택하고 ETH 금액을 입력하면 placeBet()으로 베팅합니다.',
    icon: Coins,
  },
  {
    number: '04',
    title: '관리자 결과 확정',
    description: '시장이 종료되면 관리자 계정이 resolveMarket()으로 승리 결과를 확정합니다.',
    icon: BadgeCheck,
  },
  {
    number: '05',
    title: '승리자 보상 청구',
    description: '승리한 참여자는 claimWinnings()를 실행해 스마트 컨트랙트에서 보상을 청구합니다.',
    icon: Gift,
  },
];

export function HowItWorksPage() {
  return (
    <PageShell>
      <SectionHeader
        eyebrow="이용 방법"
        title="예측시장 참여 흐름"
        description="Polymarket Lite는 지갑 연결, 시장 선택, 베팅, 결과 확정, 보상 청구의 순서로 동작합니다. 처음 사용하는 사용자도 화면의 상태 안내를 따라 안전하게 참여할 수 있습니다."
        action={<StatusBadge tone="neutral">5단계 안내</StatusBadge>}
      />

      <SurfaceCard className="mt-10 overflow-hidden">
        <div className="grid lg:grid-cols-[300px_minmax(0,1fr)]">
          <div className="border-b border-slate-100 bg-slate-950 p-8 text-white lg:border-b-0 lg:border-r lg:border-slate-800">
            <p className="text-sm font-bold text-emerald-300">온보딩</p>
            <h2 className="mt-3 text-3xl font-black leading-tight">지갑에서 보상 청구까지</h2>
            <p className="mt-4 text-sm leading-7 text-slate-300">
              모든 시장 정보와 포지션은 배포된 스마트 컨트랙트에서 직접 조회됩니다.
            </p>
          </div>

          <div className="divide-y divide-slate-100">
            {steps.map((step) => {
          const Icon = step.icon;

          return (
                <article className="grid gap-4 p-6 sm:grid-cols-[5rem_minmax(0,1fr)]" key={step.title}>
                  <div className="flex items-start gap-3 sm:block">
                    <div className="text-sm font-black text-slate-400">{step.number}</div>
                    <div className="mt-0 flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 sm:mt-4">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-950">{step.title}</h3>
                    <p className="mt-2 text-sm leading-7 text-slate-600">{step.description}</p>
                  </div>
                </article>
          );
            })}
          </div>
        </div>
      </SurfaceCard>
    </PageShell>
  );
}
