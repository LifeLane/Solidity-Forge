
'use server';

/**
 * @fileOverview Service to provide known smart contract addresses for common DeFi protocols.
 *
 * - KnownContractAddress: Interface for a known contract address entry.
 * - FetchKnownLiquidityPoolAddressesParams: Parameters for querying known addresses.
 * - fetchKnownLiquidityPoolAddresses: Function to retrieve known addresses based on query.
 */

export interface KnownContractAddress {
  mainnetName: string;
  systemName: string; // e.g., "Uniswap V2", "PancakeSwap"
  contractName: string; // e.g., "Router", "Factory", "Wrapped Native Token"
  address: string;
  type: 'Router' | 'Factory' | 'WrappedNativeToken' | 'Other';
  explorerUrlPrefix?: string;
  notes?: string;
}

// A list of common contract addresses. This can be expanded.
const KNOWN_ADDRESSES: KnownContractAddress[] = [
  // Ethereum Mainnet
  { mainnetName: "Ethereum", systemName: "Uniswap V2", contractName: "Router", address: "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D", type: "Router", explorerUrlPrefix: "https://etherscan.io/address/", notes: "Official Uniswap V2 Router 02" },
  { mainnetName: "Ethereum", systemName: "Uniswap V2", contractName: "Factory", address: "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f", type: "Factory", explorerUrlPrefix: "https://etherscan.io/address/", notes: "Official Uniswap V2 Factory" },
  { mainnetName: "Ethereum", systemName: "Uniswap V3", contractName: "Router", address: "0xE592427A0AEce92De3Edee1F18E0157C05861564", type: "Router", explorerUrlPrefix: "https://etherscan.io/address/", notes: "Official Uniswap V3 Router" },
  { mainnetName: "Ethereum", systemName: "Uniswap V3", contractName: "Factory", address: "0x1F98431c8aD98523631AE4a59f267346ea31F984", type: "Factory", explorerUrlPrefix: "https://etherscan.io/address/", notes: "Official Uniswap V3 Factory" },
  { mainnetName: "Ethereum", systemName: "Sushiswap", contractName: "Router", address: "0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F", type: "Router", explorerUrlPrefix: "https://etherscan.io/address/", notes: "Official Sushiswap Router" },
  { mainnetName: "Ethereum", systemName: "Wrapped Ether (WETH)", contractName: "WETH", address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", type: "WrappedNativeToken", explorerUrlPrefix: "https://etherscan.io/address/" },

  // BNB Chain (BSC)
  { mainnetName: "BNB Chain", systemName: "PancakeSwap V2", contractName: "Router", address: "0x10ED43C718714eb63d5aA57B78B54704E256024E", type: "Router", explorerUrlPrefix: "https://bscscan.com/address/", notes: "PancakeSwap Router V2" },
  { mainnetName: "BNB Chain", systemName: "PancakeSwap V2", contractName: "Factory", address: "0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73", type: "Factory", explorerUrlPrefix: "https://bscscan.com/address/", notes: "PancakeSwap Factory V2" },
  { mainnetName: "BNB Chain", systemName: "PancakeSwap V3", contractName: "Universal Router", address: "0x1b81D678ffb9C0263b24A97847620C99d213eB14", type: "Router", explorerUrlPrefix: "https://bscscan.com/address/", notes: "PancakeSwap Smart Router V3 (Universal)" },
  { mainnetName: "BNB Chain", systemName: "PancakeSwap V3", contractName: "Factory", address: "0x0BFbCF9fa4f9C56B0F40a671Ad40E0805A091865", type: "Factory", explorerUrlPrefix: "https://bscscan.com/address/", notes: "PancakeSwap Factory V3" },
  { mainnetName: "BNB Chain", systemName: "Wrapped BNB (WBNB)", contractName: "WBNB", address: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c", type: "WrappedNativeToken", explorerUrlPrefix: "https://bscscan.com/address/" },

  // Polygon (Matic)
  { mainnetName: "Polygon", systemName: "QuickSwap V2", contractName: "Router", address: "0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff", type: "Router", explorerUrlPrefix: "https://polygonscan.com/address/", notes: "QuickSwap Router V2" },
  { mainnetName: "Polygon", systemName: "QuickSwap V2", contractName: "Factory", address: "0x5757371414417b8C6CAad45bAeF941aBc7d3Ab32", type: "Factory", explorerUrlPrefix: "https://polygonscan.com/address/", notes: "QuickSwap Factory V2" },
  { mainnetName: "Polygon", systemName: "Uniswap V3", contractName: "Router", address: "0xE592427A0AEce92De3Edee1F18E0157C05861564", type: "Router", explorerUrlPrefix: "https://polygonscan.com/address/", notes: "Official Uniswap V3 Router (Polygon)" },
  { mainnetName: "Polygon", systemName: "Uniswap V3", contractName: "Factory", address: "0x1F98431c8aD98523631AE4a59f267346ea31F984", type: "Factory", explorerUrlPrefix: "https://polygonscan.com/address/", notes: "Official Uniswap V3 Factory (Polygon)" },
  { mainnetName: "Polygon", systemName: "Wrapped Matic (WMATIC)", contractName: "WMATIC", address: "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270", type: "WrappedNativeToken", explorerUrlPrefix: "https://polygonscan.com/address/" },

  // Arbitrum One
  { mainnetName: "Arbitrum One", systemName: "Uniswap V3", contractName: "Router", address: "0xE592427A0AEce92De3Edee1F18E0157C05861564", type: "Router", explorerUrlPrefix: "https://arbiscan.io/address/", notes: "Official Uniswap V3 Router (Arbitrum)" },
  { mainnetName: "Arbitrum One", systemName: "Uniswap V3", contractName: "Factory", address: "0x1F98431c8aD98523631AE4a59f267346ea31F984", type: "Factory", explorerUrlPrefix: "https://arbiscan.io/address/", notes: "Official Uniswap V3 Factory (Arbitrum)" },
  { mainnetName: "Arbitrum One", systemName: "Sushiswap", contractName: "Router", address: "0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506", type: "Router", explorerUrlPrefix: "https://arbiscan.io/address/", notes: "Sushiswap Router (Arbitrum)" },
  { mainnetName: "Arbitrum One", systemName: "Wrapped Ether (WETH)", contractName: "WETH", address: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1", type: "WrappedNativeToken", explorerUrlPrefix: "https://arbiscan.io/address/" },


  // Optimism
  { mainnetName: "Optimism", systemName: "Uniswap V3", contractName: "Router", address: "0xE592427A0AEce92De3Edee1F18E0157C05861564", type: "Router", explorerUrlPrefix: "https://optimistic.etherscan.io/address/", notes: "Official Uniswap V3 Router (Optimism)" },
  { mainnetName: "Optimism", systemName: "Uniswap V3", contractName: "Factory", address: "0x1F98431c8aD98523631AE4a59f267346ea31F984", type: "Factory", explorerUrlPrefix: "https://optimistic.etherscan.io/address/", notes: "Official Uniswap V3 Factory (Optimism)" },
  { mainnetName: "Optimism", systemName: "Wrapped Ether (WETH)", contractName: "WETH", address: "0x4200000000000000000000000000000000000006", type: "WrappedNativeToken", explorerUrlPrefix: "https://optimistic.etherscan.io/address/" },
];

export interface FetchKnownLiquidityPoolAddressesParams {
  mainnetName?: string;
  systemName?: string;
  contractType?: 'Router' | 'Factory' | 'WrappedNativeToken' | 'Other';
}

export async function fetchKnownLiquidityPoolAddresses(
  params: FetchKnownLiquidityPoolAddressesParams
): Promise<KnownContractAddress[]> {
  let results = KNOWN_ADDRESSES;

  if (params.mainnetName) {
    results = results.filter(addr => 
      addr.mainnetName.toLowerCase().includes(params.mainnetName!.toLowerCase())
    );
  }
  if (params.systemName) {
    results = results.filter(addr => 
      addr.systemName.toLowerCase().includes(params.systemName!.toLowerCase())
    );
  }
  if (params.contractType) {
    results = results.filter(addr => addr.type === params.contractType);
  }
  return results;
}
