// Add "use server" directive
'use server';

/**
 * @fileOverview This file defines a Genkit flow for suggesting next steps
 *  based on the current stage of a pump in the workflow.
 *
 * - suggestNextSteps - A function that suggests the next steps for a pump.
 * - SuggestNextStepsInput - The input type for the suggestNextSteps function.
 * - SuggestNextStepsOutput - The return type for the suggestNextSteps function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestNextStepsInputSchema = z.object({
  stage: z
    .string()
    .describe('The current stage of the pump in the workflow.'),
  pumpDetails: z
    .string()
    .describe('Details about the pump, including model, customer, serial number and PO number.'),
});
export type SuggestNextStepsInput = z.infer<typeof SuggestNextStepsInputSchema>;

const SuggestNextStepsOutputSchema = z.object({
  nextSteps: z
    .array(z.string())
    .describe('A list of suggested next steps for the pump.'),
});
export type SuggestNextStepsOutput = z.infer<typeof SuggestNextStepsOutputSchema>;

export async function suggestNextSteps(input: SuggestNextStepsInput): Promise<SuggestNextStepsOutput> {
  return suggestNextStepsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestNextStepsPrompt',
  input: {schema: SuggestNextStepsInputSchema},
  output: {schema: SuggestNextStepsOutputSchema},
  prompt: `You are an AI assistant helping users manage a pump workflow.
  Based on the current stage of the pump and its details, suggest the most relevant next steps.

  Current Stage: {{{stage}}}
  Pump Details: {{{pumpDetails}}}

  Suggest a list of next steps that the user should take to progress the pump through the workflow.
  The next steps should be actionable and specific.
  Format the output as a JSON array of strings.
  `,
});

const suggestNextStepsFlow = ai.defineFlow(
  {
    name: 'suggestNextStepsFlow',
    inputSchema: SuggestNextStepsInputSchema,
    outputSchema: SuggestNextStepsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
