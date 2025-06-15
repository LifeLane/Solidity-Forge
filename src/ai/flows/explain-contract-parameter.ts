'use server';
/**
 * @fileOverview Explains a smart contract parameter's meaning and importance.
 *
 * - explainContractParameter - A function that triggers the parameter explanation flow.
 * - ExplainContractParameterInput - The input type for the explainContractParameter function.
 * - ExplainContractParameterOutput - The return type for the explainContractParameter function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExplainContractParameterInputSchema = z.object({
  parameterName: z.string().describe('The machine-readable name of the parameter (e.g., "tokenName", "initialSupply").'),
  parameterLabel: z.string().describe('The human-readable label for the parameter (e.g., "Token Name", "Initial Supply").'),
  contractTypeName: z.string().describe('The type of smart contract this parameter belongs to (e.g., "ERC20 Token", "Liquidity Pool").'),
  parameterContextDescription: z.string().optional().describe('Optional existing short description of the parameter, if available, to provide more context to the AI.'),
});
export type ExplainContractParameterInput = z.infer<typeof ExplainContractParameterInputSchema>;

const ExplainContractParameterOutputSchema = z.object({
  explanation: z.string().describe('A concise explanation of the parameter\'s meaning and importance, around 50 words.'),
});
export type ExplainContractParameterOutput = z.infer<typeof ExplainContractParameterOutputSchema>;

export async function explainContractParameter(input: ExplainContractParameterInput): Promise<ExplainContractParameterOutput> {
  return explainContractParameterFlow(input);
}

const prompt = ai.definePrompt({
  name: 'explainContractParameterPrompt',
  input: {schema: ExplainContractParameterInputSchema},
  output: {schema: ExplainContractParameterOutputSchema},
  prompt: `You are BlockSmithAI, an expert Solidity smart contract assistant.
A user is asking for an explanation of a specific parameter used in configuring a "{{contractTypeName}}" smart contract.

Parameter Label: "{{parameterLabel}}" (Internal Name: "{{parameterName}}")
{{#if parameterContextDescription}}
Existing brief description for context: "{{parameterContextDescription}}"
{{/if}}

Your task is to provide a concise explanation of this parameter's meaning and its importance for the "{{contractTypeName}}".
Keep the explanation friendly, clear, and strictly around 50 words. Focus on what the user needs to know to make an informed decision when setting this parameter.

Generate the explanation now.
`,
});

const explainContractParameterFlow = ai.defineFlow(
  {
    name: 'explainContractParameterFlow',
    inputSchema: ExplainContractParameterInputSchema,
    outputSchema: ExplainContractParameterOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    if (!output || typeof output.explanation === 'undefined') {
      throw new Error('BlockSmithAI is pondering... but no explanation came through. Try asking again.');
    }
    return output;
  }
);
