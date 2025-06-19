
import type { LucideIcon } from 'lucide-react';
import { Coins, GitFork, ArrowRightLeft, Landmark, FileJson, Puzzle, ShieldCheck, Edit, CircleDollarSign, Gem, Scale, Lock, Unlock, Settings2, Info as InfoIcon, Link as LinkIcon, Image as ImageIcon, FileText as FileTextIcon, Database, SlidersHorizontal, Palette } from 'lucide-react'; // Added more icons

export type ParameterType = 'string' | 'number' | 'boolean' | 'address' | 'select' | 'textarea';
export type ParameterCategory = 'core' | 'metadata' | 'feature' | 'control' | 'economics';


export interface ContractParameter {
  name: string;
  label: string;
  type: ParameterType;
  category?: ParameterCategory; // For grouping in UI
  defaultValue?: string | number | boolean;
  options?: { value: string; label: string }[];
  placeholder?: string;
  description?: string;
  rows?: number; 
  advancedOnly?: boolean; 
  dependsOn?: string; 
  dependsOnValue?: any; 
  icon?: LucideIcon; 
}

export interface ContractTemplate {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  parameters: ContractParameter[];
  aiPromptEnhancement?: string; 
}

const COMMON_EVM_TOKEN_ADDRESSES_ETH_MAINNET = {
  WETH: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
  USDC: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
  USDT: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
  DAI: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
};

const WETH_ADDRESSES_BY_NETWORK = {
  ETH_MAINNET: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
  BNB_CHAIN: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c', 
  POLYGON: '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270', 
  ARBITRUM: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
  OPTIMISM: '0x4200000000000000000000000000000000000006',
};


