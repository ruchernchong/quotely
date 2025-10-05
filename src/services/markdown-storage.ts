import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import { QUOTES_DIR } from "../config.ts";
import type { Quote } from "../types/quote.ts";
import { getDateParts } from "../utils/date.ts";
import { slugify } from "../utils/slugify.ts";

const createMarkdownContent = (
  title: string,
  text: string,
  dateString: string,
): string => {
  return `# ${title}

> ${text}

---

*${dateString}*
`;
};

export const saveQuoteToMarkdown = async (
  quote: Quote,
  dateString: string,
): Promise<string> => {
  const { year, month, day } = getDateParts(new Date(quote.timestamp));
  const dirPath = join(QUOTES_DIR, year, month);

  await mkdir(dirPath, { recursive: true });

  const titleSlug = slugify(quote.title);
  const filename = `${day}-${titleSlug}.md`;
  const filePath = join(dirPath, filename);

  const content = createMarkdownContent(quote.title, quote.text, dateString);
  await Bun.write(filePath, content);

  return filePath;
};
