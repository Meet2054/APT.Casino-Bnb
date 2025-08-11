"use client";
import { createPublicClient, http, createWalletClient, custom } from 'viem'
import { polygon, mainnet, mantleSepoliaTestnet } from 'viem/chains'
import { useChainId } from 'wagmi';
import { CHAIN_IDS } from '@/config/contracts';
import dynamic from 'next/dynamic';

// Define Mantle Sepolia chain
const mantleSepolia = {
  id: 5003,
  name: 'Mantle Sepolia',
  network: 'mantle-sepolia',
  nativeCurrency: {
    decimals: 18,
    name: 'Mantle',
    symbol: 'MNT',
  },
  rpcUrls: {
    default: { http: ['https://rpc.sepolia.mantle.xyz'] },
    public: { http: ['https://rpc.sepolia.mantle.xyz'] },
  },
  blockExplorers: {
    default: { name: 'Mantle Sepolia Explorer', url: 'https://sepolia.mantlescan.xyz' },
  },
  testnet: true,
};

// Define Pharos Devnet chain
const pharosDevnet = {
  id: 50002,
  name: 'Pharos Devnet',
  network: 'pharos-devnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Pharos',
    symbol: 'PHR',
  },
  rpcUrls: {
    default: { http: ['https://devnet.dplabs-internal.com'] },
    public: { http: ['https://devnet.dplabs-internal.com'] },
  },
  blockExplorers: {
    default: { name: 'Pharos Explorer', url: 'https://pharosscan.xyz' },
  },
  testnet: true,
};

// Define Binance Smart Chain Testnet
const binanceTestnet = {
  id: 97,
  name: 'Binance Smart Chain Testnet',
  network: 'bsc-testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Binance Coin',
    symbol: 'BNB',
  },
  rpcUrls: {
    default: { http: ['https://data-seed-prebsc-1-s1.binance.org:8545'] },
    public: { http: ['https://data-seed-prebsc-1-s1.binance.org:8545'] },
  },
  blockExplorers: {
    default: { name: 'BscScan Testnet', url: 'https://testnet.bscscan.com' },
  },
  testnet: true,
};

// Define Ethereum Sepolia chain
const ethereumSepolia = {
  id: 11155111,
  name: 'Ethereum Sepolia',
  network: 'ethereum-sepolia',
  nativeCurrency: {
    decimals: 18,
    name: 'Ethereum',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: { http: ['https://sepolia.infura.io/v3/56e934eec4ad458ea26313f91e15cec3'] },
    public: { http: ['https://sepolia.infura.io/v3/56e934eec4ad458ea26313f91e15cec3'] },
  },
  blockExplorers: {
    default: { name: 'Etherscan Sepolia', url: 'https://sepolia.etherscan.io' },
  },
  testnet: true,
};

// Define Citrea Testnet chain
const citreaTestnet = {
  id: 5115,
  name: 'Citrea Testnet',
  network: 'citrea-testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Citrea Bitcoin',
    symbol: 'cBTC',
  },
  rpcUrls: {
    default: { http: ['https://rpc.testnet.citrea.xyz'] },
    public: { http: ['https://rpc.testnet.citrea.xyz'] },
  },
  blockExplorers: {
    default: { name: 'Citrea Testnet Explorer', url: 'https://explorer.testnet.citrea.xyz' },
  },
  testnet: true,
};

// Define Basecamp Testnet chain
const basecampTestnet = {
  id: 123420001114,
  name: 'Basecamp Testnet',
  network: 'basecamp-testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Basecamp',
    symbol: 'CAMP',
  },
  rpcUrls: {
    default: { http: ['https://rpc-campnetwork.xyz'] },
    public: { http: ['https://rpc-campnetwork.xyz'] },
  },
  blockExplorers: {
    default: { name: 'Basecamp Testnet Explorer', url: 'https://basecamp.cloud.blockscout.com/' },
  },
  testnet: true,
};

