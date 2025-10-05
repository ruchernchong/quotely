import { QUOTES_JSON_PATH } from "../config.ts";
import type { Quote } from "../types/quote.ts";

export const loadQuotes = async (): Promise<Quote[]> => {
  const jsonFile = Bun.file(QUOTES_JSON_PATH);
  if (await jsonFile.exists()) {
    const content = await jsonFile.text();
    return JSON.parse(content);
  }
  return [];
};

export const saveQuotesToJson = async (quotes: Quote[]): Promise<void> => {
  await Bun.write(QUOTES_JSON_PATH, JSON.stringify(quotes, null, 2));
};
