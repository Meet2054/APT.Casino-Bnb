import { originSDK, originUtils } from '../config/originSDK';
import { CHAIN_IDS } from '../config/contracts';

// Enhanced Web3 utilities with Origin SDK integration
export class OriginWeb3Utils {
  constructor() {
    this.originSDK = originSDK;
    this.isOriginAvailable = originUtils.isAvailable();
  }

  // Enhanced transaction sending with Origin SDK
  async sendTransaction(transaction, options = {}) {
    try {
      if (this.isOriginAvailable) {
        // Use Origin SDK for enhanced transaction handling
        return await this.originSDK.transactions.send(transaction, {
          ...options,
          retry: true,
          gasLimitBuffer: 1.2
        });
      } else {
        // Fallback to standard Web3
        return await this.sendStandardTransaction(transaction, options);
      }
    } catch (error) {
      console.error('Transaction failed:', error);
      throw error;
    }
  }

  // Standard Web3 transaction (fallback)
  async sendStandardTransaction(transaction, options = {}) {
    // Implementation for standard Web3 transaction
    // This would use your existing Web3 setup
    throw new Error('Standard Web3 transaction not implemented');
  }

  // Batch transactions for multiple game actions
  async sendBatchTransactions(transactions) {
    try {
      if (this.isOriginAvailable) {
        const batch = this.originSDK.transactions.createBatch();
        
        transactions.forEach(tx => {
          batch.add(tx);
        });

        return await batch.execute();
      } else {
        // Fallback: send transactions sequentially
        const results = [];
        for (const tx of transactions) {
          const result = await this.sendTransaction(tx);
          results.push(result);
        }
        return results;
      }
    } catch (error) {
      console.error('Batch transaction failed:', error);
      throw error;
    }
  }

  // Gasless transaction for small bets
  async sendGaslessTransaction(transaction, options = {}) {
    try {
      if (this.isOriginAvailable) {
        // Enable account abstraction for gasless transactions
        await this.originSDK.accountAbstraction.enable();
        
        return await this.originSDK.transactions.sendGasless(transaction, options);
      } else {
        // Fallback to regular transaction
        return await this.sendTransaction(transaction, options);
      }
    } catch (error) {
      console.error('Gasless transaction failed:', error);
      throw error;
    }
  }

  // Enhanced contract interaction
  async contractWrite(contractAddress, abi, functionName, args = [], options = {}) {
    try {
      if (this.isOriginAvailable) {
        return await this.originSDK.contracts.write({
          address: contractAddress,
          abi,
          functionName,
          args,
          ...options
        });
      } else {
        // Fallback to standard contract interaction
        return await this.standardContractWrite(contractAddress, abi, functionName, args, options);
      }
    } catch (error) {
      console.error('Contract write failed:', error);
      throw error;
    }
  }

  // Standard contract interaction (fallback)
  async standardContractWrite(contractAddress, abi, functionName, args, options) {
    // Implementation for standard contract interaction
    throw new Error('Standard contract write not implemented');
  }

  // Enhanced transaction monitoring
  async monitorTransaction(txHash, onUpdate = null) {
    try {
      if (this.isOriginAvailable) {
        return await this.originSDK.transactions.monitor(txHash, {
          onUpdate,
          interval: 2000 // Check every 2 seconds
        });
      } else {
        // Fallback monitoring
        return await this.standardTransactionMonitoring(txHash, onUpdate);
      }
    } catch (error) {
      console.error('Transaction monitoring failed:', error);
      throw error;
    }
  }

  // Standard transaction monitoring (fallback)
  async standardTransactionMonitoring(txHash, onUpdate) {
    // Implementation for standard transaction monitoring
    throw new Error('Standard transaction monitoring not implemented');
  }

  // Network switching with Origin SDK
  async switchNetwork(chainId) {
    try {
      if (chainId === CHAIN_IDS.BASECAMP_TESTNET && this.isOriginAvailable) {
        return await this.originSDK.network.switchToBasecamp();
      } else {
        // Fallback to standard network switching
        return await this.standardNetworkSwitch(chainId);
      }
    } catch (error) {
      console.error('Network switch failed:', error);
      throw error;
    }
  }

  // Standard network switching (fallback)
  async standardNetworkSwitch(chainId) {
    // Implementation for standard network switching
    throw new Error('Standard network switch not implemented');
  }

  // Get enhanced transaction status
  async getTransactionStatus(txHash) {
    try {
      if (this.isOriginAvailable) {
        return await this.originSDK.transactions.getStatus(txHash);
      } else {
        // Fallback to standard status check
        return await this.standardGetTransactionStatus(txHash);
      }
    } catch (error) {
      console.error('Failed to get transaction status:', error);
      return null;
    }
  }

  // Standard transaction status check (fallback)
  async standardGetTransactionStatus(txHash) {
    // Implementation for standard transaction status check
    return null;
  }

  // Check if gasless transactions are available
  async isGaslessAvailable() {
    try {
      if (this.isOriginAvailable) {
        return await this.originSDK.accountAbstraction.isAvailable();
      }
      return false;
    } catch (error) {
      console.warn('Failed to check gasless availability:', error);
      return false;
    }
  }

  // Get current gas price with Origin SDK
  async getGasPrice() {
    try {
      if (this.isOriginAvailable) {
        return await this.originSDK.network.getGasPrice();
      } else {
        // Fallback to standard gas price check
        return await this.standardGetGasPrice();
      }
    } catch (error) {
      console.error('Failed to get gas price:', error);
      return null;
    }
  }

  // Standard gas price check (fallback)
  async standardGetGasPrice() {
    // Implementation for standard gas price check
    return null;
  }
}

// Create singleton instance
export const originWeb3Utils = new OriginWeb3Utils();

// Utility functions for easy access
export const originWeb3Helpers = {
  // Send transaction with automatic fallback
  sendTransaction: (transaction, options) => originWeb3Utils.sendTransaction(transaction, options),
  
  // Send batch transactions
  sendBatch: (transactions) => originWeb3Utils.sendBatchTransactions(transactions),
  
  // Send gasless transaction
  sendGasless: (transaction, options) => originWeb3Utils.sendGaslessTransaction(transaction, options),
  
  // Contract write
  contractWrite: (address, abi, functionName, args, options) => 
    originWeb3Utils.contractWrite(address, abi, functionName, args, options),
  
  // Monitor transaction
  monitorTransaction: (txHash, onUpdate) => originWeb3Utils.monitorTransaction(txHash, onUpdate),
  
  // Switch network
  switchNetwork: (chainId) => originWeb3Utils.switchNetwork(chainId),
  
  // Get transaction status
  getTransactionStatus: (txHash) => originWeb3Utils.getTransactionStatus(txHash),
  
  // Check gasless availability
  isGaslessAvailable: () => originWeb3Utils.isGaslessAvailable(),
  
  // Get gas price
  getGasPrice: () => originWeb3Utils.getGasPrice()
};

export default originWeb3Utils;
