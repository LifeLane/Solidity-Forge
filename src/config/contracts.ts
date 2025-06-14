
import type { LucideIcon } from 'lucide-react';
import { Coins, GitFork, ArrowRightLeft, Landmark, FileJson, Puzzle } from 'lucide-react';

export type ParameterType = 'string' | 'number' | 'boolean' | 'address' | 'select' | 'textarea';

export interface ContractParameter {
  name: string;
  label: string;
  type: ParameterType;
  defaultValue?: string | number | boolean;
  options?: { value: string; label: string }[]; // For select type
  placeholder?: string;
  description?: string;
  rows?: number; // for textarea
  advancedOnly?: boolean; // True if this parameter should only appear in "Advanced" mode
}

export interface ContractTemplate {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  parameters: ContractParameter[];
  aiPromptEnhancement?: string; // Additional context for AI based on template
}

export const CONTRACT_TEMPLATES: ContractTemplate[] = [
  {
    id: 'erc20',
    name: 'ERC20 Token',
    description: 'A standard fungible token contract (e.g., for cryptocurrencies).',
    icon: Coins,
    parameters: [
      { name: 'tokenName', label: 'Token Name', type: 'string', placeholder: 'My Awesome Token', description: 'The full name of your token.' },
      { name: 'tokenSymbol', label: 'Token Symbol', type: 'string', placeholder: 'MAT', description: 'The ticker symbol for your token (e.g., ETH).' },
      { name: 'initialSupply', label: 'Initial Supply', type: 'number', placeholder: '1000000', description: 'The total number of tokens to mint initially.' },
      { name: 'decimals', label: 'Decimals', type: 'number', defaultValue: 18, description: 'The number of decimal places your token will have (typically 18).', advancedOnly: true },
    ],
    aiPromptEnhancement: "Ensure the contract follows OpenZeppelin's ERC20 standards if possible. Include Ownable for access control.",
  },
  {
    id: 'liquidityPool',
    name: 'Liquidity Pool',
    description: 'A contract for providing liquidity between two ERC20 tokens.',
    icon: GitFork,
    parameters: [
      { name: 'poolName', label: 'Pool Name', type: 'string', placeholder: 'TokenA/TokenB Pool', description: 'A descriptive name for the liquidity pool.' },
      { name: 'tokenA_Address', label: 'Token A Address', type: 'address', placeholder: '0x...', description: 'The contract address of the first token.' },
      { name: 'tokenB_Address', label: 'Token B Address', type: 'address', placeholder: '0x...', description: 'The contract address of the second token.' },
      { name: 'feeTier', label: 'Fee Tier (%)', type: 'select', options: [
          { value: '0.01', label: '0.01%' },
          { value: '0.05', label: '0.05%' },
          { value: '0.3', label: '0.3%' },
          { value: '1.0', label: '1.0%' },
        ], 
        defaultValue: '0.3', description: 'The percentage fee charged on swaps through this pool.', advancedOnly: true },
    ],
    aiPromptEnhancement: "Generate a basic liquidity pool contract. Consider using a well-known AMM model like Uniswap V2 or a simpler constant product formula if specific framework is not mentioned. Focus on `addLiquidity`, `removeLiquidity` and `swap` functions. Include placeholder ERC20 interface for token interactions.",
  },
  {
    id: 'swapProtocol',
    name: 'Swap Protocol (Router)',
    description: 'A router contract for facilitating swaps across multiple liquidity pools.',
    icon: ArrowRightLeft,
    parameters: [
      { name: 'routerName', label: 'Router Name', type: 'string', placeholder: 'MySwap Router', description: 'The name for your swap router contract.' },
      { name: 'factoryAddress', label: 'Factory Address', type: 'address', placeholder: '0x...', description: 'The address of the contract factory that creates liquidity pools.' },
      { name: 'wethAddress', label: 'WETH Address', type: 'address', placeholder: '0x...', description: 'The address of the Wrapped Ether (WETH) contract on the target network.', advancedOnly: true },
    ],
    aiPromptEnhancement: "This is a router contract. It should handle multi-hop swaps (tokenA to tokenB via an intermediary tokenC) and direct swaps. Include functions for swapping exact tokens for tokens, tokens for exact tokens, ETH for exact tokens, and exact ETH for tokens. Reference the factory to find pool addresses.",
  },
  {
    id: 'dao',
    name: 'DAO (Basic Governance)',
    description: 'A basic Decentralized Autonomous Organization for voting on proposals.',
    icon: Landmark,
    parameters: [
      { name: 'daoName', label: 'DAO Name', type: 'string', placeholder: 'My Governance DAO', description: 'The name of your DAO.' },
      { name: 'proposalTokenAddress', label: 'Governance Token Address', type: 'address', placeholder: '0x...', description: 'The ERC20 token used for voting power.' },
      { name: 'quorumPercentage', label: 'Quorum Percentage', type: 'number', placeholder: '20', description: 'Minimum percentage of total token supply needed to vote for a proposal to pass (0-100).', advancedOnly: true },
      { name: 'votingPeriod', label: 'Voting Period (Blocks)', type: 'number', placeholder: '17280', description: 'Duration for which a proposal remains open for voting (e.g., ~3 days if 1 block = 15s).', advancedOnly: true },
    ],
    aiPromptEnhancement: "Generate a simple DAO contract. It should allow token holders to create proposals, vote on proposals (yes/no), and execute passed proposals. Quorum and voting period are key parameters. Use the provided governance token for voting power.",
  },
  {
    id: 'custom',
    name: 'Custom Contract',
    description: 'Describe your custom smart contract needs.',
    icon: Puzzle,
    parameters: [
      { name: 'customDescription', label: 'Contract Description', type: 'textarea', rows: 6, placeholder: 'e.g., A smart contract that manages a decentralized lottery system with weekly draws...', description: 'Detailed description of the contract functionality, features, and any specific requirements.' },
    ],
    aiPromptEnhancement: "The user will provide a custom description. Generate the Solidity code based on this description. Pay close attention to the details and requirements mentioned by the user. If details are sparse, make reasonable assumptions or create a flexible base.",
  }
];
