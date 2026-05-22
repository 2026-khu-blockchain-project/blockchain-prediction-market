import { AlertTriangle, Loader2, RefreshCw } from 'lucide-react';
import { useAccount, useChainId, useSwitchChain } from 'wagmi';
import {
  appChainId,
  appChainName,
  configuredChainId,
  isConfiguredForAppChain,
} from '../config/env';
import { cn } from './ui';

function getNetworkName(chainId: number) {
  if (chainId === appChainId) {
    return appChainName;
  }

  return `chainId ${chainId}`;
}

export function NetworkWarning() {
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const { error, isPending, switchChain } = useSwitchChain();

  if (!isConnected) {
    return null;
  }

  const hasWrongWalletNetwork = chainId !== appChainId;

  if (!hasWrongWalletNetwork && isConfiguredForAppChain) {
    return null;
  }

  const message = hasWrongWalletNetwork
    ? `현재 지갑 네트워크가 ${getNetworkName(chainId)}입니다. ${appChainName} 테스트넷으로 전환해주세요.`
    : `VITE_CHAIN_ID가 ${configuredChainId}로 설정되어 있습니다. 배포 환경은 ${appChainName}(${appChainId})만 사용합니다.`;

  return (
    <div className="border-b border-amber-200 bg-amber-50/90">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-5 py-3 text-sm font-bold text-amber-950 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700">
            <AlertTriangle className="h-4 w-4" aria-hidden="true" />
          </div>
          <div>
            <p>{message}</p>
            <p className="mt-0.5 text-xs font-semibold text-amber-800">
              필요한 네트워크: {appChainName} ({appChainId})
            </p>
            {error && (
              <p className="mt-0.5 text-xs font-semibold text-rose-700">
                네트워크 전환 요청이 거절되었거나 실패했습니다.
              </p>
            )}
          </div>
        </div>

        {hasWrongWalletNetwork && (
          <button
            className={cn(
              'inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-full bg-slate-950 px-4 text-sm font-black text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70',
            )}
            disabled={isPending}
            type="button"
            onClick={() => switchChain({ chainId: appChainId })}
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
            )}
            {isPending ? '전환 요청 중...' : `${appChainName}로 전환`}
          </button>
        )}
      </div>
    </div>
  );
}
