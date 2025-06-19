"use server";
/**
 * @fileOverview Answers user questions about pump data using Genkit tools to simulate database queries.
 *
 * - answerPumpDataQuestion - A function that handles user questions.
 * - UserQuestionInput - The input type for the answerPumpDataQuestion function.
 * - AIResponseOutput - The return type for the answerPumpDataQuestion function.
 */

import { ai } from "@/ai/genkit";
import { z } from "genkit";

// Schemas for Tools

// 1. How many [MODEL] shipped in [MONTH] [YEAR]?
const GetShippedPumpsInputSchema = z.object({
  model: z.string().describe("The pump model, e.g., DD4SE, RL200."),
  month: z
    .string()
    .describe(
      "The full name of the month, e.g., 'April', 'May'. Case-insensitive.",
    ),
  year: z.number().describe("The four-digit year, e.g., 2024."),
});
const GetShippedPumpsOutputSchema = z.object({
  model: z.string(),
  month: z.string(),
  year: z.number(),
  count: z.number(),
  status: z.enum(["FOUND", "NO_DATA", "MODEL_NOT_FOUND"]),
  message: z
    .string()
    .optional()
    .describe(
      "Additional context, e.g. 'No DD4SE pumps were shipped in April 2024.'",
    ),
});

// 2. How many [MODEL] were sent to [VENDOR] in [TIME_PERIOD] and how many are there right now?
const GetPumpsToVendorInputSchema = z.object({
  model: z
    .string()
    .optional()
    .describe("The pump model. If not specified, query for all models."),
  vendorName: z.string().describe("The name of the powder coat vendor."),
  timePeriod: z
    .string()
    .describe(
      "The time period for pumps sent, e.g., 'last 3 weeks', 'this month'. Can be relative.",
    ),
});
const GetPumpsToVendorOutputSchema = z.object({
  model: z.string().optional(),
  vendorName: z.string(),
  timePeriod: z.string(),
  countSent: z
    .number()
    .describe("Number of pumps sent to the vendor in the time period."),
  currentCountAtVendor: z
    .number()
    .describe("Number of pumps currently at the vendor."),
  status: z.enum(["FOUND", "NO_DATA", "VENDOR_NOT_FOUND"]),
  message: z.string().optional(),
});

// 3. Where are we on all open orders for [CUSTOMER]?
const GetCustomerOrderStatusInputSchema = z.object({
  customerName: z.string().describe("The name of the customer."),
});
const GetCustomerOrderStatusOutputSchema = z.object({
  customerName: z.string(),
  openOrdersSummary: z
    .array(
      z.object({
        poNumber: z.string(),
        model: z.string(),
        serialNumber: z.string().optional(),
        currentStage: z.string(),
        quantity: z
          .number()
          .optional()
          .describe(
            "Quantity for this PO if it's a batch order without individual serials yet.",
          ),
      }),
    )
    .optional()
    .describe("Summary of open orders. Can be empty if no open orders."),
  status: z.enum(["FOUND", "NO_OPEN_ORDERS", "CUSTOMER_NOT_FOUND"]),
  message: z.string().optional(),
});

// 4. When did the last pump on [PO_NUMBER] ship?
const GetLastShipmentForPOInputSchema = z.object({
  poNumber: z.string().describe("The Purchase Order number."),
});
const GetLastShipmentForPOOutputSchema = z.object({
  poNumber: z.string(),
  lastShipmentDate: z
    .string()
    .optional()
    .describe("Date of the last shipment (YYYY-MM-DD)."),
  status: z.enum([
    "SHIPPED",
    "PARTIALLY_SHIPPED",
    "NOT_SHIPPED_YET",
    "PO_NOT_FOUND",
    "PO_NOT_FULLY_SHIPPED",
  ]),
  message: z.string().optional(),
});

// Tool Definitions (Placeholders)