// Configure transport with improved settings
const configureTransport = (url) => http(url, {
  batch: { batchSize: 1 },  // Disable batching for more reliable connections
  fetchOptions: {
    cache: 'no-store',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    method: 'POST', // Blockchain JSON-RPC calls require POST
  },
  timeout: 30000, // 30 seconds timeout
  retryCount: 3,
  retryDelay: 1000,
});

export const publicMainnetClient = createPublicClient({
  chain: mainnet,
  transport: configureTransport('https://eth.llamarpc.com'),
});

export const publicPolygonClient = createPublicClient({
  chain: polygon,
  transport: configureTransport('https://polygon.llamarpc.com'),
});

export const publicMantleSepoliaClient = createPublicClient({
  chain: mantleSepolia,
  transport: configureTransport('https://rpc.sepolia.mantle.xyz'),
});


export const publicPharosSepoliaClient = publicMantleSepoliaClient;

export const publicBinanceTestnetClient = createPublicClient({
  chain: binanceTestnet,
  transport: configureTransport('https://data-seed-prebsc-1-s1.binance.org:8545'),
});

export const publicEthereumSepoliaClient = createPublicClient({
  chain: ethereumSepolia,
  transport: configureTransport('https://sepolia.infura.io/v3/56e934eec4ad458ea26313f91e15cec3'),
});

export const publicCitreaTestnetClient = createPublicClient({
  chain: citreaTestnet,
  transport: configureTransport('https://rpc.testnet.citrea.xyz'),
});

export const publicBasecampTestnetClient = createPublicClient({
  chain: basecampTestnet,
  transport: configureTransport('https://rpc-campnetwork.xyz'),
});

// Get contract configuration for current chain
export const getPublicClient = (chainId) => {

  if (chainId === CHAIN_IDS.ETHEREUM_SEPOLIA) {
      return publicEthereumSepoliaClient;
    } else if (chainId === CHAIN_IDS.MANTLE_SEPOLIA) {
      return publicMantleSepoliaClient;
    } else if (chainId === CHAIN_IDS.PHAROS_DEVNET) {
      return publicPharosSepoliaClient;
    } else if (chainId === CHAIN_IDS.BINANCE_TESTNET) {
      return publicBinanceTestnetClient;
    } else if (chainId === CHAIN_IDS.CITREA_TESTNET) {
      return publicCitreaTestnetClient;
    } else if (chainId === CHAIN_IDS.BASECAMP_TESTNET) {
      return publicBasecampTestnetClient;
    }
    return null;
};

export const usePublicClient = () => {
  const chainId = useChainId();
	const publicClient = getPublicClient(chainId);
	
	return {
		dynamicPublicClient: publicClient,
	};
};

let walletClient = null;

export const getWalletClient = async () => {
  if (typeof window === 'undefined' || !window.ethereum) {
    throw new Error('No ethereum provider found');
  }

  try {
    // Request account access if needed
    await window.ethereum.request({ method: 'eth_requestAccounts' });

    // Create wallet client if not already created
    if (!walletClient) {
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      // Prefer Mantle Sepolia (0x138b), fallback to Pharos Devnet, then Binance Testnet, then Ethereum Sepolia, then Citrea Testnet, then Basecamp Testnet
      let chain;
      if (chainId === '0x138b') {
        chain = mantleSepolia;
      } else if (chainId === '0xc352') {
        chain = pharosDevnet;
      } else if (chainId === '0x61') {
        chain = binanceTestnet;
      } else if (chainId === '0xaa36a7') {
        chain = ethereumSepolia;
      } else if (chainId === '0x13fb') {
        chain = citreaTestnet;
      } else if (chainId === '0x1cbc67c35a') {
        chain = basecampTestnet;
      } else {
        chain = mantleSepolia;
      }
      walletClient = createWalletClient({
        chain,
        transport: custom(window.ethereum),
      });
    }

    return walletClient;
  } catch (error) {
    console.error('Failed to get wallet client:', error);
    walletClient = null; // Reset for next attempt
    throw error;
  }
};

