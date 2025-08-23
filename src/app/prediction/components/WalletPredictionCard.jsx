import React, { useState, useEffect } from "react";
import WalletStats from "./WalletStats";
import HistoryTable from "./HistoryTable";
import { Line } from "react-chartjs-2";
import { Chart, LineController, LineElement, PointElement, LinearScale, Title, CategoryScale } from "chart.js";
import { ethers } from "ethers";

Chart.register(LineController, LineElement, PointElement, LinearScale, Title, CategoryScale);

// Smart Contract ABIs
const TOKEN_ABI = [
  "function balanceOf(address account) external view returns (uint256)",
  "function allowance(address owner, address spender) external view returns (uint256)",
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function decimals() external view returns (uint8)"
];

const PREDICTION_ABI = [
  "function placePrediction(uint256 amount, bool predictWin) external",
  "function getPlayerPredictions(address player) external view returns (uint256[])",
  "function getContractStats() external view returns (uint256, uint256, uint256, uint256, uint256)",
  "function minBet() external view returns (uint256)",
  "function maxBet() external view returns (uint256)"
];

// Contract addresses (replace with your deployed addresses)
const TOKEN_ADDRESS = "0x1DE498144F2A7A4c7D85d09C0B12999FD1a435c2";
const PREDICTION_ADDRESS = "0xbE4f17c041d16AA7eE3e09A97C85bB2757081A1d";

function extractShortResult(aiText) {
  const outcomeMatch = aiText.match(/Predicted Outcome:\s*(\w+)/i);
  const probMatch = aiText.match(/Win Probability:\s*([\d.]+%)/i);
  if (outcomeMatch && probMatch) {
    return `${outcomeMatch[1]} (${probMatch[1]})`;
  }
  if (outcomeMatch) return outcomeMatch[1];
  return aiText.split('\n')[0];
}

function getChartData(history) {
  const lastGames = history.slice(-10);
  return {
    labels: lastGames.map((h, idx) => `Game ${history.length - lastGames.length + idx + 1}`),
    datasets: [
      {
        label: "Result Number",
        data: lastGames.map(h => h.resultNumber),
        borderColor: "#681DDB",
        backgroundColor: "rgba(104,29,219,0.2)",
        tension: 0.3,
        fill: true,
        pointRadius: 4,
        pointBackgroundColor: lastGames.map(h => h.outcome === "Win" ? "#14D854" : "#d82633"),
      }
    ]
  };
}

