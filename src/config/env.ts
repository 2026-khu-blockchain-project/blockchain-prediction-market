import { type Address, isAddress } from 'viem';
import { hardhat, polygonAmoy } from 'wagmi/chains';

const FALLBACK_WALLETCONNECT_PROJECT_ID = 'demo';

const rawChainId = import.meta.env.VITE_CHAIN_ID?.trim();
const parsedChainId = rawChainId ? Number(rawChainId) : polygonAmoy.id;
const rawPolyPredictAddress = import.meta.env.VITE_POLY_PREDICT_ADDRESS?.trim();
const legacyMarketAddress = import.meta.env.VITE_PREDICTION_MARKET_ADDRESS?.trim();
const rawUsdcAddress = import.meta.env.VITE_USDC_ADDRESS?.trim();
const rawWalletConnectProjectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID?.trim();

export const configuredChainId = Number.isInteger(parsedChainId) ? parsedChainId : polygonAmoy.id;
export const useHardhatLocal = configuredChainId === hardhat.id;
export const appChain = useHardhatLocal ? hardhat : polygonAmoy;
export const appChainId = appChain.id;
export const appChainName = appChain.name;
export const isConfiguredForAppChain = configuredChainId === appChainId;
export const rpcUrl = useHardhatLocal
  ? 'http://127.0.0.1:8545'
  : import.meta.env.VITE_AMOY_RPC_URL?.trim() || 'https://rpc-amoy.polygon.technology';
/** @deprecated Use rpcUrl */
export const amoyRpcUrl = rpcUrl;

export const walletConnectProjectId =
  rawWalletConnectProjectId || FALLBACK_WALLETCONNECT_PROJECT_ID;

const resolvedPolyAddress = rawPolyPredictAddress || legacyMarketAddress;

export const polyPredictAddress = (
  resolvedPolyAddress && isAddress(resolvedPolyAddress) ? resolvedPolyAddress : undefined
) as Address | undefined;

export const usdcAddress = (
  rawUsdcAddress && isAddress(rawUsdcAddress) ? rawUsdcAddress : undefined
) as Address | undefined;

const rawPoolMarketAddress = import.meta.env.VITE_POOL_MARKET_ADDRESS?.trim();

export const poolMarketAddress = (
  rawPoolMarketAddress && isAddress(rawPoolMarketAddress) ? rawPoolMarketAddress : undefined
) as Address | undefined;

export const isPolyPredictConfigured = Boolean(polyPredictAddress && usdcAddress);
export const isPoolMarketConfigured = Boolean(poolMarketAddress && usdcAddress);

const demoOnlyRaw = import.meta.env.VITE_DEMO_ONLY?.trim().toLowerCase();
export const isDemoOnly =
  demoOnlyRaw === '1' || demoOnlyRaw === 'true' || demoOnlyRaw === 'yes';
