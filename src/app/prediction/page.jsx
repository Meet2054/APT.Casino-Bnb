"use client"
import React, { useState } from "react";
import WalletPredictionCard from "@/app/prediction/components/WalletPredictionCard";

// Demo betting data
const demoData = [
  {
    "wallet": "0xFF9582E3898599D2cF0Abdc06321789dc345e529",
    "betNumber": 17,
    "betAmount": 2.5,
    "resultNumber": 17,
    "resultColor": "Black",
    "outcome": "Win",
    "payout": 87.5,
    "timestamp": "2025-08-23T10:15:30Z"
  },
  {
    "wallet": "0xFF9582E3898599D2cF0Abdc06321789dc345e529",
    "betNumber": "Red",
    "betAmount": 5.0,
    "resultNumber": 8,
    "resultColor": "Black",
    "outcome": "Lose",
    "payout": 0,
    "timestamp": "2025-08-23T10:18:20Z"
  },
  {
    "wallet": "0xFF9582E3898599D2cF0Abdc06321789dc345e529",
    "betNumber": "Black",
    "betAmount": 3.0,
    "resultNumber": 29,
    "resultColor": "Black",
    "outcome": "Win",
    "payout": 6.0,
    "timestamp": "2025-08-23T10:21:45Z"
  },
  {
    "wallet": "0xFF9582E3898599D2cF0Abdc06321789dc345e529",
    "betNumber": 7,
    "betAmount": 1.0,
    "resultNumber": 21,
    "resultColor": "Red",
    "outcome": "Lose",
    "payout": 0,
    "timestamp": "2025-08-23T10:25:00Z"
  },
  {
    "wallet": "0xFF9582E3898599D2cF0Abdc06321789dc345e529",
    "betNumber": "Even",
    "betAmount": 4.0,
    "resultNumber": 18,
    "resultColor": "Red",
    "outcome": "Win",
    "payout": 8.0,
    "timestamp": "2025-08-23T10:28:40Z"
  },
  {
    "wallet": "0x9056c660ba12e88bf0967d8f1e0E2ffA351c810A",
    "betNumber": 12,
    "betAmount": 2.0,
    "resultNumber": 12,
    "resultColor": "Red",
    "outcome": "Win",
    "payout": 70.0,
    "timestamp": "2025-08-23T10:30:11Z"
  },
  {
    "wallet": "0x9056c660ba12e88bf0967d8f1e0E2ffA351c810A",
    "betNumber": "Black",
    "betAmount": 3.5,
    "resultNumber": 14,
    "resultColor": "Red",
    "outcome": "Lose",
    "payout": 0,
    "timestamp": "2025-08-23T10:32:55Z"
  },
  {
    "wallet": "0x9056c660ba12e88bf0967d8f1e0E2ffA351c810A",
    "betNumber": "Odd",
    "betAmount": 4.0,
    "resultNumber": 27,
    "resultColor": "Red",
    "outcome": "Win",
    "payout": 8.0,
    "timestamp": "2025-08-23T10:36:40Z"
  },
  {
    "wallet": "0x9056c660ba12e88bf0967d8f1e0E2ffA351c810A",
    "betNumber": 0,
    "betAmount": 1.5,
    "resultNumber": 19,
    "resultColor": "Red",
    "outcome": "Lose",
    "payout": 0,
    "timestamp": "2025-08-23T10:40:15Z"
  },
  {
    "wallet": "0x9056c660ba12e88bf0967d8f1e0E2ffA351c810A",
    "betNumber": "Red",
    "betAmount": 2.0,
    "resultNumber": 3,
    "resultColor": "Red",
    "outcome": "Win",
    "payout": 4.0,
    "timestamp": "2025-08-23T10:42:50Z"
  }
];

// Group data by wallet
function groupByWallet(data) {
  const grouped = {};
  data.forEach(item => {
    if (!grouped[item.wallet]) grouped[item.wallet] = [];
    grouped[item.wallet].push(item);
  });
  return grouped;
}

// Calculate stats for each wallet
function getStats(history) {
  const total = history.length;
  const wins = history.filter(h => h.outcome === "Win").length;
  const losses = total - wins;
  const winRate = total ? (wins / total * 100).toFixed(1) : 0;
  const maxWin = Math.max(...history.map(h => h.payout), 0);
  return { total, wins, losses, winRate, maxWin };
}

// Gemini API call (async)
async function getGeminiSuggestion(wallet, history) {
  // Directly set your API key here
  const apiKey = "AIzaSyAlxEUr-CvEbRA5S9jC6RQrczL5_MLFBMU";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
  const prompt = `Analyze this roulette betting history for wallet ${wallet}:\n${JSON.stringify(history)}\nGive a short suggestion: Will this player win or lose next, and what is their win probability in percent? If their max win is high, keep the win probability lower.`;

  const body = {
    contents: [
      {
        parts: [
          { text: prompt }
        ]
      }
    ]
  };

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    const data = await res.json();
    // Gemini returns suggestion in data.candidates[0].content.parts[0].text
    return data?.candidates?.[0]?.content?.parts?.[0]?.text || "No suggestion";
  } catch (err) {
    return "AI suggestion unavailable";
  }
}

export default function PredictionMarket() {
  const [suggestions, setSuggestions] = useState({});
  const grouped = groupByWallet(demoData);

  // Fetch AI suggestions for each wallet
  const handleAnalyze = async (wallet) => {
    setSuggestions(s => ({ ...s, [wallet]: "Analyzing..." }));
    const suggestion = await getGeminiSuggestion(wallet, grouped[wallet]);
    setSuggestions(s => ({ ...s, [wallet]: suggestion }));
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-900 rounded-xl shadow-lg">
      <h2 className="text-3xl mt-28 font-bold text-white mb-8 text-center">Prediction Marketplace</h2>
      {Object.entries(grouped).map(([wallet, history]) => (
        <WalletPredictionCard
          key={wallet}
          wallet={wallet}
          history={history}
          suggestion={suggestions[wallet]}
          onAnalyze={() => handleAnalyze(wallet)}
          analyzing={suggestions[wallet] === "Analyzing..."}
        />
      ))}
    </div>
  );
}