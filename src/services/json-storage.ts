import { QUOTES_JSON_PATH } from "../config.ts";
import type { Quote } from "../types/quote.ts";

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

    const jsonFile = Bun.file(this.filePath);
    if (await jsonFile.exists()) {
      const content = await jsonFile.text();
      this.quotesCache = JSON.parse(content);
      return this.quotesCache;
    }

    this.quotesCache = [];
    return this.quotesCache;
  }

  async saveQuotes(quotes: Quote[]): Promise<void> {
    await Bun.write(this.filePath, JSON.stringify(quotes, null, 2));
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
