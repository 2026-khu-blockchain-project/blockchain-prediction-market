import { ArrowRight, BadgeCheck, Coins, Landmark, ShieldCheck, Trophy, Wallet } from 'lucide-react';
import { ButtonLink, PageShell, SurfaceCard } from '../components/ui';

const features = [
  {
    title: '온체인 시장 조회',
    description: '생성된 시장과 예치금 현황을 스마트 컨트랙트에서 직접 불러옵니다.',
    icon: Landmark,
  },
  {
    title: '후보 A/B 베팅',
    description: '지갑을 연결하고 원하는 결과를 선택해 ETH로 시장에 참여합니다.',
    icon: Coins,
  },
  {
    title: '관리자 결과 확정',
    description: '관리자 계정이 시장 결과를 확정하면 추가 베팅이 자동으로 제한됩니다.',
    icon: BadgeCheck,
  },
  {
    title: '스마트 컨트랙트 보상 청구',
    description: '승리한 참여자는 확정된 결과에 따라 온체인 보상을 청구합니다.',
    icon: Trophy,
  },
];

export function HomePage() {
  return (
    <PageShell className="py-12 lg:py-16">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_440px] lg:items-center">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-sm font-bold text-emerald-700">
            <ShieldCheck className="h-4 w-4" aria-hidden="true" />
            블록체인 기반 예측시장 dApp
          </div>
          <h1 className="mt-6 max-w-4xl text-5xl font-black leading-[1.02] tracking-tight text-slate-950 md:text-7xl">
            Polymarket Lite
          </h1>
          <p className="mt-6 max-w-2xl text-xl font-bold leading-8 text-slate-700">
            지갑으로 참여하고, 스마트 컨트랙트로 정산하는 깔끔한 예측시장 경험.
          </p>
          <p className="mt-4 max-w-2xl text-base leading-8 text-slate-600">
            시장 조회부터 후보 A/B 베팅, 결과 확정, 보상 청구까지 온체인 흐름을 유지하면서
            실제 서비스처럼 사용할 수 있도록 구성했습니다.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <ButtonLink to="/markets">
              시장 둘러보기
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </ButtonLink>
            <ButtonLink to="/portfolio" variant="secondary">
              <Wallet className="h-4 w-4" aria-hidden="true" />
              내 포지션 보기
            </ButtonLink>
          </div>
        </div>

        <SurfaceCard className="overflow-hidden">
          <div className="border-b border-slate-100 bg-slate-950 p-6 text-white">
            <p className="text-sm font-bold text-emerald-300">Product Preview</p>
            <h2 className="mt-2 text-2xl font-black">온체인 예측시장 플로우</h2>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              실제 시장 데이터는 연결된 컨트랙트에서만 조회됩니다.
            </p>
          </div>
          <div className="space-y-4 p-6">
            <PreviewStep index="01" title="시장 조회" description="marketCount(), getMarket()" />
            <PreviewStep index="02" title="베팅 참여" description="후보 A/B 중 하나 선택" />
            <PreviewStep index="03" title="결과 확정" description="관리자 계정으로 확정" />
            <PreviewStep index="04" title="보상 청구" description="승리 포지션 정산" />
          </div>
        </SurfaceCard>
      </div>

      <div className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {features.map((feature) => {
          const Icon = feature.icon;

          return (
            <article
              className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm shadow-slate-950/[0.03] transition duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-950/[0.06]"
              key={feature.title}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                <Icon className="h-6 w-6" aria-hidden="true" />
              </div>
              <h2 className="mt-5 text-lg font-black text-slate-950">{feature.title}</h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">{feature.description}</p>
            </article>
          );
        })}
      </div>

      <p className="mt-10 rounded-2xl border border-slate-200 bg-white/70 px-5 py-4 text-sm font-semibold text-slate-500">
        이 서비스는 테스트넷 환경에서 동작합니다. 실제 자산이 아닌 테스트용 ETH를 사용해주세요.
      </p>
    </PageShell>
  );
}

function PreviewStep({
  index,
  title,
  description,
}: {
  index: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-sm font-black text-slate-950 shadow-sm">
        {index}
      </span>
      <div>
        <p className="font-black text-slate-950">{title}</p>
        <p className="mt-0.5 text-sm font-semibold text-slate-500">{description}</p>
      </div>
    </div>
  );
}
