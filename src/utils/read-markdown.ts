import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

interface ReadMarkdownOptions {
  filename: string;
  importMetaUrl: string;
  directory?: string;
}

/**
 * Reads a markdown file from a specified directory relative to src/.
 *
 * @param options - Configuration options
 * @param options.filename - The name of the markdown file (e.g., "generate-quote.md")
 * @param options.importMetaUrl - Pass import.meta.url from the calling module
 * @param options.directory - Directory name relative to src/ (defaults to "prompts")
 * @returns The content of the markdown file
 *
 * @example
 * ```ts
 * const prompt = readMarkdown({ filename: "generate-quote.md", importMetaUrl: import.meta.url });
 * const template = readMarkdown({ filename: "quote-frontmatter.md", importMetaUrl: import.meta.url, directory: "templates" });
 * ```
 */
export const readMarkdown = ({
  filename,
  importMetaUrl,
  directory = "prompts",
}: ReadMarkdownOptions): string => {
  const __dirname = dirname(fileURLToPath(importMetaUrl));
  return readFileSync(join(__dirname, `../${directory}`, filename), "utf-8");
};
