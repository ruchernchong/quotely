import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { MarkdownStorage } from "../../src/services/markdown-storage.ts";
import type { Quote } from "../../src/types/quote.ts";

describe("markdown-storage", () => {
  let tempQuotesDir: string;
  let storage: MarkdownStorage;

  beforeEach(async () => {
    tempQuotesDir = await mkdtemp(join(tmpdir(), "quotely-markdown-"));
    storage = new MarkdownStorage(tempQuotesDir);
  });

  afterEach(async () => {
    await rm(tempQuotesDir, { recursive: true, force: true });
  });

  const testCases: {
    quote: Quote;
    expectedPath: string[];
    expectedContent: string;
  }[] = [
    {
      quote: {
        title: "Embrace the Journey",
        text: "Every step forward is progress.",
        date: "2025-10-05",
        timestamp: "2025-10-05T12:00:00.000Z",
      },
      expectedPath: ["2025", "10", "05-embrace-the-journey.md"],
      expectedContent: `---
title: "Embrace the Journey"
date: "2025-10-05"
---

> Every step forward is progress.
`,
    },
    {
      quote: {
        title: "Quiet! Focus & Grow",
        text: "Cut the noise, nurture the signal.",
        date: "2024-11-02",
        timestamp: "2024-11-02T08:15:00.000Z",
      },
      expectedPath: ["2024", "11", "02-quiet-focus-and-grow.md"],
      expectedContent: `---
title: "Quiet! Focus & Grow"
date: "2024-11-02"
---

> Cut the noise, nurture the signal.
`,
    },
  ];

  it.each(testCases)(
    "should save markdown for '$quote.title'",
    async ({ quote, expectedPath, expectedContent }) => {
      const filePath = await storage.saveQuote(quote, quote.date);

      expect(filePath).toBe(join(tempQuotesDir, ...expectedPath));

      const file = Bun.file(filePath);
      expect(await file.exists()).toBe(true);
      expect(await file.text()).toBe(expectedContent);
    },
  );

  it("should delete markdown file", async () => {
    const quote: Quote = {
      title: "Test Quote",
      text: "This will be deleted",
      date: "2025-10-05",
      timestamp: "2025-10-05T12:00:00.000Z",
    };

    // First create the file
    const filePath = await storage.saveQuote(quote, quote.date);

    expect(await Bun.file(filePath).exists()).toBe(true);

    // Now delete it
    await storage.deleteQuote(quote);

    // Check with a fresh file reference
    expect(await Bun.file(filePath).exists()).toBe(false);
  });

  it("should not throw error when deleting non-existent markdown file", async () => {
    const quote: Quote = {
      title: "Non-existent Quote",
      text: "This doesn't exist",
      date: "2025-10-05",
      timestamp: "2025-10-05T12:00:00.000Z",
    };

    // Should not throw
    await expect(storage.deleteQuote(quote)).resolves.toBeUndefined();
  });
});
