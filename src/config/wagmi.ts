import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { http } from 'wagmi';
import { appChain, sepoliaRpcUrl, walletConnectProjectId } from './env';

export const wagmiConfig = getDefaultConfig({
  appName: 'Polymarket Lite',
  projectId: walletConnectProjectId,
  chains: [appChain],
  transports: {
    [appChain.id]: http(sepoliaRpcUrl),
  },
  ssr: false,
});
