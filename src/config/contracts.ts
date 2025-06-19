
import type { LucideIcon } from 'lucide-react';
import { Coins, GitFork, ArrowRightLeft, Landmark, FileJson, Puzzle, ShieldCheck, Edit, CircleDollarSign, Gem, Scale, Lock, Settings2, Info as InfoIcon, Link as LinkIcon, Image as ImageIcon, FileText as FileTextIcon, Database, SlidersHorizontal, Palette, Percent, Users, Briefcase, Clock, BarChartBig, ShieldEllipsis, KeyRound, Blocks } from 'lucide-react';

export type ParameterType = 'string' | 'number' | 'boolean' | 'address' | 'select' | 'textarea';
export type ParameterCategory = 'core' | 'metadata' | 'feature' | 'control' | 'economics';


export interface ContractParameter {
  name: string;
  label: string;
  type: ParameterType;
  category?: ParameterCategory;
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
      { name: 'tokenName', label: 'Token Name', type: 'string', placeholder: 'Epic Token', description: 'The full, human-readable name of your token (e.g., "EpicToken").', icon: Palette, category: 'core' },
      { name: 'tokenSymbol', label: 'Token Symbol', type: 'string', placeholder: 'EPIC', description: 'The abbreviated ticker symbol for your token (e.g., "EPIC").', icon: Gem, category: 'core' },
      { name: 'initialSupply', label: 'Initial Supply', type: 'number', placeholder: '1000000000', description: 'Total tokens minted at deployment. If mintable & 0, no initial minting. Amount in full units (not wei).', icon: CircleDollarSign, category: 'core' },
      { name: 'decimals', label: 'Decimals', type: 'number', defaultValue: 18, placeholder: '18', description: 'Number of decimal places for token divisibility (18 is standard).', advancedOnly: true, icon: Scale, category: 'core' },

      { name: 'projectDescription', label: 'Project Description', type: 'textarea', rows: 3, placeholder: 'A revolutionary token for the new digital economy...', description: 'Brief description of the token and its project for on-chain metadata.', icon: FileTextIcon, category: 'metadata' },
      { name: 'logoUrl', label: 'Logo URL', type: 'string', placeholder: 'https://example.com/logo.png', description: 'HTTPS URL to the project/token logo image (PNG, SVG preferred).', icon: ImageIcon, category: 'metadata', advancedOnly: true },
      { name: 'websiteUrl', label: 'Website URL', type: 'string', placeholder: 'https://epictoken.xyz', description: 'Official project or token website URL.', icon: LinkIcon, category: 'metadata', advancedOnly: true },
      { name: 'twitterHandle', label: 'X (Twitter) Handle', type: 'string', placeholder: '@EpicToken', description: 'Official X (Twitter) handle, including the "@" symbol.', icon: Users, category: 'metadata', advancedOnly: true },
      { name: 'telegramLink', label: 'Telegram Link', type: 'string', placeholder: 'https://t.me/EpicTokenOfficial', description: 'Official Telegram group or channel link.', icon: Users, category: 'metadata', advancedOnly: true },

      { name: 'accessControl', label: 'Access Control Model', type: 'select', options: [{ value: 'None', label: 'None (Public if applicable)' },{ value: 'Ownable', label: 'Ownable (Single Owner)' },{ value: 'Roles', label: 'Roles (AccessControl)' },], defaultValue: 'Ownable', description: 'Mechanism for administrative functions (minting, pausing, upgrades).', icon: ShieldCheck, category: 'feature' },
      { name: 'mintable', label: 'Enable Minting', type: 'boolean', defaultValue: false, description: 'Allows creation of new tokens after deployment. Requires appropriate Access Control.', icon: Edit, category: 'feature' },
      { name: 'burnable', label: 'Enable Burning', type: 'boolean', defaultValue: false, description: 'Allows tokens to be permanently destroyed by holders or approved accounts.', advancedOnly: true, icon: Edit, category: 'feature' },
      { name: 'pausable', label: 'Enable Pausable Transfers', type: 'boolean', defaultValue: false, description: 'Allows pausing all token transfers in emergencies. Requires appropriate Access Control.', advancedOnly: true, icon: Lock, category: 'feature' },
      
      { name: 'transactionFeePercent', label: 'Transaction Fee (%)', type: 'number', defaultValue: 0, placeholder: '0.5', description: 'Percentage fee on transfers (0-10). Use up to 2 decimals (e.g., 0.25 for 0.25%).', advancedOnly: true, icon: Percent, category: 'economics' },
      { name: 'feeRecipientAddress', label: 'Fee Recipient Address', type: 'address', placeholder: '0xRecipientAddress...', description: 'Address to receive transaction fees. Required if fee > 0.', advancedOnly: true, dependsOn: 'transactionFeePercent', dependsOnValue: (val: number) => val > 0, icon: Landmark, category: 'economics' },
      { name: 'maxTransactionAmount', label: 'Max Transaction Amount', type: 'number', defaultValue: 0, placeholder: '1000000', description: 'Maximum tokens allowed per single transaction. 0 for no limit. Amount in full units.', advancedOnly: true, icon: BarChartBig, category: 'economics' },
      