export const createCustomWalletClient = (account, providedChainId) => {
  if (typeof window === 'undefined' || !window.ethereum) {
    throw new Error('No ethereum provider found');
  }
  
  let chain;
  if (providedChainId === '0x138b') {
    chain = mantleSepolia;
  } else if (providedChainId === '0xc352') {
    chain = pharosDevnet;
  } else if (providedChainId === '0x61') {
    chain = binanceTestnet;
  } else if (providedChainId === '0xaa36a7') {
    chain = ethereumSepolia;
  } else if (providedChainId === '0x13fb') {
    chain = citreaTestnet;
  } else if (providedChainId === '0x1cbc67c35a') {
    chain = basecampTestnet;
  } else {
    chain = pharosDevnet; // Default to pharosDevnet
  }

  return createWalletClient({
    account,
    chain,
    transport: custom(window.ethereum)
  });
};

export const checkNetwork = async () => {
  if (typeof window === 'undefined' || !window.ethereum) {
    return false;
  }
  
  try {
    const chainId = await window.ethereum.request({ method: 'eth_chainId' });
    if (chainId !== '0x138b' && chainId !== '0x7a69' && chainId !== '0x61' && chainId !== '0xaa36a7' && chainId !== '0x13fb' && chainId !== '0x1cbc67c35a') {
      try {
        // Try switching to Mantle Sepolia first
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x138b' }],
        });
      } catch (switchError) {
        if (switchError.code === 4902) {
          try {
            // Add Mantle Sepolia network
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [{
                chainId: '0x138b',
                chainName: 'Mantle Sepolia',
                nativeCurrency: {
                  name: 'Mantle',
                  symbol: 'MNT',
                  decimals: 18
                },
                rpcUrls: ['https://rpc.sepolia.mantle.xyz'],
                blockExplorerUrls: ['https://sepolia.mantlescan.xyz']
              }],
            });
            
            // Add Ethereum Sepolia network
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [{
                chainId: '0xaa36a7',
                chainName: 'Ethereum Sepolia',
                nativeCurrency: {
                  name: 'Ethereum',
                  symbol: 'ETH',
                  decimals: 18
                },
                rpcUrls: ['https://sepolia.infura.io/v3/56e934eec4ad458ea26313f91e15cec3'],
                blockExplorerUrls: ['https://sepolia.etherscan.io']
              }],
            });
            
            // Add Binance Smart Chain Testnet network
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [{
                chainId: '0x61',
                chainName: 'Binance Smart Chain Testnet',
                nativeCurrency: {
                  name: 'Binance Coin',
                  symbol: 'tBNB',
                  decimals: 18
                },
                rpcUrls: ['https://data-seed-prebsc-1-s1.binance.org:8545'],
                blockExplorerUrls: ['https://testnet.bscscan.com']
              }],
            });
            
            // Add Citrea Testnet network
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [{
                chainId: '0x13fb',
                chainName: 'Citrea Testnet',
                nativeCurrency: {
                  name: 'Citrea Bitcoin',
                  symbol: 'cBTC',
                  decimals: 18
                },
                rpcUrls: ['https://rpc.testnet.citrea.xyz'],
                blockExplorerUrls: ['https://explorer.testnet.citrea.xyz']
              }],
            });
            
            // Add Basecamp Testnet network
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [{
                chainId: '0x1cbc67c35a',
                chainName: 'Basecamp Testnet',
                nativeCurrency: {
                  name: 'Basecamp',
                  symbol: 'CAMP',
                  decimals: 18
                },
                rpcUrls: ['https://rpc-campnetwork.xyz'],
                blockExplorerUrls: ['https://basecamp.cloud.blockscout.com/']
              }],
            });
          } catch (addError) {
            console.error('Error adding networks:', addError);
            return false;
          }
        } else {
          console.error('Error switching network:', switchError);
          return false;
        }
      }
    }
    return true;
  } catch (error) {
    console.error('Error checking network:', error);
    return false;
  }
};