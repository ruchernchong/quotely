import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { readMarkdown } from "@/utils/read-markdown";

describe("readMarkdown", () => {
  it("should read markdown file from prompts directory", () => {
    const content = readMarkdown("test-template.md", import.meta.url);

    expect(content).toBeTruthy();
    expect(typeof content).toBe("string");
    expect(content.length).toBeGreaterThan(0);
  });

  it("should read file with template placeholders", () => {
    const content = readMarkdown("test-template.md", import.meta.url);

    expect(content).toContain("{{title}}");
    expect(content).toContain("{{date}}");
    expect(content).toContain("{{text}}");
  });

  it("should throw error when file doesn't exist", () => {
    expect(() => {
      readMarkdown("non-existent.md", import.meta.url);
    }).toThrow();
  });

  it("should read file with correct encoding", () => {
    const content = readMarkdown("test-template.md", import.meta.url);

    // Should not contain encoding artifacts
    expect(content).not.toContain("�");
  });

  it("should work with production quote-template.md", () => {
    // Verify the actual production file works
    const projectRoot = join(import.meta.dir, "../..");
    const quoteTemplate = readFileSync(
      join(projectRoot, "src/prompts/quote-template.md"),
      "utf-8",
    );

    expect(quoteTemplate).toBeTruthy();
    expect(quoteTemplate).toContain("{{title}}");
    expect(quoteTemplate).toContain("{{date}}");
    expect(quoteTemplate).toContain("{{text}}");
  });

  it("should work with production generate-quote.md", () => {
    // Verify the actual production file works
    const projectRoot = join(import.meta.dir, "../..");
    const generateQuote = readFileSync(
      join(projectRoot, "src/prompts/generate-quote.md"),
      "utf-8",
    );

    expect(generateQuote).toBeTruthy();
    expect(generateQuote).toContain("{{theme}}");
    expect(generateQuote).toContain("{{tone}}");
    expect(generateQuote).toContain("{{style}}");
    expect(generateQuote).toContain("{{length}}");
  });
});
