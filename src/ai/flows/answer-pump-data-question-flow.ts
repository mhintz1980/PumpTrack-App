
'use server';
/**
 * @fileOverview Answers user questions about pump data.
 *
 * - answerPumpDataQuestion - A function that handles user questions.
 * - UserQuestionInput - The input type for the answerPumpDataQuestion function.
 * - AIResponseOutput - The return type for the answerPumpDataQuestion function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const UserQuestionInputSchema = z.object({
  question: z.string().describe("The user's question about pump data."),
});
export type UserQuestionInput = z.infer<typeof UserQuestionInputSchema>;

const AIResponseOutputSchema = z.object({
  answer: z.string().describe("The AI-generated answer to the user's question."),
});
export type AIResponseOutput = z.infer<typeof AIResponseOutputSchema>;

export async function answerPumpDataQuestion(input: UserQuestionInput): Promise<AIResponseOutput> {
  return answerPumpDataQuestionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'answerPumpDataQuestionPrompt',
  input: { schema: UserQuestionInputSchema },
  output: { schema: AIResponseOutputSchema },
  prompt: `You are an AI assistant for PumpTrack, a pump manufacturing workflow management application.
Your goal is to answer user questions based on pump production and movement data.

IMPORTANT: You currently DO NOT have live access to the PumpTrack database.
Therefore, you cannot answer specific questions with real-time data yet.

When a user asks a question:
1. Acknowledge their question.
2. Inform them that live data querying is a feature currently under development.
3. Provide an example of how you *would* answer their question if you had data access, or explain the types of information you will be able to provide once connected.
   For instance, if they ask "How many DD6 pumps were shipped last month?", you could say:
   "I understand you want to know how many DD6 pumps were shipped last month. Once I'm connected to the live data, I'll be able to tell you that. For example, I could say, 'Last month, 15 DD6 pumps were shipped.' I can also help with queries about specific customers, PO numbers, timeframes for stages, etc."
4. Maintain a helpful and optimistic tone about future capabilities.

User's question: {{{question}}}
`,
});

const answerPumpDataQuestionFlow = ai.defineFlow(
  {
    name: 'answerPumpDataQuestionFlow',
    inputSchema: UserQuestionInputSchema,
    outputSchema: AIResponseOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      // Fallback in case the model returns nothing, though the schema should prevent this
      return { answer: "I'm sorry, I wasn't able to generate a response for that question. Please try rephrasing or asking something different." };
    }
    return output;
  }
);
