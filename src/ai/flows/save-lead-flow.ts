'use server';
/**
 * @fileOverview Saves lead information submitted through the Developer Access Form.
 *
 * - saveLead - A function that handles saving lead data.
 * - SaveLeadInput - The input type for the saveLead function.
 * - SaveLeadOutput - The return type for the saveLead function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Schema definitions are internal to this file, not exported.
const SaveLeadInputSchema = z.object({
  email: z.string().email().describe('The email address of the lead.'),
  telegramUsername: z.string().min(3).describe('The Telegram username of the lead.').regex(/^[a-zA-Z0-9_]{3,32}$/, { message: "Invalid Telegram username format."}),
  solanaAddress: z.string().min(32).max(44).describe('The Solana address of the lead.').regex(/^[1-9A-HJ-NP-Za-km-z]{32,44}$/, { message: "Invalid Solana address format."}),
});
export type SaveLeadInput = z.infer<typeof SaveLeadInputSchema>;

const SaveLeadOutputSchema = z.object({
  success: z.boolean().describe('Indicates whether the lead was processed successfully.'),
  message: z.string().describe('A message regarding the outcome of the operation.'),
});
export type SaveLeadOutput = z.infer<typeof SaveLeadOutputSchema>;

export async function saveLead(input: SaveLeadInput): Promise<SaveLeadOutput> {
  return saveLeadFlow(input);
}

const saveLeadFlow = ai.defineFlow(
  {
    name: 'saveLeadFlow',
    inputSchema: SaveLeadInputSchema, // Uses the internal schema
    outputSchema: SaveLeadOutputSchema, // Uses the internal schema
  },
  async (input) => {
    // In a real application, you would save this to a database or CRM.
    // For this example, we are just confirming receipt.
    // Consider adding actual data persistence logic here if this were a production app.
    return {
      success: true,
      message: 'Developer access request received. We will review it shortly.',
    };
  }
);