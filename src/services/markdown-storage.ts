import { mkdir, readdir, unlink } from "node:fs/promises";
import { join } from "node:path";
import { format } from "date-fns";
import slugify from "slugify";
import { QUOTES_DIR } from "@/config";
import type { Quote } from "@/types/quote";
import { readMarkdown } from "@/utils/read-markdown";

const quoteTemplate = readMarkdown("quote-template.md", import.meta.url);

export class MarkdownStorage {
  private readonly baseDir: string;

  constructor(baseDir: string = QUOTES_DIR) {
    this.baseDir = baseDir;
  }

  async saveQuote(quote: Quote, date: string): Promise<string> {
    const timestamp = new Date(quote.timestamp);
    const year = format(timestamp, "yyyy");
    const month = format(timestamp, "MM");
    const dirPath = join(this.baseDir, year, month);

    await mkdir(dirPath, { recursive: true });

    const filePath = this.getMarkdownFilePath(quote);
    const content = this.createMarkdownContent(quote.title, quote.text, date);
    await Bun.write(filePath, content);

    return filePath;
  }

  async deleteQuote(quote: Quote): Promise<void> {
    const timestamp = new Date(quote.timestamp);
    const year = format(timestamp, "yyyy");
    const month = format(timestamp, "MM");
    const day = format(timestamp, "dd");
    const dirPath = join(this.baseDir, year, month);

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
  }

  private createMarkdownContent(
    title: string,
    text: string,
    date: string,
  ): string {
    return quoteTemplate
      .replace("{{title}}", title)
      .replace("{{date}}", date)
      .replace("{{text}}", text);
  }

  private getMarkdownFilePath(quote: Quote): string {
    const timestamp = new Date(quote.timestamp);
    const year = format(timestamp, "yyyy");
    const month = format(timestamp, "MM");
    const day = format(timestamp, "dd");
    const titleSlug = slugify(quote.title, { lower: true, strict: true });
    const filename = `${day}-${titleSlug}.md`;
    return join(this.baseDir, year, month, filename);
  }
}
