import { expect } from "chai";
import { network } from "hardhat";

const { ethers } = await network.create();

const defaultMarket = {
  title: "2028년 대통령 선거 승자 예측",
  description: "후보 A 또는 후보 B에 ETH를 베팅하고 결과 확정 후 보상을 청구하는 예측시장입니다.",
  category: "Politics",
  outcomeA: "후보 A",
  outcomeB: "후보 B",
};

async function deployPredictionMarket() {
  const [owner, alice, bob, carol] = await ethers.getSigners();
  const predictionMarket = await ethers.deployContract("PredictionMarket");
  await predictionMarket.waitForDeployment();

  return { predictionMarket, owner, alice, bob, carol };
}

async function createDefaultMarket(predictionMarket: Awaited<ReturnType<typeof ethers.deployContract>>) {
  await predictionMarket.createMarket(
    defaultMarket.title,
    defaultMarket.description,
    defaultMarket.category,
    defaultMarket.outcomeA,
    defaultMarket.outcomeB,
  );
}

describe("PredictionMarket", function () {
  it("allows only the owner to create a market", async function () {
    const { predictionMarket, owner, alice } = await deployPredictionMarket();

    await expect(
      predictionMarket
        .connect(alice)
        .createMarket("Title", "Description", "Category", "Outcome A", "Outcome B"),
    )
      .to.be.revertedWithCustomError(predictionMarket, "OwnableUnauthorizedAccount")
      .withArgs(alice.address);

    await expect(
      predictionMarket
        .connect(owner)
        .createMarket("Title", "Description", "Category", "Outcome A", "Outcome B"),
    )
      .to.emit(predictionMarket, "MarketCreated")
      .withArgs(0n, "Title");
  });

  it("increments marketCount", async function () {
    const { predictionMarket } = await deployPredictionMarket();

    expect(await predictionMarket.marketCount()).to.equal(0n);

    await createDefaultMarket(predictionMarket);

    expect(await predictionMarket.marketCount()).to.equal(1n);
  });

  it("returns market data from getMarket", async function () {
    const { predictionMarket } = await deployPredictionMarket();

    await createDefaultMarket(predictionMarket);

    const market = await predictionMarket.getMarket(0);

    expect(market[0]).to.equal(defaultMarket.title);
    expect(market[1]).to.equal(defaultMarket.description);
    expect(market[2]).to.equal(defaultMarket.category);
    expect(market[3]).to.equal(defaultMarket.outcomeA);
    expect(market[4]).to.equal(defaultMarket.outcomeB);
    expect(market[5]).to.equal(0n);
    expect(market[6]).to.equal(0n);
    expect(market[7]).to.equal(false);
    expect(market[8]).to.equal(0n);
  });

  it("increases poolA and poolB when users place bets", async function () {
    const { predictionMarket, alice, bob } = await deployPredictionMarket();

    await createDefaultMarket(predictionMarket);
    await predictionMarket.connect(alice).placeBet(0, 0, { value: ethers.parseEther("1") });
    await predictionMarket.connect(bob).placeBet(0, 1, { value: ethers.parseEther("2") });

    const market = await predictionMarket.getMarket(0);

    expect(market[5]).to.equal(ethers.parseEther("1"));
    expect(market[6]).to.equal(ethers.parseEther("2"));
  });

  it("returns user bet amounts from getUserBet", async function () {
    const { predictionMarket, alice } = await deployPredictionMarket();

    await createDefaultMarket(predictionMarket);
    await predictionMarket.connect(alice).placeBet(0, 0, { value: ethers.parseEther("1") });

    expect(await predictionMarket.getUserBet(0, alice.address, 0)).to.equal(ethers.parseEther("1"));
    expect(await predictionMarket.getUserBet(0, alice.address, 1)).to.equal(0n);
  });

  it("rejects zero ETH bets", async function () {
    const { predictionMarket, alice } = await deployPredictionMarket();

    await createDefaultMarket(predictionMarket);

    await expect(predictionMarket.connect(alice).placeBet(0, 0, { value: 0n })).to.be.revertedWith(
      "Bet amount must be greater than zero",
    );
  });

  it("rejects invalid outcomes", async function () {
    const { predictionMarket, alice } = await deployPredictionMarket();

    await createDefaultMarket(predictionMarket);

    await expect(
      predictionMarket.connect(alice).placeBet(0, 2, { value: ethers.parseEther("1") }),
    ).to.be.revertedWith("Invalid outcome");

    await expect(predictionMarket.resolveMarket(0, 2)).to.be.revertedWith("Invalid outcome");
  });

  it("allows only the owner to resolve a market", async function () {
    const { predictionMarket, alice } = await deployPredictionMarket();

    await createDefaultMarket(predictionMarket);

    await expect(predictionMarket.connect(alice).resolveMarket(0, 0))
      .to.be.revertedWithCustomError(predictionMarket, "OwnableUnauthorizedAccount")
      .withArgs(alice.address);

    await expect(predictionMarket.resolveMarket(0, 1))
      .to.emit(predictionMarket, "MarketResolved")
      .withArgs(0n, 1);
  });

  it("rejects bets after a market is resolved", async function () {
    const { predictionMarket, alice } = await deployPredictionMarket();

    await createDefaultMarket(predictionMarket);
    await predictionMarket.resolveMarket(0, 0);

    await expect(
      predictionMarket.connect(alice).placeBet(0, 0, { value: ethers.parseEther("1") }),
    ).to.be.revertedWith("Market already resolved");
  });

  it("allows a winner to claim winnings", async function () {
    const { predictionMarket, alice, bob } = await deployPredictionMarket();

    await createDefaultMarket(predictionMarket);
    await predictionMarket.connect(alice).placeBet(0, 0, { value: ethers.parseEther("1") });
    await predictionMarket.connect(bob).placeBet(0, 1, { value: ethers.parseEther("1") });
    await predictionMarket.resolveMarket(0, 0);

    await expect(predictionMarket.connect(alice).claimWinnings(0))
      .to.emit(predictionMarket, "WinningsClaimed")
      .withArgs(0n, alice.address, ethers.parseEther("2"));

    expect(await ethers.provider.getBalance(await predictionMarket.getAddress())).to.equal(0n);
  });

  it("rejects loser claims", async function () {
    const { predictionMarket, alice, bob } = await deployPredictionMarket();

    await createDefaultMarket(predictionMarket);
    await predictionMarket.connect(alice).placeBet(0, 0, { value: ethers.parseEther("1") });
    await predictionMarket.connect(bob).placeBet(0, 1, { value: ethers.parseEther("1") });
    await predictionMarket.resolveMarket(0, 0);

    await expect(predictionMarket.connect(bob).claimWinnings(0)).to.be.revertedWith(
      "No winnings to claim",
    );
  });

  it("rejects duplicate claims", async function () {
    const { predictionMarket, alice, bob } = await deployPredictionMarket();

    await createDefaultMarket(predictionMarket);
    await predictionMarket.connect(alice).placeBet(0, 0, { value: ethers.parseEther("1") });
    await predictionMarket.connect(bob).placeBet(0, 1, { value: ethers.parseEther("1") });
    await predictionMarket.resolveMarket(0, 0);
    await predictionMarket.connect(alice).claimWinnings(0);

    await expect(predictionMarket.connect(alice).claimWinnings(0)).to.be.revertedWith(
      "Winnings already claimed",
    );
  });

  it("distributes winnings proportionally", async function () {
    const { predictionMarket, alice, bob, carol } = await deployPredictionMarket();

    await createDefaultMarket(predictionMarket);
    await predictionMarket.connect(alice).placeBet(0, 0, { value: ethers.parseEther("1") });
    await predictionMarket.connect(bob).placeBet(0, 0, { value: ethers.parseEther("3") });
    await predictionMarket.connect(carol).placeBet(0, 1, { value: ethers.parseEther("2") });
    await predictionMarket.resolveMarket(0, 0);

    await expect(predictionMarket.connect(alice).claimWinnings(0))
      .to.emit(predictionMarket, "WinningsClaimed")
      .withArgs(0n, alice.address, ethers.parseEther("1.5"));
    await expect(predictionMarket.connect(bob).claimWinnings(0))
      .to.emit(predictionMarket, "WinningsClaimed")
      .withArgs(0n, bob.address, ethers.parseEther("4.5"));

    expect(await ethers.provider.getBalance(await predictionMarket.getAddress())).to.equal(0n);
  });
});
