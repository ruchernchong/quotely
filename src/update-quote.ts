import { format } from "date-fns";
import { QUOTES_JSON_PATH } from "./config.ts";
import { generateQuote } from "./services/generator.ts";
import { loadQuotes, saveQuotesToJson } from "./services/json-storage.ts";
import { saveQuoteToMarkdown } from "./services/markdown-storage.ts";
import type { Quote } from "./types/quote.ts";

const main = async (): Promise<void> => {
  try {
    const { title, text } = await generateQuote();
    const now = new Date();

    const quote: Quote = {
      title,
      text,
      date: format(now, "yyyy-MM-dd"),
      timestamp: now.toISOString(),
    };

    // Save to JSON
    const quotes = await loadQuotes();
    quotes.push(quote);
    await saveQuotesToJson(quotes);

    // Save to Markdown
    const filePath = await saveQuoteToMarkdown(quote, quote.date);

    // Log success
    console.log("✅ Quote saved successfully!");
    console.log(`📝 Title: ${title}`);
    console.log(`💬 Quote: ${text}`);
    console.log(`💾 Saved to:`);
    console.log(`   - ${QUOTES_JSON_PATH}`);
    console.log(`   - ${filePath}`);
  } catch (error) {
    console.error("❌ Error saving quote:", error);
    process.exit(1);
  }
};

main();
