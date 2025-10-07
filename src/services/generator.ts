import { google } from "@ai-sdk/google";
import { updateActiveObservation } from "@langfuse/tracing";
import { generateObject } from "ai";
import { z } from "zod";
import { generateVariety } from "@/config/quote-variety";
import type { GeneratedQuote } from "@/types/quote";
import { readMarkdown } from "@/utils/read-markdown";

const promptTemplate = readMarkdown({
  filename: "generate-quote.md",
  importMetaUrl: import.meta.url,
});

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
