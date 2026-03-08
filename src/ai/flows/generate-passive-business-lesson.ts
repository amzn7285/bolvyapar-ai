'use server';
/**
 * @fileOverview A Genkit flow that generates a passive business or AI insight lesson
 *               based on transaction details for Indian kirana shopkeepers.
 *
 * - generatePassiveBusinessLesson - A function that handles the lesson generation process.
 * - GeneratePassiveBusinessLessonInput - The input type for the generatePassiveBusinessLesson function.
 * - GeneratePassiveBusinessLessonOutput - The return type for the generatePassiveBusinessLesson function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GeneratePassiveBusinessLessonInputSchema = z.object({
  productName: z.string().describe('The name of the product involved in the transaction.'),
  quantity: z.number().optional().describe('The quantity of the product.'),
  unit: z.string().optional().describe('The unit of measurement for the quantity (e.g., "kg", "L", "units").'),
  customerName: z.string().optional().describe('The name of the customer, if mentioned.'),
  price: z.number().optional().describe('The price of the transaction or product.'),
  language: z.enum(['en-IN', 'hi-IN']).describe('The language for the lesson (en-IN for English, hi-IN for Hindi).'),
});
export type GeneratePassiveBusinessLessonInput = z.infer<typeof GeneratePassiveBusinessLessonInputSchema>;

const GeneratePassiveBusinessLessonOutputSchema = z.object({
  lesson_text: z.string().describe('A 2-sentence business or AI insight related to the transaction.'),
});
export type GeneratePassiveBusinessLessonOutput = z.infer<typeof GeneratePassiveBusinessLessonOutputSchema>;

const generatePassiveBusinessLessonPrompt = ai.definePrompt({
  name: 'generatePassiveBusinessLessonPrompt',
  input: { schema: GeneratePassiveBusinessLessonInputSchema },
  output: { schema: GeneratePassiveBusinessLessonOutputSchema },
  prompt: `Based on the following transaction details, generate a 2-sentence business or AI insight for a kirana shopkeeper. This lesson should be relevant, warm, friendly, and easily understandable.
The lesson should be exactly two sentences long.

Transaction Details:
Product: {{{productName}}}
{{#if quantity}}Quantity: {{{quantity}}}{{#if unit}} {{{unit}}}{{/if}}{{/if}}
{{#if customerName}}Customer: {{{customerName}}}{{/if}}
{{#if price}}Price: ₹{{{price}}}{{/if}}

Please provide the lesson in the requested language: {{{language}}}.`,
});

export async function generatePassiveBusinessLesson(
  input: GeneratePassiveBusinessLessonInput
): Promise<GeneratePassiveBusinessLessonOutput> {
  return generatePassiveBusinessLessonFlow(input);
}

const generatePassiveBusinessLessonFlow = ai.defineFlow(
  {
    name: 'generatePassiveBusinessLessonFlow',
    inputSchema: GeneratePassiveBusinessLessonInputSchema,
    outputSchema: GeneratePassiveBusinessLessonOutputSchema,
  },
  async (input) => {
    const { output } = await generatePassiveBusinessLessonPrompt(input);
    if (!output) {
      throw new Error('Failed to generate passive business lesson.');
    }
    return output;
  }
);
