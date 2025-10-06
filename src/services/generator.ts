import { google } from "@ai-sdk/google";
import { updateActiveObservation } from "@langfuse/tracing";
import { generateObject } from "ai";
import { z } from "zod";
import { generateVariety } from "../config/quote-variety.ts";
import type { GeneratedQuote } from "../types/quote.ts";

export const generateQuote = async (): Promise<GeneratedQuote> => {
  const variety = generateVariety();

  const prompt = `Generate a unique and memorable motivational quote with a title.

Theme: ${variety.theme}
Tone: ${variety.tone}
Style: ${variety.style}
Length: ${variety.length.range}

Requirements:
- Create a title that captures the essence in 3-6 words (should be unique and creative, not generic)
- Write the quote in the specified style and tone
- Keep the quote within the specified word count
- Make it inspiring and thought-provoking
- Do NOT use quotation marks in the quote text
- Avoid clichés and generic motivational phrases
- Be specific and memorable`;

  // Update observation with input metadata
  updateActiveObservation({
    input: {
      theme: variety.theme,
      tone: variety.tone,
      style: variety.style,
      length: variety.length.description,
    },
  });

  const { object } = await generateObject({
    model: google("gemini-2.5-flash"),
    schema: z.object({
      title: z
        .string()
        .describe(
          "A unique, creative title for the quote (3-6 words, avoid generic phrases)",
        ),
      text: z
        .string()
        .describe(
          "An inspiring quote matching the specified style, tone, and length",
        ),
    }),
    prompt,
    experimental_telemetry: {
      isEnabled: true,
      functionId: "generate-quote",
      metadata: {
        theme: variety.theme,
        tone: variety.tone,
        style: variety.style,
        length: variety.length.description,
      },
    },
  });

  // Update observation with output
  updateActiveObservation({
    output: object,
  });

  return object;
};
