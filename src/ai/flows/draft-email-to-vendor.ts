'use server';

/**
 * @fileOverview Drafts an email to the powder coat vendor when a pump is moved to the 'Powder Coat' stage.
 *
 * - draftEmailToVendor - A function that drafts the email to the vendor.
 * - DraftEmailToVendorInput - The input type for the draftEmailToVendor function.
 * - DraftEmailToVendorOutput - The return type for the draftEmailToVendor function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DraftEmailToVendorInputSchema = z.object({
  vendorName: z.string().describe('The name of the powder coat vendor.'),
  pumpModel: z.string().describe('The model of the pump.'),
  pumpSerialNumber: z.string().describe('The serial number of the pump.'),
  pumpPONumber: z.string().describe('The PO number of the pump.'),
  customerName: z.string().describe('The name of the customer.'),
  powderCoatColor: z.string().describe('The desired powder coat color.'),
});
export type DraftEmailToVendorInput = z.infer<typeof DraftEmailToVendorInputSchema>;

const DraftEmailToVendorOutputSchema = z.object({
  emailSubject: z.string().describe('The subject of the email.'),
  emailBody: z.string().describe('The body of the email.'),
});
export type DraftEmailToVendorOutput = z.infer<typeof DraftEmailToVendorOutputSchema>;

export async function draftEmailToVendor(input: DraftEmailToVendorInput): Promise<DraftEmailToVendorOutput> {
  return draftEmailToVendorFlow(input);
}

const prompt = ai.definePrompt({
  name: 'draftEmailToVendorPrompt',
  input: {schema: DraftEmailToVendorInputSchema},
  output: {schema: DraftEmailToVendorOutputSchema},
  prompt: `You are an AI email assistant specializing in drafting emails to powder coat vendors.

  Given the following information about a pump that is ready for powder coating, draft an email to the vendor to alert them of the upcoming item.

  Vendor Name: {{{vendorName}}}
  Pump Model: {{{pumpModel}}}
  Pump Serial Number: {{{pumpSerialNumber}}}
  Pump PO Number: {{{pumpPONumber}}}
  Customer Name: {{{customerName}}}
  Powder Coat Color: {{{powderCoatColor}}}

  The email should have a professional tone and include all necessary information for the vendor to prepare for the pump.
  The email should include a subject and a body.
`,
});

const draftEmailToVendorFlow = ai.defineFlow(
  {
    name: 'draftEmailToVendorFlow',
    inputSchema: DraftEmailToVendorInputSchema,
    outputSchema: DraftEmailToVendorOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
