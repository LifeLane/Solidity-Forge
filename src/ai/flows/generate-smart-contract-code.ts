// use server'

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
  prompt: `You are an expert Solidity smart contract developer.

  Based on the description provided, generate the Solidity code for the smart contract.  Make sure to include all necessary imports, and comments explaining the code.

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
