import React, { useState, useEffect } from 'react';
import { useOrigin } from './OriginProvider';
import { useOriginGames } from '../hooks/useOriginGames';
import { toast } from 'react-toastify';

// Enhanced Betting Panel with Origin SDK features
const OriginBettingPanel = ({ gameType = 'roulette', onBetPlaced }) => {
  const { isInitialized, isGaslessAvailable, enableGasless } = useOrigin();
  const { 
    playRoulette, 
    playWheel, 
    playMines, 
    batchGameActions, 
    isLoading 
  } = useOriginGames();

  const [betAmount, setBetAmount] = useState('');
  const [betType, setBetType] = useState(0);
  const [betValue, setBetValue] = useState(0);
  const [useGasless, setUseGasless] = useState(true);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Auto-enable gasless transactions if available
  useEffect(() => {
    if (isInitialized && !isGaslessAvailable) {
      enableGasless().catch(console.warn);
    }
  }, [isInitialized, isGaslessAvailable, enableGasless]);

  // Handle bet placement
  const handlePlaceBet = async () => {
    if (!betAmount || parseFloat(betAmount) <= 0) {
      toast.error('Please enter a valid bet amount');
      return;
    }

    const amount = BigInt(parseFloat(betAmount) * 10 ** 18); // Convert to wei

    try {
      let result;

      switch (gameType) {
        case 'roulette':
          result = await playRoulette(betType, betValue, amount, { useGasless });
          break;
        case 'wheel':
          result = await playWheel(betType, betValue, amount, { useGasless });
          break;
        case 'mines':
          result = await playMines(betValue, amount, { useGasless });
          break;
        default:
          throw new Error('Invalid game type');
      }

      if (onBetPlaced) {
        onBetPlaced(result);
      }

      // Reset form
      setBetAmount('');
      setBetType(0);
      setBetValue(0);
    } catch (error) {
      console.error('Bet placement failed:', error);
    }
  };

  // Handle batch betting (multiple bets in one transaction)
  const handleBatchBet = async () => {
    if (!betAmount || parseFloat(betAmount) <= 0) {
      toast.error('Please enter a valid bet amount');
      return;
    }

    const amount = BigInt(parseFloat(betAmount) * 10 ** 18);

    try {
      const actions = [
        {
          contractType: 'roulette',
          functionName: 'placeBet',
          args: [betType, betValue, amount]
        },
        {
          contractType: 'wheel',
          functionName: 'placeBet',
          args: [betType, betValue, amount]
        }
      ];

      const result = await batchGameActions(actions, { useGasless });

      if (onBetPlaced) {
        onBetPlaced(result);
      }

      // Reset form
      setBetAmount('');
      setBetType(0);
      setBetValue(0);
    } catch (error) {
      console.error('Batch bet failed:', error);
    }
  };

  // Render game-specific options
  const renderGameOptions = () => {
    switch (gameType) {
      case 'roulette':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bet Type
              </label>
              <select
                value={betType}
                onChange={(e) => setBetType(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={0}>Single Number</option>
                <option value={1}>Red/Black</option>
                <option value={2}>Even/Odd</option>
                <option value={3}>High/Low</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bet Value
              </label>
              <input
                type="number"
                value={betValue}
                onChange={(e) => setBetValue(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter bet value"
              />
            </div>
          </div>
        );

      case 'wheel':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Risk Level
              </label>
              <select
                value={betType}
                onChange={(e) => setBetType(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={0}>Low Risk</option>
                <option value={1}>Medium Risk</option>
                <option value={2}>High Risk</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Segments
              </label>
              <input
                type="number"
                value={betValue}
                onChange={(e) => setBetValue(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Number of segments"
                min="8"
                max="24"
              />
            </div>
          </div>
        );

      case 'mines':
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Number of Mines
            </label>
            <input
              type="number"
              value={betValue}
              onChange={(e) => setBetValue(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Number of mines (1-24)"
              min="1"
              max="24"
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Enhanced Betting Panel
        </h3>
        <p className="text-sm text-gray-600">
          Powered by Camp Network Origin SDK
        </p>
      </div>

      {/* Origin SDK Status */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Origin SDK Status:</span>
          <span className={`px-2 py-1 text-xs rounded-full ${
            isInitialized ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {isInitialized ? 'Active' : 'Inactive'}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Gasless Transactions:</span>
          <span className={`px-2 py-1 text-xs rounded-full ${
            isGaslessAvailable ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
          }`}>
            {isGaslessAvailable ? 'Available' : 'Unavailable'}
          </span>
        </div>
      </div>

      {/* Bet Amount */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Bet Amount (CAMP)
        </label>
        <input
          type="number"
          value={betAmount}
          onChange={(e) => setBetAmount(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter bet amount"
          step="0.001"
          min="0"
        />
      </div>

      {/* Game Options */}
      {renderGameOptions()}

      {/* Advanced Options */}
      <div className="mb-4">
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          {showAdvanced ? 'Hide' : 'Show'} Advanced Options
        </button>
        
        {showAdvanced && (
          <div className="mt-2 space-y-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={useGasless}
                onChange={(e) => setUseGasless(e.target.checked)}
                className="mr-2"
                disabled={!isGaslessAvailable}
              />
              <span className="text-sm text-gray-700">
                Use Gasless Transaction {!isGaslessAvailable && '(Unavailable)'}
              </span>
            </label>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        <button
          onClick={handlePlaceBet}
          disabled={isLoading || !isInitialized}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? 'Processing...' : `Place ${gameType.charAt(0).toUpperCase() + gameType.slice(1)} Bet`}
        </button>

        {gameType === 'roulette' && (
          <button
            onClick={handleBatchBet}
            disabled={isLoading || !isInitialized}
            className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Processing...' : 'Place Batch Bet (Roulette + Wheel)'}
          </button>
        )}
      </div>

      {/* Features Info */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h4 className="text-sm font-medium text-blue-900 mb-2">Origin SDK Features:</h4>
        <ul className="text-xs text-blue-800 space-y-1">
          <li>• Enhanced transaction handling</li>
          <li>• Gasless transactions for small bets</li>
          <li>• Batch transaction support</li>
          <li>• Automatic network switching</li>
          <li>• Real-time transaction monitoring</li>
        </ul>
      </div>
    </div>
  );
};

export default OriginBettingPanel;
