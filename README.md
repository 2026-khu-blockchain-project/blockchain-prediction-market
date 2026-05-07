# Polymarket Lite dApp

React + Vite + TypeScript 기반의 블록체인 예측시장 dApp입니다. 프론트는 Sepolia에
배포된 `PredictionMarket` 컨트랙트에서 시장 목록, 상세 정보, 포지션, 관리자 작업을
직접 조회하고 실행합니다.

## 실행 구조

- Smart contract: Sepolia testnet
- Frontend: Vercel
- Wallet: MetaMask 또는 WalletConnect 호환 지갑
- Chain ID: `11155111`

프론트 런타임은 localhost, Hardhat Local, `31337` 체인을 사용하지 않습니다.

## Frontend Env

프로젝트 루트의 `.env` 또는 Vercel Project Settings > Environment Variables에 아래
공개값만 설정합니다.

```bash
VITE_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id
VITE_PREDICTION_MARKET_ADDRESS=0xYourSepoliaPredictionMarketAddress
VITE_CHAIN_ID=11155111
VITE_SEPOLIA_RPC_URL=https://rpc.sepolia.org
```

- `VITE_WALLETCONNECT_PROJECT_ID`: RainbowKit/WalletConnect용 공개 Project ID
- `VITE_PREDICTION_MARKET_ADDRESS`: Sepolia에 배포된 `PredictionMarket` 주소
- `VITE_CHAIN_ID`: 반드시 Sepolia `11155111`
- `VITE_SEPOLIA_RPC_URL`: 브라우저 read 요청에 사용할 공개 Sepolia RPC

`PRIVATE_KEY`는 절대 `VITE_`로 만들지 말고, Vercel 프론트 환경변수에도 넣지 않습니다.

## Contract Deploy Env

컨트랙트 배포는 로컬 터미널에서만 아래 비공개 값을 사용합니다.

```bash
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY
PRIVATE_KEY=0xYourSepoliaDeploymentPrivateKey
```

배포 계정에는 Sepolia ETH가 필요합니다.

## Commands

```bash
npm install
npm run compile
npm run deploy:sepolia
npm run build
```

`npm run deploy:sepolia`가 완료되면 출력되는 값을 프론트/Vercel 환경변수에 반영합니다.

```bash
VITE_PREDICTION_MARKET_ADDRESS=0x...
VITE_CHAIN_ID=11155111
```

## Vercel Deploy

Vercel에는 공개 가능한 `VITE_` 값만 등록합니다.

```bash
VITE_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id
VITE_PREDICTION_MARKET_ADDRESS=0xYourSepoliaPredictionMarketAddress
VITE_CHAIN_ID=11155111
VITE_SEPOLIA_RPC_URL=https://rpc.sepolia.org
```

빌드 명령과 출력 디렉터리는 `vercel.json`에서 고정합니다.

```bash
npm run build
```

SPA 라우팅을 위해 모든 경로는 `/index.html`로 rewrite됩니다.

## Network UX

지갑이 Sepolia가 아닌 체인에 연결되어 있으면 상단 경고 배너가 표시되고, 사용자는
버튼으로 Sepolia 전환을 요청할 수 있습니다.
