import { mkdir, readdir, unlink } from "node:fs/promises";
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

type SaveQuoteOptions = {
  baseDir?: string;
};

const getMarkdownFilePath = (
  quote: Quote,
  baseDir: string = QUOTES_DIR,
): string => {
  const timestamp = new Date(quote.timestamp);
  const year = format(timestamp, "yyyy");
  const month = format(timestamp, "MM");
  const day = format(timestamp, "dd");
  const titleSlug = slugify(quote.title, { lower: true, strict: true });
  const filename = `${day}-${titleSlug}.md`;
  return join(baseDir, year, month, filename);
};

export const saveQuoteToMarkdown = async (
  quote: Quote,
  date: string,
  options?: SaveQuoteOptions,
): Promise<string> => {
  const timestamp = new Date(quote.timestamp);
  const year = format(timestamp, "yyyy");
  const month = format(timestamp, "MM");
  const baseDir = options?.baseDir ?? QUOTES_DIR;
  const dirPath = join(baseDir, year, month);

  await mkdir(dirPath, { recursive: true });

  const filePath = getMarkdownFilePath(quote, baseDir);
  const content = createMarkdownContent(quote.title, quote.text, date);
  await Bun.write(filePath, content);

  return filePath;
};

export const deleteQuoteMarkdown = async (
  quote: Quote,
  options?: SaveQuoteOptions,
): Promise<void> => {
  const baseDir = options?.baseDir ?? QUOTES_DIR;
  const timestamp = new Date(quote.timestamp);
  const year = format(timestamp, "yyyy");
  const month = format(timestamp, "MM");
  const day = format(timestamp, "dd");
  const dirPath = join(baseDir, year, month);

  try {
    const files = await readdir(dirPath);
    const datePrefix = `${day}-`;

    // Delete all files matching the date pattern
    for (const file of files) {
      if (file.startsWith(datePrefix) && file.endsWith(".md")) {
        await unlink(join(dirPath, file));
      }
    }
  } catch (error) {
    // Ignore if directory doesn't exist
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
      throw error;
    }
  }
};
