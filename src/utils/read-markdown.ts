import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Reads a markdown file from the prompts directory.
 *
 * @param filename - The name of the markdown file (e.g., "generate-quote.md")
 * @param importMetaUrl - Pass import.meta.url from the calling module
 * @returns The content of the markdown file
 *
 * @example
 * ```ts
 * const template = readMarkdown("generate-quote.md", import.meta.url);
 * ```
 */
export const readMarkdown = (
  filename: string,
  importMetaUrl: string,
): string => {
  const __dirname = dirname(fileURLToPath(importMetaUrl));
  return readFileSync(join(__dirname, "../prompts", filename), "utf-8");
};
