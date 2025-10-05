import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import { format } from "date-fns";
import slugify from "slugify";
import { QUOTES_DIR } from "../config.ts";
import type { Quote } from "../types/quote.ts";

const createMarkdownContent = (
  title: string,
  text: string,
  date: string,
): string => {
  return `---
title: "${title}"
date: "${date}"
---

> ${text}
`;
};

export const saveQuoteToMarkdown = async (
  quote: Quote,
  date: string,
): Promise<string> => {
  const timestamp = new Date(quote.timestamp);
  const year = format(timestamp, "yyyy");
  const month = format(timestamp, "MM");
  const day = format(timestamp, "dd");
  const dirPath = join(QUOTES_DIR, year, month);

  await mkdir(dirPath, { recursive: true });

  const titleSlug = slugify(quote.title, { lower: true, strict: true });
  const filename = `${day}-${titleSlug}.md`;
  const filePath = join(dirPath, filename);

  const content = createMarkdownContent(quote.title, quote.text, date);
  await Bun.write(filePath, content);

  return filePath;
};
