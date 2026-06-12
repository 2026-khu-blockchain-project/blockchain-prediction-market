import { network } from "hardhat";

async function main() {
  const conn = await network.getOrCreate();
  const { ethers } = conn;
  const userAddress = "0x2fcC7DC259373b6B9094f36833Cfa351b043a71e";
  const mockUsdcAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

  console.log(`[시작] 사용자 지갑 지원 스크립트`);
  console.log(`대상 사용자 주소: ${userAddress}`);

  const signers = await ethers.getSigners();
  const deployer = signers[0];

  // 1. Send 100 ETH to user for gas fees
  console.log(`\n1. 가스비용 ETH 전송 중...`);
  const ethAmount = ethers.parseEther("100");
  const tx = await deployer.sendTransaction({
    to: userAddress,
    value: ethAmount,
  });
  await tx.wait();
  console.log(`✓ 100 ETH 전송 완료!`);

  // 2. Mint 10,000 MockUSDC to user
  console.log(`\n2. 테스트용 MockUSDC 10,000개 발행 중...`);
  const mockUsdc = await ethers.getContractAt("MockUSDC", mockUsdcAddress);
  const usdcAmount = ethers.parseUnits("10000", 6);
  const mintTx = await mockUsdc.mint(userAddress, usdcAmount);
  await mintTx.wait();
  console.log(`✓ 10,000 USDC 발행 완료!`);

  console.log(`\n[완료] 사용자 주소 ${userAddress}에 가스비 ETH 및 MockUSDC 충전이 완료되었습니다.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
