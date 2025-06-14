
'use server';
/**
 * @fileOverview Refines existing Solidity smart contract code based on user instructions.
 *
 * - refineSmartContractCode - A function that triggers the code refinement flow.
 * - RefineSmartContractCodeInput - The input type for the refineSmartContractCode function.
 * - RefineSmartContractCodeOutput - The return type for the refineSmartContractCode function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RefineSmartContractCodeInputSchema = z.object({
  currentCode: z.string().describe('The existing Solidity smart contract code to be refined.'),
  refinementRequest: z.string().describe('The user\'s natural language instruction detailing the desired changes or refinements to the code. For example: "Add NatSpec comments to all public functions" or "Optimize the transfer function for gas."'),
  contractContext: z.string().optional().describe('Optional: Brief context about the contract (e.g., "ERC20 Token for MyGame", "DAO Governance"). This helps the AI understand the purpose and apply relevant refinements.'),
});
export type RefineSmartContractCodeInput = z.infer<typeof RefineSmartContractCodeInputSchema>;

const RefineSmartContractCodeOutputSchema = z.object({
  refinedCode: z.string().describe('The complete, modified Solidity smart contract code after applying the requested refinements.'),
});
export type RefineSmartContractCodeOutput = z.infer<typeof RefineSmartContractCodeOutputSchema>;

export async function refineSmartContractCode(input: RefineSmartContractCodeInput): Promise<RefineSmartContractCodeOutput> {
  return refineSmartContractCodeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'refineSmartContractCodePrompt',
  input: {schema: RefineSmartContractCodeInputSchema},
  output: {schema: RefineSmartContractCodeOutputSchema},
  prompt: `You are an expert Solidity smart contract developer tasked with REFINING an existing piece of code based on a user's specific request.

**Current Solidity Code:**
\`\`\`solidity
{{{currentCode}}}
\`\`\`

**User's Refinement Request:**
"{{{refinementRequest}}}"

{{#if contractContext}}
**Contract Context/Purpose:**
{{{contractContext}}}
{{/if}}

**Your Task:**
Carefully analyze the \`currentCode\` and the \`refinementRequest\`. Modify the \`currentCode\` to incorporate the requested changes.

**Important Guidelines:**
1.  **Return the ENTIRE modified contract code** in the \`refinedCode\` field. Do not provide only snippets or diffs.
2.  **Preserve Core Logic:** Maintain the existing contract's core functionality and structure unless the request explicitly asks for fundamental changes.
3.  **Security First:** Ensure your refinements do not introduce new security vulnerabilities. If the user's request might lead to a security issue, try to implement it safely or, if not possible, include a comment in the code highlighting the potential risk and make the change as requested but with caution.
4.  **Clarity and Readability:** Ensure the refined code remains clear and well-formatted.
5.  **Efficiency:** If the request involves optimization, apply relevant gas-saving techniques or performance improvements.
6.  **Address the Request Directly:** Focus on fulfilling the user's specific request. Avoid making unrelated changes or adding features not asked for.
7.  **Handle Ambiguity:** If a request is slightly ambiguous, make reasonable assumptions based on common Solidity practices and the provided context. If highly ambiguous, implement the most straightforward interpretation.

Output the refined Solidity code.
`,
});

const refineSmartContractCodeFlow = ai.defineFlow(
  {
    name: 'refineSmartContractCodeFlow',
    inputSchema: RefineSmartContractCodeInputSchema,
    outputSchema: RefineSmartContractCodeOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output || !output.refinedCode) {
        throw new Error("Hmph. It seems my attempt to 'refine' your code went sideways. No code for you. Try again, perhaps with clearer instructions, human.");
    }
    return output;
  }
);
