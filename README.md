# Polymarket Lite dApp

React + Vite + TypeScript 기반의 블록체인 예측시장 dApp입니다. 프론트 UI와 지갑 연동(RainbowKit + wagmi)은 유지하고, 온체인 로직은 **PolyPredict**(CTF 스타일 YES/NO ERC-1155 + USDC 담보)를 사용합니다.

## 실행 구조

- Smart contract: **Polygon Amoy** testnet (chainId `80002`)
- Collateral: **MockUSDC** (테스트넷) / Polygon USDC (메인넷 배포 시)
- Core contract: **PolyPredict** (`mintShares`, `burnShares`, `resolveMarket`, `claimWinnings`)
- Frontend: Vercel
- Wallet: MetaMask 또는 WalletConnect 호환 지갑

## Frontend Env

```bash
VITE_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id
VITE_POLY_PREDICT_ADDRESS=0xYourPolyPredictAddress
VITE_USDC_ADDRESS=0xYourMockUsdcAddress
VITE_CHAIN_ID=80002
VITE_AMOY_RPC_URL=https://rpc-amoy.polygon.technology
```

`PRIVATE_KEY`는 절대 `VITE_` 접두사를 붙이지 마세요.

## Contract Deploy

`.env`에 배포용 비공개 값 설정:

```bash
AMOY_RPC_URL=https://rpc-amoy.polygon.technology
PRIVATE_KEY=0xYourDeploymentPrivateKey
```

배포 계정에는 Amoy **POL**이 필요합니다. ([Polygon faucet](https://faucet.polygon.technology))

```bash
npm install
npm run compile
npm run deploy:amoy
```

배포가 끝나면 `.env`에 `VITE_POLY_PREDICT_ADDRESS`, `VITE_USDC_ADDRESS`가 자동 기록됩니다.

로컬 Hardhat 노드:

```bash
npx hardhat node
npm run deploy:local
```

## Commands

```bash
npm run dev          # 프론트 개발 서버
npm run build        # 타입체크 + Vite 빌드
npm test             # PolyPredict 단위 테스트
npm run compile      # Solidity 컴파일
```

## CTF 참여 흐름

1. MockUSDC `mint` 또는 배포 시 지급된 USDC 보유
2. `approve(PolyPredict, amount)`
3. `mintShares(marketId, amount)` → YES·NO 토큰 동시 발행
4. 관리자 `resolveMarket(marketId, YES|NO)`
5. 승리 토큰 보유자 `claimWinnings(marketId)` → USDC 1:1 수령

## Network UX

지갑이 Polygon Amoy가 아니면 상단 배너에서 네트워크 전환을 안내합니다.
