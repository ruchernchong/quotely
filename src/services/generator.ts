import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import { z } from "zod";
import type { GeneratedQuote } from "../types/quote.ts";

export const generateQuote = async (): Promise<GeneratedQuote> => {
  const { object } = await generateObject({
    model: google("gemini-2.5-flash"),
    schema: z.object({
      title: z
        .string()
        .describe("A short, catchy title for the quote (3-6 words)"),
      text: z
        .string()
        .describe(
          "An inspiring and motivational quote (under 100 words, no quotation marks)",
        ),
    }),
    prompt:
      "Generate a motivational quote with a title. The title should capture the essence of the quote in 3-6 words. The quote should be inspiring and concise.",
  });

  return object;
};
