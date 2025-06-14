
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
    aiPromptEnhancement: `Generate a feature-rich ERC20 token. Use OpenZeppelin contracts extensively. Default to Solidity pragma ^0.8.20;
- **Standard Compliance**: Strictly adhere to ERC20 standards. Implement ERC20Metadata.
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
  - If \`upgradable\` is 'UUPS', use OpenZeppelin Contracts UUPS (\`UUPSUpgradeable\`). The contract must inherit \`Initializable\`. Replace constructor with an \`initializer\` function that takes necessary parameters (name, symbol, initial supply owner etc.). The \`_authorizeUpgrade\` function must be implemented and restricted:
    - If 'Ownable', restrict with \`onlyOwner\`.
    - If 'Roles', restrict with \`onlyRole(UPGRADER_ROLE)\`.
- **Transaction Fee**: If \`transactionFeePercent\` > 0:
  - The fee is a percentage of the transaction amount. Example: \`transactionFeePercent\` = 0.5 means 0.5%. Store and calculate fees precisely (e.g., use basis points: 50 for 0.5%).
  - Transfer fees to \`feeRecipientAddress\`. If not provided or address(0), fees should be burned.
  - Override \`_update\` or \`_transfer\` from OpenZeppelin's ERC20. Ensure sender's balance decreases by X, recipient gets X - Fee, fee recipient gets Fee.
  - Optionally exclude fees for minting/burning operations, or for transfers involving specific addresses (e.g., owner, feeRecipientAddress itself). State such exclusions in comments.
- **Max Transaction Amount**: If \`maxTransactionAmount\` > 0, add a check in transfers (\`_update\` or \`_transfer\`) that \`amount\` <= \`maxTransactionAmount\`. This limit might not apply to deployer/owner, minting/burning.
- **Clarity & Security**: Ensure NatSpec comments for all public interfaces. Use Checks-Effects-Interactions.
- **Constructor/Initializer**: If UUPS, the initializer: \`function initialize(string memory _name, string memory _symbol, uint256 _supplyToMint, address _initialOwner) public initializer { ... }\`. If not upgradable, use a constructor. The \`_initialOwner\` receives the initial supply and Ownable/Admin roles.
`,
  },
  {
    id: 'liquidityPool',
    name: 'Liquidity Pool',
    description: 'A contract for providing liquidity between two ERC20 tokens (Uniswap V2 style).',
    icon: GitFork,
    parameters: [
      { name: 'poolName', label: 'Pool Name (for LP Token)', type: 'string', placeholder: 'TokenA/TokenB LP', description: 'A descriptive name for the liquidity pool token.' },
      { name: 'poolSymbol', label: 'Pool Symbol (for LP Token)', type: 'string', placeholder: 'LP-AB', description: 'A symbol for the liquidity pool token.' },
      { name: 'tokenA_Address', label: 'Token A Address', type: 'address', placeholder: '0x...', description: 'The contract address of the first token (e.g., WETH).' },
      { name: 'tokenB_Address', label: 'Token B Address', type: 'address', placeholder: '0x...', description: 'The contract address of the second token.' },
      { 
        name: 'feeBps', 
        label: 'Swap Fee (Basis Points)', 
        type: 'number', 
        defaultValue: 30, 
        placeholder: '30', 
        description: 'Swap fee in basis points (e.g., 30 for 0.30%). Max 10000 (100%).',
        advancedOnly: true
      },
      {
        name: 'accessControl',
        label: 'Access Control (for admin functions)',
        type: 'select',
        options: [
          { value: 'None', label: 'None' },
          { value: 'Ownable', label: 'Ownable (for fee changes, pausing etc.)' },
        ],
        defaultValue: 'Ownable',
        description: 'Controls admin functions like changing fees or pausing. Not for add/remove liquidity by users.',
        advancedOnly: true,
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
        description: 'Makes the contract upgradable. UUPS is recommended.',
        advancedOnly: true,
      },
    ],
    aiPromptEnhancement: `Generate a Uniswap V2-style liquidity pool contract. The LP token itself should be an ERC20. Default to Solidity pragma ^0.8.20;
- **Core Logic**: Implement a constant product AMM (k = x*y).
- **LP Token**: The contract should mint/burn its own LP tokens (ERC20 standard) representing shares in the pool. Use \`poolName\` and \`poolSymbol\` for the LP token metadata.
- **Interfaces**: Use \`IERC20\` for interacting with \`tokenA_Address\` and \`tokenB_Address\`.
- **Functions**:
    - \`addLiquidity(uint amountADesired, uint amountBDesired, uint amountAMin, uint amountBMin, address to, uint deadline)\`: Adds liquidity, mints LP tokens.
    - \`removeLiquidity(uint liquidity, uint amountAMin, uint amountBMin, address to, uint deadline)\`: Removes liquidity, burns LP tokens.
    - \`swap(uint amount0Out, uint amount1Out, address to, bytes calldata data)\`: Executes swaps. It expects \`amount0Out\` or \`amount1Out\` to be non-zero. The 'data' field can be used for flash loan callbacks if implementing that (optional advanced feature).
    - \`skim(address to)\`: Allows recovery of excess tokens sent to the pool.
    - \`sync()\`: Updates reserves if they are out of sync with balances.
- **Fees**:
    - A swap fee specified by \`feeBps\` (basis points, e.g., 30 for 0.3%) should be taken from the input amount of a swap.
    - This fee accrues to liquidity providers by remaining in the pool, thus increasing the value of LP tokens over time.
    - If 'Ownable' access control is chosen, provide a function \`setFee(uint16 newFeeBps)\` restricted to the owner.
- **Events**: Emit standard \`Mint\`, \`Burn\`, \`Swap\`, \`Sync\` events.
- **Upgradability**: If \`upgradable\` is 'UUPS', use OpenZeppelin's \`UUPSUpgradeable\` and \`Initializable\`. The initializer should take token addresses, LP token name/symbol. The \`_authorizeUpgrade\` function must be restricted (e.g., by \`onlyOwner\` if Ownable).
- **Access Control**: If 'Ownable', use OpenZeppelin's Ownable. The deployer becomes owner. This owner can call admin functions like \`setFee\`.
- **Security**: Use SafeMath/Solidity >0.8.0 checks for arithmetic. Implement reentrancy guard on swap and liquidity functions.
- **Clarity**: NatSpec comments for all public functions and state variables.
`,
  },
  {
    id: 'swapProtocol',
    name: 'Swap Protocol (Router)',
    description: 'A router contract for facilitating swaps across multiple liquidity pools (Uniswap V2 style).',
    icon: ArrowRightLeft,
    parameters: [
      { name: 'routerName', label: 'Router Name', type: 'string', placeholder: 'MySwap Router', description: 'The name for your swap router contract (not used in bytecode).' },
      { name: 'factoryAddress', label: 'Pair Factory Address', type: 'address', placeholder: '0x...', description: 'The address of the contract factory that creates liquidity pair contracts (e.g., Uniswap V2 Factory).' },
      { name: 'wethAddress', label: 'WETH Address', type: 'address', placeholder: '0x...', description: 'The address of the Wrapped Ether (WETH) contract on the target network.' },
      {
        name: 'accessControl',
        label: 'Access Control (for admin functions)',
        type: 'select',
        options: [
          { value: 'None', label: 'None' },
          { value: 'Ownable', label: 'Ownable (e.g., for pausing, emergency functions)' },
        ],
        defaultValue: 'Ownable',
        description: 'Controls administrative functions if any are implemented (e.g., pausing).',
        advancedOnly: true,
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
        description: 'Makes the router contract upgradable.',
        advancedOnly: true,
      },
    ],
    aiPromptEnhancement: `Generate a Uniswap V2-style Router contract. Default to Solidity pragma ^0.8.20;
- **Core Functionality**: The router facilitates swaps by interacting with liquidity pair contracts created by the \`factoryAddress\`. It must handle ETH directly by wrapping/unwrapping it using the \`wethAddress\`.
- **Interfaces**:
    - \`IUniswapV2Factory\` (or a generic \`IPairFactory\`) with a \`getPair(address tokenA, address tokenB) external view returns (address pair)\` function.
    - \`IUniswapV2Pair\` (or a generic \`ILiquidityPair\`) with \`swap(uint amount0Out, uint amount1Out, address to, bytes calldata data)\`, \`token0()\`, \`token1()\`, \`getReserves()\` functions.
    - \`IWETH\` with \`deposit() payable\`, \`withdraw(uint wad)\`, \`transfer(address to, uint value)\`.
    - \`IERC20\` for general token interactions.
- **Swap Functions (Implement all relevant variations)**:
    - \`swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline)\`
    - \`swapTokensForExactTokens(uint amountOut, uint amountInMax, address[] calldata path, address to, uint deadline)\`
    - \`swapExactETHForTokens(uint amountOutMin, address[] calldata path, address to, uint deadline) payable\` (handles ETH -> WETH -> Tokens)
    - \`swapTokensForExactETH(uint amountOut, uint amountInMax, address[] calldata path, address to, uint deadline)\` (handles Tokens -> WETH -> ETH)
    - \`swapExactTokensForETH(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline)\` (handles Tokens -> WETH -> ETH)
    - \`swapETHForExactTokens(uint amountOut, address[] calldata path, address to, uint deadline) payable\` (handles ETH -> WETH -> Tokens)
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
    description: 'A basic Decentralized Autonomous Organization for voting on proposals using OpenZeppelin Governor.',
    icon: Landmark,
    parameters: [
      { name: 'daoName', label: 'DAO Name', type: 'string', placeholder: 'My Governance DAO', description: 'The name of your DAO (used for the Governor contract).' },
      { name: 'proposalTokenAddress', label: 'Governance Token (ERC20Votes) Address', type: 'address', placeholder: '0x...', description: 'The ERC20Votes-compatible token used for voting power.' },
      { 
        name: 'votingDelay', 
        label: 'Voting Delay (Blocks)', 
        type: 'number', 
        defaultValue: 1, 
        description: 'Delay in blocks after a proposal is created before voting starts (e.g., 1 block).',
        advancedOnly: true
      },
      { 
        name: 'votingPeriod', 
        label: 'Voting Period (Blocks)', 
        type: 'number', 
        defaultValue: '17280', // ~3 days if 1 block = 15s
        description: 'Duration in blocks for which a proposal remains open for voting (e.g., 17280 blocks for ~3 days).', 
      },
      { 
        name: 'proposalThreshold', 
        label: 'Proposal Threshold (Tokens)', 
        type: 'number', 
        defaultValue: 0, 
        description: 'Minimum number of governance tokens required for an account to create a proposal. 0 means any token holder can propose.',
        advancedOnly: true 
      },
      { 
        name: 'quorumNumerator', 
        label: 'Quorum Numerator (%)', 
        type: 'number', 
        defaultValue: 4, 
        placeholder: '4', 
        description: 'Percentage of total voting power that must vote for a proposal to be valid (e.g., 4 for 4%). This value is used with GovernorVotesQuorumFraction.',
        advancedOnly: true
      },
      {
        name: 'upgradable',
        label: 'Upgradability (Governor Contract)',
        type: 'select',
        options: [
          { value: 'None', label: 'None (Immutable)' },
          { value: 'UUPS', label: 'UUPS Proxy (OpenZeppelin)' },
        ],
        defaultValue: 'None',
        description: 'Makes the Governor contract itself upgradable. UUPS is recommended.',
        advancedOnly: true,
      },
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
    name: 'Custom Contract',
    description: 'Describe your custom smart contract needs.',
    icon: Puzzle,
    parameters: [
      { name: 'customDescription', label: 'Contract Description', type: 'textarea', rows: 6, placeholder: 'e.g., A smart contract that manages a decentralized lottery system with weekly draws...', description: 'Detailed description of the contract functionality, features, and any specific requirements.' },
    ],
    aiPromptEnhancement: "The user will provide a custom description. Generate the Solidity code based on this description. Pay close attention to the details and requirements mentioned by the user. If details are sparse, make reasonable assumptions or create a flexible base. If OpenZeppelin contracts can be used for common patterns (Ownable, Pausable, ReentrancyGuard, ERC standards), please incorporate them. Default to Solidity pragma ^0.8.20;",
  }
];