const getShippedPumpsTool = ai.defineTool(
  {
    name: "getShippedPumpsCountByModelAndMonth",
    description:
      "Finds out how many pumps of a specific model were shipped in a given month and year.",
    inputSchema: GetShippedPumpsInputSchema,
    outputSchema: GetShippedPumpsOutputSchema,
  },
  async (
    input: z.infer<typeof GetShippedPumpsInputSchema>,
  ): Promise<z.infer<typeof GetShippedPumpsOutputSchema>> => {
    // !!! Placeholder: Actual database query would go here !!!
    console.log(`[Tool:getShippedPumps] Called with: ${JSON.stringify(input)}`);
    if (
      input.model.toUpperCase() === "DD4SE" &&
      input.month.toLowerCase() === "april" &&
      input.year === 2024
    ) {
      return {
        model: input.model,
        month: input.month,
        year: input.year,
        count: 12,
        status: "FOUND",
        message: "12 DD4SE pumps were shipped in April 2024.",
      };
    }
    return {
      model: input.model,
      month: input.month,
      year: input.year,
      count: 0,
      status: "NO_DATA",
      message: `No data for ${input.model} shipped in ${input.month} ${input.year}.`,
    };
  },
);

const getPumpsToVendorTool = ai.defineTool(
  {
    name: "getPumpsSentToAndAtVendor",
    description:
      "Checks how many pumps (optionally of a specific model) were sent to a powder coat vendor in a given time period, and how many are currently there.",
    inputSchema: GetPumpsToVendorInputSchema,
    outputSchema: GetPumpsToVendorOutputSchema,
  },
  async (
    input: z.infer<typeof GetPumpsToVendorInputSchema>,
  ): Promise<z.infer<typeof GetPumpsToVendorOutputSchema>> => {
    // !!! Placeholder: Actual database query would go here !!!
    console.log(
      `[Tool:getPumpsToVendorTool] Called with: ${JSON.stringify(input)}`,
    );
    if (
      input.vendorName.toLowerCase().includes("acme") &&
      input.model?.toUpperCase() === "RL200"
    ) {
      return {
        model: input.model,
        vendorName: input.vendorName,
        timePeriod: input.timePeriod,
        countSent: 5,
        currentCountAtVendor: 2,
        status: "FOUND",
        message: `5 RL200s were sent to ${input.vendorName} ${input.timePeriod}. Currently, 2 RL200s are at ${input.vendorName}.`,
      };
    }
    return {
      model: input.model,
      vendorName: input.vendorName,
      timePeriod: input.timePeriod,
      countSent: 0,
      currentCountAtVendor: 0,
      status: "NO_DATA",
    };
  },
);

const getCustomerOrderStatusTool = ai.defineTool(
  {
    name: "getCustomerOpenOrderStatus",
    description:
      "Provides a summary of all open (not fully shipped) orders for a specific customer.",
    inputSchema: GetCustomerOrderStatusInputSchema,
    outputSchema: GetCustomerOrderStatusOutputSchema,
  },
  async (
    input: z.infer<typeof GetCustomerOrderStatusInputSchema>,
  ): Promise<z.infer<typeof GetCustomerOrderStatusOutputSchema>> => {
    // !!! Placeholder: Actual database query would go here !!!
    console.log(
      `[Tool:getCustomerOrderStatusTool] Called with: ${JSON.stringify(input)}`,
    );
    if (input.customerName.toLowerCase().includes("sunbelt")) {
      return {
        customerName: input.customerName,
        openOrdersSummary: [
          {
            poNumber: "PO12345",
            model: "DD6",
            serialNumber: "MSP-JN-1021",
            currentStage: "Assembly",
          },
          {
            poNumber: "PO67890",
            model: "RL200",
            quantity: 5,
            currentStage: "Fabrication",
          },
        ],
        status: "FOUND",
        message:
          "Sunbelt Rentals has 2 open orders: PO12345 (DD6, S/N MSP-JN-1021) is in Assembly. PO67890 (5x RL200) is in Fabrication.",
      };
    }
    return {
      customerName: input.customerName,
      status: "NO_OPEN_ORDERS",
      message: `No open orders found for ${input.customerName}.`,
    };
  },
);

