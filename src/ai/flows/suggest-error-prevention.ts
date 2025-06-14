'use server';

/**
 * @fileOverview Analyzes smart contract parameters and code to suggest potential errors and optimization opportunities using AI.
 *
 * - suggestErrorPrevention - A function that handles the error prevention suggestion process.
 * - SuggestErrorPreventionInput - The input type for the suggestErrorPrevention function.
 * - SuggestErrorPreventionOutput - The return type for the suggestErrorPrevention function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestErrorPreventionInputSchema = z.object({
  contractType: z.string().describe('The type of smart contract (e.g., token, DAO, etc.).'),
  parameters: z.record(z.any()).describe('A JSON object containing the parameters for the smart contract.'),
  code: z.string().describe('The Solidity code of the smart contract.'),
});
export type SuggestErrorPreventionInput = z.infer<typeof SuggestErrorPreventionInputSchema>;

const SuggestErrorPreventionOutputSchema = z.object({
  suggestions: z.array(z.string()).describe('An array of suggestions for error prevention and code optimization.'),
  securityScore: z.number().describe('A score indicating the overall security level of the contract (0-100).'),
});
export type SuggestErrorPreventionOutput = z.infer<typeof SuggestErrorPreventionOutputSchema>;

export async function suggestErrorPrevention(input: SuggestErrorPreventionInput): Promise<SuggestErrorPreventionOutput> {
  return suggestErrorPreventionFlow(input);
}

const suggestErrorPreventionPrompt = ai.definePrompt({
  name: 'suggestErrorPreventionPrompt',
  input: {schema: SuggestErrorPreventionInputSchema},
  output: {schema: SuggestErrorPreventionOutputSchema},
  prompt: `You are a smart contract security expert. Analyze the following smart contract code and parameters, and provide suggestions for error prevention and code optimization.

Contract Type: {{{contractType}}}
Parameters: {{json parameters}}
Code: \`\`\`solidity
{{{code}}}
\`\`\`

Provide an array of specific, actionable suggestions to improve the contract's security and efficiency.  Also provide an overall securityScore for the contract.

Suggestions:`,
});

const suggestErrorPreventionFlow = ai.defineFlow(
  {
    name: 'suggestErrorPreventionFlow',
    inputSchema: SuggestErrorPreventionInputSchema,
    outputSchema: SuggestErrorPreventionOutputSchema,
  },
  async input => {
    const {output} = await suggestErrorPreventionPrompt(input);
    return output!;
  }
);
