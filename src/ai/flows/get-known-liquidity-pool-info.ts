
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
    description: 'Fetches known contract addresses for liquidity pools, factories, or wrapped native tokens on major mainnets based on specified criteria. Use this to get actual contract addresses.',
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
  prompt: `You are an expert assistant helping users find common smart contract addresses for DeFi protocols like liquidity pools, DEX routers, factories, and wrapped native tokens on major mainnets.

User query: "{{query}}"

Your goal is to:
1. Understand the user's query.
2. Use the 'fetchKnownLiquidityPoolAddressesTool' to find the requested addresses.
   - If the user specifies a mainnet (e.g., "Ethereum", "BNB Chain", "Polygon", "Arbitrum One", "Optimism"), pass it to the 'mainnetName' parameter of the tool.
   - If the user specifies a system/DEX (e.g., "Uniswap V2", "PancakeSwap V3", "Sushiswap"), pass it to the 'systemName' parameter.
   - If the user specifies a contract type (e.g., "Router", "Factory", "WETH", "Wrapped Token"), map it to the 'contractType' parameter ('Router', 'Factory', 'WrappedNativeToken', 'Other').
   - If the query is general (e.g., "any liquidity pools on Ethereum"), you may omit some tool parameters to get broader results.
   - If the query asks for "WETH", "WBNB", "WMATIC", etc., use 'WrappedNativeToken' as the contractType.
3. If the tool returns results, populate the 'results' array in the output.
4. Provide a concise 'summary' of what was found, or a polite message if no specific addresses match the query based on the tool's output. For example, if results are found, say "Found X addresses matching your query." If not, say "Could not find specific addresses for your query based on available data."

IMPORTANT: Only use the tool to fetch addresses. Do not make up addresses. If the tool returns empty, reflect that in the summary.
Prioritize accuracy and rely on the tool's output.
If the user asks for something very generic like "all addresses", you might suggest they refine their query if the tool returns too many results or if it's too broad for a single tool call. However, try to be helpful with common defaults if the query is slightly ambiguous (e.g. "Uniswap router" might imply Ethereum if no network is specified).
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
        return {
            results: [],
            summary: "An unexpected error occurred while trying to fetch liquidity pool information."
        }
    }
    // Ensure results is always an array, even if the LLM fails to structure it perfectly (though schema should enforce it)
    return {
        results: output.results || [],
        summary: output.summary || "Summary was not generated."
    };
  }
);
