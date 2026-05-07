import { network } from "hardhat";

const SEPOLIA_CHAIN_ID = 11155111n;

const initialMarket = {
  title: "2028년 대통령 선거 승자 예측",
  description: "후보 A 또는 후보 B에 ETH를 베팅하고 결과 확정 후 보상을 청구하는 예측시장입니다.",
  category: "Politics",
  outcomeA: "후보 A",
  outcomeB: "후보 B",
};

const missingDeploymentEnv = ["SEPOLIA_RPC_URL", "PRIVATE_KEY"].filter(
  (name) => !process.env[name],
);

if (missingDeploymentEnv.length > 0) {
  throw new Error(
    `Missing required deployment env: ${missingDeploymentEnv.join(", ")}. Set these in local .env only.`,
  );
}

const { ethers } = await network.create();
const [deployer] = await ethers.getSigners();
const chain = await ethers.provider.getNetwork();

if (chain.chainId !== SEPOLIA_CHAIN_ID) {
  throw new Error(
    `Refusing to deploy PredictionMarket to chainId ${chain.chainId}. Use Sepolia (${SEPOLIA_CHAIN_ID}).`,
  );
}

console.log(`Deploying PredictionMarket to Sepolia with ${deployer.address}`);

const predictionMarket = await ethers.deployContract("PredictionMarket");
await predictionMarket.waitForDeployment();

const address = await predictionMarket.getAddress();
console.log(`PredictionMarket deployed to: ${address}`);

const createMarketTx = await predictionMarket.createMarket(
  initialMarket.title,
  initialMarket.description,
  initialMarket.category,
  initialMarket.outcomeA,
  initialMarket.outcomeB,
);
await createMarketTx.wait();

console.log(`Initial market created: ${initialMarket.title}`);
console.log("");
console.log("Use these public frontend env values:");
console.log(`VITE_PREDICTION_MARKET_ADDRESS=${address}`);
console.log(`VITE_CHAIN_ID=${SEPOLIA_CHAIN_ID}`);
