'use server';
/**
 * @fileOverview This file defines a Genkit flow for recommending furniture items based on a user-provided prompt.
 *
 * - recommendFurniture - A function that takes a user prompt and returns a list of recommended furniture items.
 * - RecommendFurnitureInput - The input type for the recommendFurniture function, which is a text prompt.
 * - RecommendFurnitureOutput - The return type for the recommendFurniture function, which is a list of furniture items.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RecommendFurnitureInputSchema = z.object({
  prompt: z.string().describe('A description of the desired furniture style or room setting.'),
});
export type RecommendFurnitureInput = z.infer<typeof RecommendFurnitureInputSchema>;

const RecommendFurnitureOutputSchema = z.object({
  furnitureItems: z
    .array(z.string())
    .describe('A list of recommended furniture items that match the description.'),
});
export type RecommendFurnitureOutput = z.infer<typeof RecommendFurnitureOutputSchema>;

export async function recommendFurniture(input: RecommendFurnitureInput): Promise<RecommendFurnitureOutput> {
  return recommendFurnitureFlow(input);
}

const prompt = ai.definePrompt({
  name: 'recommendFurniturePrompt',
  input: {schema: RecommendFurnitureInputSchema},
  output: {schema: RecommendFurnitureOutputSchema},
  prompt: `Based on the following description of the desired furniture style or room setting, generate a list of recommended furniture items:

Description: {{{prompt}}}

Respond with a list of items.`,
});

const recommendFurnitureFlow = ai.defineFlow(
  {
    name: 'recommendFurnitureFlow',
    inputSchema: RecommendFurnitureInputSchema,
    outputSchema: RecommendFurnitureOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
