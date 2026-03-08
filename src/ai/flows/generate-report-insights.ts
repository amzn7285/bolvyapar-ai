'use server';
/**
 * @fileOverview A Genkit flow for generating business insights and tips from sales data for the DukaanSaathi AI Report tab.
 *
 * - generateReportInsights - A function that triggers the report insights generation process.
 * - ReportInsightsInput - The input type for the generateReportInsights function.
 * - ReportInsightsOutput - The return type for the generateReportInsights function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// Input schema for the report insights generation
const SaleRecordSchema = z.object({
  productName: z.string().describe('Name of the product sold.'),
  quantity: z.number().int().positive().describe('Quantity of the product sold.'),
  customerName: z.string().optional().describe('Optional: Name of the customer.'),
  salePrice: z.number().positive().describe('Total price of this specific sale item (not unit price or profit).'),
  saleTimestamp: z.string().datetime().describe('ISO 8601 timestamp of when the sale occurred.'),
});

const ReportInsightsInputSchema = z.object({
  salesData: z.array(SaleRecordSchema).describe('An array of recent sales records for analysis.'),
  language: z.enum(['en-IN', 'hi-IN']).describe('The desired language for the generated insights (en-IN for English, hi-IN for Hindi).'),
});
export type ReportInsightsInput = z.infer<typeof ReportInsightsInputSchema>;

// Output schema for the report insights generation
const ReportInsightsOutputSchema = z.object({
  customerPatterns: z.string().describe('A natural language summary of observed customer buying patterns.'),
  salesPatterns: z.string().describe('A natural language summary of observed general sales trends and patterns.'),
  weeklyTip: z.string().describe('A practical business tip for the coming week, derived from the sales data.'),
  lessonText: z.string().describe('A 2-sentence business or AI insight from this analysis, intended for passive learning.'),
});
export type ReportInsightsOutput = z.infer<typeof ReportInsightsOutputSchema>;

// Wrapper function to call the Genkit flow
export async function generateReportInsights(input: ReportInsightsInput): Promise<ReportInsightsOutput> {
  return generateReportInsightsFlow(input);
}

// Genkit prompt definition
const reportInsightsPrompt = ai.definePrompt({
  name: 'reportInsightsPrompt',
  input: { schema: ReportInsightsInputSchema },
  output: { schema: ReportInsightsOutputSchema },
  // The prompt explicitly includes the persona and instructions based on the general system prompt.
  prompt: `You are DukaanSaathi AI, a warm, friendly, and helpful business partner for an Indian kirana shopkeeper. Your goal is to analyze the provided recent sales data and generate valuable insights for the shop owner to help them make informed decisions.

Based on the following sales data, please identify and summarize:
1.  **Customer Patterns**: Describe any recurring customer behaviors, popular customer names, or buying habits you observe.
2.  **Sales Patterns**: Describe general sales trends, popular products, peak selling times, or any other significant sales observations.
3.  **Weekly Business Tip**: Provide one practical, actionable, and encouraging business tip for the coming week, derived directly from your analysis of the sales data.

Maintain a warm and friendly tone. Adhere to privacy rules: NEVER mention specific profit margins, total revenue, or credit balances. Focus on patterns and actionable advice.

Here is the recent sales data for your analysis:
{{#if salesData.length}}
  {{#each salesData}}
    - Product: {{this.productName}}, Quantity: {{this.quantity}}, Sale Price: ₹{{this.salePrice}} {{#if this.customerName}}, Customer: {{this.customerName}}{{/if}}, Time: {{this.saleTimestamp}}
  {{/each}}
{{else}}
  No sales data provided for analysis.
{{/if}}

After generating the above insights, also create a concise, two-sentence business or AI insight related to this analysis. This specific insight should be suitable for a passive lesson, and will be stored in a 'lessonText' field – it should not be part of the spoken response.

Ensure your entire output is in valid JSON format according to the provided schema.
Respond in {{#if (eq language 'hi-IN')}}Hindi{{else}}English{{/if}}. If the sales data is empty, mention that no patterns could be identified due to lack of data, and provide a generic encouraging tip. If the sales data is empty, explain that no patterns can be derived but offer a general encouragement.`,
});

// Genkit flow definition
const generateReportInsightsFlow = ai.defineFlow(
  {
    name: 'generateReportInsightsFlow',
    inputSchema: ReportInsightsInputSchema,
    outputSchema: ReportInsightsOutputSchema,
  },
  async (input) => {
    const { output } = await reportInsightsPrompt(input);
    if (!output) {
      throw new Error('Failed to generate report insights.');
    }
    return output;
  }
);
