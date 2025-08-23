// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract LittlePredictionGame is Ownable, ReentrancyGuard {
    IERC20 public token;
    uint256 public minBet = 10 * 10**18; // 10 tokens
    uint256 public maxBet = 1000 * 10**18; // 1,000 tokens
    address public treasury = 0xFF9582E3898599D2cF0Abdc06321789dc345e529;
    uint256 public treasuryFeeRate = 5; // 0.5%

    struct Prediction {
        address player;
        uint256 amount;
        bool predictWin; // true for win, false for loss
        uint256 round;
        bool resolved;
        bool won;
        uint256 payout;
    }

    mapping(uint256 => Prediction) public predictions;
    mapping(address => uint256[]) public playerPredictions;
    uint256 public nextPredictionId = 1;
    uint256 public currentRound = 1;

    event PredictionPlaced(
        uint256 indexed predictionId,
        address indexed player,
        uint256 amount,
        bool predictWin,
        uint256 round
    );
    event PredictionResolved(
        uint256 indexed predictionId,
        address indexed player,
        bool won,
        uint256 payout
    );
    event TreasuryChanged(address oldTreasury, address newTreasury);
    event BetLimitsChanged(uint256 minBet, uint256 maxBet);
    event TreasuryFeeChanged(uint256 oldFee, uint256 newFee);

    constructor(address _token) Ownable(msg.sender) {
        require(_token != address(0), "Invalid token address");
        token = IERC20(_token);
        // All other values are hardcoded above
    }

    function placePrediction(
        uint256 amount,
        bool predictWin
    ) external nonReentrant {
        require(amount >= minBet, "Bet below min");
        require(amount <= maxBet, "Bet above max");
        require(token.balanceOf(msg.sender) >= amount, "Insufficient balance");
        require(
            token.allowance(msg.sender, address(this)) >= amount,
            "Insufficient allowance"
        );

        require(
            token.transferFrom(msg.sender, address(this), amount),
            "Token transfer failed"
        );

        predictions[nextPredictionId] = Prediction({
            player: msg.sender,
            amount: amount,
            predictWin: predictWin,
            round: currentRound,
            resolved: false,
            won: false,
            payout: 0
        });
        playerPredictions[msg.sender].push(nextPredictionId);

        emit PredictionPlaced(
            nextPredictionId,
            msg.sender,
            amount,
            predictWin,
            currentRound
        );
        nextPredictionId++;
    }

    // Owner resolves prediction after round is finished
    function resolvePrediction(
        uint256 predictionId,
        bool actualWin
    ) external onlyOwner {
        Prediction storage pred = predictions[predictionId];
        require(!pred.resolved, "Already resolved");

        pred.resolved = true;
        pred.won = (pred.predictWin == actualWin);

        if (pred.won) {
            uint256 grossPayout = pred.amount * 2;
            uint256 treasuryFee = (grossPayout * treasuryFeeRate) / 1000;
            uint256 netPayout = grossPayout - treasuryFee;
            pred.payout = netPayout;
            require(token.transfer(pred.player, netPayout), "Payout failed");
            require(
                token.transfer(treasury, treasuryFee),
                "Treasury fee failed"
            );
        } else {
            pred.payout = 0;
            // Tokens stay in contract for future payouts
        }

        emit PredictionResolved(
            predictionId,
            pred.player,
            pred.won,
            pred.payout
        );
    }

    function nextGameRound() external onlyOwner {
        currentRound++;
    }

    // Emergency withdrawal
    function emergencyWithdraw(uint256 amount) external onlyOwner {
        require(token.transfer(owner(), amount), "Withdraw failed");
    }

    // Get player's predictions
    function getPlayerPredictions(
        address player
    ) external view returns (uint256[] memory) {
        return playerPredictions[player];
    }

}
