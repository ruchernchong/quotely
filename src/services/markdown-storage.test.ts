import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { Quote } from "../types/quote";
import { saveQuoteToMarkdown } from "./markdown-storage.ts";

describe("markdown-storage", () => {
  let tempQuotesDir: string;

  beforeEach(async () => {
    tempQuotesDir = await mkdtemp(join(tmpdir(), "quotely-markdown-"));
  });

  afterEach(async () => {
    await rm(tempQuotesDir, { recursive: true, force: true });
  });

  it("should save markdown file with expected frontmatter", async () => {
    const quote: Quote = {
      title: "Embrace the Journey",
      text: "Every step forward is progress.",
      date: "2025-10-05",
      timestamp: "2025-10-05T12:00:00.000Z",
    };

    const filePath = await saveQuoteToMarkdown(quote, quote.date, {
      baseDir: tempQuotesDir,
    });

    expect(filePath).toBe(
      join(tempQuotesDir, "2025", "10", "05-embrace-the-journey.md"),
    );

    const file = Bun.file(filePath);
    expect(await file.exists()).toBe(true);
    expect(await file.text()).toBe(
      `---\ntitle: "Embrace the Journey"\ndate: "2025-10-05"\n---\n\n> Every step forward is progress.\n`,
    );
  });

  it("should slugify title when creating filename", async () => {
    const quote: Quote = {
      title: "Quiet! Focus & Grow",
      text: "Cut the noise, nurture the signal.",
      date: "2024-11-02",
      timestamp: "2024-11-02T08:15:00.000Z",
    };

    const filePath = await saveQuoteToMarkdown(quote, quote.date, {
      baseDir: tempQuotesDir,
    });

    expect(filePath).toBe(
      join(tempQuotesDir, "2024", "11", "02-quiet-focus-and-grow.md"),
    );

    const file = Bun.file(filePath);
    expect(await file.exists()).toBe(true);
    const content = await file.text();

    expect(content).toContain('title: "Quiet! Focus & Grow"');
    expect(content).toContain("> Cut the noise, nurture the signal.");
  });
});
