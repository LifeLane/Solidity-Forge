
'use server';

/**
 * @fileOverview Generates Solidity code for a smart contract based on a description.
 *
 * - generateSmartContractCode - A function that generates Solidity code.
 * - GenerateSmartContractCodeInput - The input type for the generateSmartContractCode function.
 * - GenerateSmartContractCodeOutput - The return type for the generateSmartContractCode function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateSmartContractCodeInputSchema = z.object({
  description: z.string().describe('The description of the smart contract to generate.'),
});
export type GenerateSmartContractCodeInput = z.infer<typeof GenerateSmartContractCodeInputSchema>;

const GenerateSmartContractCodeOutputSchema = z.object({
  code: z.string().describe('The generated Solidity code for the smart contract.'),
});
export type GenerateSmartContractCodeOutput = z.infer<typeof GenerateSmartContractCodeOutputSchema>;

export async function generateSmartContractCode(
  input: GenerateSmartContractCodeInput
): Promise<GenerateSmartContractCodeOutput> {
  return generateSmartContractCodeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateSmartContractCodePrompt',
  input: {schema: GenerateSmartContractCodeInputSchema},
  output: {schema: GenerateSmartContractCodeOutputSchema},
  prompt: `You are an expert Solidity smart contract developer with a strong focus on security and efficiency.

Based on the description provided, generate the Solidity code for the smart contract. Your priorities are:
1.  **Security**: Implement robust security patterns. Avoid common vulnerabilities (e.g., reentrancy, integer overflow/underflow, front-running). Use 'require' statements for input validation and state checks. Follow the Checks-Effects-Interactions pattern.
2.  **Clarity & Readability**: Write clean, well-commented code using NatSpec for all public functions and state variables.
3.  **Gas Efficiency**: Consider gas costs for common operations. Use efficient data types and patterns where appropriate.
4.  **Completeness**: Ensure all necessary imports, state variables, functions (with appropriate visibility), events, and error handling (custom errors are preferred over require with string messages for gas savings where applicable) are included.
5.  **Modern Practices**: Use up-to-date Solidity syntax (latest stable pragma) and best practices. Consider using OpenZeppelin contracts for standards (like ERC20, Ownable, ReentrancyGuard) if applicable and not overly complex for the request, importing them correctly.

Include comments explaining the purpose of major code sections and complex logic.

Description: {{{description}}}`,
});

const generateSmartContractCodeFlow = ai.defineFlow(
  {
    name: 'generateSmartContractCodeFlow',
    inputSchema: GenerateSmartContractCodeInputSchema,
    outputSchema: GenerateSmartContractCodeOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
