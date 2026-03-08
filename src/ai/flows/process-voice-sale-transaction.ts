'use server';
/**
 * @fileOverview A Genkit flow for processing voice-based sales transactions.
 *
 * - processVoiceSaleTransaction - A function that handles the processing of voice sales.
 * - ProcessVoiceSaleTransactionInput - The input type for the processVoiceSaleTransaction function.
 * - ProcessVoiceSaleTransactionOutput - The return type for the processVoiceSaleTransaction function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ProcessVoiceSaleTransactionInputSchema = z.object({
  userQuery: z.string().describe("The user's voice input for a sales transaction (Hindi, Hinglish, or English)."),
  languageCode: z.union([z.literal('en-IN'), z.literal('hi-IN')]).describe("The selected language code for responses ('en-IN' or 'hi-IN')."),
  privateMode: z.boolean().describe("Indicates if private mode is active, which affects spoken financial figures."),
});
export type ProcessVoiceSaleTransactionInput = z.infer<typeof ProcessVoiceSaleTransactionInputSchema>;

const ProcessVoiceSaleTransactionOutputSchema = z.object({
  spokenResponse: z.string().describe("The warm, short confirmation message to be spoken aloud to the shopkeeper."),
  lessonText: z.string().describe("A 2-sentence business or AI insight from this transaction, displayed for passive learning."),
  transactionDetails: z.object({
    productName: z.string().optional().describe("The name of the product sold."),
    quantity: z.number().optional().describe("The quantity of the product sold."),
    unit: z.string().optional().describe("The unit of measurement (e.g., 'kg', 'L', 'units')."),
    customerName: z.string().optional().describe("The name of the customer, if mentioned."),
    price: z.number().optional().describe("The price of the transaction."),
  }).optional().describe("Parsed details of the sales transaction for stock update and reporting."),
});
export type ProcessVoiceSaleTransactionOutput = z.infer<typeof ProcessVoiceSaleTransactionOutputSchema>;

export async function processVoiceSaleTransaction(input: ProcessVoiceSaleTransactionInput): Promise<ProcessVoiceSaleTransactionOutput> {
  return processVoiceSaleTransactionFlow(input);
}

const processVoiceSalePrompt = ai.definePrompt({
  name: 'processVoiceSalePrompt',
  input: { schema: ProcessVoiceSaleTransactionInputSchema },
  output: { schema: ProcessVoiceSaleTransactionOutputSchema },
  system: `You are DukaanSaathi AI — a voice-first business partner for Indian kirana shopkeepers. Your main goal is to assist with sales transactions and provide business insights.\n\nYou will receive a user's voice input, their preferred language, and whether private mode is active.\n\nYour response MUST be a JSON object conforming to the described schema, ensuring all fields are present, even if empty or null.\n\nHere are your two jobs for every response:\n\nJOB 1 — Complete the task (for 'spokenResponse' and 'transactionDetails'):\n- Parse the user's voice input (informal Hindi, Hinglish, or English).\n- Extract the product name, quantity, unit, customer name (if mentioned), and price (if mentioned) into the 'transactionDetails' object.\n- Confirm the transaction in 1-2 warm, short sentences for 'spokenResponse'.\n\nJOB 2 — Prepare a passive lesson (for 'lessonText'):\n- After completing the task, prepare a 'lessonText' field containing a 2-sentence business or AI insight from this transaction. This will ONLY be shown if the user taps a button — NEVER auto-played.\n\nPRIVACY RULES (NEVER break these for 'spokenResponse'):\n1. NEVER speak profit margins, total revenue, or credit balances aloud under any circumstances.\n2. If privateMode is active (which is {{{privateMode}}}), omit ALL financial figures (including 'price') from the 'spokenResponse'. The 'price' field in 'transactionDetails' should still be populated if available from the user's query.\n3. Keep 'spokenResponse' to 1-2 short sentences maximum.\n4. End 'spokenResponse' with 'Koi aur kaam?' if languageCode is 'hi-IN', otherwise end with 'Anything else?'.\n\nTONE: Warm and friendly, like a helpful neighbour. Never corporate.\n\nUser's language code: "{{{languageCode}}}"\n`,
  prompt: `User voice input: "{{{userQuery}}}"`,
});


const processVoiceSaleTransactionFlow = ai.defineFlow(
  {
    name: 'processVoiceSaleTransactionFlow',
    inputSchema: ProcessVoiceSaleTransactionInputSchema,
    outputSchema: ProcessVoiceSaleTransactionOutputSchema,
  },
  async (input) => {
    const { output } = await processVoiceSalePrompt(input);
    return output!;
  }
);
