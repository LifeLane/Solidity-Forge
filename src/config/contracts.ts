
import type { LucideIcon } from 'lucide-react';
import { Coins, GitFork, ArrowRightLeft, Landmark, FileJson, Puzzle, ShieldCheck, Edit, CircleDollarSign, Gem, Scale, Lock, Unlock, Settings2 } from 'lucide-react';

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
  dependsOn?: string; // Name of another parameter that this one depends on
  dependsOnValue?: any; // Value the dependent parameter should have for this one to be active
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
    description: 'A standard fungible token contract (e.g., for cryptocurrencies) with optional advanced features.',
    icon: Coins,
    parameters: [
      { name: 'tokenName', label: 'Token Name', type: 'string', placeholder: 'My Awesome Token', description: 'The full name of your token.' },
      { name: 'tokenSymbol', label: 'Token Symbol', type: 'string', placeholder: 'MAT', description: 'The ticker symbol for your token (e.g., ETH).' },
      { 
        name: 'initialSupply', 
        label: 'Initial Supply', 
        type: 'number', 
        placeholder: '1000000', 
        description: 'The total number of tokens to mint at deployment. If mintable is enabled and this is 0, no tokens are minted initially.' 
      },
      { 
        name: 'decimals', 
        label: 'Decimals', 
        type: 'number', 
        defaultValue: 18, 
        description: 'The number of decimal places your token will have (typically 18).', 
        advancedOnly: true 
      },
      {
        name: 'accessControl',
        label: 'Access Control',
        type: 'select',
        options: [
          { value: 'None', label: 'None (Public Minting/Burning if enabled)' },
          { value: 'Ownable', label: 'Ownable (OpenZeppelin)' },
          { value: 'Roles', label: 'Roles (OpenZeppelin AccessControl)' },
        ],
        defaultValue: 'Ownable',
        description: 'Mechanism for managing administrative functions like minting, pausing, etc.',
        advancedOnly: false,
      },
      { 
        name: 'mintable', 
        label: 'Enable Minting', 
        type: 'boolean', 
        defaultValue: false, 
        description: 'Allows new tokens to be created after deployment. Requires Access Control.',
        advancedOnly: false,
      },
      { 
        name: 'burnable', 
        label: 'Enable Burning', 
        type: 'boolean', 
        defaultValue: false, 
        description: 'Allows tokens to be destroyed. Users can burn their own. Admins might burn from others if Roles are set up.',
        advancedOnly: true 
      },
      { 
        name: 'pausable', 
        label: 'Enable Pausable', 
        type: 'boolean', 
        defaultValue: false, 
        description: 'Allows token transfers and other actions to be paused by an admin. Requires Access Control.',
        advancedOnly: true 
      },
      {
        name: 'upgradable',
        label: 'Upgradability',
        type: 'select',
        options: [
          { value: 'None', label: 'None (Immutable)' },
          { value: 'UUPS', label: 'UUPS Proxy (OpenZeppelin)' },
        ],
        defaultValue: 'None',
        description: 'Makes the contract upgradable using a proxy pattern. UUPS is recommended.',
        advancedOnly: true,
      },
      {
        name: 'transactionFeePercent',
        label: 'Transaction Fee (%)',
        type: 'number',
        defaultValue: 0,
        placeholder: '0.5',
        description: 'A percentage fee taken on each transfer (0-100). 0 means no fee. Max 2 decimal places (e.g. 0.25 for 0.25%).',
        advancedOnly: true,
      },
      {
        name: 'feeRecipientAddress',
        label: 'Fee Recipient Address',
        type: 'address',
        placeholder: '0x...',
        description: 'Address to send transaction fees to. Required if Transaction Fee > 0.',
        advancedOnly: true,
        dependsOn: 'transactionFeePercent', 
        dependsOnValue: (val: number) => val > 0 
      },
      {
        name: 'maxTransactionAmount',
        label: 'Max Transaction Amount',
        type: 'number',
        defaultValue: 0,
        placeholder: '10000',
        description: 'Maximum amount of tokens that can be transferred in a single transaction. 0 means no limit.',
        advancedOnly: true,
      },
    ],
    aiPromptEnhancement: `Generate a feature-rich ERC20 token. Use OpenZeppelin contracts extensively.
- **Standard Compliance**: Strictly adhere to ERC20 standards. Implement ERC20Metadata.
- **Access Control**:
  - If 'accessControl' is 'Ownable', use OpenZeppelin's Ownable. The deployer becomes the owner.
  - If 'accessControl' is 'Roles', use OpenZeppelin's AccessControl. Define MINTER_ROLE, PAUSER_ROLE, UPGRADER_ROLE (if upgradable), and ADMIN_ROLE. Grant all roles to the deployer initially. The ADMIN_ROLE should be ableto grant/revoke roles.
  - If 'accessControl' is 'None', features like minting/pausing should either be public (careful!) or disabled if they inherently require admin control.
- **Initial Supply & Decimals**: Use \`tokenName\`, \`tokenSymbol\`, \`initialSupply\`, and \`decimals\` as provided.
  - If \`mintable\` is false, the \`initialSupply\` is minted to the contract deployer during construction/initialization and becomes the fixed total supply.
  - If \`mintable\` is true: if \`initialSupply\` > 0, mint this amount to the deployer. If \`initialSupply\` is 0, no tokens are minted initially.
- **Mintable**: If \`mintable\` is true, provide a \`mint(address to, uint256 amount)\` function.
  - If 'Ownable', restrict with \`onlyOwner\`.
  - If 'Roles', restrict with \`onlyRole(MINTER_ROLE)\`.
  - If 'None', make it public (dangerous, add strong warnings in comments) or disallow if no sensible public minting exists for the template.
- **Burnable**: If \`burnable\` is true, use OpenZeppelin's ERC20Burnable. This provides \`burn(uint256 amount)\` (users burn their own) and \`burnFrom(address account, uint256 amount)\` (admin/approved burns).
- **Pausable**: If \`pausable\` is true, use OpenZeppelin's Pausable. Key functions (\`transfer\`, \`transferFrom\`, \`approve\`, \`mint\`, \`burn\`) must be guarded by \`whenNotPaused\`. The pause/unpause functions must be restricted:
  - If 'Ownable', restrict with \`onlyOwner\`.
  - If 'Roles', restrict with \`onlyRole(PAUSER_ROLE)\`.
- **Upgradability**:
  - If \`upgradable\` is 'UUPS', use OpenZeppelin Contracts UUPS (\`UUPSUpgradeable\`). The contract must inherit \`Initializable\`. Replace constructor with an \`initializer\` function that takes necessary parameters (name, symbol, initial supply owner etc.). The \`_authorizeUpgrade\` function must be implemented and restricted:
    - If 'Ownable', restrict with \`onlyOwner\`.
    - If 'Roles', restrict with \`onlyRole(UPGRADER_ROLE)\`.
- **Transaction Fee**: If \`transactionFeePercent\` > 0:
  - Calculate fee based on the amount. Fee should be a percentage, e.g., 0.5 for 0.5%. Support up to 2 decimal places for fee percentage (e.g. feePercent = 50 for 0.50%, store as basis points internally if easier, like 50 for 0.50% from a feePercent parameter of 50).
  - The \`feeRecipientAddress\` is where fees are sent. If not provided or address(0), fees could be burned (call \`_burn\`) or sent to the contract itself. State this clearly in comments.
  - Ensure transfers reflect the fee. E.g., sender pays X, fee is Y, recipient gets X-Y. The sender's balance decreases by X. The fee recipient's balance increases by Y. Total supply might decrease if fees are burned.
  - Consider overriding \`_update\` or \`_transfer\` from OpenZeppelin's ERC20 to implement this. Exclude fees for minting/burning and transfers involving the fee recipient or other designated addresses if necessary (e.g. owner, or make this configurable).
- **Max Transaction Amount**: If \`maxTransactionAmount\` > 0, add a check in transfers (\`_update\` or \`_transfer\`) to ensure \`amount\` does not exceed \`maxTransactionAmount\`. This limit might not apply to the deployer, minting/burning operations, or transfers to/from specific addresses like liquidity pools (this advanced exclusion logic can be mentioned as a TO-DO in comments).
- **Clarity**: Ensure all functions have NatSpec comments.
- **Security**: Prioritize security. Use Checks-Effects-Interactions pattern.
Ensure the constructor or initializer is correctly defined based on upgradability and parameters.
For example, if UUPS, the initializer might look like: \`function initialize(string memory name, string memory symbol, uint256 supplyToMint, address initialOwner) public initializer { ... }\`
Default to Solidity pragma ^0.8.20;
`,
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
    aiPromptEnhancement: "Generate a simple DAO contract. It should allow token holders to create proposals, vote on proposals (yes/no), and execute passed proposals. Quorum and voting period are key parameters. Use the provided governance token for voting power. Consider OpenZeppelin Governor contracts as a base if feasible for the complexity.",
  },
  {
    id: 'custom',
    name: 'Custom Contract',
    description: 'Describe your custom smart contract needs.',
    icon: Puzzle,
    parameters: [
      { name: 'customDescription', label: 'Contract Description', type: 'textarea', rows: 6, placeholder: 'e.g., A smart contract that manages a decentralized lottery system with weekly draws...', description: 'Detailed description of the contract functionality, features, and any specific requirements.' },
    ],
    aiPromptEnhancement: "The user will provide a custom description. Generate the Solidity code based on this description. Pay close attention to the details and requirements mentioned by the user. If details are sparse, make reasonable assumptions or create a flexible base. If OpenZeppelin contracts can be used for common patterns (Ownable, Pausable, ReentrancyGuard, ERC standards), please incorporate them.",
  }
];

    