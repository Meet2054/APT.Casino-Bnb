import React, { useState, useEffect } from 'react';
import { useOrigin } from './OriginProvider';
import { CHAIN_IDS } from '../config/contracts';
import { toast } from 'react-toastify';

// Enhanced Network Switcher with Origin SDK
const OriginNetworkSwitcher = () => {
  const { 
    isInitialized, 
    currentNetwork, 
    switchToBasecamp, 
    isLoading 
  } = useOrigin();

  const [isSwitching, setIsSwitching] = useState(false);

  // Handle network switching
  const handleNetworkSwitch = async (chainId) => {
    if (chainId === CHAIN_IDS.BASECAMP_TESTNET) {
      setIsSwitching(true);
      try {
        await switchToBasecamp();
        toast.success('Successfully switched to Basecamp Testnet!');
      } catch (error) {
        console.error('Network switch failed:', error);
        toast.error('Failed to switch network. Please try manually.');
      } finally {
        setIsSwitching(false);
      }
    } else {
      toast.info('Please switch to Basecamp Testnet for optimal experience');
    }
  };

  // Get network display info
  const getNetworkInfo = () => {
    if (!currentNetwork) {
      return {
        name: 'Unknown',
        status: 'disconnected',
        color: 'gray'
      };
    }

    if (currentNetwork.chainId === CHAIN_IDS.BASECAMP_TESTNET) {
      return {
        name: 'Basecamp Testnet',
        status: 'connected',
        color: 'green'
      };
    }

    return {
      name: 'Other Network',
      status: 'wrong-network',
      color: 'yellow'
    };
  };

  const networkInfo = getNetworkInfo();

  return (
    <div className="bg-white rounded-lg shadow-md p-4 max-w-sm">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Network Status
        </h3>
        <p className="text-sm text-gray-600">
          Enhanced with Origin SDK
        </p>
      </div>

      {/* Current Network Status */}
      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Current Network:</span>
          <span className={`px-2 py-1 text-xs rounded-full bg-${networkInfo.color}-100 text-${networkInfo.color}-800`}>
            {networkInfo.name}
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Origin SDK:</span>
          <span className={`px-2 py-1 text-xs rounded-full ${
            isInitialized ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {isInitialized ? 'Active' : 'Inactive'}
          </span>
        </div>
      </div>

      {/* Network Actions */}
      <div className="space-y-3">
        <button
          onClick={() => handleNetworkSwitch(CHAIN_IDS.BASECAMP_TESTNET)}
          disabled={isSwitching || isLoading || networkInfo.status === 'connected'}
          className={`w-full py-2 px-4 rounded-md text-white font-medium transition-colors ${
            networkInfo.status === 'connected'
              ? 'bg-green-600 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          } disabled:bg-gray-400 disabled:cursor-not-allowed`}
        >
          {isSwitching ? 'Switching...' : 
           networkInfo.status === 'connected' ? 'Connected to Basecamp' : 
           'Switch to Basecamp Testnet'}
        </button>

        {networkInfo.status !== 'connected' && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              For the best experience with gasless transactions and enhanced features, 
              please switch to Basecamp Testnet.
            </p>
          </div>
        )}

        {networkInfo.status === 'connected' && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800">
              ✓ Connected to Basecamp Testnet. All Origin SDK features are available!
            </p>
          </div>
        )}
      </div>

      {/* Features Info */}
      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <h4 className="text-sm font-medium text-blue-900 mb-2">Available Features:</h4>
        <ul className="text-xs text-blue-800 space-y-1">
          <li>• Gasless transactions for small bets</li>
          <li>• Batch transaction support</li>
          <li>• Enhanced transaction monitoring</li>
          <li>• Automatic network optimization</li>
          <li>• Camp Network native features</li>
        </ul>
      </div>
    </div>
  );
};

export default OriginNetworkSwitcher;
