
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
  securityScore: z.number().min(0).max(100).describe('An "audit-readiness" score indicating the overall security and quality level of the contract (0-100). Higher scores indicate better readiness for a human audit.'),
});
export type SuggestErrorPreventionOutput = z.infer<typeof SuggestErrorPreventionOutputSchema>;

export async function suggestErrorPrevention(input: SuggestErrorPreventionInput): Promise<SuggestErrorPreventionOutput> {
  return suggestErrorPreventionFlow(input);
}

const suggestErrorPreventionPrompt = ai.definePrompt({
  name: 'suggestErrorPreventionPrompt',
  input: {schema: SuggestErrorPreventionInputSchema},
  output: {schema: SuggestErrorPreventionOutputSchema},
  prompt: `You are a meticulous Smart Contract Auditor AI. Your goal is to analyze the provided Solidity code and parameters to identify potential vulnerabilities, areas for optimization, and deviations from best practices, ultimately assessing its "audit-readiness".

Contract Type: {{{contractType}}}
Parameters: {{json parameters}}
Code:
\`\`\`solidity
{{{code}}}
\`\`\`

Perform a thorough review focusing on:
1.  **Security Vulnerabilities**: Check for common pitfalls like reentrancy (ensure ReentrancyGuard if state changes before external calls), integer overflow/underflow (use SafeMath or Solidity >0.8.0 checks), transaction-ordering dependence (front-running), gas limit issues (avoid unbounded loops), denial of service vectors, and insecure access control patterns (ensure Ownable or similar is used correctly, check for correct modifiers like \`onlyOwner\`).
2.  **Gas Optimization**: Identify opportunities to reduce gas consumption without compromising security or functionality (e.g., efficient data types, minimizing storage writes, packing struct variables).
3.  **Best Practices & Code Quality**: Look for adherence to Solidity best practices (e.g., NatSpec comments for all public interfaces, Checks-Effects-Interactions pattern, use of custom errors, event emissions for important state changes), code clarity, maintainability, and use of established patterns.
4.  **Parameter Validation**: Assess if input parameters from the user (as provided in the "Parameters" input) are appropriately validated within the contract code using 'require' statements or custom errors.
5.  **Version Pragma and Imports**: Check for appropriate Solidity version pragma and correct import statements if libraries like OpenZeppelin are used.

For each identified issue or improvement area, provide a suggestion object with the following fields:
- 'id': A unique string identifier (e.g., "sec-001", "opt-001", "gas-001", "bp-001").
- 'type': The category of the suggestion. Choose from: 'security', 'optimization', 'gas_saving', 'best_practice', 'informational'.
- 'severity': The severity level. Choose from: 'critical', 'high', 'medium', 'low', 'info'. A 'critical' or 'high' severity security issue should significantly impact the security score.
- 'description': A detailed, actionable explanation of the suggestion. Clearly state the potential impact of the issue and provide concrete guidance on how to address it. If possible, reference specific lines or code patterns.

Return these as an array in the 'suggestions' field of the output.

Finally, provide an overall 'securityScore' (0-100). This score should reflect your assessment of the contract's readiness for a human audit. A score of 90+ indicates very high confidence (few to no critical/high issues, good practices followed). A score below 60 suggests significant concerns requiring attention before an audit. The score should be influenced by the number and severity of identified issues.

Ensure your output strictly adheres to the defined schema. Prioritize actionable and impactful feedback.`,
});

const suggestErrorPreventionFlow = ai.defineFlow(
  {
    name: 'suggestErrorPreventionFlow',
    inputSchema: SuggestErrorPreventionInputSchema,
    outputSchema: SuggestErrorPreventionOutputSchema,
  },
  async input => {
    const {output} = await suggestErrorPreventionPrompt(input);
    if (!output || !Array.isArray(output.suggestions) || typeof output.securityScore !== 'number') {
        throw new Error('AI failed to provide valid error prevention suggestions. The output structure was unexpected.');
    }
    // Ensure score is within 0-100 if LLM doesn't perfectly adhere
    output.securityScore = Math.max(0, Math.min(100, output.securityScore));
    return output;
  }
);
