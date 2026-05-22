import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { http } from 'wagmi';
import { appChain, rpcUrl, walletConnectProjectId } from './env';

export const wagmiConfig = getDefaultConfig({
  appName: 'Polymarket Lite',
  projectId: walletConnectProjectId,
  chains: [appChain],
  transports: {
    [appChain.id]: http(rpcUrl),
  },
  ssr: false,
});
