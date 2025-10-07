import { observe, updateActiveTrace } from "@langfuse/tracing";
import { format } from "date-fns";
import { QUOTES_JSON_PATH } from "@/config";
import {
  langfuseSpanProcessor,
  shutdownTracing,
  startTracing,
} from "@/instrumentation";
import { generateQuote } from "@/services/generator";
import { JsonStorage } from "@/services/json-storage";
import { MarkdownStorage } from "@/services/markdown-storage";
import type { Quote } from "@/types/quote";

const runQuoteGeneration = observe(
  async (): Promise<void> => {
    const now = new Date();
    const today = format(now, "yyyy-MM-dd");

    // Update trace metadata
    updateActiveTrace({
      name: "generate-daily-quote",
      tags: ["quote-generation", "daily-automation"],
      metadata: {
        date: today,
      },
    });

    const { title, text } = await generateQuote();

    const quote: Quote = {
      title,
      text,
      date: today,
      timestamp: now.toISOString(),
    };

    // Initialize storage services
    const jsonStorage = new JsonStorage();
    const markdownStorage = new MarkdownStorage();

    // Check if quote already exists for today
    const existingQuote = await jsonStorage.getQuoteByDate(today);

    if (existingQuote) {
      // Replace existing quote
      await markdownStorage.deleteQuote(existingQuote);
      await jsonStorage.replaceQuoteByDate(quote);
      console.log("🔄 Replaced existing quote for today");
    } else {
      // Add new quote
      const quotes = await jsonStorage.loadQuotes();
      quotes.push(quote);
      await jsonStorage.saveQuotes(quotes);
      console.log("✅ Quote saved successfully!");
    }

    // Save to Markdown
    const filePath = await markdownStorage.saveQuote(quote, quote.date);

    // Update trace with output
    updateActiveTrace({
      output: {
        title,
        text,
        date: today,
      },
      metadata: {
        filePath,
        isReplacement: !!existingQuote,
      },
    });

    // Log details
    console.log(`📝 Title: ${title}`);
    console.log(`💬 Quote: ${text}`);
    console.log(`💾 Saved to:`);
    console.log(`   - ${QUOTES_JSON_PATH}`);
    console.log(`   - ${filePath}`);
  },
  { name: "generate-daily-quote" },
);

const main = async (): Promise<void> => {
  // Initialize LangFuse tracing
  startTracing();

  try {
    await runQuoteGeneration();
  } catch (error) {
    console.error("❌ Error saving quote:", error);
    await shutdownTracing();
    process.exit(1);
  } finally {
    // Ensure all spans are flushed and tracing is properly shut down
    if (langfuseSpanProcessor) {
      await langfuseSpanProcessor.forceFlush();
    }
    await shutdownTracing();
  }
};

main();
