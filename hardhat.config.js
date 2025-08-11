require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const MANTLE_SEPOLIA_RPC = "https://rpc.sepolia.mantle.xyz";
const PHAROS_DEVNET_RPC = "https://devnet.dplabs-internal.com";
const BINANCE_TESTNET_RPC = "https://data-seed-prebsc-1-s1.binance.org:8545"; // Fill your Binance Testnet RPC URL
const ETHEREUM_SEPOLIA_RPC = "https://sepolia.infura.io/v3/56e934eec4ad458ea26313f91e15cec3"; // Ethereum Sepolia RPC URL
const CITREA_TESTNET_RPC = "https://rpc.testnet.citrea.xyz"; // Citrea Testnet RPC URL
const BASECAMP_TESTNET_RPC = "https://rpc-campnetwork.xyz"; // Basecamp Testnet RPC URL

const MANTLE_SEPOLIA_EXPLORER_API = process.env.MANTLE_SEPOLIA_EXPLORER_API;
const PHAROS_DEVNET_EXPLORER_API = process.env.PHAROS_DEVNET_EXPLORER_API;
const BINANCE_TESTNET_EXPLORER_API = process.env.BINANCE_TESTNET_EXPLORER_API; // Fill your Binance Testnet Etherscan API Key
const ETHEREUM_SEPOLIA_EXPLORER_API = process.env.ETHEREUM_SEPOLIA_EXPLORER_API; // Ethereum Sepolia Etherscan API Key
const CITREA_TESTNET_EXPLORER_API = process.env.CITREA_TESTNET_EXPLORER_API; // Citrea Testnet Explorer API Key
const BASECAMP_TESTNET_EXPLORER_API = process.env.BASECAMP_TESTNET_EXPLORER_API; // Basecamp Testnet Explorer API Key

const PRIVATE_KEY = process.env.PRIVATE_KEY;

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.20",
  networks: {
    hardhat: { // Add hardhat network configuration
      chainId: 31337,
    },
    mantleSepolia: {
      url: MANTLE_SEPOLIA_RPC,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
      chainId: 5003,
    },
    pharosDevnet: {
      url: PHAROS_DEVNET_RPC,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
      chainId: 50002,
    },
    binanceTestnet: {
      url: BINANCE_TESTNET_RPC,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
      chainId: 97,
    },
    ethereumSepolia: {
      url: ETHEREUM_SEPOLIA_RPC,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
      chainId: 11155111,
    },
    citreaTestnet: {
      url: CITREA_TESTNET_RPC,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
      chainId: 5115,
    },
    basecampTestnet: {
      url: BASECAMP_TESTNET_RPC,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
      chainId: 123420001114,
      // Optionally, you can add multiple RPCs if supported
      // urls: [BASECAMP_TESTNET_RPC, BASECAMP_TESTNET_RPC_ALT],
    },
  },
  etherscan: {
    apiKey: {
      mantleSepolia: MANTLE_SEPOLIA_EXPLORER_API,
      pharosDevnet: PHAROS_DEVNET_EXPLORER_API,
      bscTestnet: BINANCE_TESTNET_EXPLORER_API, // Etherscan API Key for Binance Testnet
      sepolia: ETHEREUM_SEPOLIA_EXPLORER_API, // Etherscan API Key for Ethereum Sepolia
      citreaTestnet: CITREA_TESTNET_EXPLORER_API, // Citrea Testnet Explorer API Key
  basecampTestnet: BASECAMP_TESTNET_EXPLORER_API, // Basecamp Testnet Explorer API Key
    },
    customChains: [
      {
        network: "mantleSepolia",
        chainId: 5003,
        urls: {
          apiURL: "https://api-sepolia.mantlescan.xyz/api",
          browserURL: "https://sepolia.mantlescan.xyz",
        },
      },
      {
        network: "pharosDevnet",
        chainId: 50002,
        urls: {
          apiURL: "https://pharosscan.xyz/api",
          browserURL: "https://pharosscan.xyz",
        },
      },
      {
        network: "bscTestnet", // Must match the network name used in apiKey
        chainId: 97,
        urls: {
          apiURL: "https://api-testnet.bscscan.com/api",
          browserURL: "https://testnet.bscscan.com",
        },
      },
      {
        network: "sepolia", // Must match the network name used in apiKey
        chainId: 11155111,
        urls: {
          apiURL: "https://api-sepolia.etherscan.io/api",
          browserURL: "https://sepolia.etherscan.io",
        },
      },
      {
        network: "citreaTestnet", // Must match the network name used in apiKey
        chainId: 5115,
        urls: {
          apiURL: "https://explorer.testnet.citrea.xyz/api", // Note: This might need to be updated based on actual API endpoint
          browserURL: "https://explorer.testnet.citrea.xyz",
        },
      },
      {
        network: "basecampTestnet", // Must match the network name used in apiKey
        chainId: 123420001114,
        urls: {
          apiURL: "https://basecamp.cloud.blockscout.com/api", // Note: This might need to be updated based on actual API endpoint
          browserURL: "https://basecamp.cloud.blockscout.com/",
        },
      },
    ],
  },
}; 