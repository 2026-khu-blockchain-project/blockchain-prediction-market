import { type Address, isAddress } from 'viem';
import { sepolia } from 'wagmi/chains';

const FALLBACK_WALLETCONNECT_PROJECT_ID = 'demo';

const rawChainId = import.meta.env.VITE_CHAIN_ID?.trim();
const parsedChainId = rawChainId ? Number(rawChainId) : sepolia.id;
const rawPredictionMarketAddress = import.meta.env.VITE_PREDICTION_MARKET_ADDRESS?.trim();
const rawWalletConnectProjectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID?.trim();

export const appChain = sepolia;
export const appChainId = sepolia.id;
export const appChainName = sepolia.name;
export const configuredChainId = Number.isInteger(parsedChainId) ? parsedChainId : sepolia.id;
export const isConfiguredForSepolia = configuredChainId === sepolia.id;
export const sepoliaRpcUrl = import.meta.env.VITE_SEPOLIA_RPC_URL?.trim() || undefined;

export const walletConnectProjectId =
  rawWalletConnectProjectId || FALLBACK_WALLETCONNECT_PROJECT_ID;

export const predictionMarketAddress = (
  rawPredictionMarketAddress && isAddress(rawPredictionMarketAddress)
    ? rawPredictionMarketAddress
    : undefined
) as Address | undefined;

export const isMarketAddressConfigured = Boolean(predictionMarketAddress);
