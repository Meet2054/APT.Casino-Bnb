'use client'
import React, { createContext, useContext, useEffect, useState } from 'react';
import { originSDK, originUtils } from '../config/originSDK';
import { originWeb3Helpers } from '../utils/originWeb3';
import { toast } from 'react-toastify';

// Create Origin SDK Context
const OriginContext = createContext();

// Origin SDK Provider Component
export const OriginProvider = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isGaslessAvailable, setIsGaslessAvailable] = useState(false);
  const [currentNetwork, setCurrentNetwork] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize Origin SDK
  useEffect(() => {
    const initializeOriginSDK = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Check if Origin SDK is available
        if (!originUtils.isAvailable()) {
          console.warn('Origin SDK not available, using fallback mode');
          setIsInitialized(false);
          return;
        }

        // Initialize Origin SDK
        await originSDK.initialize();

        // Check gasless transaction availability
        const gaslessAvailable = await originWeb3Helpers.isGaslessAvailable();
        setIsGaslessAvailable(gaslessAvailable);

        // Get current network
        const network = await originWeb3Helpers.getTransactionStatus();
        setCurrentNetwork(network);

        setIsInitialized(true);
        toast.success('Origin SDK initialized successfully!');
      } catch (error) {
        console.error('Failed to initialize Origin SDK:', error);
        setError(error.message);
        toast.error('Failed to initialize Origin SDK. Using fallback mode.');
        setIsInitialized(false);
      } finally {
        setIsLoading(false);
      }
    };

    initializeOriginSDK();
  }, []);

  // Auto-switch to Basecamp Testnet when available
  useEffect(() => {
    const autoSwitchToBasecamp = async () => {
      if (isInitialized && currentNetwork?.chainId !== 123420001114) {
        try {
          await originWeb3Helpers.switchNetwork(123420001114);
          toast.info('Automatically switched to Basecamp Testnet');
        } catch (error) {
          console.warn('Failed to auto-switch to Basecamp:', error);
        }
      }
    };

    autoSwitchToBasecamp();
  }, [isInitialized, currentNetwork]);

  // Context value
  const contextValue = {
    // SDK instance
    originSDK,
    
    // State
    isInitialized,
    isGaslessAvailable,
    currentNetwork,
    isLoading,
    error,
    
    // Utility functions
    originUtils,
    originWeb3Helpers,
    
    // Enhanced functions
    switchToBasecamp: async () => {
      try {
        await originWeb3Helpers.switchNetwork(123420001114);
        toast.success('Switched to Basecamp Testnet successfully!');
      } catch (error) {
        toast.error('Failed to switch to Basecamp Testnet');
        throw error;
      }
    },
    
    enableGasless: async () => {
      try {
        await originSDK.accountAbstraction.enable();
        setIsGaslessAvailable(true);
        toast.success('Gasless transactions enabled!');
      } catch (error) {
        toast.error('Failed to enable gasless transactions');
        throw error;
      }
    },
    
    getTransactionStatus: async (txHash) => {
      return await originWeb3Helpers.getTransactionStatus(txHash);
    },
    
    monitorTransaction: async (txHash, onUpdate) => {
      return await originWeb3Helpers.monitorTransaction(txHash, onUpdate);
    }
  };

  return (
    <OriginContext.Provider value={contextValue}>
      {children}
    </OriginContext.Provider>
  );
};

// Custom hook to use Origin SDK
export const useOrigin = () => {
  const context = useContext(OriginContext);
  if (!context) {
    throw new Error('useOrigin must be used within an OriginProvider');
  }
  return context;
};

// Higher-order component for Origin SDK features
export const withOrigin = (Component) => {
  return (props) => {
    const originContext = useOrigin();
    return <Component {...props} origin={originContext} />;
  };
};

export default OriginProvider;
