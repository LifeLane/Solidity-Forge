
'use server';

/**
 * @fileOverview Estimates gas costs for a given Solidity smart contract.
 *
 * - estimateGasCost - A function that triggers the gas cost estimation flow.
 * - EstimateGasCostInput - The input type for the estimateGasCost function.
 * - EstimateGasCostOutput - The return type for the estimateGasCost function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const EstimateGasCostInputSchema = z.object({
  code: z.string().describe('The Solidity smart contract code to analyze for gas costs.'),
});
export type EstimateGasCostInput = z.infer<typeof EstimateGasCostInputSchema>;

const EstimateGasCostOutputSchema = z.object({
  estimatedGasRange: z
    .string()
    .describe(
      "A general estimated gas range for deploying and typically interacting with this contract (e.g., 'Deployment: 500,000-800,000 gas; Common Functions: 25,000-70,000 gas per call')."
    ),
  explanation: z
    .string()
    .describe(
      'A brief explanation of the factors influencing gas consumption for this contract and any notable gas-intensive patterns observed.'
    ),
});
export type EstimateGasCostOutput = z.infer<typeof EstimateGasCostOutputSchema>;

export async function estimateGasCost(input: EstimateGasCostInput): Promise<EstimateGasCostOutput> {
  return estimateGasCostFlow(input);
}

const prompt = ai.definePrompt({
  name: 'estimateGasCostPrompt',
  input: {schema: EstimateGasCostInputSchema},
  output: {schema: EstimateGasCostOutputSchema},
  prompt: `You are a Solidity gas optimization expert. Analyze the provided Solidity code.

Solidity Code:
\`\`\`solidity
{{{code}}}
\`\`\`

Provide:
1.  An 'estimatedGasRange': A general estimated gas range covering both deployment and typical interactions with the contract's main functions. For example: "Deployment: 500,000-800,000 gas; Common Functions: 25,000-70,000 gas per call". Be concise.
2.  An 'explanation': A brief explanation of the primary factors influencing gas consumption for this specific contract. Highlight any particularly gas-intensive patterns you observe or suggest general areas for potential gas savings.

If the contract is exceptionally simple or complex, making precise estimation difficult, acknowledge this in your explanation and provide broader guidance. Focus on actionable insights.
Ensure your output strictly adheres to the defined schema.`,
});

const estimateGasCostFlow = ai.defineFlow(
  {
    name: 'estimateGasCostFlow',
    inputSchema: EstimateGasCostInputSchema,
    outputSchema: EstimateGasCostOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
