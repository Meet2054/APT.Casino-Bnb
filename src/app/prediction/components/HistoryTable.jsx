import React from "react";

export default function HistoryTable({ history }) {
  return (
    <div className="mt-4 overflow-x-auto">
      <table className="min-w-full bg-gray-900 rounded text-sm">
        <thead>
          <tr className="text-gray-400">
            <th className="px-2 py-1">Bet</th>
            <th className="px-2 py-1">Amount</th>
            <th className="px-2 py-1">Result</th>
            <th className="px-2 py-1">Color</th>
            <th className="px-2 py-1">Outcome</th>
            <th className="px-2 py-1">Payout</th>
            <th className="px-2 py-1">Time</th>
          </tr>
        </thead>
        <tbody>
          {history.map((h, idx) => (
            <tr key={idx} className={h.outcome === "Win" ? "bg-green-950" : "bg-red-950"}>
              <td className="px-2 py-1">{h.betNumber}</td>
              <td className="px-2 py-1">{h.betAmount}</td>
              <td className="px-2 py-1">{h.resultNumber}</td>
              <td className="px-2 py-1">{h.resultColor}</td>
              <td className={`px-2 py-1 font-bold ${h.outcome === "Win" ? "text-green-400" : "text-red-400"}`}>{h.outcome}</td>
              <td className="px-2 py-1">{h.payout}</td>
              <td className="px-2 py-1">{new Date(h.timestamp).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
