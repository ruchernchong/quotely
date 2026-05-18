import { readFile, writeFile } from "node:fs/promises";
import { QUOTES_JSON_PATH } from "@/config";
import type { Quote } from "@/types/quote";

export class JsonStorage {
  private readonly filePath: string;
  private quotesCache: Quote[] | null = null;

  constructor(filePath: string = QUOTES_JSON_PATH) {
    this.filePath = filePath;
  }

  async loadQuotes(): Promise<Quote[]> {
    if (this.quotesCache !== null) {
      return this.quotesCache;
    }

    let quotes: Quote[] = [];
    try {
      const content = await readFile(this.filePath, "utf-8");
      quotes = JSON.parse(content);
    } catch {
      quotes = [];
    }

    this.quotesCache = quotes;
    return quotes;
  }

  async saveQuotes(quotes: Quote[]): Promise<void> {
    await writeFile(this.filePath, JSON.stringify(quotes, null, 2), "utf-8");
    this.quotesCache = quotes;
  }

  async hasTodayQuote(date: string): Promise<boolean> {
    const quotes = await this.loadQuotes();
    return quotes.some((quote) => quote.date === date);
  }

  async getQuoteByDate(date: string): Promise<Quote | undefined> {
    const quotes = await this.loadQuotes();
    return quotes.find((quote) => quote.date === date);
  }

  async replaceQuoteByDate(newQuote: Quote): Promise<Quote | undefined> {
    const quotes = await this.loadQuotes();
    let oldQuote: Quote | undefined;

    const updatedQuotes = quotes.map((quote) => {
      if (quote.date === newQuote.date) {
        oldQuote = quote;
        return newQuote;
      }
      return quote;
    });

    if (!oldQuote) {
      return;
    }

    await this.saveQuotes(updatedQuotes);

    return oldQuote;
  }
}
