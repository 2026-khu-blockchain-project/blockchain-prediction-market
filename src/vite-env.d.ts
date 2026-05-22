/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_WALLETCONNECT_PROJECT_ID?: string;
  readonly VITE_POLY_PREDICT_ADDRESS?: string;
  readonly VITE_PREDICTION_MARKET_ADDRESS?: string;
  readonly VITE_USDC_ADDRESS?: string;
  readonly VITE_POOL_MARKET_ADDRESS?: string;
  readonly VITE_DEMO_ONLY?: string;
  readonly VITE_CHAIN_ID?: string;
  readonly VITE_AMOY_RPC_URL?: string;
  readonly VITE_ADMIN_ADDRESS?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