      { name: 'upgradable', label: 'Upgradability Model', type: 'select', options: [{ value: 'None', label: 'Immutable (Not Upgradable)' },{ value: 'UUPS', label: 'UUPS Proxy (Recommended)' },], defaultValue: 'None', description: 'Allows the contract logic to be updated post-deployment. UUPS is generally preferred.', advancedOnly: true, icon: Settings2, category: 'control' },
    ],
    aiPromptEnhancement: `Generate a Solidity smart contract for an ERC20 token.
**Solidity Version**: Use \\\`pragma solidity ^0.8.20;\\\`

**Core ERC20 Implementation**:
- Use OpenZeppelin contracts. If not upgradable, import from \\\`@openzeppelin/contracts/token/ERC20/ERC20.sol\\\`, \\\`@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol\\\` (if burnable), \\\`@openzeppelin/contracts/access/Ownable.sol\\\` (if Ownable).
- If UUPS upgradable, import from \\\`@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol\\\`, \\\`@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20BurnableUpgradeable.sol\\\` (if burnable), \\\`@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol\\\` (if Ownable), and \\\`@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol\\\`, \\\`@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol\\\`.
- Contract name should be \\\`{{tokenName}}\\\` (e.g., "EpicToken" -> contract EpicToken is ...).

**Constructor / Initializer**:
- **If NOT upgradable (\\\`upgradable\\\` is 'None')**:
    - Use a \\\`constructor(string memory _name, string memory _symbol, uint256 _initialSupply, address _ownerOrDeployer, string memory _projectDesc, string memory _logo, string memory _website, string memory _twitter, string memory _telegram)\\\`.
    - Initialize \\\`ERC20(_name, _symbol)\\\`.
    - If \\\`initialSupply\\\` > 0, mint \\\`_initialSupply * (10**decimals())\\\` to \\\`_ownerOrDeployer\\\`.
    - If 'Ownable' access control, set \\\`_ownerOrDeployer\\\` as the initial owner.
    - If 'Roles' access control, grant \\\`DEFAULT_ADMIN_ROLE\\\` and all other applicable roles (MINTER_ROLE, PAUSER_ROLE) to \\\`_ownerOrDeployer\\\`.
- **If UUPS upgradable (\\\`upgradable\\\` is 'UUPS')**:
    - The contract MUST inherit \\\`Initializable\\\`, \\\`ERC20Upgradeable\\\`, relevant extensions (like \\\`ERC20BurnableUpgradeable\\\`), access control (like \\\`OwnableUpgradeable\\\` or \\\`AccessControlUpgradeable\\\`), and \\\`UUPSUpgradeable\\\`.
    - Create an \\\`initializer(string memory _name, string memory _symbol, uint8 _decimals, uint256 _initialSupply, address _initialAdmin, string memory _projectDesc, string memory _logo, string memory _website, string memory _twitter, string memory _telegram) public initializer\\\` function.
    - Inside, call initializers for all parent contracts: \\\`__ERC20_init(_name, _symbol, _decimals);\\\`, \\\`__Ownable_init(_initialAdmin);\\\` or \\\`__AccessControl_init();\\\`, \\\`__UUPSUpgradeable_init();\\\`.
    - If \\\`_initialSupply\\\` > 0, mint \\\`_initialSupply * (10**_decimals)\\\` to \\\`_initialAdmin\\\`.
    - If 'Roles' access control, grant \\\`DEFAULT_ADMIN_ROLE\\\` and other roles to \\\`_initialAdmin\\\` using \\\`_grantRole(DEFAULT_ADMIN_ROLE, _initialAdmin)\\\`, etc.
- **Metadata Fields**: Store \\\`projectDescription\\\`, \\\`logoUrl\\\`, \\\`websiteUrl\\\`, \\\`twitterHandle\\\`, \\\`telegramLink\\\` in public string state variables if provided. These should be set in the constructor/initializer. Include public getter functions for each. For example: \\\`string public projectDescription;\\\` and \\\`function getProjectDescription() public view returns (string memory) { return projectDescription; }\\\`.

**Parameters Implementation**:
- **\\\`tokenName\\\`**: Pass to ERC20 constructor/initializer.
- **\\\`tokenSymbol\\\`**: Pass to ERC20 constructor/initializer.
- **\\\`decimals\\\`**: Pass to ERC20 constructor/initializer if upgradable. If not upgradable, OpenZeppelin's ERC20.sol has a virtual \\\`decimals()\\\` function that returns 18 by default, which can be overridden if needed (but usually default is fine).
- **\\\`initialSupply\\\`**: Convert to wei using \\\`decimals\\\` (\\\`initialSupply * (10**_decimals)\\\`) before minting.

**Access Control (\\\`accessControl\\\` parameter)**:
- **If 'Ownable'**: Inherit \\\`Ownable\\\` or \\\`OwnableUpgradeable\\\`. Functions requiring restriction (mint, pause, unpause, _authorizeUpgrade) use the \\\`onlyOwner\\\` modifier.
- **If 'Roles'**: Inherit \\\`AccessControl\\\` or \\\`AccessControlUpgradeable\\\`.
    - Define bytes32 public constant roles: \\\`MINTER_ROLE\\\`, \\\`PAUSER_ROLE\\\`, \\\`UPGRADER_ROLE\\\` (if UUPS).
    - Grant these roles to the initial admin/owner in the constructor/initializer.
    - \\\`DEFAULT_ADMIN_ROLE\\\` can grant/revoke roles.
    - Restricted functions use \\\`onlyRole(SPECIFIC_ROLE)\\\` modifier.
- **If 'None'**: Features requiring admin control (mint, pause, upgrade) should effectively be disabled or made immutable if they can't be public. This is generally not recommended for features like minting.

**Features**:
- **\\\`mintable\\\`**:
    - If true, include \\\`function mint(address to, uint256 amount) public\\\`.
    - Restrict with \\\`onlyOwner\\\` or \\\`onlyRole(MINTER_ROLE)\\\`.
    - Amount should be in wei (\\\`amount * (10**decimals())\\\`).
- **\\\`burnable\\\`**:
    - If true, inherit \\\`ERC20Burnable\\\` or \\\`ERC20BurnableUpgradeable\\\`. This provides \\\`burn(uint256 amount)\\\` and \\\`burnFrom(address account, uint256 amount)\\\`.
- **\\\`pausable\\\`**:
    - If true, inherit \\\`Pausable\\\` or \\\`PausableUpgradeable\` from OpenZeppelin.
    - Override \\\`_update\\\`, \\\`_mint\\\`, \\\`_burn\\\` (or \\\`_beforeTokenTransfer\\\` if preferred for simplicity) to be guarded by \\\`whenNotPaused\\\`.
    - Provide \\\`pause()\\\` and \\\`unpause()\\\` functions restricted by \\\`onlyOwner\\\` or \\\`onlyRole(PAUSER_ROLE)\\\`.

**Economics**:
- **\\\`transactionFeePercent\\\`**:
    - If > 0, implement fee logic. Store fee percentage (e.g., as basis points: if user enters 0.5, store 50).
    - Override \\\`_update(address from, address to, uint256 amount)\\\` (or \\\`_transfer\\\` if simpler).
    - Calculate fee: \\\`uint256 fee = (amount * feePercentInBasisPoints) / 10000;\\\`.
    - Ensure \\\`from\\\`'s balance decreases by \\\`amount\\\`.
    - \\\`to\\\` receives \\\`amount - fee\\\`.
    - Transfer \\\`fee\\\` to \\\`feeRecipientAddress\\\`. If \\\`feeRecipientAddress\\\` is address(0) or not provided, burn the fee.
    - Add NatSpec comments explaining fee logic.
- **\\\`maxTransactionAmount\\\`**:
    - If > 0, add a \\\`require(amount <= maxTransactionAmount * (10**decimals()), "Max transaction limit exceeded");\\\` check within \\\`_update\\\` or \\\`_transfer\\\`. This might not apply to mint/burn or transfers by owner/admin.

**Upgradability (\\\`upgradable\\\` parameter)**:
- **If 'UUPS'**:
    - Inherit \\\`UUPSUpgradeable\\\`.
    - Implement \\\`function _authorizeUpgrade(address newImplementation) internal override restricted_modifier {}\\\`.
    - Restriction: \\\`onlyOwner\\\` or \\\`onlyRole(UPGRADER_ROLE)\\\`.

**General**:
- Add comprehensive NatSpec comments for all public functions, state variables, events, and custom errors.
- Use custom errors over require strings where gas effective: \\\`error MyCustomError(uint amount); ... revert MyCustomError(amount);\\\`
- Follow Checks-Effects-Interactions pattern.
`,
  },
  {
    id: 'liquidityPool',
    name: 'Liquidity Pool Pair',
    description: 'A Uniswap V2-style pair contract for providing liquidity between two ERC20 tokens.',
    icon: GitFork,
    parameters: [
      { name: 'poolName', label: 'LP Token Name', type: 'string', placeholder: 'TokenA/TokenB LP', description: 'Name for the liquidity pool (LP) token (e.g., "My DEX LP Token").', icon: Palette, category: 'core' },
      { name: 'poolSymbol', label: 'LP Token Symbol', type: 'string', placeholder: 'MDLP', description: 'Symbol for the liquidity pool (LP) token (e.g., "MDLP").', icon: Gem, category: 'core' },
      { name: 'tokenA_Address', label: 'Token A Address', type: 'address', placeholder: '0xTokenA_Address...', description: 'Contract address of the first ERC20 token in the pair.', icon: Database, category: 'core' },
      { name: 'tokenB_Address', label: 'Token B Address', type: 'address', placeholder: '0xTokenB_Address...', description: 'Contract address of the second ERC20 token in the pair.', icon: Database, category: 'core' },
      { name: 'feeBps', label: 'Swap Fee (Basis Points)', type: 'number', defaultValue: 30, placeholder: '30 (for 0.3%)', description: 'Swap fee in basis points (e.g., 30 for 0.30%). Accrues to LPs.', advancedOnly: true, icon: Percent, category: 'economics' },
      { name: 'accessControl', label: 'Admin Access Control', type: 'select', options: [{ value: 'None', label: 'None' },{ value: 'Ownable', label: 'Ownable (For Fee Changes)' },], defaultValue: 'Ownable', description: 'Controls admin functions like changing swap fees. Does not affect LP provision.', advancedOnly: true, icon: ShieldCheck, category: 'control' },
      { name: 'upgradable', label: 'Upgradability (Pair Contract)', type: 'select', options: [{ value: 'None', label: 'Immutable' },{ value: 'UUPS', label: 'UUPS Proxy (Recommended)' },], defaultValue: 'None', description: 'Makes the pair contract logic upgradable.', advancedOnly: true, icon: Settings2, category: 'control' },
    ],
    aiPromptEnhancement: `Generate a Uniswap V2-style Pair smart contract.
**Solidity Version**: Use \\\`pragma solidity ^0.8.20;\\\`

**Core Structure**:
- The contract itself IS an ERC20 token representing liquidity provider shares.
- If NOT upgradable: Inherit from a base UniswapV2Pair.sol-like contract (you'll need to define its key components) and OpenZeppelin's \\\`ERC20.sol\\\`.
- If UUPS upgradable: Inherit from \\\`Initializable\\\`, a base UniswapV2PairUpgradeable.sol-like contract, \\\`ERC20Upgradeable.sol\\\`, and \\\`UUPSUpgradeable.sol\\\`.
- Contract name can be dynamic based on symbols, e.g., \\\`Pair_{{tokenA_Symbol}}_{{tokenB_Symbol}}\\\` or just use \\\`{{poolName}}\\\`.

**Interfaces**:
- \\\`IERC20\\\` (or \\\`IERC20Upgradeable\\\`) for \\\`tokenA_Address\\\` and \\\`tokenB_Address\\\`.
- \\\`IUniswapV2Factory\\\` (or a generic \\\`IPairFactory\\\`) might be referenced if the pair needs to register with a factory, but for a standalone pair, it's not strictly necessary for generation, though a factory address might be passed to constructor for information.

**State Variables**:
- \\\`address public token0;\\\`
- \\\`address public token1;\\\`
- \\\`uint112 private reserve0;\\\`
- \\\`uint112 private reserve1;\\\`
- \\\`uint32 private blockTimestampLast;\\\`
- \\\`uint public kLast; // For reference\\\`
- \\\`uint private unlocked = 1;\\\` (Reentrancy guard)
- \\\`uint256 public constant MINIMUM_LIQUIDITY = 10**3;\\\`
- \\\`uint16 public feeBps = {{feeBps}};\\\` (e.g., 30 for 0.3%)

**Constructor / Initializer**:
- **If NOT upgradable**: \\\`constructor(string memory _name, string memory _symbol, address _tokenA, address _tokenB)\\\`
    - Initialize \\\`ERC20(_name, _symbol)\\\`.
    - Sort \\\`_tokenA\\\` and \\\`_tokenB\\\` to determine \\\`token0\\\` and \\\`token1\\\` (\\\`token0\\\` < \\\`token1\\\`).
- **If UUPS upgradable**: \\\`initializer(string memory _name, string memory _symbol, address _tokenA, address _tokenB, address _initialAdmin)\\\`
    - Call \\\`__ERC20_init(_name, _symbol, 18);\\\` (LP tokens typically have 18 decimals).
    - Call \\\`__UUPSUpgradeable_init();\\\`
    - If 'Ownable' access, call \\\`__Ownable_init(_initialAdmin);\\\`.
    - Sort \\\`_tokenA\\\` and \\\`_tokenB\\\` to determine \\\`token0\\\` and \\\`token1\\\`.
    - Set initial fee from \\\`{{feeBps}}\\\`.

**Key Functions**:
- **Modifiers**: \\\`modifier lock() { require(unlocked == 1, 'Pair: LOCKED'); unlocked = 0; _; unlocked = 1; }\\\`
- **\\\`_update(uint balance0, uint balance1, uint112 _reserve0, uint112 _reserve1)\\\`**: Updates reserves and \\\`blockTimestampLast\\\`.
- **\\\`getReserves() public view returns (uint112 _reserve0, uint112 _reserve1, uint32 _blockTimestampLast)\\\`**.
- **\\\`mint(address to) external lock returns (uint liquidity)\\\`**:
    - Transfers \\\`token0\\\` and \\\`token1\\\` from \\\`msg.sender\\\` to the pair.
    - Calculates liquidity based on current reserves and amounts transferred. Handles initial liquidity provision carefully (mints MINIMUM_LIQUIDITY to address(0) to lock it).
    - Mints LP tokens to \\\`to\\\`.
- **\\\`burn(address to) external lock returns (uint amount0, uint amount1)\\\`**:
    - LP tokens must be sent to the pair contract first.
    - Burns LP tokens from the pair's balance (representing \\\`msg.sender\\\`'s share or an approved amount).
    - Sends corresponding \\\`token0\\\` and \\\`token1\\\` to \\\`to\\\`.
- **\\\`swap(uint amount0Out, uint amount1Out, address to, bytes calldata data) external lock\\\`**:
    - Requires \\\`amount0Out > 0\\\` or \\\`amount1Out > 0\\\`.
    - Transfers input tokens from \\\`msg.sender\\\` to the pair.
    - Calculates input amount based on output amount and reserves, considering the \\\`feeBps\\\`.
    - Sends output tokens to \\\`to\\\`.
    - Implements the swap fee by effectively leaving a portion of the input tokens in the reserves, which benefits LPs. (e.g., amountInWithFee = amountIn * 10000 / (10000 - feeBps)).
    - Optionally call \\\`IUniswapV2Callee(to).uniswapV2Call()\\\` if \\\`data.length > 0\\\`.
- **\\\`skim(address to) external lock\\\`**: Recovers excess tokens.
- **\\\`sync() external lock\\\`**: Updates reserves to match current balances.

**Fees**:
- **\\\`feeBps\\\`**: Set in constructor/initializer. Used in swap calculations.
- **\\\`setFee(uint16 _newFeeBps) public\\\`**:
    - If 'Ownable' access, restrict with \\\`onlyOwner\\\`.
    - Allows updating \\\`feeBps\\\`. Ensure it's within a reasonable range (e.g., 0 to 100 for 0% to 1%).

**Upgradability (\\\`upgradable\\\` parameter)**:
- **If 'UUPS'**: Implement \\\`_authorizeUpgrade(address newImplementation) internal override onlyOwner_or_correctRole {}\\\`.

**General**:
- Use OpenZeppelin's SafeERC20 for token transfers.
- NatSpec comments for all public interfaces.
- Custom errors for common reverts.
`,
  },
  {
    id: 'swapProtocol',
    name: 'Swap Protocol (Router)',
    description: 'A router contract for facilitating swaps across multiple liquidity pools (Uniswap V2 style).',
    icon: ArrowRightLeft,
    parameters: [
      { name: 'routerName', label: 'Router Contract Name', type: 'string', placeholder: 'MySuperRouter', description: 'Name for your swap router contract (e.g., "MySuperRouter").', icon: Palette, category: 'core' },
      { name: 'factoryAddress', label: 'Pair Factory Address', type: 'address', placeholder: '0xFactoryAddress...', description: 'Address of the factory contract that creates/manages liquidity pairs.', icon: Database, category: 'core' },
      { name: 'wethAddress', label: 'Wrapped Native Token (WETH/WBNB/etc.)', type: 'select', defaultValue: WETH_ADDRESSES_BY_NETWORK.ETH_MAINNET, options: [ { label: "WETH (Ethereum Mainnet)", value: WETH_ADDRESSES_BY_NETWORK.ETH_MAINNET },{ label: "WBNB (BNB Chain)", value: WETH_ADDRESSES_BY_NETWORK.BNB_CHAIN },{ label: "WMATIC (Polygon)", value: WETH_ADDRESSES_BY_NETWORK.POLYGON },{ label: "WETH (Arbitrum One)", value: WETH_ADDRESSES_BY_NETWORK.ARBITRUM },{ label: "WETH (Optimism)", value: WETH_ADDRESSES_BY_NETWORK.OPTIMISM },], description: 'Address of the Wrapped Native Token for the target network (e.g., WETH on Ethereum).', icon: Blocks, category: 'core' },
      { name: 'accessControl', label: 'Admin Access Control', type: 'select', options: [{ value: 'None', label: 'None' },{ value: 'Ownable', label: 'Ownable (For Pausing, etc.)' },], defaultValue: 'Ownable', description: 'Controls admin functions if any (e.g., pausing router, updating parameters).', advancedOnly: true, icon: ShieldCheck, category: 'control' },
      { name: 'upgradable', label: 'Upgradability (Router Contract)', type: 'select', options: [{ value: 'None', label: 'Immutable' },{ value: 'UUPS', label: 'UUPS Proxy (Recommended)' },], defaultValue: 'None', description: 'Makes the router contract logic upgradable.', advancedOnly: true, icon: Settings2, category: 'control' },
    ],
    aiPromptEnhancement: `Generate a Uniswap V2-style Router smart contract named \\\`{{routerName}}\\\`.
**Solidity Version**: Use \\\`pragma solidity ^0.8.20;\\\`

**Core Dependencies**:
- \\\`factoryAddress\\\`: \\\`{{factoryAddress}}\\\`
- \\\`wethAddress\\\`: \\\`{{wethAddress}}\\\` (This is the Wrapped Native Token address)

**Interfaces**:
- \\\`IUniswapV2Factory { function getPair(address tokenA, address tokenB) external view returns (address pair); }\\\` (or a similar generic IPairFactory)
- \\\`IUniswapV2Pair { function swap(uint amount0Out, uint amount1Out, address to, bytes calldata data) external; function token0() external view returns (address); function token1() external view returns (address); function getReserves() external view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast); }\\\` (or ILiquidityPair)
- \\\`IWETH { function deposit() external payable; function withdraw(uint wad) external; function transfer(address to, uint value) external returns (bool); }\\\` (for the \\\`wethAddress\\\`)
- \\\`IERC20\\\` for general token interactions.

**Libraries**:
- Use OpenZeppelin's \\\`SafeERC20\\\` for all token transfers.
- Consider including or defining helper functions from UniswapV2Library for \\\`sortTokens\\\`, \\\`pairFor\\\`, \\\`getReserves\\\`, \\\`quote\\\`, \\\`getAmountOut\\\`, \\\`getAmountIn\\\`.

**Constructor / Initializer**:
- **If NOT upgradable**: \\\`constructor(address _factory, address _weth)\\\`. Store \\\`_factory\\\` and \\\`_weth\\\`.
- **If UUPS upgradable**: Inherit \\\`Initializable\\\`, \\\`UUPSUpgradeable\\\`, and access control (e.g., \\\`OwnableUpgradeable\\\`).
  - \\\`initializer(address _factory, address _weth, address _initialAdmin) public initializer\\\`.
  - Call \\\`__UUPSUpgradeable_init();\\\`, \\\`__Ownable_init(_initialAdmin);\\\`. Store \\\`_factory\\\` and \\\`_weth\\\`.

**Key Swap Functions (Implement all variations ensuring deadline checks and ETH handling)**:
- Ensure all functions take a \\\`deadline\\\` parameter (\\\`require(block.timestamp <= deadline, 'EXPIRED');\\\`).
- For ETH inputs, use \\\`msg.value\\\`, wrap ETH to WETH using \\\`IWETH(wethAddress).deposit{value: msg.value}();\\\`.
- For ETH outputs, swap to WETH, then unwrap using \\\`IWETH(wethAddress).withdraw(wethAmount);\\\`, and transfer ETH to recipient.
- **Exact Input Swaps**:
    - \\\`swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline)\\\`
    - \\\`swapExactETHForTokens(uint amountOutMin, address[] calldata path, address to, uint deadline) payable\\\`
    - \\\`swapExactTokensForETH(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline)\\\`
- **Exact Output Swaps**:
    - \\\`swapTokensForExactTokens(uint amountOut, uint amountInMax, address[] calldata path, address to, uint deadline)\\\`
    - \\\`swapETHForExactTokens(uint amountOut, address[] calldata path, address to, uint deadline) payable\\\`
    - \\\`swapTokensForExactETH(uint amountOut, uint amountInMax, address[] calldata path, address to, uint deadline)\\\`
- *Optional*: Implement versions supporting fee-on-transfer tokens (e.g., \\\`swapExactTokensForTokensSupportingFeeOnTransferTokens\\\`).

**Liquidity Management Functions**:
- \\\`addLiquidity(address tokenA, address tokenB, uint amountADesired, uint amountBDesired, uint amountAMin, uint amountBMin, address to, uint deadline)\\\`
- \\\`addLiquidityETH(address token, uint amountTokenDesired, uint amountTokenMin, uint amountETHMin, address to, uint deadline) payable\\\`
- \\\`removeLiquidity(address tokenA, address tokenB, uint liquidity, uint amountAMin, uint amountBMin, address to, uint deadline)\\\`
- \\\`removeLiquidityETH(address token, uint liquidity, uint amountTokenMin, uint amountETHMin, address to, uint deadline)\\\`
- *Optional*: Implement \\\`removeLiquidityWithPermit\\\` and \\\`removeLiquidityETHWithPermit\\\` using EIP-2612.

**Access Control (\\\`accessControl\\\` parameter)**:
- **If 'Ownable'**: Inherit \\\`Ownable\\\` or \\\`OwnableUpgradeable\\\`. Admin functions (e.g., pausing, parameter updates if any) use \\\`onlyOwner\\\`.
- **Upgradability (\\\`upgradable\\\` parameter)**:
- **If 'UUPS'**: Implement \\\`_authorizeUpgrade(address newImplementation) internal override onlyOwner_or_correctRole {}\\\`.

**General**:
- NatSpec comments for all public functions.
- Custom errors for reverts.
- Ensure paths are validated (length >= 2).
`,
  },
  {
    id: 'dao',
    name: 'DAO (Basic Governance)',
    description: 'A basic DAO for voting on proposals using OpenZeppelin Governor contracts.',
    icon: Landmark,
    parameters: [
      { name: 'daoName', label: 'DAO Name', type: 'string', placeholder: 'My DAO', description: 'The human-readable name for your Decentralized Autonomous Organization.', icon: Palette, category: 'core' },
      { name: 'proposalTokenAddress', label: 'Governance Token Address (ERC20Votes)', type: 'address', placeholder: '0xTokenAddress...', description: 'Address of the ERC20Votes-compatible token used for voting power.', icon: Database, category: 'core' },
      { name: 'timelockAddress', label: 'Timelock Controller Address', type: 'address', placeholder: '0xTimelockAddress... (Optional)', description: 'Address of the Timelock contract that will execute proposals (recommended for security).', icon: Clock, category: 'core', advancedOnly: true },
      { name: 'votingDelay', label: 'Voting Delay (Blocks)', type: 'number', defaultValue: 1, placeholder: '1', description: 'Delay in blocks from proposal creation until voting starts (e.g., 1 block for immediate).', icon: SlidersHorizontal, category: 'feature' },
      { name: 'votingPeriod', label: 'Voting Period (Blocks)', type: 'number', defaultValue: '17280', placeholder: '17280 (approx 3 days)', description: 'Duration in blocks for which voting on a proposal is open.', icon: Clock, category: 'feature' },
      { name: 'proposalThreshold', label: 'Proposal Threshold (Tokens)', type: 'number', defaultValue: 0, placeholder: '1000', description: 'Minimum governance tokens required for an account to create a proposal. 0 for no threshold. (Amount in full units).', icon: BarChartBig, category: 'feature' },
      { name: 'quorumNumerator', label: 'Quorum Numerator (%)', type: 'number', defaultValue: 4, placeholder: '4 (for 4%)', description: 'Percentage of total voting power that must participate for a proposal to be valid (e.g., 4 for 4%).', advancedOnly: true, icon: Percent, category: 'feature' },
      { name: 'upgradable', label: 'Upgradability (Governor)', type: 'select', options: [{ value: 'None', label: 'Immutable' },{ value: 'UUPS', label: 'UUPS Proxy (Recommended)' },], defaultValue: 'None', description: 'Makes the Governor contract logic upgradable.', advancedOnly: true, icon: Settings2, category: 'control' },
    ],
    aiPromptEnhancement: `Generate a DAO governance contract using OpenZeppelin Governor, named \\\`{{daoName}}Governor\\\`.
**Solidity Version**: Use \\\`pragma solidity ^0.8.20;\\\`

**Base OpenZeppelin Contracts**:
- **If NOT upgradable**:
    - Inherit: \\\`Governor\\\`, \\\`GovernorSettings\\\`, \\\`GovernorCountingSimple\\\`, \\\`GovernorVotes\\\`, \\\`GovernorVotesQuorumFraction\\\`.
    - If \\\`timelockAddress\\\` is provided and non-zero: Inherit \\\`GovernorTimelockControl\\\`.
- **If UUPS upgradable (\\\`upgradable\\\` is 'UUPS')**:
    - Inherit: \\\`Initializable\\\`, \\\`GovernorUpgradeable\\\`, \\\`GovernorSettingsUpgradeable\\\`, \\\`GovernorCountingSimpleUpgradeable\\\`, \\\`GovernorVotesUpgradeable\\\`, \\\`GovernorVotesQuorumFractionUpgradeable\\\`, \\\`UUPSUpgradeable\\\`.
    - If \\\`timelockAddress\\\` is provided and non-zero: Inherit \\\`GovernorTimelockControlUpgradeable\\\`.

**Key Addresses**:
- \\\`governanceToken\\\`: \\\`{{proposalTokenAddress}}\\\` (must be an IVotes/ERC20Votes compatible token)
- \\\`timelock\\\`: \\\`{{timelockAddress}}\\\` (if provided)

**Constructor / Initializer**:
- **If NOT upgradable**:
  \\\`constructor(IVotes _token, TimelockController _timelock, string memory _name, uint256 _votingDelay, uint256 _votingPeriod, uint256 _proposalThreshold, uint256 _quorumNumerator)
       Governor(_name)
       GovernorSettings(_votingDelay, _votingPeriod, _proposalThreshold)
       GovernorVotes(_token)
       GovernorVotesQuorumFraction(_quorumNumerator)
       GovernorTimelockControl(_timelock) // Only if timelock is used
   {}\\\`
   (Pass \\\`address(0)\\\` for \\\`_timelock\\\` if not used. Adjust parameter list accordingly).
- **If UUPS upgradable**:
  \\\`function initialize(
       IVotes _token,
       TimelockControllerUpgradeable _timelock,
       string memory _name,
       uint256 _votingDelay,
       uint256 _votingPeriod,
       uint256 _proposalThreshold,
       uint256 _quorumNumerator
       // address _initialAdmin // For UUPS _authorizeUpgrade admin if not DAO itself
   ) public initializer {
       __Governor_init(_name);
       __GovernorSettings_init(_votingDelay, _votingPeriod, _proposalThreshold);
       __GovernorVotes_init(_token);
       __GovernorVotesQuorumFraction_init(_quorumNumerator);
       // if timelock: __GovernorTimelockControl_init(_timelock);
       __UUPSUpgradeable_init();
       // _grantRole(DEFAULT_ADMIN_ROLE, _initialAdmin); // Example if UUPS admin is separate
   }\\\`
   (Pass \\\`address(0)\\\` for \\\`_timelock\\\` if not used. The \\\`_initialAdmin\\\` for UUPS roles needs careful consideration - often the DAO itself should be the upgrader).

**Parameters Implementation**:
- **\\\`daoName\\\`**: Passed as \\\`_name\\\` to Governor/GovernorUpgradeable initializer.
- **\\\`proposalTokenAddress\\\`**: Passed as \\\`_token\\\` (IVotes instance).
- **\\\`timelockAddress\\\`**: Passed as \\\`_timelock\\\` (TimelockController instance). If not provided, the Governor executes proposals directly.
- **\\\`votingDelay\\\`**: Passed to GovernorSettings.
- **\\\`votingPeriod\\\`**: Passed to GovernorSettings.
- **\\\`proposalThreshold\\\`**: Passed to GovernorSettings. Convert from full units to wei if token has decimals: \\\`_proposalThreshold * (10**IVotes(_token).decimals())\\\`.
- **\\\`quorumNumerator\\\`**: Passed to GovernorVotesQuorumFraction.

**Upgradability (\\\`upgradable\\\` parameter)**:
- **If 'UUPS'**:
    - Implement \\\`_authorizeUpgrade(address newImplementation) internal override\\\`.
    - This MUST be restricted. Typically, only the DAO itself (via a proposal) should be able to authorize an upgrade. E.g., \\\`require(msg.sender == address(this), "Governor: only self");\\\` or controlled by a specific role.

**Proposal Execution**:
- If \\\`timelockAddress\\\` is used, proposals are queued in the Timelock and then executed by it. The Governor becomes a proposer on the Timelock.
- If no Timelock, the Governor executes proposals directly. This is less secure.

**General**:
- NatSpec comments for all public functions and key state variables.
- The contract will expose standard Governor functions: \\\`propose\\\`, \\\`castVote\\\`, \\\`execute\\\`, \\\`state\\\`, etc.
- Ensure the governance token (\\\`proposalTokenAddress\\\`) properly implements \\\`getPastVotes\\\` for vote counting.
`,
  },
  {
    id: 'custom',
    name: 'Custom Contract Logic',
    description: 'Input custom directives for the AI to synthesize unique contract logic.',
    icon: Puzzle,
    parameters: [
      { name: 'customContractName', label: 'Contract Name', type: 'string', placeholder: 'MyUniqueContract', description: 'The primary name for your custom smart contract.', category: 'core', icon: Palette },
      { name: 'customDescription', label: 'Contract Directives & Features', type: 'textarea', rows: 8, placeholder: 'Describe your contract in detail. e.g., "A decentralized oracle system for off-chain data verification with staking and dispute resolution mechanisms. Users can stake tokens to become validators. Data requesters pay fees. Validators vote on data validity. Implement slashing for malicious validators..."', description: 'Detailed description of contract functionality, features, state variables, key functions, events, and specific requirements.', category: 'core', icon: FileJson },
      { name: 'customAccessControl', label: 'Preferred Access Control', type: 'select', options: [{ value: 'None', label: 'None / Public' },{ value: 'Ownable', label: 'Ownable' },{ value: 'Roles', label: 'Role-Based Access Control' },], defaultValue: 'Ownable', description: 'Preferred access control mechanism if admin functions are needed.', category: 'control', icon: ShieldCheck, advancedOnly: true },
      { name: 'customUpgradable', label: 'Preferred Upgradability', type: 'select', options: [{ value: 'None', label: 'Immutable' },{ value: 'UUPS', label: 'UUPS Proxy' },], defaultValue: 'None', description: 'Preferred upgradability pattern if contract logic might need updates.', category: 'control', icon: Settings2, advancedOnly: true },
    ],
    aiPromptEnhancement: `Generate a custom Solidity smart contract named \\\`{{customContractName}}\\\` based on the user's directives.
**Solidity Version**: Use \\\`pragma solidity ^0.8.20;\\\`

**User Directives**:
{{{customDescription}}}

**Access Control Preference (\\\`customAccessControl\\\` parameter)**:
- If 'Ownable' is preferred and admin functions are described: Use OpenZeppelin's \\\`Ownable.sol\\\` (or \\\`OwnableUpgradeable.sol\\\` if upgradable).
- If 'Roles' is preferred: Use OpenZeppelin's \\\`AccessControl.sol\\\` (or \\\`AccessControlUpgradeable.sol\\\`). Define roles as implied by the user's description.
- If 'None', make functions public unless security dictates otherwise.

**Upgradability Preference (\\\`customUpgradable\\\` parameter)**:
- If 'UUPS' is preferred:
    - Inherit \\\`Initializable.sol\\\` and \\\`UUPSUpgradeable.sol\\\` from OpenZeppelin.
    - Use an \\\`initializer\\\` function instead of a constructor.
    - Implement \\\`_authorizeUpgrade(address newImplementation) internal override\\\`, restricting it appropriately (e.g., \\\`onlyOwner\\\` or a specific admin role).
- If 'None', use a standard constructor.

**General Instructions**:
- **Clarity and Readability**: Write clean, well-commented code.
- **Security**: Implement robust security patterns. Avoid common vulnerabilities (reentrancy, integer overflow/underflow, etc.). Use Checks-Effects-Interactions.
- **OpenZeppelin**: Where applicable for standard patterns (like ERC implementations if requested, safety utilities, access control), import and use OpenZeppelin contracts.
- **NatSpec Comments**: Provide comprehensive NatSpec documentation for all public functions, state variables, events, and custom errors.
- **Custom Errors**: Use custom errors for revert conditions to save gas and provide better error information.
- **Events**: Emit events for significant state changes.
- **State Variables**: Define state variables as required by the contract logic.
- **Functions**: Implement all functions described by the user, with appropriate visibility (public, external, internal, private) and logic.

Interpret the user's \\\`customDescription\\\` to the best of your ability. If critical details are missing for a core feature, make reasonable, secure assumptions and state them in comments, or create a flexible placeholder function.
Prioritize fulfilling the user's explicit requests.
`,
  }
];
