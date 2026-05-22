import { network } from "hardhat";

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
  {
    question: "Apple이 2026년에 AR 안경을 출시할까?",
    description: "소비자 대상 AR 글래스 공식 출시 여부를 예측합니다.",
    category: "Tech",
    outcomeYes: "출시한다",
    outcomeNo: "출시하지 않는다",
    days: 180,
  },
];

async function main() {
  const conn = await network.getOrCreate();
  const { ethers } = conn;

  const polyAddress = process.env.VITE_POLY_PREDICT_ADDRESS?.trim();
  if (!polyAddress) {
    throw new Error("VITE_POLY_PREDICT_ADDRESS가 .env에 없습니다. 먼저 deploy를 실행하세요.");
  }

  const polyPredict = await ethers.getContractAt("PolyPredict", polyAddress);
  const owner = await polyPredict.owner();
  const [signer] = await ethers.getSigners();

  if (signer.address.toLowerCase() !== owner.toLowerCase()) {
    throw new Error(`owner 계정이 아닙니다. owner=${owner}, signer=${signer.address}`);
  }

  const existing = await polyPredict.marketCount();
  console.log(`현재 시장 수: ${existing}`);

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
    console.log(`✓ 생성: ${market.question}`);
  }

  const total = await polyPredict.marketCount();
  console.log(`\n완료. 총 시장 수: ${total}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
