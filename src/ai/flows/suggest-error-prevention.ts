
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

const SuggestionItemSchema = z.object({
  id: z.string().describe("A unique string identifier for the suggestion (e.g., \"sec-001\", \"opt-001\")."),
  type: z.enum(['security', 'optimization', 'gas_saving', 'best_practice', 'informational']).describe("The category of the suggestion."),
  severity: z.enum(['critical', 'high', 'medium', 'low', 'info']).describe("The severity level of the suggestion."),
  description: z.string().describe("A detailed explanation of the suggestion, including the potential impact and how to address it."),
});
export type SuggestionItem = z.infer<typeof SuggestionItemSchema>;

const SuggestErrorPreventionOutputSchema = z.object({
  suggestions: z.array(SuggestionItemSchema).describe('An array of structured suggestions for error prevention and code optimization.'),
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
  prompt: `You are a smart contract security expert. Analyze the following smart contract code and parameters.

Contract Type: {{{contractType}}}
Parameters: {{json parameters}}
Code: \`\`\`solidity
{{{code}}}
\`\`\`

Analyze the provided smart contract. For each identified issue or improvement area, provide a suggestion object with the following fields:
- 'id': A unique string identifier for the suggestion (e.g., "sec-001", "opt-001", "gas-001").
- 'type': The category of the suggestion. Choose from: 'security', 'optimization', 'gas_saving', 'best_practice', 'informational'.
- 'severity': The severity level. Choose from: 'critical', 'high', 'medium', 'low', 'info'.
- 'description': A detailed explanation of the suggestion, including the potential impact and how to address it.

Return these as an array in the 'suggestions' field of the output.
Also, provide an overall 'securityScore' for the contract (0-100). Ensure the output strictly adheres to the defined schema.`,
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