export default function WalletPredictionCard({ wallet, history, suggestion, onAnalyze, analyzing }) {
  const [showDetail, setShowDetail] = useState(false);
  const [betAmount, setBetAmount] = useState("");
  const [isPlacingBet, setIsPlacingBet] = useState(false);
  const [walletConnected, setWalletConnected] = useState(false);
  const [tokenBalance, setTokenBalance] = useState("0");
  const [allowance, setAllowance] = useState("0");
  const [contracts, setContracts] = useState({ token: null, roulette: null });
  const [minBet, setMinBet] = useState(10);
  const [maxBet, setMaxBet] = useState(1000);
  
  const shortResult = suggestion ? extractShortResult(suggestion) : "";
  const chartData = getChartData(history);

  // Initialize contracts and check wallet connection
  useEffect(() => {
    initializeContracts();
    checkWalletConnection();
  }, []);

  // Update balance and allowance when wallet is connected
  useEffect(() => {
    if (walletConnected && contracts.token) {
      updateTokenInfo();
    }
  }, [walletConnected, contracts.token]);

  async function initializeContracts() {
    try {
      if (!window.ethereum) return;

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      
      const tokenContract = new ethers.Contract(TOKEN_ADDRESS, TOKEN_ABI, signer);
      const predictionContract = new ethers.Contract(PREDICTION_ADDRESS, PREDICTION_ABI, signer);
      
      setContracts({ token: tokenContract, roulette: predictionContract });
      
      // Get betting limits from correct ABI
      const minBetAmount = await predictionContract.minBet();
      const maxBetAmount = await predictionContract.maxBet();
      const decimals = await tokenContract.decimals();
      
      setMinBet(ethers.utils.formatUnits(minBetAmount, decimals));
      setMaxBet(ethers.utils.formatUnits(maxBetAmount, decimals));
      
    } catch (error) {
      console.error("Failed to initialize contracts:", error);
    }
  }

  async function checkWalletConnection() {
    try {
      if (!window.ethereum) return;
      
      const accounts = await window.ethereum.request({ method: "eth_accounts" });
      setWalletConnected(accounts.length > 0);
      
    } catch (error) {
      console.error("Failed to check wallet connection:", error);
    }
  }

  async function updateTokenInfo() {
    try {
      if (!contracts.token || !walletConnected) return;

      const accounts = await window.ethereum.request({ method: "eth_accounts" });
      const address = accounts[0];
      
      const balance = await contracts.token.balanceOf(address);
      const allowance = await contracts.token.allowance(address, PREDICTION_ADDRESS);
      const decimals = await contracts.token.decimals();
      
      setTokenBalance(ethers.utils.formatUnits(balance, decimals));
      setAllowance(ethers.utils.formatUnits(allowance, decimals));
      
    } catch (error) {
      console.error("Failed to update token info:", error);
    }
  }

  async function connectWallet() {
    try {
      if (!window.ethereum) {
        alert("Please install MetaMask or another Web3 wallet.");
        return;
      }
      
      await window.ethereum.request({ method: "eth_requestAccounts" });
      setWalletConnected(true);
      await initializeContracts();
      
    } catch (error) {
      console.error("Failed to connect wallet:", error);
      alert("Failed to connect wallet: " + error.message);
    }
  }

  async function approveTokens() {
    try {
      if (!contracts.token || !betAmount) return;

      setIsPlacingBet(true);
      const decimals = await contracts.token.decimals();
      const amount = ethers.utils.parseUnits(betAmount, decimals);
      
      const tx = await contracts.token.approve(PREDICTION_ADDRESS, amount);
      await tx.wait();
      
      await updateTokenInfo();
      alert("Tokens approved successfully!");
      
    } catch (error) {
      console.error("Failed to approve tokens:", error);
      alert("Failed to approve tokens: " + error.message);
    } finally {
      setIsPlacingBet(false);
    }
  }

  async function placeBet(predictWin) {
    try {
      if (!contracts.roulette || !betAmount) {
        alert("Please enter a valid bet amount.");
        return;
      }

      if (!walletConnected) {
        await connectWallet();
        return;
      }

      const betAmountNum = parseFloat(betAmount);
      if (isNaN(betAmountNum) || betAmountNum <= 0) {
        alert("Please enter a valid bet amount.");
        return;
      }

      if (betAmountNum < parseFloat(minBet) || betAmountNum > parseFloat(maxBet)) {
        alert(`Bet amount must be between ${minBet} and ${maxBet} APTC.`);
        return;
      }

      if (parseFloat(tokenBalance) < betAmountNum) {
        alert("Insufficient APTC token balance.");
        return;
      }

      setIsPlacingBet(true);

      const decimals = await contracts.token.decimals();
      const amount = ethers.utils.parseUnits(betAmount, decimals);

      // Check if approval is needed
      if (parseFloat(allowance) < betAmountNum) {
        alert("Approving tokens first...");
        const approveTx = await contracts.token.approve(PREDICTION_ADDRESS, amount);
        await approveTx.wait();
        await updateTokenInfo();
      }

      // Use correct function name for prediction contract
      let tx;
      try {
        tx = await contracts.roulette.placePrediction(amount, predictWin, {
          gasLimit: 300000
        });
      } catch (err) {
        tx = await contracts.roulette.placePrediction(amount, predictWin);
      }
      const receipt = await tx.wait();

      if (receipt.status === 0) {
        throw new Error("Transaction reverted. Your bet was not placed. Please check contract requirements (min/max bet, allowance, balance) and try again.");
      }

      alert(`Bet placed successfully!\nPrediction: ${predictWin ? "Win" : "Loss"}\nAmount: ${betAmount} APTC`);

      await updateTokenInfo();
      setBetAmount("");

    } catch (error) {
      console.error("Failed to place bet:", error);
      alert("Failed to place bet: " + (error?.message || error));
    } finally {
      setIsPlacingBet(false);
    }
  }

  return (
    <div className="mb-8 p-6 bg-gray-800 rounded-lg shadow">
      <div className="font-mono text-yellow-300 text-lg mb-2 break-all">{wallet}</div>
      <WalletStats history={history} />
      
      {/* Wallet Connection Status */}
      <div className="mb-4 p-3 bg-gray-700 rounded">
        {!walletConnected ? (
          <div className="text-center">
            <button
              onClick={connectWallet}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
              Connect Wallet
            </button>
          </div>
        ) : (
          <div className="text-sm text-gray-200">
            <div>✅ Wallet Connected</div>
            <div>APTC Balance: {parseFloat(tokenBalance).toFixed(4)}</div>
            {/* <div>Approved: {parseFloat(allowance).toFixed(4)} APTC</div> */}
            <div className="text-xs text-gray-400 mt-1">
              Bet Range: {minBet} - {maxBet} APTC
            </div>
          </div>
        )}
      </div>
      
      <button
        className={`mt-3 px-5 py-2 rounded bg-purple-700 text-white font-semibold transition hover:bg-purple-800 disabled:opacity-50`}
        onClick={onAnalyze}
        disabled={analyzing}
      >
        {suggestion ? "Refresh AI Suggestion" : "Get AI Suggestion"}
      </button>
      
      <div className="my-4 text-white italic flex items-center gap-2">
        {suggestion && (
          <>
            <span>
              <b>AI Result:</b> {shortResult}
            </span>
            <button
              className="ml-2 px-2 py-1 text-xs bg-gray-700 rounded hover:bg-gray-600"
              onClick={() => setShowDetail(v => !v)}
            >
              {showDetail ? "Hide Details" : "Show Details"}
            </button>
          </>
        )}
      </div>
      
      {showDetail && suggestion && (
        <div className="mt-2 p-3 bg-gray-900 rounded text-gray-200 text-sm whitespace-pre-line">
          {suggestion}
        </div>
      )}
      
      {/* Player Results Graph */}
      <div className="mb-6">
        <div className="text-white font-semibold mb-2">Last Game Results</div>
        <Line
          data={chartData}
          options={{
            responsive: true,
            plugins: {
              legend: { display: false },
              title: { display: false }
            },
            scales: {
              x: { ticks: { color: "#fff" }, grid: { color: "#333" } },
              y: { ticks: { color: "#fff" }, grid: { color: "#333" }, beginAtZero: true }
            }
          }}
          height={120}
        />
      </div>
      
      {/* Betting Interface */}
      <div className="mb-4 p-4 bg-gray-700 rounded">
        <div className="text-white font-semibold mb-3">Place Your Bet</div>
        
        <div className="flex gap-2 mb-4 items-center flex-wrap">
          <input
            type="number"
            min={minBet}
            max={maxBet}
            step="0.01"
            value={betAmount}
            onChange={e => setBetAmount(e.target.value)}
            placeholder={`Amount (${minBet}-${maxBet})`}
            className="px-3 py-2 rounded bg-gray-800 text-white w-40"
            disabled={isPlacingBet}
          />
          
          {parseFloat(allowance) < parseFloat(betAmount || "0") && betAmount && (
            <button
              onClick={approveTokens}
              disabled={isPlacingBet || !walletConnected}
              className="px-4 py-2 rounded bg-yellow-600 text-white hover:bg-yellow-700 transition disabled:opacity-50"
            >
              {isPlacingBet ? "Approving..." : "Approve Tokens"}
            </button>
          )}
          
          <button
            onClick={() => placeBet(true)}
            disabled={isPlacingBet || !walletConnected || !betAmount}
            className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700 transition disabled:opacity-50"
          >
            {isPlacingBet ? "Placing..." : "Bet Win"}
          </button>
          
          <button
            onClick={() => placeBet(false)}
            disabled={isPlacingBet || !walletConnected || !betAmount}
            className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 transition disabled:opacity-50"
          >
            {isPlacingBet ? "Placing..." : "Bet Loss"}
          </button>
        </div>
        
        {!walletConnected && (
          <p className="text-yellow-400 text-sm">
            Please connect your wallet to place bets
          </p>
        )}
      </div>

      <HistoryTable history={history} />
    </div>
  );
}