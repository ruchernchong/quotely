import { format } from "date-fns";
import { QUOTES_JSON_PATH } from "./config.ts";
import { generateQuote } from "./services/generator.ts";
import {
  getQuoteByDate,
  loadQuotes,
  replaceQuoteByDate,
  saveQuotesToJson,
} from "./services/json-storage.ts";
import {
  deleteQuoteMarkdown,
  saveQuoteToMarkdown,
} from "./services/markdown-storage.ts";
import type { Quote } from "./types/quote.ts";

const main = async (): Promise<void> => {
  try {
    const now = new Date();
    const today = format(now, "yyyy-MM-dd");

    const { title, text } = await generateQuote();

    const quote: Quote = {
      title,
      text,
      date: today,
      timestamp: now.toISOString(),
    };

    // Check if quote already exists for today
    const existingQuote = await getQuoteByDate(today);

    if (existingQuote) {
      // Replace existing quote
      await deleteQuoteMarkdown(existingQuote);
      await replaceQuoteByDate(quote);
      console.log("🔄 Replaced existing quote for today");
    } else {
      // Add new quote
      const quotes = await loadQuotes();
      quotes.push(quote);
      await saveQuotesToJson(quotes);
      console.log("✅ Quote saved successfully!");
    }

    // Save to Markdown
    const filePath = await saveQuoteToMarkdown(quote, quote.date);

    // Log details
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
