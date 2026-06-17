import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { fallback } from 'viem';
import { http } from 'wagmi';
import { appChain, rpcUrl, useHardhatLocal, walletConnectProjectId } from './env';

// 단일 공개 RPC가 rate-limit/장애일 때 읽기 전체가 실패하지 않도록 폴백 RPC를 둔다.
const AMOY_RPC_URLS = [
  rpcUrl,
  'https://polygon-amoy-bor-rpc.publicnode.com',
  'https://polygon-amoy.drpc.org',
  'https://rpc-amoy.polygon.technology',
];

const amoyTransport = fallback(
  Array.from(new Set(AMOY_RPC_URLS)).map((url) => http(url)),
);

export const wagmiConfig = getDefaultConfig({
  appName: 'Polymarket Lite',
  projectId: walletConnectProjectId,
  chains: [appChain],
  transports: {
    // 로컬(hardhat)은 127.0.0.1 단일 노드, 그 외(Amoy)는 폴백 RPC 사용
    [appChain.id]: useHardhatLocal ? http(rpcUrl) : amoyTransport,
  },
  ssr: false,
});
