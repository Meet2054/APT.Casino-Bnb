import { useState, useCallback, useEffect } from 'react';
import { originWeb3Helpers } from '../utils/originWeb3';
import { CONTRACTS, CHAIN_IDS } from '../config/contracts';
import { toast } from 'react-toastify';

// Enhanced game hooks with Origin SDK integration
export const useOriginGames = () => {
  const [isGaslessAvailable, setIsGaslessAvailable] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentNetwork, setCurrentNetwork] = useState(null);

  // Check Origin SDK features on mount
  useEffect(() => {
    const checkOriginFeatures = async () => {
      try {
        const gaslessAvailable = await originWeb3Helpers.isGaslessAvailable();
        setIsGaslessAvailable(gaslessAvailable);
        
        const network = await originWeb3Helpers.getTransactionStatus();
        setCurrentNetwork(network);
      } catch (error) {
        console.warn('Failed to check Origin features:', error);
      }
    };

    checkOriginFeatures();
  }, []);

  // Enhanced Roulette game with Origin SDK
  const playRoulette = useCallback(async (betType, betValue, amount, options = {}) => {
    setIsLoading(true);
    
    try {
      const rouletteContract = CONTRACTS.BASECAMP_TESTNET?.roulette;
      if (!rouletteContract) {
        throw new Error('Roulette contract not found');
      }

      const transaction = {
        address: rouletteContract.address,
        abi: rouletteContract.abi,
        functionName: 'placeBet',
        args: [betType, betValue, amount],
        ...options
      };

      // Use gasless transaction for small bets if available
      const isSmallBet = amount < 1000000000000000000n; // Less than 1 CAMP
      const shouldUseGasless = isSmallBet && isGaslessAvailable && options.useGasless !== false;

      let result;
      if (shouldUseGasless) {
        result = await originWeb3Helpers.sendGasless(transaction, options);
        toast.success('Gasless bet placed successfully!');
      } else {
        result = await originWeb3Helpers.contractWrite(
          rouletteContract.address,
          rouletteContract.abi,
          'placeBet',
          [betType, betValue, amount],
          options
        );
        toast.success('Bet placed successfully!');
      }

      // Monitor transaction
      await originWeb3Helpers.monitorTransaction(result.hash, (status) => {
        if (status === 'confirmed') {
          toast.success('Bet confirmed on blockchain!');
        }
      });

      return result;
    } catch (error) {
      console.error('Roulette bet failed:', error);
      toast.error('Failed to place bet. Please try again.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [isGaslessAvailable]);

  // Enhanced Wheel game with Origin SDK
  const playWheel = useCallback(async (risk, segments, amount, options = {}) => {
    setIsLoading(true);
    
    try {
      const wheelContract = CONTRACTS.BASECAMP_TESTNET?.wheel;
      if (!wheelContract) {
        throw new Error('Wheel contract not found');
      }

      const transaction = {
        address: wheelContract.address,
        abi: wheelContract.abi,
        functionName: 'placeBet',
        args: [risk, segments, amount],
        ...options
      };

      // Use gasless transaction for small bets if available
      const isSmallBet = amount < 1000000000000000000n; // Less than 1 CAMP
      const shouldUseGasless = isSmallBet && isGaslessAvailable && options.useGasless !== false;

      let result;
      if (shouldUseGasless) {
        result = await originWeb3Helpers.sendGasless(transaction, options);
        toast.success('Gasless wheel bet placed successfully!');
      } else {
        result = await originWeb3Helpers.contractWrite(
          wheelContract.address,
          wheelContract.abi,
          'placeBet',
          [risk, segments, amount],
          options
        );
        toast.success('Wheel bet placed successfully!');
      }

      // Monitor transaction
      await originWeb3Helpers.monitorTransaction(result.hash, (status) => {
        if (status === 'confirmed') {
          toast.success('Wheel bet confirmed on blockchain!');
        }
      });

      return result;
    } catch (error) {
      console.error('Wheel bet failed:', error);
      toast.error('Failed to place wheel bet. Please try again.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [isGaslessAvailable]);

  // Enhanced Mines game with Origin SDK
  const playMines = useCallback(async (mines, amount, options = {}) => {
    setIsLoading(true);
    
    try {
      const minesContract = CONTRACTS.BASECAMP_TESTNET?.mines;
      if (!minesContract) {
        throw new Error('Mines contract not found');
      }

      const transaction = {
        address: minesContract.address,
        abi: minesContract.abi,
        functionName: 'startGame',
        args: [mines, amount],
        ...options
      };

      // Use gasless transaction for small bets if available
      const isSmallBet = amount < 1000000000000000000n; // Less than 1 CAMP
      const shouldUseGasless = isSmallBet && isGaslessAvailable && options.useGasless !== false;

      let result;
      if (shouldUseGasless) {
        result = await originWeb3Helpers.sendGasless(transaction, options);
        toast.success('Gasless mines game started successfully!');
      } else {
        result = await originWeb3Helpers.contractWrite(
          minesContract.address,
          minesContract.abi,
          'startGame',
          [mines, amount],
          options
        );
        toast.success('Mines game started successfully!');
      }

      // Monitor transaction
      await originWeb3Helpers.monitorTransaction(result.hash, (status) => {
        if (status === 'confirmed') {
          toast.success('Mines game confirmed on blockchain!');
        }
      });

      return result;
    } catch (error) {
      console.error('Mines game failed:', error);
      toast.error('Failed to start mines game. Please try again.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [isGaslessAvailable]);

  // Batch game actions (multiple bets in one transaction)
  const batchGameActions = useCallback(async (actions, options = {}) => {
    setIsLoading(true);
    
    try {
      const transactions = actions.map(action => {
        const contract = CONTRACTS.BASECAMP_TESTNET?.[action.contractType];
        if (!contract) {
          throw new Error(`${action.contractType} contract not found`);
        }

        return {
          address: contract.address,
          abi: contract.abi,
          functionName: action.functionName,
          args: action.args,
          ...options
        };
      });

      const result = await originWeb3Helpers.sendBatch(transactions);
      toast.success('Batch game actions completed successfully!');

      // Monitor all transactions
      for (const tx of result) {
        await originWeb3Helpers.monitorTransaction(tx.hash, (status) => {
          if (status === 'confirmed') {
            toast.success('Batch action confirmed on blockchain!');
          }
        });
      }

      return result;
    } catch (error) {
      console.error('Batch game actions failed:', error);
      toast.error('Failed to execute batch actions. Please try again.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Switch to Basecamp Testnet with Origin SDK
  const switchToBasecamp = useCallback(async () => {
    try {
      await originWeb3Helpers.switchNetwork(CHAIN_IDS.BASECAMP_TESTNET);
      toast.success('Switched to Basecamp Testnet successfully!');
    } catch (error) {
      console.error('Failed to switch to Basecamp:', error);
      toast.error('Failed to switch network. Please try manually.');
      throw error;
    }
  }, []);

  // Get transaction status with enhanced monitoring
  const getTransactionStatus = useCallback(async (txHash) => {
    try {
      return await originWeb3Helpers.getTransactionStatus(txHash);
    } catch (error) {
      console.error('Failed to get transaction status:', error);
      return null;
    }
  }, []);

  // Get current gas price
  const getGasPrice = useCallback(async () => {
    try {
      return await originWeb3Helpers.getGasPrice();
    } catch (error) {
      console.error('Failed to get gas price:', error);
      return null;
    }
  }, []);

  return {
    // Game functions
    playRoulette,
    playWheel,
    playMines,
    batchGameActions,
    
    // Network functions
    switchToBasecamp,
    getTransactionStatus,
    getGasPrice,
    
    // State
    isLoading,
    isGaslessAvailable,
    currentNetwork
  };
};

export default useOriginGames;