const getLastShipmentForPOTool = ai.defineTool(
  {
    name: "getLastShipmentDateForPO",
    description:
      "Finds the shipment date of the last pump for a given Purchase Order (PO) number.",
    inputSchema: GetLastShipmentForPOInputSchema,
    outputSchema: GetLastShipmentForPOOutputSchema,
  },
  async (
    input: z.infer<typeof GetLastShipmentForPOInputSchema>,
  ): Promise<z.infer<typeof GetLastShipmentForPOOutputSchema>> => {
    // !!! Placeholder: Actual database query would go here !!!
    console.log(
      `[Tool:getLastShipmentForPOTool] Called with: ${JSON.stringify(input)}`,
    );
    if (input.poNumber === "PO3456") {
      return {
        poNumber: input.poNumber,
        lastShipmentDate: "2024-05-15",
        status: "SHIPPED",
        message: "The last pump on PO3456 shipped on 2024-05-15.",
      };
    }
    return {
      poNumber: input.poNumber,
      status: "PO_NOT_FOUND",
      message: `PO ${input.poNumber} not found or not shipped.`,
    };
  },
);

// Main Flow Input/Output
const UserQuestionInputSchema = z.object({
  question: z.string().describe("The user's question about pump data."),
  // You could add currentPumpContext: Pump object here if the question is about a specific pump shown in UI
});
export type UserQuestionInput = z.infer<typeof UserQuestionInputSchema>;

const AIResponseOutputSchema = z.object({
  answer: z
    .string()
    .describe(
      "The AI-generated answer to the user's question, based on tool outputs if used.",
    ),
});
export type AIResponseOutput = z.infer<typeof AIResponseOutputSchema>;

export async function answerPumpDataQuestion(
  input: UserQuestionInput,
): Promise<AIResponseOutput> {
  return answerPumpDataQuestionFlow(input);
}

// Prompt Definition
const prompt = ai.definePrompt({
  name: "answerPumpDataQuestionPrompt",
  input: { schema: UserQuestionInputSchema },
  output: { schema: AIResponseOutputSchema },
  tools: [
    getShippedPumpsTool,
    getPumpsToVendorTool,
    getCustomerOrderStatusTool,
    getLastShipmentForPOTool,
  ],
  prompt: `You are an AI assistant for PumpTrack, a pump manufacturing workflow management application.
Your goal is to answer user questions based on pump production and movement data.
Use the available tools to answer questions if they match the tool's capability.
When a tool is used, formulate your answer based on the information provided by the tool's output, especially the 'message' field if available and relevant.
If no specific tool seems appropriate for the question, explain that you can't answer that specific type of query yet and list the types of questions you *can* answer with your current tools.

Today's date is ${new Date().toISOString().split("T")[0]}.

User's question: {{{question}}}
`,
});

const answerPumpDataQuestionFlow = ai.defineFlow(
  {
    name: "answerPumpDataQuestionFlow",
    inputSchema: UserQuestionInputSchema,
    outputSchema: AIResponseOutputSchema,
  },
  async (input: UserQuestionInput): Promise<AIResponseOutput> => {
    const response = await prompt(input);
    const output = response.output;
    const history = response.messages;

    // Log tool interactions for debugging
    if (history && history.length > 0) {
      history.forEach((event, index) => {
        console.log(
          `[AI History Event ${index}]: Role: ${event.role}, Parts:`,
          event.content,
        );
        event.content.forEach((part) => {
          if (part.toolRequest)
            console.log(
              `  Tool Request: ${part.toolRequest.name}, Input: ${JSON.stringify(
                part.toolRequest.input,
              )}`,
            );
          if (part.toolResponse)
            console.log(
              `  Tool Response: ${part.toolResponse.name}, Output: ${JSON.stringify(
                part.toolResponse.output,
              )}`,
            );
        });
      });
    }

    if (!output) {
      return {
        answer:
          "I'm sorry, I wasn't able to generate a response for that question. Please try rephrasing or asking something different.",
      };
    }
    return output;
  },
);
