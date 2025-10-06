import { QUOTES_JSON_PATH } from "../config.ts";
import type { Quote } from "../types/quote.ts";

type QuotesStorageOptions = {
  filePath?: string;
};

export const loadQuotes = async (
  options?: QuotesStorageOptions,
): Promise<Quote[]> => {
  const filePath = options?.filePath ?? QUOTES_JSON_PATH;
  const jsonFile = Bun.file(filePath);
  if (await jsonFile.exists()) {
    const content = await jsonFile.text();
    return JSON.parse(content);
  }
  return [];
};

export const saveQuotesToJson = async (
  quotes: Quote[],
  options?: QuotesStorageOptions,
): Promise<void> => {
  const filePath = options?.filePath ?? QUOTES_JSON_PATH;
  await Bun.write(filePath, JSON.stringify(quotes, null, 2));
};

export const hasTodaysQuote = async (
  date: string,
  options?: QuotesStorageOptions,
): Promise<boolean> => {
  const quotes = await loadQuotes(options);
  return quotes.some((quote) => quote.date === date);
};

export const getQuoteByDate = async (
  date: string,
  options?: QuotesStorageOptions,
): Promise<Quote | undefined> => {
  const quotes = await loadQuotes(options);
  return quotes.find((quote) => quote.date === date);
};

export const replaceQuoteByDate = async (
  newQuote: Quote,
  options?: QuotesStorageOptions,
): Promise<Quote | undefined> => {
  const quotes = await loadQuotes(options);
  const index = quotes.findIndex((quote) => quote.date === newQuote.date);

  if (index === -1) {
    return undefined;
  }

  const oldQuote = quotes[index];
  quotes[index] = newQuote;

  await saveQuotesToJson(quotes, options);

  return oldQuote;
};