export const CONTRACT_TEMPLATES: ContractTemplate[] = [
  {
    id: 'erc20',
    name: 'ERC20 Token',
    description: 'A standard fungible token contract (e.g., for cryptocurrencies) with optional advanced features and metadata.',
    icon: Coins,
    parameters: [
      // Core Details Group
      { name: 'tokenName', label: 'Token Name', type: 'string', placeholder: 'My Awesome Token', description: 'The full name of your token.', icon: InfoIcon, category: 'core' },
      { name: 'tokenSymbol', label: 'Token Symbol', type: 'string', placeholder: 'MAT', description: 'The ticker symbol for your token (e.g., ETH).', icon: Gem, category: 'core' },
      { name: 'initialSupply', label: 'Initial Supply', type: 'number', placeholder: '1000000', description: 'Total tokens minted at deployment. If mintable & 0, none initially.', icon: CircleDollarSign, category: 'core' },
      { name: 'decimals', label: 'Decimals', type: 'number', defaultValue: 18, description: 'Number of decimal places (typically 18).', advancedOnly: true, icon: Scale, category: 'core' },
      
      // Project & Social Links Group / Metadata
      { name: 'projectDescription', label: 'Project Description', type: 'textarea', rows: 3, placeholder: 'Brief description of your token project...', description: 'Short summary for on-chain metadata.', icon: FileTextIcon, category: 'metadata' },
      { name: 'logoUrl', label: 'Logo URL', type: 'string', placeholder: 'https://example.com/logo.png', description: 'Direct HTTPS URL to the project/token logo.', icon: ImageIcon, category: 'metadata', advancedOnly: true },
      { name: 'websiteUrl', label: 'Website URL', type: 'string', placeholder: 'https://example.com', description: 'Official project website.', icon: LinkIcon, category: 'metadata', advancedOnly: true },
      { name: 'twitterHandle', label: 'X (Twitter) Handle', type: 'string', placeholder: '@MyTokenProject', description: 'Official X (Twitter) handle, including @.', icon: LinkIcon, category: 'metadata', advancedOnly: true },
      { name: 'telegramLink', label: 'Telegram Link', type: 'string', placeholder: 'https://t.me/MyTokenProject', description: 'Official Telegram group/channel link.', icon: LinkIcon, category: 'metadata', advancedOnly: true },

      // Features Group
      { name: 'accessControl', label: 'Access Control Model', type: 'select', options: [{ value: 'None', label: 'None (Public if applicable)' },{ value: 'Ownable', label: 'Ownable (OpenZeppelin)' },{ value: 'Roles', label: 'Roles (AccessControl)' },], defaultValue: 'Ownable', description: 'Mechanism for admin functions (minting, pausing).', icon: ShieldCheck, category: 'feature' },
      { name: 'mintable', label: 'Enable Minting', type: 'boolean', defaultValue: false, description: 'Allows new token creation post-deployment. Requires Access Control.', icon: Edit, category: 'feature' },
      { name: 'burnable', label: 'Enable Burning', type: 'boolean', defaultValue: false, description: 'Allows tokens to be destroyed.', advancedOnly: true, icon: Edit, category: 'feature' },
      { name: 'pausable', label: 'Enable Pausable', type: 'boolean', defaultValue: false, description: 'Allows pausing token transfers. Requires Access Control.', advancedOnly: true, icon: Lock, category: 'feature' },
      
      // Economics Group
      { name: 'transactionFeePercent', label: 'Transaction Fee (%)', type: 'number', defaultValue: 0, placeholder: '0.5', description: 'Percentage fee on transfers (0-100). Max 2 decimals (e.g., 0.25).', advancedOnly: true, icon: CircleDollarSign, category: 'economics' },
      { name: 'feeRecipientAddress', label: 'Fee Recipient Address', type: 'address', placeholder: '0x...', description: 'Address for transaction fees. Required if Fee > 0.', advancedOnly: true, dependsOn: 'transactionFeePercent', dependsOnValue: (val: number) => val > 0, icon: Landmark, category: 'economics' },
      { name: 'maxTransactionAmount', label: 'Max Tx Amount', type: 'number', defaultValue: 0, placeholder: '10000', description: 'Max tokens per transaction. 0 for no limit.', advancedOnly: true, icon: Scale, category: 'economics' },
      
      // Control & Upgrades Group
      { name: 'upgradable', label: 'Upgradability Model', type: 'select', options: [{ value: 'None', label: 'Immutable' },{ value: 'UUPS', label: 'UUPS Proxy (OpenZeppelin)' },], defaultValue: 'None', description: 'Makes contract upgradable (UUPS recommended).', advancedOnly: true, icon: Settings2, category: 'control' },
    ],
    aiPromptEnhancement: `Generate a feature-rich ERC20 token. Use OpenZeppelin contracts extensively. Default to Solidity pragma ^0.8.20;
- **Standard Compliance**: Strictly adhere to ERC20 standards. Implement ERC20Metadata.
- **Metadata Fields**:
  - If \`projectDescription\` is provided, add \`string public projectDescription;\` and \`function getProjectDescription() public view returns (string memory) { return projectDescription; }\`.
  - If \`logoUrl\` is provided, add \`string public logoURL;\` and \`function getLogoURL() public view returns (string memory) { return logoURL; }\`.
  - If \`websiteUrl\` is provided, add \`string public websiteURL;\` and \`function getWebsiteURL() public view returns (string memory) { return websiteURL; }\`.
  - If \`twitterHandle\` is provided, add \`string public twitterHandle;\` and \`function getTwitterHandle() public view returns (string memory) { return twitterHandle; }\`.
  - If \`telegramLink\` is provided, add \`string public telegramLink;\` and \`function getTelegramLink() public view returns (string memory) { return telegramLink; }\`.
  - These metadata fields should be set in the constructor or initializer. Include NatSpec comments for them.
- **Access Control**:
  - If 'accessControl' is 'Ownable', use OpenZeppelin's Ownable. The deployer becomes the owner.
  - If 'accessControl' is 'Roles', use OpenZeppelin's AccessControl. Define MINTER_ROLE, PAUSER_ROLE, UPGRADER_ROLE (if upgradable and UUPS), and ADMIN_ROLE. Grant all roles to the deployer initially. The ADMIN_ROLE should be able to grant/revoke roles.
  - If 'accessControl' is 'None', features like minting/pausing should either be public (dangerous, add strong warnings in comments) or disabled if they inherently require admin control.
- **Initial Supply & Decimals**: Use \`tokenName\`, \`tokenSymbol\`, \`initialSupply\`, and \`decimals\` as provided.
  - If \`mintable\` is false, the \`initialSupply\` is minted to the contract deployer during construction/initialization and becomes the fixed total supply.
  - If \`mintable\` is true: if \`initialSupply\` > 0, mint this amount to the deployer. If \`initialSupply\` is 0, no tokens are minted initially.
- **Mintable**: If \`mintable\` is true, provide a \`mint(address to, uint256 amount)\` function.
  - If 'Ownable', restrict with \`onlyOwner\`.
  - If 'Roles', restrict with \`onlyRole(MINTER_ROLE)\`.
  - If 'None', make it public only if safe and sensible; otherwise, this feature should be considered disabled or requires Ownable/Roles.
- **Burnable**: If \`burnable\` is true, use OpenZeppelin's ERC20Burnable. This provides \`burn(uint256 amount)\` (users burn their own) and \`burnFrom(address account, uint256 amount)\`.
- **Pausable**: If \`pausable\` is true, use OpenZeppelin's Pausable. Key functions (\`transfer\`, \`transferFrom\`, \`approve\`, \`mint\`, \`burn\`) must be guarded by \`whenNotPaused\`. The pause/unpause functions must be restricted:
  - If 'Ownable', restrict with \`onlyOwner\`.
  - If 'Roles', restrict with \`onlyRole(PAUSER_ROLE)\`.
- **Upgradability**:
  - If \`upgradable\` is 'UUPS', use OpenZeppelin Contracts UUPS (\`UUPSUpgradeable\`). The contract must inherit \`Initializable\`. Replace constructor with an \`initializer\` function that takes necessary parameters (name, symbol, initial supply owner, and all metadata fields like projectDescription, logoUrl, etc.). The \`_authorizeUpgrade\` function must be implemented and restricted:
    - If 'Ownable', restrict with \`onlyOwner\`.
    - If 'Roles', restrict with \`onlyRole(UPGRADER_ROLE)\`.
- **Transaction Fee**: If \`transactionFeePercent\` > 0:
  - The fee is a percentage of the transaction amount. Example: \`transactionFeePercent\` = 0.5 means 0.5%. Store and calculate fees precisely (e.g., use basis points: 50 for 0.5%).
  - Transfer fees to \`feeRecipientAddress\`. If not provided or address(0), fees should be burned.
  - Override \`_update\` or \`_transfer\` from OpenZeppelin's ERC20. Ensure sender's balance decreases by X, recipient gets X - Fee, fee recipient gets Fee.
  - Optionally exclude fees for minting/burning operations, or for transfers involving specific addresses (e.g., owner, feeRecipientAddress itself). State such exclusions in comments.
- **Max Transaction Amount**: If \`maxTransactionAmount\` > 0, add a check in transfers (\`_update\` or \`_transfer\`) that \`amount\` <= \`maxTransactionAmount\`. This limit might not apply to deployer/owner, minting/burning.
- **Clarity & Security**: Ensure NatSpec comments for all public interfaces. Use Checks-Effects-Interactions.
- **Constructor/Initializer**: If UUPS, the initializer: \`function initialize(string memory _name, string memory _symbol, uint256 _supplyToMint, address _initialOwner, string memory _projectDesc, string memory _logo, string memory _website, string memory _twitter, string memory _telegram) public initializer { ... }\`. If not upgradable, use a constructor. The \`_initialOwner\` receives the initial supply and Ownable/Admin roles. Initialize all metadata fields in the constructor/initializer.
`,
  },
  {
    id: 'liquidityPool',
    name: 'Liquidity Pool Pair',
    description: 'A Uniswap V2-style pair contract for providing liquidity between two specific ERC20 tokens.',
    icon: GitFork,
    parameters: [
      { name: 'poolName', label: 'Pool Name (LP Token)', type: 'string', placeholder: 'TokenA/TokenB LP', description: 'Descriptive name for the liquidity pool token.', icon: Palette, category: 'core' },
      { name: 'poolSymbol', label: 'Pool Symbol (LP Token)', type: 'string', placeholder: 'LP-AB', description: 'Symbol for the liquidity pool token.', icon: Palette, category: 'core' },
      { name: 'tokenA_Address', label: 'Token A Address', type: 'address', defaultValue: '0x...', placeholder: 'Contract address for Token A', description: 'Contract address of the first ERC20 token.', icon: Database, category: 'core' },
      { name: 'tokenB_Address', label: 'Token B Address', type: 'address', defaultValue: '0x...', placeholder: 'Contract address for Token B', description: 'Contract address of the second ERC20 token.', icon: Database, category: 'core' },
      { name: 'feeBps', label: 'Swap Fee (Basis Points)', type: 'number', defaultValue: 30, placeholder: '30', description: 'Swap fee in basis points (e.g., 30 for 0.30%). Accrues to LPs.', advancedOnly: true, icon: CircleDollarSign, category: 'economics' },
      { name: 'accessControl', label: 'Access Control (Admin)', type: 'select', options: [{ value: 'None', label: 'None' },{ value: 'Ownable', label: 'Ownable (Fee changes, etc.)' },], defaultValue: 'Ownable', description: 'Controls admin functions like fee changes. Does not affect LP provision.', advancedOnly: true, icon: ShieldCheck, category: 'control' },
      { name: 'upgradable', label: 'Upgradability', type: 'select', options: [{ value: 'None', label: 'Immutable' },{ value: 'UUPS', label: 'UUPS Proxy' },], defaultValue: 'None', description: 'Makes the contract upgradable (UUPS recommended for pairs).', advancedOnly: true, icon: Settings2, category: 'control' },
    ],
    aiPromptEnhancement: `Generate a Uniswap V2-style Pair contract for two specific ERC20 tokens. Default to Solidity pragma ^0.8.20;
- **Pair Definition**: The contract will be for a single pair defined by \`tokenA_Address\` and \`tokenB_Address\`. These should be initialized in the constructor (or an \`initialize\` function if upgradable) and determine \`token0\` and \`token1\` (sorted by address).
- **LP Token**: The contract itself IS an ERC20 token representing liquidity provider shares. Use \`poolName\` and \`poolSymbol\` for its metadata. It should inherit from OpenZeppelin's ERC20 (or ERC20Upgradeable if UUPS).
- **Core Logic**: Implement a constant product AMM (k = x*y).
- **Interfaces**: Use \`IERC20\` for interacting with \`tokenA_Address\` and \`tokenB_Address\`.
- **Key Functions**:
    - \`constructor(address _tokenA, address _tokenB)\` (or \`initialize(address _tokenA, address _tokenB)\` if UUPS): Sets up \`token0\` and \`token1\`.
    - \`mint(address to) external returns (uint liquidity)\`: Mints LP tokens to \`to\` after liquidity providers transfer underlying tokens to the pair. Calculates liquidity based on current reserves and amounts transferred. Must be protected by a reentrancy guard and lock.
    - \`burn(address to) external returns (uint amount0, uint amount1)\`: Burns LP tokens (transferred to the pair beforehand) from \`msg.sender\` (or an approved source, but typically LP tokens are sent to pair first) and sends back the underlying \`token0\` and \`token1\` to the \`to\` address. Must be protected by a reentrancy guard and lock.
    - \`swap(uint amount0Out, uint amount1Out, address to, bytes calldata data) external\`: Executes swaps. Requires tokens to be sent to the pair first (unless \`data\` is used for a flash-loan-like callback). Must be protected by a reentrancy guard and lock. Implements the swap fee (\`feeBps\`) by leaving a portion of input tokens in reserves.
    - \`skim(address to) external\`: Recovers any excess tokens sent to the pair.
    - \`sync() external\`: Updates reserves to match current balances if they diverge.
- **View Functions**: \`getReserves() returns (uint112 _reserve0, uint112 _reserve1, uint32 _blockTimestampLast)\`, \`token0()\`, \`token1()\`, \`kLast()\`, \`price0CumulativeLast()\`, \`price1CumulativeLast()\`.
- **Fees**:
    - The swap fee is specified by \`feeBps\` (e.g., 30 for 0.3%). This fee is collected by liquidity providers by remaining in the pool, effectively increasing the value of their LP shares over time. The fee is applied during swaps.
    - If 'Ownable' access control is chosen, provide a function \`setFee(uint16 newFeeBps)\` restricted to the owner to update the swap fee.
- **Upgradability**: If \`upgradable\` is 'UUPS', use OpenZeppelin's \`UUPSUpgradeable\` and \`Initializable\`. The \`_authorizeUpgrade\` function must be implemented and restricted (e.g., by \`onlyOwner\` if Ownable).
- **Access Control**: If 'Ownable', use OpenZeppelin's Ownable. The deployer becomes owner. This owner can call admin functions like \`setFee\`.
- **Security**: Use SafeMath/Solidity >0.8.0 checks. Implement reentrancy guard (lock modifier) on \`mint\`, \`burn\`, \`swap\`. Follow Checks-Effects-Interactions.
- **Clarity**: NatSpec comments for all public functions and state variables.
`,
  },
  {
    id: 'swapProtocol',
    name: 'Swap Protocol (Router)',
    description: 'A router contract for facilitating swaps across multiple liquidity pools (Uniswap V2 style).',
    icon: ArrowRightLeft,
    parameters: [
      { name: 'routerName', label: 'Router Name', type: 'string', placeholder: 'MySwap Router', description: 'Name for your swap router contract.', icon: Palette, category: 'core' },
      { name: 'factoryAddress', label: 'Pair Factory Address', type: 'address', placeholder: '0x...', description: 'Address of the factory creating liquidity pairs.', icon: Database, category: 'core' },
      { name: 'wethAddress', label: 'WETH Address (Network)', type: 'select', defaultValue: WETH_ADDRESSES_BY_NETWORK.ETH_MAINNET, options: [ { label: "WETH (Ethereum Mainnet)", value: WETH_ADDRESSES_BY_NETWORK.ETH_MAINNET },{ label: "WBNB (BNB Chain)", value: WETH_ADDRESSES_BY_NETWORK.BNB_CHAIN },{ label: "WMATIC (Polygon)", value: WETH_ADDRESSES_BY_NETWORK.POLYGON },{ label: "WETH (Arbitrum One)", value: WETH_ADDRESSES_BY_NETWORK.ARBITRUM },{ label: "WETH (Optimism)", value: WETH_ADDRESSES_BY_NETWORK.OPTIMISM },], description: 'Wrapped Native Token address for your target network.', icon: Database, category: 'core' },
      { name: 'accessControl', label: 'Access Control (Admin)', type: 'select', options: [{ value: 'None', label: 'None' },{ value: 'Ownable', label: 'Ownable (Pausing, etc.)' },], defaultValue: 'Ownable', description: 'Controls admin functions if any (e.g., pausing).', advancedOnly: true, icon: ShieldCheck, category: 'control' },
      { name: 'upgradable', label: 'Upgradability', type: 'select', options: [{ value: 'None', label: 'Immutable' },{ value: 'UUPS', label: 'UUPS Proxy' },], defaultValue: 'None', description: 'Makes the router contract upgradable.', advancedOnly: true, icon: Settings2, category: 'control' },
    ],
    aiPromptEnhancement: `Generate a Uniswap V2-style Router contract. Default to Solidity pragma ^0.8.20;
- **Core Functionality**: The router facilitates swaps by interacting with liquidity pair contracts created by the \`factoryAddress\`. It must handle ETH directly by wrapping/unwrapping it using the \`wethAddress\` selected by the user (which corresponds to the wrapped native token of the target chain).
- **Interfaces**:
    - \`IUniswapV2Factory\` (or a generic \`IPairFactory\`) with a \`getPair(address tokenA, address tokenB) external view returns (address pair)\` function.
    - \`IUniswapV2Pair\` (or a generic \`ILiquidityPair\`) with \`swap(uint amount0Out, uint amount1Out, address to, bytes calldata data)\`, \`token0()\`, \`token1()\`, \`getReserves()\` functions.
    - \`IWETH\` (matching the selected \`wethAddress\`) with \`deposit() payable\`, \`withdraw(uint wad)\`, \`transfer(address to, uint value)\`.
    - \`IERC20\` for general token interactions.
- **Swap Functions (Implement all relevant variations)**:
    - \`swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline)\`
    - \`swapTokensForExactTokens(uint amountOut, uint amountInMax, address[] calldata path, address to, uint deadline)\`
    - \`swapExactETHForTokens(uint amountOutMin, address[] calldata path, address to, uint deadline) payable\` (handles NativeCoin -> WETH -> Tokens)
    - \`swapTokensForExactETH(uint amountOut, uint amountInMax, address[] calldata path, address to, uint deadline)\` (handles Tokens -> WETH -> NativeCoin)
    - \`swapExactTokensForETH(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline)\` (handles Tokens -> WETH -> NativeCoin)
    - \`swapETHForExactTokens(uint amountOut, address[] calldata path, address to, uint deadline) payable\` (handles NativeCoin -> WETH -> Tokens)
    - Consider supporting \`swapExactTokensForTokensSupportingFeeOnTransferTokens\` and \`swapExactETHForTokensSupportingFeeOnTransferTokens\` / \`swapExactTokensForETHSupportingFeeOnTransferTokens\` if you want to handle fee-on-transfer tokens robustly (this is more advanced).
- **Liquidity Functions**:
    - \`addLiquidity(address tokenA, address tokenB, uint amountADesired, uint amountBDesired, uint amountAMin, uint amountBMin, address to, uint deadline)\`
    - \`addLiquidityETH(address token, uint amountTokenDesired, uint amountTokenMin, uint amountETHMin, address to, uint deadline) payable\`
    - \`removeLiquidity(address tokenA, address tokenB, uint liquidity, uint amountAMin, uint amountBMin, address to, uint deadline)\`
    - \`removeLiquidityETH(address token, uint liquidity, uint amountTokenMin, uint amountETHMin, address to, uint deadline)\`
    - \`removeLiquidityWithPermit\` and \`removeLiquidityETHWithPermit\` (advanced, requires EIP-2612 permit signature).
- **Helper Functions**:
    - Library for calculating pair addresses if needed (e.g., UniswapV2Library's \`pairFor\` and \`sortTokens\`).
    - Library for safe math and safe ERC20 transfers.
- **Path Handling**: Swaps along a \`path\` of token addresses. The router must iterate through pairs, calculate amounts, and make sequential swaps.
- **Deadline**: All user-facing functions should include a \`deadline\` parameter to protect against front-running / long-pending transactions.
- **Security**:
    - Use reentrancy guards if appropriate (though routers are typically less stateful than pairs).
    - Ensure correct handling of token approvals and transfers (\`safeTransferFrom\`, \`safeApprove\`).
    - Validate paths and amounts.
- **Access Control**: If 'Ownable', use OpenZeppelin's Ownable. The deployer becomes owner. Admin functions could include pausing all router activity or updating critical parameters (though less common for V2-style routers).
- **Upgradability**: If \`upgradable\` is 'UUPS', use OpenZeppelin's \`UUPSUpgradeable\` and \`Initializable\`. The initializer should take \`factoryAddress\` and \`wethAddress\`. The \`_authorizeUpgrade\` function must be restricted.
- **Clarity**: NatSpec comments for all public functions.
`,
  },
  {
    id: 'dao',
    name: 'DAO (Basic Governance)',
    description: 'A basic DAO for voting on proposals using OpenZeppelin Governor.',
    icon: Landmark,
    parameters: [
      { name: 'daoName', label: 'DAO Name', type: 'string', placeholder: 'My Governance DAO', description: 'Name of your DAO (for Governor contract).', icon: Palette, category: 'core' },
      { name: 'proposalTokenAddress', label: 'Governance Token (ERC20Votes)', type: 'address', placeholder: '0x...', description: 'ERC20Votes-compatible token for voting power.', icon: Database, category: 'core' },
      { name: 'votingDelay', label: 'Voting Delay (Blocks)', type: 'number', defaultValue: 1, description: 'Delay in blocks after proposal before voting starts (e.g., 1 block).', advancedOnly: true, icon: SlidersHorizontal, category: 'feature' },
      { name: 'votingPeriod', label: 'Voting Period (Blocks)', type: 'number', defaultValue: '17280', description: 'Duration in blocks for voting (e.g., 17280 for ~3 days).', icon: SlidersHorizontal, category: 'feature' },
      { name: 'proposalThreshold', label: 'Proposal Threshold (Tokens)', type: 'number', defaultValue: 0, description: 'Min governance tokens to create a proposal. 0 for any holder.', advancedOnly: true, icon: SlidersHorizontal, category: 'feature' },
      { name: 'quorumNumerator', label: 'Quorum Numerator (%)', type: 'number', defaultValue: 4, placeholder: '4', description: 'Percentage of total voting power needed (e.g., 4 for 4%).', advancedOnly: true, icon: Scale, category: 'feature' },
      { name: 'upgradable', label: 'Upgradability (Governor)', type: 'select', options: [{ value: 'None', label: 'Immutable' },{ value: 'UUPS', label: 'UUPS Proxy' },], defaultValue: 'None', description: 'Makes Governor contract upgradable (UUPS recommended).', advancedOnly: true, icon: Settings2, category: 'control' },
    ],
    aiPromptEnhancement: `Generate a DAO governance contract using OpenZeppelin Governor. Default to Solidity pragma ^0.8.20;
- **Base Contracts**: The main contract should inherit from:
    - \`Governor\`
    - \`GovernorSettings\` (for votingDelay, votingPeriod, proposalThreshold)
    - \`GovernorCountingSimple\` (for simple yes/no/abstain votes)
    - \`GovernorVotes\` (to use an ERC20Votes token for vote accounting)
    - \`GovernorVotesQuorumFraction\` (for quorum based on a percentage of total supply)
    - Optionally \`GovernorTimelockControl\` if a Timelock contract is also to be used (outside scope of this basic setup, but mention its role).
- **ERC20Votes Token**: The \`proposalTokenAddress\` MUST be an ERC20Votes compatible token. The Governor will use this token's \`getPastVotes\` function.
- **Constructor/Initializer**:
    - If NOT upgradable: The constructor should initialize the Governor with:
        - \`_name\`: \`daoName\`
        - \`_token\`: The \`IVotes\` instance of \`proposalTokenAddress\`.
        - \`_votingDelay\`: \`votingDelay\` parameter.
        - \`_votingPeriod\`: \`votingPeriod\` parameter.
        - \`_proposalThreshold\`: \`proposalThreshold\` parameter.
        - \`_quorumNumerator\`: \`quorumNumerator\` parameter (for \`GovernorVotesQuorumFraction\`).
    - If \`upgradable\` is 'UUPS':
        - The contract must inherit \`Initializable\` and \`UUPSUpgradeable\`.
        - An \`initialize\` function should take these parameters.
        - The \`_authorizeUpgrade\` function must be implemented and restricted (e.g., to the DAO itself via a proposal, or to a specific admin role if one exists outside the Governor).
- **Core Parameters Implementation**:
    - \`name()\`: Should return \`daoName\`.
    - \`votingDelay()\`: Should return \`votingDelay\`.
    - \`votingPeriod()\`: Should return \`votingPeriod\`.
    - \`proposalThreshold()\`: Should return \`proposalThreshold\`.
    - \`quorumNumerator()\`: Part of \`GovernorVotesQuorumFraction\` setup. The \`quorum(uint256 blockNumber)\` view function will then use this.
- **Proposal Lifecycle**: The contract will inherently support:
    - \`propose(address[] memory targets, uint256[] memory values, bytes[] memory calldatas, string memory description)\`
    - \`castVote(uint256 proposalId, uint8 support)\` (support: 0=Against, 1=For, 2=Abstain)
    - \`execute(address[] memory targets, uint256[] memory values, bytes[] memory calldatas, bytes32 descriptionHash)\`
- **Security & Clarity**:
    - Ensure NatSpec comments for all public interfaces and important functions.
    - The contract primarily relies on OpenZeppelin's audited components.
- **Admin/Executor Roles**: The Governor itself is the primary executor. By default, any account can propose if they meet the \`proposalThreshold\`. The DAO (via successful proposals) can grant/revoke roles on other contracts or execute arbitrary transactions.
- **Timelock Recommendation**: Mention in comments that for serious DAOs, proposals should typically be executed via a Timelock contract for added security and review period, and that \`GovernorTimelockControl\` would be used for this.
`,
  },
  {
    id: 'custom',
    name: 'Custom Contract Logic',
    description: 'Input custom directives for the AI to synthesize unique contract logic.',
    icon: Puzzle,
    parameters: [
      { name: 'customDescription', label: 'Contract Directives', type: 'textarea', rows: 6, placeholder: 'e.g., A decentralized oracle system for off-chain data verification with staking and dispute resolution mechanisms...', description: 'Detailed description of contract functionality, features, and specific requirements.', category: 'core', icon: FileJson },
    ],
    aiPromptEnhancement: "The user will provide custom directives. Generate the Solidity code based on this description. Pay close attention to the details and requirements mentioned by the user. If details are sparse, make reasonable assumptions or create a flexible base. If OpenZeppelin contracts can be used for common patterns (Ownable, Pausable, ReentrancyGuard, ERC standards), please incorporate them. Default to Solidity pragma ^0.8.20;",
  }
];
