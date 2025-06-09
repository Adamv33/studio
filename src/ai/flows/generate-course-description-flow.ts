
'use server';
/**
 * @fileOverview AI flow for generating course descriptions.
 *
 * - generateCourseDescription - A function that generates a course description based on course type.
 * - GenerateCourseDescriptionInput - The input type for the generateCourseDescription function.
 * - GenerateCourseDescriptionOutput - The return type for the generateCourseDescription function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateCourseDescriptionInputSchema = z.object({
  courseType: z.string().describe('The type or name of the course (e.g., BLS, ACLS, Heartsaver First Aid).'),
});
export type GenerateCourseDescriptionInput = z.infer<typeof GenerateCourseDescriptionInputSchema>;

const GenerateCourseDescriptionOutputSchema = z.object({
  description: z.string().describe('A concise and engaging course description, typically 1-2 sentences long.'),
});
export type GenerateCourseDescriptionOutput = z.infer<typeof GenerateCourseDescriptionOutputSchema>;

export async function generateCourseDescription(input: GenerateCourseDescriptionInput): Promise<GenerateCourseDescriptionOutput> {
  return generateCourseDescriptionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateCourseDescriptionPrompt',
  input: {schema: GenerateCourseDescriptionInputSchema},
  output: {schema: GenerateCourseDescriptionOutputSchema},
  prompt: `You are an assistant that creates concise and engaging course descriptions for medical and first aid training.
Given the course type: {{{courseType}}}

Please generate a 1-2 sentence description suitable for a course catalog.
Focus on the key skills or benefits of the course.
If the course type is 'Other' or seems very generic, provide a general description for a supplementary skills or specialized training course.

Example for 'BLS': "This Basic Life Support (BLS) course equips healthcare professionals with critical skills to recognize life-threatening emergencies, perform CPR, use an AED, and relieve choking."
Example for 'Heartsaver First Aid CPR AED': "The Heartsaver First Aid CPR AED course teaches students critical skills needed to respond to and manage choking or a sudden cardiac arrest emergency in the first few minutes until emergency medical services (EMS) arrive. Students learn skills such as how to treat bleeding, sprains, broken bones, shock and other first aid emergencies."
`,
});

const generateCourseDescriptionFlow = ai.defineFlow(
  {
    name: 'generateCourseDescriptionFlow',
    inputSchema: GenerateCourseDescriptionInputSchema,
    outputSchema: GenerateCourseDescriptionOutputSchema,
  },
  async (input: GenerateCourseDescriptionInput) => {
    if (!input.courseType || input.courseType.trim() === '') {
        return { description: "A valuable supplementary course to enhance your skills." };
    }

    try {
      const {output} = await prompt(input);
      
      if (!output || !output.description) {
          console.warn(`AI did not return a description for course type: ${input.courseType}. Output:`, output);
          // Fallback if AI fails to generate a valid description structure
          return { description: `Learn essential skills in ${input.courseType}. This course covers key topics relevant to ${input.courseType}.` };
      }
      return output;
    } catch (error) {
      console.error(`Error in generateCourseDescriptionFlow for type '${input.courseType}':`, error);
      // Return a generic fallback description in case of any exception during the AI call
      return { description: `An introductory course on ${input.courseType}. Explore the fundamentals and key concepts.` };
    }
  }
);
