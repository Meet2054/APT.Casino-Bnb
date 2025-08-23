import React from "react";

function getStats(history) {
  const total = history.length;
  const wins = history.filter(h => h.outcome === "Win").length;
  const winRate = total ? (wins / total * 100).toFixed(1) : 0;
  const maxWin = Math.max(...history.map(h => h.payout), 0);
  return { total, wins, winRate, maxWin };
}

export default function WalletStats({ history }) {
  const stats = getStats(history);
  return (
    <div className="text-white mb-2 flex flex-wrap gap-4">
      <div>
        Win Rate: <span className="text-green-400">{stats.winRate}%</span>
      </div>
      <div>
        Total Bets: <span className="text-blue-300">{stats.total}</span>
      </div>
      <div>
        Max Win: <span className="text-red-400">{stats.maxWin}</span>
      </div>
    </div>
  );
}
