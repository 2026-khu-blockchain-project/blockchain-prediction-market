import { AlertTriangle } from 'lucide-react';
import { appChainId, appChainName, configuredChainId } from '../config/env';
import { AlertMessage, PageShell, SurfaceCard } from './ui';

export function ContractConfigError() {
  return (
    <PageShell className="max-w-4xl">
      <SurfaceCard className="overflow-hidden">
        <div className="border-b border-slate-100 bg-gradient-to-br from-rose-50 to-white p-8">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-rose-100 text-rose-700">
              <AlertTriangle className="h-6 w-6" aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-bold text-rose-700">연결 상태 확인 필요</p>
              <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950">
                컨트랙트 연결 오류
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
                배포된 컨트랙트 주소가 설정되지 않았거나 올바르지 않습니다. 잠시 후 다시
                시도해주세요.
              </p>
            </div>
          </div>
        </div>
        <div className="p-6">
          <AlertMessage tone="warning">
            서비스 관리자가 올바른 네트워크와 컨트랙트 주소를 설정하면 정상적으로 이용할 수
            있습니다.
          </AlertMessage>
          <details className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs leading-6 text-slate-600">
            <summary className="cursor-pointer font-black text-slate-800">개발자용 세부 정보</summary>
            <p className="mt-3">
              <code>VITE_PREDICTION_MARKET_ADDRESS</code>에 배포된 PredictionMarket
              컨트랙트 주소를 설정하고, <code>VITE_CHAIN_ID</code>가 {appChainName}
              ({appChainId})와 일치하는지 확인해주세요. 현재 설정값은 {configuredChainId}
              입니다.
            </p>
          </details>
        </div>
      </SurfaceCard>
    </PageShell>
  );
}
