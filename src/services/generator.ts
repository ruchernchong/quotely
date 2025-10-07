import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { google } from "@ai-sdk/google";
import { updateActiveObservation } from "@langfuse/tracing";
import { generateObject } from "ai";
import { z } from "zod";
import { generateVariety } from "../config/quote-variety.ts";
import type { GeneratedQuote } from "../types/quote.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const promptTemplate = readFileSync(
  join(__dirname, "../prompts/generate-quote.md"),
  "utf-8",
);

export const generateQuote = async (): Promise<GeneratedQuote> => {
  const variety = generateVariety();

  const prompt = promptTemplate
    .replace("{{theme}}", variety.theme)
    .replace("{{tone}}", variety.tone)
    .replace("{{style}}", variety.style)
    .replace("{{length}}", variety.length.range);

  // Update observation with input metadata
  updateActiveObservation({
    input: {
      theme: variety.theme,
      tone: variety.tone,
      style: variety.style,
      length: variety.length.name,
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
        length: variety.length.name,
      },
    },
  });

  // Update observation with output
  updateActiveObservation({
    output: object,
  });

  return object;
};
