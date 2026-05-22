import fs from "node:fs";
import path from "node:path";
import { formatEther, parseUnits } from "ethers";
import { network } from "hardhat";

const AMOY_CHAIN_ID = 80002n;
const LOCAL_CHAIN_ID = 31337n;

const SAMPLE_MARKETS = [
  {
    question: "2028년 대통령 선거 승자 예측",
    description:
      "후보 A 또는 후보 B에 USDC로 YES/NO 포지션을 발행하고 결과 확정 후 보상을 청구하는 예측시장입니다.",
    category: "Politics",
    outcomeYes: "후보 A",
    outcomeNo: "후보 B",
    days: 90,
  },
  {
    question: "바이에른 뮌헨이 2026 UEFA 챔피언스리그에서 우승할까?",
    description: "김민재 선수가 소속된 바이에른 뮌헨의 챔피언스리그 우승 여부를 예측합니다.",
    category: "Sports",
    outcomeYes: "우승한다",
    outcomeNo: "우승하지 않는다",
    days: 60,
  },
  {
    question: "2026년 말 비트코인 가격이 $150,000를 넘을까?",
    description: "2026년 12월 31일 기준 BTC/USD 종가가 $150,000 이상인지 예측합니다.",
    category: "Crypto",
    outcomeYes: "$150K 이상",
    outcomeNo: "$150K 미만",
    days: 45,
  },
  {
    question: "2026 FIFA 월드컵에서 대한민국이 16강에 진출할까?",
    description: "본선 토너먼트 16강 진출 여부를 예측합니다.",
    category: "Sports",
    outcomeYes: "16강 진출",
    outcomeNo: "16강 탈락",
    days: 120,
  },
];

async function main() {
  const conn = await network.getOrCreate();
  const { ethers } = conn;
  const networkName = conn.networkName;

  const signers = await ethers.getSigners();
  const deployer = signers[0];
  if (!deployer) {
    throw new Error(
      "배포용 계정이 없습니다. `.env`에 PRIVATE_KEY를 설정하거나 `npx hardhat node` 후 localhost로 배포하세요.",
    );
  }

  const chain = await ethers.provider.getNetwork();
  console.log("배포 계정:", deployer.address);
  console.log("네트워크:", networkName, `(chainId ${chain.chainId})`);

  if (networkName === "amoy") {
    const balance = await deployer.provider.getBalance(deployer.address);
    if (balance < parseUnits("0.08", "ether")) {
      throw new Error(
        `Amoy POL 부족 (약 ${formatEther(balance)} POL). https://faucet.polygon.technology 에서 POL을 받은 뒤 다시 실행하세요.`,
      );
    }
  }

  let usdcAddress: string;

  if (networkName === "localhost" || networkName === "amoy" || networkName === "hardhat") {
    console.log("\n[1/3] MockUSDC 배포 중...");
    const mockUsdc = await ethers.deployContract("MockUSDC");
    await mockUsdc.waitForDeployment();
    usdcAddress = await mockUsdc.getAddress();
    console.log("MockUSDC:", usdcAddress);

    if (networkName !== "hardhat") {
      const mintTx = await mockUsdc.mint(deployer.address, parseUnits("10000", 6));
      await mintTx.wait();
      console.log("테스트 USDC 10,000 발행 완료");
    }
  } else {
    usdcAddress = "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174";
    console.log("Polygon USDC 사용:", usdcAddress);
  }

  console.log("\n[2/3] PolyPredict 배포 중...");
  const polyPredict = await ethers.deployContract("PolyPredict", [usdcAddress]);
  await polyPredict.waitForDeployment();
  const polyPredictAddress = await polyPredict.getAddress();
  console.log("PolyPredict:", polyPredictAddress);

  console.log("\n[3/3] PoolBinaryMarket 배포 중...");
  const poolMarket = await ethers.deployContract("PoolBinaryMarket", [usdcAddress]);
  await poolMarket.waitForDeployment();
  const poolMarketAddress = await poolMarket.getAddress();
  console.log("PoolBinaryMarket:", poolMarketAddress);

  console.log("\n[시장 생성] PolyPredict 샘플 시장...");
  for (const market of SAMPLE_MARKETS) {
    const deadline = Math.floor(Date.now() / 1000) + market.days * 24 * 60 * 60;
    const tx = await polyPredict.createMarket(
      market.question,
      market.description,
      market.category,
      market.outcomeYes,
      market.outcomeNo,
      deadline,
    );
    await tx.wait();
    console.log(`  ✓ ${market.question}`);
  }

  const marketCount = await polyPredict.marketCount();
  console.log(`총 ${marketCount}개 시장 생성 완료`);

  const chainId =
    networkName === "amoy"
      ? AMOY_CHAIN_ID
      : networkName === "localhost" || networkName === "hardhat"
        ? LOCAL_CHAIN_ID
        : chain.chainId;

  const amoyRpc =
    process.env.AMOY_RPC_URL?.trim() || "https://rpc-amoy.polygon.technology";

  const envPath = path.join(process.cwd(), ".env");
  const envBody =
    `VITE_POLY_PREDICT_ADDRESS=${polyPredictAddress}\n` +
    `VITE_USDC_ADDRESS=${usdcAddress}\n` +
    `VITE_POOL_MARKET_ADDRESS=${poolMarketAddress}\n` +
    `VITE_CHAIN_ID=${chainId}\n` +
    (networkName === "amoy" ? `VITE_AMOY_RPC_URL=${amoyRpc}\n` : "") +
    `VITE_WALLETCONNECT_PROJECT_ID=demo\n` +
    `VITE_DEMO_ONLY=0\n`;

  if (process.env.SKIP_FRONTEND_ENV !== "1") {
    fs.writeFileSync(envPath, envBody, "utf8");
    console.log("\n.env 파일에 저장:", envPath);
  }

  console.log("\n==============================");
  console.log("프론트엔드 .env");
  console.log("==============================");
  console.log(envBody);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
