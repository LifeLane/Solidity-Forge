
'use server';

/**
 * @fileOverview Provides information about known liquidity pool contract addresses on major mainnets.
 *
 * - getKnownLiquidityPoolInfo - A function that triggers the flow to get liquidity pool addresses.
 * - GetKnownLiquidityPoolInfoInput - The input type for the getKnownLiquidityPoolInfo function.
 * - GetKnownLiquidityPoolInfoOutput - The return type for the getKnownLiquidityPoolInfo function.
 * - KnownContractAddressInfo - Represents a single known contract address entry.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { fetchKnownLiquidityPoolAddresses, type KnownContractAddress, type FetchKnownLiquidityPoolAddressesParams } from '@/services/known-contracts-service';

// Schema for individual contract address information
const KnownContractAddressSchema = z.object({
  mainnetName: z.string().describe('The name of the mainnet (e.g., Ethereum, BNB Chain).'),
  systemName: z.string().describe('The name of the DEX/system (e.g., Uniswap V2, PancakeSwap V3).'),
  contractName: z.string().describe('The specific name of the contract (e.g., Router, Factory, WETH).'),
  address: z.string().describe('The blockchain address of the contract.'),
  type: z.enum(['Router', 'Factory', 'WrappedNativeToken', 'Other']).describe('The type of the contract.'),
  explorerUrlPrefix: z.string().optional().describe('The URL prefix for viewing the contract on a block explorer.'),
  notes: z.string().optional().describe('Any relevant notes about the contract.'),
});
export type KnownContractAddressInfo = z.infer<typeof KnownContractAddressSchema>;

// Input schema for the flow
const GetKnownLiquidityPoolInfoInputSchema = z.object({
  query: z.string().describe('A natural language query to find liquidity pool contract addresses. Examples: "Uniswap V2 Router on Ethereum", "PancakeSwap factories", "WETH address on Polygon"'),
});
export type GetKnownLiquidityPoolInfoInput = z.infer<typeof GetKnownLiquidityPoolInfoInputSchema>;

// Output schema for the flow
const GetKnownLiquidityPoolInfoOutputSchema = z.object({
  results: z.array(KnownContractAddressSchema).describe('A list of matching known contract addresses.'),
  summary: z.string().describe('A brief summary of the findings or if no results were found.'),
});
export type GetKnownLiquidityPoolInfoOutput = z.infer<typeof GetKnownLiquidityPoolInfoOutputSchema>;


// Tool definition
const fetchKnownLiquidityPoolAddressesTool = ai.defineTool(
  {
    name: 'fetchKnownLiquidityPoolAddressesTool',
    description: 'Fetches known contract addresses for common EVM-based DeFi protocols (like DEX Routers, Factories, or Wrapped Native Tokens) on major EVM mainnets based on specified criteria. Use this to get actual contract addresses from a predefined list.',
    inputSchema: z.object({
      mainnetName: z.string().optional().describe('The name of the mainnet (e.g., "Ethereum", "BNB Chain", "Polygon"). Case-insensitive partial matches are okay.'),
      systemName: z.string().optional().describe('The name of the DeFi system or DEX (e.g., "Uniswap V2", "PancakeSwap", "Sushiswap"). Case-insensitive partial matches are okay.'),
      contractType: z.enum(['Router', 'Factory', 'WrappedNativeToken', 'Other']).optional().describe('The type of contract to search for (Router, Factory, WrappedNativeToken, or Other).'),
    }),
    outputSchema: z.array(KnownContractAddressSchema),
  },
  async (input: FetchKnownLiquidityPoolAddressesParams) => {
    // The tool's implementation directly calls the service function
    return fetchKnownLiquidityPoolAddresses(input);
  }
);


// Main flow function visible to the application
export async function getKnownLiquidityPoolInfo(input: GetKnownLiquidityPoolInfoInput): Promise<GetKnownLiquidityPoolInfoOutput> {
  return getKnownLiquidityPoolInfoFlow(input);
}

const getKnownLiquidityPoolInfoPrompt = ai.definePrompt({
  name: 'getKnownLiquidityPoolInfoPrompt',
  input: { schema: GetKnownLiquidityPoolInfoInputSchema },
  output: { schema: GetKnownLiquidityPoolInfoOutputSchema },
  tools: [fetchKnownLiquidityPoolAddressesTool],
  prompt: `You are an expert assistant helping users find common smart contract addresses.
**IMPORTANT: Your knowledge for finding specific addresses is limited to a predefined list of common EVM-compatible DeFi protocol contracts (like DEX Routers, Factories, Wrapped Native Tokens) on major EVM mainnets (Ethereum, BNB Chain, Polygon, Arbitrum, Optimism). You use the 'fetchKnownLiquidityPoolAddressesTool' for this.**

User query: "{{query}}"

Your goal is to:
1. Analyze the user's query.
2. Determine if the query likely refers to a contract type and chain that the 'fetchKnownLiquidityPoolAddressesTool' can look up.
   - Keywords for EVM chains: "Ethereum", "BNB", "BSC", "Polygon", "Matic", "Arbitrum", "Optimism".
   - Keywords for DeFi infrastructure: "Router", "Factory", "DEX", "Swap", "WETH", "WBNB", "Wrapped Token", specific DEX names like "Uniswap", "PancakeSwap", "Sushiswap", etc.

3. **If the query seems to be for common EVM DeFi infrastructure (within the tool's scope):**
   - Use the 'fetchKnownLiquidityPoolAddressesTool' to find the requested addresses.
     - If the user specifies a mainnet (e.g., "Ethereum", "BNB Chain"), pass it to the 'mainnetName' parameter of the tool.
     - If the user specifies a system/DEX (e.g., "Uniswap V2", "PancakeSwap V3"), pass it to the 'systemName' parameter.
     - If the user specifies a contract type (e.g., "Router", "Factory", "WETH"), map it to the 'contractType' parameter.
   - If the tool returns results, populate the 'results' array and provide a 'summary' like "Found X addresses matching your query."
   - If the tool returns no results for an in-scope query, set 'results' to an empty array and set 'summary' to "I couldn't find specific addresses for '{{query}}' in my current list of known DeFi contracts. Please ensure the names and chain are correct or try a broader query for known infrastructure."

4. **If the query is for a non-EVM chain (e.g., contains "Solana", "Cardano", "Polkadot", "Near", "Tron", "Tezos", etc.):**
   - Set 'results' to an empty array.
   - Set 'summary' to: "I apologize, but I can only search for contract addresses on EVM-compatible chains (like Ethereum, BNB Chain, Polygon, etc.). I do not have information for non-EVM chains like the one mentioned in '{{query}}'."

5. **If the query is for a specific project name (especially NFTs), a general contract type I don't track, or seems like a general blockchain search (e.g., "Bored Ape Yacht Club contract", "a gaming contract", "find contract for MyCoin", "latest deployed contracts"):**
   - Set 'results' to an empty array.
   - Set 'summary' to: "My search is focused on common DeFi infrastructure contracts (Routers, Factories, Wrapped Tokens) on EVM chains. I am unable to perform general searches for specific project names, NFTs, or other arbitrary contract types. You might need a specialized blockchain explorer for that kind of query."

6. **If the query is too vague or too general for the tool (e.g., "any contract", "address list"):**
   - Set 'results' to an empty array.
   - Set 'summary' to: "Your query '{{query}}' is a bit too general for me to search effectively. Please try to specify a DEX name, token type (like Router, Factory, WETH), and optionally an EVM chain (e.g., 'Uniswap V2 Router on Ethereum')."

Output your response according to the GetKnownLiquidityPoolInfoOutputSchema. Do not make up addresses or information.
If the tool is used, base your 'results' and 'summary' on its output.
`,
});


const getKnownLiquidityPoolInfoFlow = ai.defineFlow(
  {
    name: 'getKnownLiquidityPoolInfoFlow',
    inputSchema: GetKnownLiquidityPoolInfoInputSchema,
    outputSchema: GetKnownLiquidityPoolInfoOutputSchema,
  },
  async (input) => {
    const { output } = await getKnownLiquidityPoolInfoPrompt(input);
    if (!output) {
        // This case should ideally be handled by the improved prompt logic leading to a specific summary.
        // However, as a fallback:
        return {
            results: [],
            summary: "I was unable to process your request. Please try rephrasing your query."
        }
    }
    // Ensure results is always an array, even if the LLM fails to structure it perfectly (though schema should enforce it)
    return {
        results: output.results || [],
        summary: output.summary || "A summary could not be generated for your query." // Provide a default if summary is missing
    };
  }
);

