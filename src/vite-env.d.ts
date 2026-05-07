/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_WALLETCONNECT_PROJECT_ID?: string;
  readonly VITE_PREDICTION_MARKET_ADDRESS?: string;
  readonly VITE_CHAIN_ID?: string;
  readonly VITE_SEPOLIA_RPC_URL?: string;
  readonly VITE_ADMIN_ADDRESS?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
