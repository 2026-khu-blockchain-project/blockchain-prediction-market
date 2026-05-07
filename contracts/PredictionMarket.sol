// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract PredictionMarket is Ownable, ReentrancyGuard {
    struct Market {
        string title;
        string description;
        string category;
        string outcomeA;
        string outcomeB;
        uint256 poolA;
        uint256 poolB;
        bool resolved;
        uint8 winningOutcome;
    }

    uint256 public marketCount;

    mapping(uint256 => Market) private markets;
    mapping(uint256 => mapping(address => mapping(uint8 => uint256))) private userBets;
    mapping(uint256 => mapping(address => bool)) public claimed;

    event MarketCreated(uint256 indexed marketId, string title);
    event BetPlaced(uint256 indexed marketId, address indexed user, uint8 outcome, uint256 amount);
    event MarketResolved(uint256 indexed marketId, uint8 winningOutcome);
    event WinningsClaimed(uint256 indexed marketId, address indexed user, uint256 amount);

    constructor() Ownable(msg.sender) {}

    function createMarket(
        string calldata title,
        string calldata description,
        string calldata category,
        string calldata outcomeA,
        string calldata outcomeB
    ) external onlyOwner {
        uint256 marketId = marketCount;

        markets[marketId] = Market({
            title: title,
            description: description,
            category: category,
            outcomeA: outcomeA,
            outcomeB: outcomeB,
            poolA: 0,
            poolB: 0,
            resolved: false,
            winningOutcome: 0
        });

        marketCount = marketId + 1;

        emit MarketCreated(marketId, title);
    }

    function placeBet(uint256 marketId, uint8 outcome) external payable {
        Market storage market = _getExistingMarket(marketId);

        require(outcome < 2, "Invalid outcome");
        require(msg.value > 0, "Bet amount must be greater than zero");
        require(!market.resolved, "Market already resolved");

        if (outcome == 0) {
            market.poolA += msg.value;
        } else {
            market.poolB += msg.value;
        }

        userBets[marketId][msg.sender][outcome] += msg.value;

        emit BetPlaced(marketId, msg.sender, outcome, msg.value);
    }

    function resolveMarket(uint256 marketId, uint8 winningOutcome) external onlyOwner {
        Market storage market = _getExistingMarket(marketId);

        require(winningOutcome < 2, "Invalid outcome");
        require(!market.resolved, "Market already resolved");

        market.resolved = true;
        market.winningOutcome = winningOutcome;

        emit MarketResolved(marketId, winningOutcome);
    }

    function claimWinnings(uint256 marketId) external nonReentrant {
        Market storage market = _getExistingMarket(marketId);

        require(market.resolved, "Market is not resolved");
        require(!claimed[marketId][msg.sender], "Winnings already claimed");

        uint8 winningOutcome = market.winningOutcome;
        uint256 userWinningBet = userBets[marketId][msg.sender][winningOutcome];

        require(userWinningBet > 0, "No winnings to claim");

        uint256 totalPool = market.poolA + market.poolB;
        uint256 winningPool = winningOutcome == 0 ? market.poolA : market.poolB;
        uint256 payout = (totalPool * userWinningBet) / winningPool;

        claimed[marketId][msg.sender] = true;

        (bool success, ) = msg.sender.call{value: payout}("");
        require(success, "Transfer failed");

        emit WinningsClaimed(marketId, msg.sender, payout);
    }

    function getMarket(
        uint256 marketId
    )
        external
        view
        returns (
            string memory title,
            string memory description,
            string memory category,
            string memory outcomeA,
            string memory outcomeB,
            uint256 poolA,
            uint256 poolB,
            bool resolved,
            uint8 winningOutcome
        )
    {
        Market storage market = _getExistingMarket(marketId);

        return (
            market.title,
            market.description,
            market.category,
            market.outcomeA,
            market.outcomeB,
            market.poolA,
            market.poolB,
            market.resolved,
            market.winningOutcome
        );
    }

    function getUserBet(uint256 marketId, address user, uint8 outcome) external view returns (uint256) {
        _getExistingMarket(marketId);

        require(outcome < 2, "Invalid outcome");

        return userBets[marketId][user][outcome];
    }

    function _getExistingMarket(uint256 marketId) private view returns (Market storage) {
        require(marketId < marketCount, "Market does not exist");

        return markets[marketId];
    }
}
