
'use server';
/**
 * @fileOverview Generates NatSpec documentation for existing Solidity smart contract code.
 *
 * - generateDocumentation - A function that triggers the documentation generation flow.
 * - GenerateDocumentationInput - The input type for the generateDocumentation function.
 * - GenerateDocumentationOutput - The return type for the generateDocumentation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateDocumentationInputSchema = z.object({
  code: z.string().describe('The existing Solidity smart contract code to document.'),
});
export type GenerateDocumentationInput = z.infer<typeof GenerateDocumentationInputSchema>;

const GenerateDocumentationOutputSchema = z.object({
  documentedCode: z.string().describe('The Solidity smart contract code with NatSpec comments added.'),
});
export type GenerateDocumentationOutput = z.infer<typeof GenerateDocumentationOutputSchema>;

export async function generateDocumentation(input: GenerateDocumentationInput): Promise<GenerateDocumentationOutput> {
  return generateDocumentationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateDocumentationPrompt',
  input: {schema: GenerateDocumentationInputSchema},
  output: {schema: GenerateDocumentationOutputSchema},
  prompt: `You are an expert Solidity smart contract developer specializing in writing comprehensive NatSpec documentation.
Analyze the provided Solidity code and add NatSpec comments to all public and external functions, state variables, events, modifiers, and custom errors.

**Current Solidity Code:**
\`\`\`solidity
{{{code}}}
\`\`\`

**Your Task:**
Return the ENTIRE contract code with NatSpec comments added. Ensure comments are:
1.  **Comprehensive**: Include \`@notice\` (explains to end-users), \`@dev\` (explains to developers), \`@param\` for all parameters, and \`@return\` for all return values. For state variables, use \`@notice\` and/or \`@dev\`. For events, document their purpose and parameters. For modifiers, explain what they do. For custom errors, explain their meaning.
2.  **Accurate**: Comments should accurately reflect the code's functionality.
3.  **Well-Formatted**: Follow standard NatSpec conventions.
4.  **Preserve Original Code**: Do not alter the logic or structure of the original code, only add comments.

Output the complete, documented Solidity code.
`,
});

const generateDocumentationFlow = ai.defineFlow(
  {
    name: 'generateDocumentationFlow',
    inputSchema: GenerateDocumentationInputSchema,
    outputSchema: GenerateDocumentationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output || !output.documentedCode) {
        throw new Error("The AI seemed to forget how to write. No documentation was generated. Try again.");
    }
    return output;
  }
);
